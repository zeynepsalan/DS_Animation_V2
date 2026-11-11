// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
// Ortak SVG ikon bileşenini getirir; kontroller için aynı çizim sistemi kullanılır.
import { UiIcon } from './ui-icon';
// Doubly seçim kimliği ve satır üretimi yardımcılarını paylaşır.
import { doublyId } from '../education/doubly-code';
// Circular dosyaları ayrı seçim kimliğiyle aynı method kataloğunu kullanır.
import { circularId } from '../education/circular-code';
// Fonksiyon imza, parametre, grup ve açıklamalarını ortak katalogdan getirir.
import { FUNCTIONS, GROUPS } from '../education/catalog';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { Selection } from '../core/execution.types';

@Component({
  // Bu isim, bileşenin HTML içinde hangi etiketle kullanılacağını belirler.
  selector: 'app-sidebar',
  // Bu bağımsız bileşenin şablonda kullanacağı Angular araçlarını ve alt bileşenleri tanıtır.
  imports: [UiIcon],
  // OnPush ile Angular giriş veya signal değişikliklerini izler; gereksiz görünüm kontrollerini azaltır.
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Bu HTML şablonunda süslü parantezler metni, köşeli parantezler değerleri, normal parantezler olayları bağlar.
  template: `
    <!-- Açık durumda logo ve başlık Sidebar içinde sol kenardan başlar. -->
    <div class="sidebar-brand">
      <a class="brand-symbol" href="/" aria-label="Data Structures Lab ana sayfa"
        >ds<span>↗</span></a
      >
      <span>DATA STRUCTURES</span><span class="muted">•••</span>
    </div>
    <div class="sidebar-tools">
      <!-- Açık Sidebar kontrolü logo altında, search ile aynı satırda bulunur. -->
      <button
        class="sidebar-toggle"
        aria-label="Sidebar aç/kapat"
        aria-expanded="true"
        (click)="toggle.emit()"
      >
        <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
        <app-icon name="menu" />
      </button>
      <!-- Search yalnız görünen fonksiyon ağacını filtreler; liste ve seçili işlem korunur. -->
      <div class="sidebar-search">
        <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
        <app-icon name="search" /><input
          type="search"
          aria-label="Fonksiyon ara"
          placeholder="Search functions…"
          [value]="query()"
          (input)="search($event)"
        />
        <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
        @if (query()) {
          <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
          <button aria-label="Aramayı temizle" (click)="query.set('')">
            <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
            <app-icon name="close" />
          </button>
        }
      </div>
    </div>
    <nav aria-label="Veri yapıları ve fonksiyonlar">
      <!-- DNode bağımsız sınıf olarak aynı Explorer ağacından seçilir. -->
      @if (!normalizedQuery() || 'dnode'.includes(normalizedQuery())) {
        <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
        <button
          class="file node-file"
          [class.selected]="selected() === 'dnode'"
          (click)="functionSelected.emit('dnode')"
        >
          <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
          <app-icon class="file-icon blue" name="code" /><span>DNode</span
          ><span class="file-tag">class</span>
        </button>
      }
      <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
      @if (showNode()) {
        <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
        <button
          class="file node-file"
          [class.selected]="selected() === 'node'"
          (click)="functionSelected.emit('node')"
        >
          <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
          <app-icon class="file-icon blue" name="code" /><span>Node</span
          ><span class="file-tag">class</span>
        </button>
      }
      <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
      <button
        class="folder"
        [attr.aria-expanded]="expanded() || !!query()"
        (click)="expanded.set(!expanded())"
      >
        <span>{{ expanded() || query() ? '⌄' : '›' }}</span
        ><app-icon class="folder-icon" name="folder" />Singly Linkedlist
      </button>
      <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
      @if (expanded() || query()) {
        <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
        @for (group of groups(); track group) {
          <div class="tree-group">{{ group }}</div>
          <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
          @for (fn of functionsFor(group); track fn.id) {
            <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
            <button
              class="file"
              [class.selected]="selected() === fn.id"
              [attr.aria-current]="selected() === fn.id ? 'page' : null"
              (click)="functionSelected.emit(fn.id)"
            >
              <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
              <app-icon class="file-icon" name="file" /><span>{{ fn.label }}</span>
            </button>
          }
        }
      }
      <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
      @if (
        query() &&
        !groups().length &&
        !showNode() &&
        !'dnode'.includes(normalizedQuery()) &&
        !doublyFunctions.some(matchesDoubly) && !circularFunctions.some(matchesDoubly)
      ) {
        <p class="search-empty">Eşleşen fonksiyon yok.</p>
      }
      <!-- Yalnız uygulanan Doubly fonksiyonları aktif dosya olarak sunulur. -->
      <button
        class="folder"
        [attr.aria-expanded]="doublyExpanded() || !!query()"
        (click)="doublyExpanded.update(toggleExpanded)"
      >
        <span>{{ doublyExpanded() || query() ? '⌄' : '›' }}</span
        ><app-icon class="folder-icon" name="folder" />Doubly Linkedlist
      </button>
      <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
      @if (doublyExpanded() || query()) {
        <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
        @for (group of doublyGroups; track group) {
          <!-- Angular @if, koşula göre bu HTML bloğunu oluşturur veya kaldırır; state değişince seçim yeniden okunur. -->
          @if (doublyFunctionsFor(group).length) {
            <div class="tree-group">{{ group }}</div>
            <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
            @for (fn of doublyFunctionsFor(group); track fn.id) {
              <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
              <button
                class="file"
                [class.selected]="selected() === fn.id"
                [attr.aria-label]="'Doubly ' + fn.label"
                (click)="functionSelected.emit(fn.id)"
              >
                <!-- Alt bileşen köşeli parantezle giriş alır, normal parantezle olay bildirir; ortak state üst bileşende kalır. -->
                <app-icon class="file-icon" name="file" /><span>{{ fn.label }}</span>
              </button>
            }
          }
        }
      }

      <!-- Circular klasörü Singly ve Doubly'nin hemen ardından gelir. -->
      <button class="folder" [attr.aria-expanded]="circularExpanded() || !!query()" (click)="circularExpanded.update(toggleExpanded)">
        <span>{{ circularExpanded() || query() ? '⌄' : '›' }}</span><app-icon class="folder-icon" name="folder" />Circular Linkedlist
      </button>
      @if (circularExpanded() || query()) {
        @for (group of doublyGroups; track group) {
          @if (circularFunctionsFor(group).length) {
            <div class="tree-group">{{ group }}</div>
            @for (fn of circularFunctionsFor(group); track fn.id) {
              <!-- Her dosya yalnız Circular state'ini seçer; diğer listeler sıfırlanmaz. -->
              <button class="file" [class.selected]="selected() === fn.id" [attr.aria-current]="selected() === fn.id ? 'page' : null" [attr.aria-label]="'Circular ' + fn.label" (click)="functionSelected.emit(fn.id)">
                <app-icon class="file-icon" name="file" /><span>{{ fn.label }}</span>
              </button>
            }
          }
        }
      }

      <div class="folder future">
        <span>›</span><app-icon class="folder-icon" name="folder" />Array<span class="file-tag"
          >Yakında</span
        >
      </div>
    </nav>
    <div class="sidebar-note">
      <span class="blue">●</span> Her fonksiyon aynı listeden devam eder.
    </div>
  `,
})
export class Sidebar {
  // Aç/kapat isteği root panel düzenine iletilir.
  // Sidebar içindeki kapatma kontrolü üst bileşenin ortak durumunu değiştirir.
  readonly toggle = output<void>();
  // Üst bileşen bu girdiyi vermek zorundadır; input signal’ı okunurken fonksiyon gibi çağrılır.
  readonly selected = input.required<Selection>();
  // select native input olayıyla çakışır; metin seçimi fonksiyon değişikliği sayılmamalıdır.
  readonly functionSelected = output<Selection>();
  // Her veri yapısının klasörü bağımsız açılıp kapanır.
  readonly doublyExpanded = signal(true);
  // Circular klasörü diğer listelerden bağımsız açılıp kapanır.
  readonly circularExpanded = signal(true);
  // Mevcut 18 method aynı parametre adlarıyla halka için de sunulur.
  readonly circularFunctions = FUNCTIONS.map(fn => ({ ...fn, id: circularId(fn.id) }));
  // toggleExpanded hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly toggleExpanded = (value: boolean) => !value;
  // Aynı katalog 18 method’un imzalarını ve gruplarını iki yapı için tutarlı tutar.
  readonly doublyFunctions = FUNCTIONS.map((fn) => ({ ...fn, id: doublyId(fn.id) }));
  // Eşleşen Doubly dosyası varsa boş arama sonucu mesajı gösterilmez.
  readonly matchesDoubly = (fn: { label: string }) =>
    fn.label.toLowerCase().includes(this.normalizedQuery());
  // Singly klasörünün açık olup olmadığı değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly expanded = signal(true);
  // Filtre metni UI state'idir; algoritma state'inden bağımsızdır.
  readonly query = signal('');
  // Trim ve küçük harf normalizasyonu, boşluk ve büyük harf farklarını kaldırır.
  readonly normalizedQuery = computed(() => this.query().trim().toLocaleLowerCase('en'));
  // Node sınıfı da arama sonuçlarının bir parçasıdır.
  readonly showNode = computed(
    () => !this.normalizedQuery() || 'node'.includes(this.normalizedQuery()),
  );
  // Yalnız eşleşen fonksiyonları olan gruplar görünür; boş başlıklar oluşturulmaz.
  readonly groups = computed(() => GROUPS.filter((group) => this.functionsFor(group).length));
  // İki veri yapısının aynı grupları öğrenme sırasında karşılaştırılabilir.
  readonly doublyGroups = GROUPS;
  // Doubly klasörünün aynı grup ve arama kurallarını uygular.
  doublyFunctionsFor(group: string) {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.doublyFunctions.filter((fn) => fn.group === group && this.matchesDoubly(fn));
  }
  // Circular grubunda yalnız aramayla eşleşen dosyalar gösterilir.
  circularFunctionsFor(group: string) {
    // Arama hiçbir kalıcı liste veya trace kaydını değiştirmez.
    return this.circularFunctions.filter(fn => fn.group === group && this.matchesDoubly(fn));
  }
  // Arama girdisini veya modelde veri karşılaştırmasını yönetir; koşulun sonucu kayıtlanır.
  search(event: Event) {
    // Input'taki güncel metin reaktif filtreyi yeniden hesaplatır.
    this.query.set((event.target as HTMLInputElement).value);
  }
  // Explorer grubundaki arama eşleşmelerini bulur; gerçek liste durumunu değiştirmez.
  functionsFor(group: string) {
    // Grup adı eşleşirse ve fonksiyon etiketi aranan metni içerirse dosyayı gösterir.
    return FUNCTIONS.filter(
      (fn) =>
        fn.group === group && fn.label.toLocaleLowerCase('en').includes(this.normalizedQuery()),
    );
  }
}
