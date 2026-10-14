import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { Sidebar } from './components/sidebar';
import { By } from '@angular/platform-browser';
import { Visualization, SCENE_MOTION_ENABLED } from './components/visualization';

describe('Çalışma ekranı', () => {
  // Template testleri deterministik kalır; hareket geometrisi ayrı testlerde örneklenir.
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SCENE_MOTION_ENABLED, useValue: false }],
    }),
  );
  it('açık Sidebar yanında şerit oluşturmaz ve kapalıyken açma kontrolünü korur', async () => {
    // Açık durumda logo ve kontrol yalnız Sidebar içinde bulunur.
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.closed-rail')).toBeNull();
    root.querySelector<HTMLButtonElement>('app-sidebar .sidebar-toggle')!.click();
    await fixture.whenStable();
    // Kapalı durumda erişilebilir açma kontrolü logo altındaki dar şeritte kalır.
    const openButton = root.querySelector<HTMLButtonElement>('.closed-rail .sidebar-toggle')!;
    expect(openButton.getAttribute('aria-expanded')).toBe('false');
    openButton.click();
    await fixture.whenStable();
    // Tekrar açılınca boş sol sütun kaldırılır ve iç kontrol kullanılabilir kalır.
    expect(root.querySelector('.closed-rail')).toBeNull();
    expect(root.querySelector('app-sidebar .sidebar-toggle')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    fixture.destroy();
  });
  it('oynatma kısayolları adımları yönetir ve parametre yazımını korur', async () => {
    // Gerçek butonların guard kurallarıyla aynı klavye yolunu çalıştırırız.
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.select('addFirst');
    app.value = 'A';
    app.run();
    app.player.pause();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    // Sağ ok bir sonraki adıma, sol ok önceki adıma döner.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(app.player.cursor()).toBe(1);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(app.player.cursor()).toBe(0);
    // Input üzerinde yazılan R ve ok tuşları liste oynatmasını etkilemez.
    const input = root.querySelector('input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(app.player.cursor()).toBe(0);
    // Space duraklatma/oynatma durumunu değiştirir; R başlangıca döner.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await fixture.whenStable();
    expect(app.player.playing()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await fixture.whenStable();
    expect(app.player.playing()).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true }));
    await fixture.whenStable();
    expect(app.player.cursor()).toBe(0);
    expect(root.querySelector('[aria-label="Next Step"]')?.getAttribute('title')).toContain('→');
    fixture.destroy();
  });
  it('DNode constructor atamalarını ayrı kod satırlarında ve ayrı sahnede gösterir', async () => {
    // Constructor kullanıcı parametrelerinden hazırlanır; ortak player adımları yönetir.
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.select('dnode');
    app.nodeValue = 'X';
    app.dnodePrev = 'previous';
    app.dnodeNext = 'next';
    app.run();
    app.player.pause();
    // prev atamasında next henüz null olmalı ve yalnız prev satırı highlight edilmelidir.
    for (let i = 0; i < 3; i++) app.player.next();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.highlighted')?.textContent).toContain('this.prev = prev;');
    expect(root.querySelectorAll('.highlighted')).toHaveLength(1);
    expect(root.querySelectorAll('app-dnode-visualization .node-shape')).toHaveLength(3);
    expect(root.querySelector('[data-dnode="center"]')?.textContent).toContain('∅');
    // Sonraki adım next satırına geçerken eski Singly liste korunur.
    app.player.next();
    await fixture.whenStable();
    expect(root.querySelector('.highlighted')?.textContent).toContain('this.next = next;');
    expect(app.player.list().size).toBe(0);
    fixture.destroy();
  });
  it('Doubly addFirst gerçek formdan çalışır ve head.prev satırına eşleşir', async () => {
    // Her listede kendi kalıcı state ve sahne bulunmalıdır.
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.select('doublyAddFirst');
    app.value = 'A';
    app.run();
    app.player.pause();
    while (!app.player.atEnd()) app.player.next();
    app.value = 'B';
    app.run();
    app.player.pause();
    for (let i = 0; i < 4; i++) app.player.next();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.highlighted')?.textContent).toContain('head.prev = node;');
    expect(root.querySelectorAll('.highlighted')).toHaveLength(1);
    expect(root.querySelectorAll('app-doubly-visualization .node-shape')).toHaveLength(2);
    expect(
      root.querySelector('app-doubly-visualization .canvas-scroll')?.classList.contains('auto-fit'),
    ).toBe(true);
    expect(root.querySelector('.signature-prefix')?.textContent).toContain('public void addFirst');
    expect(root.querySelector('.source-download')?.getAttribute('href')).toContain(
      'DoublyLinkedlist.java',
    );
    app.player.reset();
    await fixture.whenStable();
    expect(app.player.doublyList().size).toBe(1);
    expect(app.player.list().size).toBe(0);
    fixture.destroy();
  });
  it('Node açılışını ve parametre doğrulamasını gerçek template ile gösterir', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.sidebar-brand')).not.toBeNull();
    expect(root.querySelector('header')).toBeNull();
    expect(root.querySelectorAll('app-sidebar button').length).toBeGreaterThan(18);
    const app = fixture.componentInstance;
    app.select('insertAt');
    app.value = 'merhaba';
    app.index = '-1';
    app.run();
    await fixture.whenStable();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('tam sayı');
    expect(app.player.trace()).toBeNull();
    app.index = '0';
    app.run();
    app.player.pause();
    while (!app.player.atEnd()) app.player.next();
    await fixture.whenStable();
    expect(app.player.list().nodes[0].data).toBe('merhaba');
    expect(root.querySelector('.node-value')?.textContent?.trim()).toBe('merhaba');
    expect(root.querySelectorAll('.highlighted').length).toBe(1);
    fixture.destroy();
  });
  it('ok hedefi değiştiğinde SVG öğesini korur ve zoom listeyi değiştirmez', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.select('addFirst');
    app.value = 'A';
    app.run();
    app.player.pause();
    while (!app.player.atEnd()) app.player.next();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const source = app.player.list().head!;
    const arrow = root.querySelector(`.pointer-path[data-source="${source}"]`);
    expect(arrow?.getAttribute('data-target')).toBe('null');
    app.select('addLast');
    app.value = 'B';
    app.run();
    app.player.pause();
    while (!app.player.atEnd()) app.player.next();
    await fixture.whenStable();
    expect(root.querySelector(`.pointer-path[data-source="${source}"]`)).toBe(arrow);
    expect(arrow?.getAttribute('data-target')).not.toBe('null');
    const baseline = app.player.list();
    const visual = fixture.debugElement.query(By.directive(Visualization))
      .componentInstance as Visualization;
    const oldZoom = visual.zoom();
    visual.zoomIn();
    expect(visual.zoom()).toBeGreaterThan(oldZoom);
    visual.zoomOut();
    visual.fit();
    expect(app.player.list()).toEqual(baseline);
    expect(root.querySelector('.editor-column .function-signature')?.textContent).toContain(
      'public void addLast',
    );
    fixture.destroy();
  });
  it('Explorer araması listeyi ve seçili işlemi değiştirmeden dosyaları filtreler', async () => {
    // Gerçek component ağacı üzerinden arama ve controls yerleşimi kontrol edilir.
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    // Paylaşılan listeye bir eleman ekleyip işlemi tamamlarız.
    app.select('addFirst');
    app.value = 'metin';
    app.run();
    app.player.pause();
    while (!app.player.atEnd()) app.player.next();
    await fixture.whenStable();
    // Liste snapshot'ını saklamak aramanın algoritma state'ine dokunmadığını doğrular.
    const baseline = app.player.list();
    // Input metni seçildiğinde native select olayı dış component'in işlem seçimini tetiklememelidir.
    const searchInput = (fixture.nativeElement as HTMLElement).querySelector(
      '.sidebar-search input',
    )!;
    searchInput.dispatchEvent(new Event('select', { bubbles: true }));
    await fixture.whenStable();
    expect(app.selection()).toBe('addFirst');
    const sidebar = fixture.debugElement.query(By.directive(Sidebar)).componentInstance as Sidebar;
    // Büyük harf ve çevre boşlukları normalizasyon ile arama sonucunu etkilemez.
    sidebar.query.set(' REMOVE ');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('app-sidebar .file').length).toBe(4);
    expect(app.selection()).toBe('addFirst');
    expect(app.player.list()).toBe(baseline);
    // Playback aynı method kartında bulunur; görsel panelde ikinci kopyası yoktur.
    expect(root.querySelector('.operation-form .playback')).not.toBeNull();
    expect(root.querySelector('.visual-panel .playback')).toBeNull();
    // Eşleşmeyen sorgu hata atmadan boş sonuç mesajı gösterir.
    sidebar.query.set('bulunmayan');
    await fixture.whenStable();
    expect(root.querySelector('.search-empty')?.textContent).toContain('Eşleşen fonksiyon yok');
    fixture.destroy();
  });
});
