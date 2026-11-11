// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { ListSnapshot, Trace, ExecutionStep } from './execution.types';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { PositionedNode } from './visual-layout';

/** Ekleme boyunca yeni nesne üstte, eski liste altta aynı slotları korur. */
export function doublyPositions(
  snapshot: ListSnapshot<string>,
  trace: Trace<string> | null,
  completed: boolean,
  step?: ExecutionStep<string> | null,
): PositionedNode[] {
  // Gerçek sıra head/next ile bulunur; referans kayıt sırası görsel sıralama değildir.
  const order = (state: ListSnapshot<string>) => {
    // ids hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const ids: string[] = [];
    // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon kimliğe göre Map içinde tutulur; referans hedefi hızlı ve kararlı bulunur.
    const nodes = new Map(state.nodes.map((node) => [node.id, node]));
    // Ziyaret edilen kimlikleri tekilleştirir; aynı nesnenin tekrar işlenmesini veya döngüyü önler.
    const visited = new Set<string>();
    // Adımlar arasında aynı nesneyi izleten görsel kimlik bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let id = state.head;
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (id && !visited.has(id)) {
      // visited.add çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      visited.add(id);
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      ids.push(id);
      // Bu atamayla id güncellenir; sonraki satır yeni değeri kullanır.
      id = nodes.get(id)?.next ?? null;
    }
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return ids;
  };
  // Reset veya iptal için korunan işlem başlangıç listesi bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const baseline = trace ? order(trace.baseline) : [];
  // Dolaşmada o anda seçilen nesne referansı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const current = order(snapshot);
  // baselineSlots hesabında kullanılan ara değer kimliğe göre Map içinde tutulur; referans hedefi hızlı ve kararlı bulunur.
  const baselineSlots = new Map(baseline.map((id, index) => [id, index]));
  // currentSlots hesabında kullanılan ara değer kimliğe göre Map içinde tutulur; referans hedefi hızlı ve kararlı bulunur.
  const currentSlots = new Map(current.map((id, index) => [id, index]));
  // operation hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const operation = trace?.operation;
  // Ekleme slotu parametre veya seçilen uçtan gelir; eski sıra bu slotta boşluk bırakır.
  const index =
    operation === 'doublyAddLast'
      ? baseline.length
      : operation === 'doublyInsertAt'
        ? Number(trace?.steps[0].variables['index'] ?? 0)
        : 0;
  // inserting hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const inserting =
    ['doublyAddFirst', 'doublyAddLast', 'doublyInsertAt'].includes(operation ?? '') &&
    !completed &&
    snapshot.nodes.some((node) => !baseline.includes(node.id));
  // Silinecek current ilk veri kaydından itibaren üstte hazırlanır; eski sıra korunur.
  const removal = [
    'doublyRemoveAt',
    'doublyRemoveFirst',
    'doublyRemoveLast',
    'doublyRemove',
  ].includes(operation ?? '');
  // Silme hazırlığının save adımında başladığı konumu bulur.
  const savedIndex = trace?.steps.findIndex((record) => record.key === 'save') ?? -1;
  // Mevcut kayıt nesnesinin trace içindeki konumunu bulur.
  const stepIndex = step && trace ? trace.steps.indexOf(step) : -1;
  // Save adımından sonra silinen nesnenin üst hazırlık satırında kalmasını seçer.
  const removalStarted = savedIndex >= 0 && stepIndex >= savedIndex;
  // Nesnenin silme hazırlığına alınıp alınmadığını bulur; önce dikey hareket yapılır.
  const removing = removal && !!removalStarted && !completed;
  // clearing hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const clearing = operation === 'doublyClear' && !completed;
  // Silme veya Clear adımında current referansının gösterdiği nesneyi seçer.
  const selected = step?.references['current'];
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return snapshot.nodes.map((node) => {
    // Nesnenin işlem başlangıcındaki sıra index’ini bulur; kimlikler değişmez.
    const oldIndex = baselineSlots.get(node.id) ?? -1;
    // Bu nesnenin yatay yerleşim sırasını saklar; boş slotlar ara adımlarda korunur.
    let slot = Math.max(0, currentSlots.get(node.id) ?? -1);
    // y hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let y = 122;
    // İşlenen nesnenin üst hazırlık satırında olup olmadığını belirler.
    let raised = false;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (inserting) {
      // Bu atamayla slot güncellenir; sonraki satır yeni değeri kullanır.
      slot = oldIndex < 0 ? index : oldIndex + (oldIndex >= index ? 1 : 0);
      // Bu atamayla y güncellenir; sonraki satır yeni değeri kullanır.
      y = oldIndex >= 0 ? 300 : 122;
      // Bu atamayla raised güncellenir; sonraki satır yeni değeri kullanır.
      raised = oldIndex < 0;
    } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
      removing ||
      clearing
    ) {
      // Henüz kopmamış bağlantılar da aynı slotlarda kalır; sahne yalnız geometriyi değiştirir.
      slot = Math.max(0, oldIndex);
      // Bu atamayla raised güncellenir; sonraki satır yeni değeri kullanır.
      raised = node.id === selected;
      // Bu atamayla y güncellenir; sonraki satır yeni değeri kullanır.
      y = raised ? 122 : 300;
    }
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return { ...node, x: 100 + slot * 210, y, detached: raised };
  });
}

/** Ayrı yükseklikler ve koridorlar ileri/geri okların birleşmesini önler. */
export function doublyEdgePoints(
  node: PositionedNode,
  nodes: PositionedNode[],
  direction: 'prev' | 'next',
) {
  // İleri veya geri yönü seçer; aynı geometri iki karşıt port ailesi kullanır.
  const forward = direction === 'next';
  // Bir sonraki karelerin ulaşacağı nesne konumları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const target = nodes.find((n) => n.id === node[direction]);
  // İleri ok üst, geri ok alt portu kullanır.
  const source = { x: node.x + (forward ? 144 : 0), y: node.y + (forward ? 24 : 48) };
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (!target) return [source, { x: source.x + (forward ? 28 : -28), y: source.y }];
  // Aynı hedefe gelen iki aynı yönlü bağlantı farklı giriş portlarına ayrılır.
  const incoming = nodes
    .filter((source) => source[direction] === target.id)
    .sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
  // Aynı hedefe gelen kaynakların kararlı sırasındaki yerini bulur.
  const rank = incoming.findIndex((source) => source.id === node.id);
  // Aynı hedefe gelen ok veya etiket için ayrı giriş mesafesini hesaplar.
  const offset = (rank + 0.5 - incoming.length / 2) * 14;
  // Okun hedef nesnedeki ayrı giriş noktasını hesaplar.
  const end = { x: target.x + (forward ? -2 : 146), y: target.y + (forward ? 24 : 48) + offset };
  // Aynı satırda iki karşıt yön iki paralel düz ok olarak görünür.
  if (Math.abs(source.y - end.y) < 1) return [source, end];
  // Hazırlık satırları arasında her yön kendi koridorunu kullanır.
  const corridor = forward ? (source.x + end.x) / 2 - 12 : (source.x + end.x) / 2 + 12;
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return [source, { x: corridor, y: source.y }, { x: corridor, y: end.y }, end];
}

/** Kısa segmentlerde radius güvenli sınırla küçülür; keskin köşe üretilmez. */
export function roundedDoublyPath(points: { x: number; y: number }[]): string {
  // Noktaları SVG M/L/Q komutlarına dönüştüren yol metnini biriktirir.
  let path = `M ${points[0].x} ${points[0].y}`;
  // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
  for (let i = 1; i < points.length - 1; i++) {
    // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const previous = points[i - 1],
      corner = points[i],
      next = points[i + 1];
    // Bu hedefe gelen aynı yönlü kaynakları toplar veya köşenin giriş uzunluğunu ölçer.
    const incoming = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    // Köşenin çıkış segmenti uzunluğunu ölçer; radius bu mesafeyi aşmaz.
    const outgoing = Math.hypot(next.x - corner.x, next.y - corner.y);
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!incoming || !outgoing) continue;
    // Kısa segmentlerde dönüş yarıçapını güvenli uzunlukla sınırlar.
    const radius = Math.min(24, incoming / 2, outgoing / 2);
    // Radiuslu dönüşe girmeden önceki teğet noktayı hesaplar.
    const before = {
      x: corner.x + ((previous.x - corner.x) * radius) / incoming,
      y: corner.y + ((previous.y - corner.y) * radius) / incoming,
    };
    // Radiuslu dönüşten sonraki teğet noktayı hesaplar.
    const after = {
      x: corner.x + ((next.x - corner.x) * radius) / outgoing,
      y: corner.y + ((next.y - corner.y) * radius) / outgoing,
    };
    // Bu işlem mevcut yerel durumu günceller veya ilgili yardımcıyı çağırır; sıra algoritma kaydında korunur.
    path += ` L ${before.x} ${before.y} Q ${corner.x} ${corner.y} ${after.x} ${after.y}`;
  }
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return path + ` L ${points.at(-1)!.x} ${points.at(-1)!.y}`;
}

/** Etiketler Node’un üstünde kalır; bağlantı koridorlarının içine taşmaz. */
export function doublyReferences(
  nodes: PositionedNode[],
  refs: {
    /* name hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır. */ name: string;
    /* Bir sonraki karelerin ulaşacağı nesne konumları; bu alan kayıt sözleşmesinin parçasıdır. */ target: string;
    /* opacity hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır. */ opacity: number;
  }[],
) {
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return refs
    .filter((ref) => !ref.name.includes('.') && ref.opacity > 0.001)
    .flatMap((ref) => {
      // İşlemde oluşturulan veya gösterilen nesne bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const node = nodes.find((node) => node.id === ref.target);
      // Eksik veya daha önce ziyaret edilen nesneyi atlar; iki yönlü zincirde sonsuz döngü oluşmaz.
      if (!node) return [];
      // Aynı nesneyi gösteren head/tail/node için üç farklı üst giriş kullanılır.
      const group = refs
        .filter(
          (other) =>
            !other.name.includes('.') && other.opacity > 0.001 && other.target === ref.target,
        )
        .sort(
          (a, b) =>
            ['head', 'tail', 'node'].indexOf(a.name) - ['head', 'tail', 'node'].indexOf(b.name),
        );
      // Kullanıcının seçtiği, sıfırdan başlayan hedef konum bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const index = group.findIndex((other) => other.name === ref.name);
      // Üçüncü ortak referansı ayrı üst satıra alır; ilk iki etiketin arasındaki boşluk kullanılır.
      const third = index === 2;
      // Aynı hedefe gelen ok veya etiket için ayrı giriş mesafesini hesaplar.
      const offset = group.length === 1 || third ? 36 : index * 80 - 4;
      // y hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const y = node.y - (third ? 84 : 44);
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [{ ...ref, x: node.x + offset, y, path: `M 36 24 L 36 ${node.y - y - 4}` }];
    });
}
