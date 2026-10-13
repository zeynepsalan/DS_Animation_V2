# Data Structures Lab

Veri yapılarını Java, C ve sözde kodla eş zamanlı animasyonlar üzerinden öğreten Angular uygulaması. Hedef kitle veri yapılarını öğrenen öğrenciler ve ders anlatan öğretmenlerdir.

## Çalıştırma

Node 24.15.0 ve npm 11.12.1 ile doğrulandı. Angular sürümü 22.2.2; bağımlılıklar package-lock.json içinde kaydedilir.

```sh
npm ci
npm start
```

Uygulama: http://127.0.0.1:4200

```sh
npm test -- --watch=false
npm run build
npm run verify:examples
```

Son komut Java/C örneklerini yeniden üretir, Java assertion kontrollerini ve C AddressSanitizer/UndefinedBehaviorSanitizer kontrollerini çalıştırır; JDK ve clang gerekir. Sadece kaynakları üretmek için `npm run export:examples` kullanılır.

## İlk çalışan sürüm

- Ekrana tam sığan üç panel: solda kendi içinde scroll yapan Folder/File Sidebar, ortada Codebar, sağda Visualization. Sayfa seviyesinde scroll yok.
- Koyu tema; indigo ve bebek mavisi ana renkler.
- Açılışta listeden bağımsız Node tanıtımı. Preview Node ortak listeyi değiştirmez.
- Node<T> ayrı generic sınıf; data, next ve görsel kimlik id taşır. Liste başlangıçta boş.
- Singly Linkedlist: isEmpty, size, clear, addFirst, insertAt, addLast, removeAt, removeFirst, removeLast, indexOf, get, getFirst, getLast, set, contains, lastIndexOf, remove ve Traversal.
- Çalıştırma alanı Codebar altındadır; kullanıcı parametreleri fonksiyon imzasının içindeki alanlara girer. String değerler desteklenir; index 0'dan başlayan tam sayıdır. Sayısal görünen data değerleri de String olarak işlenir.
- Fonksiyonlar aynı listeden devam eder. Tamamlanmamış işlem sırasında başka fonksiyon seçilirse önceki işlem iptal edilip onun başlangıç listesine dönülür.
- Kod vurgusu, adım açıklaması, değişken değerleri ve Node/pointer çizimleri aynı ExecutionStep'ten beslenir.
- Küçük Node kutuları, aynı SVG üzerinde yumuşak Node/ok/referans geçişleri, Zoom In/Out ve Fit kontrolleri.
- Liste fonksiyonları doğrudan void/T/int/boolean/List<T> döndürür; Result sarmalayıcısı yok. Başarısız T okuma/silme null, geçersiz void işlem erken return ile sonlanır.
- Play/Pause, Next Step, Previous Step, Reset ve 0.25×–3× hız ayarı. Run otomatik oynatmayı başlatır.
- Reset mevcut işlemin başlangıcına döner ve işlem öncesindeki listeyi geri yükler. clear() listeyi boşaltan ayrı bir algoritmadır.
- Boş liste, geçersiz giriş/index, bulunamayan değer, yinelenen değerler, tek Node ve head/tail silme durumları güvenle yönetilir.
- Java/C kaynakları ortak satır tanımlarından üretilir, kod panelinden tam kaynak indirilebilir.
- Teknik terimler İngilizce; öğretici açıklamalar ve kod yorumları Türkçe.

## Kullanım örneği

addFirst('A') → addLast('C') → insertAt(1, 'B') çalıştır. Liste A → B → C olur. insertAt sırasında i ve previous değerlerini, bağlantı kurma sırasını izle. Reset son işlemi geri alıp A → C durumuna döner. Yeni bir işlem seçerken yarım kalan işlemin geri alındığını gözlemle.

## Mimari ve öğrenme

- `src/app/core/node.ts`: listeye ve Angular'a bağımlı olmayan Node.
- `src/app/core/singly-linkedlist.ts`: gerçek bağlantı algoritmaları ve adım observer'ı.
- `src/app/core/trace-engine.ts`: algoritmayı çalışma kopyasında yürütüp snapshot kayıtlarını üretir.
- `src/app/core/playback.service.ts`: ortak listeyi ve oynatma cursor'ını signal'larla yönetir.
- `src/app/components/`: Sidebar, Codebar, Visualization.
- `src/app/education/`: fonksiyon imzaları, Java/C/sözde kod ve semantik satır eşleştirmeleri.
- `examples/`: derlenebilir Java/C eğitim kaynakları ve çalıştırılabilir kontrol örnekleri.

İlk kez okuyorsan [Angular öğrenme rehberi](docs/LEARNING.md) ile başla. Amaç iki ay içinde Angular ile proje geliştirme ve resmi dokümantasyon okuma becerisi kazanmayı desteklemek.

## Mevcut sınırlar ve sonraki kapsam

Array temel proje kapsamındadır ancak henüz geliştirilmedi; Sidebar'da Yakında olarak işaretlidir. Stack gibi yapılar daha sonra bu temeller üzerine kurulacak.

Uygulama tarayıcı belleğinde çalışır; sayfa yenilendiğinde liste sıfırlanır. Backend ve hesap sistemi kurulmadı. Java/C örnekleri tarayıcıda derlenmez; TypeScript algoritmalarının eşleşen mantıksal adımları oynatılır. C bellek ayırma/serbest bırakma ve Java GC iç işlemleri ayrıntılı simüle edilmez.

Keyfi eleman sınırı yok; uzun listeler yatay kaydırılır. Her adım snapshot aldığı için büyük listelerde ve uzun dolaşmalarda bellek tüketimi artar. İlk sürüm öğrenme oturumları için tasarlandı; büyük ölçekli kayıt optimizasyonu sonraki geliştirme konusudur.

## Proje kayıtları

- [Çalışma kuralları](AGENTS.md)
- [Kararlar](docs/DECISIONS.md)
- [İlerleme](docs/PROGRESS.md)
- [API](docs/API.md)
- [UML](docs/UML.md)
- [Angular öğrenme rehberi](docs/LEARNING.md)
- [Doğrulama kaydı](docs/VALIDATION.md)

- 2026-10-13: Kullanıcı görünüm kararı: Core concept başlık/açıklama alanı kaldırıldı; üst barda Data Structures / SinglyLinkedList / AddFirst biçiminde seçili dosya yolu gösterilir. Kod ve Visualization üstten genişletildi. Method çalıştırma kartı açık indigo, çerçeveli ve radiuslu; IDE arkasında beyaz dolgu yok. Visualization başlığının hemen altında Variables & References solda, Execution Step sağda 1:3 oranında küçük başlıklı açık indigo kartlardır. Sidebar, üst bar, IDE ve Visualization indigo; paneller dışında kalan zemin beyazdır.
