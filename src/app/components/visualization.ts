import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  untracked,
  InjectionToken,
  output,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { ExecutionStep, ListSnapshot, Trace, Selection } from '../core/execution.types';

import {
  layoutNodes,
  nextPath,
  detachedIndexFor,
  type PositionedNode,
} from '../core/visual-layout';

import { SceneMotion, MOTION_MS } from '../core/scene-motion';

// DOM testleri hareketi kapatabilir; gerçek uygulama sistemin hareket tercihini dikkate alır.
export const SCENE_MOTION_ENABLED = new InjectionToken<boolean>('sceneMotionEnabled', {
  providedIn: 'root', factory: () => typeof matchMedia !== 'function' || !matchMedia('(prefers-reduced-motion: reduce)').matches,
});

@Component({
  selector: 'app-visualization',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Değişkenler solda, aktif adım açıklaması sağda aynı satırda karşılaştırılır. -->
    <div class="execution-summary">
    <div class="variables-panel">
      <span class="mini-label">{{ standalone() ? 'FIELDS' : 'VARIABLES & REFERENCES' }}</span>
      <div class="variable-chips">
        @for (variable of variables(); track variable.name) {
          <div class="variable-chip" [class.changed]="variable.changed">
            <span>{{ variable.name }}</span
            ><code>{{ variable.value }}</code>
          </div>
        }
        @if (!variables().length) {
          <span class="muted small">İşlem başladığında yerel değişkenler burada görünür.</span>
        }
      </div>
    </div>
    <div class="explanation" aria-live="polite">
      <div class="eyebrow">
        {{ standalone() ? 'NODE ANATOMY' : 'EXECUTION STEP' }}<span>{{ stepNumber() }}</span>
      </div>
      <p>{{ explanation() }}</p>
    </div>
    </div>
    <div class="zoom-toolbar" aria-label="Zoom kontrolleri">
      <span class="mini-label">MEMORY VIEW</span>
      <div>
        <button
          aria-label="Zoom Out"
          title="Zoom Out"
          (click)="zoomOut()"
          [disabled]="zoom() <= 0.2"
        >
          −</button
        ><span>{{ zoomPercent() }}%</span
        ><button aria-label="Zoom In" title="Zoom In" (click)="zoomIn()" [disabled]="zoom() >= 2">
          +</button
        ><button class="fit-button" aria-label="Fit to View" title="Fit to View" (click)="fit()">
          Fit
        </button>
      </div>
    </div>
    <div #canvas class="canvas-scroll" tabindex="0" aria-label="Node ve pointer görselleştirmesi">
      <div
        class="scene-viewport motion-scene"
        [style.width.px]="width() * zoom()"
        [style.height.px]="canvasHeight() * zoom()"
      >
        <svg
          [attr.width]="width()"
          [attr.height]="canvasHeight()"
          [style.transform]="'scale(' + zoom() + ')'"
          [attr.viewBox]="'0 0 ' + width() + ' ' + canvasHeight()"
          role="img"
          [attr.aria-label]="
            standalone()
              ? 'Bağımsız Node: data ve next'
              : 'Singly Linkedlist, size ' + snapshot().size
          "
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a4d8f5" />
            </marker>
          </defs>
          @if (!nodes().length) {
            <text x="45" y="125" class="empty-title">head → null</text>
            <text x="45" y="155" class="empty-description">
              Liste boş. addFirst veya addLast ile başlayabilirsin.
            </text>
          }
          @for (node of nodes(); track node.id) {
            <path
              class="pointer-path"
              [attr.d]="path(node)"
              
              [attr.data-source]="node.id"
              [style.opacity]="node.opacity"
              [attr.data-target]="node.next || 'null'"
              marker-end="url(#arrow)"
              
              
            >
              <title>{{ node.id }}.next → {{ node.next || 'null' }}</title>
            </path>
            <g
              class="null-indicator"
              [style.transform]="'translate(' + (node.x + 180) + 'px,' + (node.y + 36) + 'px)'"
              [style.opacity]="node.next ? 0 : node.opacity"
            >
              <text class="null-label">null</text>
            </g>
            <g
              class="node-shape"
              
              
              [attr.data-node-id]="node.id"
              [style.transform]="'translate(' + node.x + 'px,' + node.y + 'px)'"
              [class.detached]="node.detached"
              [style.opacity]="node.opacity"
            >
              <text x="0" y="82" class="node-id">
                {{ node.id }}{{ node.detached ? ' · detached' : '' }}
              </text>
              <rect width="144" height="64" rx="12" class="node-box" />
              <path d="M 85 0 V 64" class="node-divider" />
              <text x="12" y="20" class="field-label">data</text>
              <text x="100" y="20" class="field-label">next</text>
              <foreignObject x="10" y="29" width="68" height="29"
                ><div xmlns="http://www.w3.org/1999/xhtml" class="node-value" [title]="node.data">
                  {{ node.data }}
                </div></foreignObject
              >
              <text x="101" y="46" class="next-value">{{ node.next || '∅' }}</text>
            </g>
          }
          @for (ref of positionedReferences(); track ref.name) {
            <g
              class="reference-label"
              
              
              [attr.data-reference]="ref.name"
              [attr.data-target]="ref.target"
              [style.opacity]="ref.opacity"
              [style.transform]="'translate(' + ref.x + 'px,' + ref.y + 'px)'"
            >
              <title>{{ ref.name }} → {{ ref.target }}</title>
            <rect width="58" height="18" rx="5" />
              <text x="29" y="13" text-anchor="middle">{{ ref.name }}</text>
              <path
                [attr.d]="ref.path"
                
                marker-end="url(#arrow)"
              />
            </g>
          }
        </svg>
      </div>
    </div>
    <div class="visual-legend">
      <span><i class="legend-dot indigo"></i>Node / data</span
      ><span><i class="legend-dot blue-bg"></i>next / reference</span
      ><span class="muted">{{
        standalone() ? 'Listeye bağlı değil' : 'size = ' + snapshot().size
      }}</span>
    </div>
    @if (step()?.result) {
      <div class="result-box" [class.failed]="step()?.error">
        <span class="mini-label">RETURN</span><code>{{ step()!.result }}</code>
      </div>
    }
  `,
})
export class Visualization {
  readonly snapshot = input.required<ListSnapshot<string>>();
  readonly step = input<ExecutionStep<string> | null>(null);
  readonly previousStep = input<ExecutionStep<string> | null>(null);
  readonly standalone = input(false);
  readonly stepNumber = input('');
  readonly trace = input<Trace<string> | null>(null);
  readonly operation = input<Selection>('node');
  readonly speed = input(1);
  readonly moving = output<boolean>();
  readonly motion = new SceneMotion();
  private readonly motionEnabled = inject(SCENE_MOTION_ENABLED);
  private lastOperation: Selection | undefined;
  readonly canvas = viewChild<ElementRef<HTMLElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);
  readonly viewport = signal({ width: 500, height: 320 });
  readonly autoFit = signal(true);
  readonly manualZoom = signal(1);

  constructor() {
    // Snapshot değiştiğinde hedef geometriyi hesapla; çizim her karede SceneMotion'dan gelir.
    effect(() => {
      const positions = this.targetNodes();
      const bindings = this.standalone() ? {} : { head: this.snapshot().head, ...this.step()?.references };
      const scopeChanged = this.lastOperation !== this.operation();
      this.lastOperation = this.operation();
      // Süre hesabı effect tarafından izlenir; animasyonun her karedeki iç sinyalleri izlenmez.
      const duration = this.motionEnabled && !scopeChanged ? MOTION_MS / this.speed() : 0;
      // Kare güncellemelerinin effect’i yeniden başlatıp animasyonu kesmesini önler.
      untracked(() => this.motion.moveTo(positions, bindings, duration));
    });
    // Ana ekran bu bilgiyle yeni adımı önceki hareket bitene kadar bekletir.
    effect(() => this.moving.emit(this.motion.busy()));
    // Component kaldırılırken bekleyen animasyon karesini iptal et.
    this.destroyRef.onDestroy(() => this.motion.stop());
    afterNextRender(() => {
      const element = this.canvas()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver((entries) => {
        const rect = entries[0].contentRect;
        this.viewport.set({ width: rect.width, height: rect.height });
      });
      observer.observe(element);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
  readonly explanation = computed(() =>
    this.standalone()
      ? 'Node, data ve next alanlarını taşır. next başka bir Node’a referanstır; null ise bağlantı yoktur. Bu Node herhangi bir listeye bağlı değil.'
      : (this.step()?.explanation ??
        'Bir fonksiyon seç, gerekli parametreleri gir ve Run ile işlemi hazırla. Liste fonksiyonlar arasında korunur.'),
  );
  readonly detachedIndex = computed(() => detachedIndexFor(this.step(), this.operation()));
  readonly targetNodes = computed(() => layoutNodes(this.snapshot(), this.standalone(), this.detachedIndex(), this.trace() ? {
    baseline: this.trace()!.baseline, operation: this.operation(), completed: this.trace()!.steps.at(-1) === this.step(),
  } : undefined));
  // SVG yalnız interpolasyonun gerçek ara pozlarını çizer; oklar da bunları kullanır.
  readonly nodes = this.motion.nodes;
  // Kamera boyutunu bütün trace için sabit tut: yeni Node oluşunca her adımda zoom sıçramaz.
  readonly sceneNodes = computed(() =>
    this.trace()?.steps.at(-1) === this.step()
      ? this.targetNodes()
      : (this.trace()?.steps.flatMap((step) =>
          layoutNodes(step.snapshot, false, detachedIndexFor(step, this.operation()), { baseline: this.trace()!.baseline, operation: this.operation(), completed: step === this.trace()!.steps.at(-1) }),
        ) ?? this.targetNodes()),
  );
  readonly canvasHeight = computed(() => (this.sceneNodes().some((n) => n.y > 200) ? 390 : 225));
  readonly width = computed(() => Math.max(350, ...this.sceneNodes().map((n) => n.x + 230)));
  readonly zoom = computed(() =>
    this.autoFit()
      ? Math.max(
          0.2,
          Math.min(
            1,
            (this.viewport().width - 12) / this.width(),
            (this.viewport().height - 12) / this.canvasHeight(),
          ),
        )
      : this.manualZoom(),
  );
  readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));
  zoomIn() {
    this.manualZoom.set(Math.min(2, this.zoom() + 0.15));
    this.autoFit.set(false);
  }
  zoomOut() {
    this.manualZoom.set(Math.max(0.2, this.zoom() - 0.15));
    this.autoFit.set(false);
  }
  fit() {
    this.autoFit.set(true);
  }
  readonly variables = computed(() => {
    if (this.standalone())
      return [
        { name: 'data', value: this.snapshot().nodes[0]?.data ?? '', changed: false },
        { name: 'next', value: 'null', changed: false },
      ];
    const step = this.step();
    if (!step) return [];
    const values = { ...step.variables, ...step.references, head: step.snapshot.head };
    const prev = this.previousStep();
    const previous = { ...prev?.variables, ...prev?.references, head: prev?.snapshot.head };
    return Object.entries(values).map(([name, value]) => ({
      name,
      value: String(value ?? 'null'),
      changed: prev ? value !== previous[name as keyof typeof previous] : false,
    }));
  });
  // Referans etiketleri Node döngüsünün dışında, isimleriyle track edilir.
  // current başka bir Node'a geçtiğinde aynı SVG öğesi taşınır; bu hareket animasyonlanabilir.
  readonly positionedReferences = computed(() => this.motion.references().flatMap(ref => {
    const node = this.nodes().find(n => n.id === ref.target);
    if (!node) return [];
    // İsimlerin sabit şeritleri, current/previous yer değişiminde etiketlerin kesişmesini önler.
    const index = ref.name === 'previous' ? 0 : ref.name === 'current' ? 1 : ref.name === 'head' ? 2 : 3;
    const lift = 95 - index * 20;
    const anchor = 122 - index * 14;
    return [{ ...ref, opacity: ref.opacity * node.opacity, x: node.x, y: node.y - lift,
      path: `M 58 9 C ${anchor} 9, ${anchor} ${lift - 25}, ${anchor} ${lift - 5}` }];
  }));
  path(node: PositionedNode): string {
    return nextPath(node, this.nodes());
  }
  referenceCssPath(path: string) {
    return `path("${path}")`;
  }
  cssPath(node: PositionedNode) {
    return `path("${this.path(node)}")`;
  }
}
