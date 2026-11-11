// Veri ve next taşıyan bağımsız generic Node sınıfını getirir.
import { Node } from './node';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { ListSnapshot, References, StepObserver, Variables } from './execution.types';

/**
 * Eğitim algoritmaları: data/next değişimleri normal Node nesneleri üzerinde yapılır.
 * Observer, algoritmayı arayüze bağlamadan her anlamlı adımın fotoğrafını üretir.
 * tail saklamıyoruz: addLast/removeLast dolaşmasını öğrencinin görmesini istiyoruz.
 */
export class SinglyLinkedlist<T> {
  // Listenin ilk nesnesini gösteren referans bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  head: Node<T> | null = null;
  // Listedeki eleman sayısını tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private count = 0;
  // Öğretici kartta gösterilen yerel değişkenler bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private variables: Variables = {};
  // Değişken isimlerini gerçek nesne kimlikleriyle eşleyen referanslar bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private references: References<T> = {};

  // Bu sınıf örneği oluşturulunca bir kez çalışır; başlangıç bağımlılıkları veya gözlemcileri burada hazırlanır.
  constructor(private readonly observer?: StepObserver<T>) {}

  // Bütün erişilebilir ve geçici nesneleri bağımsız bir kayıt olarak çıkarır; sonraki mutasyonlar bu kaydı değiştirmez.
  snapshot(): ListSnapshot<T> {
    // Geçici referansların gösterdiği, henüz listeye bağlanmamış Node'lar da görünür.
    const nodes = new Map<string, Node<T>>();
    // visit hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const visit = (start: Node<T> | null) => {
      // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      let current = start;
      // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
      while (current && !nodes.has(current.id)) {
        // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
        nodes.set(current.id, current);
        // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
        current = current.next;
      }
    };
    // visit çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    visit(this.head);
    // Object.values(this.references).forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    Object.values(this.references).forEach(visit);
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return {
      head: this.head?.id ?? null,
      size: this.count,
      nodes: [...nodes.values()].map((n) => ({ id: n.id, data: n.data, next: n.next?.id ?? null })),
    };
  }

  /** Snapshot'taki kimlikleri koruyarak nesneleri ve next bağlantılarını yeniden kurar. */
  static fromSnapshot<T>(
    snapshot: ListSnapshot<T>,
    observer?: StepObserver<T>,
  ): SinglyLinkedlist<T> {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<T>(observer);
    // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon kimliğe göre Map içinde tutulur; referans hedefi hızlı ve kararlı bulunur.
    const nodes = new Map(snapshot.nodes.map((n) => [n.id, new Node(n.data, null, n.id)]));
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const n of snapshot.nodes)
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      nodes.get(n.id)!.next = n.next ? (nodes.get(n.next) ?? null) : null;
    // Bu atamayla list.head güncellenir; sonraki satır yeni değeri kullanır.
    list.head = snapshot.head ? (nodes.get(snapshot.head) ?? null) : null;
    // Eleman sayacını bu işlemde gereken yeni değere ayarlar.
    list.count = snapshot.size;
    // Singly Linkedlist’in kalıcı liste durumu çağıran fonksiyona döndürülür.
    return list;
  }

  // Tek semantik değişimden sonra veri, değişken ve referans fotoğrafını gözlemciye gönderir.
  private step(
    key: string,
    explanation: string,
    vars: Variables = {},
    refs: References<T> = {},
    error = false,
  ) {
    // Bu atamayla this.variables güncellenir; sonraki satır yeni değeri kullanır.
    this.variables = { ...this.variables, ...vars };
    // Bu atamayla this.references güncellenir; sonraki satır yeni değeri kullanır.
    this.references = { ...this.references, ...refs };
    // this.observer çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.observer?.({
      key,
      explanation,
      variables: { ...this.variables },
      references: Object.fromEntries(
        Object.entries(this.references).map(([k, n]) => [k, n?.id ?? null]),
      ),
      snapshot: this.snapshot(),
      ...(error ? { error: true } : {}),
    });
  }

  // Yerel referansların kapsamını bitirir, son adımı kaydedip gerçek sonucu döndürür.
  private finish<V>(value: V, key = 'return'): V {
    // Algoritma bitince yerel referanslar scope dışına çıkar; ayrık Node'lar görünümden kalkar.
    this.references = {};
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      key,
      'İşlem tamamlandı. Sonuç aşağıda gösteriliyor; liste sonraki işlem için korunur.',
    );
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return value;
  }

  // Beklenen kullanıcı hatasını guard adımıyla açıklar; listeyi değiştirmeden güvenli dönüş yapar.
  private failure(message: string): null {
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', message, {}, {}, true);
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return null;
  }

  // Index için okuma/silme veya ekleme sınırını kontrol eder.
  private valid(index: number, insertion = false): boolean {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return (
      Number.isInteger(index) &&
      index >= 0 &&
      (insertion ? index <= this.count : index < this.count)
    );
  }

  // İlk nesne referansı üzerinden listenin boşluğunu kontrol eder.
  isEmpty(): boolean {
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'check',
      `head ${this.head ? 'bir Node gösteriyor: liste boş değil.' : 'null: liste boş.'}`,
      { empty: this.head === null },
    );
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(this.head === null);
  }

  // Eleman sayacını bağlantıları değiştirmeden okur.
  size(): number {
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('check', `size = ${this.count}. Eleman sayacı her ekleme ve silmede güncellenir.`, {
      count: this.count,
    });
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(this.count);
  }

  // Bütün liste referanslarını ve sayacı temizler; boş listede de güvenle çalışır.
  clear(): void {
    // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
    this.head = null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('head', 'head → null. Liste artık hiçbir Node’a erişmiyor.');
    // Eleman sayacını bu işlemde gereken yeni değere ayarlar.
    this.count = 0;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size → 0. Clear boş listede de güvenlidir.', { size: 0 });
    // this.finish çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.finish(undefined);
  }

  // Yeni nesneyi listenin başına ekler; her bağlantı ve uç değişimi ayrı kaydedilir.
  addFirst(value: T): void {
    // Yeni Node henüz listeye bağlı değildir; başlangıç next parametresi null verilir.
    const node = new Node(value, null);
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('create', 'Yeni Node oluşturuldu; next başlangıçta null.', {}, { node });
    // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
    node.next = this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'link',
      this.head
        ? 'node.next → eski head. Yeni Node, eski ilk Node’a bağlandı.'
        : 'node.next → null. Liste boş; bağlanacak eski Node yok.',
    );
    // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
    this.head = node;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('head', 'head → node. Yeni Node artık listenin başı.');
    // Gerçek eklemenin ardından eleman sayısını bir artırır; bağlantı güncellemelerinden ayrı kaydedilir.
    this.count++;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir artırıldı.', { size: this.count });
    // this.finish çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.finish(undefined);
  }

  // Verilen index için komşuları bulur; yeni nesne ve komşu bağlantılarını ayrı kurar.
  insertAt(index: number, value: T): void {
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', `Ekleme index’i 0 ile ${this.count} arasında olmalı.`, { index });
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (!this.valid(index, true)) {
      // this.failure çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.failure('Geçersiz index. Ekleme için 0 ≤ index ≤ size olmalı.');
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // Yeni Node henüz listeye bağlı değildir; başlangıç next parametresi null verilir.
    const node = new Node(value, null);
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('create', 'Yeni Node oluşturuldu.', {}, { node });
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('branch', `index == 0 koşulu ${index === 0}.`, { index });
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (index === 0) {
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      node.next = this.head;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('linkHead', 'node.next → eski head.');
      // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
      this.head = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('head', 'head → yeni node.');
    } else {
      // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      let previous = this.head!;
      // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      let i = 0;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('init', 'previous → head; i = 0.', { i }, { previous });
      // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
      while (true) {
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('loop', `i < index - 1: ${i} < ${index - 1} → ${i < index - 1}.`, { i });
        // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
        if (i >= index - 1) break;
        // Bu atamayla previous güncellenir; sonraki satır yeni değeri kullanır.
        previous = previous.next!;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step(
          'advance',
          'previous → previous.next. Referans bir Node ilerledi.',
          {},
          { previous },
        );
        // Bu tur sonunda sayacı bir artırır; referansın hareketi ayrı satırdadır.
        i++;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('increment', `i bir artırıldı: ${i - 1} → ${i}.`, { i });
      }
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      node.next = previous.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('link', 'node.next → previous.next. Eski bağlantının hedefi korunuyor.');
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      previous.next = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('attach', 'previous.next → node. Yeni Node araya yerleştirildi.');
    }
    // Gerçek eklemenin ardından eleman sayısını bir artırır; bağlantı güncellemelerinden ayrı kaydedilir.
    this.count++;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir artırıldı.', { size: this.count });
    // this.finish çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.finish(undefined);
  }

  // Yeni nesneyi listenin sonuna ekler; Doubly modelde tail doğrudan kullanılır.
  addLast(value: T): void {
    // Yeni Node henüz listeye bağlı değildir; başlangıç next parametresi null verilir.
    const node = new Node(value, null);
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('create', 'Yeni Node oluşturuldu; next = null.', {}, { node });
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('branch', `head == null koşulu ${this.head === null}.`);
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!this.head) {
      // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
      this.head = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('head', 'Liste boştu: head → node.');
    } else {
      // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      let current = this.head;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('init', 'current → head. Son Node’u arayacağız.', {}, { current });
      // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
      while (true) {
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('loop', `current.next != null koşulu ${current.next !== null}.`);
        // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
        if (!current.next) break;
        // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
        current = current.next;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step(
          'advance',
          'current → current.next. Referans sonraki Node’a ilerledi.',
          {},
          { current },
        );
      }
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      current.next = node;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('attach', 'current.next → node. Yeni Node listenin sonuna bağlandı.');
    }
    // Gerçek eklemenin ardından eleman sayısını bir artırır; bağlantı güncellemelerinden ayrı kaydedilir.
    this.count++;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir artırıldı.', { size: this.count });
    // this.finish çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.finish(undefined);
  }

  /** Aynı dolaşma algoritması get, set ve removeAt için kullanılır. */
  private locate(
    index: number,
    withPrevious = true,
  ): {
    /* Dolaşmada o anda seçilen nesne referansı; bu alan kayıt sözleşmesinin parçasıdır. */ current: Node<T>;
    /* Bağlantı değişmeden önce saklanan önceki komşu; bu alan kayıt sözleşmesinin parçasıdır. */ previous: Node<T> | null;
  } {
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let current = this.head!;
    // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let previous: Node<T> | null = null;
    // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let i = 0;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'init',
      withPrevious ? 'current → head; previous = null; i = 0.' : 'current → head; i = 0.',
      { i },
      withPrevious ? { current, previous } : { current },
    );
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('loop', `i < index: ${i} < ${index} → ${i < index}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (i >= index) break;
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (withPrevious) {
        // Bu atamayla previous güncellenir; sonraki satır yeni değeri kullanır.
        previous = current;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step(
          'previous',
          'previous → current. Önceki Node referansı saklanıyor.',
          {},
          { previous },
        );
      }
      // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
      current = current.next!;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('advance', 'current → current.next.', {}, { current });
      // Bu tur sonunda sayacı bir artırır; referansın hareketi ayrı satırdadır.
      i++;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('increment', `i: ${i - 1} → ${i}.`, { i });
    }
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return { current, previous };
  }

  // Hedef index’i doğrular; seçilen nesneyi güvenle ayırıp verisini döndürür.
  removeAt(index: number): T | null {
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', `Silme index’i 0 ile ${this.count - 1} arasında olmalı.`, { index });
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (!this.valid(index))
      // Beklenen hatayı kayıtlayıp bu işlemi güvenle bitirir; bağlantılara dokunulmaz.
      return this.failure(
        this.count === 0
          ? 'Liste boş; silinecek Node yok.'
          : 'Geçersiz index. 0 ≤ index < size olmalı.',
      );
    // { current, previous } hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const { current, previous } = this.locate(index);
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step(
      'branch',
      `previous == null koşulu ${previous === null}: ${previous ? 'arada/sonda silme.' : 'head silme.'}`,
    );
    // Önceki komşunun varlığına göre bağlantı veya head güncellemesi seçilir.
    if (!previous) {
      // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
      this.head = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('head', 'head → current.next. İlk Node listeden ayrıldı.');
    } else {
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      previous.next = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('unlink', 'previous.next → current.next. Silinen Node atlanıyor.');
    }
    // Gerçek silmenin ardından eleman sayısını bir azaltır; boş listeye doğru ilerlenir.
    this.count--;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir azaltıldı.', { size: this.count });
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(current.data);
  }

  // Boş listeyi kontrol eder; ilk nesneyi ayırıp eski verisini döndürür.
  removeFirst(): T | null {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.removeAt(0);
  }
  // Boş listeyi kontrol eder; son nesneyi ayırıp eski verisini döndürür.
  removeLast(): T | null {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.removeAt(this.count - 1);
  }

  // Geçerli index’teki nesneye ulaşıp data değerini bağlantıları değiştirmeden okur.
  get(index: number): T | null {
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', `Okuma index’i 0 ile ${this.count - 1} arasında olmalı.`, { index });
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (!this.valid(index))
      // Beklenen hatayı kayıtlayıp bu işlemi güvenle bitirir; bağlantılara dokunulmaz.
      return this.failure(
        this.count === 0
          ? 'Liste boş; okunacak Node yok.'
          : 'Geçersiz index. 0 ≤ index < size olmalı.',
      );
    // { current } hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const { current } = this.locate(index, false);
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('read', 'current.data okunuyor; bağlantılar değişmiyor.', {
      old: String(current.data),
    });
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(current.data);
  }

  // Head üzerinden ilk değeri güvenle okur.
  getFirst(): T | null {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.get(0);
  }
  // Son değeri güvenle okur; Doubly modelde tail doğrudan kullanılır.
  getLast(): T | null {
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return this.get(this.count - 1);
  }

  // Eski veriyi saklar, yalnız data alanını günceller ve eski değeri döndürür.
  set(index: number, value: T): T | null {
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('guard', `Güncelleme index’i 0 ile ${this.count - 1} arasında olmalı.`, { index });
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (!this.valid(index))
      // Beklenen hatayı kayıtlayıp bu işlemi güvenle bitirir; bağlantılara dokunulmaz.
      return this.failure('Geçersiz index veya boş liste. Node güncellenmedi.');
    // { current } hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const { current } = this.locate(index, false);
    // Bir önceki karedeki nesne veya referans hedefini bulur; geçiş buradan başlar.
    const old = current.data;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('read', 'Eski data değeri saklandı.', { old: String(old) });
    // Bu atamayla current.data güncellenir; sonraki satır yeni değeri kullanır.
    current.data = value;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('update', 'current.data yeni değerle değiştirildi; next aynı kaldı.');
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(old);
  }

  // Arama girdisini veya modelde veri karşılaştırmasını yönetir; koşulun sonucu kayıtlanır.
  private search(value: T, last = false): number {
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let current = this.head;
    // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let i = 0;
    // Aramada bulunan index veya mantıksal sonuç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let found = -1;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('init', 'current → head; i = 0; found = -1.', { i, found }, { current });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('loop', `current != null koşulu ${current !== null}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!current) break;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step(
        'compare',
        `current.data ile aranan değer eşleşmesi: ${Object.is(current.data, value)}.`,
      );
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (Object.is(current.data, value)) {
        // Bu atamayla found güncellenir; sonraki satır yeni değeri kullanır.
        found = i;
        // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
        this.step('found', `Eşleşme bulundu: found = ${found}.`, { found });
        // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
        if (!last) break;
      }
      // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
      current = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('advance', 'current → current.next.', {}, { current });
      // Bu tur sonunda sayacı bir artırır; referansın hareketi ayrı satırdadır.
      i++;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('increment', `i: ${i - 1} → ${i}.`, { i });
    }
    // Aramada bulunan index veya mantıksal sonuç çağıran fonksiyona döndürülür.
    return found;
  }

  // İlk eşleşmenin index’ini bulur; bulunamazsa -1 döndürür.
  indexOf(value: T): number {
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(this.search(value));
  }
  // Son eşleşmenin index’ini bulur; Doubly modelde tail’den prev yönünde arar.
  lastIndexOf(value: T): number {
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(this.search(value, true));
  }
  // Değerin listede bulunmasını boolean olarak bildirir.
  contains(value: T): boolean {
    // Aramada bulunan index veya mantıksal sonuç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const found = this.search(value);
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('check', `found != -1 koşulu ${found !== -1}.`, { exists: found !== -1 });
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(found !== -1);
  }

  // İlk eşleşen değeri siler; bulunamayan hedefte false döndürür.
  remove(value: T): boolean {
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let current = this.head;
    // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let previous: Node<T> | null = null;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('init', 'current → head; previous = null.', {}, { current, previous });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('loop', `current != null koşulu ${current !== null}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!current) return this.finish(false, 'notFound');
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('compare', `data eşleşmesi ${Object.is(current.data, value)}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (Object.is(current.data, value)) break;
      // Bu atamayla previous güncellenir; sonraki satır yeni değeri kullanır.
      previous = current;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('previous', 'previous → current.', {}, { previous });
      // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
      current = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('advance', 'current → current.next.', {}, { current });
    }
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('branch', `previous == null koşulu ${previous === null}.`);
    // Önceki komşunun varlığına göre bağlantı veya head güncellemesi seçilir.
    if (!previous) {
      // Listenin ilk nesne referansını değiştirir; eski bağlantı zinciri adım kayıtlarında korunur.
      this.head = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('head', 'head → current.next.');
    } else {
      // Bu nesnenin ileri bağlantısını günceller; komşunun geri alanı ayrı satırda değiştirilir.
      previous.next = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('unlink', 'previous.next → current.next. İlk eşleşme listeden ayrıldı.');
    }
    // Gerçek silmenin ardından eleman sayısını bir azaltır; boş listeye doğru ilerlenir.
    this.count--;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('count', 'size bir azaltıldı.', { size: this.count });
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(true);
  }

  // Bağlantıları takip ederek verileri sırayla toplar; listeyi değiştirmez.
  traversal(): T[] {
    // values hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const values: T[] = [];
    // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let current = this.head;
    // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
    this.step('init', 'current → head; çıktı listesi boş.', { output: '[]' }, { current });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (true) {
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('loop', `current != null koşulu ${current !== null}.`);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!current) break;
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      values.push(current.data);
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('read', 'current.data çıktıya eklendi.', { output: JSON.stringify(values) });
      // Current referansını next hedefe taşır; i sayacı ayrı satırda güncellenir.
      current = current.next;
      // Bu semantik adımın ardından bağımsız fotoğraf kaydeder; Previous Step aynı kaydı geri gösterebilir.
      this.step('advance', 'current → current.next.', {}, { current });
    }
    // Yerel referansları sonlandırıp gerçek sonucu döndürür; sonuç bir sarmalayıcıya konulmaz.
    return this.finish(values);
  }
}
