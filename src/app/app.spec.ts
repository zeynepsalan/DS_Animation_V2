import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { By } from '@angular/platform-browser';
import { Visualization, SCENE_MOTION_ENABLED } from './components/visualization';

describe('Çalışma ekranı', () => {
  // Template testleri deterministik kalır; hareket geometrisi ayrı testlerde örneklenir.
  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: SCENE_MOTION_ENABLED, useValue: false }] }));
  it('Node açılışını ve parametre doğrulamasını gerçek template ile gösterir', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.breadcrumb')?.textContent).toContain('Node');
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
});
