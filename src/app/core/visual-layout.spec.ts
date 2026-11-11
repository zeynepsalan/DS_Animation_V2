// Test tanımları ve beklentiler Vitest ile çalışır; algoritma ve görünüm hataları burada yakalanır.
import { describe, expect, it } from 'vitest';
// Angular’dan bağımsız, gerçek Singly algoritma sınıfını getirir.
import { SinglyLinkedlist } from './singly-linkedlist';
// Node ve okların tek RAF saatinden güncellenmesini sağlayan hareket motorunu getirir.
import { sampleNodes } from './scene-motion';
// Gerçek Singly algoritmasını immutable adım kayıtlarına dönüştüren motoru getirir.
import { TraceEngine } from './trace-engine';
// Ortak veya Singly nesne koordinatı ve referans yerleşimi yardımcılarını getirir.
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

// overlap hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const overlap = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  a.x < b.x + NODE_WIDTH &&
  a.x + NODE_WIDTH > b.x &&
  a.y < b.y + NODE_HEIGHT &&
  a.y + NODE_HEIGHT > b.y;

// Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
describe('Görsel geometri', () => {
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('ekleme/silme sırasında ve geçişin ara konumlarında Node kutuları çakışmaz', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<string>();
    // ['A', 'B', 'C'].forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    ['A', 'B', 'C'].forEach((v) => list.addLast(v));
    // engine hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const engine = new TraceEngine();
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const operation of [
      'addFirst',
      'addLast',
      'insertAt',
      'removeFirst',
      'removeLast',
      'removeAt',
    ] as const) {
      // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const trace = engine.execute(list.snapshot(), operation, { value: 'X', index: 1 });
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (let stepIndex = 1; stepIndex < trace.steps.length; stepIndex++) {
        // Radiuslu dönüşe girmeden önceki teğet noktayı hesaplar.
        const before = layoutNodes(
          trace.steps[stepIndex - 1].snapshot,
          false,
          detachedIndexFor(trace.steps[stepIndex - 1], operation),
          { baseline: trace.baseline, operation, completed: false },
        );
        // Radiuslu dönüşten sonraki teğet noktayı hesaplar.
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
        // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
        for (let k = 0; k <= 100; k++) {
          // t hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const t = k / 100; // Aynı easing, bütün kutular için aynı ilerleme oranını üretir.
          // Gerçek RAF motorunun iki fazlı yer açma/toparlama hareketi örneklenir.
          const positions = sampleNodes(
            before.map((node) => ({ ...node, opacity: 1 })),
            after,
            t,
          ).filter((node) => node.opacity > 0.01);
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (let a = 0; a < positions.length; a++)
            // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
            for (let b = a + 1; b < positions.length; b++)
              // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
              expect(
                overlap(positions[a], positions[b]),
                `${operation} step ${stepIndex} progress ${t}`,
              ).toBe(false);
        }
      }
    }
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('null ve bağlı next okları gerçek Node uçlarını kullanır', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<string>();
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('a');
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('b');
    // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const nodes = layoutNodes(list.snapshot(), false);
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const node of nodes) {
      // Noktaları SVG M/L/Q komutlarına dönüştüren yol metnini biriktirir.
      const path = nextPath(node, nodes);
      // Ok, Node kutularının dışından geçen beş doğrusal parçadan oluşur.
      expect(path.startsWith('M ')).toBe(true);
      // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
      expect(path.includes('L ')).toBe(true);
      // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
      expect(path).toContain(`M ${node.x + NODE_WIDTH} ${node.y + NODE_HEIGHT / 2}`);
    }
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('aynı sıradaki bağlantı düz, ortak Node pointer girişleri farklıdır', () => {
    // Baş ve geçici referansların aynı nesneyi gösterdiği gerçek liste düzeni hazırlanır.
    const list = new SinglyLinkedlist<string>();
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('A');
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('B');
    // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const nodes = layoutNodes(list.snapshot(), false);
    // Gereksiz aşağı/yukarı sapma olmadan tüm next noktaları aynı y değerini kullanır.
    expect(new Set(nextPoints(nodes[0], nodes).map((point) => point.y)).size).toBe(1);
    // refs hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const refs = layoutReferences(nodes, [
      { name: 'head', target: nodes[0].id, opacity: 1 },
      { name: 'current', target: nodes[0].id, opacity: 1 },
    ]);
    // İki referans etiketi karşılıklı durur ve Node'un ayrı üst girişlerine ulaşır.
    expect(refs[0].x + 72).toBeLessThan(refs[1].x);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(refs[0].endX).not.toBe(refs[1].endX);
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('ekleme ve silme trace pozlarında oklar ve etiketler kamera içine sığar', () => {
    // Üç eleman, başa/araya/sona ekleme ve silmede farklı yönlerde bağlantılar üretir.
    const list = new SinglyLinkedlist<string>();
    // ['A', 'B', 'C'].forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    ['A', 'B', 'C'].forEach((value) => list.addLast(value));
    // engine hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const engine = new TraceEngine();
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const operation of [
      'addFirst',
      'addLast',
      'insertAt',
      'removeFirst',
      'removeLast',
      'removeAt',
    ] as const) {
      // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const trace = engine.execute(list.snapshot(), operation, { value: 'X', index: 1 });
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const step of trace.steps) {
        // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const nodes = layoutNodes(step.snapshot, false, detachedIndexFor(step, operation), {
          baseline: trace.baseline,
          operation,
          completed: step === trace.steps.at(-1),
        });
        // refs hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const refs = Object.entries({ head: step.snapshot.head, ...step.references })
          .filter((entry): entry is [string, string] => entry[1] !== null)
          .map(([name, target]) => ({ name, target, opacity: 1 }));
        // bounds hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const bounds = sceneBounds(nodes, refs);
        // Pointer'ın her köşesi, SVG sınırından bir emniyet payı kadar içeride kalmalıdır.
        for (const node of nodes)
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (const point of nextPoints(node, nodes)) {
            // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
            expect(point.x).toBeGreaterThanOrEqual(0);
            // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
            expect(point.y).toBeGreaterThanOrEqual(0);
            // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
            expect(point.x).toBeLessThan(bounds.width - 7);
            // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
            expect(point.y).toBeLessThan(bounds.height - 7);
          }
        // Etiket kutuları da sıfır koordinatının dışında kırpılmamalıdır.
        for (const ref of layoutReferences(nodes, refs)) {
          // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
          expect(ref.x).toBeGreaterThanOrEqual(0);
          // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
          expect(ref.y).toBeGreaterThanOrEqual(0);
          // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
          expect(ref.x + 72).toBeLessThan(bounds.width);
          // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
          expect(ref.y + 24).toBeLessThan(bounds.height);
        }
      }
    }
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('insertAt attach adımında next okları previous etiketini kesmez ve dönüşler radiusludur', () => {
    // Kullanıcı ekranındaki eski iki Node ve üstte yeni Node senaryosu yeniden üretilir.
    const list = new SinglyLinkedlist<string>();
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('A');
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('B');
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = new TraceEngine().execute(list.snapshot(), 'insertAt', { index: 1, value: 'X' });
    // Cursor konumundaki kod satırı, açıklama ve liste fotoğrafı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const step = trace.steps.find((step) => step.key === 'attach')!;
    // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const nodes = layoutNodes(step.snapshot, false, 1, {
      baseline: trace.baseline,
      operation: 'insertAt',
      completed: false,
    });
    // refs hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const refs = Object.entries({ head: step.snapshot.head, ...step.references })
      .filter((entry): entry is [string, string] => entry[1] !== null)
      .map(([name, target]) => ({ name, target, opacity: 1 }));
    // labels hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const labels = layoutReferences(nodes, refs);
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const node of nodes) {
      // points hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const points = nextPoints(node, nodes);
      // Radiuslu eğri, koridor polyline'ının dışına çıkmaz; koridor etiket kutusuna girmemelidir.
      for (let i = 1; i < points.length; i++)
        // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
        for (const label of labels) {
          // a hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const a = points[i - 1],
            b = points[i];
          // crosses hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
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
          // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
          expect(crosses).toBe(false);
        }
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (node.next) expect(nextPath(node, nodes)).toContain(' Q ');
    }
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('aynı Node’a iki next oku merkez çevresinde eşit aralıklı ayrı girişlerden ulaşır', () => {
    // node.next atandıktan sonra previous.next henüz değişmemiştir: iki kaynak aynı hedefi gösterir.
    const list = new SinglyLinkedlist<string>();
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('A');
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('B');
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = new TraceEngine().execute(list.snapshot(), 'insertAt', { index: 1, value: 'X' });
    // Cursor konumundaki kod satırı, açıklama ve liste fotoğrafı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const step = trace.steps.find((step) => step.key === 'link')!;
    // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const nodes = layoutNodes(step.snapshot, false, 1, {
      baseline: trace.baseline,
      operation: 'insertAt',
      completed: false,
    });
    // Bir sonraki karelerin ulaşacağı nesne konumları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const target = nodes.find((node) => node.data === 'B')!;
    // Bu hedefe gelen aynı yönlü kaynakları toplar veya köşenin giriş uzunluğunu ölçer.
    const incoming = nodes.filter((node) => node.next === target.id).sort((a, b) => a.y - b.y);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(incoming).toHaveLength(2);
    // upper hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const upper = nextPoints(incoming[0], nodes).at(-1)!;
    // lower hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const lower = nextPoints(incoming[1], nodes).at(-1)!;
    // Ayrı girişler sol kenarda kalır ve hedef merkezi etrafında simetriktir.
    expect(upper.x).toBe(target.x - 2);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(lower.x).toBe(upper.x);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(upper.y).toBeLessThan(lower.y);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect((upper.y + lower.y) / 2).toBeCloseTo(target.y + NODE_HEIGHT / 2);
  });
});
