import { DNode } from './dnode';
import type {
  DoublyOperation,
  ExecutionStep,
  ListSnapshot,
  Parameters,
  StepObserver,
  Trace,
} from './execution.types';

/** İlk aşama: head/tail, sayaç ve başa eklemenin her bağlantısı ayrı gözlenir. */
export class DoublyLinkedlist<T> {
  // Boş listede iki uç da null’dır.
  head: DNode<T> | null = null;
  tail: DNode<T> | null = null;
  private count = 0;
  // Yeni nesne bağlanmadan önce de sahnede gösterilir.
  private pending: DNode<T> | null = null;
  constructor(private readonly observer?: StepObserver<T>) {}

  snapshot(): ListSnapshot<T> {
    // Geçici nesne ve iki uçtan erişilen nesneler aynı kimlikle bir kez kaydedilir.
    const nodes = new Map<string, DNode<T>>();
    // İteratif ziyaret uzun listelerde JavaScript çağrı yığınına yük bindirmez.
    const queue = [this.head, this.tail, this.pending];
    while (queue.length) {
      const node = queue.pop();
      if (!node || nodes.has(node.id)) continue;
      nodes.set(node.id, node);
      queue.push(node.prev, node.next);
    }
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
  static fromSnapshot<T>(snapshot: ListSnapshot<T>, observer?: StepObserver<T>) {
    // Önce bütün nesneler, ardından referansları kurulmalıdır.
    const list = new DoublyLinkedlist<T>(observer);
    const nodes = new Map(snapshot.nodes.map((n) => [n.id, new DNode(n.data, null, null, n.id)]));
    for (const n of snapshot.nodes) {
      nodes.get(n.id)!.prev = n.prev ? (nodes.get(n.prev) ?? null) : null;
      nodes.get(n.id)!.next = n.next ? (nodes.get(n.next) ?? null) : null;
    }
    // Uçlar ve sayaç da başlangıç durumundan geri yüklenir.
    list.head = snapshot.head ? (nodes.get(snapshot.head) ?? null) : null;
    list.tail = snapshot.tail ? (nodes.get(snapshot.tail) ?? null) : null;
    list.count = snapshot.size;
    return list;
  }
  private step(key: string, explanation: string, variables = {}) {
    // Observer bağımsız fotoğraf alır; sonradan nesne değişimi eski adımı değiştirmez.
    this.observer?.({
      key,
      explanation,
      variables: { size: this.count, ...variables },
      references: this.pending ? { node: this.pending.id } : {},
      snapshot: this.snapshot(),
    });
  }
  isEmpty(): boolean {
    // Boşluk head üzerinden kontrol edilir; tail ile final invariant aynıdır.
    const empty = this.head === null;
    this.step(
      'check',
      empty ? 'head null: liste boş.' : 'head bir DNode gösteriyor: liste boş değil.',
      { empty },
    );
    this.step('return', `Sonuç: ${empty}. Liste değişmedi.`);
    return empty;
  }
  size(): number {
    // Sayaç sorgusu bağlantıları değiştirmez.
    this.step('check', `size = ${this.count}. Eleman sayacı okunur.`);
    this.step('return', `Sonuç: ${this.count}. Liste değişmedi.`);
    return this.count;
  }
  addFirst(value: T): void {
    // Constructor başlangıç bağlantıları açıkça null olarak verilir.
    const node = new DNode(value, null, null);
    this.pending = node;
    this.step(
      'create',
      'Yeni DNode oluşturuldu; prev ve next null. Mevcut liste aşağıda hazırlık alanına taşınır.',
      { value },
    );
    // Yeni nesnenin ileri bağlantısı önce eski head’e yönelir.
    node.next = this.head;
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
    if (this.head) {
      // Ters bağlantı ayrı atama ve ayrı animasyon adımıdır.
      this.head.prev = node;
      this.step(
        'prev',
        'head.prev = node. Eski ilk nesnenin geri bağlantısı yeni nesneyi gösterir.',
      );
    } else {
      // İlk ekleme listenin iki ucunu aynı nesneye bağlar.
      this.tail = node;
      this.step('tail', 'tail = node. Boş listenin son nesnesi artık yeni DNode.');
    }
    // Yeni baş ancak iki yönlü bağlantı hazırlığı tamamlandığında seçilir.
    this.head = node;
    this.step('head', 'head = node. Yeni DNode listenin ilk nesnesi oldu.');
    // Eleman sayısı ayrı satır ve ayrı adımda artırılır.
    this.count++;
    this.step('count', 'size bir artırıldı. head.prev null, tail.next null.');
    // Yerel referans kapsamdan çıkar; liste son yerleşimine yumuşak döner.
    this.pending = null;
    this.step(
      'return',
      'İşlem tamamlandı. İleri ve geri bağlantılar tutarlı; liste sonraki işlem için korunur.',
    );
  }
}

/** Ortak playback’ın tükettiği kayıtlar yalnız gerçek model adımlarından üretilir. */
export function doublyTrace(
  baseline: ListSnapshot<string>,
  operation: DoublyOperation,
  params: Parameters,
): Trace<string> {
  const steps: ExecutionStep<string>[] = [
    {
      key: 'start',
      explanation: 'Doubly Linkedlist başlangıcı: head, tail ve mevcut bağlantıları incele.',
      variables: params.value !== undefined ? { value: params.value } : {},
      references: {},
      snapshot: baseline,
    },
  ];
  // Parametreler her adımda görünür kalır; model kendi geçici değişkenlerini ekler.
  const list = DoublyLinkedlist.fromSnapshot(baseline, (step) =>
    steps.push({ ...step, variables: { ...steps[0].variables, ...step.variables } }),
  );
  let returnValue: unknown;
  if (operation === 'doublyAddFirst') returnValue = list.addFirst(params.value ?? '');
  else if (operation === 'doublyIsEmpty') returnValue = list.isEmpty();
  else returnValue = list.size();
  steps.at(-1)!.result = returnValue === undefined ? 'void' : JSON.stringify(returnValue);
  return { operation, baseline, steps, returnValue };
}
