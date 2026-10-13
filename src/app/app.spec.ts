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
