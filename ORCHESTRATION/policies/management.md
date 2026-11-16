# Yönetim politikası

[Kayıtlı süreç kararları](../../DECISIONS/orchestration/DEC-0026-manager-authority.md) geçerlidir. Yönetici bağımlılık ve riske göre ortak alan veya ayrı worktree seçer; tek dosyanın tek yazarı olur. Git worktree ortak repo kaynaklarını paylaşır; semantik çakışmayı otomatik önlemez. Ürün/mimari, kapsam ve ileride bütçe belirleme veya aşma kararı kullanıcıdadır.

Görev yaşam döngüsü bu dosyalama çalışması için yönetici tasarımıdır; daha önce kullanıcıca onaylandığı varsayılmaz: brief → atanmış → çalışıyor → bağımsız incelemede → tamamlandı veya engelli. Gerçek durumu tek görev kaydında güncelle; bağımlılık, tek yazar, model, kabul ölçütü, kanıt ve handoff yaz. [Şablon](../templates/task-brief.md).

Paralel çalışma, konsept başına ayrı worktree, her worktree için gerekli testler ve tek entegrasyon worktree’sinde toplama anlamına gelir ([DEC-0039](../../DECISIONS/orchestration/DEC-0039-concept-worktrees.md)). Birleştirme sonrasında entegrasyon worktree’sinde uygun birleşik regresyon doğrulaması teknik teslim kapısıdır. Bu bütün işleri derhal paralel başlatma yetkisi değildir.
