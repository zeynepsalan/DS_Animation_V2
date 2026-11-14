# DEC-0032 — decision-preservation

Durum: Kabul edilmiş kaynak süreç hükmü. Kapsam: bu proje; tekrar kullanılabilirliğe uygundur. Özgün karar tarihi: bilinmiyor; konsolidasyon/kayıt: 2026-11-14.

Kaynak: [özgün süreç belgesi](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/ORCHESTRATION.source.md). Bağlam: kullanıcı ile yönetici/worker çalışma düzeni.

Karar: Yeni kararlar tarih, kapsam, kaynak, biliniyorsa gerekçe ve supersession ile kanonik kayda alınır. Bilinmeyen tarih uydurulmaz; açık soru veya öneri kabul edilmiş gibi kaydedilmez.

Gerekçe: kaynakta ayrıca belirtilmediyse bilinmiyor. Yerine aldığı / geçen: kaynakta belirtilmedi. Uygulama ve doğrulama: [güncel durum](../../ORCHESTRATION/context/CURRENT.md); kabul edilmesi, otomatik uygulama veya test edildiği anlamına gelmez.

## Kaynak ayrıntısı

- Kullanıcının kararlarını kalıcı kayda geçirmek yöneticinin zorunlu görevidir; yalnız sohbet hafızasına güvenilmez. Yeni veya değişen kararlar ilgili kanonik belgeye tarih ve kapsamla, kullanıcı belirtmişse gerekçesiyle ve yerini aldığı kararla ilişkisiyle işlenir; sonra özeti ve bağlantısı raporlanır. Bilinmeyen özgün tarih veya gerekçe uydurulmaz, eski karar sessizce silinmez. Öneri ve açık konular onaylı karar gibi kaydedilmez; belgelenmiş karar tekrar sorulmaz. Görev devrinde ve yeni sohbette bu kayıtlar okunur. Yeniden kullanılabilir orkestrasyon kararları burada, projeye özgü kararlar `docs/DECISIONS.md` gibi projenin kanonik karar kaydında tutulur; genel kullanıcı tercihleri proje mimarisi gibi yazılmaz. Bu kayıt şu anda yalnız bu repodadır; global kurulum yapılmış değildir.
