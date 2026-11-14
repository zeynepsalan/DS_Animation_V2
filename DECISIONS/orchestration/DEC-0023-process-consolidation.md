# DEC-0023 — 2026-11-14 — Orkestrasyon kararlarının konsolidasyonu

Durum: Kaynakta kayıtlı karar ve tarihsel bağlam; açık sorular karar değildir. Kapsam: bu proje.

Kaynak tarihi yukarıda belirtilmiştir; konsolidasyon tarihi önceki kararların özgün tarihi sayılmaz. Kaynak: [eski karar kaydı](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/docs/DECISIONS.source.md).

## 2026-11-14 — Orkestrasyon kararlarının konsolidasyonu

Bu proje, kullanıcının onayladığı yönetici ve Codex worker düzenini benimser. Kararların kapsamı, önceki yönergelerle önceliği ve açık konular için kanonik kayıt [ORCHESTRATION.md](../../ORCHESTRATION.md) dosyasıdır. Bu tarih kararların konsolidasyon tarihidir; önceki görüşmelerdeki özgün karar tarihleri olarak varsayılmaz. Production deploy onayı açık kalır.

2026-11-14: Proje, yönetici mesajlarının sonunda gerçek worker/görev/model/durum tablosu gösterilmesi ve kullanıcı kararlarının ilgili kanonik belgede kalıcı kaydı kurallarını benimsedi. Ayrıntılar [ORCHESTRATION.md](../../ORCHESTRATION.md) içindedir.

2026-11-14: Kullanıcı, soruların seçenekler ve alternatif yazma alanı bulunan HTML arayüzünde sorulmasını ve Gönder ile cevapların doğrudan asistana gelmesini istedi. Bu tercihin uygulanma koşulları [ORCHESTRATION.md](../../ORCHESTRATION.md) içindedir.

2026-11-14 uygulama kaydı: Yerleşik form kullanıcıya görünmediği için yerel HTML alternatifi hazırlandı; aktif receiver ve henüz doğrulanmamış sohbet teslimi koşulları [ORCHESTRATION.md](../../ORCHESTRATION.md) içinde açıklanır. O aşamada soruların yanıtları henüz kullanıcı kararı olarak kaydedilmemişti.

2026-11-14 kullanıcı kararı: Yalnız yönetici worker açar; worker ihtiyaç duyarsa yöneticiden ister. Yönetici bağımlılık ve riske göre ayrı worktree veya ortak alan seçer. Ayrıntılar [ORCHESTRATION.md](../../ORCHESTRATION.md) içindedir. Production deploy için kullanıcı açıklama istedi; karar açık kalır.

2026-11-14 kullanıcı gereksinimi: Form yanıtının okunması için ayrıca sohbet mesajı göndermek gerekmemelidir. İzole v1 teknik form testi, otomatik yeni yönetici turu ve dosyanın okunmasına kadar doğrulandı; canlı v2'den gerçek deploy yanıtı henüz gelmedi. Teknik test kullanıcı kararı değildir.

Kapsam: bu proje. Gerekçe: kaynakta belirtilenler dışında bilinmiyor. Uygulama ve doğrulama: kaynak kayıtları ve [doğrulama kaydı](../../docs/VALIDATION.md); kararın kabulü uygulama veya test kanıtı değildir.
