# DEC-0028 — models

Durum: Kabul edilmiş kaynak süreç hükmü. Kapsam: bu proje; tekrar kullanılabilirliğe uygundur. Özgün karar tarihi: bilinmiyor; konsolidasyon/kayıt: 2026-11-14.

Kaynak: [özgün süreç belgesi](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/ORCHESTRATION.source.md). Bağlam: kullanıcı ile yönetici/worker çalışma düzeni.

Karar: Yalnız Codex worker havuzu kullanılır: gpt-6.1-sol, gpt-6.1-terra, gpt-6-luna. Görev ihtiyacına göre seçilir, sessiz fallback yapılmaz; sağlayıcı bağımsızlığı geleceğe yönelik hedeftir.

Gerekçe: kaynakta ayrıca belirtilmediyse bilinmiyor. Yerine aldığı / geçen: kaynakta belirtilmedi. Uygulama ve doğrulama: [güncel durum](../../ORCHESTRATION/context/CURRENT.md); kabul edilmesi, otomatik uygulama veya test edildiği anlamına gelmez.

## Kaynak ayrıntısı

- Şimdilik yalnız Codex worker'ları kullanılır. Süreç gelecekte sağlayıcı değişebilmesine elverişlidir. Bu karar önceki Roku/Claude yönergeleriyle çeliştiğinde geçerlidir; otomatik Claude çağrısı yapılmaz.

Aşağıdaki görev örnekleri modellerin yalnızca bu işleri yapabileceği anlamına gelmez; teknik performans/fiyat garantisi değildir. Esneklik görev dağılımı içindir; yönetici yalnız kullanıcının tanımladığı model seçenekleri arasında seçim yapar. Yeni model veya sağlayıcı ekleme kararı kullanıcıya aittir. Bir model birden çok alanda, aynı alanda birden çok model kullanılabilir. Tek görevin karmaşıklığı örnek rol etiketinden daha önemlidir.

- `gpt-6.1-sol`: karmaşık, uzun veya yoğun akıl yürütme isteyen kod; kalite kontrol, test ve detaylı araştırma.

- `gpt-6.1-terra`: proje beyni ve yönetimi; orta zorlukta kod, uzun raporlama, araştırma, işlerin birleştirilmesi ve iki worktree'nin entegrasyonu.

- `gpt-6-luna`: küçük ve kısa işler, rapor çıkarma/yazma ve özetleme.

Yetki ve kısıtların sahibi kullanıcıdır. Kullanıcının açık kısıtları aşılmaz; esnek seçeneklerde yönetici kalite/token dengesine göre seçim yapar. Model sessizce değiştirilmez; atama veya değişiklik gerekçesi kayda girer. Gerekli model erişilemiyorsa kısıt dışı sessiz fallback yapılmaz, yöneticiye bildirilir. Bu modeller mevcut collaboration aracında desteklenir; erişilebilirlik çalıştırma sırasında doğrulanır. Bu belge mevcut oturumun modelini değiştirmez.

Kullanıcının “imagen” ifadesi Codex'in resim üretme aracını (`image_gen`/`imagegen`) ifade eder; model veya worker değildir. Görseli yönetici değil görevlendirilmiş worker üretir. Görsel işini hangi metin worker modelinin koordine edeceği henüz atanmadı; gerektiğinde worker ilgili imagegen skill'ini okur.
