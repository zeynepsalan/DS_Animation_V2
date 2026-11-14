# Orkestrasyon: kanonik proje kaydı

Bu belge, kullanıcının önceki görüşmelerde verdiği kararları 2026-11-14 tarihinde konsolide eder; kararların özgün tarihleri ayrıca doğrulanmadıkça bu tarih olarak varsayılmaz. Bu repo için kanonik kaynaktır. Yeni sohbetler önce `AGENTS.md`, ardından bu belgeyi okur. Belgeler bağlamı taşır; canlı worker'ların sohbetler arasında çalışmaya devam edeceği anlamına gelmez.

## Onaylanmış süreç kararları

- Orkestrasyon her projede ayrı kullanılabilmelidir. Yeniden kullanılabilir süreç kuralları ile projeye özgü görev, karar, brief ve durum bilgileri ayrılır. Bu kayıt şimdilik yalnız bu repodadır: global kurulum, başka repolara yayılım, runtime ayarları ve otomatik enforcement uygulanmamıştır.
- Kullanıcının tek muhatabı yöneticidir. Yönetici görevleri, bağımlılıkları, atamaları, brief ve revizyonları, worker açılmasını ve teslim kararını yönetir. Yönetim belgelerini okuyabilir ve güncelleyebilir. Ürün kodu yazmaz, ürün testi yapmaz ve uygulamayı çalıştırmaz; bu işleri açıkça görevlendirilmiş worker'lara verir. Genel teknik sahiplik yönergesi, yöneticinin sorumluluğu ve worker'ların icrası olarak uygulanır. Worker görevi ve modeli açık atanır; worker yönetici rolünü miras alıp kendi işini durdurmaz. Ürün geliştirme beklemededir; öncelik orkestrasyon tasarımıdır.
- Şimdilik yalnız Codex worker'ları kullanılır. Süreç gelecekte sağlayıcı değişebilmesine elverişlidir. Bu karar önceki Roku/Claude yönergeleriyle çeliştiğinde geçerlidir; otomatik Claude çağrısı yapılmaz.
- Cost, token tüketimidir. Hız hedefi veya mevcut sert token/cost sınırı yoktur; kalite önceliklidir. Gereksiz worker açma, tüm sohbeti her worker'a aktarma, tekrarlı araştırma ve test ile gereksiz rapor azaltılır; kısalık uğruna kalite düşürülmez. Ürün kalitesi toplam token karşılığıyla değerlendirilir; ölçüm yoksa tasarruf yüzdesi veya token miktarı uydurulmaz. Ürün ve mimari kararları, kapsam değişiklikleri ve ileride bir bütçe tanımlanırsa onu aşma kararı kullanıcıdadır.
- Yönetici kayda değer ve doğrulanmış bir değişiklik için kullanıcının GitHub hesabı üzerinden otomatik normal push kararı verebilir; Git icrasını worker'a devredebilir. Push yalnız ilgili değişiklikleri içerir, kullanıcının ilgisiz işleri dahil edilmez. Her push için yeniden onay istenmez. Production deploy ayrı bir karardır; GitHub push yetkisi deploy onayı değildir.
- Her kod değişikliği için ayrı test worker'ı zorunlu değildir. Fonksiyonel veya riskli değişikliğin bütünlüğü tamamlandığında uygun testler yapılır; uygulayıcı worker bunları çalıştırabilir. Her anlamlı değişiklik grubu tamamlandığında uygulayıcıdan bağımsız inceleme yapılır. İnceleme ve test farklıdır; inceleme onayı testlerin çalıştığını kanıtlamaz. Ürün kodu değişmeyen dokümantasyon görevinde uygulama testleri gerekmez.

## Kullanıcı iletişimi ve karar kaydı — 2026-11-14

- Yönetici, kullanıcıya yönelik her commentary/ara durum ve final mesajının en sonunda doğrudan sohbet içinde `Worker | Görev | Model | Durum` sütunlarıyla tablo gösterir. Bu rapor için sırf tablo göstermek amacıyla ayrı Canvas açılmaz. Gerçek worker adı veya kimliği, bu görevde yaptığı iş, gerçekten kullanılan model ve gerçek durum yazılır; görevlendirilmemiş worker başlatılmış gösterilmez ve model örneklerinden kimlik tahmin edilmez. Ara mesajda o ana kadar bu görevde görevlendirilenler, finalde görevde çalışan worker'lar sonuç durumlarıyla listelenir. Worker çalıştırılmadıysa `— | Worker çalıştırılmadı | — | —` gibi dürüst bir satır kullanılır. Tablo operasyonel gözlemdir; otomasyonun tüm sistemde canlı kurulu olduğu anlamına gelmez.
- Kullanıcının kararlarını kalıcı kayda geçirmek yöneticinin zorunlu görevidir; yalnız sohbet hafızasına güvenilmez. Yeni veya değişen kararlar ilgili kanonik belgeye tarih ve kapsamla, kullanıcı belirtmişse gerekçesiyle ve yerini aldığı kararla ilişkisiyle işlenir; sonra özeti ve bağlantısı raporlanır. Bilinmeyen özgün tarih veya gerekçe uydurulmaz, eski karar sessizce silinmez. Öneri ve açık konular onaylı karar gibi kaydedilmez; belgelenmiş karar tekrar sorulmaz. Görev devrinde ve yeni sohbette bu kayıtlar okunur. Yeniden kullanılabilir orkestrasyon kararları burada, projeye özgü kararlar `docs/DECISIONS.md` gibi projenin kanonik karar kaydında tutulur; genel kullanıcı tercihleri proje mimarisi gibi yazılmaz. Bu kayıt şu anda yalnız bu repodadır; global kurulum yapılmış değildir.
- Kullanıcı soru tercihini şöyle ifade etti: “bana soracağın soruları bir html arayüzünde sor, cevaplar için şıklar ekle, ayrıca şıklarda cevabımı bulamazsam diye ekstra yazma alanım olsun. gönder butonuna bastığımda cevaplar direkt sana gelsin.” Sorular seçenekler ve serbest metin alternatifi sunan bir formda sorulur. Gönderilen yanıtı doğrudan aynı sohbete ileten yerleşik soru formu bu gereksinimi sağladığında kullanılabilir; sırf soru sormak için ayrı site, uygulama veya backend kurulmaz. Bu kayıt özel bir HTML dosyası yapıldığını veya özelleştirilmiş callback'in test edildiğini iddia etmez. Özel HTML gerektiğinde ancak gerçek host-chat bağlantısı varsa yanıtın gönderildiği söylenir; yalnız localStorage, clipboard veya download aynı sohbete gönderim değildir. Kullanıcı doldurup Gönder demeden seçili varsayılan karar veya onay sayılmaz. Gönderilen yanıtlar geldikten sonra kararlar ilgili kanonik dosyaya kaydedilir; cevaplanmamış form maddeleri onaylı gösterilmez.

### Yerel form düzeltmesi — 2026-11-14

Yerleşik soru formu kullanıcıya görünmedi. Bunun ardından `tools/orchestration-questionnaire/` altında yerel HTML formu ve Python standart kitaplığıyla çalışan sunucu hazırlandı. Sunucu `python3 tools/orchestration-questionnaire/server.py` ile başlatılır; çalışma anındaki adres ve port sunucu çıktısından alınır. Form seçenek veya serbest yanıt alır, boş yanıtları engeller ve sunucu onayını bekler. Yanıtın mevcut sohbete otomatik iletilmesi için aktif bir receiver gerekir; yalnız yerel kaydetme sohbet teslimi değildir. Formdan mevcut sohbete uçtan uca teslim henüz gerçekleşmedi ve doğrulanmış sayılmaz. Yanıtlanmamış sorular karar değildir.

## Model yönlendirmeleri

Aşağıdaki görev örnekleri modellerin yalnızca bu işleri yapabileceği anlamına gelmez; teknik performans/fiyat garantisi değildir. Esneklik görev dağılımı içindir; yönetici yalnız kullanıcının tanımladığı model seçenekleri arasında seçim yapar. Yeni model veya sağlayıcı ekleme kararı kullanıcıya aittir. Bir model birden çok alanda, aynı alanda birden çok model kullanılabilir. Tek görevin karmaşıklığı örnek rol etiketinden daha önemlidir.

- `gpt-6.1-sol`: karmaşık, uzun veya yoğun akıl yürütme isteyen kod; kalite kontrol, test ve detaylı araştırma.
- `gpt-6.1-terra`: proje beyni ve yönetimi; orta zorlukta kod, uzun raporlama, araştırma, işlerin birleştirilmesi ve iki worktree'nin entegrasyonu.
- `gpt-6-luna`: küçük ve kısa işler, rapor çıkarma/yazma ve özetleme.

Yetki ve kısıtların sahibi kullanıcıdır. Kullanıcının açık kısıtları aşılmaz; esnek seçeneklerde yönetici kalite/token dengesine göre seçim yapar. Model sessizce değiştirilmez; atama veya değişiklik gerekçesi kayda girer. Gerekli model erişilemiyorsa kısıt dışı sessiz fallback yapılmaz, yöneticiye bildirilir. Bu modeller mevcut collaboration aracında desteklenir; erişilebilirlik çalıştırma sırasında doğrulanır. Bu belge mevcut oturumun modelini değiştirmez.

## Görsel üretimi

Kullanıcının “imagen” ifadesi Codex'in resim üretme aracını (`image_gen`/`imagegen`) ifade eder; model veya worker değildir. Görseli yönetici değil görevlendirilmiş worker üretir. Görsel işini hangi metin worker modelinin koordine edeceği henüz atanmadı; gerektiğinde worker ilgili imagegen skill'ini okur.

## Açık konular ve uygulanmamış ayrıntılar

- Production deploy için kullanıcıya soru soruldu; yanıt henüz yoktur.
- Brief formatı, görev durumları, dosya kilidi veya worktree politikası, eşzamanlı worker sayısı ve somut görev takibi altyapısı henüz kararlaştırılmamıştır. Bu konular için bir uygulama kurulduğu varsayılmaz.
