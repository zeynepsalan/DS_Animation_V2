// Test tanımları ve beklentiler Vitest ile çalışır; algoritma ve görünüm hataları burada yakalanır.
import { describe, expect, it } from 'vitest';
// Angular’dan bağımsız Doubly algoritmaları ve kayıt üretimini getirir.
import { DoublyLinkedlist, doublyTrace } from './doubly-linkedlist';
// Kayıtları oynatan ortak servisi getirir; paneller aynı cursor’u okur.
import { PlaybackService } from './playback.service';
// Doubly seçim kimliği ve satır üretimi yardımcılarını paylaşır.
import { doublyCode } from '../education/doubly-code';
// Doubly’ye özgü güvenli slot, ok portu ve referans etiketi geometrisini getirir.
import { doublyPositions, doublyEdgePoints, doublyReferences } from './doubly-layout';
// Node ve okların tek RAF saatinden güncellenmesini sağlayan hareket motorunu getirir.
import { sampleNodes } from './scene-motion';

// Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
describe('Doubly Linkedlist ilk aşama', () => {
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('boş ve tek nesneli listeden tekrarlı eklemeye kadar iki yönü tutarlı tutar', () => {
    // Başlangıçta iki uç null, sayaç sıfırdır.
    const list = new DoublyLinkedlist<string>();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.isEmpty()).toBe(true);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.size()).toBe(0);
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const value of ['A', 'B', 'B', 'metin']) list.addFirst(value);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.size()).toBe(4);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.head?.prev).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.tail?.next).toBeNull();
    // Her next komşusunun prev’i aynı nesneyi göstermelidir.
    const forward: string[] = [];
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (let node = list.head; node; node = node.next) {
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      forward.push(node.data);
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (node.next) expect(node.next.prev).toBe(node);
    }
    // backward hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const backward: string[] = [];
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (let node = list.tail; node; node = node.prev) backward.push(node.data);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(forward).toEqual(['metin', 'B', 'B', 'A']);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(backward).toEqual([...forward].reverse());
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(DoublyLinkedlist.fromSnapshot(list.snapshot()).snapshot()).toEqual(list.snapshot());
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('head.prev ataması ayrı adımda ve tek kod satırındadır', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new DoublyLinkedlist<string>();
    // list.addFirst çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addFirst('A');
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = doublyTrace(list.snapshot(), 'doublyAddFirst', { value: 'B' });
    // next hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const next = trace.steps.find((step) => step.key === 'next')!;
    // prev hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const prev = trace.steps.find((step) => step.key === 'prev')!;
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(next.snapshot.nodes.find((node) => node.id === list.head!.id)?.prev).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(prev.snapshot.nodes.find((node) => node.id === list.head!.id)?.prev).toBe(
      prev.references['node'],
    );
    // Çalışan her adım üç dilde tam bir satıra eşleşmelidir.
    for (const language of ['java', 'c', 'pseudo'] as const) {
      // lines hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const lines = doublyCode('doublyAddFirst', language);
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const step of trace.steps)
        // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
        expect(lines.filter((line) => line.key === step.key)).toHaveLength(1);
    }
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('iki veri yapısını ayırır; Reset ve fonksiyon değişimi Doubly başlangıcını geri getirir', () => {
    // Bütün panellerin ortak işlem durumunu yöneten oynatma servisi bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const player = new PlaybackService();
    // player.start çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.start('addFirst', { value: 'S' });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!player.atEnd()) player.next();
    // singly hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const singly = player.list();
    // player.startDoubly çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.startDoubly('doublyAddFirst', { value: 'D' });
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!player.atEnd()) player.next();
    // doubly hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const doubly = player.doublyList();
    // player.startDoubly çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.startDoubly('doublyAddFirst', { value: 'iptal' });
    // player.next çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.next();
    // player.next çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.next();
    // player.reset çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.reset();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(player.doublyList()).toBe(doubly);
    // player.next çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.next();
    // player.cancelPending çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.cancelPending();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(player.doublyList()).toBe(doubly);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(player.list()).toBe(singly);
    // player.startDoubly çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    player.startDoubly('doublySize', {});
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!player.atEnd()) player.next();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(player.trace()?.returnValue).toBe(1);
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    player.pause();
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('ileri/geri okları ayırır; gerçek ara pozlarda kutular ve referans etiketleri çakışmaz', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new DoublyLinkedlist<string>();
    // list.addFirst çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addFirst('A');
    // list.addFirst çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addFirst('B');
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = doublyTrace(list.snapshot(), 'doublyAddFirst', { value: 'C' });
    // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let previous = doublyPositions(trace.baseline, trace, false).map((node) => ({
      ...node,
      opacity: 1,
    }));
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const step of [...trace.steps, ...[...trace.steps].reverse()]) {
      // Bir sonraki karelerin ulaşacağı nesne konumları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const target = doublyPositions(step.snapshot, trace, step === trace.steps.at(-1));
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const nodes = sampleNodes(previous, target, p).filter((node) => node.opacity > 0.1);
        // Hareket eden kutular aynı y/x alanını paylaşamaz.
        for (const a of nodes)
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (const b of nodes)
            // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
            if (a.id !== b.id)
              // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
              expect(Math.abs(a.x - b.x) >= 144 || Math.abs(a.y - b.y) >= 64).toBe(true);
        // refs hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const refs = doublyReferences(
          nodes,
          Object.entries({ head: step.snapshot.head, tail: step.snapshot.tail, ...step.references })
            .filter((ref): ref is [string, string] => !!ref[1])
            .map(([name, target]) => ({ name, target, opacity: 1 })),
        );
        // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
        for (const ref of refs)
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (const node of nodes)
            // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
            expect(
              ref.x + 64 <= node.x ||
                ref.x >= node.x + 144 ||
                ref.y + 24 <= node.y ||
                ref.y >= node.y + 64,
            ).toBe(true);
        // Her yönün portu farklıdır ve hiçbir ok kutunun içinden geçmez.
        for (const node of nodes)
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (const direction of ['prev', 'next'] as const) {
            // points hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
            const points = doublyEdgePoints(node, nodes, direction);
            // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
            for (let i = 1; i < points.length; i++) {
              // a hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
              const a = points[i - 1],
                b = points[i];
              // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
              for (const box of nodes) {
                // horizontal hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
                const horizontal = a.y === b.y;
                // intersects hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
                const intersects = horizontal
                  ? a.y > box.y + 1 &&
                    a.y < box.y + 63 &&
                    Math.max(a.x, b.x) > box.x + 1 &&
                    Math.min(a.x, b.x) < box.x + 143
                  : a.x > box.x + 1 &&
                    a.x < box.x + 143 &&
                    Math.max(a.y, b.y) > box.y + 1 &&
                    Math.min(a.y, b.y) < box.y + 63;
                // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
                expect(intersects).toBe(false);
              }
            }
          }
      }
      // Bu atamayla previous güncellenir; sonraki satır yeni değeri kullanır.
      previous = target.map((node) => ({ ...node, opacity: 1 }));
    }
  });
});
