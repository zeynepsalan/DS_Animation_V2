import { describe, expect, it } from 'vitest';
import { SinglyLinkedlist } from './singly-linkedlist';
import { TraceEngine } from './trace-engine';
import { layoutNodes, nextPath, NODE_WIDTH, NODE_HEIGHT, detachedIndexFor } from './visual-layout';

const overlap = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  a.x < b.x + NODE_WIDTH &&
  a.x + NODE_WIDTH > b.x &&
  a.y < b.y + NODE_HEIGHT &&
  a.y + NODE_HEIGHT > b.y;

describe('Görsel geometri', () => {
  it('ekleme/silme sırasında ve geçişin ara konumlarında Node kutuları çakışmaz', () => {
    const list = new SinglyLinkedlist<string>();
    ['A', 'B', 'C'].forEach((v) => list.addLast(v));
    const engine = new TraceEngine();
    for (const operation of [
      'addFirst',
      'addLast',
      'insertAt',
      'removeFirst',
      'removeLast',
      'removeAt',
    ] as const) {
      const trace = engine.execute(list.snapshot(), operation, { value: 'X', index: 1 });
      for (let stepIndex = 1; stepIndex < trace.steps.length; stepIndex++) {
        const before = layoutNodes(
          trace.steps[stepIndex - 1].snapshot,
          false,
          detachedIndexFor(trace.steps[stepIndex - 1], operation),
        );
        const after = layoutNodes(
          trace.steps[stepIndex].snapshot,
          false,
          detachedIndexFor(trace.steps[stepIndex], operation),
        );
        for (let k = 0; k <= 100; k++) {
          const t = k / 100; // Aynı easing, bütün kutular için aynı ilerleme oranını üretir.
          const positions = after.map((node) => {
            const previous = before.find((n) => n.id === node.id) ?? node;
            return {
              x: previous.x + (node.x - previous.x) * t,
              y: previous.y + (node.y - previous.y) * t,
            };
          });
          for (let a = 0; a < positions.length; a++)
            for (let b = a + 1; b < positions.length; b++)
              expect(
                overlap(positions[a], positions[b]),
                `${operation} step ${stepIndex} progress ${t}`,
              ).toBe(false);
        }
      }
    }
  });
  it('null ve bağlı next okları aynı komut yapısını ve gerçek Node uçlarını kullanır', () => {
    const list = new SinglyLinkedlist<string>();
    list.addLast('a');
    list.addLast('b');
    const nodes = layoutNodes(list.snapshot(), false);
    for (const node of nodes) {
      const path = nextPath(node, nodes);
      // Ok, Node kutularının dışından geçen beş doğrusal parçadan oluşur.
      expect(path.match(/[A-Z]/g)).toEqual(['M', 'L', 'L', 'L', 'L', 'L']);
      expect(path).toContain(`M ${node.x + NODE_WIDTH} ${node.y + NODE_HEIGHT / 2}`);
    }
  });
});
