// Node kendi başına veri ve next taşır; daireselliği liste algoritması kurar.
import { Node } from './node';
// Ortak trace sözleşmesi mevcut oynatma kontrolleriyle çalışmayı sağlar.
import type {
  CircularOperation,
  ExecutionStep,
  ListSnapshot,
  Operation,
  Parameters,
  References,
  StepObserver,
  Trace,
  Variables,
} from './execution.types';

/** Tek yönlü halka: saklanan tek uç tail'dir; ilk Node her zaman tail.next'tir. */
export class CircularLinkedlist<T> {
  // Boş listede null; tek Node varsa tail.next kendisini gösterir.
  tail: Node<T> | null = null;
  // Dolaşmadan boyutu öğrenmek ve index sınırlarını denetlemek için sayaç tutulur.
  private count = 0;
  // Yeni veya ayrılmış Node'lar işlem bitene kadar gözlemciye görünür kalır.
  private references: References<T> = {};
  // Gerçekte çalışan algoritmanın yerel değerleri adımlar arasında korunur.
  private variables: Variables = {};
  // İç çağrılar aynı isimli satırları farklı kapsam anahtarlarıyla ayırır.
  private scope = '';
  // Observer isteğe bağlıdır; model Angular veya görselleştirme olmadan da çalışır.
  constructor(private readonly observer?: StepObserver<T>) {}

  // Ziyaret kümesi halkada sonsuz dolaşmayı engeller; ayrık Node'lar da kayda girer.
  snapshot(): ListSnapshot<T> {
    // Kimlikler aynı nesnenin birden çok kez kaydedilmesini önler.
    const nodes = new Map<string, Node<T>>();
    // Saklanan uç ve geçici referanslar bütün canlı nesneleri kapsar.
    const queue = [this.tail, ...Object.values(this.references)];
    // Her Node yalnız bir kez işlenir; next'in null olması gerekmez.
    while (queue.length) {
      // Sıradaki erişilebilir nesne alınır.
      const node = queue.pop();
      // Null veya ziyaret edilmiş bir referansta yeniden dolaşılmaz.
      if (!node || nodes.has(node.id)) continue;
      // Nesne bağımsız snapshot'a alınacak kümeye eklenir.
      nodes.set(node.id, node);
      // Yalnız ileri bağlantı izlenir; modelde prev bulunmaz.
      queue.push(node.next);
    }
    // head yalnız ortak çizim protokolünün türetilmiş başlangıcıdır; model alanı değildir.
    return {
      head: this.tail?.next?.id ?? null,
      tail: this.tail?.id ?? null,
      size: this.count,
      nodes: [...nodes.values()].map((node) => ({
        id: node.id,
        data: node.data,
        next: node.next?.id ?? null,
      })),
    };
  }

  // İki aşamalı geri yükleme, kendisine veya önceki nesneye dönen bağlantıları da korur.
  static fromSnapshot<T>(
    snapshot: ListSnapshot<T>,
    observer?: StepObserver<T>,
  ): CircularLinkedlist<T> {
    // Yeni model yalnız işlem kopyasıdır; başlangıç snapshot'ı değiştirilmez.
    const list = new CircularLinkedlist<T>(observer);
    // Önce bütün Node nesneleri mevcut kimlikleriyle oluşturulur.
    const nodes = new Map(
      snapshot.nodes.map((node) => [node.id, new Node(node.data, null, node.id)]),
    );
    // Sonra her next aynı nesne kümesindeki hedefine bağlanır.
    for (const node of snapshot.nodes)
      nodes.get(node.id)!.next = node.next ? (nodes.get(node.next) ?? null) : null;
    // Yalnız tail geri yüklenir; türetilmiş head modelde saklanmaz.
    list.tail = snapshot.tail ? (nodes.get(snapshot.tail) ?? null) : null;
    // Başlangıç eleman sayısı geri yüklenir.
    list.count = snapshot.size;
    // Bağımsız çalışma kopyası çağırana verilir.
    return list;
  }

  // Bir algoritmik satırdan sonra gerçek veri, değişken ve referanslar kaydedilir.
  private step(
    key: string,
    explanation: string,
    vars: Variables = {},
    refs: References<T> = {},
    error = false,
  ) {
    // Son atama önceki yerel değerlerin yalnız ilgili kısmını günceller.
    this.variables = { ...this.variables, ...vars };
    // Referanslar Node kimliğine çevrilmeden önce gerçek nesne olarak korunur.
    this.references = { ...this.references, ...refs };
    // Her kayıt kendi nesne dizisini taşır; Previous sonraki mutasyonlardan etkilenmez.
    this.observer?.({
      key: this.scope + key,
      explanation,
      variables: { ...this.variables, size: this.count },
      references: Object.fromEntries(
        Object.entries(this.references).map(([name, node]) => [name, node?.id ?? null]),
      ),
      snapshot: this.snapshot(),
      ...(error ? { error: true } : {}),
    });
  }

  // İç method çağrısının adımlarını çağırana özgü prefix ile eşler.
  private call<V>(prefix: string, action: () => V): V {
    // Dış kapsam, iç çağrı bitince aynen geri yüklenecek.
    const previous = this.scope;
    // İç içe çağrılar kendi tam satır yolunu taşır.
    this.scope += prefix;
    // Finally observer veya algoritma hatasında da kapsamın sızmasını önler.
    try {
      return action();
    } finally {
      // Çağrı bittiğinde dış method'un satır anahtarlarına geri dönülür.
      this.scope = previous;
    }
  }

  // Gerçek return satırında yerel referanslar kapsam dışına çıkar.
  private finish<V>(value: V, key = 'return', error?: string): V {
    // Ayrık nesneler algoritma tamamlanınca kalıcı listeye taşınmaz.
    this.references = {};
    // Başarılı ve beklenen başarısız dönüşler aynı player'da gösterilir.
    this.step(
      key,
      error ?? 'İşlem tamamlandı. tail ve dairesel next bağlantıları sonraki işlem için korunur.',
      {},
      {},
      !!error,
    );
    // Model Result sarmalayıcısı kullanmadan doğrudan sonucu verir.
    return value;
  }

  // Index koşulu ile erken dönüş ayrı semantik satırlardır.
  private valid(index: number, insertion = false): boolean {
    // Ekleme size konumuna izin verir; diğer işlemler son dolu index ile sınırlıdır.
    const valid =
      Number.isSafeInteger(index) &&
      index >= 0 &&
      (insertion ? index <= this.count : index < this.count);
    // Koşul başarısızken de mevcut halka gösterilir.
    this.step('guard', `index sınırı: 0 ≤ index ${insertion ? '≤' : '<'} size → ${valid}.`, {
      index,
    });
    // Çağıran erken return kararını bu sonuçla verir.
    return valid;
  }

  // Boşluk kontrolü tail üzerinden yapılır; head alanı tutulmaz.
  isEmpty(): boolean {
    // Tek return ifadesi kendi kod satırına eşlenir.
    return this.finish(this.tail === null);
  }

  // Eleman sayısı dolaşma yapmadan döndürülür.
  size(): number {
    // Sayaç doğrudan dönüş değeridir.
    return this.finish(this.count);
  }

  // Başa eklemede tail korunur, tail.next yeni ilk Node'a bağlanır.
  addFirst(value: T): void {
    // Yeni Node'un next'i ayrı bağlantı adımı için önce null verilir.
    const node = new Node(value, null);
    // Nesne daha bağlanmadan sahnede gösterilir.
    this.step('create', 'Node(value, null) oluşturuldu.', {}, { node });
    // Boş halkada self-loop kurulması gerekip gerekmediği sınanır.
    this.step('empty', `tail == null → ${this.tail === null}.`);
    // İlk eklemede yeni Node hem ilk hem son nesnedir.
    if (this.tail === null) {
      // Tek Node kendisine bağlanarak bir elemanlı halkayı oluşturur.
      node.next = node;
      // Self-loop kod atamasıyla aynı adımda görünür.
      this.step('self', 'node.next → node. Tek Node kendisine bağlandı.');
      // Listenin saklanan tek ucu yeni Node olur.
      this.tail = node;
      // Tail ataması next atamasından bağımsız izlenir.
      this.step('tail', 'tail → node. İlk Node da tail.next ile bulunur.');
    } else {
      // Eski ilk Node yeni Node'dan sonra gelmelidir.
      node.next = this.tail.next;
      // Eski başlangıca giden bağlantı görünür tutulur.
      this.step('link', 'node.next → tail.next. Eski ilk Node korunur.');
      // Tail'in dönüş oku yeni ilk Node'a yönlendirilir.
      this.tail.next = node;
      // Kalıcı tail değişmeden başlangıcın değiştiği açıklanır.
      this.step('attach', 'tail.next → node. Yeni Node başta; tail aynı Node’u gösteriyor.');
    }
    // Gerçek eklemeden sonra sayaç ayrı satırda artırılır.
    this.count++;
    // Sayaç güncellemesi ayrı kod/trace adımıdır.
    this.step('count', 'size bir artırıldı.');
    // İşlem kapsamı biter; yeni Node kalıcı halka içindedir.
    this.finish(undefined);
  }

  // Sona ekleme de O(1)'dir; son adımda tail yeni Node'a taşınır.
  addLast(value: T): void {
    // Başlangıçta bağlantısı olmayan bağımsız Node oluşturulur.
    const node = new Node(value, null);
    // Oluşturma satırı yeni nesne kimliğiyle eşlenir.
    this.step('create', 'Node(value, null) oluşturuldu.', {}, { node });
    // Boş ve dolu halka farklı bağlantı sırası gerektirir.
    this.step('empty', `tail == null → ${this.tail === null}.`);
    // Boş listede kendisine dönen bağlantı yeterlidir.
    if (this.tail === null) {
      // Self-loop tek elemanlı halkayı kurar.
      node.next = node;
      // Bağlantı ayrı bir atama olarak gösterilir.
      this.step('self', 'node.next → node. Tek Node için self-loop kuruldu.');
    } else {
      // Yeni son Node eski ilk Node'a geri dönmelidir.
      node.next = this.tail.next;
      // Yeni dönüş bağlantısı tail taşınmadan kurulur.
      this.step('link', 'node.next → tail.next. Yeni son Node eski ilk Node’a dönecek.');
      // Eski son Node yeni Node'a bağlanır.
      this.tail.next = node;
      // Tail henüz eski son Node'dadır; ara durum gerçek kodu gösterir.
      this.step('attach', 'Eski tail.next → node. Şimdi tail yeni sona taşınacak.');
    }
    // Son nesneye doğrudan erişim yeni Node'a geçirilir.
    this.tail = node;
    // Tail taşınması ayrı trace adımıdır.
    this.step('tail', 'tail → node. tail.next hâlâ ilk Node’u gösterir.');
    // Eleman sayısı bağlantılar tamamlandıktan sonra artırılır.
    this.count++;
    // Sayaç kendi kod satırıyla vurgulanır.
    this.step('count', 'size bir artırıldı.');
    // Yerel Node referansı işlem sonunda kaldırılır.
    this.finish(undefined);
  }

  // Araya ekleme önceki Node'u bulur; uçlarda aynı temel algoritmaları çağırır.
  insertAt(index: number, value: T): void {
    // Geçersiz index'te hiçbir bağlantı değişmez.
    if (!this.valid(index, true))
      return this.finish(undefined, 'guardReturn', 'Ekleme için 0 ≤ index ≤ size olmalı.');
    // Başa ekleme özel dalı kodla aynı anda kontrol edilir.
    this.step('first', `index == 0 → ${index === 0}.`);
    // Ortak başa ekleme çağrısı kendi alt satırlarıyla gösterilir.
    if (index === 0) {
      this.call('first.', () => this.addFirst(value));
      return this.finish(undefined, 'firstReturn');
    }
    // Sona ekleme tail sayesinde dolaşma gerektirmez.
    this.step('last', `index == size → ${index === this.count}.`);
    // Son konumda O(1) ekleme kullanılır.
    if (index === this.count) {
      this.call('last.', () => this.addLast(value));
      return this.finish(undefined, 'lastReturn');
    }
    // İlk nesne tail.next'ten alınır; saklanan head yoktur.
    let previous = this.tail!.next!;
    // Referans başlangıcı ayrı satırdır.
    this.step('init', 'previous → tail.next. İlk Node’dan başla.', {}, { previous });
    // Sıfır tabanlı konum sayacı oluşturulur.
    let i = 0;
    // Sayaç başlangıcı referans atamasından ayrılır.
    this.step('initIndex', 'i = 0.', { i });
    // Her koşul değerlendirmesi son false sonucu dahil kaydedilir.
    while (true) {
      // Önceki Node hedef index'in bir solunda olmalıdır.
      this.step('loop', `i < index - 1 → ${i < index - 1}.`);
      // İstenen önceki konuma ulaşılınca dolaşma biter.
      if (i >= index - 1) break;
      // Referans yalnız ileri yönde hareket eder.
      previous = previous.next!;
      // Referans hareketi sayaçtan ayrı gösterilir.
      this.step('advance', 'previous → previous.next.', {}, { previous });
      // Konum bir artırılır.
      i++;
      // Yeni konum bağımsız adımda görünür.
      this.step('increment', 'i bir artırıldı.', { i });
    }
    // Yeni Node bağlantısız oluşturulur.
    const node = new Node(value, null);
    // Kimlik oluşturma adımıyla birlikte sahneye girer.
    this.step('create', 'Yeni Node oluşturuldu; next null.', {}, { node });
    // Önce eski hedef korunarak yeni Node'a bağlanır.
    node.next = previous.next;
    // Eski bağlantının hedefi kaybolmaz.
    this.step('link', 'node.next → previous.next.');
    // Önceki Node yeni Node'a bağlanır.
    previous.next = node;
    // İki bağlantının ayrı kurulduğu görünür olur.
    this.step('attach', 'previous.next → node. Halka yeni Node üzerinden devam eder.');
    // Yeni nesne eklendiği için sayaç artar.
    this.count++;
    // Sayaç ataması son bağlantıdan ayrı vurgulanır.
    this.step('count', 'size bir artırıldı.');
    // Yerel referansların kapsamı biter.
    this.finish(undefined);
  }

  // İlk Node tail.next üzerinden doğrudan bulunur.
  removeFirst(): T | null {
    // Boşluk koşulu ayrı kod satırına eşlenir.
    this.step('empty', `tail == null → ${this.tail === null}.`);
    // Boş listede güvenli null döner.
    if (this.tail === null)
      return this.finish(null, 'emptyReturn', 'Liste boş; silinecek Node yok.');
    // Silinecek ilk Node geçici referansa alınır.
    const current = this.tail.next!;
    // Geçici referans tail'den ayrı gösterilir.
    this.step('current', 'current → tail.next.', {}, { current });
    // Veri bağlantılar değişmeden saklanır.
    const value = current.data;
    // Kaydedilen veri bağımsız adımdır.
    this.step('save', 'Silinecek data value içinde saklandı.', { value: String(value) });
    // Tek Node silinince tail de null olmalıdır.
    this.step('single', `current == tail → ${current === this.tail}.`);
    // Tek nesneli halka tamamen boşaltılır.
    if (current === this.tail) {
      // Listenin tek kalıcı ucu kaldırılır.
      this.tail = null;
      // Boşluk durumu count güncellenmeden de görülebilir.
      this.step('tail', 'tail → null. Listede erişilebilir Node kalmadı.');
    } else {
      // Dönüş oku silinen ilk nesneyi atlayarak ikinciye bağlanır.
      this.tail.next = current.next;
      // İlk nesne değişir; tail aynı kalır.
      this.step('unlink', 'tail.next → current.next. İlk Node halkadan ayrıldı.');
    }
    // Ayrılan nesnenin bağlantısı ayrıca temizlenir.
    current.next = null;
    // Ayrık Node artık halkaya işaret etmez.
    this.step('detach', 'current.next → null. Ayrılan Node’un bağlantısı temizlendi.');
    // Eleman sayısı azaltılır.
    this.count--;
    // Sayaç ayrı satır ve trace adımıdır.
    this.step('count', 'size bir azaltıldı.');
    // Eski data doğrudan döndürülür.
    return this.finish(value);
  }

  // Son Node'un öncülü tek yönlü halkada dolaşarak bulunur.
  removeLast(): T | null {
    // Boşluk koşulu ayrı adımdır.
    this.step('empty', `tail == null → ${this.tail === null}.`);
    // Boş listede null döndürülür.
    if (this.tail === null)
      return this.finish(null, 'emptyReturn', 'Liste boş; silinecek Node yok.');
    // Tek elemanda baştan silme algoritması kullanılır.
    this.step('single', `tail.next == tail → ${this.tail.next === this.tail}.`);
    // Çağrı alt algoritmanın gerçek adımlarına açılır.
    if (this.tail.next === this.tail) return this.call('single.', () => this.removeFirst());
    // Öncül araması ilk Node'da başlar.
    let previous = this.tail.next!;
    // Başlangıç referansı kendi satırında gösterilir.
    this.step('init', 'previous → tail.next.', {}, { previous });
    // Tail'in önündeki nesneye kadar ilerlenir.
    while (true) {
      // Son false koşulu da kaydedilir.
      this.step('loop', `previous.next != tail → ${previous.next !== this.tail}.`);
      // Öncül bulunduğunda döngü biter.
      if (previous.next === this.tail) break;
      // Tek ileri bağlantı izlenir.
      previous = previous.next!;
      // Hareket ayrı trace adımıdır.
      this.step('advance', 'previous → previous.next.', {}, { previous });
    }
    // Silinecek eski tail korunur.
    const current = this.tail;
    // Current tail'den ayrı bir geçici değişkendir.
    this.step('current', 'current → tail.', {}, { current });
    // Return için eski data saklanır.
    const value = current.data;
    // Veri kaydetme ayrı adımdır.
    this.step('save', 'Silinecek data saklandı.', { value: String(value) });
    // Öncül eski ilk Node'a bağlanır.
    previous.next = current.next;
    // Halkayı yeniden kapatan atama gösterilir.
    this.step('unlink', 'previous.next → current.next. Öncül ilk Node’a döner.');
    // Yeni son nesne önceki Node'dur.
    this.tail = previous;
    // Saklanan tek uç ayrı satırda taşınır.
    this.step('tail', 'tail → previous.');
    // Ayrılan eski son nesnenin bağlantısı temizlenir.
    current.next = null;
    // Detach gerçek next atamasıdır.
    this.step('detach', 'current.next → null.');
    // Boyut bir azaltılır.
    this.count--;
    // Sayaç değişimi ayrı adımdır.
    this.step('count', 'size bir azaltıldı.');
    // Silinen data doğrudan döner.
    return this.finish(value);
  }

  // Index ile silmede halka sınırları korunur; baş ve son işlemleri yeniden kullanılır.
  removeAt(index: number): T | null {
    // Geçersiz index listeye dokunmadan sonlanır.
    if (!this.valid(index))
      return this.finish(null, 'guardReturn', 'Silme için 0 ≤ index < size olmalı.');
    // Baş silme dalı ayrı koşuldur.
    this.step('first', `index == 0 → ${index === 0}.`);
    // İlk Node doğrudan tail.next ile silinir.
    if (index === 0) return this.call('first.', () => this.removeFirst());
    // Son konum kontrolü ayrı satırdır.
    this.step('last', `index == size - 1 → ${index === this.count - 1}.`);
    // Son konum için tail güncellenen algoritma çağrılır.
    if (index === this.count - 1) return this.call('last.', () => this.removeLast());
    // Aradaki Node'un öncülünü bulmak için ilk nesneden başlanır.
    let previous = this.tail!.next!;
    // Referans başlangıcı ayrı satırdır.
    this.step('init', 'previous → tail.next.', {}, { previous });
    // İndex sayacı sıfırlanır.
    let i = 0;
    // Sayaç başlangıcı ayrı gösterilir.
    this.step('initIndex', 'i = 0.', { i });
    // Index'in önündeki Node'a kadar ilerlenir.
    while (true) {
      // Döngü koşulu ayrı trace adımıdır.
      this.step('loop', `i < index - 1 → ${i < index - 1}.`);
      // Öncül bulunduğunda çıkılır.
      if (i >= index - 1) break;
      // Referans ileri taşınır.
      previous = previous.next!;
      // Referans hareketi bağımsız görünür.
      this.step('advance', 'previous → previous.next.', {}, { previous });
      // Sıra sayacı artırılır.
      i++;
      // Sayaç kendi satırıyla eşlenir.
      this.step('increment', 'i bir artırıldı.', { i });
    }
    // Silinecek nesne öncülün next alanından alınır.
    const current = previous.next!;
    // Current ayrı referans olarak gösterilir.
    this.step('current', 'current → previous.next.', {}, { current });
    // Dönüş değeri saklanır.
    const value = current.data;
    // Veri ayrı satırda görünür.
    this.step('save', 'Silinecek data saklandı.', { value: String(value) });
    // Öncül silinecek Node'u atlayarak sonraki nesneye bağlanır.
    previous.next = current.next;
    // Halka kopmadan aradaki Node çıkarılır.
    this.step('unlink', 'previous.next → current.next.');
    // Ayrık nesnenin bağlantısı ayrıca silinir.
    current.next = null;
    // Node referansı hâlâ görünürken next null olur.
    this.step('detach', 'current.next → null.');
    // Boyut azaltılır.
    this.count--;
    // Yeni boyut ayrı trace adımıdır.
    this.step('count', 'size bir azaltıldı.');
    // Silinen değer döndürülür.
    return this.finish(value);
  }

  // Index'e erişim yalnız ileri next bağlantılarıyla yapılır.
  private locate(index: number): Node<T> {
    // İlk Node saklanan tail'den türetilir.
    let current = this.tail!.next!;
    // Başlangıç referansı bağımsız adımdır.
    this.step('init', 'current → tail.next.', {}, { current });
    // Sıfır tabanlı index sayacı oluşturulur.
    let i = 0;
    // Sayaç başlangıcı ayrı satırda gösterilir.
    this.step('initIndex', 'i = 0.', { i });
    // Geçerli index'e kadar en fazla size-1 kez ilerlenir.
    while (true) {
      // Son false koşulu da kodla eşlenir.
      this.step('loop', `i < index → ${i < index}.`);
      // Hedef konumda dolaşma durur.
      if (i >= index) break;
      // Referans ileri taşınır.
      current = current.next!;
      // Hareket sayacın artışından ayrıdır.
      this.step('advance', 'current → current.next.', {}, { current });
      // Konum bir artırılır.
      i++;
      // Konum kendi kod satırıyla gösterilir.
      this.step('increment', 'i bir artırıldı.', { i });
    }
    // Bulunan gerçek Node çağıran algoritmaya döner.
    return current;
  }

  // İndexli okuma listeyi değiştirmez.
  get(index: number): T | null {
    // Beklenen sınır hatası güvenli null dönüşü üretir.
    if (!this.valid(index))
      return this.finish(null, 'guardReturn', 'Okuma için 0 ≤ index < size olmalı.');
    // locate içindeki her hareket ekrandaki döngü satırına eşlenir.
    const current = this.locate(index);
    // Seçili nesnenin data değeri doğrudan döner.
    return this.finish(current.data);
  }

  // İlk eleman tail.next sayesinde O(1) zamanda okunur.
  getFirst(): T | null {
    // Null tail boş listenin tek uç göstergesidir.
    this.step('empty', `tail == null → ${this.tail === null}.`);
    // Boş listede erişim yapılmaz.
    if (this.tail === null)
      return this.finish(null, 'emptyReturn', 'Liste boş; okunacak data yok.');
    // İlk veri tail.next üzerinden okunur.
    return this.finish(this.tail.next!.data);
  }

  // Son eleman doğrudan saklanan tail'den okunur.
  getLast(): T | null {
    // Boşluk kontrolü ayrı koşuldur.
    this.step('empty', `tail == null → ${this.tail === null}.`);
    // Boş listede null güvenli sonuçtur.
    if (this.tail === null)
      return this.finish(null, 'emptyReturn', 'Liste boş; okunacak data yok.');
    // Son veri bağlantıları değiştirmeden döner.
    return this.finish(this.tail.data);
  }

  // Veri değişir; hiçbir next bağlantısı veya tail değiştirilmez.
  set(index: number, value: T): T | null {
    // Geçersiz index bütün halkayı korur.
    if (!this.valid(index))
      return this.finish(null, 'guardReturn', 'Güncelleme için 0 ≤ index < size olmalı.');
    // Gerçek Node ileri bağlantılarla bulunur.
    const current = this.locate(index);
    // Eski data dönüş için kaydedilir.
    const oldValue = current.data;
    // Veri saklama bağımsız adımdır.
    this.step('save', 'Eski data oldValue içinde saklandı.', { oldValue: String(oldValue) });
    // Yalnız data alanı güncellenir.
    current.data = value;
    // Data ataması ayrı kod satırıdır.
    this.step('update', 'current.data → value. Halka bağlantıları değişmedi.');
    // Önceki data doğrudan döner.
    return this.finish(oldValue);
  }

  // Arama null beklemez; size kadar karşılaştırma sonunda bir tur tamamlanır.
  private search(value: T, last: boolean): number {
    // Başlangıç referansı boş listede null olabilir.
    let current = this.tail?.next ?? null;
    // Tail üzerinden başlangıç bulunur.
    this.step('init', 'current → tail == null ? null : tail.next.', {}, { current });
    // Index sayacı ilk konumdan başlar.
    let i = 0;
    // Başlangıç sayacı ayrı satırdır.
    this.step('initIndex', 'i = 0.', { i });
    // Son eşleşme bulunana kadar sentinel -1 saklanır.
    let found = -1;
    // lastIndexOf bütün halkayı gezer; indexOf ilk eşleşmede döner.
    if (last) this.step('foundInit', 'found = -1.', { found });
    // Halka null ile bitmediğinden açık bir tur sınırı kullanılır.
    while (true) {
      // i == size olduğunda tekrar ilk Node'a dönülmüş olur ve döngü biter.
      this.step('loop', `i < size → ${i < this.count}. Bir halka en fazla size Node içerir.`);
      // Bu guard boş listede de next erişimini engeller.
      if (i >= this.count) break;
      // Data eşleşmesi referans hareketinden ayrıdır.
      this.step('compare', `current.data == value → ${current!.data === value}.`);
      // Eşleşmede ilk veya son konum stratejisi uygulanır.
      if (current!.data === value) {
        // İlk eşleşme aramasında hemen index döner.
        if (!last) return this.finish(i, 'foundReturn');
        // Son eşleşme sonraki aynı değerle güncellenebilir.
        found = i;
        // Bulunan index ayrı bir değişken atamasıdır.
        this.step('found', 'found → i. Son eşleşmenin index’i güncellendi.', { found });
      }
      // Bir sonraki Node'a geçilir; son Node'dan sonra ilk Node'a dönülür.
      current = current!.next;
      // Dönüş bağlantısı gerçek referans hareketi olarak görünür.
      this.step(
        'advance',
        'current → current.next. Tail’den sonra ilk Node’a dönülür.',
        {},
        { current },
      );
      // İşlenen eleman sayısı bir artırılır.
      i++;
      // Index ayrı satırda güncellenir.
      this.step('increment', 'i bir artırıldı.', { i });
    }
    // Last aramasında bulunan son index; diğerinde -1 döner.
    return this.finish(found);
  }

  // İlk eşleşmenin sıfır tabanlı konumunu bulur.
  indexOf(value: T): number {
    // Ortak arama ilk eşleşmede sonlanır.
    return this.search(value, false);
  }

  // Tek yönlü halkada son eşleşme için tam bir tur ileri gidilir.
  lastIndexOf(value: T): number {
    // Reverse Traversal eklenmez; bütün ilerlemeler next üzerindendir.
    return this.search(value, true);
  }

  // Arama sonucu mantıksal değere çevrilir.
  contains(value: T): boolean {
    // Alt çağrı adımları ekranda açık gösterilir.
    const index = this.call('search.', () => this.indexOf(value));
    // Alt çağrı sonucu gerçek yerel değişkenine atanır.
    this.step('searchResult', 'index → indexOf(value).', { index });
    // Son mantıksal dönüşün ayrı kod satırı vardır.
    return this.finish(index !== -1, 'containsReturn');
  }

  // İlk eşleşmeyi kaldırır; bulunamayan değer halkayı değiştirmez.
  remove(value: T): boolean {
    // Tek turla eşleşme konumu bulunur.
    const index = this.call('search.', () => this.indexOf(value));
    // Bulunan index çağıranın yerel değişkenine atanır.
    this.step('searchResult', 'index → indexOf(value).', { index });
    // Bulunamayan hedef ayrı koşuldur.
    this.step('missing', `index == -1 → ${index === -1}.`);
    // Hedef bulunamadığında güvenle false döner.
    if (index === -1) return this.finish(false, 'missingReturn');
    // Bulunan konum gerçek bağlantı silme algoritmasına verilir.
    this.call('removal.', () => this.removeAt(index));
    // Silinen data değil başarılı silme bilgisi döner.
    return this.finish(true, 'removedReturn');
  }

  // Bir tur dolaşıp data değerlerini sıralı olarak toplar.
  traversal(): T[] {
    // Çıktı koleksiyonu başlangıçta boştur.
    const values: T[] = [];
    // Koleksiyon oluşturma ayrı satırdır.
    this.step('output', 'values boş koleksiyon olarak oluşturuldu.', { values: '[]' });
    // İlk Node yalnız tail üzerinden bulunur.
    let current = this.tail?.next ?? null;
    // Başlangıç referansı ayrı gösterilir.
    this.step('init', 'current → tail == null ? null : tail.next.', {}, { current });
    // İşlenen Node sayacı sıfırdan başlar.
    let i = 0;
    // Sayaç başlangıcı ayrı adımdır.
    this.step('initIndex', 'i = 0.', { i });
    // null yerine size sınırı kullanılarak tam bir tur yapılır.
    while (true) {
      // Her tur koşulu ayrı kod satırına bağlanır.
      this.step('loop', `i < size → ${i < this.count}. İlk Node’a dönünce ikinci tura girilmez.`);
      // Boyut kadar Node işlenince döngü biter.
      if (i >= this.count) break;
      // Mevcut data çıktı koleksiyonuna eklenir.
      values.push(current!.data);
      // Koleksiyon değişimi ayrı satırda gösterilir.
      this.step('visit', 'current.data values koleksiyonuna eklendi.', {
        values: JSON.stringify(values),
      });
      // Sıradaki referans izlenir.
      current = current!.next;
      // Son Node'un next oku ilk Node'a geri gider.
      this.step('advance', 'current → current.next.', {}, { current });
      // İşlenen Node sayısı artırılır.
      i++;
      // Sayaç artışı ayrı kod/trace adımıdır.
      this.step('increment', 'i bir artırıldı.', { i });
    }
    // Çıktı doğrudan döndürülür.
    return this.finish(values);
  }

  // Önce halkayı açar; C kaynağıyla aynı sırayla Node bağlantılarını temizler.
  clear(): void {
    // Boşluk koşulu gereksiz tail.next erişimini engeller.
    this.step('empty', `tail == null → ${this.tail === null}.`);
    // Boş liste güvenle tamamlanır.
    if (this.tail === null) return this.finish(undefined, 'emptyReturn');
    // Temizlenecek zincirin ilk Node'u korunur.
    let current: Node<T> | null = this.tail.next;
    // Current ilk Node'u gösterir; head alanı oluşturulmaz.
    this.step('current', 'current → tail.next.', {}, { current });
    // Önce dairesel dönüş bağlantısı açılır.
    this.tail.next = null;
    // Bundan sonra null ile sonlanan geçici bir zincir vardır.
    this.step('open', 'tail.next → null. Halka temizlemek için açıldı.');
    // Listenin kalıcı erişimi kaldırılır.
    this.tail = null;
    // Geçici current zinciri henüz gösterilmeye devam eder.
    this.step('tail', 'tail → null. Kalan Node’lar current üzerinden temizlenecek.');
    // Açılan zincir sırayla temizlenir.
    while (true) {
      // Null koşulu yalnız halka açıldıktan sonra kullanılır.
      this.step('loop', `current != null → ${current !== null}.`);
      // Bütün Node'lar bitince çıkılır.
      if (current === null) break;
      // Sıradaki Node bağlantı silinmeden korunur.
      const following: Node<T> | null = current.next;
      // Following gerçek geçici referanstır.
      this.step('following', 'following → current.next.', {}, { following });
      // İşlenen Node'un bağlantısı kaldırılır.
      current.next = null;
      // Ayrı next ataması kodla birlikte vurgulanır.
      this.step('detach', 'current.next → null.');
      // İşlenen nesne bir azaltılır.
      this.count--;
      // Sayaç her Node için ayrı değişir.
      this.step('countDown', 'size bir azaltıldı.');
      // Bir sonraki nesneye geçilir.
      current = following;
      // Referans hareketi ayrı adımdır.
      this.step('advance', 'current → following.', {}, { current });
    }
    // following yerel kapsamı da işlem bitiminde kaldırılır.
    this.finish(undefined);
  }
}

// Kalıcı halkayı değiştirmeden çalışma kopyasında bütün işlem adımları üretilir.
export function circularTrace(
  baseline: ListSnapshot<string>,
  operation: CircularOperation,
  params: Parameters,
): Trace<string> {
  // İlk kayıt işlem öncesindeki halka ve parametrelerdir.
  const steps: ExecutionStep<string>[] = [
    {
      key: 'start',
      explanation:
        'Circular Linkedlist: yalnız tail tutulur. İlk Node tail.next; son next ilk Node’a döner.',
      variables: {
        ...(params.value !== undefined ? { value: params.value } : {}),
        ...(params.index !== undefined ? { index: params.index } : {}),
      },
      references: {},
      snapshot: baseline,
    },
  ];
  // Her observer çağrısı önceki kayıtlardan bağımsız snapshot taşır.
  const list = CircularLinkedlist.fromSnapshot(baseline, (step) =>
    steps.push({ ...step, variables: { ...steps[0].variables, ...step.variables } }),
  );
  // UI prefix'i gerçek model method adına çevrilir.
  const raw = operation.slice(8);
  // Baş harf method imzasına uygun küçük harfe dönüştürülür.
  const name = (raw[0].toLowerCase() + raw.slice(1)) as Operation;
  // Eksik parametre NaN ile model guard'ına gider; sessizce index 0 seçilmez.
  const index = params.index ?? NaN;
  // UI doğrulaması dışında da doğrudan model çağrıları desteklenir.
  const value = params.value ?? '';
  // İşlemin doğrudan sonucu trace metadatasında saklanır.
  let returnValue: unknown;
  // Parametre sözleşmesine göre doğru algoritma çağrılır.
  if (name === 'insertAt' || name === 'set') returnValue = list[name](index, value);
  // Yalnız index alan method'lar aynı sözleşmeyi paylaşır.
  else if (name === 'get' || name === 'removeAt') returnValue = list[name](index);
  // Yalnız value alan method'lar aynı çağrı biçimini kullanır.
  else if (['addFirst', 'addLast', 'indexOf', 'lastIndexOf', 'contains', 'remove'].includes(name))
    returnValue =
      list[name as 'addFirst' | 'addLast' | 'indexOf' | 'lastIndexOf' | 'contains' | 'remove'](
        value,
      );
  // Parametresiz method'larda ek argüman verilmez.
  else
    returnValue =
      list[
        name as
          | 'size'
          | 'isEmpty'
          | 'clear'
          | 'getFirst'
          | 'getLast'
          | 'removeFirst'
          | 'removeLast'
          | 'traversal'
      ]();
  // Son kayıt RETURN kutusunda gerçek sonucu gösterir.
  const last = steps.at(-1)!;
  // Void dönüş ile null değeri farklı gösterilir.
  last.result = returnValue === undefined ? 'void' : JSON.stringify(returnValue);
  // Oynatma motoru ileri/geri/reset için aynı immutable kayıtları kullanır.
  return {
    operation,
    baseline,
    steps,
    returnValue,
    ...(last.error ? { error: last.explanation } : {}),
  };
}
