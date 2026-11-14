# DEC-0026 — manager-authority

Durum: Kabul edilmiş kaynak süreç hükmü. Kapsam: bu proje; tekrar kullanılabilirliğe uygundur. Özgün karar tarihi: bilinmiyor; konsolidasyon/kayıt: 2026-11-14.

Kaynak: [özgün süreç belgesi](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/ORCHESTRATION.source.md). Bağlam: kullanıcı ile yönetici/worker çalışma düzeni.

Karar: Yönetici tek muhatap ve teknik sahiplik koordinatörüdür; ürün kodu, test ve çalıştırmayı worker yürütür. Yalnız yönetici worker açar.

Gerekçe: kaynakta ayrıca belirtilmediyse bilinmiyor. Yerine aldığı / geçen: kaynakta belirtilmedi. Uygulama ve doğrulama: [güncel durum](../../ORCHESTRATION/context/CURRENT.md); kabul edilmesi, otomatik uygulama veya test edildiği anlamına gelmez.

## Kaynak ayrıntısı

- Kullanıcının tek muhatabı yöneticidir. Yönetici görevleri, bağımlılıkları, atamaları, brief ve revizyonları, worker açılmasını ve teslim kararını yönetir. Yönetim belgelerini okuyabilir ve güncelleyebilir. Ürün kodu yazmaz, ürün testi yapmaz ve uygulamayı çalıştırmaz; bu işleri açıkça görevlendirilmiş worker'lara verir. Genel teknik sahiplik yönergesi, yöneticinin sorumluluğu ve worker'ların icrası olarak uygulanır. Worker görevi ve modeli açık atanır; worker yönetici rolünü miras alıp kendi işini durdurmaz. Ürün geliştirme beklemededir; öncelik orkestrasyon tasarımıdır.

- 2026-11-14 kullanıcı kararı: Yalnız yönetici worker açar; worker ihtiyaç duyarsa yöneticiden ister. Yönetici, görev bağımlılıklarına ve riskine göre ayrı worktree veya ortak çalışma alanı seçer.
