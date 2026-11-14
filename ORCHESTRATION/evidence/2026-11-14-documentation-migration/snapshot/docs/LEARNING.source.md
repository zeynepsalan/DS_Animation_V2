# İlk Angular sürümünü okuma rehberi

Bu rehber projedeki kodu başlangıç seviyesinde okumak için hazırlanmıştır. Önce uygulamayı açıp bir işlem izle; sonra aşağıdaki sırayla kaynakları oku.

## 1. Angular'dan bağımsız veri modeli

`src/app/core/node.ts` ile başla. `Node<T>` içindeki T bir generic tür parametresidir; sınıfın veri türünü sonradan seçmeni sağlar. `next`, başka bir Node nesnesine referanstır. Bir Node bütün listeyi veya liste fonksiyonlarını bilmez.

`src/app/core/singly-linkedlist.ts` head referansı ve eleman sayacı tutar. Son Node için ayrı tail alanı saklamadığımızdan sona ekleme ve son elemanı silme sırasında head'den başlayıp next bağlantılarıyla ilerleriz. Önce addFirst, ardından addLast ve insertAt fonksiyonlarını oku.

Java/C örneklerinin tamamı `examples/` içinde. Fonksiyonlar doğrudan data, sayı, boolean veya void döndürür. Yanlış index için if kontrolü erken return/null üretir; animasyon kaydındaki error açıklaması fonksiyonun dönüş tipine eklenmez. Bu güvenli davranış Java'nın hazır LinkedList exception sözleşmesinden farklıdır.

## 2. Component nedir?

Component ekranda bir parçanın görünümünü ve etkileşimini yönetir. `@Component` selector, template ve bağımlılıkları tanımlar. Projede standalone component'ler kullanılıyor; ayrı NgModule oluşturmuyoruz.

`src/app/app.ts` ve `app.html` ana ekranı birleştirir. Sidebar, Codebar ve Visualization ayrı component'lerdir. `input()` ebeveynden veri alır, `output()` kullanıcı eylemini ebeveyne bildirir. Sidebar algoritmayı çalıştırmaz; yalnızca seçilen fonksiyonu bildirir.

Resmi kaynaklar: [Components](https://angular.dev/guide/components), [Inputs](https://angular.dev/guide/components/inputs), [Outputs](https://angular.dev/guide/components/outputs).

## 3. Signal ve computed

`signal` değişebilen bir değer tutar. Örneğin `selection.set('addFirst')` seçimi değiştirir. Template `selection()` ile değeri okur; Angular gerekli görünümü günceller.

`computed` başka signal'lardan bir değer türetir. Örneğin seçili fonksiyonun bilgisi ve mevcut işlem adımı elle ayrı ayrı güncellenmez; ilgili signal değişince tekrar hesaplanır. Bu, kod ile animasyonun farklı adımlarda kalmasını önler.

Resmi kaynak: [Signals](https://angular.dev/guide/signals).

## 4. Template bağlama ve form

`[selected]="selection()"` bir değeri child component'e aktarır. `(select)="select($event)"` o component'ten gelen olayı karşılar. `[(ngModel)]="value"`, input ile TypeScript alanı arasında iki yönlü bağlantı kurar; bunun için FormsModule import edilir.

`@if` koşullu görünüm, `@for` liste görünümü üretir. `track node.id` aynı Node'u farklı adımlarda aynı görsel öğeyle eşleştirir; bu hem gereksiz yeniden çizimi azaltır hem de hareketi animasyonlamaya yardımcı olur.

Resmi kaynaklar: [Templates](https://angular.dev/guide/templates), [Control flow](https://angular.dev/guide/templates/control-flow), [Template-driven forms](https://angular.dev/guide/forms/template-driven-forms).

## 5. Service ve dependency injection

`PlaybackService` component'ler arasında paylaşılacak ortak listeyi ve oynatmayı yönetir. `@Injectable({ providedIn: 'root' })` uygulama düzeyinde bir servis sağlar. `inject(PlaybackService)` bu servisin örneğini alır.

Algoritmalar servise bağlı değildir. TraceEngine, snapshot'tan bir çalışma kopyası oluşturup algoritmayı yürütür; observer her anlamlı adımı kaydeder. Player cursor değerini değiştirerek bu kayıtları gösterir. Previous Step, ters bir silme/ekleme algoritması çalıştırmaz; önceki snapshot'ı gösterir.

Resmi kaynak: [Dependency injection](https://angular.dev/guide/di).

## 6. Küçük çalışma senaryosu

1. Node ekranında data/next ayrımını incele.
2. addFirst('A') çalıştır ve bitmesini bekle.
3. addLast('C') çalıştır; current referansını izle.
4. insertAt(1, 'B') çalıştır; i ve previous değişimlerini izle.
5. Pause, Previous Step ve Next Step ile bağlantı değişimini tekrar gör.
6. Reset yap: bu son işlemin öncesindeki A → C listesi geri gelir.
7. Yeniden çalıştırıp tamamla; removeAt(1) ile B'yi sil.
8. clear() ile listeyi boşalt; removeFirst() ile boş liste kontrolünü izle.

Ekrandaki sayısal görünen değerler de String'dir: "42" bir data değeri, index ise tam sayıdır. Harf büyüklüğü ve boşluklar eşleşmede anlamlıdır; tamamen boş/yalnız boşluk içeren girişler formda reddedilir.

## Güncel ortam

Angular 22.2.2, TypeScript 6.0.x ve Node 24.15.0 ile kurulup doğrulandı. Sürümler package-lock.json içinde sabitlenir. [Angular sürüm uyumluluğu](https://angular.dev/reference/versions) ve [yerel kurulum](https://angular.dev/tools/cli/setup-local) kaynakları kurulum öncesinde kontrol edildi.

## 7. Ekrana sığma ve yumuşak hareket

100dvh tarayıcının görünen yüksekliğidir. Grid/flex çocuklarında min-height: 0 kullanmak içeriklerin sayfayı büyütmesini engeller. Sidebar nav ve kod editörü overflow: auto ile kendi içinde kayar. Parametre input'ları Codebar'ın altındaki fonksiyon imzasındadır.

Geometri `src/app/core/visual-layout.ts` içinde hesaplanır; veri yapısı modelinin ekran koordinatlarından haberi yoktur. SVG kutu, ok ve referans öğeleri kimlikleriyle korunur. Aynı cubic-bezier ve aynı 900 ms / speed süreleriyle transform ve d eğrileri birlikte ilerler. Bütün next yolları aynı M/C komutlarını kullandığından null ile Node hedefi arasında da interpolation yapılabilir.

Angular animate.enter/animate.leave, öğeyi aniden ekleyip kaldırmak yerine opacity geçişi sağlar. [Resmi enter/leave dokümanı](https://angular.dev/guide/animations) incelendi. Prefers-reduced-motion açıkken hareket azaltılır.

Ayrık Node ikinci satırda gösterilir. Yerleşim testi geçişin 101 ara oranını örnekler ve Node kutularının çakışmadığını kontrol eder. Etiketler ayrı yatay şeritlere alınır; ok uçları aynı Node üzerinde farklı yerlere iner.

Zoom görüntüyü değiştirir, algoritma durumunu değiştirmez. Fit, ResizeObserver ile canvas boyutunu ölçüp bütün işlem sahnesini sığdırır. Sahne boyutu işlem adımları boyunca sabit tutulur; tamamlanınca boş geçici satır kaldırılır ve Fit sonuç listesini yumuşak scale geçişiyle büyütür. Manuel zoom seçilmişse bu seçim korunur.

## Kaynak kodu okuma rotası

Önce core/dnode.ts ile veri modelini, sonra core/doubly-linkedlist.ts ile işlemleri incele. education/doubly-code.ts ekranda görünen metinleri üretir; tarayıcı bu Java/C metinlerini çalıştırmaz. Trace key kod satırını animasyon adımına bağlar. playback.service.ts işlem adımlarını ve liste durumunu yönetir. components/doubly-visualization.ts çizim ve hareketi sunar. signal durum saklar; computed mevcut durumlardan sonuç türetir; input/output bileşenler arasında veri ve olay taşır. Kaynak yorumları bu akışı küçük birimler üzerinden açıklar. Sitedeki Java yorumları kullanıcının son tercihiyle kaldırılmıştır.

## Circular Linkedlist’i okuma sırası

Önce src/app/core/circular-linkedlist.ts içindeki tail ve count alanlarını incele: head saklanmaz, ilk Node tail.next’tir. addFirst ile addLast arasındaki son tail atamasını karşılaştır. removeLast’te tail tutulmasına rağmen previous bulmak için neden ileri dolaşma gerektiğini izle. Ardından Traversal’da i<size koşulunu incele: halka null ile bitmediği için bir tur sınırı gerekir. Clear’da önce tail.next=null ile halka açılır; bundan sonra current!=null koşulu güvenle kullanılabilir.

Sitedeki Java örneği aynı atamaları yorumsuz gösterir; Türkçe açıklamalar Execution Step kartında ve TypeScript kaynak yorumlarındadır. Fonksiyon içindeki diğer method çağrıları kod panelinde aşağıda açılır; adımlama doğru çağrının satırına kayar. Snapshot.head ortak çizim altyapısı için tail.next’ten türetilir; modelde yeni bir head alanı değildir.
