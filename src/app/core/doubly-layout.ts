import type { ListSnapshot, Trace } from './execution.types';
import type { PositionedNode } from './visual-layout';

/** Ekleme boyunca yeni nesne üstte, eski liste altta aynı slotları korur. */
export function doublyPositions(
  snapshot: ListSnapshot<string>,
  trace: Trace<string> | null,
  completed: boolean,
): PositionedNode[] {
  // Snapshot kayıt sırası bağlantı atamalarında değişebilir; gerçek zincir izlenir.
  const order = (state: ListSnapshot<string>) => {
    const ids: string[] = [];
    let id = state.head;
    while (id && !ids.includes(id)) {
      ids.push(id);
      id = state.nodes.find((n) => n.id === id)?.next ?? null;
    }
    return ids;
  };
  const baseline = trace ? order(trace.baseline) : [];
  const current = order(snapshot);
  const preparing =
    trace?.operation === 'doublyAddFirst' &&
    !completed &&
    snapshot.nodes.some((n) => !baseline.includes(n.id));
  // Yeni nesne slot 0’dadır; eski sıra 1’den başlar ve finalde de aynı x’te kalır.
  return snapshot.nodes.map((node) => {
    const oldIndex = baseline.indexOf(node.id);
    const slot = preparing ? oldIndex + 1 : Math.max(0, current.indexOf(node.id));
    return {
      ...node,
      x: 100 + slot * 210,
      y: preparing && oldIndex >= 0 ? 300 : 122,
      detached: !current.includes(node.id),
    };
  });
}

/** Ayrı yükseklikler ve koridorlar ileri/geri okların birleşmesini önler. */
export function doublyEdgePoints(
  node: PositionedNode,
  nodes: PositionedNode[],
  direction: 'prev' | 'next',
) {
  const forward = direction === 'next';
  const target = nodes.find((n) => n.id === node[direction]);
  // İleri ok üst, geri ok alt portu kullanır.
  const source = { x: node.x + (forward ? 144 : 0), y: node.y + (forward ? 24 : 48) };
  if (!target) return [source, { x: source.x + (forward ? 28 : -28), y: source.y }];
  const end = { x: target.x + (forward ? -2 : 146), y: target.y + (forward ? 24 : 48) };
  // Aynı satırda iki karşıt yön iki paralel düz ok olarak görünür.
  if (Math.abs(source.y - end.y) < 1) return [source, end];
  // Hazırlık satırları arasında her yön kendi koridorunu kullanır.
  const corridor = forward ? (source.x + end.x) / 2 - 12 : (source.x + end.x) / 2 + 12;
  return [source, { x: corridor, y: source.y }, { x: corridor, y: end.y }, end];
}

/** Kısa segmentlerde radius güvenli sınırla küçülür; keskin köşe üretilmez. */
export function roundedDoublyPath(points: { x: number; y: number }[]): string {
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1],
      corner = points[i],
      next = points[i + 1];
    const incoming = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outgoing = Math.hypot(next.x - corner.x, next.y - corner.y);
    if (!incoming || !outgoing) continue;
    const radius = Math.min(24, incoming / 2, outgoing / 2);
    const before = {
      x: corner.x + ((previous.x - corner.x) * radius) / incoming,
      y: corner.y + ((previous.y - corner.y) * radius) / incoming,
    };
    const after = {
      x: corner.x + ((next.x - corner.x) * radius) / outgoing,
      y: corner.y + ((next.y - corner.y) * radius) / outgoing,
    };
    path += ` L ${before.x} ${before.y} Q ${corner.x} ${corner.y} ${after.x} ${after.y}`;
  }
  return path + ` L ${points.at(-1)!.x} ${points.at(-1)!.y}`;
}

/** Etiketler Node’un üstünde kalır; bağlantı koridorlarının içine taşmaz. */
export function doublyReferences(
  nodes: PositionedNode[],
  refs: { name: string; target: string; opacity: number }[],
) {
  return refs
    .filter((ref) => !ref.name.includes('.'))
    .flatMap((ref) => {
      const node = nodes.find((node) => node.id === ref.target);
      if (!node) return [];
      // Aynı nesneyi gösteren head/tail/node için üç farklı üst giriş kullanılır.
      const group = refs
        .filter((other) => !other.name.includes('.') && other.target === ref.target)
        .sort(
          (a, b) =>
            ['head', 'tail', 'node'].indexOf(a.name) - ['head', 'tail', 'node'].indexOf(b.name),
        );
      const index = group.findIndex((other) => other.name === ref.name);
      const third = index === 2;
      const offset = group.length === 1 || third ? 40 : index * 80;
      const y = node.y - (third ? 84 : 44);
      return [{ ...ref, x: node.x + offset, y, path: `M 32 24 L 32 ${node.y - y - 4}` }];
    });
}
