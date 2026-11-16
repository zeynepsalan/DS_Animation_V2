# TASK-0004 — Temel yapı ve süreç revizyonu

Tarih: 2026-11-16. Durum: Çalışmada; bağımsız inceleme bekleniyor. Kaynak: kullanıcının iki temel yapı, arayüzler altındaki temsiller, konsept worktree akışı ve proaktif bağlam kayıtları açıklaması. [DEC-0038](../../DECISIONS/engineering/DEC-0038-foundations-and-interfaces.md), [DEC-0039](../../DECISIONS/orchestration/DEC-0039-concept-worktrees.md), [DEC-0040](../../DECISIONS/orchestration/DEC-0040-proactive-context.md).

`project_architecture` (`gpt-6.1-terra`) mimari, plan, UML ve süreç belgelerinin tek yazarıdır; soru arayüzü ayrı worker sorumluluğundadır. Kabul: mevcut Node/DNode ve üç liste gerçek; Array henüz yok; fixed-capacity ArrayList Java'nın dinamik sınıfıyla karıştırılmaz. Arayüz, gerçek temsil ve typed state/trace/render ayrımı taslakta görünür; öneriler karar olarak sunulmaz. Paralel çalışma ayrı konsept worktree'leri, ayrı testleri ve tek entegrasyon worktree'sini gerektirir. Teknik teslim kapısı, entegrasyon sonrasında uygun birleşik regresyon doğrulamasıdır. Önceden verilen kararlar yeniden sorulmaz. Kaynak kod, ürün testi ve deploy kapsam dışıdır.

Handoff: UML değiştiği için soru arayüzü SVG/hash yenilemesi gerekir; ardından bağımsız belge/arayüz incelemesi ve belge checker çalıştırılır. Bu revizyon tek konsept/görevdir; docs ve araçlar tek yazarla aynı çalışma alanında hazırlanır. Bu, konsept geliştirmede DEC-0039 worktree akışının uygulandığı iddiası değildir. Ürün kodu ve worktree oluşturulmadı.

Açık form soruları `planning.arraylist_meaning.v2` r1 (terimin rolü) ve `planning.initial_scope.v2` r1 (ilk kapsam sırası); seçenekler hazırlanmıştır, kullanıcı yanıtı değildir. Mevcut null/erken return ve Türkçe geri bildirim kuralı ayrıca sorulmaz.

## Doğrulama ve teslim durumu

Arayüz worker raporu: 13 izole backend testi geçti. 360/736/1440 piksel tarayıcı gözleminde plan, mimari, kaynaklar, UML ve sorular; altı SVG ve taşma kontrolü yapıldı. Eski taslak/geçmiş mock verisi, yeniden yükleme, varsayılan seçim bulunmaması ve XSS metninin düz metin kalması gözlemlendi. Canlı ayrık sunucu PID 22313, `127.0.0.1:64466`, v4 katalog, iki açık soru ve sıfır seçili seçenek gösterdi; gerçek POST veya queue gönderimi yapılmadı. Gerçek runtime dosyaları için önce/sonra hash ölçümü yoktur; değişmezlik izole testte sınandı.

Worker'lar birbirlerinin belge ve arayüz kaynaklarını bağımsız salt-okunur inceledi; maddi bulgu yok. Bu inceleme testlerin tekrarlandığı anlamına gelmez. Ürün kaynak kodu, production deploy ve kullanıcı kabulü yoktur; iki somut kullanıcı yanıtı beklenmektedir.

Son bağımsız belge düzeltmesi incelemesi PASS. Canlı salt-okunur UML gözleminde altı görsel ve Gerçek boyut iç kaydırması görüldü, sayfa taşması saptanmadı; tarayıcı Sorular bölümünde bırakıldı. Ekran kanıtları `/tmp/questionnaire-v4-final-{360,736,1440}.png` ve `/tmp/questionnaire-v4-uml-desktop.png` geçici yollarındadır. Arşiv v3 JSON, önceki Git katalog içeriğiyle eşittir.
