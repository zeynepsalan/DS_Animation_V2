# DEC-0030 — owner-push-deploy

Durum: Kabul edilmiş kaynak süreç hükmü. Kapsam: bu proje; tekrar kullanılabilirliğe uygundur. Özgün karar tarihi: bilinmiyor; konsolidasyon/kayıt: 2026-11-14.

Kaynak: [özgün süreç belgesi](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/ORCHESTRATION.source.md). Bağlam: kullanıcı ile yönetici/worker çalışma düzeni.

Karar: Ürün, mimari, kapsam ve gelecekte bütçe kararı kullanıcıya aittir. Yönetici anlamlı doğrulanmış değişiklik için ilgili dosyalarla normal GitHub push kararı verebilir; production deploy için ayrı kullanıcı onayı gerekir ([DEC-0035](../README.md#dec-0035)).

Gerekçe: kaynakta ayrıca belirtilmediyse bilinmiyor. Yerine geçen: yalnız önceki açık deploy sorusu [DEC-0035](../README.md#dec-0035) ile karara bağlandı; diğer hükümler korunur. Uygulama ve doğrulama: [güncel durum](../../ORCHESTRATION/context/CURRENT.md); kabul edilmesi, otomatik uygulama veya test edildiği anlamına gelmez.

## Kaynak ayrıntısı

- Cost, token tüketimidir. Hız hedefi veya mevcut sert token/cost sınırı yoktur; kalite önceliklidir. Gereksiz worker açma, tüm sohbeti her worker'a aktarma, tekrarlı araştırma ve test ile gereksiz rapor azaltılır; kısalık uğruna kalite düşürülmez. Ürün kalitesi toplam token karşılığıyla değerlendirilir; ölçüm yoksa tasarruf yüzdesi veya token miktarı uydurulmaz. Ürün ve mimari kararları, kapsam değişiklikleri ve ileride bir bütçe tanımlanırsa onu aşma kararı kullanıcıdadır.

- Yönetici kayda değer ve doğrulanmış bir değişiklik için kullanıcının GitHub hesabı üzerinden otomatik normal push kararı verebilir; Git icrasını worker'a devredebilir. Push yalnız ilgili değişiklikleri içerir, kullanıcının ilgisiz işleri dahil edilmez. Her push için yeniden onay istenmez. Production deploy ayrı bir karardır; GitHub push yetkisi deploy onayı değildir.

- Production deploy sorusunda kullanıcı terimin açıklamasını istedi; karar açık kalır.

İlgili sonraki kayıt: [DEC-0035](../README.md#dec-0035). Yalnız deploy sorusunun açık olması yerini ayrı onay kuralına bıraktı.
