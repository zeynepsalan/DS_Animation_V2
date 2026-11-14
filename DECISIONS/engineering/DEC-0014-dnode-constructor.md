# DEC-0014 — dnode-constructor

Durum: Kabul edilmiş kullanıcı kararı; güncel hükümler sonraki ilişkili kararlarla birlikte okunur. Kaynak: [DECISIONS eski kayıt](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/docs/DECISIONS.source.md). Aşağıdaki tarih kaynakta verilen tarihtir; kabul, uygulama ve test ayrı olaylardır.

- 2026-10-14: Kullanıcı Node kararını verdi: ayrı, veri yapılarından bağımsız DNode<T>; constructor parametre sırası DNode(data, prev, next). prev ve next açıkça null veya DNode referansı alır. TypeScript sınıfı src/app/core/dnode.ts olarak eklendi; id yalnız görsel takip için isteğe bağlı dördüncü parametredir. Reverse Traversal için yanıt henüz verilmedi.

Kapsam: bu proje. Gerekçe: kaynakta belirtilenler dışında bilinmiyor. Uygulama ve doğrulama: kaynak kayıtları ve [doğrulama kaydı](../../docs/VALIDATION.md); kararın kabulü uygulama veya test kanıtı değildir.

Kaynakta tarihsel olarak açık yazılan Reverse Traversal daha sonra kapsam dışı bırakıldı: [DEC-0020](../README.md#dec-0020).
