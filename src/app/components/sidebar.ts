import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { UiIcon } from './ui-icon';
import { FUNCTIONS, GROUPS } from '../education/catalog';
import type { Selection } from '../core/execution.types';

@Component({
  selector: 'app-sidebar',
  imports: [UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        <app-icon name="menu" />
      </button>
      <!-- Search yalnız görünen fonksiyon ağacını filtreler; liste ve seçili işlem korunur. -->
      <div class="sidebar-search">
        <app-icon name="search" /><input
          type="search"
          aria-label="Fonksiyon ara"
          placeholder="Search functions…"
          [value]="query()"
          (input)="search($event)"
        />
        @if (query()) {
          <button aria-label="Aramayı temizle" (click)="query.set('')">
            <app-icon name="close" />
          </button>
        }
      </div>
    </div>
    <nav aria-label="Veri yapıları ve fonksiyonlar">
      <!-- DNode bağımsız sınıf olarak aynı Explorer ağacından seçilir. -->
      @if (!normalizedQuery() || 'dnode'.includes(normalizedQuery())) {
        <button
          class="file node-file"
          [class.selected]="selected() === 'dnode'"
          (click)="functionSelected.emit('dnode')"
        >
          <app-icon class="file-icon blue" name="code" /><span>DNode</span
          ><span class="file-tag">class</span>
        </button>
      }
      @if (showNode()) {
        <button
          class="file node-file"
          [class.selected]="selected() === 'node'"
          (click)="functionSelected.emit('node')"
        >
          <app-icon class="file-icon blue" name="code" /><span>Node</span
          ><span class="file-tag">class</span>
        </button>
      }
      <button
        class="folder"
        [attr.aria-expanded]="expanded() || !!query()"
        (click)="expanded.set(!expanded())"
      >
        <span>{{ expanded() || query() ? '⌄' : '›' }}</span
        ><app-icon class="folder-icon" name="folder" />Singly Linkedlist
      </button>
      @if (expanded() || query()) {
        @for (group of groups(); track group) {
          <div class="tree-group">{{ group }}</div>
          @for (fn of functionsFor(group); track fn.id) {
            <button
              class="file"
              [class.selected]="selected() === fn.id"
              [attr.aria-current]="selected() === fn.id ? 'page' : null"
              (click)="functionSelected.emit(fn.id)"
            >
              <app-icon class="file-icon" name="file" /><span>{{ fn.label }}</span>
            </button>
          }
        }
      }
      @if (
        query() &&
        !groups().length &&
        !showNode() &&
        !'dnode'.includes(normalizedQuery()) &&
        !doublyFunctions.some(matchesDoubly)
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
      @if (doublyExpanded() || query()) {
        @for (fn of doublyFunctions; track fn.id) {
          @if (!normalizedQuery() || fn.label.toLowerCase().includes(normalizedQuery())) {
            <button
              class="file"
              [class.selected]="selected() === fn.id"
              [attr.aria-label]="'Doubly ' + fn.label"
              (click)="functionSelected.emit(fn.id)"
            >
              <app-icon class="file-icon" name="file" /><span>{{ fn.label }}</span>
            </button>
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
  readonly selected = input.required<Selection>();
  // select native input olayıyla çakışır; metin seçimi fonksiyon değişikliği sayılmamalıdır.
  readonly functionSelected = output<Selection>();
  // Her veri yapısının klasörü bağımsız açılıp kapanır.
  readonly doublyExpanded = signal(true);
  readonly toggleExpanded = (value: boolean) => !value;
  readonly doublyFunctions = [
    { id: 'doublyIsEmpty' as const, label: 'isEmpty()' },
    { id: 'doublySize' as const, label: 'size()' },
    { id: 'doublyAddFirst' as const, label: 'addFirst(value)' },
  ];
  // Eşleşen Doubly dosyası varsa boş arama sonucu mesajı gösterilmez.
  readonly matchesDoubly = (fn: { label: string }) =>
    fn.label.toLowerCase().includes(this.normalizedQuery());
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
  search(event: Event) {
    // Input'taki güncel metin reaktif filtreyi yeniden hesaplatır.
    this.query.set((event.target as HTMLInputElement).value);
  }
  functionsFor(group: string) {
    // Grup adı eşleşirse ve fonksiyon etiketi aranan metni içerirse dosyayı gösterir.
    return FUNCTIONS.filter(
      (fn) =>
        fn.group === group && fn.label.toLocaleLowerCase('en').includes(this.normalizedQuery()),
    );
  }
}
