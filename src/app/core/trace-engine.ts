// Angular’dan bağımsız, gerçek Singly algoritma sınıfını getirir.
import { SinglyLinkedlist } from './singly-linkedlist';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { ExecutionStep, ListSnapshot, Operation, Parameters, Trace } from './execution.types';

/**
 * Gerçek liste üzerinde önce bütün algoritma çalıştırılır; her değişim kaydedilir.
 * Player bu immutable kayıtları sırayla gösterir. Prev/Reset için algoritmayı tersine çalıştırmayız.
 */
export class TraceEngine {
  // execute yardımcı fonksiyonu ilgili hesaplamayı tek yerde tutar; çağıran kod aynı kuralı paylaşır.
  execute(baseline: ListSnapshot<string>, operation: Operation, params: Parameters): Trace<string> {
    // Algoritmanın her anlamlı değişimini sıralı, bağımsız fotoğraflar halinde biriktirir.
    const steps: ExecutionStep<string>[] = [
      {
        key: 'start',
        explanation: 'İşlem başlangıcı. Parametreleri ve mevcut listeyi incele.',
        snapshot: baseline,
        references: {},
        variables: {
          ...(params.value !== undefined ? { value: params.value } : {}),
          ...(params.index !== undefined ? { index: params.index } : {}),
        },
      },
    ];
    // Singly Linkedlist’in kalıcı liste durumu bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const list = SinglyLinkedlist.fromSnapshot(baseline, (step) => {
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      steps.push({ ...step, variables: { ...steps[0].variables, ...step.variables } });
    });
    // Algoritmanın doğrudan sonucunu saklar; sahne fotoğrafından ayrı bir bilgidir.
    let returnValue: unknown;
    // Bu işlemde kullanılacak veya geri döndürülecek data değerini saklar.
    const value = params.value ?? '';
    // Kullanıcının seçtiği, sıfırdan başlayan hedef konum bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const index = params.index ?? NaN;
    // Seçilen fonksiyon adına göre yalnız ilgili algoritma çalıştırılır; aynı isimler iki yapı için ayrı kayıtlanır.
    switch (operation) {
      case 'isEmpty':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.isEmpty();
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'size':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.size();
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'clear':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.clear();
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'addFirst':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.addFirst(value);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'insertAt':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.insertAt(index, value);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'addLast':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.addLast(value);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'removeAt':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.removeAt(index);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'removeFirst':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.removeFirst();
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'removeLast':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.removeLast();
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'get':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.get(index);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'getFirst':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.getFirst();
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'getLast':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.getLast();
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'set':
        // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
        returnValue = list.set(index, value);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'indexOf':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.indexOf(value);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'lastIndexOf':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.lastIndexOf(value);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'contains':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.contains(value);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'remove':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.remove(value);
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
      case 'traversal':
        // Bu atamayla returnValue güncellenir; sonraki satır yeni değeri kullanır.
        returnValue = list.traversal();
        // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
        break;
    }
    // En son işlenen konumu veya kaydı saklar; aradaki normal metin ve final sonuç kaybolmaz.
    const last = steps[steps.length - 1];
    // Bu atamayla last.result güncellenir; sonraki satır yeni değeri kullanır.
    last.result = returnValue === undefined ? 'void' : JSON.stringify(returnValue);
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return {
      operation,
      baseline,
      steps,
      returnValue,
      ...(last.error ? { error: last.explanation } : {}),
    };
  }
}
