# DEC-0037 — Array tabanlı gerçek temsil

Durum: Kabul edilmiş kullanıcı sınırı. Tarih: 2026-11-16. Kapsam: bu proje; Array tabanlı gösterim ve gelecekte seçilen Array tabanlı temsiller. Kaynak: kullanıcının bu oturumda Array hücrelerinin Node gibi kaydedilmesini sorgulaması ve Array template'i için Array tabanlı yapı istemesi.

Karar: Array tabanlı gösterim, gerçek Array/cell ve indeks durumunu kullanır; Node, next veya prev içeren linked-list snapshot'ına zorlanmaz. Bu yalnız görsel biçim değildir: seçilen Array tabanlı Stack/Queue gibi gelecekteki temsillerin gerçek modeli de gösterilen Array temsiliyle eşleşir; Linked List temsili ayrı kalır. Bu, [proje kuralındaki](../../ORCHESTRATION/context/PROJECT.md) Node gerektirmeyen yapıları Node'a zorlamama ilkesini netleştirir.

Array henüz uygulanmamıştır. Mevcut `ListSnapshot` ve Node alanlarına ilişkin tespit linked-list altyapısını anlatır; Array hücrelerinin mevcut uygulamada Node olarak kaydedildiği anlamına gelmez. Gerekçe: kullanıcının gerçek temsil ile gösterimin uyumlu olmasını istemesi. Yerine aldığı karar yoktur; bu sınır tüm mimariyi, trace API'sini, işlem kapsamını, stratejiyi veya bütün gelecekteki ADT'leri onaylamaz. Uygulama ve doğrulama: belge kaydıdır; ürün kodu değiştirilmedi. [Görev](../../ORCHESTRATION/tasks/TASK-0003-project-planning.md).
