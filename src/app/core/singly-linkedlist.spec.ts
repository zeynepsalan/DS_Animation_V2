// Test tanımları ve beklentiler Vitest ile çalışır; algoritma ve görünüm hataları burada yakalanır.
import { describe, expect, it } from 'vitest';
// Veri ve next taşıyan bağımsız generic Node sınıfını getirir.
import { Node } from './node';
// Angular’dan bağımsız, gerçek Singly algoritma sınıfını getirir.
import { SinglyLinkedlist } from './singly-linkedlist';
// Gerçek Singly algoritmasını immutable adım kayıtlarına dönüştüren motoru getirir.
import { TraceEngine } from './trace-engine';
// Fonksiyon imza, parametre, grup ve açıklamalarını ortak katalogdan getirir.
import { FUNCTIONS } from '../education/catalog';
// Kod paneli ve indirilebilir örneklerin aynı satır kaynağını getirir.
import { codeFor } from '../education/code-documents';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { Operation } from './execution.types';

// Ziyaret edilen kimlikleri tekilleştirir; aynı nesnenin tekrar işlenmesini veya döngüyü önler.
const values = <T>(list: SinglyLinkedlist<T>) => {
  // Dolaşma sırasında sırayla toplanan sonuçlar bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const output: T[] = [];
  // Ziyaret edilen kimlikleri tekilleştirir; aynı nesnenin tekrar işlenmesini veya döngüyü önler.
  const seen = new Set<string>();
  // İşlemde oluşturulan veya gösterilen nesne bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  let node = list.head;
  // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
  while (node) {
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(seen.has(node.id)).toBe(false);
    // seen.add çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    seen.add(node.id);
    // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
    output.push(node.data);
    // Bu atamayla node güncellenir; sonraki satır yeni değeri kullanır.
    node = node.next;
  }
  // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
  expect(list.size()).toBe(output.length);
  // Dolaşma sırasında sırayla toplanan sonuçlar çağıran fonksiyona döndürülür.
  return output;
};
// Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
describe('Node ve SinglyLinkedlist', () => {
  it('Java Node ve Singly ekranındaki yorumları kaldırırken kod key’lerini korur', () => {
    // Açıklamalar TS kaynak ve adım kartında kalır; Java ekranı sadeleşir.
    for (const selection of ['node', 'dnode', ...FUNCTIONS.map((info) => info.id)] as const) {
      expect(
        codeFor(selection, 'java').some(
          (line) => line.text.includes('//') || line.text.includes('/*'),
        ),
      ).toBe(false);
    }
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('Node listeye ihtiyaç duymadan generic veri ve referans taşır', () => {
    // second hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const second = new Node(2, null);
    // first hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const first = new Node(1, second);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(first.next).toBe(second);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(second.next).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(new Node('merhaba', null).data).toBe('merhaba');
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('boş listeyi ve geçersiz indexleri güvenle yönetir', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<string>();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.isEmpty()).toBe(true);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.size()).toBe(0);
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const result of [
      list.removeFirst(),
      list.removeLast(),
      list.getFirst(),
      list.getLast(),
      list.set(0, 'x'),
    ])
      // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
      expect(result).toBeNull();
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const index of [NaN, Infinity, -1, 0.5, 2]) expect(list.removeAt(index)).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.indexOf('x')).toBe(-1);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.lastIndexOf('x')).toBe(-1);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.remove('x')).toBe(false);
    // list.insertAt çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.insertAt(-1, 'x');
    // list.insertAt çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.insertAt(1, 'x');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.size()).toBe(0);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.clear()).toBeUndefined();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(values(list)).toEqual([]);
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('baş, orta, son ve tek Node işlemlerini korur', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<string>();
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('b');
    // list.addFirst çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addFirst('a');
    // list.insertAt çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.insertAt(2, 'd');
    // list.insertAt çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.insertAt(2, 'c');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(values(list)).toEqual(['a', 'b', 'c', 'd']);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.getFirst()).toBe('a');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.getLast()).toBe('d');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.set(1, 'B')).toBe('b');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.removeAt(2)).toBe('c');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.removeFirst()).toBe('a');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.removeLast()).toBe('d');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(values(list)).toEqual(['B']);
    // list.removeLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.removeLast();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.head).toBeNull();
    // list.insertAt çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.insertAt(0, 'yeniden');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(values(list)).toEqual(['yeniden']);
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('yinelenen metinleri ilk/son eşleşme sözleşmesiyle işler', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<string>();
    // ['kedi', 'köpek', 'kedi'].forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    ['kedi', 'köpek', 'kedi'].forEach((v) => list.addLast(v));
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.indexOf('kedi')).toBe(0);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.lastIndexOf('kedi')).toBe(2);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.contains('köpek')).toBe(true);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.contains('yok')).toBe(false);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.remove('kedi')).toBe(true);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(values(list)).toEqual(['köpek', 'kedi']);
    // Radiuslu dönüşe girmeden önceki teğet noktayı hesaplar.
    const before = list.snapshot();
    // list.remove çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.remove('yok');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(list.snapshot()).toEqual(before);
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('300 farklı ekleme/silme/güncellemede array referans modeliyle aynı sonucu verir', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<number>();
    // reference hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const reference: number[] = [];
    // Test verisini aynı sırada tekrar üreten rastgelelik başlangıcını saklar.
    let seed = 2026;
    // Sabit seed ile tekrar edilebilir test seçimleri üretir.
    const random = () => {
      // Bu atamayla seed güncellenir; sonraki satır yeni değeri kullanır.
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return seed;
    };
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (let k = 0; k < 300; k++) {
      // choice hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const choice = random() % 6;
      // Bu işlemde kullanılacak veya geri döndürülecek data değerini saklar.
      const value = random() % 9;
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (choice === 0) {
        // list.addFirst çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        list.addFirst(value);
        // reference.unshift çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        reference.unshift(value);
      } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
        choice === 1
      ) {
        // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        list.addLast(value);
        // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
        reference.push(value);
      } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
        choice === 2
      ) {
        // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const i = random() % (reference.length + 1);
        // list.insertAt çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        list.insertAt(i, value);
        // reference.splice çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        reference.splice(i, 0, value);
      } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
        choice === 3 &&
        reference.length
      ) {
        // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const i = random() % reference.length;
        // list.removeAt çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        list.removeAt(i);
        // reference.splice çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        reference.splice(i, 1);
      } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
        choice === 4 &&
        reference.length
      ) {
        // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const i = random() % reference.length;
        // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
        list.set(i, value);
        // Bu atamayla reference[i] güncellenir; sonraki satır yeni değeri kullanır.
        reference[i] = value;
      } else {
        // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const i = reference.indexOf(value);
        // list.remove çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        list.remove(value);
        // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
        if (i >= 0) reference.splice(i, 1);
      }
      // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
      expect(values(list)).toEqual(reference);
    }
  });
});

// Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
describe('Trace ve kod eşleşmesi', () => {
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('her erişilebilir adım Java/C/sözde kodda gerçek bir satıra eşleşir', () => {
    // engine hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const engine = new TraceEngine();
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<string>();
    // ['a', 'b', 'a'].forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    ['a', 'b', 'a'].forEach((v) => list.addLast(v));
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const fn of FUNCTIONS) {
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const baseline of [list.snapshot(), new SinglyLinkedlist<string>().snapshot()]) {
        // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
        for (const index of [0, 1, 3, 99]) {
          // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const trace = engine.execute(baseline, fn.id as Operation, {
            index,
            value: index === 99 ? 'yok' : 'a',
          });
          // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
          expect(trace.steps[0].snapshot).toEqual(baseline);
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (const lang of ['java', 'c', 'pseudo'] as const) {
            // lines hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
            const lines = codeFor(fn.id, lang);
            // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
            for (const step of trace.steps)
              // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
              expect(
                lines.some((line) => line.key === step.key),
                `${fn.id}/${lang}/${step.key}`,
              ).toBe(true);
          }
          // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
          expect(baseline.nodes.map((n) => n.data)).toEqual(baseline.size ? ['a', 'b', 'a'] : []);
        }
      }
    }
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('snapshot kimliklerini ve bağlantılarını kaybetmeden tekrar kurar', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new SinglyLinkedlist<string>();
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('1');
    // list.addLast çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    list.addLast('2');
    // Nesnelerden bağımsız, belirli bir adımı geri yükleyebilen liste fotoğrafı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const snapshot = list.snapshot();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(SinglyLinkedlist.fromSnapshot(snapshot).snapshot()).toEqual(snapshot);
  });
});
