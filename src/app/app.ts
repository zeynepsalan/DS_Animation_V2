// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
  ElementRef,
  afterNextRender,
  viewChild,
  HostListener,
} from '@angular/core';
// FormsModule, HTML formundaki ngModel veri bağı ile submit olayını çalıştırır.
import { FormsModule } from '@angular/forms';
// Ortak SVG ikon bileşenini getirir; kontroller için aynı çizim sistemi kullanılır.
import { UiIcon } from './components/ui-icon';
// Sidebar bileşeni Explorer ağacını ve fonksiyon seçimi olayını gösterir.
import { Sidebar } from './components/sidebar';
// Codebar bileşeni dil satırlarını ve aktif semantik satır highlight’ını gösterir.
import { Codebar } from './components/codebar';
// Doubly sahnesi iki yönlü okları, head/tail ve geçici referansları animasyonla çizer.
import { DoublyVisualization } from './components/doubly-visualization';
// Doubly seçim kimliği ve satır üretimi yardımcılarını paylaşır.
import { isDoubly, doublyName, doublyReturnType } from './education/doubly-code';
// Circular form ve dosya adını aynı seçim kimliğinden türetir.
import { isCircular, circularName, circularReturnType } from './education/circular-code';
// DNode sahnesi bağımsız constructor atamalarını gösterir; liste state’ini değiştirmez.
import { DNodeVisualization } from './components/dnode-visualization';
// Singly sahnesi Node/next çizimini, referansları ve Fit ölçüsünü yönetir.
import { Visualization } from './components/visualization';
// Veri ve next taşıyan bağımsız generic Node sınıfını getirir.
import { Node } from './core/node';
// Kayıtları oynatan ortak servisi getirir; paneller aynı cursor’u okur.
import { PlaybackService } from './core/playback.service';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { Language, ListSnapshot, Selection } from './core/execution.types';
// Fonksiyon imza, parametre, grup ve açıklamalarını ortak katalogdan getirir.
import { infoFor } from './education/catalog';
// Panel ölçüleri ve Sidebar açılma durumunu ayrı serviste yönetir.
import { PanelLayout } from './core/panel-layout';
// Kod paneli ve indirilebilir örneklerin aynı satır kaynağını getirir.
import { returnTypeFor } from './education/code-documents';

/** Root component panelleri birleştirir; algoritma ve oynatma mantığı ayrı sınıflardadır. */
@Component({
  // Bu isim, bileşenin HTML içinde hangi etiketle kullanılacağını belirler.
  selector: 'app-root',
  // Bu bağımsız bileşenin şablonda kullanacağı Angular araçlarını ve alt bileşenleri tanıtır.
  imports: [
    FormsModule,
    Sidebar,
    Codebar,
    Visualization,
    DNodeVisualization,
    DoublyVisualization,
    UiIcon,
  ],
  // Görünümün ayrı HTML dosyasını bu TypeScript bileşenine bağlar.
  templateUrl: './app.html',
  // OnPush ile Angular giriş veya signal değişikliklerini izler; gereksiz görünüm kontrollerini azaltır.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  // inject, Angular’ın sağladığı ortak bağımlılığı getirir; bileşen servisi kendisi tekrar oluşturmaz.
  readonly player = inject(PlaybackService);
  // Panel ölçüleri algoritma durumundan ayrıdır; resize listeyi değiştirmez.
  readonly layout = inject(PanelLayout);
  // Hareket sürerken yeni manuel adımı engelleyen durum değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly visualBusy = signal(false);
  // HTML’de # ile adlandırılan elemanı render sonrasında bulur; gerçek DOM ölçüsü buradan okunur.
  readonly panels = viewChild<ElementRef<HTMLElement>>('panels');
  // Sürüklenen ayıracın Sidebar mı kod paneli mi olduğunu saklar; null iken sürükleme yoktur.
  private resizeKind: 'sidebar' | 'code' | null = null;
  // Pointer’ın sürükleme başladığındaki x konumunu saklar; hareket farkı bu noktadan hesaplanır.
  private resizeStart = 0;
  // Panelin sürükleme başındaki genişliğini saklar; her pointer olayında aynı başlangıç kullanılır.
  private resizeWidth = 0;
  // Bu sınıf örneği oluşturulunca bir kez çalışır; başlangıç bağımlılıkları veya gözlemcileri burada hazırlanır.
  constructor() {
    // İlk render'da gerçek ekran genişliğini al ve pencere küçülmesini izle.
    afterNextRender(() => {
      // Pencerenin gerçek genişliğini düzen servisine gönderen callback’i hazırlar.
      const update = () => this.layout.setViewport(window.innerWidth);
      // İlk gerçek pencere genişliğini PanelLayout’a gönderir; başlangıç varsayımı hemen düzeltilir.
      update();
      // Gerçek pencere/klavye olayını ilgili işleyiciye bağlar; kapanışta eşleşen temizlik yapılır.
      window.addEventListener('resize', update);
      // Kullanılmayan olay dinleyicisini kaldırır; eski bileşen olay almaya devam etmez.
      this.removeResizeListener = () => window.removeEventListener('resize', update);
    });
  }
  // Pencere dinleyicisini kaldıran fonksiyonu saklar; bileşen kapanırken çağrılır.
  private removeResizeListener = () => {};
  // Ayraç sürüklenmesini başlatıp pointer’ı yakalar; panel dışına çıkınca da hareket izlenir.
  beginResize(event: PointerEvent, kind: 'sidebar' | 'code') {
    // Pointer capture, sürükleme ayraç dışına çıksa da resize olayını burada tutar.
    event.preventDefault();
    // Pointer’ı ayraç üzerinde yakalar; imleç panel dışına çıksa da sürükleme olayları kaybolmaz.
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    // Bu sürüklemenin hangi panel ayıracına ait olduğunu saklar.
    this.resizeKind = kind;
    // Başlangıç pointer konumunu saklar; sonraki hareket farkı buradan hesaplanır.
    this.resizeStart = event.clientX;
    // Sürükleme başlangıcındaki panel ölçüsünü saklar; kümülatif hata oluşmaz.
    this.resizeWidth =
      kind === 'sidebar'
        ? this.layout.sidebarWidth()
        : this.panels()!.nativeElement.querySelector('.editor-column')!.getBoundingClientRect()
            .width;
  }
  // Başlangıç ölçüsüne sürükleme farkını ekler ve minimum/maximum sınırlarını uygular.
  resize(event: PointerEvent) {
    // Yalnız aktif panel sürüklemesi için genişlik güncellemesi yapılır.
    if (!this.resizeKind) return;
    // İlk genişliğe sürükleme farkını ekleyerek kümülatif yuvarlama hatasını önle.
    const width = this.resizeWidth + event.clientX - this.resizeStart;
    // Yalnız aktif panel sürüklemesi için genişlik güncellemesi yapılır.
    if (this.resizeKind === 'sidebar') this.layout.resizeSidebar(width);
    else
      /* this.layout.resizeCode çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır. */ this.layout.resizeCode(
        width,
        this.panels()!.nativeElement.clientWidth,
      );
  }
  // Aktif sürükleme bilgisini bırakır.
  endResize() {
    // Bu sürüklemenin hangi panel ayıracına ait olduğunu saklar.
    this.resizeKind = null;
  }
  // Klavye oklarını panel ölçüsünde kontrollü adımlara dönüştürür.
  resizeKey(event: KeyboardEvent, kind: 'sidebar' | 'code') {
    // Klavye kullanıcıları da ayraçları 20 px adımlarla değiştirebilir.
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    // Bu kontrolün özel eyleminde tarayıcının varsayılan kaydırma veya gönderme davranışını durdurur.
    event.preventDefault();
    // Klavye veya pointer hareketinden gelen ölçü farkını hesaplar.
    const delta = event.key === 'ArrowLeft' ? -20 : 20;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (kind === 'sidebar') this.layout.resizeSidebar(this.layout.sidebarWidth() + delta);
    else
      // this.layout.resizeCode çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.layout.resizeCode(
        this.panels()!.nativeElement.querySelector('.editor-column')!.getBoundingClientRect()
          .width + delta,
        this.panels()!.nativeElement.clientWidth,
      );
  }
  // Explorer’da seçilen sınıf veya fonksiyon değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly selection = signal<Selection>('node');
  // Template, doğru sahneyi kalıcı seçimden türetir.
  readonly doublySelected = computed(() => isDoubly(this.selection()));
  // Tek yönlü Circular aynı Node çizimini, kendi tail ve halka geometrisiyle kullanır.
  readonly circularSelected = computed(() => isCircular(this.selection()));
  // İndirilen kaynak her zaman seçili yapıya ve dile aittir.
  readonly sourceFile = computed(() => {
    // java hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const java = this.language() === 'java';
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (this.circularSelected()) return java ? '/examples/CircularLinkedlist.java' : '/examples/circular_linkedlist.c';
    // Doubly kaynağı ayrı kalır.
    if (this.doublySelected())
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return java ? '/examples/DoublyLinkedlist.java' : '/examples/doubly_linkedlist.c';
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (this.selection() === 'dnode') return java ? '/examples/DNode.java' : '/examples/DNode.c';
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return java ? '/examples/SinglyLinkedlist.java' : '/examples/singly_linkedlist.c';
  });
  // Kod panelinde seçilen Java, C veya Pseudocode dili değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly language = signal<Language>('java');
  // Seçilen fonksiyonun parametre ve açıklama bilgileri diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly info = computed(() => infoFor(this.selection()));
  // Formdaki geçersiz girişin açıklaması değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly message = signal('');
  // İptal veya yeniden başlatma gibi işlem bilgisi değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly notice = signal('');
  // İşlemde oluşturulan veya gösterilen nesne değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly node = signal(new Node<string>('42', null));
  // nodeSnapshot hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly nodeSnapshot = computed<ListSnapshot<string>>(() => ({
    head: null,
    size: 0,
    nodes: [{ id: this.node().id, data: this.node().data, next: null }],
  }));
  // previousStep hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly previousStep = computed(
    () => this.player.trace()?.steps[Math.max(0, this.player.cursor() - 1)] ?? null,
  );
  // Seçilen dile ve fonksiyona göre formda görünen method imzası diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly signature = computed(() => {
    // Silme veya Clear adımında current referansının gösterdiği nesneyi seçer.
    const selected = this.selection();
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (isCircular(selected)) {
      // Görünen imza iç seçim prefix'ini taşımaz.
      const name = circularName(selected);
      // Doğrudan dönüş tipi seçilen dilin sözdizimine çevrilir.
      const type = circularReturnType(selected, this.language());
      // C method'ları liste türüne özgü prefix taşır.
      return this.language() === 'pseudo' ? name : this.language() === 'java' ? `public ${type} ${name}` : `${type} cll_${name}`;
    }
    // Doubly imzası mevcut sözleşmeyle korunur.
    if (isDoubly(selected)) {
      // İsimden gerekli prefix veya dil bilgisini ayırır; kullanıcıya gerçek method adı gösterilir.
      const name = doublyName(selected);
      // type hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const type = doublyReturnType(selected, this.language());
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return this.language() === 'pseudo'
        ? name
        : this.language() === 'java'
          ? `public ${type} ${name}`
          : `${type} dll_${name}`;
    }
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (selected === 'dnode')
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return this.language() === 'c'
        ? 'DNode *newDNode'
        : this.language() === 'pseudo'
          ? 'NEW DNode'
          : 'new DNode<String>';
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (selected === 'node')
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return this.language() === 'c'
        ? 'Node *newNode'
        : this.language() === 'pseudo'
          ? 'NEW Node'
          : 'new Node<String>';
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (this.language() === 'pseudo') return selected;
    // type hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const type = returnTypeFor(selected, this.language());
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.language() === 'java' ? `public ${type} ${selected}` : `${type} ll_${selected}`;
  });
  // Bu işlemde kullanılacak veya geri döndürülecek data değerini saklar.
  value = '';
  // Kullanıcının seçtiği, sıfırdan başlayan hedef konum bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  index = '';
  // nodeValue hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  nodeValue = '42';
  // Null veya hazır komşu seçimi, constructor’a gerçek referans verilmesini öğretir.
  dnodePrev = 'null';
  // dnodeNext hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  dnodeNext = 'null';

  // Fonksiyon seçimini değiştirir; yarım kalan işlemi önce başlangıç listesine geri alır.
  select(selection: Selection) {
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (selection === this.selection()) return;
    // Henüz listeye bağlanmamış yeni nesnenin görünmesini sağlayan geçici referans bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const pending = !!this.player.trace() && !this.player.atEnd();
    // this.player.cancelPending çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.player.cancelPending();
    // Yeni sahne önceki component’in hareket kilidini devralmaz.
    this.visualBusy.set(false);
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.selection.set(selection);
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.message.set('');
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.notice.set(
      pending ? 'Önceki işlem iptal edildi; işlem öncesindeki liste geri yüklendi.' : '',
    );
  }

  // İmzadaki parametreleri doğrular; doğru veriyle adım kaydını hazırlayıp oynatmayı başlatır.
  run() {
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.message.set('');
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.notice.set('');
    // Explorer’da seçilen sınıf veya fonksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const selection = this.selection();
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (selection === 'dnode') {
      // Boş data beklenen kullanıcı hatasıdır; sahne değiştirilmez.
      if (!this.nodeValue.trim()) {
        // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
        this.message.set('DNode için bir data değeri gir.');
        // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
        return;
      }
      // this.player.startDNode çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.player.startDNode(this.nodeValue, this.dnodePrev !== 'null', this.dnodeNext !== 'null');
      // this.player.play çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.player.play();
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (selection === 'node') {
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!this.nodeValue.trim()) {
        // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
        this.message.set('Node için bir data değeri gir.');
        // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
        return;
      }
      // Bağımsız önizleme Node’u için başlangıçta sonraki Node bulunmaz.
      this.node.set(new Node(this.nodeValue, null));
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // Seçilen fonksiyonun parametre ve açıklama bilgileri bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const info = this.info()!;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (info.value && !this.value.trim()) {
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      this.message.set('value alanını doldur. Değerler String olarak işlenir.');
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (
      info.index &&
      (!/^\d+$/.test(this.index.trim()) || !Number.isSafeInteger(Number(this.index)))
    ) {
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      this.message.set('index için 0 veya daha büyük bir tam sayı gir.');
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (isCircular(selection)) {
      // Form doğrulandıktan sonra yalnız Circular kalıcı halkası kullanılır.
      this.player.startCircular(selection, {
        ...(info.value ? { value: this.value } : {}),
        ...(info.index ? { index: Number(this.index) } : {}),
      });
      // Ortak oynatma zamanlayıcısı yeni kayıttan devam eder.
      this.player.play();
      // Aynı parametreler Singly listesine gönderilmez.
      return;
    }
    // Doubly işlemleri kendi state'ini kullanır.
    if (isDoubly(selection)) {
      // Mevcut form doğrulamasından sonra yalnız Doubly listesi çalıştırılır.
      this.player.startDoubly(selection, {
        ...(info.value ? { value: this.value } : {}),
        ...(info.index ? { index: Number(this.index) } : {}),
      });
      // this.player.play çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.player.play();
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // this.player.start çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.player.start(selection, {
      ...(info.value ? { value: this.value } : {}),
      ...(info.index ? { index: Number(this.index) } : {}),
    });
    // this.player.play çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.player.play();
  }

  // Root içindeki gerçek butonlar, klavye için de aynı disabled kurallarını uygular.
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Klavye olayını güvenli kontrollerden sonra mevcut oynatma butonuna yönlendirir.
  @HostListener('document:keydown', ['$event'])
  playbackShortcut(event: KeyboardEvent) {
    // Yazı girişi, IME, basılı tuş tekrarı ve sistem kısayolları oynatmayı değiştirmez.
    if (
      event.defaultPrevented ||
      event.isComposing ||
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey
    )
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    // Input, slider, düzenlenebilir alan ve panel ayraçları kendi klavye davranışını korur.
    const target = event.target instanceof Element ? event.target : null;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (
      target?.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="separator"], [role="slider"]',
      )
    )
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    // Odaklanmış buton veya linkte Space'in yerleşik aktivasyonu çift çağrı üretmesin.
    if (event.key === ' ' && target?.closest('button, a')) return;
    // İngilizce tuş adları, kullanıcıya gösterilen tooltip ile aynı eylemlere eşleşir.
    const label =
      event.key === ' '
        ? this.player.playing()
          ? 'Pause'
          : 'Play'
        : event.key === 'ArrowRight'
          ? 'Next Step'
          : event.key === 'ArrowLeft'
            ? 'Previous Step'
            : event.key.toLowerCase() === 'r'
              ? 'Reset'
              : null;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!label) return;
    // Devre dışı eylem klavyeden de çalışmaz; animasyonun ara adımları korunur.
    const button = this.host.nativeElement.querySelector<HTMLButtonElement>(
      `.playback button[aria-label="${label}"]`,
    );
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!button || button.disabled) return;
    // Geçerli kısayolda sayfa kaydırmasını önleyip mevcut click işleyicisini kullanırız.
    event.preventDefault();
    // button.click çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    button.click();
  }

  // Kayıtlı bir sonraki adımı gösterir; algoritmayı ikinci kez çalıştırmaz.
  next() {
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    this.player.pause();
    // this.player.next çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.player.next();
  }
  // HTML hız kontrolünün değerini sayıya çevirip oynatıcıya aktarır.
  changeSpeed(event: Event) {
    // this.player.setSpeed çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.player.setSpeed(Number((event.target as HTMLInputElement).value));
  }
  // Bileşen kapanınca zamanlayıcı ve pencere dinleyicilerini temizler.
  ngOnDestroy() {
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    this.player.pause();
    // this.removeResizeListener çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.removeResizeListener();
  }
}
