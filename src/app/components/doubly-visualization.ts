import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { ExecutionStep, ListSnapshot, Trace } from '../core/execution.types';
import { SceneMotion, MOTION_MS } from '../core/scene-motion';
import {
  doublyPositions,
  doublyEdgePoints,
  roundedDoublyPath,
  doublyReferences,
} from '../core/doubly-layout';
import { SCENE_MOTION_ENABLED } from './visualization';
import { UiIcon } from './ui-icon';

/** Model adımları ve tek RAF motoru iki yönlü oklarla aynı zaman çizgisini paylaşır. */
@Component({
  selector: 'app-doubly-visualization',
  imports: [UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="execution-summary">
      <div class="variables-panel">
        <span class="mini-label">VARIABLES & REFERENCES</span>
        <div class="variable-chips">
          @for (variable of variables(); track variable[0]) {
            <div class="variable-chip">
              <span>{{ variable[0] }}</span
              ><code>{{ variable[1] ?? 'null' }}</code>
            </div>
          }
        </div>
      </div>
      <div class="explanation" aria-live="polite">
        <div class="eyebrow">
          EXECUTION STEP<span>{{ stepNumber() }}</span>
        </div>
        <p>
          {{
            step()?.explanation ??
              'Doubly Linkedlist boş. addFirst ile başa bir DNode ekleyebilirsin.'
          }}
        </p>
      </div>
    </div>
    <div class="zoom-toolbar">
      <span class="mini-label">MEMORY VIEW</span>
      <div>
        <button aria-label="Zoom Out" title="Zoom Out" (click)="changeZoom(-0.15)">
          <app-icon name="minus" /></button
        ><span>{{ zoomPercent() }}%</span>
        <button aria-label="Zoom In" title="Zoom In" (click)="changeZoom(0.15)">
          <app-icon name="plus" />
        </button>
        <button aria-label="Fit to View" (click)="autoFit.set(true)">Fit</button>
      </div>
    </div>
    <!-- Fit ölçü değişiminde eski CSS ölçeğini beklemez; tüm oklar hemen sığar. -->
    <div
      #canvas
      class="canvas-scroll"
      [class.auto-fit]="autoFit()"
      tabindex="0"
      aria-label="Doubly Linkedlist görselleştirmesi"
    >
      <div
        class="scene-viewport motion-scene"
        [style.width.px]="width() * zoom()"
        [style.height.px]="height() * zoom()"
      >
        <svg
          [attr.width]="width()"
          [attr.height]="height()"
          [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
          [style.transform]="'scale(' + zoom() + ')'"
          role="img"
          aria-label="Doubly Linkedlist: prev, data, next"
        >
          <defs>
            <marker
              id="doubly-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" class="arrow-head" />
            </marker>
          </defs>
          @if (!motion.nodes().length) {
            <text x="44" y="122" class="empty-title">head → null</text>
            <text x="44" y="154" class="empty-title">tail → null</text>
          }
          @for (node of motion.nodes(); track node.id) {
            @for (direction of directions; track direction) {
              <!-- İleri/geri oklar farklı yükseklik ve koridorlar kullanır. -->
              <path
                class="pointer-path"
                [attr.data-direction]="direction"
                [attr.data-source]="node.id"
                [attr.data-target]="node[direction] ?? 'null'"
                [attr.d]="path(node, direction)"
                [style.opacity]="edgeOpacity(node, direction)"
                marker-end="url(#doubly-arrow)"
              />
              @if (!node[direction]) {
                <text
                  [attr.x]="node.x + (direction === 'prev' ? -70 : 180)"
                  [attr.y]="node.y + (direction === 'prev' ? 52 : 28)"
                  class="null-label"
                  [style.opacity]="node.opacity"
                >
                  null
                </text>
              }
            }
            <g
              class="node-shape"
              [attr.data-node-id]="node.id"
              [style.transform]="'translate(' + node.x + 'px,' + node.y + 'px)'"
              [style.opacity]="node.opacity"
            >
              <clipPath [attr.id]="'double-clip-' + node.id">
                <rect width="144" height="64" rx="8" />
              </clipPath>
              <rect width="144" height="64" rx="8" class="node-box" />
              <rect
                width="42"
                height="64"
                class="node-next-cell"
                [attr.clip-path]="'url(#double-clip-' + node.id + ')'"
              />
              <rect
                x="102"
                width="42"
                height="64"
                class="node-next-cell"
                [attr.clip-path]="'url(#double-clip-' + node.id + ')'"
              />
              <path d="M 42 0 V 64 M 102 0 V 64" class="node-divider" />
              <text x="5" y="20" class="field-label next-field">prev</text>
              <text x="48" y="20" class="field-label">data</text>
              <text x="108" y="20" class="field-label next-field">next</text>
              <text x="5" y="46" class="next-value">{{ node.prev ?? '∅' }}</text>
              <text x="107" y="46" class="next-value">{{ node.next ?? '∅' }}</text>
              <foreignObject x="46" y="29" width="52" height="29"
                ><div xmlns="http://www.w3.org/1999/xhtml" class="node-value" [title]="node.data">
                  {{ node.data }}
                </div></foreignObject
              >
              <text x="0" y="84" class="node-id">{{ node.id }}</text>
            </g>
          }
          @for (ref of references(); track ref.name) {
            <g
              class="reference-label"
              [attr.data-reference]="ref.name"
              [style.transform]="'translate(' + ref.x + 'px,' + ref.y + 'px)'"
              [style.opacity]="ref.opacity"
            >
              <rect width="64" height="24" rx="6" />
              <text x="32" y="16" text-anchor="middle">{{ ref.name }}</text>
              <path [attr.d]="ref.path" marker-end="url(#doubly-arrow)" />
            </g>
          }
        </svg>
      </div>
    </div>
    <div class="visual-legend">
      <span>prev ← DNode → next</span><span>size = {{ snapshot().size }}</span>
    </div>
    @if (step()?.result) {
      <div class="result-box">
        <span class="mini-label">RETURN</span><code>{{ step()!.result }}</code>
      </div>
    }
  `,
})
export class DoublyVisualization {
  readonly snapshot = input.required<ListSnapshot<string>>();
  readonly step = input<ExecutionStep<string> | null>(null);
  readonly trace = input<Trace<string> | null>(null);
  readonly speed = input(1);
  readonly stepNumber = input('');
  readonly moving = output<boolean>();
  readonly directions = ['prev', 'next'] as const;
  readonly motion = new SceneMotion();
  private readonly enabled = inject(SCENE_MOTION_ENABLED);
  private readonly destroy = inject(DestroyRef);
  readonly canvas = viewChild<ElementRef<HTMLElement>>('canvas');
  readonly viewport = signal({ width: 500, height: 300 });
  readonly autoFit = signal(true);
  readonly manualZoom = signal(1);
  // Yeni nesne/başlangıç/final için hedef slotlar gerçek snapshot’tan hesaplanır.
  readonly target = computed(() =>
    doublyPositions(this.snapshot(), this.trace(), this.trace()?.steps.at(-1) === this.step()),
  );
  // Kamera tüm işlem için sabit kalır; ara hareketler kırpılmaz.
  readonly width = computed(() =>
    Math.max(
      480,
      100 +
        Math.max(
          this.snapshot().nodes.length,
          this.trace()?.steps.at(-1)?.snapshot.nodes.length ?? 0,
        ) *
          210 +
        80,
    ),
  );
  readonly height = computed(() => {
    // Son kare yerleşmeden kamera küçülmez; yerleşince hazırlık alanı boşluğu kaldırılır.
    const settled = this.trace()?.steps.at(-1) === this.step() && !this.motion.busy();
    return !settled &&
      this.trace()?.operation === 'doublyAddFirst' &&
      (this.trace()?.baseline.size ?? 0) > 0
      ? 440
      : 240;
  });
  readonly zoom = computed(() =>
    this.autoFit()
      ? Math.min(
          1,
          Math.max(1, this.viewport().width - 32) / this.width(),
          Math.max(1, this.viewport().height - 32) / this.height(),
        )
      : this.manualZoom(),
  );
  readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));
  readonly variables = computed(() =>
    Object.entries({
      ...this.step()?.variables,
      size: this.snapshot().size,
      head: this.snapshot().head,
      tail: this.snapshot().tail ?? null,
    }),
  );
  // Sadece isimli değişken referansları etiket olarak görünür; alan bağlantıları ayrı çizilir.
  readonly references = computed(() =>
    doublyReferences(this.motion.nodes(), this.motion.references()),
  );
  constructor() {
    effect(() => {
      const positions = this.target();
      const bindings: Record<string, string | null> = {
        head: this.snapshot().head,
        tail: this.snapshot().tail ?? null,
        ...this.step()?.references,
      };
      // Alan referansları da ortak fade saatini kullanır.
      for (const node of positions) {
        bindings[node.id + '.prev'] = node.prev ?? null;
        bindings[node.id + '.next'] = node.next;
      }
      const duration = this.enabled ? MOTION_MS / this.speed() : 0;
      untracked(() => this.motion.moveTo(positions, bindings, duration));
    });
    effect(() => this.moving.emit(this.motion.busy()));
    this.destroy.onDestroy(() => this.motion.stop());
    afterRenderEffect((cleanup) => {
      const element = this.canvas()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') return;
      // Sıfır boyutlu geçici/HMR ölçümü Fit’i bozmamalıdır.
      const measure = () => {
        if (element.clientWidth && element.clientHeight)
          this.viewport.set({ width: element.clientWidth, height: element.clientHeight });
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      cleanup(() => observer.disconnect());
    });
  }
  changeZoom(delta: number) {
    // Manuel zoom sınırlandırılır; Fit tüm nesneleri tekrar kapsar.
    this.manualZoom.set(Math.max(0.2, Math.min(2, this.zoom() + delta)));
    this.autoFit.set(false);
  }
  path(node: import('../core/visual-layout').PositionedNode, direction: 'prev' | 'next') {
    return roundedDoublyPath(doublyEdgePoints(node, this.motion.nodes(), direction));
  }
  edgeOpacity(node: import('../core/scene-motion').MotionNode, direction: 'prev' | 'next') {
    // Yeni bağlantı önceki adımın ışınlanması yerine ortak saatle belirir.
    if (!node[direction]) return node.opacity;
    return (
      node.opacity *
      (this.motion.references().find((ref) => ref.name === node.id + '.' + direction)?.opacity ?? 0)
    );
  }
}
