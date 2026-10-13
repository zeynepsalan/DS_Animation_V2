# İlerleme kaydı

## 2026-10-12

- Proje klasörü incelendi; henüz uygulama kaynak kodu veya paket yapılandırması bulunmuyor.
- AGENTS.md ile kalıcı çalışma kuralları oluşturuldu.
- README.md ile ürün amacı, zorunlu kapsam ve öğrenme hedefi kaydedildi.
- docs/DECISIONS.md ile kullanıcı kararları ve bekleyen kararlar kaydedildi.
- Uygulama kurulumu henüz yapılmadı. İlk veri yapısı Linked List olarak seçildi; Array de temel kapsama eklendi.
- Node yapısını öğretme önceliği ve diğer yapıların bu temeller üzerine kurulması kararı tüm ilgili dokümanlara işlendi.
- İlk tür tek yönlü liste olarak seçildi; site adı `Singly Linkedlist` olarak kaydedildi.
- Site keyword'lerinin İngilizce olması kararı ilgili dokümanlara işlendi.
- Türkçe öğretici açıklamalar + İngilizce teknik terimler kararı onaylandı ve ilgili dokümanlara işlendi.
- Node yapısı, Traversal, Insert at Head, Insert at Tail ve Delete kapsamı onaylandı ve ilgili dokümanlara işlendi.
- Dinamik parametre girişi, tekrarlı ekleme/silme, fonksiyonlar arasında ortak liste ve edge case kontrolü gereksinimleri kaydedildi.
- Play/Pause, Next Step, Previous Step, Reset ve hız ayarı onaylandı.
- Fonksiyon parametrelerinin Java implementasyonuyla eşleşmesi kararı kaydedildi; somut imzalar henüz yazılmadı.
- Reset'in işlem başlangıcına dönmesi ve işlem öncesindeki listeyi koruması onaylandı; ayrı Clear fonksiyonu kapsama eklendi.
- Sonraki adım Java fonksiyon imzalarını somutlaştırmak ve ilk Angular uygulamasını hazırlamak için kalan tasarım kararlarını belirlemek.
- Bu değişiklik yalnızca dokümantasyon içeriyor; uygulama testi gerektirmiyor.
- Üç panelli ana ekran, folder/file Sidebar, IDE Codebar ve değişken/pointer takibi gereksinimleri kaydedildi.
- docs/UML.md oluşturuldu. Kaynak kod bulunmadığı için ilk diyagram kavramsal taslak olarak işaretlendi; gerçek sınıf/component mimarisi henüz belirlenmedi.

- Bağımsız Node sınıfı ve ardından Singly Linkedlist geliştirme sırası kaydedildi.
- Resmi Java SE 25 LinkedList API’si incelendi; kullanıcı fonksiyonları ve temel eklemeler docs/API.md içine işlendi.
- UML taslağı bağımsız Node ve yeni fonksiyon imzalarıyla güncellendi. Henüz kaynak kod veya çalıştırılabilir uygulama yok.

## 2026-10-12 — İlk çalışan sürüm

- Angular CLI 22.2.2 ile uygulama kuruldu; mevcut Node/npm sürümleri ve resmi uyumluluk kaynağı kontrol edildi.
- Bağımsız generic Node ve 18 liste/öğretim işlemi uygulandı.
- Üç panel, indigo/bebek mavisi koyu tema, dinamik parametreler, kod satırı eşleşmesi ve animasyonlu Node/referans görünümü hazırlandı.
- TraceEngine ve PlaybackService ile ortak liste, ileri/geri adımlama, hız, Reset ve yarım işlem iptali eklendi.
- 11 Angular/Vitest testi geçti; 300 işlemden oluşan referans model karşılaştırması ve bütün işlem adımlarının üç kod dilinde satır eşleşmesi doğrulandı.
- Java/C kaynak export script'i eklendi. Java ve C derlendi; davranış kontrolleri geçti. C kontrolü AddressSanitizer ve UndefinedBehaviorSanitizer ile çalıştı.
- Chrome'da yerel uygulama açıldı; görsel düzen, metin parametresiyle ekleme, araya ekleme, Previous Step, dil değişimi ve Reset kontrol edildi.
- UML gerçek sınıf/component yapısıyla güncellendi; README, API, kararlar ve Angular öğrenme rehberi hazırlandı.
- Array henüz geliştirilmedi; sonraki ayrı aşamada ele alınacak. Uygulama için backend kurulmadı.

- Production build, Java/C doğrulaması ve son test sonuçları docs/VALIDATION.md içine kaydedildi. Ekran görüntüleri docs/screenshots/ altında tutuluyor.

- Başlatma komutu ve editör önizleme adresi 127.0.0.1 olarak sabitlendi; başka IPv6 localhost sunucusuyla karışması önlendi. Test için başlatılan yalnızca bu projeye ait önizleme sunucusu kapatıldı; npm start ile yeniden açılabilir.

- Kullanıcının açılış kontrolü üzerine npm start ile yerel sunucu yeniden başlatıldı. http://127.0.0.1:4200/ HTTP 200 döndürüyor; önizleme erişimi için sunucu açık bırakıldı.

## 2026-10-12 — İkinci düzenleme

- Viewport yüksekliği sabitlendi; Sidebar ve uzun kod kendi içinde scroll yapıyor. Canlı Chrome ölçümü viewport/document 1470×745; Sidebar içerik 943, görünür alan 586 px.
- Parametre formu Codebar altına taşındı ve fonksiyon imzasının içine yerleştirildi.
- Result modelleri, Java/C örnekleri ve yardımcıları kaldırıldı; doğrudan dönüşler ve if guard'ları uygulandı. Java/C örnekleri yeniden üretilip derlendi.
- Node boyutu küçültüldü; geometri modülü, kalıcı ok öğeleri, ortak hareket süresi, referans şeritleri ve enter/leave fade eklendi.
- Zoom In/Out/Fit ve ResizeObserver ile otomatik kadraj eklendi; zoom veri modelini değiştirmiyor.
- Canlı tarayıcıda hareketin ara ve bitiş konumları ölçüldü: Node y=75.1026 → 220, ok başlangıcı y=107.103 → 252; aradaki 32 birim yarım Node yüksekliğiyle eşleşti. Geçiş 0.9 sn.
- Geometri testinde başa eklemeye yanlışlıkla fazladan index parametresi verildiğinde ayrık slotun yanlış seçildiği bulundu; baş/son işlemlerinin kendi semantiğini kullanan detachedIndexFor ile düzeltildi. Son testler ve görsel kontrol sürüyor.

- Görsel incelemede Node kimlik yazısının referans oku ile kesişebildiği görüldü; kimlikler kutunun altına taşındı, geriye/yukarı giden next okları daha alttan yönlendirildi. Son sahne yüksekliği ayrık Node için 360 olarak düzenlendi.

- Kamera geçişindeki olası oran sıçramasını önlemek için zoom, sabit mantıksal SVG ölçülerinin üzerinde eşit CSS scale olarak uygulandı; viewport wrapper yalnızca kaydırma sınırlarını yönetir.

- Fit, işlem tamamlandığında boş geçici satırı kaldırıp sonuç listesini yumuşakça büyütür; manuel zoom değişmez. Boş listede addFirst next açıklaması null bağlantısını doğru anlatacak şekilde düzeltildi.

- A → B → C canlı araya ekleme senaryosunda kutu/etiket bounding box’ları çakışmadı; sayfa 1470×745 içinde kaldı. Bu kontrolde aktif kod satırının bazen görünüm dışında kaldığı bulundu; Codebar kaydırma hesabı container-relative bounding rect ile düzeltildi.

- İkinci düzenleme tamamlandı: 14 test, production build ve Java/C kontrolleri geçti. Canlı sitede scroll, kutu/etiket yerleşimi, ara hareket, doğrudan T dönüşü, highlight görünürlüğü ve zoom kontrolleri doğrulandı. docs/VALIDATION.md ve refined-layout.png güncellendi. Yerel sunucu açık tutuluyor.

- 2026-10-13: Kullanıcı kararı: bağımsız Node constructor, data ile birlikte next parametresini alır. next açıkça verilir; null veya mevcut Node olabilir. Listeye ekleme animasyonunda bağlantı ayrı adımda gösterildiği için önce null gönderilir.

- 2026-10-13: Node(data, next) değişikliği doğrulandı: Angular production build, 14 uygulama testi ve Java/C örneklerinin derleme/davranış kontrolleri geçti. Node testi null bağlantısını ve mevcut Node referansının constructor ile aktarılmasını doğrular.

- 2026-10-13: Kullanıcı görünüm kararı: Core concept başlık/açıklama alanı kaldırıldı; üst barda Data Structures / SinglyLinkedList / AddFirst biçiminde seçili dosya yolu gösterilir. Kod ve Visualization üstten genişletildi. Method çalıştırma kartı açık indigo, çerçeveli ve radiuslu; IDE arkasında beyaz dolgu yok. Visualization başlığının hemen altında Variables & References solda, Execution Step sağda 1:3 oranında küçük başlıklı açık indigo kartlardır. Sidebar, üst bar, IDE ve Visualization indigo; paneller dışında kalan zemin beyazdır.

- 2026-10-13: Kullanıcı Git kurulumu ve kendi adına push istedi. Mevcut klasörde Git repo bulunmadığı için main dalıyla yerel repo başlatıldı; hedef remote kullanıcıdan bekleniyor. Git sistemde zaten kurulu.

- 2026-10-13: Kullanıcının verdiği https://github.com/zeynepsalan/DS_Animation_V2.git origin olarak eklendi. Uzak repo başlangıçta boştu; main dalı başarıyla pushlandı ve origin/main takibi kuruldu. Mevcut Git kimlik doğrulaması yeterli olduğundan ek GitHub CLI girişi gerekmedi.
