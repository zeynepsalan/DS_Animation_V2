# DEC-0038 — Temel yapılar ve arayüzler

Durum: Kabul edilmiş kullanıcı yönü. Tarih: 2026-11-16. Kapsam: bu proje. Kaynak: kullanıcının bu oturumdaki Array ve Linked List temel yapıları, Node türleri, liste türleri ve arayüzler altındaki temsiller açıklaması.

Karar: Array ve Linked List iki temel yapıdır. Linked List bugün iki Node türü (`Node`, `DNode`) ve üç liste türü (Singly, Doubly, Circular) içerir; genişletilebilir. Sonrasında farklı arayüzler altında Linked List ve sabit kapasiteli ArrayList implementasyonları geliştirilecektir. ArrayList burada Java'nın otomatik büyüyen `ArrayList` sınıfını ifade etmez. Array henüz uygulanmadı. [DEC-0037](DEC-0037-array-representation.md) gerçek temsilin gösterimle eşleşmesi sınırını korur.

Arayüz/ADT davranış sözleşmesi, gerçek Array veya Linked List tabanlı implementasyon, temel temsil ve türe özgü state/trace/görünüm sorumlulukları ayrıdır. Composition/delegation somut tasarım önerisidir; zorunlu evrensel üst sınıf kararı değildir. Bu karar bütün PDF kapsamını, sıra veya ayrıntılı API'yi onaylamaz. Gerekçe: kullanıcı tarafından ayrıca belirtilmedi. Yerine aldığı kayıt yoktur. Uygulama ve doğrulama: mimari yön kaydıdır; yeni ürün kodu uygulanmadı. [Görev](../../ORCHESTRATION/tasks/TASK-0004-architecture-revision.md).
