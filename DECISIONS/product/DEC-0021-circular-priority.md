# DEC-0021 — 2026-11-10 — Circular önceliği ve Array kapasitesi

Durum: Kaynakta kayıtlı karar ve tarihsel bağlam; açık sorular karar değildir. Kapsam: bu proje.

Kaynak tarihi yukarıda belirtilmiştir; konsolidasyon tarihi önceki kararların özgün tarihi sayılmaz. Kaynak: [eski karar kaydı](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/docs/DECISIONS.source.md).

## 2026-11-10 — Circular önceliği ve Array kapasitesi

Kullanıcı geliştirme sırasını değiştirdi: önce Circular Linkedlist, ardından sabit kapasiteli Array uygulanacak. Array otomatik büyümeyecek. Bu temellerin ardından ilerideki yapıların Array ve Linked List tabanlı implementasyonları ele alınacak. Circular yapının tek/çift yön seçimi kullanıcıya soruldu; henüz karar değildir. Reverse Traversal kapsam dışı kalır.

Kapsam: bu proje. Gerekçe: kaynakta belirtilenler dışında bilinmiyor. Uygulama ve doğrulama: kaynak kayıtları ve [doğrulama kaydı](../../docs/VALIDATION.md); kararın kabulü uygulama veya test kanıtı değildir.

Kaynakta açık olan Circular yönü daha sonra tek yönlü olarak belirlendi: [DEC-0022](../README.md#dec-0022).
