import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ExecutionStep } from '../core/execution.types';

/** Sabit ayrı slotlar, constructor adımlarında iki yöndeki öğelerin çakışmasını önler. */
@Component({
  selector: 'app-dnode-visualization',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Parametreler solda; gerçek atama açıklaması sağda mevcut kart düzenini kullanır. -->
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
              'data, prev ve next parametrelerini seçip Run ile constructor adımlarını izle.'
          }}
        </p>
      </div>
    </div>
    <!-- SVG viewBox bütün kutu, etiket ve okları kapsar; dar panelde birlikte ölçeklenir. -->
    <div class="dnode-canvas" tabindex="0" aria-label="DNode ve iki yönlü referanslar">
      <svg viewBox="0 0 680 300" role="img" aria-label="Bağımsız DNode: prev, data, next">
        <defs>
          <marker
            id="dnode-arrow"
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
        @for (node of neighbors(); track node.id) {
          <!-- Komşular solda/sağda, merkez DNode’dan ayrı slotlarda durur. -->
          <g [attr.transform]="'translate(' + neighborX(node.id) + ',160)'" class="node-shape">
            <rect width="144" height="64" rx="8" class="node-box" />
            <!-- Komşu DNode’ların iki null alanı da görünür; ters bağlantı kurulmuş sanılmaz. -->
            <rect width="44" height="64" rx="8" class="node-next-cell" />
            <rect x="100" width="44" height="64" rx="8" class="node-next-cell" />
            <text x="7" y="20" class="field-label next-field">prev</text>
            <text x="51" y="20" class="field-label">data</text>
            <text x="107" y="20" class="field-label next-field">next</text>
            <text x="17" y="46" class="next-value">∅</text>
            <text x="117" y="46" class="next-value">∅</text>
            <foreignObject x="49" y="29" width="46" height="29"
              ><div xmlns="http://www.w3.org/1999/xhtml" class="node-value" [title]="node.data">
                {{ node.data }}
              </div></foreignObject
            >
            <text x="0" y="88" class="node-id">{{ node.id }} · independent</text>
          </g>
        }
        @if (center(); as node) {
          <!-- Geri ve ileri oklar ayrı taraflardan çıkar; Node kutusunun içinden geçmez. -->
          <path
            class="pointer-path"
            [attr.d]="node.prev ? 'M 238 184 H 208' : 'M 238 184 H 230 Q 222 184 222 192 V 260'"
            marker-end="url(#dnode-arrow)"
          />
          <path
            class="pointer-path"
            [attr.d]="node.next ? 'M 442 202 H 472' : 'M 442 202 H 450 Q 458 202 458 210 V 260'"
            marker-end="url(#dnode-arrow)"
          />
          @if (!node.prev) {
            <text x="202" y="282" class="null-label">null</text>
          }
          @if (!node.next) {
            <text x="446" y="282" class="null-label">null</text>
          }
          <!-- Referans etiketi üsttedir; yatay prev/next oklarından uzak kalır. -->
          <g class="reference-label" transform="translate(304,104)">
            <rect width="72" height="24" rx="6" />
            <text x="36" y="16" text-anchor="middle">node</text>
            <path d="M 36 24 V 50" marker-end="url(#dnode-arrow)" />
          </g>
          <g class="node-shape" data-dnode="center" transform="translate(238,160)">
            <clipPath id="dnode-clip"><rect width="204" height="64" rx="8" /></clipPath>
            <rect width="204" height="64" rx="8" class="node-box" />
            <rect width="60" height="64" class="node-next-cell" clip-path="url(#dnode-clip)" />
            <rect
              x="144"
              width="60"
              height="64"
              class="node-next-cell"
              clip-path="url(#dnode-clip)"
            />
            <path d="M 60 0 V 64 M 144 0 V 64" class="node-divider" />
            <text x="12" y="20" class="field-label next-field">prev</text>
            <text x="72" y="20" class="field-label">data</text>
            <text x="155" y="20" class="field-label next-field">next</text>
            <text x="12" y="46" class="next-value">{{ node.prev ?? '∅' }}</text>
            <text x="155" y="46" class="next-value">{{ node.next ?? '∅' }}</text>
            <foreignObject x="70" y="29" width="66" height="29"
              ><div xmlns="http://www.w3.org/1999/xhtml" class="node-value" [title]="node.data">
                {{ node.data || '—' }}
              </div></foreignObject
            >
            <text x="0" y="88" class="node-id">{{ node.id }}</text>
          </g>
        } @else {
          <text x="238" y="80" class="empty-description">DNode henüz oluşturulmadı.</text>
        }
      </svg>
    </div>
    <div class="visual-legend">
      <span>prev ← DNode → next</span><span class="muted">Listeye bağlı değil</span>
    </div>
  `,
})
export class DNodeVisualization {
  // Constructor trace’i ortak oynatıcıdan gelir; bu component algoritmayı değiştirmez.
  readonly step = input<ExecutionStep<string> | null>(null);
  readonly stepNumber = input('');
  // node referansı merkez nesneyi komşulardan ayırır.
  readonly center = computed(() =>
    this.step()?.snapshot.nodes.find((n) => n.id === this.step()?.references['node']),
  );
  // Var olan komşular ayrı uç slotlara yerleşir.
  readonly neighbors = computed(
    () => this.step()?.snapshot.nodes.filter((n) => n.id !== this.step()?.references['node']) ?? [],
  );
  // Gerçek constructor parametreleri karta aktarılır.
  readonly variables = computed(() => Object.entries(this.step()?.variables ?? {}));
  neighborX(id: string) {
    // prev solda, next sağdadır; null etiketi komşu slotunda görünmez.
    return id === this.step()?.variables['prev'] ? 64 : 472;
  }
}
