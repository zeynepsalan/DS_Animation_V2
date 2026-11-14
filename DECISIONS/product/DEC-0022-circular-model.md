# DEC-0022 — 2026-11-11 — Circular Linkedlist kararı

Durum: Kaynakta kayıtlı karar ve tarihsel bağlam; açık sorular karar değildir. Kapsam: bu proje.

Kaynak tarihi yukarıda belirtilmiştir; konsolidasyon tarihi önceki kararların özgün tarihi sayılmaz. Kaynak: [eski karar kaydı](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/docs/DECISIONS.source.md).

## 2026-11-11 — Circular Linkedlist kararı

Kullanıcı Circular yapının tek yönlü olmasını, Singly ve Doubly klasörlerinin hemen altında gösterilmesini ve head yerine yalnız tail tutulmasını istedi. CircularLinkedlist<T> bağımsız Node<T>(data, next) kullanır; ilk Node tail.next ile bulunur. Boşta tail=null; tek Node'da tail.next=tail; dolu halkada son next ilk Node'a döner. Aynı 18 liste işlemi ve ortak playback kullanılır. Array hâlâ sonraki aşamadır ve sabit kapasiteli olacaktır.

Kapsam: bu proje. Gerekçe: kaynakta belirtilenler dışında bilinmiyor. Uygulama ve doğrulama: kaynak kayıtları ve [doğrulama kaydı](../../docs/VALIDATION.md); kararın kabulü uygulama veya test kanıtı değildir.
