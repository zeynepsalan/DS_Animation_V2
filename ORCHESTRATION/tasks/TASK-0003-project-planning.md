# TASK-0003 — Proje planı, mimari ve soru kategorisi

Tarih: 2026-11-16. Durum: Hazırlık ve bağımsız inceleme tamamlandı; üç kullanıcı kararı bekleniyor. Amaç: mevcut kod ve 11 ders PDF'i üzerinden geliştirme planı, mimari ve gerçek/taslak UML hazırlamak; mevcut soruları koruyan planlama kategorisiyle strateji, kapsam ve mimariyi kullanıcının değerlendirmesine sunmak. Kaynak: [DEC-0036](../../DECISIONS/orchestration/DEC-0036-project-planning-resumption.md).

## Görev ve dosya sahipliği

- `course_pdf_analysis` (`gpt-6.1-sol`): PDF incelemesi ve tek yazarlı [SOURCE_MAP](../../docs/planning/SOURCE_MAP.md); kaynak araştırması hazır, diğer inceleme ayrı atanır.
- `project_architecture` (`gpt-6.1-terra`): [plan](../../docs/planning/PROJECT_PLAN.md), [mimari](../../docs/planning/ARCHITECTURE.md), [UML](../../docs/UML.md) ve bu süreç belgeleri; belge güncellemesi çalışmada.
- `planning_interface` (`gpt-6.1-sol`): soru arayüzü, önceki soruların korunması ve kendi doğrulaması; çalışma sürüyor. Durumlar bu kaydın yazıldığı ana aittir, canlı durum sorgusu değildir.
- Bağımsız inceleme: yönetici tarafından ayrıca atanacak; henüz sonuç iddia edilmez.

## Kabul ve devir

Kod envanteri mevcut ve önerilen yapıları ayırır; Array'in henüz uygulanmadığı açıkça belirtilir. Kaynak haritası PDF/sayfa dayanağını ve eksik kaynakları belirtir. Plan faz, bağımlılık, doğrulama ve dosya sahipliği önerilerini içerir; seçenekler kabul edilmiş karar gibi gösterilmez. UML mevcut sınıfları doğru, geleceği taslak olarak gösterir. Form yeni kategoride çalışma biçimi, kapsam ve mimari sorularını sunarken eski soruları korur; uygulama ve doğrulama kanıtı interface worker tarafından raporlanır. Belge bağlantıları ve kanonik grafik `python3 tools/verify-documentation.py` ile kontrol edilir. Yönetici, bağımsız inceleme ve gerçek kullanıcı yanıtlarını ilgili karar kayıtlarına devralır.

Yeni veri yapısı kodu, worktree oluşturma, commit, push ve production deploy bu aşamada yapılmadı. Ürün build/test ve cihaz gözlemi belge çalışmasının kanıtı değildir; arayüzün gerçek doğrulama sonucu ayrıca raporlanır.

## 2026-11-16 doğrulama ve karar bekleme

Arayüz worker raporu: 12 backend testi, Python derleme kontrolü ve diff kontrolü geçti; 360, 736 ve 1440 piksel tarayıcı gözlemlerinde dört SVG, taşma ve gerçek boyutta kaydırma kontrol edildi; eski katalog JSON hash'i korundu. Bağımsız `course_pdf_analysis` (`gpt-6.1-sol`) kaynak ve ekran görüntülerini inceledi, maddi bulgu bildirmedi. Bu sonuçlar kullanıcı kabulü değildir. Çalışma biçimi, kapsam ve mimariye ilişkin üç kullanıcı yanıtı bekleniyor; production deploy yapılmadı.

Belge denetiminde formun v2'den v3'e geçişi nedeniyle dokuz eski README bloğu etkin ardılda bulunmadı. [Açık evrim kaydı](../evidence/2026-11-16-project-planning/document-evolution.json), değiştirilmemiş baseline snapshot ve etkin ardılı eşler; checker snapshot/blob ve tüm blok kontrollerini koruyarak bu dokuz kaydı doğrular. Düzeltme sonrası `python3 tools/verify-documentation.py` geçti: 11 snapshot, 590 blok, 32 karar ID ve etkin yerel bağlantılar. Verifier ve evrim kaydı `course_pdf_analysis` tarafından bağımsız salt-okunur incelendi: PASS; maddi bypass bulgusu yok. Negatif dallar kod üzerinden incelendi, testler bu incelemede tekrar çalıştırılmadı.
