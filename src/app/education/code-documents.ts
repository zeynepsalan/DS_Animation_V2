import type { Language, Operation, Selection } from '../core/execution.types';

export interface CodeLine {
  text: string;
  key?: string;
}
// Bir semantik adımın Java/C/sözde kod karşılıklarını birlikte tutuyoruz.
// Satır numarasını algoritmaya gömmek yerine key kullanmak, yorum eklenince eşleşmeyi korur.
type Row = [string | undefined, string, string, string];
const row = (key: string | undefined, java: string, c: string, pseudo: string): Row => [
  key,
  java,
  c,
  pseudo,
];
const note = (text: string) => row(undefined, `  // ${text}`, `  // ${text}`, `  // ${text}`);
const guard = row(
  'guard',
  '  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste',
  '  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste',
  '  IF index < 0 OR index >= size: RETURN null',
);
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
const countUp = row('count', '  size++;', '  list->size++;', '  size ← size + 1');
const countDown = row('count', '  size--;', '  list->size--;', '  size ← size - 1');
const success = row('return', '  return;', '  return;', '  RETURN');
const create = row(
  'create',
  '  Node<T> node = new Node<>(value, null);',
  '  Node *node = newNode(value, NULL); if (!node) return; // Bellek ayrılamadı',
  '  node ← NEW Node(value, null)',
);
const branch = row(
  'branch',
  '  if (previous == null) {',
  '  if (previous == NULL) {',
  '  IF previous == null:',
);
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

function searchRows(operation: 'indexOf' | 'lastIndexOf' | 'contains'): Row[] {
  const last = operation === 'lastIndexOf';
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

function body(operation: Operation): Row[] {
  switch (operation) {
    case 'isEmpty':
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
      return [
        row('check', '  int count = size;', '  int count = list->size;', '  count ← size'),
        row('return', '  return count;', '  return count;', '  RETURN count'),
      ];
    case 'clear':
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
      return [
        note('Önce eski head’i next’e bağla; sonra head’i değiştir.'),
        create,
        row('link', '  node.next = head;', '  node->next = list->head;', '  node.next ← head'),
        row('head', '  head = node;', '  list->head = node;', '  head ← node'),
        countUp,
        success,
      ];
    case 'insertAt':
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
      return searchRows(operation);
    case 'remove':
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

function header(op: Operation): Row {
  const valueOps: Operation[] = [
    'addFirst',
    'addLast',
    'indexOf',
    'lastIndexOf',
    'contains',
    'remove',
  ];
  const indexOps: Operation[] = ['removeAt', 'get'];
  const args =
    op === 'insertAt' || op === 'set'
      ? ['int index, T value', 'int index, const char *value', 'index, value']
      : valueOps.includes(op)
        ? ['T value', 'const char *value', 'value']
        : indexOps.includes(op)
          ? ['int index', 'int index', 'index']
          : ['', '', ''];
  const type = returnTypeFor(op, 'java');
  const cType = returnTypeFor(op, 'c');
  return row(
    'start',
    `public ${type} ${op}(${args[0]}) {`,
    `${cType} ll_${op}(LinkedList *list${args[1] ? ', ' + args[1] : ''}) {`,
    `FUNCTION ${op}(${args[2]})`,
  );
}

/** Fonksiyon imzası ve Run alanı aynı dönüş tipini kullanır. */
export function returnTypeFor(op: Operation, language: Language = 'java'): string {
  if (['size', 'indexOf', 'lastIndexOf'].includes(op)) return 'int';
  if (['isEmpty', 'contains', 'remove'].includes(op)) return language === 'c' ? 'bool' : 'boolean';
  if (op === 'traversal') return language === 'c' ? 'void' : 'List<T>';
  if (['clear', 'addFirst', 'insertAt', 'addLast'].includes(op)) return 'void';
  return language === 'c' ? 'const char *' : 'T';
}

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

export function codeFor(selection: Selection, language: Language): CodeLine[] {
  const rows =
    selection === 'node'
      ? [...NODE]
      : [
          note('Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.'),
          header(selection),
          ...body(selection),
          row(undefined, '}', '}', 'END FUNCTION'),
        ];
  if (selection === 'node' && language === 'c')
    rows.unshift(row(undefined, '', '#include <stdlib.h>', ''));
  const column = language === 'java' ? 1 : language === 'c' ? 2 : 3;
  return rows.flatMap((r) =>
    (r[column] ?? '').split('\n').map((text, i) => ({ key: i === 0 ? r[0] : undefined, text })),
  );
}
