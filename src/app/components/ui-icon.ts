import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// İkon adlarını sınırlayarak template içinde yanlış isim yazılmasını TypeScript ile yakalarız.
export type IconName =
  | 'menu'
  | 'folder'
  | 'file'
  | 'code'
  | 'search'
  | 'close'
  | 'play'
  | 'pause'
  | 'previous'
  | 'next'
  | 'reset'
  | 'plus'
  | 'minus'
  | 'fit'
  | 'chevron';

// Yerel SVG çizgileri aynı 24×24 koordinat sistemini kullanır; harici ikon paketi gerekmez.
const PATHS: Record<IconName, string> = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  folder: 'M3 7V5h6l2 2h10v12H3Z',
  file: 'M14 3H5v18h14V8ZM14 3v5h5',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  close: 'm6 6 12 12M6 18 18 6',
  play: 'm8 4 12 8-12 8Z',
  pause: 'M8 4v16M16 4v16',
  previous: 'M5 4v16m14-16-11 8 11 8Z',
  next: 'M19 4v16M5 4l11 8-11 8Z',
  reset: 'M3 11a9 9 0 1 1 2 7M3 4v7h7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  fit: 'M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6',
  chevron: 'm9 5 7 7-7 7',
};

// İkon dekoratiftir; erişilebilir eylem adı ikonu taşıyan button üzerinde tanımlanır.
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path()" /></svg>',
})
export class UiIcon {
  // Gerekli input, her ikon kullanımında bir isim verilmesini zorunlu kılar.
  readonly name = input.required<IconName>();
  // İsim değiştiğinde ilgili çizim yolunu yeniden hesaplar; gereksiz state saklamaz.
  readonly path = computed(() => PATHS[this.name()]);
}
