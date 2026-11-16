# Açık konular

- Production deploy politikası [DEC-0035](../../DECISIONS/orchestration/DEC-0035-production-deploy-approval.md) ile kararlaştırıldı: her deploy için ayrı kullanıcı onayı gerekir; şu anda bir deploy onayı verilmiş değildir.
- Kullanıcı tarafından henüz kararlaştırılmamış süreç ayrıntıları (ör. eşzamanlı worker sayısı ve otomatik enforcement) uygulanmış varsayılmaz. Bu çalışmadaki görev yaşam döngüsü yönetici tasarımıdır.
- Önceki onaylanmış kararları tekrar sorma. Kullanıcının “1 önerin kabul” ifadesindeki özgün öneri metni erişilen kayıtlarda yoksa yeni hüküm icat etme.

- 2026-11-16 planlama formunda çalışma biçimi, sonraki kapsam ve ortak trace/playback ile Array hazırlığı mimarisi kullanıcı kararını bekler. Kontrollü hibrit ve somut Array API öneridir; sabit kapasite önceden kararlaştırılmıştır. [Plan](../../docs/planning/PROJECT_PLAN.md), [DEC-0036](../../DECISIONS/orchestration/DEC-0036-project-planning-resumption.md).
