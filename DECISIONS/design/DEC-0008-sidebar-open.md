# DEC-0008 — sidebar-open

Durum: Tarihsel / kısmen geçerli. Kaynak: [DECISIONS eski kayıt](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/docs/DECISIONS.source.md). Aşağıdaki tarih kaynakta verilen tarihtir; kabul, uygulama ve test ayrı olaylardır.

İlgili sonraki kayıt: [DEC-0010](../README.md#dec-0010). Yerine geçme yalnız ilgili hüküm içindir; diğer ayrıntılar korunur.

- 2026-10-13: Kullanıcı Sidebar kararı: açık durumda ayrı sol şerit/boşluk yok; ds↗ logo ve DATA STRUCTURES aynı satırda, menu toggle ve search ikinci satırda. Kapalı durumda yalnız tekrar açma şeridi korunur. Araya ekleme bağlantıları karşılıklı ayrı koridorlardan geçer; dönüşler quadratic SVG eğrisiyle 24px radius (kısa segmentte güvenli sınır) kullanır. previous etiketi ok koridorundan çıkarıldı; üç ortak referans ayrı sol satırlara alınır. Fonksiyonlar ve RAF motoru korunur.

## Kısmi değişim

Açık panelde rail olmaması DEC-0010 ile geçici olarak değişti; DEC-0011 ile yeniden kabul edildi. Ok geometrisi hükümleri bağımsızdır.

Kapsam: bu proje. Gerekçe: kaynakta belirtilenler dışında bilinmiyor. Uygulama ve doğrulama: kaynak kayıtları ve [doğrulama kaydı](../../docs/VALIDATION.md); kararın kabulü uygulama veya test kanıtı değildir.

Yerine aldığı ilgili hüküm: [DEC-0007](../README.md#dec-0007); yalnız ilgili hüküm değişmiştir.
