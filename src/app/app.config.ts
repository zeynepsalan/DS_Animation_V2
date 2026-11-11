// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

// Şimdilik tek çalışma ekranı var; router veya backend eklemek gerekmiyor.
export const appConfig: ApplicationConfig = {
  // Angular’ın uygulama veya test boyunca oluşturup paylaşacağı servisleri tanımlar.
  providers: [provideBrowserGlobalErrorListeners()],
};
