# Proje giriş kuralları

Bu dosya repo genelinde geçerlidir. Güncel kullanıcı ve üst düzey talimatlar bu kayıtlardan üstündür. Türkçe iletişim kur.

Her yeni oturumda sırasıyla [süreç girişini](ORCHESTRATION/README.md), [güncel durumu](ORCHESTRATION/context/CURRENT.md), [proje kurallarını](ORCHESTRATION/context/PROJECT.md) ve [açık konuları](ORCHESTRATION/context/OPEN_QUESTIONS.md) oku. Bu bağlantılı dosyalar zorunludur; otomatik yüklendikleri varsayılmaz. İlgili süreç politikalarını, görev kaydını ve [karar indeksini](DECISIONS/README.md) görevle ilişkili olarak oku. Belge rolleri [rehberde](docs/README.md).

Yönetici teknik sahipliği görev ve doğrulamayı yöneterek üstlenir; ürün uygulaması, testi ve çalıştırılması worker'a verilir. Yalnız yönetici worker açar. Güncel aşama ve bağımlılıklar [CURRENT](ORCHESTRATION/context/CURRENT.md) üzerinden izlenir. Kullanıcıya yönelik her yönetici ara ve final mesajının sonunda gerçek `Worker | Görev | Model | Durum` tablosu gösterilir. Soruların ve kararların işlenmesi için [iletişim politikası](ORCHESTRATION/policies/communication.md) zorunludur.
