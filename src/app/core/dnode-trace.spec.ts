import { describe, expect, it } from 'vitest';
import { dnodeTrace } from './dnode-trace';
import { PlaybackService } from './playback.service';
import { codeFor } from '../education/code-documents';

describe('DNode constructor adımları', () => {
  it('her atamayı ayrı kaydeder ve komşuların bağlantılarını değiştirmez', () => {
    // İki referans seçiliyken gerçek atama sırası ve eski snapshot’lar doğrulanır.
    const trace = dnodeTrace('X', true, true);
    const center = (index: number) =>
      trace.steps[index].snapshot.nodes.find(
        (n) => n.id === trace.steps[index].references['node'],
      )!;
    expect(center(1).data).toBe('');
    expect(center(2).data).toBe('X');
    expect(center(2).prev).toBeNull();
    expect(center(3).prev).not.toBeNull();
    expect(center(3).next).toBeNull();
    expect(center(4).next).not.toBeNull();
    expect(
      trace.steps[5].snapshot.nodes
        .filter((n) => n.id !== center(5).id)
        .every((n) => n.prev === null && n.next === null),
    ).toBe(true);
    // Her atama bütün dillerde bir tek kod satırına karşılık gelir.
    for (const language of ['java', 'c', 'pseudo'] as const) {
      const lines = codeFor('dnode', language);
      for (const key of ['data', 'prev', 'next'])
        expect(lines.filter((line) => line.key === key)).toHaveLength(1);
    }
  });

  it('önizleme, geri adım ve reset mevcut Singly listesini korur', () => {
    // Tamamlanan liste üzerinde constructor gösterimi ayrı bir sahne olmalıdır.
    const player = new PlaybackService();
    player.start('addFirst', { value: 'korunan' });
    while (!player.atEnd()) player.next();
    const list = player.list();
    player.startDNode('X', true, true);
    while (!player.atEnd()) player.next();
    player.previous();
    player.reset();
    player.cancelPending();
    expect(player.list()).toBe(list);
    player.pause();
  });
});
