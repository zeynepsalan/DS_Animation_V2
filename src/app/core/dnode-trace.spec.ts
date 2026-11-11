// Test tanımları ve beklentiler Vitest ile çalışır; algoritma ve görünüm hataları burada yakalanır.
import { describe, expect, it } from 'vitest';
// DNode constructor atamalarını ayrı immutable adımlar halinde üretir.
import { dnodeTrace } from './dnode-trace';
// Kayıtları oynatan ortak servisi getirir; paneller aynı cursor’u okur.
import { PlaybackService } from './playback.service';
// Kod paneli ve indirilebilir örneklerin aynı satır kaynağını getirir.
import { codeFor } from '../education/code-documents';

// Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
describe('DNode constructor adımları', () => {
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('her atamayı ayrı kaydeder ve komşuların bağlantılarını değiştirmez', () => {
    // İki referans seçiliyken gerçek atama sırası ve eski snapshot’lar doğrulanır.
    const trace = dnodeTrace('X', true, true);
    // center hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const center = (index: number) =>
      trace.steps[index].snapshot.nodes.find(
        (n) => n.id === trace.steps[index].references['node'],
      )!;
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(center(1).data).toBe('');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(center(2).data).toBe('X');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(center(2).prev).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(center(3).prev).not.toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(center(3).next).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(center(4).next).not.toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(
      trace.steps[5].snapshot.nodes
        .filter((n) => n.id !== center(5).id)
        .every((n) => n.prev === null && n.next === null),
    ).toBe(true);
    // Her atama bütün dillerde bir tek kod satırına karşılık gelir.
    for (const language of ['java', 'c', 'pseudo'] as const) {
      // lines hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const lines = codeFor('dnode', language);
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const key of ['data', 'prev', 'next'])
        // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
        expect(lines.filter((line) => line.key === key)).toHaveLength(1);
    }
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('önizleme, geri adım ve reset mevcut Singly listesini korur', () => {
    // Tamamlanan liste üzerinde constructor gösterimi ayrı bir sahne olmalıdır.
    const player = new PlaybackService();
    // player.start çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.start('addFirst', { value: 'korunan' });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!player.atEnd()) player.next();
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = player.list();
    // player.startDNode çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.startDNode('X', true, true);
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!player.atEnd()) player.next();
    // player.previous çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.previous();
    // player.reset çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.reset();
    // player.cancelPending çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.cancelPending();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(player.list()).toBe(list);
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    player.pause();
  });
});
