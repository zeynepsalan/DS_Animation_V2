# DEC-0039 — Konsept odaklı worktree çalışması

Durum: Kabul edilmiş kullanıcı süreç tanımı. Tarih: 2026-11-16. Kapsam: bu proje. Kaynak: kullanıcının bu oturumdaki paralel çalışma tanımı.

Karar: Paralel çalışmada her ayrı worktree bir konsepte odaklanır; her biri gerekli testlerden ayrı geçtikten sonra sonuçlar tek bir entegrasyon worktree'sinde toplanır. Bağımlılık, tek dosya yazarı ve entegrasyon sorumluluğu yönetilir. Teknik teslim kapısı olarak birleşimden sonra entegrasyon worktree’sinde uygun birleşik regresyon doğrulaması yapılır. Bu, bütün konuları hemen paralel başlatma onayı değildir; uygun işler ve önkoşullar belirlenir. [DEC-0027](DEC-0027-worktree.md) genel seçim yetkisini korurken paralel çalışmanın somut biçimi bu kararla belirlenir.

Gerekçe: kullanıcının açık tanımı. Yerine aldığı kayıt: DEC-0027'nin paralel çalışma için belirsiz bıraktığı bölüm kısmen netleştirilmiştir. Uygulama ve doğrulama: henüz bu görev için worktree oluşturulmadı. [Görev](../../ORCHESTRATION/tasks/TASK-0004-architecture-revision.md).
