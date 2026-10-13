import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

// Şimdilik tek çalışma ekranı var; router veya backend eklemek gerekmiyor.
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
