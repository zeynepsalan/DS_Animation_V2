// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
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
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { ExecutionStep, ListSnapshot, Trace } from '../core/execution.types';
// Node ve okların tek RAF saatinden güncellenmesini sağlayan hareket motorunu getirir.
import { SceneMotion, MOTION_MS } from '../core/scene-motion';
// Doubly’ye özgü güvenli slot, ok portu ve referans etiketi geometrisini getirir.
import {
  doublyPositions,
  doublyEdgePoints,
  roundedDoublyPath,
  doublyReferences,
} from '../core/doubly-layout';
// Singly sahnesi Node/next çizimini, referansları ve Fit ölçüsünü yönetir.
import { SCENE_MOTION_ENABLED } from './visualization';
// Ortak SVG ikon bileşenini getirir; kontroller için aynı çizim sistemi kullanılır.
import { UiIcon } from './ui-icon';

/** Model adımları ve tek RAF motoru iki yönlü oklarla aynı zaman çizgisini paylaşır. */
// Null bağlantı da animasyonda bir hedef durumudur; bu sanal kimlik gerçek Node değildir.
const NULL_EDGE = '__null__';

@Component({
  // Bu isim, bileşenin HTML içinde hangi etiketle kullanılacağını belirler.
  selector: 'app-doubly-visualization',
  // Bu bağımsız bileşenin şablonda kullanacağı Angular araçlarını ve alt bileşenleri tanıtır.
  imports: [UiIcon],
  // OnPush ile Angular giriş veya signal değişikliklerini izler; gereksiz görünüm kontrollerini azaltır.
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Bu HTML şablonunda süslü parantezler metni, köşeli parantezler değerleri, normal parantezler olayları bağlar.
  template: `
    <div class="execution-summary">
      <div class="variables-panel">
        <span class="mini-label">VARIABLES & REFERENCES</span>
        <div class="variable-chips">
          <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
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
              (snapshot().size
                ? 'Bir fonksiyon seçip Run ile işlemi hazırla; mevcut liste korunur.'
                : 'Doubly Linkedlist boş. addFirst veya addLast ile başlayabilirsin.')
          }}
        </p>
      </div>
    </div>
    <div class="zoom-toolbar">
      <span class="mini-label">MEMORY VIEW</span>
      <div>
        <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
        <button aria-label="Zoom Out" title="Zoom Out" (click)="changeZoom(-0.15)">
          <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
          <app-icon name="minus" /></button
        ><span>{{ zoomPercent() }}%</span>
        <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
        <button aria-label="Zoom In" title="Zoom In" (click)="changeZoom(0.15)">
          <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
          <app-icon name="plus" />
        </button>
        <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
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
        <!-- SVG koordinatları gerçek Node/ok geometrisini çizer; viewBox bütün sahnenin aynı ölçekle görünmesini sağlar. -->
        <svg
          [attr.width]="width()"
          [attr.height]="height()"
          [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
          [style.transform]="'scale(' + zoom() + ')'"
          role="img"
          aria-label="Doubly Linkedlist: prev, data, next"
        >
          <defs>
            <!-- Her yönün ayrı marker’ı, ok ucu ile çizginin aynı renkte kalmasını sağlar. -->
            @for (direction of directions; track direction) {
              <marker
                [attr.id]="'doubly-arrow-' + direction"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                markerUnits="userSpaceOnUse"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" class="arrow-head" />
              </marker>
            }
          </defs>
          <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
          @if (!motion.nodes().length) {
            <text x="44" y="122" class="empty-title">head → null</text>
            <text x="44" y="154" class="empty-title">tail → null</text>
          }
          <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
          @for (node of motion.nodes(); track node.id) {
            <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
            @for (edge of arrowsFor(node.id); track edge.direction) {
              <!-- İleri/geri oklar farklı yükseklik ve koridorlar kullanır. -->
              <path
                class="pointer-path"
                [class.prev-pointer]="edge.direction === 'prev'"
                [class.next-pointer]="edge.direction === 'next'"
                [attr.data-direction]="edge.direction"
                [attr.data-source]="node.id"
                [attr.data-target]="edge.target ?? 'null'"
                [attr.d]="path(edge.source, edge.direction)"
                [style.opacity]="edge.opacity"
                [attr.marker-end]="'url(#doubly-arrow-' + edge.direction + ')'"
              />
              <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
              @if (!edge.target) {
                <text
                  [attr.x]="node.x + (edge.direction === 'prev' ? -70 : 180)"
                  [attr.y]="node.y + (edge.direction === 'prev' ? 52 : 28)"
                  class="null-label"
                  [style.opacity]="edge.opacity"
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
              <!-- Hücre dolgularını radiuslu Node sınırında kırpar; renkler kutu dışına taşmaz. -->
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
              <!-- SVG içine HTML veri kutusu yerleştirir; uzun data metni kutunun sınırları içinde kalır. -->
              <foreignObject x="46" y="29" width="52" height="29"
                ><div xmlns="http://www.w3.org/1999/xhtml" class="node-value" [title]="node.data">
                  {{ node.data }}
                </div></foreignObject
              >
              <text x="0" y="84" class="node-id">{{ node.id }}</text>
            </g>
          }
          <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
          @for (ref of references(); track ref.name) {
            <g
              class="reference-label"
              [class.prev-pointer]="ref.name === 'tail'"
              [class.next-pointer]="ref.name !== 'tail'"
              [attr.data-reference]="ref.name"
              [style.transform]="'translate(' + ref.x + 'px,' + ref.y + 'px)'"
              [style.opacity]="ref.opacity"
            >
              <rect width="72" height="24" rx="6" />
              <text x="36" y="16" text-anchor="middle">{{ ref.name }}</text>
              <path
                [attr.d]="ref.path"
                [attr.marker-end]="
                  ref.name === 'tail' ? 'url(#doubly-arrow-prev)' : 'url(#doubly-arrow-next)'
                "
              />
            </g>
          }
        </svg>
      </div>
    </div>
    <div class="visual-legend">
      <!-- Renklerin anlamı yalnız hover’a bağlı kalmadan legend’de açıklanır. -->
      <span class="prev-legend">← prev / tail</span><span class="next-legend">next / head →</span
      ><span>size = {{ snapshot().size }}</span>
    </div>
    <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
    @if (step()?.result) {
      <div class="result-box" [class.failed]="step()?.error">
        <span class="mini-label">RETURN</span><code>{{ step()!.result }}</code>
      </div>
    }
  `,
})
export class DoublyVisualization {
  // Üst bileşen bu girdiyi vermek zorundadır; input signal’ı okunurken fonksiyon gibi çağrılır.
  readonly snapshot = input.required<ListSnapshot<string>>();
  // Cursor konumundaki kod satırı, açıklama ve liste fotoğrafı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly step = input<ExecutionStep<string> | null>(null);
  // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly trace = input<Trace<string> | null>(null);
  // Üst bileşenden gelen değeri input signal olarak tutar; değişince şablon güncellenir.
  readonly speed = input(1);
  // Üst bileşenden gelen değeri input signal olarak tutar; değişince şablon güncellenir.
  readonly stepNumber = input('');
  // Alt bileşenin üst bileşene göndereceği olayı tanımlar; emit çağrısı olayı bildirir.
  readonly moving = output<boolean>();
  // directions hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly directions = ['prev', 'next'] as const;
  // Node ve okları tek saatle taşıyan animasyon denetleyicisi bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly motion = new SceneMotion();
  // inject, Angular’ın sağladığı ortak bağımlılığı getirir; bileşen servisi kendisi tekrar oluşturmaz.
  private readonly enabled = inject(SCENE_MOTION_ENABLED);
  // inject, Angular’ın sağladığı ortak bağımlılığı getirir; bileşen servisi kendisi tekrar oluşturmaz.
  private readonly destroy = inject(DestroyRef);
  // HTML’de # ile adlandırılan elemanı render sonrasında bulur; gerçek DOM ölçüsü buradan okunur.
  readonly canvas = viewChild<ElementRef<HTMLElement>>('canvas');
  // Fit hesabında kullanılan gerçek çizim alanı ölçüsü değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly viewport = signal({ width: 500, height: 300 });
  // Bütün sahnenin çizim alanına sığdırılmasını seçen durum değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly autoFit = signal(true);
  // Kullanıcının manuel büyütme oranı değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly manualZoom = signal(1);
  // Yeni nesne/başlangıç/final için hedef slotlar gerçek snapshot’tan hesaplanır.
  readonly target = computed(() =>
    doublyPositions(
      this.snapshot(),
      this.trace(),
      this.trace()?.steps.at(-1) === this.step(),
      this.step(),
    ),
  );
  // Kameranın tüm trace sınırı bir kez hesaplanır; büyük diziler Math.max’e yayılmaz.
  readonly envelope = computed(() => {
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = this.trace();
    // Kamera veya panel için hesaplanan yatay ölçü bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let width = 480;
    // Kamera veya panel için hesaplanan dikey ölçü bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let height = 240;
    // records hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const records = trace?.steps ?? [];
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const record of records) {
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const node of doublyPositions(
        record.snapshot,
        trace,
        record === records.at(-1),
        record,
      )) {
        // Bu atamayla width güncellenir; sonraki satır yeni değeri kullanır.
        width = Math.max(width, node.x + 234);
        // Bu atamayla height güncellenir; sonraki satır yeni değeri kullanır.
        height = Math.max(height, node.y + 112);
      }
    }
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return { width, height };
  });
  // settled hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly settled = computed(
    () => this.trace()?.steps.at(-1) === this.step() && !this.motion.busy(),
  );
  // Son kareye kadar tüm yollar kapsanır; sonra dinlenme sahnesi güvenle küçülür.
  readonly camera = computed(() => {
    // { width, height } hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let { width, height } = this.settled() ? { width: 480, height: 240 } : this.envelope();
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const node of [...this.target(), ...this.motion.nodes()]) {
      // Bu atamayla width güncellenir; sonraki satır yeni değeri kullanır.
      width = Math.max(width, node.x + 234);
      // Bu atamayla height güncellenir; sonraki satır yeni değeri kullanır.
      height = Math.max(height, node.y + 112);
    }
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return { width, height };
  });
  // Kamera veya panel için hesaplanan yatay ölçü diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly width = computed(() => this.camera().width);
  // Kamera veya panel için hesaplanan dikey ölçü diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly height = computed(() => this.camera().height);
  // Fit veya manuel ayardan türetilen sahne ölçeği diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly zoom = computed(() =>
    this.autoFit()
      ? Math.min(
          1,
          Math.max(1, this.viewport().width - 32) / this.width(),
          Math.max(1, this.viewport().height - 32) / this.height(),
        )
      : this.manualZoom(),
  );
  // zoomPercent hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));
  // Öğretici kartta gösterilen yerel değişkenler diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly variables = computed(() =>
    Object.entries({
      ...this.step()?.variables,
      // Dolaşma referansları da değişken kartında gerçek kimlikleriyle görünür.
      ...this.step()?.references,
      size: this.snapshot().size,
      head: this.snapshot().head,
      tail: this.snapshot().tail ?? null,
    }),
  );
  // Sadece isimli değişken referansları etiket olarak görünür; alan bağlantıları ayrı çizilir.
  readonly references = computed(() =>
    doublyReferences(this.motion.nodes(), this.motion.references()).map((ref) => ({
      ...ref,
      opacity:
        ref.opacity * (this.motion.nodes().find((node) => node.id === ref.target)?.opacity ?? 0),
    })),
  );
  // Bu sınıf örneği oluşturulunca bir kez çalışır; başlangıç bağımlılıkları veya gözlemcileri burada hazırlanır.
  // Bağlantı hedefi değişirken gerçek modelden bağımsız geçiş fazındaki uçları kullanırız.
  // Her ok NodeKimliği.prev/next anahtarıyla bu karenin gerçek hedefini ve fade oranını bulur.
  readonly linkRefs = computed(
    () =>
      new Map(
        this.motion
          .references()
          .filter((ref) => ref.name.includes('.'))
          .map((ref) => [ref.name, ref]),
      ),
  );
  // Model alanı yeni hedefi gösterse de sönmekte olan eski ok kendi hedefini bir süre korur.
  readonly edgeNodes = computed(() =>
    this.motion.nodes().map((node) => {
      const prev = this.linkRefs().get(node.id + '.prev')?.target;
      const next = this.linkRefs().get(node.id + '.next')?.target;
      return {
        ...node,
        prev: !prev || prev === NULL_EDGE ? null : prev,
        next: !next || next === NULL_EDGE ? null : next,
      };
    }),
  );
  // Null uçları da dahil iki yön için kararlı DOM anahtarı ve birleşik görünürlük üretir.
  readonly arrows = computed(
    () =>
      new Map(
        this.edgeNodes().map((node) => [
          node.id,
          this.directions.map((direction) => {
            const ref = this.linkRefs().get(node.id + '.' + direction);
            return {
              direction,
              source: node,
              target: node[direction],
              opacity: node.opacity * (ref?.opacity ?? 0),
            };
          }),
        ]),
      ),
  );
  // Şablon bu nesnenin iki okunu aynı direction anahtarıyla tekrar kullanır.
  arrowsFor(id: string) {
    return this.arrows().get(id) ?? [];
  }
  constructor() {
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    effect(() => {
      // Her nesnenin çizimdeki x/y konumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const positions = this.target();
      // Bir önceki referans hedefleri; değişen oklar bunlarla karşılaştırılır bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const bindings: Record<string, string | null> = {
        head: this.snapshot().head,
        tail: this.snapshot().tail ?? null,
        ...this.step()?.references,
      };
      // Alan referansları da ortak fade saatini kullanır.
      for (const node of positions) {
        // Bu atamayla bindings[node.id + '.prev'] güncellenir; sonraki satır yeni değeri kullanır.
        bindings[node.id + '.prev'] = node.prev ?? NULL_EDGE;
        // Bu atamayla bindings[node.id + '.next'] güncellenir; sonraki satır yeni değeri kullanır.
        bindings[node.id + '.next'] = node.next ?? NULL_EDGE;
      }
      // Kullanıcı hızına göre hareket süresini hesaplar; reduced motion tercihi süreyi sıfırlayabilir.
      const duration = this.enabled ? MOTION_MS / this.speed() : 0;
      // İç animasyon signal’larının dış effect’e yanlış bağımlılık eklemesini engeller; hareket her karede yeniden başlamaz.
      // Yalnız etiketin Node’a göre portu izlenir; Node hareketi bu hash’i değiştirmez.
      const hints = Object.fromEntries(
        doublyReferences(
          positions,
          Object.entries(bindings)
            .filter(([name, target]) => !name.includes('.') && !!target)
            .map(([name, target]) => ({ name, target: target!, opacity: 1 })),
        ).map((ref) => {
          const node = positions.find((node) => node.id === ref.target)!;
          return [ref.name, `${ref.x - node.x}:${ref.y - node.y}`];
        }),
      );
      // Aynı hedefte kalan bağlantının giriş portu değişirse onun çizgisi de yumuşak sönüp belirir.
      for (const node of positions)
        for (const direction of this.directions) {
          const target = positions.find((target) => target.id === node[direction]);
          if (!target) {
            hints[node.id + '.' + direction] = 'null';
            continue;
          }
          const end = doublyEdgePoints(node, positions, direction).at(-1)!;
          hints[node.id + '.' + direction] = `${end.x - target.x}:${end.y - target.y}`;
        }
      untracked(() => this.motion.moveTo(positions, bindings, duration, hints));
    });
    // Effect içindeki signal okumaları izlenir; değer değişince görünüm dışındaki bu yan işlem yeniden yürür.
    effect(() => this.moving.emit(this.motion.busy()));
    // Bileşen kaldırılınca animasyon veya dinleyici temizliğini Angular yaşam döngüsüne bağlar.
    this.destroy.onDestroy(() => this.motion.stop());
    // Şablon gerçek DOM’a yazıldıktan sonra ölçüm veya aktif satır konumu güncellenir.
    afterRenderEffect((cleanup) => {
      // Ölçülecek veya kullanılacak gerçek HTML elemanını bulur.
      const element = this.canvas()?.nativeElement;
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!element || typeof ResizeObserver === 'undefined') return;
      // Sıfır boyutlu geçici/HMR ölçümü Fit’i bozmamalıdır.
      const measure = () => {
        // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
        if (element.clientWidth && element.clientHeight)
          // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
          this.viewport.set({ width: element.clientWidth, height: element.clientHeight });
      };
      // measure çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      measure();
      // Boyut veya algoritma adım değişimini izleyen gözlemciyi oluşturur.
      const observer = new ResizeObserver(measure);
      // Gerçek elemanın boyut değişimini izler; pencere ve panel resize aynı Fit hesabını günceller.
      observer.observe(element);
      // cleanup çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      cleanup(() => observer.disconnect());
    });
  }
  // Manuel zoom oranını güvenli aralıkta değiştirir.
  changeZoom(delta: number) {
    // Manuel zoom sınırlandırılır; Fit tüm nesneleri tekrar kapsar.
    this.manualZoom.set(Math.max(0.2, Math.min(2, this.zoom() + delta)));
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.autoFit.set(false);
  }
  // Güncel nesne pozlarına göre okun SVG yolunu hesaplar.
  path(node: import('../core/visual-layout').PositionedNode, direction: 'prev' | 'next') {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return roundedDoublyPath(doublyEdgePoints(node, this.edgeNodes(), direction));
  }
  // Yeni bağlantının görünürlüğünü Node ve referans hareket saatleriyle birleştirir.
}
