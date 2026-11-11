// Seçimler ve satırlar modelden bağımsız ortak sözleşmelerle tanımlanır.
import type { CircularOperation, Language, Operation, Selection } from '../core/execution.types';
// Kod paneli ile indirilen örnekler aynı satır tipini kullanır.
import type { CodeLine } from './code-documents';
// Dönüş türleri diğer listelerle aynı doğrudan API'yi kullanır.
import { doublyId, doublyReturnType } from './doubly-code';

// Circular ailesi model, form, Sidebar ve kaynak dosyasında aynı kuralla ayırt edilir.
export function isCircular(selection: Selection): selection is CircularOperation {
  // Prefix yalnız iç seçim kimliğidir; method adında gösterilmez.
  return selection.startsWith('circular');
}
// Katalog method adını ayrı Circular seçimine çevirir.
export function circularId(operation: Operation): CircularOperation {
  // Baş harf prefix'ten sonra okunur bir seçim kimliği oluşturur.
  return `circular${operation[0].toUpperCase()}${operation.slice(1)}` as CircularOperation;
}
// Form ve sekme başlığında gerçek method adı kullanılır.
export function circularName(operation: CircularOperation): Operation {
  // İç prefix kaldırılır.
  const name = operation.slice(8);
  // Java/TypeScript method adı küçük harfle başlar.
  return (name[0].toLowerCase() + name.slice(1)) as Operation;
}
// Listeler aynı sonuç sözleşmesini paylaşır; algoritmaları bağımsızdır.
export function circularReturnType(operation: CircularOperation, language: Language): string {
  // Mevcut tür eşlemesi tekrar edilmeden kullanılır.
  return doublyReturnType(doublyId(circularName(operation)), language);
}

// Bir algoritmik satırın üç dilde aynı semantik anahtarı vardır.
type Row = [string | undefined, string, string, string];
// Satır tanımı Java/C/Pseudocode karşılıklarını yan yana tutar.
const r = (key: string | undefined, java: string, c: string, pseudo: string): Row => [
  key,
  java,
  c,
  pseudo,
];
// Yorumlar Java görünümüne eklenmez; C/Pseudocode açıklaması korunur.
const note = (text: string): Row => r(undefined, '', `// ${text}`, `// ${text}`);
// Koşul veya döngü kapanışı algoritmik atama değildir.
const end = r(undefined, '  }', '  }', '  END');
// Else başlığı aynı koşulun ikinci kolunu açar.
const otherwise = r(undefined, '  } else {', '  } else {', '  ELSE');
// Boşluk guard'ı doğrudan tail alanını kontrol eder.
const empty = r(
  'empty',
  '  if (tail == null) {',
  '  if (list->tail == NULL) {',
  '  IF tail == null:',
);
// Sonuç ayrı return satırında gösterilir.
const ret = (value: string, c = value, key = 'return'): Row =>
  r(
    key,
    `  return${value ? ' ' + value : ''};`,
    `  return${c ? ' ' + c : ''};`,
    `  RETURN${value ? ' ' + value : ''}`,
  );
// Geçersiz indisler atama yapılmadan durdurulur.
const guard = (insertion = false): Row[] => [
  r(
    'guard',
    `  if (index < 0 || index ${insertion ? '>' : '>='} size) {`,
    `  if (index < 0 || index ${insertion ? '>' : '>='} list->size) {`,
    `  IF index < 0 OR index ${insertion ? '>' : '>='} size:`,
  ),
  ret(insertion ? '' : 'null', insertion ? '' : 'NULL', 'guardReturn'),
  end,
];
// Oluşturma ile next ataması ayrı adımlardır.
const create = r(
  'create',
  '  Node<T> node = new Node<>(value, null);',
  '  Node *node = newNode(value, NULL);',
  '  node ← NEW Node(value, null)',
);
// C bellek ayıramazsa listeyi değiştirmeden döner.
const allocation: Row[] = [r(undefined, '', '  if (node == NULL) return;', '')];
// Ekleme sayacı bağlantı atamalarından ayrıdır.
const up = r('count', '  size++;', '  list->size++;', '  size ← size + 1');
// Silme sayacı bağlantı atamalarından ayrıdır.
const down = r('count', '  size--;', '  list->size--;', '  size ← size - 1');
// Ayrık nesnenin next alanı ayrıca temizlenir.
const detach = r(
  'detach',
  '  current.next = null;',
  '  current->next = NULL;',
  '  current.next ← null',
);
// C serbest bırakmadan önce data kaydedilmiştir; Java'da GC kapsam dışı nesneyi toplar.
const release = r(undefined, '', '  free(current);', '');
// Silinecek nesnenin data değeri doğrudan dönüş için saklanır.
const save = r(
  'save',
  '  T value = current.data;',
  '  const char *value = current->data;',
  '  value ← current.data',
);

// Index'e kadar tek yönde ilerleyen döngüyü get/set içinde açık gösterir.
function locate(previous = false): Row[] {
  // Önceki veya mevcut Node adı işlem amacına göre seçilir.
  const name = previous ? 'previous' : 'current';
  // Öncül aramasında hedef index'in bir önünde durulur.
  const limit = previous ? 'index - 1' : 'index';
  // Her atama ve döngü koşulu kendi satırını taşır.
  return [
    r(
      'init',
      `  Node<T> ${name} = tail.next;`,
      `  Node *${name} = list->tail->next;`,
      `  ${name} ← tail.next`,
    ),
    r('initIndex', '  int i = 0;', '  int i = 0;', '  i ← 0'),
    r('loop', `  while (i < ${limit}) {`, `  while (i < ${limit}) {`, `  WHILE i < ${limit}:`),
    r(
      'advance',
      `    ${name} = ${name}.next;`,
      `    ${name} = ${name}->next;`,
      `    ${name} ← ${name}.next`,
    ),
    r('increment', '    i++;', '    i++;', '    i ← i + 1'),
    end,
  ];
}

// Tek method'un gerçek kaynak gövdesi oluşturulur; alt çağrılar daha sonra ayrıca açılır.
function body(operation: Operation): Row[] {
  // Basit sorgular yalnız doğrudan return satırına sahiptir.
  if (operation === 'isEmpty') return [ret('tail == null', 'list->tail == NULL')];
  // Boyut önceden tutulan sayaçtan okunur.
  if (operation === 'size') return [ret('size', 'list->size')];
  // Her iki eklemede de önce yeni nesneye halka dönüş hedefi verilir.
  if (operation === 'addFirst' || operation === 'addLast')
    return [
      create,
      ...allocation,
      empty,
      r('self', '    node.next = node;', '    node->next = node;', '    node.next ← node'),
      ...(operation === 'addFirst'
        ? [r('tail', '    tail = node;', '    list->tail = node;', '    tail ← node')]
        : []),
      otherwise,
      r(
        'link',
        '    node.next = tail.next;',
        '    node->next = list->tail->next;',
        '    node.next ← tail.next',
      ),
      r('attach', '    tail.next = node;', '    list->tail->next = node;', '    tail.next ← node'),
      end,
      ...(operation === 'addLast'
        ? [r('tail', '  tail = node;', '  list->tail = node;', '  tail ← node')]
        : []),
      up,
      ret(''),
    ];
  // Araya eklemede uç işlemleri açık method çağrılarıdır.
  if (operation === 'insertAt')
    return [
      ...guard(true),
      r('first', '  if (index == 0) {', '  if (index == 0) {', '  IF index == 0:'),
      r(undefined, '    addFirst(value);', '    cll_addFirst(list, value);', '    addFirst(value)'),
      ret('', '', 'firstReturn'),
      end,
      r('last', '  if (index == size) {', '  if (index == list->size) {', '  IF index == size:'),
      r(undefined, '    addLast(value);', '    cll_addLast(list, value);', '    addLast(value)'),
      ret('', '', 'lastReturn'),
      end,
      ...locate(true),
      create,
      ...allocation,
      r(
        'link',
        '  node.next = previous.next;',
        '  node->next = previous->next;',
        '  node.next ← previous.next',
      ),
      r('attach', '  previous.next = node;', '  previous->next = node;', '  previous.next ← node'),
      up,
      ret(''),
    ];
  // İlk Node tail.next ile bulunur; tek Node dalı tail'i null yapar.
  if (operation === 'removeFirst')
    return [
      empty,
      ret('null', 'NULL', 'emptyReturn'),
      end,
      r(
        'current',
        '  Node<T> current = tail.next;',
        '  Node *current = list->tail->next;',
        '  current ← tail.next',
      ),
      save,
      r(
        'single',
        '  if (current == tail) {',
        '  if (current == list->tail) {',
        '  IF current == tail:',
      ),
      r('tail', '    tail = null;', '    list->tail = NULL;', '    tail ← null'),
      otherwise,
      r(
        'unlink',
        '    tail.next = current.next;',
        '    list->tail->next = current->next;',
        '    tail.next ← current.next',
      ),
      end,
      detach,
      release,
      down,
      ret('value'),
    ];
  // Tail tutulsa da tek yönlü listede öncülü bulmak O(n)'dir.
  if (operation === 'removeLast')
    return [
      empty,
      ret('null', 'NULL', 'emptyReturn'),
      end,
      r(
        'single',
        '  if (tail.next == tail) {',
        '  if (list->tail->next == list->tail) {',
        '  IF tail.next == tail:',
      ),
      r(
        undefined,
        '    return removeFirst();',
        '    return cll_removeFirst(list);',
        '    RETURN removeFirst()',
      ),
      end,
      r(
        'init',
        '  Node<T> previous = tail.next;',
        '  Node *previous = list->tail->next;',
        '  previous ← tail.next',
      ),
      r(
        'loop',
        '  while (previous.next != tail) {',
        '  while (previous->next != list->tail) {',
        '  WHILE previous.next != tail:',
      ),
      r(
        'advance',
        '    previous = previous.next;',
        '    previous = previous->next;',
        '    previous ← previous.next',
      ),
      end,
      r(
        'current',
        '  Node<T> current = tail;',
        '  Node *current = list->tail;',
        '  current ← tail',
      ),
      save,
      r(
        'unlink',
        '  previous.next = current.next;',
        '  previous->next = current->next;',
        '  previous.next ← current.next',
      ),
      r('tail', '  tail = previous;', '  list->tail = previous;', '  tail ← previous'),
      detach,
      release,
      down,
      ret('value'),
    ];
  // Aradaki silmede öncül ile sonraki Node birleştirilir.
  if (operation === 'removeAt')
    return [
      ...guard(),
      r('first', '  if (index == 0) {', '  if (index == 0) {', '  IF index == 0:'),
      r(
        undefined,
        '    return removeFirst();',
        '    return cll_removeFirst(list);',
        '    RETURN removeFirst()',
      ),
      end,
      r(
        'last',
        '  if (index == size - 1) {',
        '  if (index == list->size - 1) {',
        '  IF index == size - 1:',
      ),
      r(
        undefined,
        '    return removeLast();',
        '    return cll_removeLast(list);',
        '    RETURN removeLast()',
      ),
      end,
      ...locate(true),
      r(
        'current',
        '  Node<T> current = previous.next;',
        '  Node *current = previous->next;',
        '  current ← previous.next',
      ),
      save,
      r(
        'unlink',
        '  previous.next = current.next;',
        '  previous->next = current->next;',
        '  previous.next ← current.next',
      ),
      detach,
      release,
      down,
      ret('value'),
    ];
  // Get ve set aynı ileri erişimi paylaşır; set data atamasını ekler.
  if (operation === 'get' || operation === 'set')
    return [
      ...guard(),
      ...locate(),
      ...(operation === 'set'
        ? [
            r(
              'save',
              '  T oldValue = current.data;',
              '  const char *oldValue = current->data;',
              '  oldValue ← current.data',
            ),
            r(
              'update',
              '  current.data = value;',
              '  current->data = value;',
              '  current.data ← value',
            ),
            ret('oldValue'),
          ]
        : [ret('current.data', 'current->data')]),
    ];
  // Uç okumaları yalnız tail veya tail.next kullanır.
  if (operation === 'getFirst' || operation === 'getLast')
    return [
      empty,
      ret('null', 'NULL', 'emptyReturn'),
      end,
      ret(
        operation === 'getFirst' ? 'tail.next.data' : 'tail.data',
        operation === 'getFirst' ? 'list->tail->next->data' : 'list->tail->data',
      ),
    ];
  // Arama bir turla sınırlıdır; son eşleşmede de yalnız ileri gidilir.
  if (operation === 'indexOf' || operation === 'lastIndexOf')
    return [
      note('Halka null ile bitmez; size adım bir turdur.'),
      r(
        'init',
        '  Node<T> current = tail == null ? null : tail.next;',
        '  Node *current = list->tail == NULL ? NULL : list->tail->next;',
        '  current ← IF tail == null THEN null ELSE tail.next',
      ),
      r('initIndex', '  int i = 0;', '  int i = 0;', '  i ← 0'),
      ...(operation === 'lastIndexOf'
        ? [r('foundInit', '  int found = -1;', '  int found = -1;', '  found ← -1')]
        : []),
      r('loop', '  while (i < size) {', '  while (i < list->size) {', '  WHILE i < size:'),
      r(
        'compare',
        '    if (Objects.equals(current.data, value)) {',
        '    if (strcmp(current->data, value) == 0) {',
        '    IF current.data == value:',
      ),
      ...(operation === 'lastIndexOf'
        ? [r('found', '      found = i;', '      found = i;', '      found ← i')]
        : [ret('i', 'i', 'foundReturn')]),
      end,
      r(
        'advance',
        '    current = current.next;',
        '    current = current->next;',
        '    current ← current.next',
      ),
      r('increment', '    i++;', '    i++;', '    i ← i + 1'),
      end,
      ret(operation === 'lastIndexOf' ? 'found' : '-1'),
    ];
  // Contains açılan indexOf çağrısının sonucunu boolean'a çevirir.
  if (operation === 'contains')
    return [
      r(
        'searchResult',
        '  int index = indexOf(value);',
        '  int index = cll_indexOf(list, value);',
        '  index ← indexOf(value)',
      ),
      ret('index != -1', 'index != -1', 'containsReturn'),
    ];
  // Remove indexOf ve removeAt alt algoritmalarını açık çağırır.
  if (operation === 'remove')
    return [
      r(
        'searchResult',
        '  int index = indexOf(value);',
        '  int index = cll_indexOf(list, value);',
        '  index ← indexOf(value)',
      ),
      r('missing', '  if (index == -1) {', '  if (index == -1) {', '  IF index == -1:'),
      ret('false', 'false', 'missingReturn'),
      end,
      r(undefined, '  removeAt(index);', '  cll_removeAt(list, index);', '  removeAt(index)'),
      ret('true', 'true', 'removedReturn'),
    ];
  // Traversal son Node'dan ilk Node'a döndükten sonra koşulda durur.
  if (operation === 'traversal')
    return [
      note('Yalnız bir tam tur dolaşılır; ikinci tura girilmez.'),
      r('output', '  List<T> values = new ArrayList<>();', '  printf("[");', '  values ← []'),
      r(
        'init',
        '  Node<T> current = tail == null ? null : tail.next;',
        '  Node *current = list->tail == NULL ? NULL : list->tail->next;',
        '  current ← IF tail == null THEN null ELSE tail.next',
      ),
      r('initIndex', '  int i = 0;', '  int i = 0;', '  i ← 0'),
      r('loop', '  while (i < size) {', '  while (i < list->size) {', '  WHILE i < size:'),
      r(
        'visit',
        '    values.add(current.data);',
        '    printf("%s%s", i == 0 ? "" : ", ", current->data);',
        '    APPEND current.data TO values',
      ),
      r(
        'advance',
        '    current = current.next;',
        '    current = current->next;',
        '    current ← current.next',
      ),
      r('increment', '    i++;', '    i++;', '    i ← i + 1'),
      end,
      r(undefined, '', '  printf("]\\n");', ''),
      ret('values', ''),
    ];
  // Clear önce dairesel oku açar; sonra lineer zincirin belleği güvenle temizlenir.
  return [
    note('Önce halka açılır; ardından current null olana kadar temizlenir.'),
    empty,
    ret('', '', 'emptyReturn'),
    end,
    r(
      'current',
      '  Node<T> current = tail.next;',
      '  Node *current = list->tail->next;',
      '  current ← tail.next',
    ),
    r('open', '  tail.next = null;', '  list->tail->next = NULL;', '  tail.next ← null'),
    r('tail', '  tail = null;', '  list->tail = NULL;', '  tail ← null'),
    r(
      'loop',
      '  while (current != null) {',
      '  while (current != NULL) {',
      '  WHILE current != null:',
    ),
    r(
      'following',
      '    Node<T> following = current.next;',
      '    Node *following = current->next;',
      '    following ← current.next',
    ),
    detach,
    release,
    r('countDown', '    size--;', '    list->size--;', '    size ← size - 1'),
    r('advance', '    current = following;', '    current = following;', '    current ← following'),
    end,
    ret(''),
  ];
}

// İmza satırı başlangıç snapshot'ına eşlenir.
function rows(operation: Operation): Row[] {
  // Parametreler mevcut liste API'siyle tutarlı kalır.
  const index = ['insertAt', 'removeAt', 'get', 'set'].includes(operation);
  // Value yalnız veri alan method'larda gösterilir.
  const value = [
    'addFirst',
    'addLast',
    'insertAt',
    'set',
    'indexOf',
    'lastIndexOf',
    'contains',
    'remove',
  ].includes(operation);
  // Java parametreleri generic veri tipini korur.
  const javaParams = [index ? 'int index' : '', value ? 'T value' : ''].filter(Boolean).join(', ');
  // C aynı modelin borrowed string karşılığını kullanır.
  const cParams = [
    'CircularLinkedlist *list',
    index ? 'int index' : '',
    value ? 'const char *value' : '',
  ]
    .filter(Boolean)
    .join(', ');
  // Pseudocode dil bağımsız isimleri gösterir.
  const pseudoParams = [index ? 'index' : '', value ? 'value' : ''].filter(Boolean).join(', ');
  // Tek bir method'un header, gövde ve kapanışı birleştirilir.
  return [
    r(
      'start',
      `public ${circularReturnType(circularId(operation), 'java')} ${operation}(${javaParams}) {`,
      `${circularReturnType(circularId(operation), 'c')} cll_${operation}(${cParams}) {`,
      `FUNCTION ${operation}(${pseudoParams}):`,
    ),
    ...body(operation),
    r(undefined, '}', '}', 'END FUNCTION'),
  ];
}

// İç çağrıların kodunu panelde açar; aynı isimli return satırları benzersiz prefix taşır.
function expanded(operation: Operation, prefix = ''): Row[] {
  // Üst method'un semantik anahtarları kendi kapsamına alınır.
  const own = rows(operation).map(([key, ...texts]): Row => [
    key ? prefix + key : undefined,
    ...texts,
  ]);
  // Method çağrıları gerçek Java/C kaynağında ayrı method'lardır.
  const calls: Partial<Record<Operation, [string, Operation][]>> = {
    insertAt: [
      ['first.', 'addFirst'],
      ['last.', 'addLast'],
    ],
    removeLast: [['single.', 'removeFirst']],
    removeAt: [
      ['first.', 'removeFirst'],
      ['last.', 'removeLast'],
    ],
    contains: [['search.', 'indexOf']],
    remove: [
      ['search.', 'indexOf'],
      ['removal.', 'removeAt'],
    ],
  };
  // Açılan alt method'lar yalnız görünüm içindir; export tekrar method üretmez.
  return [
    ...own,
    ...(calls[operation] ?? []).flatMap(([scope, method]) => [
      note(`Çağrılan method: ${method}`),
      ...expanded(method, prefix + scope),
    ]),
  ];
}

// Panel alt çağrıları açabilir; export yalnız bir gerçek method tanımı alır.
export function circularCode(
  selection: CircularOperation,
  language: Language,
  expandCalls = true,
): CodeLine[] {
  // Seçili dilin sütunu belirlenir; anahtar dilden bağımsızdır.
  const column = language === 'java' ? 1 : language === 'c' ? 2 : 3;
  // Aynı kaynak satırları hem öğretim hem indirme için kullanılır.
  const source = expandCalls ? expanded(circularName(selection)) : rows(circularName(selection));
  // Boş dil karşılıkları ekranda gereksiz satır oluşturmaz.
  return source
    .filter((row) => row[column].trim())
    .map((row) => ({ key: row[0], text: row[column] }));
}
