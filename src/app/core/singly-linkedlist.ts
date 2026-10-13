import { Node } from './node';
import type { ListSnapshot, References, StepObserver, Variables } from './execution.types';

/**
 * Eğitim algoritmaları: data/next değişimleri normal Node nesneleri üzerinde yapılır.
 * Observer, algoritmayı arayüze bağlamadan her anlamlı adımın fotoğrafını üretir.
 * tail saklamıyoruz: addLast/removeLast dolaşmasını öğrencinin görmesini istiyoruz.
 */
export class SinglyLinkedlist<T> {
  head: Node<T> | null = null;
  private count = 0;
  private variables: Variables = {};
  private references: References<T> = {};

  constructor(private readonly observer?: StepObserver<T>) {}

  snapshot(): ListSnapshot<T> {
    // Geçici referansların gösterdiği, henüz listeye bağlanmamış Node'lar da görünür.
    const nodes = new Map<string, Node<T>>();
    const visit = (start: Node<T> | null) => {
      let current = start;
      while (current && !nodes.has(current.id)) {
        nodes.set(current.id, current);
        current = current.next;
      }
    };
    visit(this.head);
    Object.values(this.references).forEach(visit);
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
    const list = new SinglyLinkedlist<T>(observer);
    const nodes = new Map(snapshot.nodes.map((n) => [n.id, new Node(n.data, null, n.id)]));
    for (const n of snapshot.nodes)
      nodes.get(n.id)!.next = n.next ? (nodes.get(n.next) ?? null) : null;
    list.head = snapshot.head ? (nodes.get(snapshot.head) ?? null) : null;
    list.count = snapshot.size;
    return list;
  }

  private step(
    key: string,
    explanation: string,
    vars: Variables = {},
    refs: References<T> = {},
    error = false,
  ) {
    this.variables = { ...this.variables, ...vars };
    this.references = { ...this.references, ...refs };
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

  private finish<V>(value: V, key = 'return'): V {
    // Algoritma bitince yerel referanslar scope dışına çıkar; ayrık Node'lar görünümden kalkar.
    this.references = {};
    this.step(
      key,
      'İşlem tamamlandı. Sonuç aşağıda gösteriliyor; liste sonraki işlem için korunur.',
    );
    return value;
  }

  private failure(message: string): null {
    this.step('guard', message, {}, {}, true);
    return null;
  }

  private valid(index: number, insertion = false): boolean {
    return (
      Number.isInteger(index) &&
      index >= 0 &&
      (insertion ? index <= this.count : index < this.count)
    );
  }

  isEmpty(): boolean {
    this.step(
      'check',
      `head ${this.head ? 'bir Node gösteriyor: liste boş değil.' : 'null: liste boş.'}`,
      { empty: this.head === null },
    );
    return this.finish(this.head === null);
  }

  size(): number {
    this.step('check', `size = ${this.count}. Eleman sayacı her ekleme ve silmede güncellenir.`, {
      count: this.count,
    });
    return this.finish(this.count);
  }

  clear(): void {
    this.head = null;
    this.step('head', 'head → null. Liste artık hiçbir Node’a erişmiyor.');
    this.count = 0;
    this.step('count', 'size → 0. Clear boş listede de güvenlidir.', { size: 0 });
    this.finish(undefined);
  }

  addFirst(value: T): void {
    // Yeni Node henüz listeye bağlı değildir; başlangıç next parametresi null verilir.
    const node = new Node(value, null);
    this.step('create', 'Yeni Node oluşturuldu; next başlangıçta null.', {}, { node });
    node.next = this.head;
    this.step(
      'link',
      this.head
        ? 'node.next → eski head. Yeni Node, eski ilk Node’a bağlandı.'
        : 'node.next → null. Liste boş; bağlanacak eski Node yok.',
    );
    this.head = node;
    this.step('head', 'head → node. Yeni Node artık listenin başı.');
    this.count++;
    this.step('count', 'size bir artırıldı.', { size: this.count });
    this.finish(undefined);
  }

  insertAt(index: number, value: T): void {
    this.step('guard', `Ekleme index’i 0 ile ${this.count} arasında olmalı.`, { index });
    if (!this.valid(index, true)) {
      this.failure('Geçersiz index. Ekleme için 0 ≤ index ≤ size olmalı.');
      return;
    }
    // Yeni Node henüz listeye bağlı değildir; başlangıç next parametresi null verilir.
    const node = new Node(value, null);
    this.step('create', 'Yeni Node oluşturuldu.', {}, { node });
    this.step('branch', `index == 0 koşulu ${index === 0}.`, { index });
    if (index === 0) {
      node.next = this.head;
      this.step('linkHead', 'node.next → eski head.');
      this.head = node;
      this.step('head', 'head → yeni node.');
    } else {
      let previous = this.head!;
      let i = 0;
      this.step('init', 'previous → head; i = 0.', { i }, { previous });
      while (true) {
        this.step('loop', `i < index - 1: ${i} < ${index - 1} → ${i < index - 1}.`, { i });
        if (i >= index - 1) break;
        previous = previous.next!;
        this.step(
          'advance',
          'previous → previous.next. Referans bir Node ilerledi.',
          {},
          { previous },
        );
        i++;
        this.step('increment', `i bir artırıldı: ${i - 1} → ${i}.`, { i });
      }
      node.next = previous.next;
      this.step('link', 'node.next → previous.next. Eski bağlantının hedefi korunuyor.');
      previous.next = node;
      this.step('attach', 'previous.next → node. Yeni Node araya yerleştirildi.');
    }
    this.count++;
    this.step('count', 'size bir artırıldı.', { size: this.count });
    this.finish(undefined);
  }

  addLast(value: T): void {
    // Yeni Node henüz listeye bağlı değildir; başlangıç next parametresi null verilir.
    const node = new Node(value, null);
    this.step('create', 'Yeni Node oluşturuldu; next = null.', {}, { node });
    this.step('branch', `head == null koşulu ${this.head === null}.`);
    if (!this.head) {
      this.head = node;
      this.step('head', 'Liste boştu: head → node.');
    } else {
      let current = this.head;
      this.step('init', 'current → head. Son Node’u arayacağız.', {}, { current });
      while (true) {
        this.step('loop', `current.next != null koşulu ${current.next !== null}.`);
        if (!current.next) break;
        current = current.next;
        this.step(
          'advance',
          'current → current.next. Referans sonraki Node’a ilerledi.',
          {},
          { current },
        );
      }
      current.next = node;
      this.step('attach', 'current.next → node. Yeni Node listenin sonuna bağlandı.');
    }
    this.count++;
    this.step('count', 'size bir artırıldı.', { size: this.count });
    this.finish(undefined);
  }

  /** Aynı dolaşma algoritması get, set ve removeAt için kullanılır. */
  private locate(
    index: number,
    withPrevious = true,
  ): { current: Node<T>; previous: Node<T> | null } {
    let current = this.head!;
    let previous: Node<T> | null = null;
    let i = 0;
    this.step(
      'init',
      withPrevious ? 'current → head; previous = null; i = 0.' : 'current → head; i = 0.',
      { i },
      withPrevious ? { current, previous } : { current },
    );
    while (true) {
      this.step('loop', `i < index: ${i} < ${index} → ${i < index}.`);
      if (i >= index) break;
      if (withPrevious) {
        previous = current;
        this.step(
          'previous',
          'previous → current. Önceki Node referansı saklanıyor.',
          {},
          { previous },
        );
      }
      current = current.next!;
      this.step('advance', 'current → current.next.', {}, { current });
      i++;
      this.step('increment', `i: ${i - 1} → ${i}.`, { i });
    }
    return { current, previous };
  }

  removeAt(index: number): T | null {
    this.step('guard', `Silme index’i 0 ile ${this.count - 1} arasında olmalı.`, { index });
    if (!this.valid(index))
      return this.failure(
        this.count === 0
          ? 'Liste boş; silinecek Node yok.'
          : 'Geçersiz index. 0 ≤ index < size olmalı.',
      );
    const { current, previous } = this.locate(index);
    this.step(
      'branch',
      `previous == null koşulu ${previous === null}: ${previous ? 'arada/sonda silme.' : 'head silme.'}`,
    );
    if (!previous) {
      this.head = current.next;
      this.step('head', 'head → current.next. İlk Node listeden ayrıldı.');
    } else {
      previous.next = current.next;
      this.step('unlink', 'previous.next → current.next. Silinen Node atlanıyor.');
    }
    this.count--;
    this.step('count', 'size bir azaltıldı.', { size: this.count });
    return this.finish(current.data);
  }

  removeFirst(): T | null {
    return this.removeAt(0);
  }
  removeLast(): T | null {
    return this.removeAt(this.count - 1);
  }

  get(index: number): T | null {
    this.step('guard', `Okuma index’i 0 ile ${this.count - 1} arasında olmalı.`, { index });
    if (!this.valid(index))
      return this.failure(
        this.count === 0
          ? 'Liste boş; okunacak Node yok.'
          : 'Geçersiz index. 0 ≤ index < size olmalı.',
      );
    const { current } = this.locate(index, false);
    this.step('read', 'current.data okunuyor; bağlantılar değişmiyor.', {
      old: String(current.data),
    });
    return this.finish(current.data);
  }

  getFirst(): T | null {
    return this.get(0);
  }
  getLast(): T | null {
    return this.get(this.count - 1);
  }

  set(index: number, value: T): T | null {
    this.step('guard', `Güncelleme index’i 0 ile ${this.count - 1} arasında olmalı.`, { index });
    if (!this.valid(index))
      return this.failure('Geçersiz index veya boş liste. Node güncellenmedi.');
    const { current } = this.locate(index, false);
    const old = current.data;
    this.step('read', 'Eski data değeri saklandı.', { old: String(old) });
    current.data = value;
    this.step('update', 'current.data yeni değerle değiştirildi; next aynı kaldı.');
    return this.finish(old);
  }

  private search(value: T, last = false): number {
    let current = this.head;
    let i = 0;
    let found = -1;
    this.step('init', 'current → head; i = 0; found = -1.', { i, found }, { current });
    while (true) {
      this.step('loop', `current != null koşulu ${current !== null}.`);
      if (!current) break;
      this.step(
        'compare',
        `current.data ile aranan değer eşleşmesi: ${Object.is(current.data, value)}.`,
      );
      if (Object.is(current.data, value)) {
        found = i;
        this.step('found', `Eşleşme bulundu: found = ${found}.`, { found });
        if (!last) break;
      }
      current = current.next;
      this.step('advance', 'current → current.next.', {}, { current });
      i++;
      this.step('increment', `i: ${i - 1} → ${i}.`, { i });
    }
    return found;
  }

  indexOf(value: T): number {
    return this.finish(this.search(value));
  }
  lastIndexOf(value: T): number {
    return this.finish(this.search(value, true));
  }
  contains(value: T): boolean {
    const found = this.search(value);
    this.step('check', `found != -1 koşulu ${found !== -1}.`, { exists: found !== -1 });
    return this.finish(found !== -1);
  }

  remove(value: T): boolean {
    let current = this.head;
    let previous: Node<T> | null = null;
    this.step('init', 'current → head; previous = null.', {}, { current, previous });
    while (true) {
      this.step('loop', `current != null koşulu ${current !== null}.`);
      if (!current) return this.finish(false, 'notFound');
      this.step('compare', `data eşleşmesi ${Object.is(current.data, value)}.`);
      if (Object.is(current.data, value)) break;
      previous = current;
      this.step('previous', 'previous → current.', {}, { previous });
      current = current.next;
      this.step('advance', 'current → current.next.', {}, { current });
    }
    this.step('branch', `previous == null koşulu ${previous === null}.`);
    if (!previous) {
      this.head = current.next;
      this.step('head', 'head → current.next.');
    } else {
      previous.next = current.next;
      this.step('unlink', 'previous.next → current.next. İlk eşleşme listeden ayrıldı.');
    }
    this.count--;
    this.step('count', 'size bir azaltıldı.', { size: this.count });
    return this.finish(true);
  }

  traversal(): T[] {
    const values: T[] = [];
    let current = this.head;
    this.step('init', 'current → head; çıktı listesi boş.', { output: '[]' }, { current });
    while (true) {
      this.step('loop', `current != null koşulu ${current !== null}.`);
      if (!current) break;
      values.push(current.data);
      this.step('read', 'current.data çıktıya eklendi.', { output: JSON.stringify(values) });
      current = current.next;
      this.step('advance', 'current → current.next.', {}, { current });
    }
    return this.finish(values);
  }
}
