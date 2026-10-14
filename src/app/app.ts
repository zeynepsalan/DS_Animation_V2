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
import { FormsModule } from '@angular/forms';
import { UiIcon } from './components/ui-icon';
import { Sidebar } from './components/sidebar';
import { Codebar } from './components/codebar';
import { DoublyVisualization } from './components/doubly-visualization';
import { isDoubly, doublyName } from './education/doubly-code';
import { DNodeVisualization } from './components/dnode-visualization';
import { Visualization } from './components/visualization';
import { Node } from './core/node';
import { PlaybackService } from './core/playback.service';
import type { Language, ListSnapshot, Selection } from './core/execution.types';
import { infoFor } from './education/catalog';
import { PanelLayout } from './core/panel-layout';
import { returnTypeFor } from './education/code-documents';

/** Root component panelleri birleştirir; algoritma ve oynatma mantığı ayrı sınıflardadır. */
@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    Sidebar,
    Codebar,
    Visualization,
    DNodeVisualization,
    DoublyVisualization,
    UiIcon,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  readonly player = inject(PlaybackService);
  // Panel ölçüleri algoritma durumundan ayrıdır; resize listeyi değiştirmez.
  readonly layout = inject(PanelLayout);
  readonly visualBusy = signal(false);
  readonly panels = viewChild<ElementRef<HTMLElement>>('panels');
  private resizeKind: 'sidebar' | 'code' | null = null;
  private resizeStart = 0;
  private resizeWidth = 0;
  constructor() {
    // İlk render'da gerçek ekran genişliğini al ve pencere küçülmesini izle.
    afterNextRender(() => {
      const update = () => this.layout.setViewport(window.innerWidth);
      update();
      window.addEventListener('resize', update);
      this.removeResizeListener = () => window.removeEventListener('resize', update);
    });
  }
  private removeResizeListener = () => {};
  beginResize(event: PointerEvent, kind: 'sidebar' | 'code') {
    // Pointer capture, sürükleme ayraç dışına çıksa da resize olayını burada tutar.
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.resizeKind = kind;
    this.resizeStart = event.clientX;
    this.resizeWidth =
      kind === 'sidebar'
        ? this.layout.sidebarWidth()
        : this.panels()!.nativeElement.querySelector('.editor-column')!.getBoundingClientRect()
            .width;
  }
  resize(event: PointerEvent) {
    if (!this.resizeKind) return;
    // İlk genişliğe sürükleme farkını ekleyerek kümülatif yuvarlama hatasını önle.
    const width = this.resizeWidth + event.clientX - this.resizeStart;
    if (this.resizeKind === 'sidebar') this.layout.resizeSidebar(width);
    else this.layout.resizeCode(width, this.panels()!.nativeElement.clientWidth);
  }
  endResize() {
    this.resizeKind = null;
  }
  resizeKey(event: KeyboardEvent, kind: 'sidebar' | 'code') {
    // Klavye kullanıcıları da ayraçları 20 px adımlarla değiştirebilir.
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === 'ArrowLeft' ? -20 : 20;
    if (kind === 'sidebar') this.layout.resizeSidebar(this.layout.sidebarWidth() + delta);
    else
      this.layout.resizeCode(
        this.panels()!.nativeElement.querySelector('.editor-column')!.getBoundingClientRect()
          .width + delta,
        this.panels()!.nativeElement.clientWidth,
      );
  }
  readonly selection = signal<Selection>('node');
  // Template, doğru sahneyi kalıcı seçimden türetir.
  readonly doublySelected = computed(() => isDoubly(this.selection()));
  // İndirilen kaynak her zaman seçili yapıya ve dile aittir.
  readonly sourceFile = computed(() => {
    const java = this.language() === 'java';
    if (this.doublySelected())
      return java ? '/examples/DoublyLinkedlist.java' : '/examples/doubly_linkedlist.c';
    if (this.selection() === 'dnode') return java ? '/examples/DNode.java' : '/examples/DNode.c';
    return java ? '/examples/SinglyLinkedlist.java' : '/examples/singly_linkedlist.c';
  });
  readonly language = signal<Language>('java');
  readonly info = computed(() => infoFor(this.selection()));
  readonly message = signal('');
  readonly notice = signal('');
  readonly node = signal(new Node<string>('42', null));
  readonly nodeSnapshot = computed<ListSnapshot<string>>(() => ({
    head: null,
    size: 0,
    nodes: [{ id: this.node().id, data: this.node().data, next: null }],
  }));
  readonly previousStep = computed(
    () => this.player.trace()?.steps[Math.max(0, this.player.cursor() - 1)] ?? null,
  );
  readonly signature = computed(() => {
    const selected = this.selection();
    if (isDoubly(selected)) {
      const name = doublyName(selected);
      const type =
        selected === 'doublyAddFirst'
          ? 'void'
          : selected === 'doublySize'
            ? 'int'
            : this.language() === 'c'
              ? 'bool'
              : 'boolean';
      return this.language() === 'pseudo'
        ? name
        : this.language() === 'java'
          ? `public ${type} ${name}`
          : `${type} dll_${name}`;
    }
    if (selected === 'dnode')
      return this.language() === 'c'
        ? 'DNode *newDNode'
        : this.language() === 'pseudo'
          ? 'NEW DNode'
          : 'new DNode<String>';
    if (selected === 'node')
      return this.language() === 'c'
        ? 'Node *newNode'
        : this.language() === 'pseudo'
          ? 'NEW Node'
          : 'new Node<String>';
    if (this.language() === 'pseudo') return selected;
    const type = returnTypeFor(selected, this.language());
    return this.language() === 'java' ? `public ${type} ${selected}` : `${type} ll_${selected}`;
  });
  value = '';
  index = '';
  nodeValue = '42';
  // Null veya hazır komşu seçimi, constructor’a gerçek referans verilmesini öğretir.
  dnodePrev = 'null';
  dnodeNext = 'null';

  select(selection: Selection) {
    if (selection === this.selection()) return;
    const pending = !!this.player.trace() && !this.player.atEnd();
    this.player.cancelPending();
    // Yeni sahne önceki component’in hareket kilidini devralmaz.
    this.visualBusy.set(false);
    this.selection.set(selection);
    this.message.set('');
    this.notice.set(
      pending ? 'Önceki işlem iptal edildi; işlem öncesindeki liste geri yüklendi.' : '',
    );
  }

  run() {
    this.message.set('');
    this.notice.set('');
    const selection = this.selection();
    if (selection === 'dnode') {
      // Boş data beklenen kullanıcı hatasıdır; sahne değiştirilmez.
      if (!this.nodeValue.trim()) {
        this.message.set('DNode için bir data değeri gir.');
        return;
      }
      this.player.startDNode(this.nodeValue, this.dnodePrev !== 'null', this.dnodeNext !== 'null');
      this.player.play();
      return;
    }
    if (selection === 'node') {
      if (!this.nodeValue.trim()) {
        this.message.set('Node için bir data değeri gir.');
        return;
      }
      // Bağımsız önizleme Node’u için başlangıçta sonraki Node bulunmaz.
      this.node.set(new Node(this.nodeValue, null));
      return;
    }
    const info = this.info()!;
    if (info.value && !this.value.trim()) {
      this.message.set('value alanını doldur. Değerler String olarak işlenir.');
      return;
    }
    if (
      info.index &&
      (!/^\d+$/.test(this.index.trim()) || !Number.isSafeInteger(Number(this.index)))
    ) {
      this.message.set('index için 0 veya daha büyük bir tam sayı gir.');
      return;
    }
    if (isDoubly(selection)) {
      // Mevcut form doğrulamasından sonra yalnız Doubly listesi çalıştırılır.
      this.player.startDoubly(selection, { value: this.value });
      this.player.play();
      return;
    }
    this.player.start(selection, {
      ...(info.value ? { value: this.value } : {}),
      ...(info.index ? { index: Number(this.index) } : {}),
    });
    this.player.play();
  }

  // Root içindeki gerçek butonlar, klavye için de aynı disabled kurallarını uygular.
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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
      return;
    // Input, slider, düzenlenebilir alan ve panel ayraçları kendi klavye davranışını korur.
    const target = event.target instanceof Element ? event.target : null;
    if (
      target?.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="separator"], [role="slider"]',
      )
    )
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
    if (!label) return;
    // Devre dışı eylem klavyeden de çalışmaz; animasyonun ara adımları korunur.
    const button = this.host.nativeElement.querySelector<HTMLButtonElement>(
      `.playback button[aria-label="${label}"]`,
    );
    if (!button || button.disabled) return;
    // Geçerli kısayolda sayfa kaydırmasını önleyip mevcut click işleyicisini kullanırız.
    event.preventDefault();
    button.click();
  }

  next() {
    this.player.pause();
    this.player.next();
  }
  changeSpeed(event: Event) {
    this.player.setSpeed(Number((event.target as HTMLInputElement).value));
  }
  ngOnDestroy() {
    this.player.pause();
    this.removeResizeListener();
  }
}
