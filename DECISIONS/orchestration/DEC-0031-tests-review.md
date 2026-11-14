# DEC-0031 — tests-review

Durum: Kabul edilmiş kaynak süreç hükmü. Kapsam: bu proje; tekrar kullanılabilirliğe uygundur. Özgün karar tarihi: bilinmiyor; konsolidasyon/kayıt: 2026-11-14.

Kaynak: [özgün süreç belgesi](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/ORCHESTRATION.source.md). Bağlam: kullanıcı ile yönetici/worker çalışma düzeni.

Karar: Riskli veya işlevsel grup tamamlanınca uygun testler yapılır; uygulayıcı yapabilir. Her anlamlı grup bağımsız incelenir; inceleme test değildir. Yalnız belge değişikliğinde uygulama testi gerekmez.

Gerekçe: kaynakta ayrıca belirtilmediyse bilinmiyor. Yerine aldığı / geçen: kaynakta belirtilmedi. Uygulama ve doğrulama: [güncel durum](../../ORCHESTRATION/context/CURRENT.md); kabul edilmesi, otomatik uygulama veya test edildiği anlamına gelmez.

## Kaynak ayrıntısı

- Her kod değişikliği için ayrı test worker'ı zorunlu değildir. Fonksiyonel veya riskli değişikliğin bütünlüğü tamamlandığında uygun testler yapılır; uygulayıcı worker bunları çalıştırabilir. Her anlamlı değişiklik grubu tamamlandığında uygulayıcıdan bağımsız inceleme yapılır. İnceleme ve test farklıdır; inceleme onayı testlerin çalıştığını kanıtlamaz. Ürün kodu değişmeyen dokümantasyon görevinde uygulama testleri gerekmez.
