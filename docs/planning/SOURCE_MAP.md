# Ders kaynakları kapsam haritası

Tarih: 2026-11-16. Durum: kaynak araştırması ve plan girdisi; ürün kapsamı onayı veya uygulanmış mimari değildir. Yazar: `course_pdf_analysis` worker (gpt-6.1-sol). Diğer worker'ın kod envanteri bu belgeden ayrıdır; “temeller tamamlandı” ifadesi Array uygulamasının varlığına kanıt sayılmamıştır.

## Kanıt ve okuma yöntemi

`sources/` içinde 11 PDF, toplam 425 fiziksel PDF sayfası vardır. Week01–07 ve Week09–12 bulunur. Week08 dosyası yoktur; ders haritası Week08'i Midterm olarak gösterir (ör. Week05 s.2). Week13 ve Week14 dosyaları da yoktur. Aşağıdaki bütün `s.` numaraları **1 tabanlı fiziksel PDF sayfasıdır**; slayt altbilgisindeki numara değildir. Özellikle Week03 ve Week05'te bu iki numara yer yer farklıdır.

Bütün PDFlerin bütün sayfalarının metni yerel macOS PDFKit ile çıkarıldı; konu, işlem ve ilişkileri içeren bölümler okundu. Poppler/pypdf ortamda mevcut olmadığından PDFKit native thumbnail render kullanıldı. Diyagramların yalnız metniyle yetinilmedi: aşağıdaki 46 sayfa PNG olarak render edilip altı temas sayfasında gözle incelendi. Metin ve PNGler yalnız `/tmp/ds-course-map/` altında geçicidir. Asıl PDFler değiştirilmedi/yeniden adlandırılmadı; yeni paket veya ücretli servis kullanılmadı. İnternet araştırması yapılmadı; dersin güncel kütüphane/gerçek dünya iddiaları ayrıca doğrulanmış teknik öneri değildir.

Kanıt katmanları:

- **Kaynak kapsamı:** PDFnin gerçekten öğrettiği sözleşme, temsil veya algoritma.
- **Mevcut proje gereksinimi:** kanonik proje kuralları/kararlarda kabul edilmiş davranış; PDF örneğiyle çelişirse proje kararı korunur.
- **Öneri:** PDFlerden türetilen geliştirme sırası/mimari/öğretim fikri; kullanıcı tarafından kabul edilmiş yeni kapsam değildir.

## Week01 — Java, OOP ve ADT temeli

[27G_CSE201_DataStructures_Week01.pdf](../../sources/27G_CSE201_DataStructures_Week01.pdf), 43 sayfa.

- s.1–8: ders girişi ve dönem yol haritası; idari kurallar uygulama özelliği değildir.
- s.11–19: primitive/reference ayrımı, aliasing, null, kimlik/değer eşitliği, `Node` içinde `element` ve `next`; kutu/ok metaforu. s.18'de self-reference yapısı açıkça gösterilir.
- s.22–24: class/instance, constructor ve encapsulation.
- s.25–29: ADT davranış sözleşmesidir, Array/linked yapılar implementasyondur. Stack örneği `push`, `pop`, `top`, `size`, `isEmpty`; Java interface/abstract class/concrete class ayrımı. s.27 aynı Stack sözleşmesini ArrayStack ve LinkedStack'in uyguladığını gösterir.
- s.31–35: inheritance/polymorphism, davranış sözleşmesini koruma, generic container ve wrapper türler.
- s.36–38: exception ve empty-pop tasarım tartışması. s.38 exception'ı savunur; bu **projenin null/erken return ve Türkçe hata geri bildirimi kuralını değiştirmez**. Kaynağın kendi Week05 s.9 örneği de empty-pop için null kullanır; tek tutarlı ürün API politikası kaynaktan otomatik çıkarılamaz.
- Görsel gözlem: s.14 iki referansın tek nesneyi gösterdiği üç aşamalı şema; s.18 data/next bileşimi ve zincir; s.27 interface→iki implementation ilişkisinin görsel anlatımı doğrulandı.
- Öneri: bağımsız `Node<T>` öğretimi ve ADT/implementation ayrımı sonraki tüm modüllerde korunmalı; `Node` bütün yapılara zorla ortak üst sınıf yapılmamalı.

## Week02 — Array ve Linked List temsilleri

[27G_CSE201_DataStructures_Week02.pdf](../../sources/27G_CSE201_DataStructures_Week02.pdf), 42 sayfa.

- s.7–14: contiguous Array, index/adres hesabı, O(1) erişim; front insert için sağa kaydırma, index remove için sola kaydırma; full Array için yeni blok+copy ve doubling tartışması (s.13). **Dinamik büyüme ders kapsamıdır, projenin sabit kapasiteli Array kararının yerine geçmez.**
- s.17–26: SinglyLinkedList `head`, `tail`, `size`; `addFirst` atama sırası, `addLast`, `removeFirst`, `removeLast` için predecessor'a yürüyüş; indexed erişim ile bağlantı güncelleme maliyeti ayrımı.
- s.28–30: circular singly ring, `tail.next=head` açıklama örneği, round-robin `current=current.next`; null'a kadar yürümek yerine başlangıca dönüşü/size sayısını kullanma.
- s.31–35: Doubly Node `prev/next`, O(1) removeLast; header/trailer sentinel alternatifi ve link güncellemeleri.
- s.36: list equality ve shallow element sharing ile yeni node kopyalama. s.38 karşılaştırmalı operasyon maliyetleri; s.39 kullanım senaryoları.
- Görsel gözlem: s.10 Array front shift'in üç durumu; s.19 yeni Node'un önce eski head'e bağlanması; s.28 kapanan halka; s.31 ters yönlü iki ok; s.34 gerçek data Node'larından farklı sentinel kutuları doğrulandı.
- Gereksinim sınırı: mevcut bağımsız Node/DNode, Singly/Doubly ve tail-only Circular kararları korunur. Kaynağın generic circular açıklaması yeni head alanı gerektirmez. Sentinel, clone/equality ve round-robin ders örneği olmaları nedeniyle otomatik yeni ürün özelliği değildir. Bağımsız Reverse Traversal yeniden kapsam içine alınmaz.

## Week03 — Algoritma analizi

[27G_CSE201_DataStructures_Week03.pdf](../../sources/27G_CSE201_DataStructures_Week03.pdf), 39 sayfa.

- s.7–14: deneysel süre ölçümünün sınırları, primitive operation sayımı, tek/nested loop, doubling test ve baskın terim.
- s.16–23: `1, log n, n, n log n, n², n³, 2ⁿ`; sıralı aramanın yarılama sezgisi; sort sınıflarının karşılaştırması. Merge/Quick/Bubble Sort burada **ad/kıyas düzeyindedir**, bu kaynak setinde ayrıntılı modülleri yoktur.
- s.25–30: Big-O üst sınır tanımı, sabit/baskın terim sadeleştirmesi; Ω/Θ kısa anma; best/average/worst case.
- s.31–35: tek/nested/halving loop analizi; Array/list operation scorecard; counterexample, contradiction, induction.
- Görsel gözlem: s.18 farklı büyüme eğrileri; s.34 Array/Singly/Circular/Doubly operasyon karşılaştırma tablosu doğrulandı.
- Öneri: mevcut işlemlerin trace'lerinden karşılaştırma, referans takibi ve kaydırma sayıları gösterilebilir. Bunlar gerçek performans benchmark'ı veya ölçülmüş tarayıcı hızı diye sunulmamalı; ayrı öğretici sayaçlardır.

## Week04 — Recursion

[27G_CSE201_DataStructures_Week04.pdf](../../sources/27G_CSE201_DataStructures_Week04.pdf), 37 sayfa.

- s.6–16: factorial, base/recursive case, küçük probleme geçiş, induction bağlantısı; frame parametre/locals/return adresi; call-stack ve unwinding; ulaşılmayan base case/stack overflow.
- s.19–23: sorted Array üzerinde recursive Binary Search; `lo/hi/mid`, empty-range/found base case; O(log n) call count ve factorial O(n).
- s.24–28: linear/binary/multiple recursion; directory disk usage; Fibonacci recursion tree ve tekrarlı işin exponential maliyeti.
- s.30–34: loop/recursion space karşılaştırması, tail recursion ve Java'nın frame yeniden kullanımına güvenmeme; branching data için recursion tercihi.
- Görsel gözlem: s.15 factorial frame stack ile return sırası; s.21 daralan Binary Search aralıkları; s.26 fib(4) çağrı ağacı doğrulandı.
- Öneri: Recursion öğretim modülü isteğe bağlı ayrı aşama; Tree'den önce trace altyapısına frame/local/output desteği gerektirebilir. Factorial/Fibonacci/disk-usage örneklerinin her biri otomatik kabul edilmiş ürün kapsamı değildir. Binary Search için sorted input önkoşulu görünür olmalı; Array ekleme modülü gizlice sort etmemeli.

## Week05 — Stack, Queue ve Deque

[27G_CSE201_DataStructures_Week05.pdf](../../sources/27G_CSE201_DataStructures_Week05.pdf), 40 sayfa.

- s.3: “three contracts, two machines each” çerçevesi; Array index arithmetic ile linked nodes ayrımı.
- s.5–13: Stack LIFO; `push(e), pop(), top(), size(), isEmpty()` (s.6). ArrayStack `data`, `t=-1`, capacity/full guard (s.8–9); LinkedStack SinglyLinkedList'e delegation: addFirst/removeFirst/first (s.10–11); maliyet ve memory karşılaştırması.
- s.14 ve s.34: bracket matching ve dilin call-stack'i kullanım örnekleri.
- s.17–26: Queue FIFO; `enqueue(e), dequeue(), first(), size(), isEmpty()` (s.18). Naive shifting Array (s.20) ve yalnız ilerleyen front (s.21) sorunları; circular Array modulo (s.22–25). Empty/full ayrımı için explicit size veya bir slotu boş bırakma alternatifleri; Java örneği `f` ve `sz` tutar, enqueue slotunu `(f+sz)%capacity` hesaplar. LinkedQueue head'den removeFirst/tail'e addLast (s.26).
- s.29–33: Deque: `addFirst, addLast, removeFirst, removeLast, first, last`; ortadaki index erişimi ADTde yoktur. DoublyLinkedList+sentinel ile O(1) uç işlemleri anlatılır. s.3 iki makine hedefini söylese de **ArrayDeque ayrıntılı algoritma/kod anlatımı verilmez**; s.37 performans tablosunda linked Deque yer alır.
- s.33: Stack/Queue'nun Deque işlemlerinin sınırlandırılmasıyla kavramsal ilişkisi; bu çizim zorunlu class inheritance anlamına gelmez.
- Görsel gözlem: s.10 top=head; s.23 kapasite5 wrap örneğinde F fiziksel index0'a yazılsa da mantıksal sırada C,D,E'nin arkasında; s.25 rear'ın hesaplanması; s.33 kavramsal aile; s.37 implementation maliyetleri doğrulandı.
- Öneri: önce LinkedStack+ArrayStack, sonra LinkedQueue+CircularArrayQueue, sonra DoublyLinkedDeque+CircularArrayDeque. ArrayDeque adımı ders çerçevesinden ve önceki iki implementation ürün hedefinden türetilen **ek tasarım önerisidir**; kaynakta tam kod bulunduğu söylenmemeli. Linked yapı için “sınırsız fiziksel bellek” iddiası kullanılmamalı.

## Week06 — Tree ve Traversal

[27G_CSE201_DataStructures_Week06.pdf](../../sources/27G_CSE201_DataStructures_Week06.pdf), 40 sayfa.

- s.5–14: general rooted tree; root/parent/child/sibling/leaf/internal/path/subtree; edge sayısı n−1; depth/height; binary tree'de left/right farkı; balanced ve skewed tree.
- s.15–18: linked binary Node `element,left,right,parent`; recursive height/depth. Array representation `left=2i+1`, `right=2i+2`, `parent=(i−1)/2`; seyrek ağacın boş slot maliyeti.
- s.21–28: Preorder, Postorder, Inorder; general tree'de Inorder'ın iki yönlü anlamının olmaması; recursive Java örnekleri, her Node'u bir kez ziyaret ederek O(n).
- s.29–30: directory/deletion/expression-tree uygulamaları; prefix/infix/postfix.
- s.31–33: Queue ile Breadth-First; Stack ile Depth-First; left-first preorder için sağ çocuğun önce push edilmesi. Container değişiminin traversal sırasına etkisi gösterilir.
- s.36–37: general Tree search by value O(n); BST ordering henüz yoktur. Heap/BST/balanced-tree sonraki adımlarına bağlanır; B-tree yalnız gelecek/ileri konu olarak anılır.
- Görsel gözlem: s.15 üç bağlantılı binary Node; s.17 aynı ağacın array index eşlemesi; s.25 üç output sırası; s.31 seviye sınırları; s.33 explicit stack sırası doğrulandı.
- Öneri: `BinaryNode<T>` gibi ayrı şekil modeli; mevcut next/prev Node sınıflarını tree çocuklarına uyarlamak için semantik bozma yapılmamalı. Binary Tree linked ve array temsilleri karşılaştırılabilir, fakat “her yapı her tabanı kullanmalı” şeklinde bir çapraz çarpım çıkarılamaz. Tree CRUD menüsü kaynakta tamamlanmış bir ADT interface olarak verilmez; kullanıcı kapsamı belirlenmelidir.

## Week07 — Priority Queue ve liste tabanlı sıralama

[27G_CSE201_DataStructures_Week07.pdf](../../sources/27G_CSE201_DataStructures_Week07.pdf), 38 sayfa.

- s.5–9: PQ `insert(k,v), min(), removeMin(), size(), isEmpty()`; Entry key/value; Comparable/Comparator ve sıralama kuralı.
- s.10–18: UnsortedPQ append+minimum scan; SortedPQ sıralı konuma yürüyüş+front min/removeMin. s.13 ve s.17 Java LinkedList tabanlıdır; s.14 Array shifting/linked walking ayrımı da anlatılır.
- s.23–34: generic PQ-sort: bütün girdileri insert, sonra removeMin; unsorted ile Selection Sort, sorted ile Insertion Sort; bağımsız Array kodları s.26 ve s.28. O(n²) maliyetin pahalı fazı değişir; Heap ile O(n log n) hedefi.
- s.35: Adaptable PQ yalnız tek slaytta `Entry` handle, `replaceKey` ve `remove(entry)` fikri; Dijkstra kullanım gerekçesi. s.36 A*, Huffman ve shortest-path adları kullanım örneğidir, ayrıntılı algoritma dersi değildir.
- Görsel gözlem: s.17 sorted list iterator ile insert; s.29 iki sort'un aynı PQ-sort çatısındaki faz ayrımı; s.34 Heap'in gelecekteki üçüncü implementation satırı doğrulandı.
- Öneri: `PriorityQueue<K,V>` için önce Entry/comparison davranışı belirlenir, sonra sorted/unsorted list stratejileri ve Heap paylaşabilir. Eşit priority için kararlılık/duplicate-key politikası ürün kararı olarak netleşmeli; kaynak örneği tüm ürün için onay değildir. Adaptable PQ ilk PQ sürümü için zorunlu sayılmamalı.

## Week09 — Heap

[27G_CSE201_DataStructures_Week09.pdf](../../sources/27G_CSE201_DataStructures_Week09.pdf), 35 sayfa.

- s.4–8: min-heap order + complete binary tree invariantları; kardeşlerin sıralı olması gerekmez; dense Array representation. Java `ArrayList<Entry<K,V>>`, parent/left/right, comparator ve swap kullanır.
- s.10–13: append+upheap insertion; s.16–22: root min, son Entry'yi root'a taşıma+küçük child yönünde downheap, removeMin Java kodu.
- s.25–29: repeated insert O(n log n) ile bottom-up build O(n) ayrımı; son parent'tan root'a downheap.
- s.30–31: HeapPQ ile PQ-sort ve tek Array'de max-heap kullanarak in-place Heap Sort; aktif heap bölgesi ile sorted suffix ayrımı.
- Görsel gözlem: s.8 eşzamanlı Tree/Array temsili; s.11 upheap swap'ları; s.19 downheap swap'ları; s.27 bottom-up ara durumları; s.31 max-heap/sorted suffix doğrulandı.
- Öneri: Tree ve Array renderer'ının **aynı state/Entry kimliklerinden** beslenen iki görünümü güçlü bir öğretim adayıdır. Kaynak ArrayList kullanımı, temel Array'in otomatik büyümesine verilmiş izin değildir; heap kapasite yönetimi ayrıca tasarlanmalıdır. Linked Heap eşdeğerini kaynak zorunlu kılmaz.

## Week10 — Map, Hash Table, Set ve Skip List

[27G_CSE201_DataStructures_Week10.pdf](../../sources/27G_CSE201_DataStructures_Week10.pdf), 41 sayfa.

- s.4–7: Map `get, put, remove, size, isEmpty, entrySet, keySet, values`; put mevcut key'de replace edip old value döndürür. Unsorted list map lineer findIndex baseline.
- s.11–14: hash code ve compression ayrımı; modulo, polynomial/Horner String hash, MAD örnekleri.
- s.15–22: collision; separate chaining (Array of LinkedList<Entry>), linear probing/cluster, silmede DEFUNCT tombstone, findSlot, double hashing, load factor ve resize/rehash.
- s.25–28: expected ve worst case farkı; equals/hashCode tutarlılığı; mutable key'nin erişilemez Entry üretmesi.
- s.29–32: hash temsilinde ordering kaybı; sorted map `firstEntry, ceilingEntry, subMap`; Set `add, remove, contains`, pairwise/HashSet duplicate detection.
- s.35–40: Skip List express levels, coin promotion, drop+scan `skipSearch`, insertion/removal towers; expected O(log n). Arama kodu ve tower çizimleri vardır, eksiksiz production implementation yoktur.
- Görsel gözlem: s.16 tek bucket altında iki Entry zinciri; s.19 boş slot ile tombstone farkı; s.22 yeniden hash etme kodu; s.36 düş/yatay arama yolu; s.38 üç katlı insert tower ve unlink edilen tower doğrulandı.
- Öneri: ilk Map baseline→chaining→probing şeklinde öğretim; HashSet, sorted-map ve Skip List ayrı genişleme dilimleri olmalı. Kaynaktaki hash resize örneği fixed Array kararını değiştirmez. Hash equality/comparator/duplicate semantics yeni key-value alanlarında önceden tasarlanmalı; yalnız mevcut String data alanını ikiye bölmek yeterli değildir.

## Week11 — BST ve AVL

[27G_CSE201_DataStructures_Week11.pdf](../../sources/27G_CSE201_DataStructures_Week11.pdf), 34 sayfa.

- s.3–9: global BST order, Inorder sorted output; recursive find/insert, unsuccessful search; örnek insert eşit key'i yeniden eklemez.
- s.10–13: remove leaf/one-child promotion; two-child için predecessor key'ini kopyalama ve eski predecessor'ı silme; successor alternatifinin gerekçesi.
- s.14–21: first, floor ve range/subMap; O(height); sorted insertion ile BST'nin linked-list biçimine bozulması.
- s.24–32: AVL'de her Node'un child-height farkı≤1; height metadata, x/y/z seçimi, sorted middle-on-top trinode restructure, dört rotation şekli; insertion sonrası yukarı çıkarken height fix/rebalance. AVL remove için tam repair trace/kodu bu dosyada verilmez.
- Görsel gözlem: s.11 remove82→predecessor80 kopyalanıp eski80'in çıkarılması; s.26 kökün dengesi yeterli olmayan örnekler; s.28 T1–T4 alt ağaçlarının korunması; s.30 dört şeklin aynı middle root sonucuna bağlanması doğrulandı.
- Öneri: plain BST→rotation primitive→AVL; Find/Insert/Remove ve traversal öncelikli adaylardır. AVL deletion, ordered-map geniş API ve eşit-key politikası ayrıca kapsamlanır. Metadata convention uyarısı: Week06 s.11 empty=-1/leaf=0 derken Week11 s.26–27 çizimleri leaf=1 düzeyi kullanır; tek ürün convention'ı seçilip öğretimde açıklanmalıdır.

## Week12 — Splay ve Red-Black

[27G_CSE201_DataStructures_Week12.pdf](../../sources/27G_CSE201_DataStructures_Week12.pdf), 36 sayfa.

- s.7–17: Splay locality; zig/zig-zag/zig-zig; parent-first zig-zig; find hit veya miss sonrası son ulaşılan Node'u root'a splay; insert yeni Node'u, remove silinenin parent'ını splay eder. Aramanın state değiştirmesi ve worst/amortised/expected ayrımı.
- s.20–24: Red-Black root/null-black, no-red-red, eşit black-height invariantları; (2,4) tree ile görsel eşleme ve yükseklik sınırı.
- s.25–29: BST insert+red; black uncle için restructure/recolor, red uncle için recolor ve yukarı propagation; fixDoubleRed kodu ve sıralı insert trace.
- s.31: deletion açıkça “Named, not traced”; double-black ve sibling'e göre üç case adı verilir. **Tam silme animasyonu/kodu kaynakta yoktur.** s.34–35 BST/AVL/Splay/RedBlack trade-off ve yükseklik karşılaştırması.
- Görsel gözlem: s.8 üç hareket; s.12 find1 ile path folding; s.22 Red-Black↔(2,4) gruplama; s.26–27 restructure/repaint farkı; s.31 deletion'ın yalnız kavramsal anlatılması doğrulandı.
- Öneri: ortak tree kimliği/rotation geometry sağlamlaştıktan sonra ayrı ileri aşama. Splay `find` read-only kabul edilmemeli; Reset/Previous/cancel başlangıç state'ini geri yüklemeli. Red-Black deletion tam ürün hedefi olacaksa bu kaynak setinin ötesinde resmi/temel algoritma kaynağı ve açık kabul ölçütü gerekir. (2,4) tree bağımsız yeni editör talebi değildir.

## Kaynakta anılan fakat tam ders/ürün kapsamı çıkarılamayanlar

Graph, Week13/14 ve Paths/MST yol haritasında vardır (ör. Week05 s.2). Week06 s.34 shortest path, Week07 s.35–36 Dijkstra/A*/Huffman örnekleri geçer. Bu 11 PDFde Graph ADT, adjacency-list/matrix implementation, DFS/BFS graph visited/cycle handling, Dijkstra, MST/Prim/Kruskal tam ders anlatımı yoktur. Tree Breadth-First bulunması, graph BFS bütün edge case'lerinin tanımlandığı anlamına gelmez. Week13/14 kaynakları gelmeden bu başlıklar **bekleyen kaynak/kapsam** olarak gösterilmelidir. Week08 için dosya istemek varsayılan önkoşul değildir: mevcut yol haritası Midterm der.

Merge/Quick/Bubble Sort, B-tree, Java collection ürünlerinin gerçek deployment/implementation ayrıntıları ve bütün lecture uygulamaları sırf adları geçti diye backlog'a zorunlu özellik olarak eklenmez. Slayt kodları pedagojik parçalar içerir; boş root, full capacity, hash edge cases ve invariants bakımından ürün koduna doğrudan kopyalanmış/doğrulanmış sayılmaz.

## Önerilen faz ve kavram bağımlılıkları

Bu sıra **öneridir**; uygulanmış durum/kullanıcı onayı değildir. Faz adları plan/UML belgeleri için sabit referans olabilir.

1. **F0 — Temel durumu doğrula:** mevcut kod envanteri ile Array boşluğu belirlenir. Node/DNode+list kararları korunur; mevcut kaynak/test/run kanıtları başka worker tarafından raporlanır. Kaynak: Week01–02; ürün otoritesi aşağıdaki kararlar.
2. **F1 — Sabit kapasiteli Array:** indexed read/update, insert/remove shift ve capacity/full/empty ayrımı. Week02 s.7–14. İşlem menüsünün tam adı/kapsamı mevcut proje API sözleşmesiyle uyarlanır; kaynaktaki doubling taşınmaz.
3. **F2 — ADT sözleşmesi ve ilk çift implementation:** Stack Array+Singly; Queue circular Array+linked; ardından Deque circular Array+Doubly. Week01 s.25–29, Week05. Basit Stack ile ortak trace extension doğrulanır; Queue wrap ve Deque two-end geometrisi bundan sonra gelir.
4. **F3 — Analiz ve Recursion öğretim katmanı:** operasyon sayaçları, call frames, Binary Search örneği. Week03–04. Sayaç açıklamaları F1/F2 ile paralel hazırlanabilir; ortak trace değişikliğinin tek yazarı olmalıdır. Tam Recursion demo seti owner kapsam kararıdır.
5. **F4 — Binary Tree ve traversal:** linked/array temsil karşılaştırması; Pre/In/Post/Breadth-First; Queue/Stack yardımcı state'i. Week06. F2 Queue ve F3 frame/state tasarımı bu işi kolaylaştırır.
6. **F5 — Entry/comparison ve Priority Queue:** sorted/unsorted implementations, sonra Heap ve bottom-up; PQ-sort→Selection/Insertion/Heap Sort. Week07+09. Entry ve comparator sözleşmesi sabitlenmeden ayrı worker implementasyonları başlatılmamalı. Heap için F1 Array index ve F4 tree geometry gerekir.
7. **F6 — Map/Hash/Set/Skip List:** unsorted Map baseline, chaining, probing/tombstone; sonra Set/sorted-map/Skip List ayrı dilimler. Week10. Entry/key-equality temeli F5 ile paylaşılabilir; son renderer sözleşmesinden sonra BST dalıyla paralel yürüyebilir.
8. **F7 — Search Trees:** plain BST ve remove cases→rotation primitives→AVL; sonra Splay/RedBlack ileri dilimler. Week11–12. F4 layout ile F5 key ordering önkoşuldur; AVL/RedBlack deletion kaynak sınırı ayrıca kapsamlanır.
9. **F8 — Graph ve yollar:** Week13/14 veya eşdeğer birincil kaynak ve ürün kapsamı gelince planlanır. Şimdiki 11 PDF bu fazın ayrıntılı acceptance criteria'sını sağlamaz.

Her ADTye Array ve LinkedList implementation üretmek otomatik evrensel kural değildir: Stack/Queue/Deque'de doğal eşleşmeler açık; Tree/Heap/Hash/SkipList için temsil tercihlerinin anlamı farklıdır. Önceki “ileride Array ve Linked List tabanlı implementasyonlar” kararı uygulandığında her yapı için pedagojik yarar ve maliyet ayrı açıklanmalıdır.

## Önerilen mimari/trace risk girdileri ve paralel çalışma sınırları

- **ADT sözleşmesi ≠ renderer ≠ trace:** Week01 s.25–29 ve Week05 s.33; aynı observable davranış farklı physical state'lerde olabilir. Öneri: domain operation sonucu ile adım açıklaması/kod satırı/görsel snapshot ayrı ama aynı operation/step kimliğine bağlanır. UML'de composition/delegation, conceptual family şemasından zorla inheritance üretmemeli.
- **Mantıksal sıra ≠ fiziksel index:** Week05 s.23 ve Week06 s.17. Öneri: queue order ve slot map ayrı; heap tree/array görünümü aynı Entry state'ini kullanmalı. Yoksa wrap/rotation animation sırasında iki görünüm ayrışabilir.
- **Kalıcı kimlik:** Week02 s.19 ve Week11 s.11 key copying; değer değişimi nesnenin değişmesiyle aynı değildir. Öneri: Node/Entry görsel kimliği data/key'den bağımsız olmalı; BST predecessor-copy ile relocation görsel olarak karıştırılmamalı.
- **Auxiliary state:** Week04 s.15, Week06 s.31–33: call-frame/Queue/Stack, locals ve output trace'in parçasıdır. Öneri: yalnız nihai container snapshot'ı Previous/Reset öğretimi için yetmez; bütün görünür ara state geri alınabilmeli.
- **Mutating read:** Week12 s.9,14–15. Öneri: “query ise state değişmez” shortcut'ı Splay'de kullanılmamalı. Hash/Skip List random promotions için de tekrar oynatmada aynı event/seed saklanmalı; randomness yeniden hesaplanmamalı.
- **Paylaşılan dosyada tek yazar:** öğretici içerik/örnek veri ve bağımsız domain implementasyonları ancak sabit interface'den sonra paralel hazırlanabilir. Playback/trace schema, central registry, renderer dispatch ve ortak layout aynı anda farklı worker'lara yazdırılmamalı. Tree family rotation/layout ve hash-bucket layout farklı domain işleridir; shared trace entegrasyonu tek worker'da kalmalı.
- **Karşılaştırma doğruluğu:** Week03 ve Week12 s.17. Öneri: worst/expected/amortised etiketleri karıştırılmamalı; gerçek cihaz performance ölçümü ayrı raporlanmalı. Dersin sayı/benchmark örnekleri bu uygulamada ölçülmüş performans değildir.

## Owner'a iletilebilecek en fazla üç gerçek kapsam sorusu

Bunlar kullanıcıya gönderilmiş/onaylanmış sorular değildir; soru formu worker'ına plan girdisidir. Önceden kararlaştırılmış capacity, Circular yönü ve Reverse Traversal tekrar sorulmamalı.

1. İlk devam teslimi için önerilen **Array→Stack iki implementation→Queue→Deque** zinciri mi öncelikli, yoksa PDFlerin tamamındaki ileri ağaç/map konularını ilk planın uygulanacak kapsamına almak mı isteniyor? Plan tüm kaynakları gösterebilir; ilk sürüm taahhüdü ayrıca seçilmeli.
2. Recursion ve Sorting ders örnekleri (ör. Binary Search, Selection/Insertion/Heap Sort) bağımsız kullanıcı menüleri mi olacak, yoksa veri yapısı modüllerindeki yardımcı öğretici örnekler mi? Öneri: ilk aşamada yardımcı örnek; tam ayrı modüller sonra.
3. Graph/Paths/MST kapsamı isteniyorsa Week13/14 kaynakları mevcut mu; yoksa bu başlıklar kaynak gelene kadar bekleyen bölüm olarak mı kalsın? Öneri: şimdilik bekleyen kaynak/kapsam.

## Önceki kararlar ve 14–16 Kasım bağlamı

- [DEC-0020](../../DECISIONS/product/DEC-0020-reverse-traversal.md): 10 Kasım, bağımsız Reverse Traversal kapsam dışı; sonraki yapılarda Array/Linked List implementation hedefi.
- [DEC-0021](../../DECISIONS/product/DEC-0021-circular-priority.md): 10 Kasım, Circular sonra fixed-capacity Array; otomatik büyüme yok.
- [DEC-0022](../../DECISIONS/product/DEC-0022-circular-model.md): 11 Kasım, Circular singly/tail-only ve bağımsız Node; aynı18 liste işlemi. Kaynak circular çizimi bu kararı geçersiz kılmaz.
- [CURRENT](../../ORCHESTRATION/context/CURRENT.md) ve [TASK-0001](../../ORCHESTRATION/tasks/TASK-0001-documentation-structure.md): 14 Kasım belge yapısı ve geliştirme bekleme durumu; Array sonraki ürün aşaması. Kullanıcının 16 Kasım geliştirmeye dönüş talebi yönetici görev girdisidir; bu araştırma belgesi eski beklemeyi kaldıran bağımsız karar kaydı icat etmez.
- [DEC-0035](../../DECISIONS/orchestration/DEC-0035-production-deploy-approval.md) ve [TASK-0002](../../ORCHESTRATION/tasks/TASK-0002-deploy-decision.md): 14–16 Kasım soru/karar formu ve deploy bağlamının kanonik bağlantıları. Yeni plan kategorisi eskileri silmeden bu form mekanizmasına eklenmelidir; bu worker form dosyalarını değiştirmedi.

Kaynak/build doğrulaması: yalnız kaynak araştırma belgesi yazıldı; ürün build/test çalıştırılmadı. Tarayıcı/cihaz gözlemi, performans ölçümü ve kullanıcı kabulü bu araştırmada yapılmadı. Production deploy yapılmadı.
