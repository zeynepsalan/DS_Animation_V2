import { Injectable, computed, signal } from '@angular/core';
export const SIDEBAR_MIN = 180;
export const CODE_MIN = 320;
export const VISUAL_MIN = 360;
const GUTTER = 10;

/** Boyutları tek yerde sınırlarız; pointer ve klavye aynı minimum kurallarını kullanır. */
@Injectable({ providedIn: 'root' })
export class PanelLayout {
  readonly sidebarOpen = signal(true);
  readonly sidebarWidth = signal(228);
  readonly codeWidth = signal(0);
  readonly viewportWidth = signal(1440);
  readonly compact = computed(() => this.viewportWidth() < CODE_MIN + VISUAL_MIN + 80);
  readonly effectiveSidebarWidth = computed(() => this.sidebarOpen() ? this.sidebarWidth() : 0);
  setViewport(width: number) {
    this.viewportWidth.set(width);
    if (width < SIDEBAR_MIN + CODE_MIN + VISUAL_MIN + 70) this.sidebarOpen.set(false);
  }
  toggleSidebar() { this.sidebarOpen.update(value => !value); }
  resizeSidebar(width: number) {
    if (width < SIDEBAR_MIN) { this.sidebarOpen.set(false); return; }
    const max = Math.max(SIDEBAR_MIN, this.viewportWidth() - CODE_MIN - VISUAL_MIN - 70);
    this.sidebarWidth.set(Math.min(max, width)); this.sidebarOpen.set(true);
  }
  resizeCode(width: number, available: number) {
    this.codeWidth.set(Math.max(CODE_MIN, Math.min(available - GUTTER - VISUAL_MIN, width)));
  }
}
