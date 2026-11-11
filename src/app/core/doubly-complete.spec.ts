// Test tanımları ve beklentiler Vitest ile çalışır; algoritma ve görünüm hataları burada yakalanır.
import { describe, expect, it } from 'vitest';
// Angular’dan bağımsız Doubly algoritmaları ve kayıt üretimini getirir.
import { DoublyLinkedlist, doublyTrace } from './doubly-linkedlist';
// Fonksiyon imza, parametre, grup ve açıklamalarını ortak katalogdan getirir.
import { FUNCTIONS } from '../education/catalog';
// Doubly seçim kimliği ve satır üretimi yardımcılarını paylaşır.
import { doublyCode, doublyId } from '../education/doubly-code';
// Doubly’ye özgü güvenli slot, ok portu ve referans etiketi geometrisini getirir.
import { doublyPositions, doublyEdgePoints, doublyReferences } from './doubly-layout';
// Node ve okların tek RAF saatinden güncellenmesini sağlayan hareket motorunu getirir.
import { sampleNodes, sampleReferences } from './scene-motion';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { ListSnapshot, Operation, Parameters } from './execution.types';

// Final durumda her iki uç ve komşuluk array referans modeline eşit olmalıdır.
function assertList(snapshot: ListSnapshot<string>, expected: string[]) {
  // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon kimliğe göre Map içinde tutulur; referans hedefi hızlı ve kararlı bulunur.
  const nodes = new Map(snapshot.nodes.map((node) => [node.id, node]));
  // Dolaşma sırasında sırayla toplanan sonuçlar bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const output: string[] = [];
  // Ziyaret edilen kimlikleri tekilleştirir; aynı nesnenin tekrar işlenmesini veya döngüyü önler.
  const visited = new Set<string>();
  // Adımlar arasında aynı nesneyi izleten görsel kimlik bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  let id = snapshot.head;
  // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  let previous: string | null = null;
  // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
  while (id) {
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(visited.has(id)).toBe(false);
    // visited.add çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    visited.add(id);
    // İşlemde oluşturulan veya gösterilen nesne bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const node = nodes.get(id)!;
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(node.prev).toBe(previous);
    // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
    output.push(node.data);
    // Bu atamayla previous güncellenir; sonraki satır yeni değeri kullanır.
    previous = id;
    // Bu atamayla id güncellenir; sonraki satır yeni değeri kullanır.
    id = node.next;
  }
  // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
  expect(previous).toBe(snapshot.tail);
  // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
  expect(output).toEqual(expected);
  // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
  expect(snapshot.nodes.length).toBe(expected.length);
  // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
  expect(snapshot.size).toBe(expected.length);
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (snapshot.head) expect(nodes.get(snapshot.head)?.prev).toBeNull();
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (snapshot.tail) expect(nodes.get(snapshot.tail)?.next).toBeNull();
}
// Bağımsız array modeliyle beklenen sonuç ve final listeyi hesaplar; gerçek liste sınıfını kullanmaz.
function oracle(source: string[], operation: Operation, params: Parameters) {
  // values hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const values = [...source];
  // Kullanıcının seçtiği, sıfırdan başlayan hedef konum bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const index = params.index ?? NaN;
  // Bu işlemde kullanılacak veya geri döndürülecek data değerini saklar.
  const value = params.value ?? '';
  // valid hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const valid = Number.isSafeInteger(index) && index >= 0 && index < values.length;
  // result hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  let result: unknown;
  // Seçilen fonksiyon adına göre yalnız ilgili algoritma çalıştırılır; aynı isimler iki yapı için ayrı kayıtlanır.
  switch (operation) {
    case 'isEmpty':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.length === 0;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'size':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.length;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'clear':
      // Bu atamayla values.length güncellenir; sonraki satır yeni değeri kullanır.
      values.length = 0;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'addFirst':
      // values.unshift çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      values.unshift(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'addLast':
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      values.push(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'insertAt':
      // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
      if (Number.isSafeInteger(index) && index >= 0 && index <= values.length)
        // values.splice çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
        values.splice(index, 0, value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeAt':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = valid ? values.splice(index, 1)[0] : null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeFirst':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.shift() ?? null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeLast':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.pop() ?? null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'get':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = valid ? values[index] : null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'getFirst':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values[0] ?? null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'getLast':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.at(-1) ?? null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'set':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = valid ? values[index] : null;
      // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
      if (valid) values[index] = value;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'indexOf':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.indexOf(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'lastIndexOf':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.lastIndexOf(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'contains':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.includes(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'remove': {
      // Aramada bulunan index veya mantıksal sonuç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const found = values.indexOf(value);
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = found >= 0;
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (found >= 0) values.splice(found, 1);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    }
    case 'traversal':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = [...values];
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
  }
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return { values, result };
}
// Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
describe('Doubly bütün fonksiyonlar', () => {
  // Boş/tek/tekrar eden veri ve bütün index sınırları ayrı method bazında sınanır.
  it.each(FUNCTIONS)('$id: array referans modeliyle aynı sonuç ve güvenli sınırlar', (info) => {
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const values of [[], ['A'], ['A', 'B', 'A', 'C']]) {
      // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const list = new DoublyLinkedlist<string>();
      // values.forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      values.forEach((value) => list.addLast(value));
      // Reset veya iptal için korunan işlem başlangıç listesi bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const baseline = list.snapshot();
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const value of ['A', 'yok'])
        // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
        for (const index of [
          -1,
          0,
          1,
          values.length - 1,
          values.length,
          values.length + 1,
          1.5,
          NaN,
          Infinity,
        ]) {
          // Bu test veya işlemde verilen index/value parametrelerini bir araya getirir.
          const params = { value, index };
          // Testin bağımsız referans modelinden beklediği sonucu saklar.
          const expected = oracle(values, info.id, params);
          // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const trace = doublyTrace(baseline, doublyId(info.id), params);
          // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
          expect(trace.returnValue).toEqual(expected.result);
          // assertList çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
          assertList(trace.steps.at(-1)!.snapshot, expected.values);
          // Her gerçek semantik adım üç dilde tam bir satıra karşılık gelmelidir.
          for (const language of ['java', 'c', 'pseudo'] as const) {
            // lines hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
            const lines = doublyCode(doublyId(info.id), language);
            // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
            for (const step of trace.steps)
              // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
              expect(lines.filter((line) => line.key === step.key)).toHaveLength(1);
          }
        }
    }
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('karışık uzun işlem dizisinde uçlar ve iki yönlü zincir tutarlı kalır', () => {
    // Sabit seed testin tekrar edilebilir olmasını sağlar.
    let seed = 7;
    // Sabit seed ile tekrar edilebilir test seçimleri üretir.
    const random = () => {
      // Bu atamayla seed güncellenir; sonraki satır yeni değeri kullanır.
      seed = (seed * 1664525 + 1013904223) >>> 0;
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return seed / 4294967296;
    };
    // values hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let values: string[] = [];
    // state hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    let state: ListSnapshot<string> = { head: null, tail: null, size: 0, nodes: [] };
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (let i = 0; i < 180; i++) {
      // operation hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const operation = FUNCTIONS[Math.floor(random() * FUNCTIONS.length)].id;
      // Bu test veya işlemde verilen index/value parametrelerini bir araya getirir.
      const params = {
        value: String(Math.floor(random() * 3)),
        index: Math.floor(random() * (values.length + 3)) - 1,
      };
      // Testin bağımsız referans modelinden beklediği sonucu saklar.
      const expected = oracle(values, operation, params);
      // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const trace = doublyTrace(state, doublyId(operation), params);
      // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
      expect(trace.returnValue).toEqual(expected.result);
      // Bu atamayla state güncellenir; sonraki satır yeni değeri kullanır.
      state = trace.steps.at(-1)!.snapshot;
      // Bu atamayla values güncellenir; sonraki satır yeni değeri kullanır.
      values = expected.values;
      // assertList çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      assertList(state, values);
    }
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('lastIndexOf gerçek prev adımlarıyla tail’den geriye arar', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new DoublyLinkedlist<string>();
    // ['A', 'B', 'C'].forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    ['A', 'B', 'C'].forEach((value) => list.addLast(value));
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = doublyTrace(list.snapshot(), 'doublyLastIndexOf', { value: 'A' });
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(trace.returnValue).toBe(0);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(trace.steps.filter((step) => step.key === 'searchAdvance').length).toBe(2);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(
      trace.steps
        .filter((step) => step.key === 'searchIncrement')
        .map((step) => step.variables['i']),
    ).toEqual([1, 0]);
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('aynı hedefe gelen geçici next/prev oklarını farklı portlara ayırır', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new DoublyLinkedlist<string>();
    // ['A', 'B', 'C'].forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    ['A', 'B', 'C'].forEach((value) => list.addLast(value));
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = doublyTrace(list.snapshot(), 'doublyInsertAt', { index: 1, value: 'X' });
    // Cursor konumundaki kod satırı, açıklama ve liste fotoğrafı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const step = trace.steps.find((step) => step.key === 'nodeNext')!;
    // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const nodes = doublyPositions(step.snapshot, trace, false, step);
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const direction of ['next', 'prev'] as const) {
      // Ziyaret edilen kimlikleri tekilleştirir; aynı nesnenin tekrar işlenmesini veya döngüyü önler.
      const targets = new Set(nodes.map((node) => node[direction]).filter(Boolean));
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const target of targets) {
        // sources hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const sources = nodes.filter((node) => node[direction] === target);
        // endpoints hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const endpoints = sources.map((node) => doublyEdgePoints(node, nodes, direction).at(-1)!.y);
        // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
        expect(new Set(endpoints).size).toBe(sources.length);
      }
    }
  });

  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('Java ekranı yorum içermez; C/Pseudocode açıklamaları ve semantik key’ler korunur', () => {
    // Kullanıcının son seçimi yalnız Java gösterimini sadeleştirir.
    for (const info of FUNCTIONS) {
      const java = doublyCode(doublyId(info.id), 'java');
      expect(java.some((line) => line.text.includes('//') || line.text.includes('/*'))).toBe(false);
      expect(doublyCode(doublyId(info.id), 'c').some((line) => line.text.includes('//'))).toBe(
        true,
      );
    }
  });

  it('aynı hedefte port değişen etiket ve null bağlantı ortak saatle sönüp belirir', () => {
    // Target aynı olsa bile yerleşim değişimi görünür sıçrama üretmemelidir.
    const from = { head: 'n1', 'n1.next': '__null__' };
    const to = { head: 'n1', 'n1.next': 'n2' };
    expect(
      sampleReferences(from, to, 0.25, new Set(['head'])).find((ref) => ref.name === 'head')!
        .opacity,
    ).toBeLessThan(1);
    expect(
      sampleReferences(from, to, 0.25, new Set(['head'])).find((ref) => ref.name === 'n1.next')!
        .target,
    ).toBe('__null__');
    expect(
      sampleReferences(from, to, 0.5, new Set(['head'])).find((ref) => ref.name === 'n1.next')!
        .target,
    ).toBe('n2');
    expect(sampleReferences(from, to, 1, new Set(['head'])).every((ref) => ref.opacity === 1)).toBe(
      true,
    );
  });

  it('ekleme/silme/clear ara pozlarında kutu, ok ve referans etiketlerini çakıştırmaz', () => {
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = new DoublyLinkedlist<string>();
    // ['A', 'B', 'C', 'D'].forEach çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    ['A', 'B', 'C', 'D'].forEach((value) => list.addLast(value));
    // Her sınır ve orta slot, forward ve Previous Step yönünde örneklenir.
    const scenarios: [Operation, Parameters][] = [
      ['addLast', { value: 'X' }],
      ['insertAt', { index: 0, value: 'X' }],
      ['insertAt', { index: 2, value: 'X' }],
      ['insertAt', { index: 4, value: 'X' }],
      ['removeFirst', {}],
      ['removeLast', {}],
      ['removeAt', { index: 2 }],
      ['remove', { value: 'C' }],
      ['clear', {}],
      ['set', { index: 2, value: 'X' }],
    ];
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const [operation, params] of scenarios) {
      // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const trace = doublyTrace(list.snapshot(), doublyId(operation), params);
      // Bağlantı değişmeden önce saklanan önceki komşu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      let previous = doublyPositions(trace.baseline, trace, false, trace.steps[0]).map((node) => ({
        ...node,
        opacity: 1,
      }));
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const step of [...trace.steps, ...[...trace.steps].reverse()]) {
        // Bir sonraki karelerin ulaşacağı nesne konumları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
        const target = doublyPositions(step.snapshot, trace, step === trace.steps.at(-1), step);
        // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
        for (const p of [0, 0.25, 0.5, 0.75, 1]) {
          // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const nodes = sampleNodes(previous, target, p).filter((node) => node.opacity > 0.1);
          // refs hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const refs = doublyReferences(
            nodes,
            Object.entries({
              head: step.snapshot.head,
              tail: step.snapshot.tail,
              ...step.references,
            })
              .filter((ref): ref is [string, string] => !!ref[1])
              .map(([name, target]) => ({ name, target, opacity: 1 })),
          );
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (const a of nodes)
            // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
            for (const b of nodes)
              // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
              if (a.id !== b.id)
                // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
                expect(
                  Math.abs(a.x - b.x) >= 144 || Math.abs(a.y - b.y) >= 64,
                  `${operation}/${step.key}/${p}: kutu`,
                ).toBe(true);
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (const a of refs)
            // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
            for (const b of refs)
              // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
              if (a.name !== b.name)
                // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
                expect(
                  a.x + 72 <= b.x || b.x + 72 <= a.x || a.y + 24 <= b.y || b.y + 24 <= a.y,
                  `${operation}/${step.key}: etiket`,
                ).toBe(true);
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
          for (const ref of refs)
            // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
            for (const node of nodes)
              // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
              expect(
                ref.x + 72 <= node.x ||
                  ref.x >= node.x + 144 ||
                  ref.y + 24 <= node.y ||
                  ref.y >= node.y + 64,
                `${operation}/${step.key}: etiket/kutu`,
              ).toBe(true);
          // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
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
                // intersects hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
                const intersects = (box: {
                  // x hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
                  x: number;
                  // y hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
                  y: number;
                  // Kamera veya panel için hesaplanan yatay ölçü; bu alan kayıt sözleşmesinin parçasıdır.
                  width: number;
                  // Kamera veya panel için hesaplanan dikey ölçü; bu alan kayıt sözleşmesinin parçasıdır.
                  height: number;
                }) =>
                  a.y === b.y
                    ? a.y > box.y + 1 &&
                      a.y < box.y + box.height - 1 &&
                      Math.max(a.x, b.x) > box.x + 1 &&
                      Math.min(a.x, b.x) < box.x + box.width - 1
                    : a.x > box.x + 1 &&
                      a.x < box.x + box.width - 1 &&
                      Math.max(a.y, b.y) > box.y + 1 &&
                      Math.min(a.y, b.y) < box.y + box.height - 1;
                // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
                for (const box of nodes)
                  // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
                  expect(
                    intersects({ ...box, width: 144, height: 64 }),
                    `${operation}/${step.key}/${p}: ${direction} ok/kutu`,
                  ).toBe(false);
                // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
                for (const ref of refs)
                  // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
                  expect(
                    intersects({ ...ref, width: 72, height: 24 }),
                    `${operation}/${step.key}/${p}: ${direction} ok/etiket`,
                  ).toBe(false);
              }
            }
        }
        // Bu atamayla previous güncellenir; sonraki satır yeni değeri kullanır.
        previous = target.map((node) => ({ ...node, opacity: 1 }));
      }
    }
  });
});
