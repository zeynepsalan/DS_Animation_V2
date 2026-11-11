// Doubly seçim kimliği ve satır üretimi yardımcılarını paylaşır.
import { doublyCode, isDoubly } from './doubly-code';
// Circular satırları da tek export/sunum kaynağından gelir.
import { circularCode, isCircular } from './circular-code';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { Language, Operation, Selection } from '../core/execution.types';

// Bu interface nesnenin hangi alanları taşıyacağını derleyiciye söyler; çalışma anında sınıf oluşturmaz.
export interface CodeLine {
  // text hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  text: string;
  // key hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  key?: string;
}
// Bir semantik adımın Java/C/sözde kod karşılıklarını birlikte tutuyoruz.
// Satır numarasını algoritmaya gömmek yerine key kullanmak, yorum eklenince eşleşmeyi korur.
type Row = [string | undefined, string, string, string];
// Satır key’i ve üç dildeki kod karşılığını birlikte tutar; satır numarası değişince adım bozulmaz.
const row = (key: string | undefined, java: string, c: string, pseudo: string): Row => [
  key,
  java,
  c,
  pseudo,
];
// C/Pseudocode ekranı için açıklama satırı üretir; Java görünümü yorumları filtreler.
const note = (text: string) => row(undefined, `  // ${text}`, `  // ${text}`, `  // ${text}`);
// guard hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const guard = row(
  'guard',
  '  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste',
  '  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste',
  '  IF index < 0 OR index >= size: RETURN null',
);
// locate hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const locate: Row[] = [
  note('Hedefe ulaşana kadar next bağlantılarını takip et.'),
  row(
    'init',
    '  Node<T> current = head; Node<T> previous = null; int i = 0;',
    '  Node *current = list->head, *previous = NULL; int i = 0;',
    '  current ← head; previous ← null; i ← 0',
  ),
  row('loop', '  while (i < index) {', '  while (i < index) {', '  WHILE i < index:'),
  row('previous', '    previous = current;', '    previous = current;', '    previous ← current'),
  row(
    'advance',
    '    current = current.next;',
    '    current = current->next;',
    '    current ← current.next',
  ),
  row('increment', '    i++;', '    i++;', '    i ← i + 1'),
  row(undefined, '  }', '  }', '  END WHILE'),
];
// Ekleme sonundaki size artışını tek count adımıyla eşler.
const countUp = row('count', '  size++;', '  list->size++;', '  size ← size + 1');
// Silme sonundaki size azalışını tek count adımıyla eşler.
const countDown = row('count', '  size--;', '  list->size--;', '  size ← size - 1');
// success hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const success = row('return', '  return;', '  return;', '  RETURN');
// Yeni DNode çağrısının üç dildeki satırını create adım anahtarına bağlar.
const create = row(
  'create',
  '  Node<T> node = new Node<>(value, null);',
  '  Node *node = newNode(value, NULL); if (!node) return; // Bellek ayrılamadı',
  '  node ← NEW Node(value, null)',
);
// branch hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const branch = row(
  'branch',
  '  if (previous == null) {',
  '  if (previous == NULL) {',
  '  IF previous == null:',
);
// unlink hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const unlink: Row[] = [
  note('Silinen Node yerine onun next hedefini bağla.'),
  branch,
  row(
    'head',
    '    head = current.next;',
    '    list->head = current->next;',
    '    head ← current.next',
  ),
  row(undefined, '  } else {', '  } else {', '  ELSE:'),
  row(
    'unlink',
    '    previous.next = current.next;',
    '    previous->next = current->next;',
    '    previous.next ← current.next',
  ),
  row(undefined, '  }', '  }', '  END IF'),
  countDown,
];

// Aramanın yön, karşılaştırma, index ve dönüş satırlarını aynı sırada üretir.
function searchRows(operation: 'indexOf' | 'lastIndexOf' | 'contains'): Row[] {
  // En son işlenen konumu veya kaydı saklar; aradaki normal metin ve final sonuç kaybolmaz.
  const last = operation === 'lastIndexOf';
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return [
    row(
      'init',
      '  Node<T> current = head; int i = 0; int found = -1;',
      '  Node *current = list->head; int i = 0, found = -1;',
      '  current ← head; i ← 0; found ← -1',
    ),
    row(
      'loop',
      '  while (current != null) {',
      '  while (current != NULL) {',
      '  WHILE current != null:',
    ),
    row(
      'compare',
      '    if (Objects.equals(current.data, value)) {',
      '    if (strcmp(current->data, value) == 0) {',
      '    IF current.data == value:',
    ),
    row('found', '      found = i;', '      found = i;', '      found ← i'),
    ...(!last ? [row(undefined, '      break;', '      break;', '      BREAK')] : []),
    row(undefined, '    }', '    }', '    END IF'),
    row(
      'advance',
      '    current = current.next;',
      '    current = current->next;',
      '    current ← current.next',
    ),
    row('increment', '    i++;', '    i++;', '    i ← i + 1'),
    row(undefined, '  }', '  }', '  END WHILE'),
    ...(operation === 'contains'
      ? [
          row(
            'check',
            '  boolean exists = found != -1;',
            '  bool exists = found != -1;',
            '  exists ← found != -1',
          ),
        ]
      : []),
    row(
      'return',
      operation === 'contains' ? '  return exists;' : '  return found;',
      operation === 'contains' ? '  return exists;' : '  return found;',
      operation === 'contains' ? '  RETURN exists' : '  RETURN found',
    ),
  ];
}

// Method adına göre o algoritmanın semantik satır dizisini seçer.
function body(operation: Operation): Row[] {
  // Seçilen fonksiyon adına göre yalnız ilgili algoritma çalıştırılır; aynı isimler iki yapı için ayrı kayıtlanır.
  switch (operation) {
    case 'isEmpty':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        row(
          'check',
          '  boolean empty = head == null;',
          '  bool empty = list->head == NULL;',
          '  empty ← head == null',
        ),
        row('return', '  return empty;', '  return empty;', '  RETURN empty'),
      ];
    case 'size':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        row('check', '  int count = size;', '  int count = list->size;', '  count ← size'),
        row('return', '  return count;', '  return count;', '  RETURN count'),
      ];
    case 'clear':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        note('Java erişilemeyen Node’ları GC ile toplar; C belleği açıkça serbest bırakır.'),
        row(
          'head',
          '  head = null;',
          '  freeChain(list->head); list->head = NULL;',
          '  head ← null',
        ),
        row('count', '  size = 0;', '  list->size = 0;', '  size ← 0'),
        row('return', '  return;', '  return;', '  RETURN'),
      ];
    case 'addFirst':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        note('Önce eski head’i next’e bağla; sonra head’i değiştir.'),
        create,
        row('link', '  node.next = head;', '  node->next = list->head;', '  node.next ← head'),
        row('head', '  head = node;', '  list->head = node;', '  head ← node'),
        countUp,
        success,
      ];
    case 'insertAt':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        row(
          'guard',
          '  if (index < 0 || index > size) return; // Geçersiz index',
          '  if (index < 0 || index > list->size) return; // Geçersiz index',
          '  IF index < 0 OR index > size: RETURN',
        ),
        create,
        row('branch', '  if (index == 0) {', '  if (index == 0) {', '  IF index == 0:'),
        row(
          'linkHead',
          '    node.next = head;',
          '    node->next = list->head;',
          '    node.next ← head',
        ),
        row('head', '    head = node;', '    list->head = node;', '    head ← node'),
        row(undefined, '  } else {', '  } else {', '  ELSE:'),
        row(
          'init',
          '    Node<T> previous = head; int i = 0;',
          '    Node *previous = list->head; int i = 0;',
          '    previous ← head; i ← 0',
        ),
        row(
          'loop',
          '    while (i < index - 1) {',
          '    while (i < index - 1) {',
          '    WHILE i < index - 1:',
        ),
        row(
          'advance',
          '      previous = previous.next;',
          '      previous = previous->next;',
          '      previous ← previous.next',
        ),
        row('increment', '      i++;', '      i++;', '      i ← i + 1'),
        row(undefined, '    }', '    }', '    END WHILE'),
        row(
          'link',
          '    node.next = previous.next;',
          '    node->next = previous->next;',
          '    node.next ← previous.next',
        ),
        row(
          'attach',
          '    previous.next = node;',
          '    previous->next = node;',
          '    previous.next ← node',
        ),
        row(undefined, '  }', '  }', '  END IF'),
        countUp,
        success,
      ];
    case 'addLast':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        create,
        row('branch', '  if (head == null) {', '  if (list->head == NULL) {', '  IF head == null:'),
        row('head', '    head = node;', '    list->head = node;', '    head ← node'),
        row(undefined, '  } else {', '  } else {', '  ELSE:'),
        row(
          'init',
          '    Node<T> current = head;',
          '    Node *current = list->head;',
          '    current ← head',
        ),
        row(
          'loop',
          '    while (current.next != null) {',
          '    while (current->next != NULL) {',
          '    WHILE current.next != null:',
        ),
        row(
          'advance',
          '      current = current.next;',
          '      current = current->next;',
          '      current ← current.next',
        ),
        row(undefined, '    }', '    }', '    END WHILE'),
        row(
          'attach',
          '    current.next = node;',
          '    current->next = node;',
          '    current.next ← node',
        ),
        row(undefined, '  }', '  }', '  END IF'),
        countUp,
        success,
      ];
    case 'removeFirst':
    case 'removeLast':
    case 'removeAt':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        ...(operation !== 'removeAt'
          ? [
              row(
                undefined,
                `  int index = ${operation === 'removeFirst' ? '0' : 'size - 1'};`,
                `  int index = ${operation === 'removeFirst' ? '0' : 'list->size - 1'};`,
                `  index ← ${operation === 'removeFirst' ? '0' : 'size - 1'}`,
              ),
            ]
          : []),
        guard,
        ...locate,
        ...unlink,
        row(
          'return',
          '  return current.data;',
          '  const char *removed = current->data; free(current); return removed;',
          '  RETURN current.data',
        ),
      ];
    case 'getFirst':
    case 'getLast':
    case 'get':
    case 'set':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        ...(operation === 'getFirst' || operation === 'getLast'
          ? [
              row(
                undefined,
                `  int index = ${operation === 'getFirst' ? '0' : 'size - 1'};`,
                `  int index = ${operation === 'getFirst' ? '0' : 'list->size - 1'};`,
                `  index ← ${operation === 'getFirst' ? '0' : 'size - 1'}`,
              ),
            ]
          : []),
        guard,
        ...locate
          .filter((r) => r[0] !== 'previous')
          .map((r) =>
            r[0] === 'init'
              ? row(
                  'init',
                  '  Node<T> current = head; int i = 0;',
                  '  Node *current = list->head; int i = 0;',
                  '  current ← head; i ← 0',
                )
              : r,
          ),
        row(
          'read',
          '  T old = current.data;',
          '  const char *old = current->data;',
          '  old ← current.data',
        ),
        ...(operation === 'set'
          ? [
              row(
                'update',
                '  current.data = value;',
                '  current->data = value;',
                '  current.data ← value',
              ),
            ]
          : []),
        row('return', '  return old;', '  return old;', '  RETURN old'),
      ];
    case 'indexOf':
    case 'lastIndexOf':
    case 'contains':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return searchRows(operation);
    case 'remove':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        row(
          'init',
          '  Node<T> current = head; Node<T> previous = null;',
          '  Node *current = list->head, *previous = NULL;',
          '  current ← head; previous ← null',
        ),
        row(
          'loop',
          '  while (current != null) {',
          '  while (current != NULL) {',
          '  WHILE current != null:',
        ),
        row(
          'compare',
          '    if (Objects.equals(current.data, value)) break;',
          '    if (strcmp(current->data, value) == 0) break;',
          '    IF current.data == value: BREAK',
        ),
        row(
          'previous',
          '    previous = current;',
          '    previous = current;',
          '    previous ← current',
        ),
        row(
          'advance',
          '    current = current.next;',
          '    current = current->next;',
          '    current ← current.next',
        ),
        row(undefined, '  }', '  }', '  END WHILE'),
        row(
          'notFound',
          '  if (current == null) return false;',
          '  if (current == NULL) return false;',
          '  IF current == null: RETURN false',
        ),
        ...unlink,
        row('return', '  return true;', '  free(current); return true;', '  RETURN true'),
      ];
    case 'traversal':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        row(
          'init',
          '  Node<T> current = head; List<T> output = new ArrayList<>();',
          '  Node *current = list->head;',
          '  current ← head; output ← []',
        ),
        row(
          'loop',
          '  while (current != null) {',
          '  while (current != NULL) {',
          '  WHILE current != null:',
        ),
        row(
          'read',
          '    output.add(current.data);',
          '    printf("%s\\n", current->data);',
          '    APPEND current.data TO output',
        ),
        row(
          'advance',
          '    current = current.next;',
          '    current = current->next;',
          '    current ← current.next',
        ),
        row(undefined, '  }', '  }', '  END WHILE'),
        row('return', '  return output;', '  return;', '  RETURN output'),
      ];
  }
}

// Seçili method’un parametre ve dönüş tipiyle dil başlığını üretir.
function header(op: Operation): Row {
  // valueOps hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const valueOps: Operation[] = [
    'addFirst',
    'addLast',
    'indexOf',
    'lastIndexOf',
    'contains',
    'remove',
  ];
  // indexOps hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const indexOps: Operation[] = ['removeAt', 'get'];
  // args hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const args =
    op === 'insertAt' || op === 'set'
      ? ['int index, T value', 'int index, const char *value', 'index, value']
      : valueOps.includes(op)
        ? ['T value', 'const char *value', 'value']
        : indexOps.includes(op)
          ? ['int index', 'int index', 'index']
          : ['', '', ''];
  // type hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const type = returnTypeFor(op, 'java');
  // cType hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const cType = returnTypeFor(op, 'c');
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return row(
    'start',
    `public ${type} ${op}(${args[0]}) {`,
    `${cType} ll_${op}(LinkedList *list${args[1] ? ', ' + args[1] : ''}) {`,
    `FUNCTION ${op}(${args[2]})`,
  );
}

/** Fonksiyon imzası ve Run alanı aynı dönüş tipini kullanır. */
export function returnTypeFor(op: Operation, language: Language = 'java'): string {
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (['size', 'indexOf', 'lastIndexOf'].includes(op)) return 'int';
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (['isEmpty', 'contains', 'remove'].includes(op)) return language === 'c' ? 'bool' : 'boolean';
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (op === 'traversal') return language === 'c' ? 'void' : 'List<T>';
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (['clear', 'addFirst', 'insertAt', 'addLast'].includes(op)) return 'void';
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return language === 'c' ? 'const char *' : 'T';
}

// Bağımsız Node sınıfının üç dilde gösterilecek alan ve constructor satırlarını tutar.
const NODE: Row[] = [
  note('Bağımsız Node: liste işlemleri bu sınıfa ait değildir.'),
  row('start', 'public class Node<T> {', 'typedef struct Node {', 'CLASS Node<T>:'),
  row('data', '  T data;', '  const char *data;', '  data: T'),
  row('next', '  Node<T> next;', '  struct Node *next;', '  next: Node<T> OR null'),
  note('next bir Node kopyası değil, aynı nesneye referanstır.'),
  row(
    'constructor',
    '  public Node(T data, Node<T> next) {',
    '} Node;\n\nNode *newNode(const char *data, Node *next) {\n  Node *node = malloc(sizeof *node);\n  if (node == NULL) return NULL;',
    '  CONSTRUCTOR(data, next):',
  ),
  row('assign', '    this.data = data;', '  node->data = data;', '    this.data ← data'),
  note('Constructor next parametresini saklar; null ya da mevcut bir Node verilebilir.'),
  row('null', '    this.next = next;', '  node->next = next;', '    this.next ← next'),
  row(undefined, '  }', '  return node;', '  END CONSTRUCTOR'),
  row(undefined, '}', '}', 'END CLASS'),
];

// Her atama ayrı key ve ayrı satır taşır; constructor parametre sırası data/prev/next’tir.
const DNODE: Row[] = [
  note('Bağımsız DNode: iki bağlantıyı saklar; komşuların alanlarını otomatik değiştirmez.'),
  row(undefined, 'public class DNode<T> {', 'typedef struct DNode {', 'CLASS DNode<T>:'),
  row(undefined, '  T data;', '  const char *data;', '  data: T'),
  row(undefined, '  DNode<T> prev;', '  struct DNode *prev;', '  prev: DNode<T> OR null'),
  row(undefined, '  DNode<T> next;', '  struct DNode *next;', '  next: DNode<T> OR null'),
  row(undefined, '', '} DNode;', ''),
  note('Önce nesne oluşturulur; ardından her alan ayrı adımda atanır.'),
  row(
    'constructor',
    '  public DNode(T data, DNode<T> prev, DNode<T> next) {',
    'DNode *newDNode(const char *data, DNode *prev, DNode *next) {',
    '  CONSTRUCTOR(data, prev, next):',
  ),
  row(undefined, '', '  DNode *node = malloc(sizeof *node);', ''),
  row('guard', '', '  if (node == NULL) return NULL;', ''),
  note('data parametresini nesnenin veri alanına kaydet.'),
  row('data', '    this.data = data;', '  node->data = data;', '    this.data ← data'),
  note('prev önceki nesneye referans veya null olabilir.'),
  row('prev', '    this.prev = prev;', '  node->prev = prev;', '    this.prev ← prev'),
  note('next sonraki nesneye referans veya null olabilir.'),
  row('next', '    this.next = next;', '  node->next = next;', '    this.next ← next'),
  row('return', '  }', '  return node;', '  END CONSTRUCTOR'),
  row(undefined, '}', '}', 'END CLASS'),
];

// Seçili sınıf veya method’un Java/C/Pseudocode satırlarını ve key’lerini döndürür.
export function codeFor(selection: Selection, language: Language): CodeLine[] {
  // Ayrı yapı kendi algoritma satırlarını sağlar.
  if (isDoubly(selection)) return doublyCode(selection, language);
  // Tail tabanlı halkada head kodu gösterilmez.
  if (isCircular(selection)) return circularCode(selection, language);
  // Semantik key ve üç dildeki metin karşılıklarını aynı satır tablosunda birleştirir.
  const rows =
    selection === 'dnode'
      ? [...DNODE]
      : selection === 'node'
        ? [...NODE]
        : [
            note('Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.'),
            header(selection),
            ...body(selection),
            row(undefined, '}', '}', 'END FUNCTION'),
          ];
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if ((selection === 'node' || selection === 'dnode') && language === 'c')
    // rows.unshift çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    rows.unshift(row(undefined, '', '#include <stdlib.h>', ''));
  // Seçilen dilin satır tablosundaki sütununu belirler; algoritma key’i değişmez.
  const column = language === 'java' ? 1 : language === 'c' ? 2 : 3;
  // lines hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const lines = rows.flatMap((r) =>
    (r[column] ?? '').split('\n').map((text, i) => ({ key: i === 0 ? r[0] : undefined, text })),
  );
  // Java öğretim ekranı sade tutulur; açıklamalar adım kartında ve TypeScript kaynakta kalır.
  return language === 'java'
    ? lines
        .map((line) => ({ ...line, text: line.text.replace(/\s*\/\/.*$/, '') }))
        .filter((line) => line.text.trim())
    : lines;
}
