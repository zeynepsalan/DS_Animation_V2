import type { ListSnapshot, NodeSnapshot, ExecutionStep, Selection } from './execution.types';
// Snapshot verisine çizimde kullanılacak koordinatlar ve bağlantı durumu eklenir.
export interface PositionedNode extends NodeSnapshot<string> {
  x: number;
  y: number;
  detached: boolean;
}
// Aynı işlemde eski listenin hangi konumları koruyacağını belirleyen bağlamdır.
export interface SceneContext {
  baseline: ListSnapshot<string>;
  operation: Selection;
  completed: boolean;
}
// Kutular ve pointer uçları aynı genişlik/yükseklik sabitlerini paylaşır.
export const NODE_WIDTH = 144;
export const NODE_HEIGHT = 64;
// İki Node arasındaki adım, etiketler ve oklar için boşluk bırakır.
export const NODE_PITCH = 210;
// Normal liste üstte; yeni Node oluşurken mevcut liste alt hazırlık satırındadır.
export const NORMAL_Y = 122;
export const STAGING_Y = 290;

// Head’den erişilen gerçek sıra, snapshot dizisinin kayıt sırasından bağımsız bulunur.
function orderOf(snapshot: ListSnapshot<string>): string[] {
  // Kimlik ile Node’a hızlı erişim, next zincirinin izlenmesini kolaylaştırır.
  const nodes = new Map(snapshot.nodes.map((n) => [n.id, n]));
  // Ziyaret edilen kimlikler hem sırayı tutar hem olası döngüyü engeller.
  const order: string[] = [];
  // Zincir listenin head referansından başlar.
  let id = snapshot.head;
  // null’a ya da tekrar ziyaret edilen Node’a ulaşınca ilerleme sonlanır.
  while (id && !order.includes(id)) {
    // Mevcut Node görsel sırasına eklenir.
    order.push(id);
    // Bir sonraki referansa geçilir; eksik hedef de güvenle null kabul edilir.
    id = nodes.get(id)?.next ?? null;
  }
  // Yerleşim hesabı için zincirdeki kimlikler döndürülür.
  return order;
}
/** Eklemede eski liste aşağı alınır; yeni Node üstte, kendi ekleme slotunda oluşur. */
export function layoutNodes(
  snapshot: ListSnapshot<string>,
  standalone: boolean,
  detachedIndex = 0,
  context?: SceneContext,
): PositionedNode[] {
  // Güncel ve işlem öncesi sıra birlikte değerlendirilir.
  const order = orderOf(snapshot),
    baseline = context ? orderOf(context.baseline) : [];
  // Yeni Node oluşmuş ve işlem tamamlanmamışsa üstte hazırlık alanı açılır.
  const inserting =
    context &&
    ['addFirst', 'addLast', 'insertAt'].includes(context.operation) &&
    !context.completed &&
    snapshot.nodes.some((n) => !baseline.includes(n.id));
  // Birden çok serbest Node aynı konuma yığılmaz.
  let detachedSlot = 0;
  // Her Node için veri korunarak yalnız görsel pozisyon hesaplanır.
  return snapshot.nodes.map((n) => {
    // Node’un head’den erişilen sırası bulunur.
    const index = order.indexOf(n.id);
    // Zincirde bulunmayan Node, bağımsız önizleme dışında detached kabul edilir.
    const detached = !standalone && index < 0;
    // Serbest Node hedef index’e; bağlı Node kendi sıra index’ine yerleştirilir.
    let slot = detached ? Math.max(0, detachedIndex) + detachedSlot++ : Math.max(0, index);
    // Serbest Node için alt satır, normal zincir için üst satır seçilir.
    let y = detached ? STAGING_Y : NORMAL_Y;
    // Ekleme hazırlanırken yeni Node üstte, eski liste altta tutulur.
    if (inserting) {
      // İşlem öncesinde var olan Node’un yerini bulur.
      const oldIndex = baseline.indexOf(n.id);
      // Eski Node’lar slotlarını korur; yeni Node ekleme slotuna gelir.
      slot = oldIndex >= 0 ? oldIndex : detachedIndex;
      // Yeni Node ve mevcut liste ayrı yatay satırlarda gösterilir.
      y = oldIndex >= 0 ? STAGING_Y : NORMAL_Y;
    }
    // Pointer etiketlerine solda pay bırakarak piksel koordinatı oluşturulur.
    return { ...n, detached, x: 90 + slot * NODE_PITCH, y };
  });
}

/**
 * Sağ çıkış → güvenli ara şerit → sol giriş. Geometri her karede yeniden hesaplanır;
 * köşe noktaları radiuslu SVG eğrilerine çevrilir. Her karede yeniden çizildiği için ok Node'u kesmez.
 */
export function nextPoints(
  node: PositionedNode,
  nodes: PositionedNode[],
): { x: number; y: number }[] {
  // next oku kaynak Node’un sağ kenarının orta noktasından çıkar.
  const sx = node.x + NODE_WIDTH,
    sy = node.y + NODE_HEIGHT / 2;
  // next kimliği gerçek hedef Node’a çözülür.
  const target = nodes.find((n) => n.id === node.next);
  // Hedef yoksa null etiketine kısa düz bir bağlantı çizilir.
  if (!target)
    return [
      { x: sx, y: sy },
      { x: sx + 12, y: sy },
      { x: sx + 12, y: sy },
      { x: sx + 24, y: sy },
      { x: sx + 24, y: sy },
      { x: sx + 28, y: sy },
    ];
  // Aynı hedefe gelen kaynaklar yukarıdan aşağı sıralanır; her ok kendi girişini alır.
  const incoming = [
    ...new Map(
      nodes.filter((source) => source.next === target.id).map((source) => [source.id, source]),
    ).values(),
  ].sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
  // Sol kenarın yüksekliği eşit aralıklara bölünür; girişler merkez etrafında simetriktir.
  const rank = incoming.findIndex((source) => source.id === node.id);
  const tx = target.x - 2;
  const ty = target.y + (NODE_HEIGHT * (rank + 1)) / (incoming.length + 1);
  // Aynı sıradaki bağlantı yalnız giriş farkı kadar kısa bir koridorda yukarı/aşağı ayrılır.
  if (Math.abs(node.y - target.y) < 0.01 && tx > sx) {
    const middle = (sx + tx) / 2;
    return [
      { x: sx, y: sy },
      { x: middle, y: sy },
      { x: middle, y: ty },
      { x: tx, y: ty },
    ];
  }
  // Yukarıdaki ileri hedefe iki Node arasındaki koridordan çıkılır.
  if (tx > sx && ty < sy) {
    const corridor = (sx + tx) / 2;
    return [
      { x: sx, y: sy },
      { x: corridor, y: sy },
      { x: corridor, y: ty },
      { x: tx, y: ty },
    ];
  }
  // Aşağıdaki hedefe dönen bağlantı sağ ve alt dış şeridi kullanır; yukarı çıkan okla kesişmez.
  if (ty > sy) {
    const right = Math.max(sx, target.x + NODE_WIDTH) + 40;
    // İki satır arasındaki boşluk kullanılır; alt listenin düz next okları kesilmez.
    const bottom =
      node.y + NODE_HEIGHT < target.y
        ? (node.y + NODE_HEIGHT + target.y) / 2
        : Math.max(node.y, target.y) + NODE_HEIGHT + 40;
    const entry = tx - 16;
    return [
      { x: sx, y: sy },
      { x: right, y: sy },
      { x: right, y: bottom },
      { x: entry, y: bottom },
      { x: entry, y: ty },
      { x: tx, y: ty },
    ];
  }
  // Diğer geri yönlü bağlantılar kutuların altından güvenle geçirilir.
  const lane = Math.max(node.y, target.y) + NODE_HEIGHT + 40;
  return [
    { x: sx, y: sy },
    { x: sx + 24, y: sy },
    { x: sx + 24, y: lane },
    { x: tx - 16, y: lane },
    { x: tx - 16, y: ty },
    { x: tx, y: ty },
  ];
}
export function nextPath(node: PositionedNode, nodes: PositionedNode[]): string {
  // Güncel ara Node pozlarından ok köşeleri alınır.
  const points = nextPoints(node, nodes);
  // Tekrarlanan noktalar temizlenir; düz bağlantı gereksiz köşe üretmez.
  const clean = points.filter(
    (point, index) => !index || point.x !== points[index - 1].x || point.y !== points[index - 1].y,
  );
  let path = `M ${clean[0].x} ${clean[0].y}`;
  for (let index = 1; index < clean.length - 1; index++) {
    const previous = clean[index - 1],
      corner = clean[index],
      next = clean[index + 1];
    const incoming = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outgoing = Math.hypot(next.x - corner.x, next.y - corner.y);
    // 24px radius kısa segmentlerde yarı uzunlukla sınırlandırılır; ok ters dönmez.
    const radius = Math.min(24, incoming / 2, outgoing / 2);
    const start = {
      x: corner.x + ((previous.x - corner.x) * radius) / incoming,
      y: corner.y + ((previous.y - corner.y) * radius) / incoming,
    };
    const end = {
      x: corner.x + ((next.x - corner.x) * radius) / outgoing,
      y: corner.y + ((next.y - corner.y) * radius) / outgoing,
    };
    path += ` L ${start.x} ${start.y} Q ${corner.x} ${corner.y} ${end.x} ${end.y}`;
  }
  const end = clean.at(-1)!;
  return path + ` L ${end.x} ${end.y}`;
}
export function detachedIndexFor(step: ExecutionStep<string> | null, operation: Selection): number {
  // Baş işlemleri ilk slotu kullanır.
  if (operation === 'addFirst' || operation === 'removeFirst') return 0;
  // Sona eklenen Node mevcut size sonrasındaki slotta hazırlanır.
  if (operation === 'addLast') return step?.snapshot.size ?? 0;
  // Index parametresi olan işlemler hedef slotu gerçek parametreden alır.
  return Number(step?.variables['index'] ?? 0);
}

// Referans tanımı, animasyon motorundan bağımsız saf geometri fonksiyonlarına aktarılır.
export interface ReferenceSpec {
  name: string;
  target: string;
  opacity: number;
}
export interface PositionedReference extends ReferenceSpec {
  x: number;
  y: number;
  path: string;
  endX: number;
  endY: number;
}

/** Aynı Node'u gösteren referanslar karşılıklı etiketler ve farklı giriş noktaları kullanır. */
export function layoutReferences(
  nodes: PositionedNode[],
  references: ReferenceSpec[],
): PositionedReference[] {
  // Bir referans kaybolurken kalan etiketlerin gereksiz yer değiştirmemesi için isim sırası sabittir.
  const priority = ['head', 'previous', 'current', 'node'];
  const sorted = [...references].sort((a, b) => {
    // Bilinmeyen geçici isimler de mevcut isimlerden sonra deterministik sıralanır.
    const rank = (name: string) =>
      priority.includes(name) ? priority.indexOf(name) : priority.length;
    return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name);
  });
  return sorted.flatMap((ref) => {
    // Hedefi bulunmayan referans için ekranda sahte bir ok oluşturulmaz.
    const node = nodes.find((n) => n.id === ref.target);
    if (!node) return [];
    // Aynı Node'a yönelen etiketlerin kendi grubundaki sıra numarası bulunur.
    const group = sorted.filter((item) => item.target === ref.target);
    const index = group.indexOf(ref);
    // Etiketler solda ve sağda ayrı kolonlara, sonraki çiftler daha üst satıra yerleşir.
    // Üç referans varsa hepsi sol dış kolonda ayrı satırlara alınır; yollar etiketleri kesmez.
    const stacked = group.length > 2;
    const left = stacked || index % 2 === 0;
    // Tek referans kendi Node’unun üstünde kalır; komşu Node etiketlerinin alanına girmez.
    const x = node.x + (group.length === 1 ? 36 : left ? -84 : NODE_WIDTH - 72);
    const y = node.y - 44 - (stacked ? index : Math.floor(index / 2)) * 32;
    // Her pointer Node'un üst kenarında ayrı bir noktaya gelir.
    const endX = node.x + (group.length === 1 ? 48 : 24 + (index * 96) / (group.length - 1));
    const endY = node.y - 5;
    // Etiketin Node'a bakan kenarından başlayan eğri diğer etiketlerin içine girmez.
    const fromBottom = group.length === 1 || !left;
    const startX = fromBottom ? 36 : 72;
    const localX = endX - x;
    const localY = endY - y;
    const bend = startX + (left ? 16 : -16);
    return [
      {
        ...ref,
        x,
        y,
        endX,
        endY,
        path: `M ${startX} ${fromBottom ? 24 : 12} C ${bend} ${fromBottom ? 28 : 12}, ${localX} ${localY - 18}, ${localX} ${localY}`,
      },
    ];
  });
}

/** Kamera yalnız kutuları değil; bağlantı şeritlerini, null ve kimlik etiketlerini de kapsar. */
export function sceneBounds(
  nodes: PositionedNode[],
  references: ReferenceSpec[] = [],
): { width: number; height: number } {
  // Node alanı, kimlik satırı ve null etiketi dahil başlangıç sınırını belirler.
  let right = 320,
    bottom = 190;
  for (const node of nodes) {
    right = Math.max(right, node.x + 230);
    bottom = Math.max(bottom, node.y + 88);
    // Okun bütün köşe noktaları bounds'a dahil edilir; alt şerit kırpılmaz.
    for (const point of nextPoints(node, nodes)) {
      right = Math.max(right, point.x);
      bottom = Math.max(bottom, point.y);
    }
  }
  // Referans etiketinin kutusu ve giriş noktası kamera sınırında kalır.
  for (const ref of layoutReferences(nodes, references)) {
    right = Math.max(right, ref.x + 72, ref.endX);
    bottom = Math.max(bottom, ref.y + 24, ref.endY);
  }
  // Stroke ve arrowhead için her sınırın sonunda emniyet boşluğu bırakılır.
  return { width: right + 24, height: bottom + 24 };
}
