# DEC-0027 — worktree

Durum: Kabul edilmiş kaynak süreç hükmü. Kapsam: bu proje; tekrar kullanılabilirliğe uygundur. Özgün karar ve kayıt tarihi: 2026-11-14.

Kaynak: [özgün süreç belgesi](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/ORCHESTRATION.source.md). Bağlam: kullanıcı ile yönetici/worker çalışma düzeni.

Karar: Yönetici risk ve bağımlılığa göre ayrı worktree veya ortak alan seçer; tek dosyada tek yazar koordinasyonu uygulanır.

Gerekçe: kaynakta ayrıca belirtilmediyse bilinmiyor. Yerine aldığı / geçen: kaynakta belirtilmedi. Uygulama ve doğrulama: [güncel durum](../../ORCHESTRATION/context/CURRENT.md); kabul edilmesi, otomatik uygulama veya test edildiği anlamına gelmez.

## Kaynak ayrıntısı

- 2026-11-14 kullanıcı kararı: Yalnız yönetici worker açar; worker ihtiyaç duyarsa yöneticiden ister. Yönetici, görev bağımlılıklarına ve riskine göre ayrı worktree veya ortak çalışma alanı seçer.

- Brief formatı, görev durumları, dosya kilidi, eşzamanlı worker sayısı ve somut görev takibi altyapısı henüz kararlaştırılmamıştır. Bu konular için bir uygulama kurulduğu varsayılmaz.

İlgili sonraki kayıt: [DEC-0039](DEC-0039-concept-worktrees.md) paralel çalışma biçimini kısmen netleştirir; genel yetki ve tek yazar korunur.
