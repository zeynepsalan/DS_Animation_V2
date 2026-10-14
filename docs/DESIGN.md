# Çalışma ekranı tasarım sözleşmesi

## Kaynak ve kapsam
2026-10-13 revizyonu: Kullanıcının ilk projesi DataStructures_Animation tasarım referansıdır. Kaynaklar: src/styles/tokens.scss, layout/sidebar, shared/code-panel, shared/controls, shared/list-visual ve docs/ui-layout.md. İlk proje dev server ile açıldı fakat Chrome sayfa boş kaldı ve sayfa kontrolü zaman aşımına uğradı; canlı referans render'ı doğrulanmış sayılmaz. Çıkarım kaynak kodu ve tasarım belgelerine dayanır. Referans kodu değişmedi. Mevcut V2 live browser kontrolü ayrı yapılır.
Kapsam layout/flow + component görsel sistemi; tek dosya yazarı Codex, Claude Code salt okunur kaynak incelemesi. Checkpoint temiz Git revision 041486b ve /tmp/ds-reference-checkpoint. Yeni dependency, ücretli servis, yayın veya harici asset yok.

## Yön seçimi ve ürün kuralları
Üç yön değerlendirildi: tüm mevcut panelleri koyu tutup yalnız paleti değiştirmek; referansı aynen aktararak runtime/reset/dil davranışını da değiştirmek; referansın görünümünü V2 akışına uyarlamak. Üçüncü yön seçildi: kullanıcı görsel benzerlik istedi; paylaşılan liste, Reset işlemin başlangıcı, Türkçe açıklamalar ve İngilizce keywordler korunur.
Ana eylem method imzasına parametre girip Run kullanmaktır. Koyu Sidebar/IDE, kod altında koyu controls kartı, sağda açık Visualization; üstte kompakt dosya breadcrumb. Playback aynı method kartındadır. Variables/Execution üstte 1:3 oranlı bilgi kartlarıdır. Node data koyu indigo; next bebek mavisi. Kuyruk alanı veya reference projedeki diğer veri yapıları bu revizyonla eklenmez.

## Tokenlar ve geometri
src/styles.css tek otoritedir. --primary #261b3e; --panel #18122a; --surface #211a36; --blue #a8d4f0; --blue-strong #6bb3de; --arrow #397ba5 (açık zeminde daha okunur); --canvas #f7f9fc; --bg #ffffff; --border-light #d8dee8; --callout #eaf5fc; --bookkeeping #f1f3f8. Text-code #e8ecf4; muted-dark #9aa3b5; text-light #261b3e; muted-light #5c6578. Gradient/dot texture/ağır gölge kullanılmaz.
Sans: Inter/Helvetica Neue/Helvetica/Arial/system fallback; mono: JetBrains Mono/SF Mono/Menlo/Consolas. Font dosyası indirilmedi, mevcut yerel fallback kullanılır. Masaüstü code 13.5px/24px; code tab 42px; controls 14×16px padding; kart radius 12px; gap 12px; küçük kart başlığı 9px. SVG icon ailesi UiIcon, 24×24 viewBox ve 1.7px stroke; eylem adları button'da erişilebilir label ile tanımlanır.

## Responsive ve durumlar
Sayfa 100dvh; içerikler panel içinde scroll. Code min 320px, Visualization min 360px, açık Sidebar min 180px. Kapalı masaüstü Sidebar 48px Explorer rail. Üç sütun sığmazsa Sidebar overlay; iki çalışma paneli sığmazsa stacked layout. Pencere/Sidebar genişliği değişince kod genişliği yeniden sınırlandırılır. 1:3 kart oranı her iki görünümde korunur; taşan açıklama/değişken içeriği kartta kayar. Search fonksiyon dosyalarını filtreler, işlem/list state'ini değiştirmez. Eşleşme yoksa kısa Türkçe mesaj gösterilir. Invalid input method içindeki role=alert ile açıklanır. Return doğrudan sonuç şeridindedir.

## Motion ve kanıt
Mevcut SceneMotion/RAF motoru korunur; SVG grup kimlikleri değişmedi, data/next hücre renkleri aynı grup içindedir. CSS geometriye ikinci saat eklemez. Reduced-motion kamera/progress geçişlerini de kapatır. Ölçümler ve browser senaryoları docs/VALIDATION.md içinde; Web Vitals ve frame süreleri ölçülmemiştir. Referans kabulü kullanıcının referans seçimiyle verildi; sonuç tasarımının kullanıcı kabulü henüz bekleniyor. Production yayını yapılmadı.

## Tekrarlanabilirlik ve içerik
Node ekranı yalnız bu token/geometri sözleşmesiyle uygulandı; ardından aynı kurallar AddFirst/AddLast içeriklerine uygulandı. Tam bağımsız yeniden inşa değildir: aynı componentler korunur. Bilerek kötü varyant olarak koyu metni koyu Visualization'a uygulayan eski tüm-indigo düzen kontrast/yüzey ayrımı incelemesinde reddedildi; production'a koyulmadı. Gerçek işlevler dışında öğretim, performans veya kullanıcı başarısı iddiası eklenmez. Empty: ilk eleman için addFirst/addLast önerilir; error: hangi parametrenin geçersiz olduğu açıklanır; success: gerçek Return ve korunan liste görünür. UI copy Türkçe öğretici prose + English teknik keyword.

## Pointer/kamera revizyonu
2026-10-13: Normal sıra y=90, x başlangıcı 90; sahne flex-start ve 16px canvas padding ile sol üstte durur. Aynı y ve ileri hedef için nextPoints düz doğru örnekler; farklı satırlarda yalnız gerekli güvenli şerit kullanılır. layoutReferences aynı Node'a gelen referansları karşılıklı kolonlara ve ayrı top port'lara yerleştirir. sceneBounds ok köşeleri + etiketler + 24px emniyet boşluğu üzerinden hesaplanır. Fit'in minimum yüzdesi yok; kamera CSS transition gecikmesi Fit modunda kapalıdır. SceneMotion Node/ref RAF hareketi korunur; manual kamera Zoom geçişi çalışır. Kullanıcı screenshot'larının piksel detayına erişilemediğinden özgün görüntüyle birebir eşleşme iddia edilmez.

- 2026-10-13: Kullanıcı revizyonu: header kaldırıldı; logo ve Sidebar kontrolü sabit sol şeritte alt alta. Explorer varsayılan 200px, maksimum 240px (önceki masaüstü maksimumunun yaklaşık üçte biri). Node pitch 210px ile aradaki oklar kısaltıldı. Pointer label 72×24px/12px; değişken içerikleri 13px ve belirgin, execution açıklaması 14px. Kart başlıkları korunur. ds↗ logosu public/favicon.svg ile sekme ikonu yapıldı.

- 2026-10-13: Kullanıcı Sidebar kararı: açık durumda ayrı sol şerit/boşluk yok; ds↗ logo ve DATA STRUCTURES aynı satırda, menu toggle ve search ikinci satırda. Kapalı durumda yalnız tekrar açma şeridi korunur. Araya ekleme bağlantıları karşılıklı ayrı koridorlardan geçer; dönüşler quadratic SVG eğrisiyle 24px radius (kısa segmentte güvenli sınır) kullanır. previous etiketi ok koridorundan çıkarıldı; üç ortak referans ayrı sol satırlara alınır. Fonksiyonlar ve RAF motoru korunur.

- 2026-10-13: Kullanıcı next bağlantı kararı: aynı Node’a gelen birden fazla ok aynı noktada birleşmez. Hedef sol kenarı eşit aralıklı girişlere bölünür; iki ok merkez çevresinde yukarı/aşağı simetriktir. Kaynaklar y/x/kimlik sırasıyla deterministik sıralanır. Aynı satırdaki ok yalnız giriş yüksekliği farkı kadar kısa radiuslu koridorda ayrılır; tek bağlantı merkezde düz kalır.

- 2026-10-13: Son kullanıcı revizyonu önceki koşullu sol şerit kararını değiştirir: ds↗ logo ve altındaki tek Sidebar kontrolü kalıcı 48px şerittedir. Açma/kapatmada kontrol yeniden oluşturulmaz ve konumu değişmez. Sidebar içinde logo/menu tekrarı kaldırıldı. Variable satır aralığı 2px, satır padding 3px; Execution açıklaması masaüstünde 16px/500, küçük ekranda 14px. Kart başlıkları korunur.

- 2026-10-13: Son kullanıcı düzeltmesi: açık Sidebar yanında ayrı sol sütun kaldırıldı; logo başlıkta, menu logo altında search yanında. Yalnız kapalı durumda 48px logo/menu şeridi görünür. Açık panel genişlik hesabından rail çıkarılmaz. Önceki kalıcı şerit kararı bu kararla değiştirildi; kompakt variable ve büyük execution metni korunur.

- 2026-10-13: Oynatma klavye kısayolları: Space Play/Pause, ArrowRight Next Step, ArrowLeft Previous Step, R Reset. Native hover tooltip ve aria-keyshortcuts eklenir. Input/textarea/select/contenteditable, slider ve separator üzerinde, IME sırasında, modifier veya tuş tekrarıyla tetiklenmez. Disabled butonların kuralları klavyede de geçerlidir; odaklı buton/link üzerinde Space yerleşik aktivasyonunu korur.

## Doubly Linkedlist hazırlığı (2026-10-14, taslak)

MVP görünümü korunur; Sidebar’a yeni veri yapısı klasörü eklenmesi planlanır. Node’da data, prev ve next ayrı alanlar olarak gösterilir; ileri/geri oklar farklı yüksekliklerden geçerek ayrıştırılır. Yeni bağlantılar mevcut RAF motoruyla taşınır; her atama kod highlight ve Türkçe açıklamayla birlikte ilerler. Head/tail referansları ve null uçları Fit sınırlarına dahil edilir. Ayrı Node sınıfı ve Reverse Traversal kullanıcı yanıtına bağlıdır; henüz uygulanmadı.

- 2026-10-14: DNode siteye eklendi: Sidebar sınıf dosyası, Java/C/Pseudocode constructor kaynağı, imzada data/prev/next parametreleri, bağımsız komşu veya null seçimi. Her data/prev/next ataması ayrı kod satırı ve ayrı trace adımıdır. Ortak playback ve klavye kısayolları kullanılır; DNode trace Singly listesini değiştirmez. Constructor yalnız kendi alanlarını atar, komşuların ters bağlantıları null kalır. Sahne merkez/sol/sağ slotları ve aşağı ayrılan null yollarıyla çakışmayı önler. Doubly Linkedlist fonksiyonları henüz entegre edilmedi.

## Doubly ilk grup hareket sözleşmesi

Mevcut MVP panel düzeni korunur. Sidebar’da Doubly Linkedlist klasörü altında yalnız çalışan üç fonksiyon bulunur. Method dosyası DoublyLinkedlist / addFirst.java gibi yapı adıyla ayırt edilir. Eklemede yeni nesne üstte slot 0, eski liste altta slot 1 ve sonrası olarak hazırlanır; işlem tamamlanınca eski nesneler aynı x konumundan üst sıraya taşınır. Tek SceneMotion RAF motoru Node ve okları birlikte günceller; yeni alan bağlantıları aynı saatte belirir. Next/Previous hareket tamamlanmadan yeni adım başlatmaz, Reset ara hareketi başlangıca yönlendirebilir. Reduced motion statik hedefi gösterir.

next portu y+24, prev portu y+48; dikey geçişler ayrı radiuslu koridorlar kullanır. head/tail/node etiketleri 64px genişlikte üst portlara ayrılır; üç ortak referansta üçüncü etiket ortadaki boş dikey koridoru kullanır. Null uçlar Node dışındadır. Fit tüm işlem boyunca sabit sahne sınırı kullanır; ResizeObserver ölçek değişiminde CSS gecikmesi olmadan bütün sahneyi sığdırır. Manual zoom paneller içinde kaydırılabilir. Liste büyümesine keyfi sınır koyulmaz; çok uzun listelerde Fit küçülür ve manual zoom kullanılabilir.

- Son kare yerleştiğinde hazırlık alanının 440px yüksekliği 240px dinlenme alanına iner; hareket sürerken küçülmez. Mobil final Fit okların tamamını koruyarak metin/kutuları daha okunur büyütür.
