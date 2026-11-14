# DEC-0013 — doubly-mvp

Durum: Tarihsel / kısmen geçerli. Kaynak: [DECISIONS eski kayıt](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/docs/DECISIONS.source.md). Aşağıdaki tarih kaynakta verilen tarihtir; kabul, uygulama ve test ayrı olaylardır.

İlgili sonraki kayıt: [DEC-0020](../README.md#dec-0020). Yerine geçme yalnız ilgili hüküm içindir; diğer ayrıntılar korunur.

- 2026-10-14: Kullanıcı mevcut görünüm/çalışma prensibini MVP için uygun buldu; sıradaki veri yapısı Doubly Linkedlist olarak belirlendi. Mevcut görünüm ve playback davranışı temel alınacak; Java/C/Pseudocode ve eş zamanlı prev/next görselleştirmesi gereksinimi yeni yapıya da uygulanır. Node tasarımı (ayrı DoublyNode veya ortak Node.prev) ve Reverse Traversal kapsamı kullanıcıya soruldu; yanıt bekleniyor, onaylanmış karar değildir.

## Kısmi değişim

Doubly sonraki sıra ve açık Node/Reverse soruları daha sonraki kapsam kararlarıyla netleşti; MVP temel görünüm ve playback ilişkisi korunur.

Kapsam: bu proje. Gerekçe: kaynakta belirtilenler dışında bilinmiyor. Uygulama ve doğrulama: kaynak kayıtları ve [doğrulama kaydı](../../docs/VALIDATION.md); kararın kabulü uygulama veya test kanıtı değildir.

Açık Node ve Reverse Traversal soruları daha sonra karara bağlandı: [DEC-0014](../README.md#dec-0014), [DEC-0020](../README.md#dec-0020).
