import type { DoublyOperation, Language, Selection } from '../core/execution.types';
import type { CodeLine } from './code-documents';

// Type guard, UI seçiminden doğru algoritma ailesini güvenle ayırır.
export function isDoubly(selection: Selection): selection is DoublyOperation {
  return (
    selection === 'doublyIsEmpty' || selection === 'doublySize' || selection === 'doublyAddFirst'
  );
}
// Kullanıcıya görünen method isimlerinde iç seçim öneki bulunmaz.
export function doublyName(operation: DoublyOperation) {
  return operation === 'doublyAddFirst'
    ? 'addFirst'
    : operation === 'doublyIsEmpty'
      ? 'isEmpty'
      : 'size';
}
// Her satır tek atama/koşul içerir; üç dil aynı semantik key’i paylaşır.
type Row = [string | undefined, string, string, string];
export function doublyCode(operation: DoublyOperation, language: Language): CodeLine[] {
  const rows: Row[] =
    operation === 'doublyAddFirst'
      ? [
          [
            undefined,
            '// Her bağlantı ayrı adımda kurulur.',
            '// Her bağlantı ayrı adımda kurulur.',
            '// Her bağlantı ayrı adımda kurulur.',
          ],
          [
            'start',
            'public void addFirst(T value) {',
            'void dll_addFirst(DoublyLinkedlist *list, const char *value) {',
            'FUNCTION addFirst(value):',
          ],
          [
            'create',
            '  DNode<T> node = new DNode<>(value, null, null);',
            '  DNode *node = newDNode(value, NULL, NULL);',
            '  node ← NEW DNode(value, null, null)',
          ],
          ['guard', '', '  if (node == NULL) return;', ''],
          [
            undefined,
            '  // İleri bağlantıyı eski head’e kur.',
            '  // İleri bağlantıyı eski head’e kur.',
            '  // İleri bağlantıyı eski head’e kur.',
          ],
          ['next', '  node.next = head;', '  node->next = list->head;', '  node.next ← head'],
          ['branch', '  if (head != null) {', '  if (list->head != NULL) {', '  IF head != null:'],
          [
            undefined,
            '    // Eski head’in geri bağlantısı ayrı güncellenir.',
            '    // Eski head’in geri bağlantısı ayrı güncellenir.',
            '    // Eski head’in geri bağlantısı ayrı güncellenir.',
          ],
          ['prev', '    head.prev = node;', '    list->head->prev = node;', '    head.prev ← node'],
          [undefined, '  } else {', '  } else {', '  ELSE:'],
          ['tail', '    tail = node;', '    list->tail = node;', '    tail ← node'],
          [undefined, '  }', '  }', '  END IF'],
          ['head', '  head = node;', '  list->head = node;', '  head ← node'],
          ['count', '  size++;', '  list->size++;', '  size ← size + 1'],
          ['return', '  return;', '  return;', '  RETURN'],
          [undefined, '}', '}', 'END FUNCTION'],
        ]
      : operation === 'doublyIsEmpty'
        ? [
            [
              'start',
              'public boolean isEmpty() {',
              'bool dll_isEmpty(const DoublyLinkedlist *list) {',
              'FUNCTION isEmpty():',
            ],
            [
              'check',
              '  boolean empty = head == null;',
              '  bool empty = list->head == NULL;',
              '  empty ← head == null',
            ],
            ['return', '  return empty;', '  return empty;', '  RETURN empty'],
            [undefined, '}', '}', 'END FUNCTION'],
          ]
        : [
            [
              'start',
              'public int size() {',
              'int dll_size(const DoublyLinkedlist *list) {',
              'FUNCTION size():',
            ],
            ['check', '  int count = size;', '  int count = list->size;', '  count ← size'],
            ['return', '  return count;', '  return count;', '  RETURN count'],
            [undefined, '}', '}', 'END FUNCTION'],
          ];
  // Dil seçimi satır sırasını veya adım anahtarını değiştirmez.
  const column = language === 'java' ? 1 : language === 'c' ? 2 : 3;
  return rows.map((row) => ({ key: row[0], text: row[column] ?? '' }));
}
