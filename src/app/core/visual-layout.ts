import type { ListSnapshot, NodeSnapshot, ExecutionStep, Selection } from './execution.types';
export interface PositionedNode extends NodeSnapshot<string> { x: number; y: number; detached: boolean }
export interface SceneContext { baseline: ListSnapshot<string>; operation: Selection; completed: boolean }
export const NODE_WIDTH = 144;
export const NODE_HEIGHT = 64;
export const NODE_PITCH = 260;
export const NORMAL_Y = 115;
export const STAGING_Y = 290;

function orderOf(snapshot: ListSnapshot<string>): string[] {
  const nodes = new Map(snapshot.nodes.map(n => [n.id, n])); const order: string[] = [];
  let id = snapshot.head;
  while (id && !order.includes(id)) { order.push(id); id = nodes.get(id)?.next ?? null; }
  return order;
}
/** Eklemede eski liste aşağı alınır; yeni Node üstte, kendi ekleme slotunda oluşur. */
export function layoutNodes(snapshot: ListSnapshot<string>, standalone: boolean, detachedIndex = 0, context?: SceneContext): PositionedNode[] {
  const order = orderOf(snapshot), baseline = context ? orderOf(context.baseline) : [];
  const inserting = context && ['addFirst', 'addLast', 'insertAt'].includes(context.operation) && !context.completed
    && snapshot.nodes.some(n => !baseline.includes(n.id));
  let detachedSlot = 0;
  return snapshot.nodes.map(n => {
    const index = order.indexOf(n.id); const detached = !standalone && index < 0;
    let slot = detached ? Math.max(0, detachedIndex) + detachedSlot++ : Math.max(0, index);
    let y = detached ? STAGING_Y : NORMAL_Y;
    if (inserting) {
      const oldIndex = baseline.indexOf(n.id);
      slot = oldIndex >= 0 ? oldIndex : detachedIndex;
      y = oldIndex >= 0 ? STAGING_Y : NORMAL_Y;
    }
    return { ...n, detached, x: 140 + slot * NODE_PITCH, y };
  });
}

/**
 * Sağ çıkış → güvenli ara şerit → sol giriş. Keskin topology değişimi yerine
 * aynı nokta sayısı korunur. Her karede yeniden çizildiği için ok Node'u kesmez.
 */
export function nextPoints(node: PositionedNode, nodes: PositionedNode[]): { x: number; y: number }[] {
  const sx = node.x + NODE_WIDTH, sy = node.y + NODE_HEIGHT / 2;
  const target = nodes.find(n => n.id === node.next);
  if (!target) return [{ x: sx, y: sy }, { x: sx + 12, y: sy }, { x: sx + 12, y: sy },
    { x: sx + 24, y: sy }, { x: sx + 24, y: sy }, { x: sx + 28, y: sy }];
  const tx = target.x - 2, ty = target.y + NODE_HEIGHT / 2;
  const lane = Math.min(node.y, target.y) + NODE_HEIGHT + 38;
  return [{ x: sx, y: sy }, { x: sx + 18, y: sy }, { x: sx + 18, y: lane },
    { x: tx - 16, y: lane }, { x: tx - 16, y: ty }, { x: tx, y: ty }];
}
export function nextPath(node: PositionedNode, nodes: PositionedNode[]): string {
  const points = nextPoints(node, nodes);
  return points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
}
export function detachedIndexFor(step: ExecutionStep<string> | null, operation: Selection): number {
  if (operation === 'addFirst' || operation === 'removeFirst') return 0;
  if (operation === 'addLast') return step?.snapshot.size ?? 0;
  return Number(step?.variables['index'] ?? 0);
}
