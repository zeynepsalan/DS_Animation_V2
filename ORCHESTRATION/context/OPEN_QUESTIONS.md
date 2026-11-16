# Açık konular

- Production deploy politikası [DEC-0035](../../DECISIONS/orchestration/DEC-0035-production-deploy-approval.md) ile kararlaştırıldı: her deploy için ayrı kullanıcı onayı gerekir; şu anda bir deploy onayı verilmiş değildir.
- Kullanıcı tarafından henüz kararlaştırılmamış süreç ayrıntıları (ör. eşzamanlı worker sayısı ve otomatik enforcement) uygulanmış varsayılmaz. Bu çalışmadaki görev yaşam döngüsü yönetici tasarımıdır.
- Önceki onaylanmış kararları tekrar sorma. Kullanıcının “1 önerin kabul” ifadesindeki özgün öneri metni erişilen kayıtlarda yoksa yeni hüküm icat etme.

- Önceki genel mimari ve paralellik soruları yeni kullanıcı açıklamasıyla kısmen cevaplandı: iki temel, temsil sınırı ve paralel worktree tanımı karardır. Ayrıntılı API, ilk arayüz kapsamı ve bağımlı uygulama seçimleri açık kalır; eski form yanıtları korunur. [Plan](../../docs/planning/PROJECT_PLAN.md), [DEC-0036](../../DECISIONS/orchestration/DEC-0036-project-planning-resumption.md).

- Array tabanlı gerçek temsilin Node snapshot’ına zorlanmaması artık açık karardır, tekrar sorulmaz ([DEC-0037](../../DECISIONS/engineering/DEC-0037-array-representation.md)). Bunun dışındaki trace API, kapsam ve strateji seçenekleri bekler.

- `planning.arraylist_meaning.v2` r1: fixed-capacity ArrayList bağımsız List implementasyonu mu, Array tabanlı tüm implementasyonların genel adı mı; yoksa önce fark açıklansın mı? `planning.initial_scope.v2` r1: önce Array ve seçilen List anlamı, ardından Stack/Queue/Deque mi, yoksa yeterli kaynaklı tüm PDF konuları aşamalı mı? İlk seçenekler öneridir, kullanıcı yanıtı değildir. Sabit kapasite ve gerçek Array/cell temsili karardır; hata semantiği mevcut null/erken return ve Türkçe geri bildirim kuralıyla çözülür.
