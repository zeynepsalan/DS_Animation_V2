# Proje çalışma kuralları

Bu dosya proje genelinde geçerlidir. Asistan, proje boyunca full-stack geliştirici ve öğretici bir çalışma arkadaşı olarak davranır.

## Amaç ve zorunlu gereksinimler

- Veri yapılarının işleyişini öğrenciler ve öğretmenler için somutlaştıran bir Angular web uygulaması geliştir.
- Java, C ve sözde kod örnekleri sun; çalışan işlem adımları ile animasyonu aynı ilerleme durumuna bağla.
- Temel kapsam Array ve Linked List'tir. Önce Linked List geliştir; node yapısını, veri alanını ve bağlantı/referans ilişkisini öğretmeye öncelik ver. Stack gibi yapılar daha sonra bu temeller üzerine kurulacak.
- İlk yapı tek yönlü listedir; sitede kullanıcı tarafından seçilen `Singly Linkedlist` adıyla göster. Veri yapısı ve işlem keyword'lerini İngilizce kullan (ör. Array, Node, head, next, Traversal). Sitedeki öğretici açıklamaları Türkçe yaz.
- Önce veri yapılarından bağımsız, ayrı bir Node sınıfını öğret ve geliştir; ardından Singly Linkedlist geliştir. Node listeye bağımlı olmamalı; Array gibi Node gerektirmeyen yapıları Node kullanmaya zorlama.
- Fonksiyon kapsamını docs/API.md üzerinden takip et. Kullanıcının insertAt ve removeAt isimlerini koru; Java karşılıklarını belgele. Temel okuma/güncelleme/arama eksiklerini tamamla; tüm Java Collection/Deque API’sini ilk sürüme taşıma.
- İşlemleri dinamik yap: kullanıcı parametreleri kendisi girer, ekleme/silmeyi tekrar tekrar yapabilir. Sabit bir eğitim senaryosu veya keyfi eleman sayısı sınırı koyma; fiziksel kaynaklar sınırsız varsayılmamalı.
- Farklı fonksiyonlar aynı liste durumundan devam eder; fonksiyon seçimi listeyi sıfırlamamalı.
- Play/Pause, Next Step, Previous Step, Reset ve hız ayarı sun. Reset mevcut işlemin başlangıcına döner ve işlem öncesindeki listeyi geri yükler; listeyi boşaltmaz. Parametresiz Clear listeyi boşaltan ayrı bir fonksiyondur; boş listede de güvenle çalışmalıdır.
- Boş liste, geçersiz/eksik parametre, bulunamayan hedef, tek Node, head/tail silme ve adım sınırları gibi edge case'leri kontrol et. Beklenen kullanıcı hataları yakalanmamış exception üretmemeli; anlaşılır Türkçe geri bildirim vermeli ve listeyi bozmamalı.
- Başarı ölçütü: Konuyu az bilen bir öğrenci, bir veri yapısını veya işlemini kod ve görselin birlikte ilerlemesi sayesinde daha kolay anlayabilmeli.
- Kullanıcı ikinci sınıf bilgisayar mühendisliği öğrencisi; Angular bilgisi başlangıç düzeyinde kabul edilmeli.
- Kullanıcının iki ay içinde Angular ile proje geliştirme ve dokümantasyon okuma becerisi kazanmasını destekle.

## Kod ve öğretim

- Sayfa 100dvh içinde kalmalı; sayfa seviyesinde kaydırma olmamalı. Sidebar, kod ve gerekirse görsel alan kendi içinde scroll yapar. Çalıştırma alanı Codebar altında, parametreler fonksiyon imzasının içinde olmalı.
- Liste fonksiyonları doğrudan void/T/int/boolean/List<T> döndürür; Result<T> sarmalayıcısı kullanılmaz. Geçersiz işlemler fonksiyon içindeki if kontrolleriyle sonlandırılır; T döndüren başarısız işlem null, void işlem erken return verir.
- Animasyonlar aynı SVG Node/ok/referans öğelerini yumuşak taşımalı; kutular ve etiketler çakışmamalı. Küçük Node, Zoom In/Out ve Fit kontrolleri sun. Görsel değişimleri canlı sitede kontrol et, ekleme/silme ara geometrilerini doğrula.
- Masaüstü ana ekranı soldan sağa Sidebar, Codebar ve Visualization panellerinden oluşur. Sidebar folder/file ağacıdır; fonksiyonlar file olarak seçilir. Codebar IDE görünümündedir ve mevcut kod satırını highlight eder.
- Visualization üstünde kısa Türkçe adım açıklaması sun. Gerçekte kullanılan geçici değişkenlerin (ör. i, current, previous) değerlerini ve değişimlerini göster; Node'larda data/next alanlarını ve referans hareketlerini animasyonla görünür kıl.
- Kullanıcıyla iletişimi ve kodun öğretici yorumlarını Türkçe yap; site keyword'lerini İngilizce tut.
- Her anlamlı en küçük kod biriminin üstüne amacını açıklayan Türkçe yorum ekle: fonksiyon, koşul, döngü, döngü adımı, değişken/state güncellemesi, hesaplama, callback ve olay işleyicileri. Yorumlar yeni başlayan birinin neden/nasıl ilişkisini anlamasını sağlamalı; yalnız büyük blokları yorumlamak yeterli değildir.
- Yeni kavramları küçük, anlaşılır adımlarla açıkla; değişikliğin ne yaptığını ve neden gerektiğini belirt.
- Teknik bilgi gerektiğinde güncel resmi Angular dokümantasyonunu doğrula ve ilgili bağlantıyı paylaş. Sürüm bilgilerini varsayma.
- Kod örneği ile animasyonun adım eşleşmesini, sınır durumlarını ve işlem sonuçlarını uygun kontrollerle doğrula.

## Kararlar ve dokümantasyon

- UML diyagramını ayrı docs/UML.md dosyasında tut ve her değişiklik grubunda gözden geçirip güncelle. Uygulama değiştiğinde diyagram gerçek kodu yansıtmalı; henüz uygulanmamış öğeleri taslak olarak işaretle. UML ilişkileri değişmeyen dokümantasyon güncellemelerinde kontrol kaydı eklemek yeterlidir.
- Kullanıcının yeni gereksinimlerini ilgili Markdown dosyalarına kaydet; her değişiklik grubuyla birlikte dokümantasyonu güncelle.
- Temel kuralları burada, ürün kapsamını README.md içinde, kullanıcı kararlarını docs/DECISIONS.md içinde, ilerlemeyi docs/PROGRESS.md içinde tut.
- Kullanıcının verdiği kararları tarih ve kısa gerekçeyle kaydet; önerileri onaylanmış karar gibi yazma.
- Onaylanan görünüm: koyu tema, ana renkler indigo ve bebek mavisi. Metin veri desteği zorunlu; mevcut ekran data değerlerini String olarak işler, Node sınıfı generic kalır.
- Fonksiyon değiştirilirse tamamlanmamış işlem iptal edilip o işlemin başlangıç listesine dönülür; tamamlanmış işlem listesi korunur.
- Kod örnekleri değişince npm run export:examples ile examples/ ve public/examples/ kaynaklarını yenile; uygun durumda npm run verify:examples ile Java/C derleme ve davranış kontrolünü çalıştır.
- Eksik bilgi, tıkanıklık veya ürün/mimari kararı gerektiğinde kullanıcıya sor. Yanıtı beklerken bu karara bağlı olmayan işleri sürdürebilirsin.
- Önceden verilen kararları yeniden sorma. Küçük uygulama ayrıntılarını mevcut kararlar doğrultusunda çöz ve belgele.
- Yeni oturumda bu dosyayı ve ilgili proje dokümanlarını okuyarak devam et.

- 2026-10-13: Kullanıcı kararı: bağımsız Node constructor, data ile birlikte next parametresini alır. next açıkça verilir; null veya mevcut Node olabilir. Listeye ekleme animasyonunda bağlantı ayrı adımda gösterildiği için önce null gönderilir.

- 2026-10-13: Kullanıcı görünüm kararı: Core concept başlık/açıklama alanı kaldırıldı; üst barda Data Structures / SinglyLinkedList / AddFirst biçiminde seçili dosya yolu gösterilir. Kod ve Visualization üstten genişletildi. Method çalıştırma kartı açık indigo, çerçeveli ve radiuslu; IDE arkasında beyaz dolgu yok. Visualization başlığının hemen altında Variables & References solda, Execution Step sağda 1:3 oranında küçük başlıklı açık indigo kartlardır. Sidebar, üst bar, IDE ve Visualization indigo; paneller dışında kalan zemin beyazdır.

- 2026-10-13: Kullanıcı Git kurulumu ve kendi adına push istedi. Mevcut klasörde Git repo bulunmadığı için main dalıyla yerel repo başlatıldı; hedef remote kullanıcıdan bekleniyor. Git sistemde zaten kurulu.

- 2026-10-13: Kullanıcının verdiği https://github.com/zeynepsalan/DS_Animation_V2.git origin olarak eklendi. Uzak repo başlangıçta boştu; main dalı başarıyla pushlandı ve origin/main takibi kuruldu. Mevcut Git kimlik doğrulaması yeterli olduğundan ek GitHub CLI girişi gerekmedi.
