// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
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
// Ortak SVG ikon bileşenini getirir; kontroller için aynı çizim sistemi kullanılır.
import { UiIcon } from './ui-icon';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { ExecutionStep, ListSnapshot, Trace, Selection } from '../core/execution.types';

// Ortak veya Singly nesne koordinatı ve referans yerleşimi yardımcılarını getirir.
import {
  layoutNodes,
  layoutReferences,
  sceneBounds,
  nextPath,
  detachedIndexFor,
  type PositionedNode,
} from '../core/visual-layout';

// Node ve okların tek RAF saatinden güncellenmesini sağlayan hareket motorunu getirir.
import { SceneMotion, MOTION_MS } from '../core/scene-motion';
// Circular aynı Node/RAF bileşenini kendi dış halka geometrisiyle kullanır.
import { circularPositions, circularPath, circularBounds } from '../core/circular-layout';

// DOM testleri hareketi kapatabilir; gerçek uygulama sistemin hareket tercihini dikkate alır.
export const SCENE_MOTION_ENABLED = new InjectionToken<boolean>('sceneMotionEnabled', {
  // Root değeri bu servisi uygulama genelinde tek örnek olarak paylaşır.
  providedIn: 'root',
  // Bağımlılık istendiğinde üretilecek başlangıç değerini hesaplar.
  factory: () =>
    typeof matchMedia !== 'function' || !matchMedia('(prefers-reduced-motion: reduce)').matches,
});

@Component({
  // Bu isim, bileşenin HTML içinde hangi etiketle kullanılacağını belirler.
  selector: 'app-visualization',
  // Bu bağımsız bileşenin şablonda kullanacağı Angular araçlarını ve alt bileşenleri tanıtır.
  imports: [UiIcon],
  // OnPush ile Angular giriş veya signal değişikliklerini izler; gereksiz görünüm kontrollerini azaltır.
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Bu HTML şablonunda süslü parantezler metni, köşeli parantezler değerleri, normal parantezler olayları bağlar.
  template: `
    <!-- Değişkenler solda, aktif adım açıklaması sağda aynı satırda karşılaştırılır. -->
    <div class="execution-summary">
      <div class="variables-panel">
        <span class="mini-label">{{ standalone() ? 'FIELDS' : 'VARIABLES & REFERENCES' }}</span>
        <div class="variable-chips">
          <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
          @for (variable of variables(); track variable.name) {
            <div class="variable-chip" [class.changed]="variable.changed">
              <span>{{ variable.name }}</span
              ><code>{{ variable.value }}</code>
            </div>
          }
          <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
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
        <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
        <button
          aria-label="Zoom Out"
          title="Zoom Out"
          (click)="zoomOut()"
          [disabled]="zoom() <= 0.2"
        >
          <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
          <app-icon name="minus" /></button
        ><span>{{ zoomPercent() }}%</span
        ><button aria-label="Zoom In" title="Zoom In" (click)="zoomIn()" [disabled]="zoom() >= 2">
          <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
          <app-icon name="plus" /></button
        ><button class="fit-button" aria-label="Fit to View" title="Fit to View" (click)="fit()">
          Fit
        </button>
      </div>
    </div>
    <div
      #canvas
      class="canvas-scroll"
      [class.auto-fit]="autoFit()"
      tabindex="0"
      aria-label="Node ve pointer görselleştirmesi"
    >
      <div
        class="scene-viewport motion-scene"
        [style.width.px]="width() * zoom()"
        [style.height.px]="canvasHeight() * zoom()"
      >
        <!-- SVG koordinatları gerçek Node/ok geometrisini çizer; viewBox bütün sahnenin aynı ölçekle görünmesini sağlar. -->
        <svg
          [attr.width]="width()"
          [attr.height]="canvasHeight()"
          [style.transform]="'scale(' + zoom() + ')'"
          [attr.viewBox]="'0 0 ' + width() + ' ' + canvasHeight()"
          role="img"
          [attr.aria-label]="
            standalone()
              ? 'Bağımsız Node: data ve next'
              : (circular() ? 'Circular Linkedlist, yalnız tail, size ' : 'Singly Linkedlist, size ') + snapshot().size
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
              <path d="M 0 0 L 10 5 L 0 10 z" class="arrow-head" />
            </marker>
          </defs>
          <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
          @if (!nodes().length) {
            <text x="45" y="125" class="empty-title">{{ circular() ? 'tail → null' : 'head → null' }}</text>
            <text x="45" y="155" class="empty-description">
              Liste boş. addFirst veya addLast ile başlayabilirsin.
            </text>
          }
          <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
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
              <!-- Tek taşıma grubunu korurken data ve next hücrelerini farklı renklerle ayırırız. -->
              <clipPath [attr.id]="'node-clip-' + node.id">
                <rect width="144" height="64" rx="8" />
              </clipPath>
              <rect width="144" height="64" rx="8" class="node-box" />
              <rect
                x="85"
                width="59"
                height="64"
                class="node-next-cell"
                [attr.clip-path]="'url(#node-clip-' + node.id + ')'"
              />
              <path d="M 85 0 V 64" class="node-divider" />
              <text x="12" y="20" class="field-label">data</text>
              <text x="100" y="20" class="field-label next-field">next</text>
              <!-- SVG içine HTML veri kutusu yerleştirir; uzun data metni kutunun sınırları içinde kalır. -->
              <foreignObject x="10" y="29" width="68" height="29"
                ><div xmlns="http://www.w3.org/1999/xhtml" class="node-value" [title]="node.data">
                  {{ node.data }}
                </div></foreignObject
              >
              <text x="101" y="46" class="next-value">{{ node.next || '∅' }}</text>
            </g>
          }
          <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
          @for (ref of positionedReferences(); track ref.name) {
            <g
              class="reference-label"
              [attr.data-reference]="ref.name"
              [attr.data-target]="ref.target"
              [style.opacity]="ref.opacity"
              [style.transform]="'translate(' + ref.x + 'px,' + ref.y + 'px)'"
            >
              <title>{{ ref.name }} → {{ ref.target }}</title>
              <rect width="72" height="24" rx="6" />
              <text x="36" y="16" text-anchor="middle">{{ ref.name }}</text>
              <path [attr.d]="ref.path" marker-end="url(#arrow)" />
            </g>
          }
        </svg>
      </div>
    </div>
    <div class="visual-legend">
      <span><i class="legend-dot indigo"></i>Node / data</span
      ><span><i class="legend-dot blue-bg"></i>next / reference</span
      ><span class="muted">{{
        standalone() ? 'Listeye bağlı değil' : (circular() ? 'tail.next → first · ' : '') + 'size = ' + snapshot().size
      }}</span>
    </div>
    <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
    @if (step()?.result) {
      <div class="result-box" [class.failed]="step()?.error">
        <span class="mini-label">RETURN</span><code>{{ step()!.result }}</code>
      </div>
    }
  `,
})
export class Visualization {
  // Üst bileşen bu girdiyi vermek zorundadır; input signal’ı okunurken fonksiyon gibi çağrılır.
  readonly snapshot = input.required<ListSnapshot<string>>();
  // Cursor konumundaki kod satırı, açıklama ve liste fotoğrafı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly step = input<ExecutionStep<string> | null>(null);
  // previousStep hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly previousStep = input<ExecutionStep<string> | null>(null);
  // Üst bileşenden gelen değeri input signal olarak tutar; değişince şablon güncellenir.
  readonly standalone = input(false);
  // Tek yönlü halka saklanan head yerine tail referansını gösterir.
  readonly circular = input(false);
  // Üst bileşenden gelen değeri input signal olarak tutar; değişince şablon güncellenir.
  readonly stepNumber = input('');
  // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly trace = input<Trace<string> | null>(null);
  // operation hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly operation = input<Selection>('node');
  // Üst bileşenden gelen değeri input signal olarak tutar; değişince şablon güncellenir.
  readonly speed = input(1);
  // Alt bileşenin üst bileşene göndereceği olayı tanımlar; emit çağrısı olayı bildirir.
  readonly moving = output<boolean>();
  // Node ve okları tek saatle taşıyan animasyon denetleyicisi bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly motion = new SceneMotion();
  // inject, Angular’ın sağladığı ortak bağımlılığı getirir; bileşen servisi kendisi tekrar oluşturmaz.
  private readonly motionEnabled = inject(SCENE_MOTION_ENABLED);
  // lastOperation hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private lastOperation: Selection | undefined;
  // HTML’de # ile adlandırılan elemanı render sonrasında bulur; gerçek DOM ölçüsü buradan okunur.
  readonly canvas = viewChild<ElementRef<HTMLElement>>('canvas');
  // inject, Angular’ın sağladığı ortak bağımlılığı getirir; bileşen servisi kendisi tekrar oluşturmaz.
  private readonly destroyRef = inject(DestroyRef);
  // Fit hesabında kullanılan gerçek çizim alanı ölçüsü değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly viewport = signal({ width: 500, height: 320 });
  // Bütün sahnenin çizim alanına sığdırılmasını seçen durum değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly autoFit = signal(true);
  // Kullanıcının manuel büyütme oranı değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly manualZoom = signal(1);

  // Bu sınıf örneği oluşturulunca bir kez çalışır; başlangıç bağımlılıkları veya gözlemcileri burada hazırlanır.
  constructor() {
    // Snapshot değiştiğinde hedef geometriyi hesapla; çizim her karede SceneMotion'dan gelir.
    effect(() => {
      // Her nesnenin çizimdeki x/y konumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const positions = this.targetNodes();
      // Bir önceki referans hedefleri; değişen oklar bunlarla karşılaştırılır bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const bindings = this.standalone()
        ? {}
        : this.circular() ? { tail: this.snapshot().tail ?? null, ...this.step()?.references } : { head: this.snapshot().head, ...this.step()?.references };
      // Seçilen fonksiyon değişimini algılar; başka sahnenin eski hareketi devralınmaz.
      const scopeChanged = this.lastOperation !== this.operation();
      // Bu atamayla this.lastOperation güncellenir; sonraki satır yeni değeri kullanır.
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
    // ViewChild değişirse gözlemci gerçek çizim elemanına yeniden bağlanır.
    afterRenderEffect((onCleanup) => {
      // Ölçülecek veya kullanılacak gerçek HTML elemanını bulur.
      const element = this.canvas()?.nativeElement;
      // DOM hazır değilse veya ortamda ResizeObserver yoksa mevcut kamera değeri korunur.
      if (!element || typeof ResizeObserver === 'undefined') return;
      // Kapsayıcının gerçek boyutunu okuyacak callback’i hazırlar; Fit pencereye göre güncellenir.
      const measure = () => {
        // Kaldırılmış/HMR sırasında sıfır ölçülen eleman, Fit'i görünmez hale getirmemelidir.
        if (!element.clientWidth || !element.clientHeight) return;
        // client ölçüsü padding'i kapsar; Fit kullanılabilir alan için 32px'i ayrıca çıkarır.
        this.viewport.set({ width: element.clientWidth, height: element.clientHeight });
      };
      // İlk ölçüm ResizeObserver callback'ini beklemeden yapılır.
      measure();
      // Pencere ve panel sürükleme değişimleri aynı ölçüm yolundan geçer.
      const observer = new ResizeObserver(measure);
      // Gerçek elemanın boyut değişimini izler; pencere ve panel resize aynı Fit hesabını günceller.
      observer.observe(element);
      // Eleman değiştiğinde eski DOM gözlemcisi sıfır boyut raporlamaya devam etmez.
      onCleanup(() => observer.disconnect());
    });
  }
  // explanation hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly explanation = computed(() =>
    this.standalone()
      ? 'Node, data ve next alanlarını taşır. next başka bir Node’a referanstır; null ise bağlantı yoktur. Bu Node herhangi bir listeye bağlı değil.'
      : (this.step()?.explanation ??
        'Bir fonksiyon seç, gerekli parametreleri gir ve Run ile işlemi hazırla. Liste fonksiyonlar arasında korunur.'),
  );
  // detachedIndex hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly detachedIndex = computed(() => detachedIndexFor(this.step(), this.operation()));
  // Yeni algoritma adımının hedef nesne konumları diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly targetNodes = computed(() =>
    this.circular() ? circularPositions(this.snapshot(), this.trace(), this.trace()?.steps.at(-1) === this.step(), this.step()) : layoutNodes(
      this.snapshot(),
      this.standalone(),
      this.detachedIndex(),
      this.trace()
        ? {
            baseline: this.trace()!.baseline,
            operation: this.operation(),
            completed: this.trace()!.steps.at(-1) === this.step(),
          }
        : undefined,
    ),
  );
  // SVG yalnız interpolasyonun gerçek ara pozlarını çizer; oklar da bunları kullanır.
  readonly nodes = this.motion.nodes;
  // Kamera boyutunu bütün trace için sabit tut: yeni Node oluşunca her adımda zoom sıçramaz.
  readonly sceneNodes = computed(() =>
    // Son adımda Node'lar yerleşmeden kamerayı küçültmek ara pozları kırpabilir.
    this.trace()?.steps.at(-1) === this.step() && !this.motion.busy()
      ? this.targetNodes()
      : (this.trace()?.steps.flatMap((step) =>
          this.circular() ? circularPositions(step.snapshot, this.trace(), step === this.trace()!.steps.at(-1), step) : layoutNodes(step.snapshot, false, detachedIndexFor(step, this.operation()), {
            baseline: this.trace()!.baseline,
            operation: this.operation(),
            completed: step === this.trace()!.steps.at(-1),
          }),
        ) ?? this.targetNodes()),
  );
  // Tüm trace pozları ve mevcut ara pozlar birlikte ölçülür; hareket sırasında kamera daralmaz.
  readonly bounds = computed(() => {
    // Singly ve bağımsız Node mevcut kamera hesabını korur.
    if (!this.circular()) return sceneBounds([...this.sceneNodes(), ...this.nodes()], this.motion.references());
    // Her kayıt ayrı ölçülür; aynı kimliğin farklı adımlardaki pozları sahte çoklu ok oluşturmaz.
    const scenes = this.trace()?.steps.at(-1) === this.step() && !this.motion.busy()
      ? [this.targetNodes()]
      : this.trace()?.steps.map(step => circularPositions(step.snapshot, this.trace(), step === this.trace()!.steps.at(-1), step)) ?? [this.targetNodes()];
    // Gerçek ara pozlar da dönüş koridoruyla birlikte kadraja alınır.
    const sizes = [...scenes, this.nodes()].map(nodes => circularBounds(nodes, this.motion.references()));
    // İşlem boyunca kamera tüm ara kayıtları kapsar; final yerleşince küçülebilir.
    return { width: Math.max(...sizes.map(size => size.width)), height: Math.max(...sizes.map(size => size.height)) };
  });
  // canvasHeight hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly canvasHeight = computed(() => this.bounds().height);
  // Kamera veya panel için hesaplanan yatay ölçü diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly width = computed(() => this.bounds().width);
  // Fit için minimum yüzde koymayız: uzun bir listenin son okunun da görünmesi gerekir.
  readonly zoom = computed(() =>
    this.autoFit()
      ? Math.min(
          1,
          Math.max(1, this.viewport().width - 32) / this.width(),
          Math.max(1, this.viewport().height - 32) / this.canvasHeight(),
        )
      : this.manualZoom(),
  );
  // zoomPercent hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));
  // Sahneyi kontrollü büyütüp manuel zoom moduna geçirir.
  zoomIn() {
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.manualZoom.set(Math.min(2, this.zoom() + 0.15));
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.autoFit.set(false);
  }
  // Sahneyi kontrollü küçültüp manuel zoom moduna geçirir.
  zoomOut() {
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.manualZoom.set(Math.max(0.2, this.zoom() - 0.15));
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.autoFit.set(false);
  }
  // Bütün Node, ok ve etiketleri tekrar kapsayan otomatik ölçeği seçer.
  fit() {
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.autoFit.set(true);
  }
  // Öğretici kartta gösterilen yerel değişkenler diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly variables = computed(() => {
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (this.standalone())
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        { name: 'data', value: this.snapshot().nodes[0]?.data ?? '', changed: false },
        { name: 'next', value: 'null', changed: false },
      ];
    // Cursor konumundaki kod satırı, açıklama ve liste fotoğrafı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const step = this.step();
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!step) return [];
    // values hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const values = { ...step.variables, ...step.references, ...(this.circular() ? { tail: step.snapshot.tail ?? null } : { head: step.snapshot.head }) };
    // prev hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const prev = this.previousStep();
    // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const previous = { ...prev?.variables, ...prev?.references, ...(this.circular() ? { tail: prev?.snapshot.tail ?? null } : { head: prev?.snapshot.head }) };
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return Object.entries(values).map(([name, value]) => ({
      name,
      value: String(value ?? 'null'),
      changed: prev ? value !== previous[name as keyof typeof previous] : false,
    }));
  });
  // Referans etiketleri Node döngüsünün dışında, isimleriyle track edilir.
  // current başka bir Node'a geçtiğinde aynı SVG öğesi taşınır; bu hareket animasyonlanabilir.
  // Aynı Node'a yönelen pointer'ların etiketleri ve giriş portları birlikte hesaplanır.
  readonly positionedReferences = computed(() =>
    layoutReferences(this.nodes(), this.motion.references()).map((ref) => ({
      ...ref,
      // Node görünürleşirken onun referansı da aynı görünürlük oranıyla belirir.
      opacity: ref.opacity * (this.nodes().find((node) => node.id === ref.target)?.opacity ?? 0),
    })),
  );
  // Güncel nesne pozlarına göre okun SVG yolunu hesaplar.
  path(node: PositionedNode): string {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.circular() ? circularPath(node, this.nodes()) : nextPath(node, this.nodes());
  }
  // referenceCssPath yardımcı fonksiyonu ilgili hesaplamayı tek yerde tutar; çağıran kod aynı kuralı paylaşır.
  referenceCssPath(path: string) {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return `path("${path}")`;
  }
  // cssPath yardımcı fonksiyonu ilgili hesaplamayı tek yerde tutar; çağıran kod aynı kuralı paylaşır.
  cssPath(node: PositionedNode) {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return `path("${this.path(node)}")`;
  }
}
