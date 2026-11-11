// Test tanımları ve beklentiler Vitest ile çalışır; algoritma ve görünüm hataları burada yakalanır.
import { describe, expect, it } from 'vitest';
// Veri, prev ve next taşıyan bağımsız generic DNode sınıfını getirir.
import { DNode } from './dnode';
// Veri ve next taşıyan bağımsız generic Node sınıfını getirir.
import { Node } from './node';

// Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
describe('Bağımsız DNode', () => {
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('data, prev, next sırasıyla gerçek nesne referanslarını saklar', () => {
    // İki komşu herhangi bir liste oluşturmadan bağımsız oluşturulabilir.
    const previous = new DNode('önceki', null, null);
    // next hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const next = new DNode('sonraki', null, null);
    // Farklı komşular constructor parametrelerinin karışmasını yakalar.
    const current = new DNode('ortadaki', previous, next);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(current.prev).toBe(previous);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(current.next).toBe(next);
    // Referans hedefindeki değişiklik aynı nesne üzerinden görülebilir.
    previous.data = 'güncellendi';
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(current.prev?.data).toBe('güncellendi');
    // Constructor yalnız verilen referansları saklar; komşuları kendisi değiştirmez.
    expect(previous.next).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(next.prev).toBeNull();
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('generic veri, null uçlar ve snapshot kimliğini destekler', () => {
    // Tek nesnede iki yönde de bağlantı bulunmayabilir.
    const isolated = new DNode(42, null, null);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(isolated.data).toBe(42);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(isolated.prev).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(isolated.next).toBeNull();
    // Geri yükleme yeni kimlik üretmeden eski görsel öğeyi izlemelidir.
    const restored = new DNode(42, null, null, isolated.id);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(restored.id).toBe(isolated.id);
    // Yeni kimlikler diğer DNode ve Singly Node kimliklerinden ayrıdır.
    expect(new DNode(7, null, null).id).not.toBe(isolated.id);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(new Node(42, null).id).not.toBe(isolated.id);
  });
});
