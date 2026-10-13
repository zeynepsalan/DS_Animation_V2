import { Injectable, computed, signal } from '@angular/core';

// Paneller, kodu ve çizimi okunamayacak kadar daraltmaya izin vermez.
export const SIDEBAR_MIN = 180;
// Önceki masaüstü üst sınırının yaklaşık üçte biriyle Explorer büyümesi sınırlandırılır.
export const SIDEBAR_MAX = 240;
export const CODE_MIN = 320;
export const VISUAL_MIN = 360;
// Kapalı Sidebar için referans tasarımdaki küçük Explorer şeridi korunur.
const RAIL_WIDTH = 48;
// Ayraç ve dış padding, viewport hesabında kullanılabilir alandan çıkarılır.
const GUTTER = 10;
const WORKBENCH_PADDING = 24;

/** Pointer ve klavye aynı sınırları kullanır; panel boyutları liste durumunu değiştirmez. */
@Injectable({ providedIn: 'root' })
export class PanelLayout {
  // Açılma durumu ile son açık genişlik ayrı tutulur; tekrar açınca kullanıcı ölçüsü korunur.
  readonly sidebarOpen = signal(true);
  readonly sidebarWidth = signal(200);
  // Sıfır genişlik, başlangıçta CSS'in esnek kolon oranını kullanması anlamına gelir.
  readonly codeWidth = signal(0);
  // İlk render gerçek ekran genişliğiyle bu başlangıç değerini günceller.
  readonly viewportWidth = signal(1440);
  // İki çalışma paneli yan yana sığmazsa üst üste yerleştirilir.
  readonly compact = computed(() => this.viewportWidth() < RAIL_WIDTH + CODE_MIN + VISUAL_MIN + 80);
  // Üç sütun sığmadığında Sidebar üst katman olur; iki çalışma paneli okunur kalır.
  readonly overlay = computed(
    () => this.viewportWidth() < RAIL_WIDTH + SIDEBAR_MIN + CODE_MIN + VISUAL_MIN + 70,
  );
  readonly effectiveSidebarWidth = computed(() => {
    // Telefon görünümündeki Sidebar katmandır; grid genişliği tüketmez.
    if (this.compact()) return 0;
    // Orta genişlikte açık Explorer, kapalı rail genişliği üzerinde katman olarak gösterilir.
    if (this.overlay()) return 0;
    // Açık Sidebar ekranda kalan çalışma alanını koruyacak kadar sınırlandırılır.
    if (this.sidebarOpen()) return Math.min(this.sidebarWidth(), this.maximumSidebarWidth());
    // Kapalı masaüstü Sidebar yalnız Explorer ikonunu gösterir.
    return 0;
  });
  readonly effectiveCodeWidth = computed(() => {
    // Henüz sürüklenmemiş kod paneli esnek kalır.
    if (!this.codeWidth() || this.compact()) return 0;
    // Pencere veya Sidebar değişince önceki genişlik yeni kullanılabilir alana sığdırılır.
    const available =
      this.viewportWidth() -
      (this.sidebarOpen() ? 0 : RAIL_WIDTH) -
      this.effectiveSidebarWidth() -
      GUTTER * 2 -
      WORKBENCH_PADDING;
    return Math.max(CODE_MIN, Math.min(this.codeWidth(), available - VISUAL_MIN));
  });
  private maximumSidebarWidth() {
    // İki çalışma panelinin minimumları, ayraçlar ve dış padding için yer ayırır.
    return Math.min(
      SIDEBAR_MAX,
      Math.max(
        SIDEBAR_MIN,
        this.viewportWidth() - CODE_MIN - VISUAL_MIN - GUTTER * 2 - WORKBENCH_PADDING,
      ),
    );
  }
  setViewport(width: number) {
    // Resize olayından gelen gerçek viewport genişliğini saklar.
    this.viewportWidth.set(width);
    // Sidebar dahil üç panel sığmadığında çalışma alanını genişletmek için Sidebar kapanır.
    if (width < RAIL_WIDTH + SIDEBAR_MIN + CODE_MIN + VISUAL_MIN + 70) this.sidebarOpen.set(false);
  }
  toggleSidebar() {
    // Toolbar ve Explorer rail aynı aç/kapat davranışını paylaşır.
    this.sidebarOpen.update((value) => !value);
  }
  resizeSidebar(width: number) {
    // Kullanıcı minimumdan küçük bir genişliğe sürüklerse Sidebar rail'e kapanır.
    if (width < SIDEBAR_MIN) {
      this.sidebarOpen.set(false);
      return;
    }
    // Üst sınır, Visualization ve Code minimumlarını korur.
    this.sidebarWidth.set(Math.min(this.maximumSidebarWidth(), width));
    // Geçerli açık genişliğe sürüklemek Sidebar'ı yeniden açar.
    this.sidebarOpen.set(true);
  }
  resizeCode(width: number, available: number) {
    // Sürükleme ve klavye ayarı gerçek panel alanına göre sınırlandırılır.
    this.codeWidth.set(Math.max(CODE_MIN, Math.min(available - GUTTER - VISUAL_MIN, width)));
  }
}
