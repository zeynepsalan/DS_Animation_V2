# Doğrulama kaydı

## 2026-10-12 — İlk çalışan sürüm

- `npm run build`: production derlemesi başarılı; yaklaşık 243 kB toplam JS/CSS, yaklaşık 67 kB tahmini transfer. Angular strict template ve TypeScript strict kontrolleri açık.
- `npm test -- --watch=false`: 3 test dosyasında 11 test. Node generic davranışı, liste sonuçları, guard'lar, trace/satır eşleşmesi, oynatma timer'ı ve gerçek Angular template kontrol edilir.
- Referans model testi: 300 deterministik ekleme/silme/güncelleme işlemi Array üzerinde hesaplanan sonuçla karşılaştırılır; bağlantı döngüsü oluşmadığı ve size'ın tutarlı kaldığı kontrol edilir.
- Trace testi: bütün fonksiyonlar boş ve dolu listede farklı index/değerlerle çalıştırılır; her kayıtlı semantik adım Java, C ve Pseudocode satırına eşleşir.
- `npm run verify:examples`: Java kaynakları ve indirilebilir tek dosya Java örneği derlenir; Java assertion senaryosu çalışır. C örneği `-Wall -Wextra -Werror` ve AddressSanitizer/UndefinedBehaviorSanitizer ile derlenip çalıştırılır.
- Kaynak örneklerinde boş liste, geçersiz index, baş/orta/son ekleme-silme, arama, tekrar eden değerler, okuma/güncelleme ve clear kontrol edildi.
- Chrome masaüstü kontrolü: Node açılışı, indigo/bebek mavisi koyu tema ve üç panel görüldü. A → C listesine insertAt(1, B) uygulanırken highlight, pointer'lar ve değişkenler incelendi. Previous Step ve C diline geçiş test edildi. Reset sonrası Node değerleri A ve C olarak doğrulandı.
- İlk HTML biçimlendirmesinden sonra DOM testinde çevre boşlukları nedeniyle bir assertion başarısız oldu. Test, gerçek modeldeki data'yı birebir ve render edilen metni trim ederek kontrol edecek şekilde düzeltildi; kullanıcı değerinin kendisi değiştirilmedi.

## Görsel kayıtlar

- [Açılış ekranı](screenshots/overview.png)
- [insertAt bağlantı adımı](screenshots/first-version.png)

insertAt ekran görüntüsünde size hâlâ 2 görünebilir: bağlantı kurulduktan sonraki adımda size++ yürütülür. Ara durumun sayacı ile erişilebilir Node sayısının kısa süre farklı olması, kodun atama sırasını görünür kılar.

## Doğrulamanın kapsamı

Bu kontroller beklenen kullanıcı girdileri ve listelenen senaryolar içindir; sınırsız kaynak garantisi değildir. Mobil cihazda ayrı manuel test yapılmadı; dar ekran düzeni CSS breakpoint'leriyle uygulandı. C'nin malloc/free iç adımları ve Java GC animasyonu bu sürümde yok. Sayfa yenilemede oturumun sıfırlanması mevcut davranıştır.

## 2026-10-12 — Viewport, doğrudan dönüşler ve animasyon güncellemesi

- Son Angular kontrolü: 4 dosyada 14 test geçti. Node kutularının ekleme/silme geçişlerinde 101 ara oran için çakışmaması ve bütün next yollarının aynı M/C komut yapısını kullanması doğrulandı.
- Ek Angular template kontrolü: null → Node hedef değişiminde aynı SVG pointer öğesi korunuyor; zoom veri modelini değiştirmiyor ve imza Codebar altında gösteriliyor.
- Production build başarılı; yaklaşık 262 kB JS/CSS, 71 kB tahmini transfer. Java/C derleme ve davranış kontrolleri doğrudan dönüşlerle geçti.
- Canlı Chrome: viewport ve document boyutları 1470×745, sayfa taşması yok. Sidebar nav içerik yüksekliği 943, görünür yüksekliği 586 px; yalnız panel scroll yapıyor.
- A → C → insertAt(1, B) senaryosunda kutu ve referans etiketleri ölçüldü. Node kutuları x=844.89..932.93, 1003.85..1091.90, 1162.82..1250.87 aralıklarında; head ve previous etiketleri de birbirinden ayrıydı.
- Ara hareket örneği: Node y=75.1026 ve next ok başlangıcı y=107.103; hareket bitince 220 ve 252. Aynı 32 birim yarım yükseklik korunuyor; transition süresi 0.9 saniye. Bu, öğenin ara konumlar ürettiğini ve okun onu takip ettiğini gösterdi.
- Görsel inceleme ile Node id/ok kesişmesi düzeltildi; id kutu altına alındı ve geri next eğrisi daha alttan geçirildi.
- Daralan editörde aktif satırın görünüm dışında kalma sorunu bulundu ve container-relative kaydırma hesabıyla düzeltildi. Son removeAt(0) kontrolünde highlightedVisible=true; doğrudan dönüş "A", imza public T removeAt ve kalan data B olarak görüldü.
- Zoom In ile 100% → 115%, Zoom Out/Fit ile tekrar 100% doğrulandı. Node ve liste sonucu değişmedi.
- [Güncel ekran görüntüsü](screenshots/refined-layout.png) kaydedildi. Eski ekran görüntüleri geçmiş ilk sürümün kaydıdır.

Son kaynak değişiklikleri aktif Codebar satırını görünür tutma ve referans tooltip'leriyle sınırlıdır; bu değişiklikten sonra production build ve canlı tarayıcı kontrolü tamamlandı. Mobil için ayrı gerçek cihaz kontrolü henüz yapılmadı.

- 2026-10-13: Node(data, next) değişikliği doğrulandı: Angular production build, 14 uygulama testi ve Java/C örneklerinin derleme/davranış kontrolleri geçti. Node testi null bağlantısını ve mevcut Node referansının constructor ile aktarılmasını doğrular.

## 2026-10-13 — Kompakt çalışma ekranı
- Source/build: 14 test geçti; production build başarılı. İlk layout build 263.77 kB idi; son build çıktısı ayrıca kontrol edildi. Kaynaklar yerel Angular projesindedir.
- Browser: Chrome üzerinde 1440×900 ve 390×844 kontrol edildi. Her iki ölçüde body yüksekliği/genişliği viewport ile aynı; sayfa taşması yok. Masaüstü bilgi kartları 149.484 / 448.476 px, telefon kartları 88.5 / 265.5 px: tam 1:3. workbench-heading kaldırıldığı DOM üzerinden doğrulandı. Breadcrumb Data Structures / SinglyLinkedList / AddFirst olarak seçime göre değişti. AddFirst(A) Run ile tamamlandı; liste size=1, return=void ve aktif satır eşleşmesi gözlendi. Previous Step açıklama ve aktif satırı bir önceki adıma taşıdı. Telefon sahnesi Fit ile 125.2 px yüksekliğe sığdı; kullanılabilir canvas 137.2 px idi. Geçici viewport override kontrol sonunda kaldırıldı.
- Kanıt: docs/screenshots/compact-workbench-desktop.png ve compact-workbench-mobile.png.
- Claude incelemesi: claude-worker salt okunur kaynak incelemesi; breadcrumb tekrarı, dar sütunda wrap, kart içi scroll ve dark-surface kontrast önerileri değerlendirildi. Çalışan UI’nin doğrulaması Codex tarafından yapıldı.
- Performans: Web Vitals/INP/frame süreleri ölçülmedi; performans PASS iddiası yok. Yeni asset veya motion engine eklenmedi.
- Kabul/yayın: Kullanıcı kabulü bekleniyor. Yalnız yerel preview güncellendi; production yayını yapılmadı.

## 2026-10-13 — İlk denemeye göre tasarım revizyonu
Source/build: 15 test geçti. Arama filtresi, paylaşılmış listenin korunması, playback'in method kartındaki tek konumu ve native input select olayının işlem seçimini bozmadığı regresyon testiyle doğrulandı. Production build 263.29 kB raw / 71.46 kB tahmini transfer; önceki UI build 263.93 kB raw idi. Bu bundle karşılaştırması kullanıcı performans ölçümü değildir; Web Vitals/INP/frame süreleri ölçülmedi.
Referans: DataStructures_Animation kaynakları ve tasarım belgeleri incelendi. Yerel 4500 dev server derlendi ama Chrome referans ekranı boş kaldı ve DOM bağlantısı zaman aşımına uğradı; referansın canlı render'ı doğrulanamadı. Referans repo kaynakları değiştirilmedi. İnceleme için açılan server durduruldu. Claude-worker yalnız kaynak karşılaştırması yaptı; çıktısı değerlendirildi, dosya yazmadı.
Browser/V2: Chrome 1440×900 üzerinde Node ve AddFirst/AddLast kontrol edildi. Search remove dört dosya gösterdi, clear tekrar bütün ağacı gösterdi. Run/Pause ve Next ile A, ardından aynı listede B eklendi; size=2, gerçek next n2→n3→null, tek aktif code satırı görüldü. Previous/Next method controls kartından çalıştı. Ara son-adım hareketinde SVG yüksekliği 390 olarak korundu, yerleşme bitince 225'e döndü; node y pozları eşitlendi ve kutular ayrık kaldı. Açıklama/değişken kartları 147.133 / 441.414 px ile 1:3 oranını korudu.
Resize: keyboard ArrowRight code genişliğini artırdı. 800×700 viewport'ta açık Sidebar 228px overlay olarak durdu; Code 348px, Visualization 370px, sağ kenar 788px idi; body 800×700, sayfa taşması yok. Telefon kontrolü ve kanıt yolları aşağıda tamamlanır.
Kabul/yayın: Bu görevde yerel V2 uygulaması revize edildi; kullanıcı kabulü henüz alınmadı, production deploy yapılmadı.

Telefon son kontrolü: 390×844 viewport ve body ölçüleri aynı; kartlar 88/264 px (1:3), canvas 134.156 px ve Fit sahnesi 122.156 px. A→B→null diyagramı görünür; method/playback ve dil seçenekleri erişilebilir. Source event düzeltmesinden sonra yeni console error gözlenmedi. Geçici viewport ayarı kaldırıldı. Kanıt: docs/screenshots/reference-revision-node.png, reference-revision-desktop.png, reference-revision-mobile.png; boyut ve byte metadata docs/assets.json içinde kayıtlı.

## 2026-10-13 — Pointer ve görünürlük düzeltmesi
Source: 17 test geçti. Yeni testler aynı y’de düz next yolunu, ortak Node’a ayrı pointer girişlerini ve altı ekleme/silme trace’inin tüm ok köşeleri/etiketlerinin kamera içine sığmasını doğrular. Production build başarılı (264.20 kB raw). Geometri kodunun küçük anlamlı birimleri Türkçe yorumlarla açıklandı.
Browser: Chrome 1440×900 AddFirst(A), ardından AddFirst(B) adımlarında üst yeni Node / alt eski liste bağlantısı kontrol edildi. Hazırlık adımında SVG height=402, Fit=100%; next/reference path DOM sınırlarından kırpılan yok. 390×844 ekranında aynı hazırlık adımında Node, null, pointer etiketleri ve okları kontrol edildi; kırpılan eleman=0, Fit=34%, body ölçüsü viewport ile aynı. Tamamlanınca B→A→null bağlantısı düz ve liste sol üstte kaldı. get(0) init adımında head/current aynı Node’a ayrı portlardan geldi.
Fit camera CSS gecikmesi kaldırıldı; Node RAF hareketi korunur. Canvas ölçümü afterRenderEffect üzerinden güncel DOM'a bağlanır; kaldırılmış/0 boyutlu elemanlar Fit'i 0% yapamaz. Sıfır ölçüm sorunu dev HMR sırasında görülüp giderildi; temiz reload ile gerçek ölçüm doğrulandı.
Kanıt: pointer-straight-list.png, pointer-separate-ports.png, pointer-staged-visible.png, pointer-staged-mobile.png (docs/screenshots). Kullanıcıdaki üç geçici screenshot erişim hatası nedeniyle görülemedi; tarif ve çalışan UI üzerinden ilerlenmiştir. Web Vitals/frame performansı ölçülmedi. Yerel preview güncellendi; production deploy yapılmadı.

- 2026-10-13: Header/rail ve yoğunluk revizyonu: 17 test + production build başarılı. Chrome 1440×900 üzerinde header DOM’da yok; logo ve toggle solda alt alta. Sidebar ayıracı 16 kez sağa alınsa da 240px sınırında kaldı. Değişken fontu 13px, açıklama 14px; başlıklar korunur. AddFirst/AddLast aynı listede çalıştı. /favicon.svg HTTP 200 ve sunulan HTML icon link’i yeni SVG’ye bağlı. Browser otomasyonu kendi favicon badge’ini eklediğinden kaynak/HTTP kontrolü gerçek favicon bağlantısını doğrulamak için kullanıldı.

- 390×844 son kontrol: body viewport ile aynı, yatay/dikey sayfa taşması yok; sabit marka şeridi 48px. Geçici viewport sıfırlandı. Son görünüm docs/screenshots/rail-and-compact-nodes.png olarak kaydedildi.

- 2026-10-13: Sidebar ve radiuslu routing: 18 test geçti, production build başarılı. Yeni insertAt attach testinde next koridorları referans etiketi kutularını kesmiyor; bağlı dönüşler Q komutu içeriyor. Geometri testi gerçek sampleNodes iki fazlı hareketini kullanır. Chrome 1440×900: A/B listesine insertAt(1,X), 8/10 attach adımı canlı yeniden üretildi; previous etiketi ve iki next bağlantısı ayrı koridorlarda, radiuslu dönüşlerle görünür. Açık Sidebar sol şerit olmadan logo/Data Structures ve menu/search satırlarından oluşur. 390×844 body viewport ile aynı, sayfa taşması yok. Kanıt rounded-insert-and-sidebar.png. Geçici viewport kaldırıldı; yalnız yerel preview güncellendi.

- 2026-10-13: Çoklu next girişleri için 19 test geçti; production build başarılı. Yeni test insertAt link adımında iki kaynağın aynı hedefe farklı y girişlerinden ve merkez çevresinde simetrik geldiğini doğrular. Mevcut etiket/kamera ve gerçek hareket testleri de geçti.

- Canlı Chrome 1440×900: insertAt(1,X) link adımı 7/10 yeniden üretildi. Aynı n3 hedefindeki iki next bitişi x=298, y=311.333 ve y=332.667; merkez y=322, simetrik ayrı girişler. Radiuslu yollar ve etiketler görünür. Kanıt separate-next-ports.png. Geçici viewport kaldırıldı.

- 2026-10-13: 20 test ve production build başarılı. Yeni template testi Sidebar kapatma/açmada aynı tek DOM butonunun korunduğunu doğrular. Chrome 1440×900 açık/kapalı kontrol koordinatları x=8,y=56; açıklama 16px/500 ve variable gap 2px. 390×844 body boyutu viewport ile aynı; kontrol yine x=8,y=56. Kanıt: docs/screenshots/fixed-sidebar-control.png. Geçici viewport sıfırlandı; bu revizyon yerel preview üzerinde, yeni push/deploy yapılmadı.

- 2026-10-13: Açık rail kaldırma revizyonu: 20 test ve build başarılı. Chrome 1440×900 açık Sidebar x=0 ve rail yok; kapatıldığında logo y=12, menu y=56 olan rail var; tekrar açılabiliyor. Kanıt sidebar-without-open-rail.png. Geçici viewport sıfırlandı. Yerel preview güncellendi.
