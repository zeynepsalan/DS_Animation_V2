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
