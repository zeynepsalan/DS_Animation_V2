import { describe, expect, it } from 'vitest';
import { Node } from './node';
import { SinglyLinkedlist } from './singly-linkedlist';
import { TraceEngine } from './trace-engine';
import { FUNCTIONS } from '../education/catalog';
import { codeFor } from '../education/code-documents';
import type { Operation } from './execution.types';

const values = <T>(list: SinglyLinkedlist<T>) => {
  const output: T[] = [];
  const seen = new Set<string>();
  let node = list.head;
  while (node) {
    expect(seen.has(node.id)).toBe(false);
    seen.add(node.id);
    output.push(node.data);
    node = node.next;
  }
  expect(list.size()).toBe(output.length);
  return output;
};
describe('Node ve SinglyLinkedlist', () => {
  it('Node listeye ihtiyaç duymadan generic veri ve referans taşır', () => {
    const second = new Node(2, null);
    const first = new Node(1, second);
    expect(first.next).toBe(second);
    expect(second.next).toBeNull();
    expect(new Node('merhaba', null).data).toBe('merhaba');
  });
  it('boş listeyi ve geçersiz indexleri güvenle yönetir', () => {
    const list = new SinglyLinkedlist<string>();
    expect(list.isEmpty()).toBe(true);
    expect(list.size()).toBe(0);
    for (const result of [
      list.removeFirst(),
      list.removeLast(),
      list.getFirst(),
      list.getLast(),
      list.set(0, 'x'),
    ])
      expect(result).toBeNull();
    for (const index of [NaN, Infinity, -1, 0.5, 2]) expect(list.removeAt(index)).toBeNull();
    expect(list.indexOf('x')).toBe(-1);
    expect(list.lastIndexOf('x')).toBe(-1);
    expect(list.remove('x')).toBe(false);
    list.insertAt(-1, 'x');
    list.insertAt(1, 'x');
    expect(list.size()).toBe(0);
    expect(list.clear()).toBeUndefined();
    expect(values(list)).toEqual([]);
  });
  it('baş, orta, son ve tek Node işlemlerini korur', () => {
    const list = new SinglyLinkedlist<string>();
    list.addLast('b');
    list.addFirst('a');
    list.insertAt(2, 'd');
    list.insertAt(2, 'c');
    expect(values(list)).toEqual(['a', 'b', 'c', 'd']);
    expect(list.getFirst()).toBe('a');
    expect(list.getLast()).toBe('d');
    expect(list.set(1, 'B')).toBe('b');
    expect(list.removeAt(2)).toBe('c');
    expect(list.removeFirst()).toBe('a');
    expect(list.removeLast()).toBe('d');
    expect(values(list)).toEqual(['B']);
    list.removeLast();
    expect(list.head).toBeNull();
    list.insertAt(0, 'yeniden');
    expect(values(list)).toEqual(['yeniden']);
  });
  it('yinelenen metinleri ilk/son eşleşme sözleşmesiyle işler', () => {
    const list = new SinglyLinkedlist<string>();
    ['kedi', 'köpek', 'kedi'].forEach((v) => list.addLast(v));
    expect(list.indexOf('kedi')).toBe(0);
    expect(list.lastIndexOf('kedi')).toBe(2);
    expect(list.contains('köpek')).toBe(true);
    expect(list.contains('yok')).toBe(false);
    expect(list.remove('kedi')).toBe(true);
    expect(values(list)).toEqual(['köpek', 'kedi']);
    const before = list.snapshot();
    list.remove('yok');
    expect(list.snapshot()).toEqual(before);
  });
  it('300 farklı ekleme/silme/güncellemede array referans modeliyle aynı sonucu verir', () => {
    const list = new SinglyLinkedlist<number>();
    const reference: number[] = [];
    let seed = 2026;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed;
    };
    for (let k = 0; k < 300; k++) {
      const choice = random() % 6;
      const value = random() % 9;
      if (choice === 0) {
        list.addFirst(value);
        reference.unshift(value);
      } else if (choice === 1) {
        list.addLast(value);
        reference.push(value);
      } else if (choice === 2) {
        const i = random() % (reference.length + 1);
        list.insertAt(i, value);
        reference.splice(i, 0, value);
      } else if (choice === 3 && reference.length) {
        const i = random() % reference.length;
        list.removeAt(i);
        reference.splice(i, 1);
      } else if (choice === 4 && reference.length) {
        const i = random() % reference.length;
        list.set(i, value);
        reference[i] = value;
      } else {
        const i = reference.indexOf(value);
        list.remove(value);
        if (i >= 0) reference.splice(i, 1);
      }
      expect(values(list)).toEqual(reference);
    }
  });
});

describe('Trace ve kod eşleşmesi', () => {
  it('her erişilebilir adım Java/C/sözde kodda gerçek bir satıra eşleşir', () => {
    const engine = new TraceEngine();
    const list = new SinglyLinkedlist<string>();
    ['a', 'b', 'a'].forEach((v) => list.addLast(v));
    for (const fn of FUNCTIONS) {
      for (const baseline of [list.snapshot(), new SinglyLinkedlist<string>().snapshot()]) {
        for (const index of [0, 1, 3, 99]) {
          const trace = engine.execute(baseline, fn.id as Operation, {
            index,
            value: index === 99 ? 'yok' : 'a',
          });
          expect(trace.steps[0].snapshot).toEqual(baseline);
          for (const lang of ['java', 'c', 'pseudo'] as const) {
            const lines = codeFor(fn.id, lang);
            for (const step of trace.steps)
              expect(
                lines.some((line) => line.key === step.key),
                `${fn.id}/${lang}/${step.key}`,
              ).toBe(true);
          }
          expect(baseline.nodes.map((n) => n.data)).toEqual(baseline.size ? ['a', 'b', 'a'] : []);
        }
      }
    }
  });
  it('snapshot kimliklerini ve bağlantılarını kaybetmeden tekrar kurar', () => {
    const list = new SinglyLinkedlist<string>();
    list.addLast('1');
    list.addLast('2');
    const snapshot = list.snapshot();
    expect(SinglyLinkedlist.fromSnapshot(snapshot).snapshot()).toEqual(snapshot);
  });
});
