// Model ve trace Angular olmadan da doğrulanır.
import { describe, expect, it } from 'vitest';
// Gerçek tail tabanlı algoritma test edilir.
import { CircularLinkedlist, circularTrace } from './circular-linkedlist';
// Ekrandaki satırlarla trace anahtarları karşılaştırılır.
import { circularCode, circularId } from '../education/circular-code';
// Tüm mevcut işlemler Circular için de zorunludur.
import { FUNCTIONS } from '../education/catalog';
// Geometri her adımın gerçek ara koordinatlarıyla örneklenir.
import { circularBounds, circularEdgePoints, circularPositions } from './circular-layout';
// Aynı RAF'ın saf örnekleyicisi geçiş ortalarını test etmeyi sağlar.
import { sampleNodes } from './scene-motion';
// Playback davranışları gerçek ortak serviste doğrulanır.
import { PlaybackService } from './playback.service';
// Bağımsız beklenti modeli aynı algoritmayı kullanmaz.
import type { ListSnapshot, Operation, Parameters } from './execution.types';

// Halka tam size Node içermeli ve son next ilk nesneye dönmelidir.
function assertRing(snapshot: ListSnapshot<string>, expected: string[]) {
  // Kimlik tablosu gerçek next zincirini çözmek içindir.
  const nodes = new Map(snapshot.nodes.map((node) => [node.id, node]));
  // İlk nesne yalnız tail.next üzerinden türetilir.
  const first = snapshot.tail ? nodes.get(snapshot.tail)!.next : null;
  // Ortak çizim protokolündeki head, saklanan bir alan değil bu değerin projeksiyonudur.
  expect(snapshot.head).toBe(first);
  // Boyut ve erişilebilir nesne sayısı aynı olmalıdır.
  expect(snapshot.size).toBe(expected.length);
  // Yerel referanslar final kayda sızmamalıdır.
  expect(nodes.size).toBe(expected.length);
  // Boş halkada tek kalıcı uç null olur.
  if (!expected.length) {
    expect(snapshot.tail).toBeNull();
    return;
  }
  // Her Node aynı turda yalnız bir kez ziyaret edilmelidir.
  const seen = new Set<string>();
  // Traversal null beklemeden tam bir tur ilerler.
  let id = first;
  // Beklenen değerlerin sayısı açık dolaşma sınırıdır.
  for (const value of expected) {
    // Boş veya tekrar ziyaret edilen hedef hatalı halka demektir.
    expect(id).not.toBeNull();
    // Aynı turda aynı Node'a erken dönülmez.
    expect(seen.has(id!)).toBe(false);
    // Gerçek nesne verisi bağımsız array sonucu ile karşılaştırılır.
    expect(nodes.get(id!)?.data).toBe(value);
    // İki yönlü Node yanlışlıkla kullanılmamalıdır.
    expect(nodes.get(id!)?.prev).toBeUndefined();
    // Turdaki kimlikler biriktirilir.
    seen.add(id!);
    // Yalnız ileri referans izlenir.
    id = nodes.get(id!)!.next;
  }
  // Son Node'dan sonra tam olarak başlangıca dönülür.
  expect(id).toBe(first);
  // Saklanan tail gerçekten sıranın son Node'udur.
  expect([...seen].at(-1)).toBe(snapshot.tail);
}

// Bağımsız JavaScript array davranışı öğretim algoritmasının karşılaştırma modelidir.
function oracle(
  source: string[],
  op: Operation,
  params: Parameters,
): { values: string[]; result: unknown } {
  // Başlangıç listesi değiştirilmez.
  const values = [...source];
  // Eksik index geçerli bir konuma dönüştürülmez.
  const i = params.index ?? NaN;
  // Parametre değeri string kalır.
  const value = params.value ?? '';
  // Guard bağımsız olarak aynı dış API sözleşmesini uygular.
  const valid = Number.isSafeInteger(i) && i >= 0 && i < values.length;
  // Varsayılan void sonucudur.
  let result: unknown;
  // Her işlem için beklenen liste ve sonuç ayrı hesaplanır.
  switch (op) {
    case 'isEmpty':
      result = values.length === 0;
      break;
    case 'size':
      result = values.length;
      break;
    case 'clear':
      values.length = 0;
      break;
    case 'addFirst':
      values.unshift(value);
      break;
    case 'addLast':
      values.push(value);
      break;
    case 'insertAt':
      if (Number.isSafeInteger(i) && i >= 0 && i <= values.length) values.splice(i, 0, value);
      break;
    case 'removeAt':
      result = valid ? values.splice(i, 1)[0] : null;
      break;
    case 'removeFirst':
      result = values.shift() ?? null;
      break;
    case 'removeLast':
      result = values.pop() ?? null;
      break;
    case 'get':
      result = valid ? values[i] : null;
      break;
    case 'getFirst':
      result = values[0] ?? null;
      break;
    case 'getLast':
      result = values.at(-1) ?? null;
      break;
    case 'set':
      result = valid ? values[i] : null;
      if (valid) values[i] = value;
      break;
    case 'indexOf':
      result = values.indexOf(value);
      break;
    case 'lastIndexOf':
      result = values.lastIndexOf(value);
      break;
    case 'contains':
      result = values.includes(value);
      break;
    case 'remove': {
      const index = values.indexOf(value);
      result = index >= 0;
      if (index >= 0) values.splice(index, 1);
      break;
    }
    case 'traversal':
      result = [...values];
      break;
  }
  // Beklenen sonuç ve son liste birlikte verilir; modelde Result sarmalayıcısı kullanılmaz.
  return { values, result };
}

// Aynı senaryolar bütün dillerin tek satır eşleşmesini de denetler.
describe('Tail tabanlı Circular Linkedlist', () => {
  // Kullanıcının tail-only kararı gerçek model alanlarıyla doğrulanır.
  it('yalnız tail tutar, aynı Node sınıfıyla self-loop kurar ve snapshot geri yükler', () => {
    // Model generic ve Angular'dan bağımsızdır.
    const list = new CircularLinkedlist<number>();
    // Kalıcı head alanı bulunmamalıdır.
    expect('head' in list).toBe(false);
    // Tek nesne kendisine dönmelidir.
    list.addFirst(10);
    // Gerçek referans eşitliği self-loop'u kanıtlar.
    expect(list.tail?.next).toBe(list.tail);
    // İkinci ekleme başlangıcı korurken tail'i taşır.
    list.addLast(20);
    // Kopya eski nesne kimlikleriyle yeni bir halka kurar.
    const copy = CircularLinkedlist.fromSnapshot(list.snapshot());
    // Veri sırası bir turda doğru okunur.
    expect(copy.traversal()).toEqual([10, 20]);
    // Snapshot gerçek nesneleri paylaşmaz.
    expect(copy.tail).not.toBe(list.tail);
    // Kopyanın son next'i tekrar ilk Node'a döner.
    expect(copy.tail?.next?.next).toBe(copy.tail);
  });

  // Tablo testi eksik/kesirli/negatif index ve bulunamayan hedefleri kapsar.
  for (const fn of FUNCTIONS)
    it(`${fn.id}: sonuç, halka ve üç dilde tek satır eşleşmesi`, () => {
      // Boş, tek ve tekrar eden veri içeren halkalar denenir.
      for (const initial of [[], ['A'], ['A', 'B', 'A', 'C']]) {
        // Her işlem kendi bağımsız başlangıç halkasından çalışır.
        const list = new CircularLinkedlist<string>();
        // Test başlangıcı kullanıcı eklemeleri gibi kurulur.
        initial.forEach((value) => list.addLast(value));
        // Bütün guard sınırları ve eksik parametre ayrı ayrı denenir.
        for (const index of [
          -1,
          0,
          1,
          initial.length - 1,
          initial.length,
          initial.length + 1,
          0.5,
          NaN,
        ]) {
          // Bulunan, bulunamayan ve Türkçe metin değerleri test edilir.
          for (const value of ['A', 'yok', 'İğde']) {
            // Dış parametre sözleşmesi aynı fonksiyon katalogundan alınır.
            const params = { ...(fn.index ? { index } : {}), ...(fn.value ? { value } : {}) };
            // Beklenti bağımsız array modelinde hesaplanır.
            const expected = oracle(initial, fn.id, params);
            // Gerçek trace çalışma kopyasında üretilir.
            const trace = circularTrace(list.snapshot(), circularId(fn.id), params);
            // Fonksiyon doğrudan dönüşü doğru olmalıdır.
            expect(trace.returnValue).toEqual(expected.result);
            // Final halka size, tail.next ve nesne sayısı dahil kontrol edilir.
            assertRing(trace.steps.at(-1)!.snapshot, expected.values);
            // Başlangıç halkasına hiçbir ara mutasyon sızmamalıdır.
            assertRing(list.snapshot(), initial);
            // Her semantik anahtar her dilde tam bir kod satırına karşılık gelir.
            for (const language of ['java', 'c', 'pseudo'] as const) {
              // Panelin gerçek satır kaynağı kullanılır.
              const code = circularCode(circularId(fn.id), language);
              // Java'da kullanıcı kararı gereği yorum satırı bulunmaz.
              if (language === 'java')
                expect(code.some((line) => line.text.includes('//'))).toBe(false);
              // İç çağrı prefix'leri yanlış return satırının vurgulanmasını engeller.
              for (const step of trace.steps)
                expect(
                  code.filter((line) => line.key === step.key),
                  `${fn.id}/${language}/${step.key}`,
                ).toHaveLength(1);
            }
          }
        }
      }
    });

  // Sürekli aynı state'ten çalışan farklı işlemler sayaç ve tail hatalarını ortaya çıkarır.
  it('500 karışık işlemden sonra bağımsız array modeliyle aynı halkayı üretir', () => {
    // Bütün işlemler aynı kalıcı liste üzerinden devam eder.
    let baseline: ListSnapshot<string> = { head: null, tail: null, size: 0, nodes: [] };
    // Beklenen değerler ayrı dizide saklanır.
    let values: string[] = [];
    // Tekrarlanabilir sözde rastgele dizi regresyonu yeniden üretilebilir tutar.
    let seed = 719;
    // Her tur bir mutasyon veya sorgu seçer.
    for (let turn = 0; turn < 500; turn++) {
      // Seed dış rastgeleliğe ihtiyaç olmadan ilerletilir.
      seed = (seed * 1664525 + 1013904223) >>> 0;
      // Farklı method'lar dönüşümlü kullanılır.
      const op = FUNCTIONS[seed % FUNCTIONS.length].id;
      // Baş/son/orta ve geçersiz indexler seçilir.
      const params = {
        index: ((seed >>> 8) % (values.length + 3)) - 1,
        value: ['A', 'B', 'A', 'İğde'][seed % 4],
      };
      // Bağımsız beklenen sonuç hazırlanır.
      const expected = oracle(values, op, params);
      // Gerçek model önceki tamamlanmış snapshot'tan çalışır.
      const trace = circularTrace(baseline, circularId(op), params);
      // İşlem sonucu aynı olmalıdır.
      expect(trace.returnValue).toEqual(expected.result);
      // Son state sonraki işlemin başlangıcıdır.
      baseline = trace.steps.at(-1)!.snapshot;
      // Bağımsız array da sonraki adıma taşınır.
      values = expected.values;
      // Halka her işlemden sonra doğrulanır.
      assertRing(baseline, values);
    }
  });

  // Ortak playback'te Reset/Clear ve yapı değişimi birbirine karışmamalıdır.
  it('Reset ve iptal başlangıç halkasını geri getirir; diğer listeler korunur', () => {
    // Angular gerektirmeyen servis modeli doğrudan kullanılabilir.
    const player = new PlaybackService();
    // Bir işlem bütün kayıtları ilerletilerek tamamlanır.
    const complete = () => {
      while (!player.atEnd()) player.next();
    };
    // Singly listesine ayrı bir eleman eklenir.
    player.start('addLast', { value: 'S' });
    complete();
    // Doubly listesine ayrı bir eleman eklenir.
    player.startDoubly('doublyAddFirst', { value: 'D' });
    complete();
    // Circular ilk self-loop'u kurar.
    player.startCircular('circularAddLast', { value: 'A' });
    complete();
    // Tamamlanmış halka başlangıç olarak saklanır.
    const initial = player.circularList();
    // Yeni ekleme tamamlanmadan iptal edilir.
    player.startCircular('circularAddFirst', { value: 'B' });
    player.next();
    player.next();
    // Yapı değişimindeki iptal davranışı çağrılır.
    player.cancelPending();
    // Başlangıç halkası aynen geri gelmelidir.
    expect(player.circularList()).toBe(initial);
    // Clear tamamlanınca boş halka olur.
    player.startCircular('circularClear', {});
    complete();
    // Parametresiz clear gerçekten boşaltır.
    assertRing(player.circularList(), []);
    // Reset clear öncesindeki self-loop'u geri getirir.
    player.reset();
    // Reset boşaltma değil işlem geri almadır.
    assertRing(player.circularList(), ['A']);
    // Singly ve Doubly state'leri bağımsız kalır.
    expect(player.list().nodes[0].data).toBe('S');
    // Doubly de Circular temizliğinden etkilenmez.
    expect(player.doublyList().nodes[0].data).toBe('D');
  });

  // Self-loop ve dönüş koridorları kutu içinden geçmemeli ve kamera dışına çıkmamalıdır.
  it('ileri/geri ara karelerde Node kutuları ve dönüş oku güvenli kalır', () => {
    // Çok elemanlı başlangıç sahnesi hazırlanır.
    const list = new CircularLinkedlist<string>();
    // Uzun dönüş bağlantısı ara Node'ları da kapsar.
    ['A', 'B', 'C'].forEach((value) => list.addLast(value));
    // Başa/sona/araya ekleme ve bütün silme yolları geometriye girer.
    const cases: [Operation, Parameters][] = [
      ['addFirst', { value: 'X' }],
      ['addLast', { value: 'X' }],
      ['insertAt', { index: 1, value: 'X' }],
      ['removeFirst', {}],
      ['removeLast', {}],
      ['removeAt', { index: 1 }],
      ['clear', {}],
    ];
    // Her işlem bağımsız başlangıçtan örneklenir.
    for (const [operation, params] of cases) {
      // Gerçek trace'den bütün hedef sahneler elde edilir.
      const trace = circularTrace(list.snapshot(), circularId(operation), params);
      // Her hedef mevcut algoritmanın kayıtlı snapshot'ıdır.
      const scenes = trace.steps.map((step) =>
        circularPositions(step.snapshot, trace, step === trace.steps.at(-1), step),
      );
      // İleri ve geri her geçiş test edilir.
      for (let i = 1; i < scenes.length; i++)
        for (const [from, to] of [
          [scenes[i - 1], scenes[i]],
          [scenes[i], scenes[i - 1]],
        ]) {
          // Beş örnek hareket başlangıcı, ortası ve sonunu kapsar.
          for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
            // Uygulamanın kullandığı aynı saf RAF örnekleyicisi çalıştırılır.
            const poses = sampleNodes(
              from.map((node) => ({ ...node, opacity: 1 })),
              to,
              progress,
            ).filter((node) => node.opacity > 0.05);
            // Kamera gerçek kare geometrisiyle hesaplanır.
            const bounds = circularBounds(poses);
            // Her kutu çifti ayrı alanlarda kalmalıdır.
            for (const a of poses)
              for (const b of poses)
                if (a.id !== b.id) {
                  // Eksenlerden biri ayrık olduğunda kutular çakışmaz.
                  expect(
                    a.x + 144 <= b.x + 0.01 ||
                      b.x + 144 <= a.x + 0.01 ||
                      a.y + 64 <= b.y + 0.01 ||
                      b.y + 64 <= a.y + 0.01,
                    `${operation}/${i}/${progress}`,
                  ).toBe(true);
                }
            // Her düz ok segmenti hiçbir Node kutusunun içinden geçmemelidir.
            for (const source of poses) {
              // Gerçek karede çizilen köşeler alınır; son SVG yalnız bu dönüşleri yumuşatır.
              const points = circularEdgePoints(source, poses);
              // Her komşu köşe çifti yatay veya dikey bir segmenttir.
              for (let segment = 1; segment < points.length; segment++) {
                // Segment uçları kutu sınırlarıyla karşılaştırılır.
                const a = points[segment - 1],
                  b = points[segment];
                // Kaynak ve hedef kutu dahil iç alanlara girilmez; uçlar dış kenarda kalır.
                for (const box of poses) {
                  // Küçük kenar toleransı stroke temasını kutu kesişmesi saymaz.
                  const inside =
                    Math.abs(a.y - b.y) < 0.01
                      ? a.y > box.y + 2 &&
                        a.y < box.y + 62 &&
                        Math.max(a.x, b.x) > box.x + 2 &&
                        Math.min(a.x, b.x) < box.x + 142
                      : Math.abs(a.x - b.x) < 0.01 &&
                        a.x > box.x + 2 &&
                        a.x < box.x + 142 &&
                        Math.max(a.y, b.y) > box.y + 2 &&
                        Math.min(a.y, b.y) < box.y + 62;
                  // Hata mesajı hangi işlem/kare/bağlantı/kutunun kesiştiğini açıklar.
                  expect(
                    inside,
                    `${operation}/${i}/${progress}: ${source.id}.next -> ${source.next}, box ${box.id}, segment ${segment}`,
                  ).toBe(false);
                }
              }
            }
            // Bütün dış koridor köşeleri kamera sınırındadır.
            for (const node of poses)
              for (const point of circularEdgePoints(node, poses)) {
                // Sol/üst sınırlar negatif koordinat içermez.
                expect(point.x).toBeGreaterThanOrEqual(0);
                // Alt/sağ sınırlar marker payıyla kapsanır.
                expect(point.y).toBeGreaterThanOrEqual(0);
                // Genişlik bütün dönüşü kapsar.
                expect(point.x).toBeLessThan(bounds.width);
                // Yükseklik dış alt koridoru kapsar.
                expect(point.y).toBeLessThan(bounds.height);
              }
          }
        }
    }
  });
});
