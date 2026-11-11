// Geometri yalnız immutable kayıtları okur; model bağlantılarını değiştirmez.
import type { ExecutionStep, ListSnapshot, Trace } from './execution.types';
// Node boyutları ve referans portları kabul edilmiş Singly görünümüyle ortaktır.
import { nextPoints, sceneBounds, type PositionedNode, type ReferenceSpec } from './visual-layout';
// Aynı radius algoritması yeni bir animasyon motoru gerektirmez.
import { roundedDoublyPath } from './doubly-layout';

// Snapshot'ın türetilmiş ilk Node'undan yalnız bir tur dolaşır.
export function circularOrder(snapshot: ListSnapshot<string>): string[] {
  // Kimlik tablosu next hedefini sabit zamanda çözer.
  const nodes = new Map(snapshot.nodes.map((node) => [node.id, node]));
  // Aynı nesne ikinci kez işlenmez; self-loop güvenlidir.
  const visited = new Set<string>();
  // Sıra head alanı saklamadan tail.next üzerinden türetilmiştir.
  let id = snapshot.head;
  // Bir tur veya geçici açık zincirin sonuna kadar ilerlenir.
  while (id && nodes.has(id) && !visited.has(id)) {
    // Sıra ile ziyaret bilgisi tek koleksiyonda korunur.
    visited.add(id);
    // İleri referans izlenir.
    id = nodes.get(id)!.next;
  }
  // Ekleme sırasında tail yeni nesneye henüz taşınmamış olabilir; sıra yalnız görseldir.
  return [...visited];
}

// Ara ekleme ve silme adımlarında eski slotlar korunur; finalde halka sol üstte toplanır.
export function circularPositions(
  snapshot: ListSnapshot<string>,
  trace: Trace<string> | null,
  completed: boolean,
  step?: ExecutionStep<string> | null,
): PositionedNode[] {
  // Başlangıç ve güncel sıra kimlik bazında bulunur.
  const baseline = trace ? circularOrder(trace.baseline) : [];
  // Tamamlanan halka gerçek next sırasına göre çizilir.
  const order = circularOrder(snapshot);
  // İç prefix yalnız hangi işlemin sahnelendiğini ayırt eder.
  const operation = trace?.operation ?? '';
  // Yeni Node doğru index'te ayrı satıra alınır.
  const index =
    operation === 'circularAddLast'
      ? baseline.length
      : operation === 'circularInsertAt'
        ? Number(trace?.steps[0].variables['index'] ?? 0)
        : 0;
  // Yeni nesne oluşturulana kadar mevcut halka üst sırada kalır.
  const inserting =
    !completed &&
    ['circularAddFirst', 'circularAddLast', 'circularInsertAt'].includes(operation) &&
    snapshot.nodes.some((node) => !baseline.includes(node.id));
  // İç method çağrılarındaki save satırı da gerçek silme başlangıcıdır.
  const saved =
    trace?.steps.findIndex((record) => record.key === 'save' || record.key.endsWith('.save')) ?? -1;
  // Gösterilen kayıt indeksine göre hazırlığın başlayıp başlamadığı bulunur.
  const cursor = step && trace ? trace.steps.indexOf(step) : -1;
  // Silinecek Node korunurken diğer Node'lar alt sırada sabit kalır.
  const removing =
    !completed && operation.startsWith('circularRemove') && saved >= 0 && cursor >= saved;
  // Clear ilk current alındıktan sonra zinciri ayrı aşamalarda temizler.
  const clearing = !completed && operation === 'circularClear' && !!step?.references['current'];
  // Silme referansı gerçekten kullanılan current değişkenidir.
  const selected = step?.references['current'];
  // Her nesne kendi kimliğiyle taşınır; SVG öğeleri yeniden oluşturulmaz.
  return snapshot.nodes.map((node) => {
    // Eski sıradaki slot, ara adımlarda bağlantılar değişse de korunur.
    const oldIndex = baseline.indexOf(node.id);
    // Normal sahne güncel sırayı kullanır; ayrık nesneler güvenli bir ek slot alır.
    let slot = Math.max(0, order.indexOf(node.id));
    // Bütün Node'lar dinlenmede aynı yüksekliktedir.
    let y = 122;
    // Raised yalnız öğretici hazırlık satırını ifade eder.
    let raised = false;
    // Yeni Node için hedef slot boş bırakılır; eski kutular üstteki kutuyla çakışmaz.
    if (inserting) {
      // Yeni nesne kendi index'ine; eski nesneler boşluğu çevreleyen slotlara alınır.
      slot = oldIndex < 0 ? index : oldIndex + (oldIndex >= index ? 1 : 0);
      // Eski halka altta, yeni nesne üstte görünür.
      y = oldIndex < 0 ? 122 : 300;
      // Ayrı satır görsel olarak vurgulanır.
      raised = oldIndex < 0;
    } else if (removing || clearing) {
      // Silme sırasında eski sıra kaydırılmaz.
      slot = Math.max(0, oldIndex);
      // İşlenen nesne üstte hazırlanır.
      raised = node.id === selected;
      // Diğer nesneler ayrı alt sıradadır.
      y = raised ? 122 : 300;
    }
    // Sol pay, dönüş koridoru ve referans etiketleri için alan bırakır.
    return { ...node, x: 100 + slot * 210, y, detached: raised };
  });
}

// Geri dönen veya self-loop next oku bütün Node'ların altından geçen dış koridoru kullanır.
export function circularEdgePoints(node: PositionedNode, nodes: PositionedNode[]) {
  // Hedef yoksa normal null bağlantısı kullanılır; ara kod atamaları gizlenmez.
  const target = nodes.find((other) => other.id === node.next);
  // İleri bağlantılar mevcut ayrı giriş portlarıyla çizilir.
  if (!target) return nextPoints(node, nodes);
  // Aynı hedefteki next okları merkez çevresinde ayrı portlara alınır.
  const incoming = nodes
    .filter((other) => other.next === target.id)
    .sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
  // Mevcut okun hedefteki kararlı sırası bulunur.
  const rank = incoming.findIndex((other) => other.id === node.id);
  // Port yüksekliği birden çok okun birleşmesini engeller.
  const endY = target.y + (64 * (rank + 1)) / (incoming.length + 1);
  // İleri bağlantı iki kutu arasındaki boşlukta döner; hareket sırasında hedefe yatay girmez.
  if (target.x > node.x + 144) {
    // Kaynak ve hedef arasında güvenli dikey koridor seçilir.
    const corridor = (node.x + 144 + target.x) / 2;
    // Düz bağlantı yalnız port farkı kadar ayrılır; ara karelerde de kutuyu kesmez.
    return [
      { x: node.x + 144, y: node.y + 32 },
      { x: corridor, y: node.y + 32 },
      { x: corridor, y: endY },
      { x: target.x - 2, y: endY },
    ];
  }
  // Koridor bütün kutular ve kimlik etiketlerinin altından geçer.
  const lane = Math.max(...nodes.map((other) => other.y + 64)) + 70 + rank * 12;
  // Dış sağ dönüş, aradaki Node kutularını kesmez.
  const right = node.x + 144 + 24 + rank * 8;
  // Dış soldan hedefe yatay girilir; referans etiketleri üsttedir.
  const left = target.x - 24 - rank * 8;
  // Self-loop da aynı güvenli yolu izler; kendi kutusundan geçmez.
  return [
    { x: node.x + 144, y: node.y + 32 },
    { x: right, y: node.y + 32 },
    { x: right, y: lane },
    { x: left, y: lane },
    { x: left, y: endY },
    { x: target.x - 2, y: endY },
  ];
}

// Aynı radius kuralları bütün next oklarında kullanılır.
export function circularPath(node: PositionedNode, nodes: PositionedNode[]): string {
  // Yumuşak dönüşler adım animasyonunun her karesinde gerçek koordinatlarla hesaplanır.
  return roundedDoublyPath(circularEdgePoints(node, nodes));
}

// Fit dış halka koridoru, self-loop, ref/null/kimlik etiketlerinin hepsini kapsar.
export function circularBounds(nodes: PositionedNode[], references: ReferenceSpec[] = []) {
  // Normal Node ve referans sınırları yeniden kullanılır.
  const bounds = sceneBounds(nodes, references);
  // Ayrı kayıtların aynı kimlikleri kamera birleşiminde yer alabilir; her geometri kendi sahnesinde ölçülür.
  for (const node of nodes) {
    // Bütün dönüş köşeleri kamera hesabına katılır.
    for (const point of circularEdgePoints(node, nodes)) {
      // Marker ucu için ek güvenlik payı bırakılır.
      bounds.width = Math.max(bounds.width, point.x + 24);
      // Alt koridorun kırpılmaması sağlanır.
      bounds.height = Math.max(bounds.height, point.y + 24);
    }
  }
  // Kamera boyutu veri modeline yazılmaz.
  return bounds;
}
