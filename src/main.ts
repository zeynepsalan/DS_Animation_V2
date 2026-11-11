// Bu dosyanın kullandığı model veya yardımcı, ayrı modülden alınır; aynı mantık tekrar yazılmaz.
import { bootstrapApplication } from '@angular/platform-browser';
// Bu dosyanın kullandığı model veya yardımcı, ayrı modülden alınır; aynı mantık tekrar yazılmaz.
import { appConfig } from './app/app.config';
// Bu dosyanın kullandığı model veya yardımcı, ayrı modülden alınır; aynı mantık tekrar yazılmaz.
import { App } from './app/app';

// Angular’ı App kök bileşeniyle başlatır; başlangıç başarısızsa hata tarayıcı konsoluna yazılır.
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
