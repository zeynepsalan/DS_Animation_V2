# DEC-0033 — manager-reporting

Durum: Kabul edilmiş kaynak süreç hükmü. Kapsam: bu proje; tekrar kullanılabilirliğe uygundur. Özgün karar tarihi: bilinmiyor; konsolidasyon/kayıt: 2026-11-14.

Kaynak: [özgün süreç belgesi](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/ORCHESTRATION.source.md). Bağlam: kullanıcı ile yönetici/worker çalışma düzeni.

Karar: Yönetici her kullanıcıya yönelik ara ve final mesajının sonunda gerçek Worker | Görev | Model | Durum tablosu sunar.

Gerekçe: kaynakta ayrıca belirtilmediyse bilinmiyor. Yerine aldığı / geçen: kaynakta belirtilmedi. Uygulama ve doğrulama: [güncel durum](../../ORCHESTRATION/context/CURRENT.md); kabul edilmesi, otomatik uygulama veya test edildiği anlamına gelmez.

## Kaynak ayrıntısı

- Yönetici, kullanıcıya yönelik her commentary/ara durum ve final mesajının en sonunda doğrudan sohbet içinde `Worker | Görev | Model | Durum` sütunlarıyla tablo gösterir. Bu rapor için sırf tablo göstermek amacıyla ayrı Canvas açılmaz. Gerçek worker adı veya kimliği, bu görevde yaptığı iş, gerçekten kullanılan model ve gerçek durum yazılır; görevlendirilmemiş worker başlatılmış gösterilmez ve model örneklerinden kimlik tahmin edilmez. Ara mesajda o ana kadar bu görevde görevlendirilenler, finalde görevde çalışan worker'lar sonuç durumlarıyla listelenir. Worker çalıştırılmadıysa `— | Worker çalıştırılmadı | — | —` gibi dürüst bir satır kullanılır. Tablo operasyonel gözlemdir; otomasyonun tüm sistemde canlı kurulu olduğu anlamına gelmez.
