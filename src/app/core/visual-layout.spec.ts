import { describe, expect, it } from 'vitest';
import { SinglyLinkedlist } from './singly-linkedlist';
import { sampleNodes } from './scene-motion';
import { TraceEngine } from './trace-engine';
import {
  layoutNodes,
  nextPath,
  nextPoints,
  layoutReferences,
  sceneBounds,
  NODE_WIDTH,
  NODE_HEIGHT,
  detachedIndexFor,
} from './visual-layout';

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
          { baseline: trace.baseline, operation, completed: false },
        );
        const after = layoutNodes(
          trace.steps[stepIndex].snapshot,
          false,
          detachedIndexFor(trace.steps[stepIndex], operation),
          {
            baseline: trace.baseline,
            operation,
            completed: trace.steps[stepIndex] === trace.steps.at(-1),
          },
        );
        for (let k = 0; k <= 100; k++) {
          const t = k / 100; // Aynı easing, bütün kutular için aynı ilerleme oranını üretir.
          // Gerçek RAF motorunun iki fazlı yer açma/toparlama hareketi örneklenir.
          const positions = sampleNodes(
            before.map((node) => ({ ...node, opacity: 1 })),
            after,
            t,
          ).filter((node) => node.opacity > 0.01);
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
  it('null ve bağlı next okları gerçek Node uçlarını kullanır', () => {
    const list = new SinglyLinkedlist<string>();
    list.addLast('a');
    list.addLast('b');
    const nodes = layoutNodes(list.snapshot(), false);
    for (const node of nodes) {
      const path = nextPath(node, nodes);
      // Ok, Node kutularının dışından geçen beş doğrusal parçadan oluşur.
      expect(path.startsWith('M ')).toBe(true);
      expect(path.includes('L ')).toBe(true);
      expect(path).toContain(`M ${node.x + NODE_WIDTH} ${node.y + NODE_HEIGHT / 2}`);
    }
  });
  it('aynı sıradaki bağlantı düz, ortak Node pointer girişleri farklıdır', () => {
    // Baş ve geçici referansların aynı nesneyi gösterdiği gerçek liste düzeni hazırlanır.
    const list = new SinglyLinkedlist<string>();
    list.addLast('A');
    list.addLast('B');
    const nodes = layoutNodes(list.snapshot(), false);
    // Gereksiz aşağı/yukarı sapma olmadan tüm next noktaları aynı y değerini kullanır.
    expect(new Set(nextPoints(nodes[0], nodes).map((point) => point.y)).size).toBe(1);
    const refs = layoutReferences(nodes, [
      { name: 'head', target: nodes[0].id, opacity: 1 },
      { name: 'current', target: nodes[0].id, opacity: 1 },
    ]);
    // İki referans etiketi karşılıklı durur ve Node'un ayrı üst girişlerine ulaşır.
    expect(refs[0].x + 72).toBeLessThan(refs[1].x);
    expect(refs[0].endX).not.toBe(refs[1].endX);
  });
  it('ekleme ve silme trace pozlarında oklar ve etiketler kamera içine sığar', () => {
    // Üç eleman, başa/araya/sona ekleme ve silmede farklı yönlerde bağlantılar üretir.
    const list = new SinglyLinkedlist<string>();
    ['A', 'B', 'C'].forEach((value) => list.addLast(value));
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
      for (const step of trace.steps) {
        const nodes = layoutNodes(step.snapshot, false, detachedIndexFor(step, operation), {
          baseline: trace.baseline,
          operation,
          completed: step === trace.steps.at(-1),
        });
        const refs = Object.entries({ head: step.snapshot.head, ...step.references })
          .filter((entry): entry is [string, string] => entry[1] !== null)
          .map(([name, target]) => ({ name, target, opacity: 1 }));
        const bounds = sceneBounds(nodes, refs);
        // Pointer'ın her köşesi, SVG sınırından bir emniyet payı kadar içeride kalmalıdır.
        for (const node of nodes)
          for (const point of nextPoints(node, nodes)) {
            expect(point.x).toBeGreaterThanOrEqual(0);
            expect(point.y).toBeGreaterThanOrEqual(0);
            expect(point.x).toBeLessThan(bounds.width - 7);
            expect(point.y).toBeLessThan(bounds.height - 7);
          }
        // Etiket kutuları da sıfır koordinatının dışında kırpılmamalıdır.
        for (const ref of layoutReferences(nodes, refs)) {
          expect(ref.x).toBeGreaterThanOrEqual(0);
          expect(ref.y).toBeGreaterThanOrEqual(0);
          expect(ref.x + 72).toBeLessThan(bounds.width);
          expect(ref.y + 24).toBeLessThan(bounds.height);
        }
      }
    }
  });
  it('insertAt attach adımında next okları previous etiketini kesmez ve dönüşler radiusludur', () => {
    // Kullanıcı ekranındaki eski iki Node ve üstte yeni Node senaryosu yeniden üretilir.
    const list = new SinglyLinkedlist<string>();
    list.addLast('A');
    list.addLast('B');
    const trace = new TraceEngine().execute(list.snapshot(), 'insertAt', { index: 1, value: 'X' });
    const step = trace.steps.find((step) => step.key === 'attach')!;
    const nodes = layoutNodes(step.snapshot, false, 1, {
      baseline: trace.baseline,
      operation: 'insertAt',
      completed: false,
    });
    const refs = Object.entries({ head: step.snapshot.head, ...step.references })
      .filter((entry): entry is [string, string] => entry[1] !== null)
      .map(([name, target]) => ({ name, target, opacity: 1 }));
    const labels = layoutReferences(nodes, refs);
    for (const node of nodes) {
      const points = nextPoints(node, nodes);
      // Radiuslu eğri, koridor polyline'ının dışına çıkmaz; koridor etiket kutusuna girmemelidir.
      for (let i = 1; i < points.length; i++)
        for (const label of labels) {
          const a = points[i - 1],
            b = points[i];
          const crosses =
            a.x === b.x
              ? a.x > label.x &&
                a.x < label.x + 72 &&
                Math.max(a.y, b.y) > label.y &&
                Math.min(a.y, b.y) < label.y + 24
              : a.y > label.y &&
                a.y < label.y + 24 &&
                Math.max(a.x, b.x) > label.x &&
                Math.min(a.x, b.x) < label.x + 72;
          expect(crosses).toBe(false);
        }
      if (node.next) expect(nextPath(node, nodes)).toContain(' Q ');
    }
  });
  it('aynı Node’a iki next oku merkez çevresinde eşit aralıklı ayrı girişlerden ulaşır', () => {
    // node.next atandıktan sonra previous.next henüz değişmemiştir: iki kaynak aynı hedefi gösterir.
    const list = new SinglyLinkedlist<string>();
    list.addLast('A');
    list.addLast('B');
    const trace = new TraceEngine().execute(list.snapshot(), 'insertAt', { index: 1, value: 'X' });
    const step = trace.steps.find((step) => step.key === 'link')!;
    const nodes = layoutNodes(step.snapshot, false, 1, {
      baseline: trace.baseline,
      operation: 'insertAt',
      completed: false,
    });
    const target = nodes.find((node) => node.data === 'B')!;
    const incoming = nodes.filter((node) => node.next === target.id).sort((a, b) => a.y - b.y);
    expect(incoming).toHaveLength(2);
    const upper = nextPoints(incoming[0], nodes).at(-1)!;
    const lower = nextPoints(incoming[1], nodes).at(-1)!;
    // Ayrı girişler sol kenarda kalır ve hedef merkezi etrafında simetriktir.
    expect(upper.x).toBe(target.x - 2);
    expect(lower.x).toBe(upper.x);
    expect(upper.y).toBeLessThan(lower.y);
    expect((upper.y + lower.y) / 2).toBeCloseTo(target.y + NODE_HEIGHT / 2);
  });
});
