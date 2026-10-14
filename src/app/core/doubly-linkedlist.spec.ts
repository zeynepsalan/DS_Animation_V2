import { describe, expect, it } from 'vitest';
import { DoublyLinkedlist, doublyTrace } from './doubly-linkedlist';
import { PlaybackService } from './playback.service';
import { doublyCode } from '../education/doubly-code';
import { doublyPositions, doublyEdgePoints, doublyReferences } from './doubly-layout';
import { sampleNodes } from './scene-motion';

describe('Doubly Linkedlist ilk aşama', () => {
  it('boş ve tek nesneli listeden tekrarlı eklemeye kadar iki yönü tutarlı tutar', () => {
    // Başlangıçta iki uç null, sayaç sıfırdır.
    const list = new DoublyLinkedlist<string>();
    expect(list.isEmpty()).toBe(true);
    expect(list.size()).toBe(0);
    for (const value of ['A', 'B', 'B', 'metin']) list.addFirst(value);
    expect(list.size()).toBe(4);
    expect(list.head?.prev).toBeNull();
    expect(list.tail?.next).toBeNull();
    // Her next komşusunun prev’i aynı nesneyi göstermelidir.
    const forward: string[] = [];
    for (let node = list.head; node; node = node.next) {
      forward.push(node.data);
      if (node.next) expect(node.next.prev).toBe(node);
    }
    const backward: string[] = [];
    for (let node = list.tail; node; node = node.prev) backward.push(node.data);
    expect(forward).toEqual(['metin', 'B', 'B', 'A']);
    expect(backward).toEqual([...forward].reverse());
    expect(DoublyLinkedlist.fromSnapshot(list.snapshot()).snapshot()).toEqual(list.snapshot());
  });

  it('head.prev ataması ayrı adımda ve tek kod satırındadır', () => {
    const list = new DoublyLinkedlist<string>();
    list.addFirst('A');
    const trace = doublyTrace(list.snapshot(), 'doublyAddFirst', { value: 'B' });
    const next = trace.steps.find((step) => step.key === 'next')!;
    const prev = trace.steps.find((step) => step.key === 'prev')!;
    expect(next.snapshot.nodes.find((node) => node.id === list.head!.id)?.prev).toBeNull();
    expect(prev.snapshot.nodes.find((node) => node.id === list.head!.id)?.prev).toBe(
      prev.references['node'],
    );
    // Çalışan her adım üç dilde tam bir satıra eşleşmelidir.
    for (const language of ['java', 'c', 'pseudo'] as const) {
      const lines = doublyCode('doublyAddFirst', language);
      for (const step of trace.steps)
        expect(lines.filter((line) => line.key === step.key)).toHaveLength(1);
    }
  });

  it('iki veri yapısını ayırır; Reset ve fonksiyon değişimi Doubly başlangıcını geri getirir', () => {
    const player = new PlaybackService();
    player.start('addFirst', { value: 'S' });
    while (!player.atEnd()) player.next();
    const singly = player.list();
    player.startDoubly('doublyAddFirst', { value: 'D' });
    while (!player.atEnd()) player.next();
    const doubly = player.doublyList();
    player.startDoubly('doublyAddFirst', { value: 'iptal' });
    player.next();
    player.next();
    player.reset();
    expect(player.doublyList()).toBe(doubly);
    player.next();
    player.cancelPending();
    expect(player.doublyList()).toBe(doubly);
    expect(player.list()).toBe(singly);
    player.startDoubly('doublySize', {});
    while (!player.atEnd()) player.next();
    expect(player.trace()?.returnValue).toBe(1);
    player.pause();
  });

  it('ileri/geri okları ayırır; gerçek ara pozlarda kutular ve referans etiketleri çakışmaz', () => {
    const list = new DoublyLinkedlist<string>();
    list.addFirst('A');
    list.addFirst('B');
    const trace = doublyTrace(list.snapshot(), 'doublyAddFirst', { value: 'C' });
    let previous = doublyPositions(trace.baseline, trace, false).map((node) => ({
      ...node,
      opacity: 1,
    }));
    for (const step of [...trace.steps, ...[...trace.steps].reverse()]) {
      const target = doublyPositions(step.snapshot, trace, step === trace.steps.at(-1));
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        const nodes = sampleNodes(previous, target, p).filter((node) => node.opacity > 0.1);
        // Hareket eden kutular aynı y/x alanını paylaşamaz.
        for (const a of nodes)
          for (const b of nodes)
            if (a.id !== b.id)
              expect(Math.abs(a.x - b.x) >= 144 || Math.abs(a.y - b.y) >= 64).toBe(true);
        const refs = doublyReferences(
          nodes,
          Object.entries({ head: step.snapshot.head, tail: step.snapshot.tail, ...step.references })
            .filter((ref): ref is [string, string] => !!ref[1])
            .map(([name, target]) => ({ name, target, opacity: 1 })),
        );
        for (const ref of refs)
          for (const node of nodes)
            expect(
              ref.x + 64 <= node.x ||
                ref.x >= node.x + 144 ||
                ref.y + 24 <= node.y ||
                ref.y >= node.y + 64,
            ).toBe(true);
        // Her yönün portu farklıdır ve hiçbir ok kutunun içinden geçmez.
        for (const node of nodes)
          for (const direction of ['prev', 'next'] as const) {
            const points = doublyEdgePoints(node, nodes, direction);
            for (let i = 1; i < points.length; i++) {
              const a = points[i - 1],
                b = points[i];
              for (const box of nodes) {
                const horizontal = a.y === b.y;
                const intersects = horizontal
                  ? a.y > box.y + 1 &&
                    a.y < box.y + 63 &&
                    Math.max(a.x, b.x) > box.x + 1 &&
                    Math.min(a.x, b.x) < box.x + 143
                  : a.x > box.x + 1 &&
                    a.x < box.x + 143 &&
                    Math.max(a.y, b.y) > box.y + 1 &&
                    Math.min(a.y, b.y) < box.y + 63;
                expect(intersects).toBe(false);
              }
            }
          }
      }
      previous = target.map((node) => ({ ...node, opacity: 1 }));
    }
  });
});
