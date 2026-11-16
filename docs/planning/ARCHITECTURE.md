# Mimari envanter ve öneri

Durum: 2026-11-16 kaynak incelemesi ve **öneri**; gelecekteki bileşenler uygulanmış veya onaylanmış değildir. [Plan](PROJECT_PLAN.md), [UML](../UML.md), [ders kaynak haritası](SOURCE_MAP.md), [API](../API.md).

## Mevcut uygulama

Angular uygulamasında `App` seçim ve girişleri yönetir; `Sidebar`, `Codebar` ve görselleştirme bileşenleri görünümü sunar. `education/catalog.ts` ve `code-documents.ts`, `doubly-code.ts`, `circular-code.ts` işlem ve dil satırlarını sağlar. Kod satırı anahtarları ile trace adımları senkron tutulmalıdır. `scripts/export-examples.cjs` örnekleri üretir; `scripts/verify-examples.cjs` doğrular.

`core/node.ts` bağımsız `Node<T>`, `core/dnode.ts` bağımsız `DNode<T>` içerir. `singly-linkedlist.ts`, `doubly-linkedlist.ts` ve `circular-linkedlist.ts` gerçek algoritma sınıfları ve adım gözlemcilerini içerir; her biri 18 liste işlemini sunar. Circular yalnız `tail` saklar ve ilk Node `tail.next` üzerinden bulunur; snapshot içindeki head görsel projeksiyondur. `trace-engine.ts` Singly çalışma kopyasını yürütür; Doubly ve Circular trace fonksiyonları kendi sınıf dosyalarındadır. `dnode-trace.ts` constructor adımlarını üretir.

`PlaybackService` üç ayrı liste snapshot'ını, trace'i, cursor ve zamanlayıcıyı tutar; seçim ailesine göre başlatma ve geri yükleme dalları vardır. `execution.types.ts` içindeki `ListSnapshot`, `NodeSnapshot`, referanslar ve `ExecutionStep` liste/Node geometrisine bağlıdır. `Visualization` Singly ve Circular sahnelerini; `DoublyVisualization` ve `DNodeVisualization` kendi sahnelerini sunar. `visual-layout.ts`, `circular-layout.ts`, `doubly-layout.ts` ve `scene-motion.ts` geometri/hareketi destekler. `app.ts` seçim, form, kaynak dosya, çalıştırma ve sahne dallarını birleştirir. Bu paylaşılan alanlar aynı anda bağımsız değiştirilemez.

Kod envanterinde Array alan sınıfı, trace'i veya sahnesi yoktur. Bu, temellerin tümünün uygulandığı varsayımından farklıdır; kaynak kanıtı sınıf dosyaları ve seçim türleriyle sınırlıdır, yeni test veya tarayıcı çalıştırması yapılmamıştır. `package.json` Angular bağımlılıklarını `^22.2.0`, CLI/build'i `^22.2.2`, TypeScript'i `~6.0.2` olarak tanımlar; bunlar kurulu sürüm iddiası değil manifest aralıklarıdır.

## Önerilen sınır: sabit kapasiteli Array

Somut başlangıç önerisi: kapasite constructor sırasında kullanıcıdan alınan pozitif bir parametredir; `get`, `set`, `insertAt`, `removeAt`, `size`, `isEmpty` ve uygun ise `clear` işlemleri değerlendirilir. Kesin API ve boş/dolu/geçersiz durum davranışları seçilen kapsamla netleştirilir. [DEC-0021](../../DECISIONS/product/DEC-0021-circular-priority.md) otomatik büyümeyen sabit kapasiteyi zaten belirler. Array kendi indeksli hücre snapshot'ını ve trace üretimini kullanmalıdır; `Node<T>` veya `head/next` alanlarına zorlanmamalıdır. Yalnız gerçekten gereken ortak adım bilgileri (anahtar, açıklama, değişkenler, sonuç ve geri oynatma) ile yapı türüne özgü snapshot ayrımı tasarlanır. Seçilen çözüm mevcut listelerin davranışını ve kod anahtarlarını korumalıdır; soyutlama adı ve şekli henüz karar değildir.

Ortak playback zamanlama ve cursor davranışını kullanabilir, ancak başlangıç durumunu doğru yapı deposuna geri yüklemek için yapı türünü açıkça ayırt etmelidir. Reset işlemin başlangıcını geri yükler; Clear ayrı işlemdir. Yarım işlem seçim değişiminde geri alınır; tamamlanmış durum korunur. Array sahnesi indeksleri, kapasiteyi ve boş/dolu hücreleri göstermeli; satır vurgusu ve adımlar aynı trace'e bağlanmalıdır. TypeScript modelleri generic kalabilir, mevcut UI metin değerlerini String olarak işler. Fonksiyonlar doğrudan `void`, `T | null`, sayı, boolean veya dizi döndürür; `Result` sarmalayıcısı eklenmez.

Yeni yapılar için erken bir evrensel arayüz dayatılmaz: önce kaynak ve ürün kapsamı belirlenir, ardından ortaklaştırma en az iki somut ihtiyacın kanıtıyla değerlendirilir. Giriş doğrulaması, state sahipliği, trace üretimi, kod eşlemesi ve görselleştirme ayrı sorumluluklar olarak test edilir. Kapsam büyürken App ve playback dallarının nasıl ayrılacağı Array entegrasyonundaki somut sözleşme üzerinden kararlaştırılır.

## Taslak Queue temsil sınırı

Mevcut `SinglyLinkedlist` yalnız `head` tutar ve `addLast` son Node'a kadar yürür; doğrudan bu çağrıya dayanan bir LinkedQueue için enqueue O(1) olduğu varsayılamaz. Week05'teki O(1) linked Queue davranışını hedeflemek için, onaylanmış nihai tasarım olmamak üzere iki seçenek incelenir: tail-only Circular üzerinde uygun bir Queue adaptörü veya kendi `head`/`tail` uçlarını tutan ayrı linked Queue. Her seçenekte FIFO sırası, boş/tek Node geçişleri ve bağımsız state/trace doğrulanmalıdır; mevcut Singly davranışı sessizce değiştirilmez.

## Değişiklik kapıları

Her işlem grubunda model kenar durumları, trace adımları/kod anahtarları, geri/ileri/Reset/iptal ve farklı yapıların bağımsız durumları doğrulanır. Java/C/Pseudocode değişirse `npm run export:examples`, uygun olduğunda `npm run verify:examples`; ayrıca ilgili testler ve `npm run build` çalıştırılır. UML ve API gerçek değişiklikle birlikte güncellenir. Görsel değişiklikler desteklenen masaüstü ve mobil tarayıcılarda gözlemlenir; kaynak/build, cihaz gözlemi, performans ölçümü, kullanıcı kabulü ve production ayrı raporlanır. İddia edilmeyen ölçüm yapılmış sayılmaz.
