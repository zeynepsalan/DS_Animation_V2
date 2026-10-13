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

- 2026-10-13: Kullanıcı DataStructures_Animation ilk denemesini tasarım referansı olarak seçti. Kaynak token ve component düzeninden midnight indigo (#261b3e), koyu IDE (#18122a), controls (#211a36), bebek mavisi (#a8d4f0) ve açık Visualization/çizim zemini alındı. Bu karar önceki tüm panelleri indigo yapan görünümün yerini alır. Üst breadcrumb ve 1:3 Variables/Execution kartları korunur; playback method kartına taşınır. Sidebar araması ve kapalı Explorer rail eklenir. İşlem motoru, Reset baseline davranışı, Türkçe öğretici açıklamalar ve API korunur. Referans projenin kendisi değiştirilmez.

- 2026-10-13: Kullanıcı pointer görünümü kararı: aynı sıradaki Node bağlantıları düz olmalı; aynı Node'u gösteren pointer'lar farklı giriş noktaları kullanmalı. Tamamlanan liste çizim alanının sol üstüne yakın durur. Kamera/Fit, Node kutuları yanında tüm ok şeritlerini, referans/null/kimlik etiketlerini de kapsar. Fit'te keyfi minimum zoom kaldırıldı; uzun listelerin son bağlantısı da sığar. Manual Zoom büyütme/kaydırma davranışı korunur. Gönderilen üç screenshot geçici macOS konumundaki erişim hatası nedeniyle görülemedi; uygulama canlıda ve tarif üzerinden kontrol edildi.

- 2026-10-13: Kullanıcı revizyonu: header kaldırıldı; logo ve Sidebar kontrolü sabit sol şeritte alt alta. Explorer varsayılan 200px, maksimum 240px (önceki masaüstü maksimumunun yaklaşık üçte biri). Node pitch 210px ile aradaki oklar kısaltıldı. Pointer label 72×24px/12px; değişken içerikleri 13px ve belirgin, execution açıklaması 14px. Kart başlıkları korunur. ds↗ logosu public/favicon.svg ile sekme ikonu yapıldı.

- 2026-10-13: Kullanıcı Sidebar kararı: açık durumda ayrı sol şerit/boşluk yok; ds↗ logo ve DATA STRUCTURES aynı satırda, menu toggle ve search ikinci satırda. Kapalı durumda yalnız tekrar açma şeridi korunur. Araya ekleme bağlantıları karşılıklı ayrı koridorlardan geçer; dönüşler quadratic SVG eğrisiyle 24px radius (kısa segmentte güvenli sınır) kullanır. previous etiketi ok koridorundan çıkarıldı; üç ortak referans ayrı sol satırlara alınır. Fonksiyonlar ve RAF motoru korunur.

- 2026-10-13: Kullanıcı next bağlantı kararı: aynı Node’a gelen birden fazla ok aynı noktada birleşmez. Hedef sol kenarı eşit aralıklı girişlere bölünür; iki ok merkez çevresinde yukarı/aşağı simetriktir. Kaynaklar y/x/kimlik sırasıyla deterministik sıralanır. Aynı satırdaki ok yalnız giriş yüksekliği farkı kadar kısa radiuslu koridorda ayrılır; tek bağlantı merkezde düz kalır.

- 2026-10-13: Son kullanıcı revizyonu önceki koşullu sol şerit kararını değiştirir: ds↗ logo ve altındaki tek Sidebar kontrolü kalıcı 48px şerittedir. Açma/kapatmada kontrol yeniden oluşturulmaz ve konumu değişmez. Sidebar içinde logo/menu tekrarı kaldırıldı. Variable satır aralığı 2px, satır padding 3px; Execution açıklaması masaüstünde 16px/500, küçük ekranda 14px. Kart başlıkları korunur.

- 2026-10-13: Son kullanıcı düzeltmesi: açık Sidebar yanında ayrı sol sütun kaldırıldı; logo başlıkta, menu logo altında search yanında. Yalnız kapalı durumda 48px logo/menu şeridi görünür. Açık panel genişlik hesabından rail çıkarılmaz. Önceki kalıcı şerit kararı bu kararla değiştirildi; kompakt variable ve büyük execution metni korunur.
