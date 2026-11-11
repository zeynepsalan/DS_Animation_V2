// Veri, prev ve next taşıyan bağımsız generic DNode sınıfını getirir.
import { DNode } from './dnode';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type {
  DoublyOperation,
  ExecutionStep,
  ListSnapshot,
  Parameters,
  StepObserver,
  Trace,
  Variables,
  Operation,
} from './execution.types';

/** Generic Doubly Linkedlist: 18 method’un her bağlantı ve değişken adımı ayrı gözlenir. */
export class DoublyLinkedlist<T> {
  // Boş listede iki uç da null’dır.
  head: DNode<T> | null = null;
  // Listenin son nesnesini gösteren referans bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  tail: DNode<T> | null = null;
  // Listedeki eleman sayısını tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private count = 0;
  // Yeni nesne bağlanmadan önce de sahnede gösterilir.
  private pending: DNode<T> | null = null;
  // Yerel değişkenler ve referanslar her semantik adım boyunca görünür kalır.
  private variables: Variables = {};
  // Değişken isimlerini gerçek nesne kimlikleriyle eşleyen referanslar bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private references: Record<string, DNode<T> | null> = {};
  // Bu sınıf örneği oluşturulunca bir kez çalışır; başlangıç bağımlılıkları veya gözlemcileri burada hazırlanır.
  constructor(private readonly observer?: StepObserver<T>) {}

  // Bütün erişilebilir ve geçici nesneleri bağımsız bir kayıt olarak çıkarır; sonraki mutasyonlar bu kaydı değiştirmez.
  snapshot(): ListSnapshot<T> {
    // Geçici nesne ve iki uçtan erişilen nesneler aynı kimlikle bir kez kaydedilir.
    const nodes = new Map<string, DNode<T>>();
    // İteratif ziyaret uzun listelerde JavaScript çağrı yığınına yük bindirmez.
    const queue = [this.head, this.tail, this.pending, ...Object.values(this.references)];
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (queue.length) {
      // İşlemde oluşturulan veya gösterilen nesne bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const node = queue.pop();
      // Eksik veya daha önce ziyaret edilen nesneyi atlar; iki yönlü zincirde sonsuz döngü oluşmaz.
      if (!node || nodes.has(node.id)) continue;
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      nodes.set(node.id, node);
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      queue.push(node.prev, node.next);
    }
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return {
      head: this.head?.id ?? null,
      tail: this.tail?.id ?? null,
      size: this.count,
      nodes: [...nodes.values()].map((n) => ({
        id: n.id,
        data: n.data,
        prev: n.prev?.id ?? null,
        next: n.next?.id ?? null,
      })),
    };
  }
  // Önce nesneleri, sonra kimlikler üzerinden bağlantıları kurarak eski adımı geri yükler.
  static fromSnapshot<T>(snapshot: ListSnapshot<T>, observer?: StepObserver<T>) {
    // Önce bütün nesneler, ardından referansları kurulmalıdır.
    const list = new DoublyLinkedlist<T>(observer);
    // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon kimliğe göre Map içinde tutulur; referans hedefi hızlı ve kararlı bulunur.
    const nodes = new Map(snapshot.nodes.map((n) => [n.id, new DNode(n.data, null, null, n.id)]));
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const n of snapshot.nodes) {
      // Bu nesnenin geri bağlantısını günceller; komşunun ileri alanı ayrı satırda değiştirilir.
      nodes.get(n.id)!.prev = n.prev ? (nodes.get(n.prev) ?? null) : null;
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      nodes.get(n.id)!.next = n.next ? (nodes.get(n.next) ?? null) : null;
    }
    // Uçlar ve sayaç da başlangıç durumundan geri yüklenir.
    list.head = snapshot.head ? (nodes.get(snapshot.head) ?? null) : null;
    // Bu atamayla list.tail güncellenir; sonraki satır yeni değeri kullanır.
    list.tail = snapshot.tail ? (nodes.get(snapshot.tail) ?? null) : null;
    // Eleman sayacını bu işlemde gereken yeni değere ayarlar.
    list.count = snapshot.size;
    // Singly Linkedlist’in kalıcı liste durumu çağıran fonksiyona döndürülür.
    return list;
  }
  // Tek semantik değişimden sonra veri, değişken ve referans fotoğrafını gözlemciye gönderir.
  private step(
    key: string,
    explanation: string,
    variables: Variables = {},
    references: Record<string, DNode<T> | null> = {},
    error = false,
  ) {
    // Bir atama yalnız kendi değişkenini günceller; önceki değişkenler kaybolmaz.
    this.variables = { ...this.variables, ...variables };
    // Bu atamayla this.references güncellenir; sonraki satır yeni değeri kullanır.
    this.references = { ...this.references, ...references };
    // this.observer çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.observer?.({
      key,
      explanation,
      variables: { ...this.variables, size: this.count },
      references: Object.fromEntries(
        Object.entries({ ...this.references, ...(this.pending ? { node: this.pending } : {}) }).map(
          ([name, node]) => [name, node?.id ?? null],
        ),
      ),
      snapshot: this.snapshot(),
      ...(error ? { error: true } : {}),
    });
  }
  // Yerel referansların kapsamını bitirir, son adımı kaydedip gerçek sonucu döndürür.
  private finish<V>(value: V, key = 'return'): V {
    // Method bitince yerel referanslar scope dışına çıkar; ayrık nesneler sahneden silinir.
    this.references = {};
    // Bu atamayla this.pending güncellenir; sonraki satır yeni değeri kullanır.
    this.pending = null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(key, 'İşlem tamamlandı. Sonuç aşağıda; liste sonraki işlem için korunur.');
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return value;
  }
  // Index’in tam sayı ve geçerli aralıkta olup olmadığını kontrol eder.
  private invalid(index: number, insertion = false): boolean {
    // Beklenen index hatası listeye dokunmaz; Java int parametresi UI’da doğrulanır.
    return (
      !Number.isSafeInteger(index) ||
      index < 0 ||
      index > this.count ||
      (!insertion && index === this.count)
    );
  }
  // Beklenen kullanıcı hatasını guard adımıyla açıklar; listeyi değiştirmeden güvenli dönüş yapar.
  private failure(message: string): null {
    // Exception yerine guard adımı ve doğrudan null dönüşü sunulur.
    this.step('guard', message, {}, {}, true);
    // Koşulun true olması ile return null/void iki farklı kod satırı ve adımdır.
    this.step('guardReturn', message, {}, {}, true);
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return null;
  }
  // Hedef index’e yakın uçtan başlayıp her referans ve sayaç değişimini ayrı kaydeder.
  private locate(index: number): DNode<T> {
    // Java LinkedList gibi hedefe yakın uç seçilir; koşul ayrı adımda görünür.
    const forward = index < this.count / 2;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'direction',
      forward
        ? 'Hedef head’e yakın: next yönünde ilerle.'
        : 'Hedef tail’e yakın: prev yönünde ilerle.',
    );
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let current: DNode<T>;
    // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let i: number;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (forward) {
      // Current referansını saklanan komşuya veya seçilen uca taşır.
      current = this.head!;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('forwardStart', 'current = head.', {}, { current });
      // Dolaşma index’ini bu konuma ayarlar; nesne referansı ayrı adımda seçilir.
      i = 0;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('forwardIndex', 'i = 0.', { i });
    } else {
      // Current referansını saklanan komşuya veya seçilen uca taşır.
      current = this.tail!;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('backwardStart', 'current = tail.', {}, { current });
      // Dolaşma index’ini bu konuma ayarlar; nesne referansı ayrı adımda seçilir.
      i = this.count - 1;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('backwardIndex', 'i = size - 1.', { i });
    }
    // Her döngü koşulu, referans hareketi ve sayaç değişimi ayrı kaydedilir.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('locateLoop', `i (${i}) != index (${index}): ${i !== index}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (i === index) break;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('locateDirection', `i < index: ${i < index}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (i < index) {
        // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
        current = current.next!;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('advanceNext', 'current = current.next.', {}, { current });
        // Bu tur sonunda sayacı bir artırır; referansın hareketi ayrı satırdadır.
        i++;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('increment', 'i bir artırıldı.', { i });
      } else {
        // Current referansını prev hedefe taşır; i sayacı ayrı satırda güncellenir.
        current = current.prev!;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('advancePrev', 'current = current.prev.', {}, { current });
        // Bu tur sonunda sayacı bir azaltır; referansın hareketi ayrı satırdadır.
        i--;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('decrement', 'i bir azaltıldı.', { i });
      }
    }
    // Dolaşmada o anda seçilen nesne referansı çağıran fonksiyona döndürülür.
    return current;
  }
  // İlk nesne referansı üzerinden listenin boşluğunu kontrol eder.
  isEmpty(): boolean {
    // Boşluk head üzerinden kontrol edilir; tail ile final invariant aynıdır.
    const empty = this.head === null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'check',
      empty ? 'head null: liste boş.' : 'head bir DNode gösteriyor: liste boş değil.',
      { empty },
    );
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('return', `Sonuç: ${empty}. Liste değişmedi.`);
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return empty;
  }
  // Eleman sayacını bağlantıları değiştirmeden okur.
  size(): number {
    // Kod örneğindeki yerel count değeri ayrı kaydedilir; liste sayacı değişmez.
    const count = this.count;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('check', `count = size = ${count}.`, { count });
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('return', `Sonuç: ${count}. Liste değişmedi.`);
    // Listedeki eleman sayısını tutan sayaç çağıran fonksiyona döndürülür.
    return count;
  }
  // Yeni nesneyi listenin başına ekler; her bağlantı ve uç değişimi ayrı kaydedilir.
  addFirst(value: T): void {
    // Constructor başlangıç bağlantıları açıkça null olarak verilir.
    const node = new DNode(value, null, null);
    // Bu atamayla this.pending güncellenir; sonraki satır yeni değeri kullanır.
    this.pending = node;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'create',
      'Yeni DNode oluşturuldu; prev ve next null. Mevcut liste aşağıda hazırlık alanına taşınır.',
      { value: String(value) },
    );
    // Yeni nesnenin ileri bağlantısı önce eski head’e yönelir.
    node.next = this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'next',
      'node.next = head. Yeni nesne eski ilk nesneyi gösterir; geri bağlantı henüz değişmedi.',
    );
    // Boş liste ve dolu liste iki ayrı bağlantı ihtiyacı taşır.
    this.step(
      'branch',
      this.head
        ? 'Liste dolu: eski head’in prev alanı güncellenecek.'
        : 'Liste boş: yeni nesne tail de olacak.',
    );
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (this.head) {
      // Ters bağlantı ayrı atama ve ayrı animasyon adımıdır.
      this.head.prev = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step(
        'prev',
        'head.prev = node. Eski ilk nesnenin geri bağlantısı yeni nesneyi gösterir.',
      );
    } else {
      // İlk ekleme listenin iki ucunu aynı nesneye bağlar.
      this.tail = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('tail', 'tail = node. Boş listenin son nesnesi artık yeni DNode.');
    }
    // Yeni baş ancak iki yönlü bağlantı hazırlığı tamamlandığında seçilir.
    this.head = node;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('head', 'head = node. Yeni DNode listenin ilk nesnesi oldu.');
    // Eleman sayısı ayrı satır ve ayrı adımda artırılır.
    this.count++;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir artırıldı. head.prev null, tail.next null.');
    // Yerel referans kapsamdan çıkar; liste son yerleşimine yumuşak döner.
    this.pending = null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'return',
      'İşlem tamamlandı. İleri ve geri bağlantılar tutarlı; liste sonraki işlem için korunur.',
    );
  }
  // Yeni nesneyi listenin sonuna ekler; Doubly modelde tail doğrudan kullanılır.
  addLast(value: T): void {
    // Tail saklandığı için sona ekleme listeyi dolaşmak zorunda değildir.
    const node = new DNode(value, null, null);
    // Bu atamayla this.pending güncellenir; sonraki satır yeni değeri kullanır.
    this.pending = node;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('create', 'Yeni DNode oluşturuldu; iki bağlantı da null.', { value: String(value) });
    // Bu nesnenin geri bağlantısını günceller; komşunun ileri alanı ayrı satırda değiştirilir.
    node.prev = this.tail;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('prev', 'node.prev = tail. Eski son nesneye geri bağlantı kuruldu.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('branch', `tail != null: ${this.tail !== null}.`);
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (this.tail) {
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      this.tail.next = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('next', 'tail.next = node. Eski son nesne yeni nesneyi gösteriyor.');
    } else {
      // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
      this.head = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('head', 'head = node. Boş listede ilk nesne de yeni DNode.');
    }
    // Listenin son nesne referansını değiştirir; sonraki işlemler bu ucu doğrudan kullanabilir.
    this.tail = node;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('tail', 'tail = node. Yeni son nesne seçildi.');
    // Gerçek eklemenin ardından eleman sayısını bir artırır; bağlantı güncellemelerinden ayrı kaydedilir.
    this.count++;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir artırıldı.');
    // this.finish çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.finish(undefined);
  }
  // Verilen index için komşuları bulur; yeni nesne ve komşu bağlantılarını ayrı kurar.
  insertAt(index: number, value: T): void {
    // Eklemede size konumu da geçerlidir; hatalı index erken return üretir.
    if (this.invalid(index, true)) {
      // this.failure çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.failure('Ekleme index’i 0 ile size arasında bir tam sayı olmalı.');
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', 'Ekleme index’i geçerli.', { index, value: String(value) });
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('endBranch', `index == size: ${index === this.count}.`);
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let current: DNode<T> | null;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (index === this.count) {
      // Current referansını saklanan komşuya veya seçilen uca taşır.
      current = null;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('endCurrent', 'Sona eklemede sonraki nesne null.', {}, { current });
    } else
      /* Current referansını saklanan komşuya veya seçilen uca taşır. */ current =
        this.locate(index);
    // Önceki komşu, hedefin prev’i veya sona eklemede tail’dir.
    const previous = current ? current.prev : this.tail;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('previous', 'previous = current varsa current.prev, yoksa tail.', {}, { previous });
    // İşlemde oluşturulan veya gösterilen nesne bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const node = new DNode(value, null, null);
    // Bu atamayla this.pending güncellenir; sonraki satır yeni değeri kullanır.
    this.pending = node;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('create', 'Yeni DNode komşularından ayrı oluşturuldu.');
    // Bu nesnenin geri bağlantısını günceller; komşunun ileri alanı ayrı satırda değiştirilir.
    node.prev = previous;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('nodePrev', 'node.prev = previous.');
    // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
    node.next = current;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('nodeNext', 'node.next = current.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('previousBranch', `previous != null: ${previous !== null}.`);
    // Önceki komşunun varlığına göre bağlantı veya head güncellemesi seçilir.
    if (previous) {
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      previous.next = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('previousNext', 'previous.next = node. İleri zincire yeni nesne eklendi.');
    } else {
      // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
      this.head = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('head', 'head = node. Başa ekleme tamamlanıyor.');
    }
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('currentBranch', `current != null: ${current !== null}.`);
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (current) {
      // Bu nesnenin geri bağlantısını günceller; komşunun ileri alanı ayrı satırda değiştirilir.
      current.prev = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('currentPrev', 'current.prev = node. Geri zincire yeni nesne eklendi.');
    } else {
      // Listenin son nesne referansını değiştirir; sonraki işlemler bu ucu doğrudan kullanabilir.
      this.tail = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('tail', 'tail = node. Sona ekleme tamamlanıyor.');
    }
    // Gerçek eklemenin ardından eleman sayısını bir artırır; bağlantı güncellemelerinden ayrı kaydedilir.
    this.count++;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir artırıldı.');
    // this.finish çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.finish(undefined);
  }
  // Silinen nesnenin iki komşusunu ayrı ayrı bağlar, nesneyi ayırır ve eski veriyi saklar.
  private unlink(current: DNode<T>): T {
    // Silinecek veri, bağlantıları değiştirmeden önce saklanır.
    const oldValue = current.data;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'save',
      'oldValue = current.data. Silinecek nesne hazırlık alanına alınır.',
      { oldValue: String(oldValue) },
      { current },
    );
    // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const previous = current.prev;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('previous', 'previous = current.prev.', {}, { previous });
    // Bağlantı kopmadan önce saklanan sonraki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const following = current.next;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('following', 'following = current.next.', {}, { following });
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('previousBranch', `previous != null: ${previous !== null}.`);
    // Önceki komşunun varlığına göre bağlantı veya head güncellemesi seçilir.
    if (previous) {
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      previous.next = following;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step(
        'unlinkPrevious',
        'previous.next = following. İleri zincir silinen nesneyi atlıyor.',
      );
    } else {
      // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
      this.head = following;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('head', 'head = following. İlk nesne değişti.');
    }
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('followingBranch', `following != null: ${following !== null}.`);
    // Sonraki komşunun varlığına göre bağlantı veya tail güncellemesi seçilir.
    if (following) {
      // Bu nesnenin geri bağlantısını günceller; komşunun ileri alanı ayrı satırda değiştirilir.
      following.prev = previous;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step(
        'unlinkFollowing',
        'following.prev = previous. Geri zincir silinen nesneyi atlıyor.',
      );
    } else {
      // Listenin son nesne referansını değiştirir; sonraki işlemler bu ucu doğrudan kullanabilir.
      this.tail = previous;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('tail', 'tail = previous. Son nesne değişti.');
    }
    // İki koparma ayrı adımlardır; Java GC veya C free içi simüle edilmez.
    current.prev = null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('detachPrev', 'current.prev = null. Silinen nesnenin geri bağlantısı temizlendi.');
    // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
    current.next = null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('detachNext', 'current.next = null. Silinen nesnenin ileri bağlantısı temizlendi.');
    // Gerçek silmenin ardından eleman sayısını bir azaltır; boş listeye doğru ilerlenir.
    this.count--;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir azaltıldı.');
    // Silme veya güncellemeden önce saklanan, geri döndürülecek eski veri çağıran fonksiyona döndürülür.
    return oldValue;
  }
  // Hedef index’i doğrular; seçilen nesneyi güvenle ayırıp verisini döndürür.
  removeAt(index: number): T | null {
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (this.invalid(index)) return this.failure('Silme index’i 0 ile size - 1 arasında olmalı.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', 'Silme index’i geçerli.', { index });
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const current = this.locate(index);
    // Silme veya güncellemeden önce saklanan, geri döndürülecek eski veri bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const oldValue = this.unlink(current);
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(oldValue);
  }
  // Boş listeyi kontrol eder; ilk nesneyi ayırıp eski verisini döndürür.
  removeFirst(): T | null {
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!this.head) return this.failure('Liste boş; ilk nesne silinemez.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', 'Liste boş değil.');
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const current = this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('current', 'current = head.', {}, { current });
    // Silme veya güncellemeden önce saklanan, geri döndürülecek eski veri bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const oldValue = this.unlink(current);
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(oldValue);
  }
  // Boş listeyi kontrol eder; son nesneyi ayırıp eski verisini döndürür.
  removeLast(): T | null {
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!this.tail) return this.failure('Liste boş; son nesne silinemez.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', 'Liste boş değil.');
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const current = this.tail;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('current', 'current = tail; dolaşma gerekmiyor.', {}, { current });
    // Silme veya güncellemeden önce saklanan, geri döndürülecek eski veri bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const oldValue = this.unlink(current);
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(oldValue);
  }
  // Geçerli index’teki nesneye ulaşıp data değerini bağlantıları değiştirmeden okur.
  get(index: number): T | null {
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (this.invalid(index)) return this.failure('Okuma index’i 0 ile size - 1 arasında olmalı.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', 'Okuma index’i geçerli.', { index });
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const current = this.locate(index);
    // Bu işlemde kullanılacak veya geri döndürülecek data değerini saklar.
    const value = current.data;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('read', 'value = current.data.', { value: String(value) });
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(value);
  }
  // Head üzerinden ilk değeri güvenle okur.
  getFirst(): T | null {
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!this.head) return this.failure('Liste boş; ilk değer okunamaz.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', 'Liste boş değil.');
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const current = this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('current', 'current = head.', {}, { current });
    // Bu işlemde kullanılacak veya geri döndürülecek data değerini saklar.
    const value = current.data;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('read', 'value = current.data.', { value: String(value) });
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(value);
  }
  // Son değeri güvenle okur; Doubly modelde tail doğrudan kullanılır.
  getLast(): T | null {
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!this.tail) return this.failure('Liste boş; son değer okunamaz.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', 'Liste boş değil.');
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const current = this.tail;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('current', 'current = tail; dolaşma gerekmiyor.', {}, { current });
    // Bu işlemde kullanılacak veya geri döndürülecek data değerini saklar.
    const value = current.data;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('read', 'value = current.data.', { value: String(value) });
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(value);
  }
  // Eski veriyi saklar, yalnız data alanını günceller ve eski değeri döndürür.
  set(index: number, value: T): T | null {
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (this.invalid(index))
      // Beklenen hatayı kayıtlayıp bu işlemi güvenle bitirir; bağlantılara dokunulmaz.
      return this.failure('Güncelleme index’i 0 ile size - 1 arasında olmalı.');
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', 'Güncelleme index’i geçerli.', { index, value: String(value) });
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const current = this.locate(index);
    // Silme veya güncellemeden önce saklanan, geri döndürülecek eski veri bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const oldValue = current.data;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('save', 'oldValue = current.data. Eski veri saklandı.', {
      oldValue: String(oldValue),
    });
    // Bu atamayla current.data güncellenir; sonraki satır yeni değeri kullanır.
    current.data = value;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('update', 'current.data = value. prev ve next değişmedi.');
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(oldValue);
  }
  // Arama girdisini veya modelde veri karşılaştırmasını yönetir; koşulun sonucu kayıtlanır.
  private search(value: T, mode: 'indexOf' | 'lastIndexOf' | 'contains'): number | boolean {
    // Son eşleşme tail’den aranır; prev yönü gerçek adımlarla görünür.
    const backward = mode === 'lastIndexOf';
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let current = backward ? this.tail : this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'searchCurrent',
      backward ? 'current = tail.' : 'current = head.',
      { value: String(value) },
      { current },
    );
    // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let i = backward ? this.count - 1 : 0;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('searchIndex', backward ? 'i = size - 1.' : 'i = 0.', { i });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('searchLoop', `current != null: ${current !== null}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!current) break;
      // Mevcut verinin aranan değerle eşitliğini gösteren karşılaştırma sonucu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const matched = Object.is(current.data, value);
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('compare', `matched = current.data eşitliği: ${matched}.`, { matched });
      // Boolean değişkenin hesaplanması ile if kolu ayrı adımlardır.
      this.step('matchBranch', `matched true mu? ${matched}.`);
      // Veri eşleştiyse bulunan sonuç veya silme koluna girer; eşleşmediyse dolaşma sürer.
      if (matched) {
        // Aramada bulunan index veya mantıksal sonuç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const found = mode === 'contains' ? true : i;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('found', `found = ${found}.`, { found });
        // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
        return this.finish(found, 'returnFound');
      }
      // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
      current = backward ? current.prev : current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step(
        'searchAdvance',
        backward ? 'current = current.prev.' : 'current = current.next.',
        {},
        { current },
      );
      // Bu işlem mevcut yerel durumu günceller veya ilgili yardımcıyı çağırır; sıra algoritma kaydında korunur.
      i += backward ? -1 : 1;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('searchIncrement', backward ? 'i bir azaltıldı.' : 'i bir artırıldı.', { i });
    }
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(mode === 'contains' ? false : -1, 'returnMissing');
  }
  // İlk eşleşmenin index’ini bulur; bulunamazsa -1 döndürür.
  indexOf(value: T): number {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.search(value, 'indexOf') as number;
  }
  // Son eşleşmenin index’ini bulur; Doubly modelde tail’den prev yönünde arar.
  lastIndexOf(value: T): number {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.search(value, 'lastIndexOf') as number;
  }
  // Değerin listede bulunmasını boolean olarak bildirir.
  contains(value: T): boolean {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.search(value, 'contains') as boolean;
  }
  // İlk eşleşen değeri siler; bulunamayan hedefte false döndürür.
  remove(value: T): boolean {
    // İlk eşleşmenin bulunması ile bağlantı koparma adımları aynı method’da görünür.
    let current = this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('searchCurrent', 'current = head.', { value: String(value) }, { current });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('searchLoop', `current != null: ${current !== null}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!current) break;
      // Mevcut verinin aranan değerle eşitliğini gösteren karşılaştırma sonucu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const matched = Object.is(current.data, value);
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('compare', `matched = current.data eşitliği: ${matched}.`, { matched });
      // Boolean değişkenin hesaplanması ile if kolu ayrı adımlardır.
      this.step('matchBranch', `matched true mu? ${matched}.`);
      // Veri eşleştiyse bulunan sonuç veya silme koluna girer; eşleşmediyse dolaşma sürer.
      if (matched) {
        // this.unlink çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        this.unlink(current);
        // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
        return this.finish(true);
      }
      // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
      current = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('searchAdvance', 'current = current.next.', {}, { current });
    }
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(false, 'returnMissing');
  }
  // Bağlantıları takip ederek verileri sırayla toplar; listeyi değiştirmez.
  traversal(): T[] {
    // Dolaşma sonucu listenin kendisinden bağımsız bir çıktı dizisidir.
    const output: T[] = [];
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('output', 'Boş output listesi oluşturuldu.', { output: '[]' });
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let current = this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('searchCurrent', 'current = head.', {}, { current });
    // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let i = 0;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('searchIndex', 'i = 0.', { i });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('searchLoop', `current != null: ${current !== null}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!current) break;
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      output.push(current.data);
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('append', 'current.data çıktı listesine eklendi.', {
        output: JSON.stringify(output),
      });
      // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
      current = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('searchAdvance', 'current = current.next.', {}, { current });
      // Bu tur sonunda sayacı bir artırır; referansın hareketi ayrı satırdadır.
      i++;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('searchIncrement', 'i bir artırıldı.', { i });
    }
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(output);
  }
  // Bütün liste referanslarını ve sayacı temizler; boş listede de güvenle çalışır.
  clear(): void {
    // Önce mevcut zincir geçici current referansıyla tutulur.
    let current = this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'searchCurrent',
      'current = head. Temizlenecek zincir geçici olarak tutuluyor.',
      {},
      { current },
    );
    // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
    this.head = null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('head', 'head = null. Liste başlangıç referansı bırakıldı.');
    // Listenin son nesne referansını değiştirir; sonraki işlemler bu ucu doğrudan kullanabilir.
    this.tail = null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('tail', 'tail = null. Liste bitiş referansı bırakıldı.');
    // Following açıkça method kapsamında tanımlanır; sonraki turlarda yeniden atanır.
    let following: DNode<T> | null = null;
    this.step('followingInit', 'following = null.', {}, { following });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('searchLoop', `current != null: ${current !== null}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!current) break;
      // Bağlantı kopmadan önce saklanan sonraki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      following = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step(
        'following',
        'following = current.next. Sonraki nesne saklandı.',
        {},
        { following },
      );
      // Bu nesnenin geri bağlantısını günceller; komşunun ileri alanı ayrı satırda değiştirilir.
      current.prev = null;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('clearPrev', 'current.prev = null.');
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      current.next = null;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('clearNext', 'current.next = null.');
      // Current referansını saklanan komşuya veya seçilen uca taşır.
      current = following;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('clearAdvance', 'current = following. Sıradaki nesneye geçildi.', {}, { current });
    }
    // Eleman sayacını bu işlemde gereken yeni değere ayarlar.
    this.count = 0;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size = 0. Boş liste de güvenle temizlenir.');
    // this.finish çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.finish(undefined);
  }
}

/** Ortak playback’ın tükettiği kayıtlar yalnız gerçek model adımlarından üretilir. */
export function doublyTrace(
  baseline: ListSnapshot<string>,
  operation: DoublyOperation,
  params: Parameters,
): Trace<string> {
  // Algoritmanın her anlamlı değişimini sıralı, bağımsız fotoğraflar halinde biriktirir.
  const steps: ExecutionStep<string>[] = [
    {
      key: 'start',
      explanation: 'Doubly Linkedlist başlangıcı: head, tail ve mevcut bağlantıları incele.',
      variables: {
        ...(params.value !== undefined ? { value: params.value } : {}),
        ...(params.index !== undefined ? { index: params.index } : {}),
      },
      references: {},
      snapshot: baseline,
    },
  ];
  // Parametreler her adımda görünür kalır; model kendi geçici değişkenlerini ekler.
  const list = DoublyLinkedlist.fromSnapshot(baseline, (step) =>
    steps.push({ ...step, variables: { ...steps[0].variables, ...step.variables } }),
  );
  // İç seçim kimliği kullanıcıya gösterilen gerçek method adına çevrilir.
  const name = operation.slice(6);
  // method hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const method = (name[0].toLowerCase() + name.slice(1)) as Operation;
  // Bu işlemde kullanılacak veya geri döndürülecek data değerini saklar.
  const value = params.value ?? '';
  // Kullanıcının seçtiği, sıfırdan başlayan hedef konum bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const index = params.index ?? NaN;
  // Algoritmanın doğrudan sonucunu saklar; sahne fotoğrafından ayrı bir bilgidir.
  let returnValue: unknown;
  // Seçilen fonksiyon adına göre yalnız ilgili algoritma çalıştırılır; aynı isimler iki yapı için ayrı kayıtlanır.
  switch (method) {
    case 'isEmpty':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.isEmpty();
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'size':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.size();
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'addFirst':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.addFirst(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'addLast':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.addLast(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'insertAt':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.insertAt(index, value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeAt':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.removeAt(index);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeFirst':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.removeFirst();
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeLast':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.removeLast();
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'get':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.get(index);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'getFirst':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.getFirst();
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'getLast':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.getLast();
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'set':
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      returnValue = list.set(index, value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'indexOf':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.indexOf(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'lastIndexOf':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.lastIndexOf(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'contains':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.contains(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'remove':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.remove(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'traversal':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.traversal();
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'clear':
      // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
      returnValue = list.clear();
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
  }
  // En son işlenen konumu veya kaydı saklar; aradaki normal metin ve final sonuç kaybolmaz.
  const last = steps.at(-1)!;
  // Bu atamayla last.result güncellenir; sonraki satır yeni değeri kullanır.
  last.result = returnValue === undefined ? 'void' : JSON.stringify(returnValue);
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return {
    operation,
    baseline,
    steps,
    returnValue,
    ...(last.error ? { error: last.explanation } : {}),
  };
}
