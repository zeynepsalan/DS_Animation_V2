import { describe, expect, it } from 'vitest';
import { DNode } from './dnode';
import { Node } from './node';

describe('Bağımsız DNode', () => {
  it('data, prev, next sırasıyla gerçek nesne referanslarını saklar', () => {
    // İki komşu herhangi bir liste oluşturmadan bağımsız oluşturulabilir.
    const previous = new DNode('önceki', null, null);
    const next = new DNode('sonraki', null, null);
    // Farklı komşular constructor parametrelerinin karışmasını yakalar.
    const current = new DNode('ortadaki', previous, next);
    expect(current.prev).toBe(previous);
    expect(current.next).toBe(next);
    // Referans hedefindeki değişiklik aynı nesne üzerinden görülebilir.
    previous.data = 'güncellendi';
    expect(current.prev?.data).toBe('güncellendi');
    // Constructor yalnız verilen referansları saklar; komşuları kendisi değiştirmez.
    expect(previous.next).toBeNull();
    expect(next.prev).toBeNull();
  });

  it('generic veri, null uçlar ve snapshot kimliğini destekler', () => {
    // Tek nesnede iki yönde de bağlantı bulunmayabilir.
    const isolated = new DNode(42, null, null);
    expect(isolated.data).toBe(42);
    expect(isolated.prev).toBeNull();
    expect(isolated.next).toBeNull();
    // Geri yükleme yeni kimlik üretmeden eski görsel öğeyi izlemelidir.
    const restored = new DNode(42, null, null, isolated.id);
    expect(restored.id).toBe(isolated.id);
    // Yeni kimlikler diğer DNode ve Singly Node kimliklerinden ayrıdır.
    expect(new DNode(7, null, null).id).not.toBe(isolated.id);
    expect(new Node(42, null).id).not.toBe(isolated.id);
  });
});
