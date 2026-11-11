// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { DoublyOperation, Language, Operation, Selection } from '../core/execution.types';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { CodeLine } from './code-documents';

// Seçim ailesi model, form ve dosya adında tek kuralla belirlenir.
export function isDoubly(selection: Selection): selection is DoublyOperation {
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return selection.startsWith('doubly');
}
// Doubly seçim kimliğini gerçek method adına çevirir; iç prefix kullanıcı koduna yazılmaz.
export function doublyName(operation: DoublyOperation): Operation {
  // İsimden gerekli prefix veya dil bilgisini ayırır; kullanıcıya gerçek method adı gösterilir.
  const name = operation.slice(6);
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return (name[0].toLowerCase() + name.slice(1)) as Operation;
}
// Ortak katalog method adından Doubly’ye özgü seçim kimliği üretir.
export function doublyId(operation: Operation): DoublyOperation {
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return `doubly${operation[0].toUpperCase()}${operation.slice(1)}` as DoublyOperation;
}
// Method adına göre doğrudan dönüş tipini seçer; Java generic T ile C borrowed string ayrılır.
export function doublyReturnType(operation: DoublyOperation, language: Language): string {
  // İsimden gerekli prefix veya dil bilgisini ayırır; kullanıcıya gerçek method adı gösterilir.
  const name = doublyName(operation);
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (['isEmpty', 'contains', 'remove'].includes(name))
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return language === 'c' ? 'bool' : 'boolean';
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (['size', 'indexOf', 'lastIndexOf'].includes(name)) return 'int';
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (['clear', 'addFirst', 'addLast', 'insertAt'].includes(name)) return 'void';
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (name === 'traversal') return language === 'c' ? 'void' : 'List<T>';
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return language === 'c' ? 'const char *' : 'T';
}
// Her Row yalnız tek semantik işlem içerir; semantik key dil değişince korunur.
type Row = [string | undefined, string, string, string];
// Bir semantik adımın key’i ile Java, C ve Pseudocode metinlerini tek Row içinde eşler.
const r = (key: string | undefined, java: string, c: string, pseudo: string): Row => [
  key,
  java,
  c,
  pseudo,
];
// Koşul bloğunu üç dilin kapanış sözdizimiyle tamamlar; yeni algoritma adımı değildir.
const close = r(undefined, '  }', '  }', '  END IF');
// Koşulun else kolunu üç dilde aynı sırada açar.
const otherwise = r(undefined, '  } else {', '  } else {', '  ELSE:');
// Kontrol ile erken dönüş farklı satır ve farklı adım anahtarı taşır.
const guard = (insertion = false, returns = 'null'): Row[] => [
  r(
    'guard',
    `  if (index < 0 || index ${insertion ? '>' : '>='} size) {`,
    `  if (index < 0 || index ${insertion ? '>' : '>='} list->size) {`,
    `  IF index < 0 OR index ${insertion ? '>' : '>='} size:`,
  ),
  r(
    'guardReturn',
    `    return${returns === '' ? '' : ' ' + returns};`,
    `    return${returns === '' ? '' : ' NULL'};`,
    `    RETURN${returns === '' ? '' : ' null'}`,
  ),
  close,
];
// Boş liste koşulu ve güvenli null dönüşü için iki ayrı satır üretir.
const emptyGuard = (end = 'head'): Row[] => [
  r('guard', `  if (${end} == null) {`, `  if (list->${end} == NULL) {`, `  IF ${end} == null:`),
  r('guardReturn', '    return null;', '    return NULL;', '    RETURN null'),
  close,
];
// Yeni DNode çağrısının üç dildeki satırını create adım anahtarına bağlar.
const create = r(
  'create',
  '  DNode<T> node = new DNode<>(value, null, null);',
  '  DNode *node = newDNode(value, NULL, NULL);',
  '  node ← NEW DNode(value, null, null)',
);
// C bellek ayırma başarısızlığında listeyi değiştirmeden dönmeyi sağlar.
const allocationGuard: Row[] = [
  r(undefined, '', '  if (node == NULL) {', ''),
  r(undefined, '', '    return;', ''),
  r(undefined, '', '  }', ''),
];
// Ekleme sonundaki size artışını tek count adımıyla eşler.
const countUp = r('count', '  size++;', '  list->size++;', '  size ← size + 1');
// Silme sonundaki size azalışını tek count adımıyla eşler.
const countDown = r('count', '  size--;', '  list->size--;', '  size ← size - 1');
// Gerçek dönüş değerini her dilin return satırıyla eşler.
const endReturn = (java: string, c = java, key = 'return') =>
  r(
    key,
    `  return${java ? ' ' + java : ''};`,
    `  return${c ? ' ' + c : ''};`,
    `  RETURN${java ? ' ' + java : ''}`,
  );

// İndexli fonksiyonlarda yakın uçtan dolaşma aynı satır dizisiyle açıklanır.
function locateRows(declare = true): Row[] {
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return [
    ...(declare
      ? [r(undefined, '  DNode<T> current;', '  DNode *current;', '  DECLARE current')]
      : []),
    r(undefined, '  int i;', '  int i;', '  DECLARE i'),
    r(
      'direction',
      '  if (index < size / 2.0) {',
      '  if (index < list->size / 2.0) {',
      '  IF index < size / 2:',
    ),
    r('forwardStart', '    current = head;', '    current = list->head;', '    current ← head'),
    r('forwardIndex', '    i = 0;', '    i = 0;', '    i ← 0'),
    otherwise,
    r('backwardStart', '    current = tail;', '    current = list->tail;', '    current ← tail'),
    r('backwardIndex', '    i = size - 1;', '    i = list->size - 1;', '    i ← size - 1'),
    close,
    r('locateLoop', '  while (i != index) {', '  while (i != index) {', '  WHILE i != index:'),
    r('locateDirection', '    if (i < index) {', '    if (i < index) {', '    IF i < index:'),
    r(
      'advanceNext',
      '      current = current.next;',
      '      current = current->next;',
      '      current ← current.next',
    ),
    r('increment', '      i++;', '      i++;', '      i ← i + 1'),
    otherwise,
    r(
      'advancePrev',
      '      current = current.prev;',
      '      current = current->prev;',
      '      current ← current.prev',
    ),
    r('decrement', '      i--;', '      i--;', '      i ← i - 1'),
    close,
    r(undefined, '  }', '  }', '  END WHILE'),
  ];
}
// Silme her iki komşuyu ayrı bağlar; free yalnız C bellek yönetimi ayrıntısıdır.
function unlinkRows(booleanReturn = false): Row[] {
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return [
    r(
      'save',
      '  T oldValue = current.data;',
      '  const char *oldValue = current->data;',
      '  oldValue ← current.data',
    ),
    ...(booleanReturn
      ? [r(undefined, '', '  (void)oldValue; // Bu method bool döndürür.', '')]
      : []),
    r(
      'previous',
      '  DNode<T> previous = current.prev;',
      '  DNode *previous = current->prev;',
      '  previous ← current.prev',
    ),
    r(
      'following',
      '  DNode<T> following = current.next;',
      '  DNode *following = current->next;',
      '  following ← current.next',
    ),
    r(
      'previousBranch',
      '  if (previous != null) {',
      '  if (previous != NULL) {',
      '  IF previous != null:',
    ),
    r(
      'unlinkPrevious',
      '    previous.next = following;',
      '    previous->next = following;',
      '    previous.next ← following',
    ),
    otherwise,
    r('head', '    head = following;', '    list->head = following;', '    head ← following'),
    close,
    r(
      'followingBranch',
      '  if (following != null) {',
      '  if (following != NULL) {',
      '  IF following != null:',
    ),
    r(
      'unlinkFollowing',
      '    following.prev = previous;',
      '    following->prev = previous;',
      '    following.prev ← previous',
    ),
    otherwise,
    r('tail', '    tail = previous;', '    list->tail = previous;', '    tail ← previous'),
    close,
    r('detachPrev', '  current.prev = null;', '  current->prev = NULL;', '  current.prev ← null'),
    r('detachNext', '  current.next = null;', '  current->next = NULL;', '  current.next ← null'),
    r(undefined, '', '  free(current); // Yalnız nesne belleği; data ödünç metindir.', ''),
    countDown,
    endReturn(booleanReturn ? 'true' : 'oldValue'),
  ];
}
// Aramanın yön, karşılaştırma, index ve dönüş satırlarını aynı sırada üretir.
function searchRows(name: 'indexOf' | 'lastIndexOf' | 'contains'): Row[] {
  // backward hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const backward = name === 'lastIndexOf';
  // contains hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const contains = name === 'contains';
  // Okun hedef nesnedeki ayrı giriş noktasını hesaplar.
  const end = backward ? 'tail' : 'head';
  // direction hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const direction = backward ? 'prev' : 'next';
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return [
    r(
      'searchCurrent',
      `  DNode<T> current = ${end};`,
      `  DNode *current = list->${end};`,
      `  current ← ${end}`,
    ),
    r(
      'searchIndex',
      `  int i = ${backward ? 'size - 1' : '0'};`,
      `  int i = ${backward ? 'list->size - 1' : '0'};`,
      `  i ← ${backward ? 'size - 1' : '0'}`,
    ),
    r(
      'searchLoop',
      '  while (current != null) {',
      '  while (current != NULL) {',
      '  WHILE current != null:',
    ),
    r(
      'compare',
      '    boolean matched = Objects.equals(current.data, value);',
      '    bool matched = strcmp(current->data, value) == 0;',
      '    matched ← current.data == value',
    ),
    r('matchBranch', '    if (matched) {', '    if (matched) {', '    IF matched:'),
    r(
      'found',
      `      ${contains ? 'boolean' : 'int'} found = ${contains ? 'true' : 'i'};`,
      `      ${contains ? 'bool' : 'int'} found = ${contains ? 'true' : 'i'};`,
      `      found ← ${contains ? 'true' : 'i'}`,
    ),
    endReturn('found', 'found', 'returnFound'),
    close,
    r(
      'searchAdvance',
      `    current = current.${direction};`,
      `    current = current->${direction};`,
      `    current ← current.${direction}`,
    ),
    r(
      'searchIncrement',
      `    i${backward ? '--' : '++'};`,
      `    i${backward ? '--' : '++'};`,
      `    i ← i ${backward ? '-' : '+'} 1`,
    ),
    r(undefined, '  }', '  }', '  END WHILE'),
    // C contains i değişkenini dolaşma öğretimi için kullanır; sonuç yine bool’dur.
    ...(contains ? [r(undefined, '', '  (void)i;', '')] : []),
    endReturn(contains ? 'false' : '-1', contains ? 'false' : '-1', 'returnMissing'),
  ];
}
// Method adına göre o algoritmanın semantik satır dizisini seçer.
function body(name: Operation): Row[] {
  // Seçilen fonksiyon adına göre yalnız ilgili algoritma çalıştırılır; aynı isimler iki yapı için ayrı kayıtlanır.
  switch (name) {
    case 'isEmpty':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        r(
          'check',
          '  boolean empty = head == null;',
          '  bool empty = list->head == NULL;',
          '  empty ← head == null',
        ),
        endReturn('empty'),
      ];
    case 'size':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        r('check', '  int count = size;', '  int count = list->size;', '  count ← size'),
        endReturn('count'),
      ];
    case 'addFirst':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        create,
        ...allocationGuard,
        r('next', '  node.next = head;', '  node->next = list->head;', '  node.next ← head'),
        r('branch', '  if (head != null) {', '  if (list->head != NULL) {', '  IF head != null:'),
        r('prev', '    head.prev = node;', '    list->head->prev = node;', '    head.prev ← node'),
        otherwise,
        r('tail', '    tail = node;', '    list->tail = node;', '    tail ← node'),
        close,
        r('head', '  head = node;', '  list->head = node;', '  head ← node'),
        countUp,
        endReturn(''),
      ];
    case 'addLast':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        create,
        ...allocationGuard,
        r('prev', '  node.prev = tail;', '  node->prev = list->tail;', '  node.prev ← tail'),
        r('branch', '  if (tail != null) {', '  if (list->tail != NULL) {', '  IF tail != null:'),
        r('next', '    tail.next = node;', '    list->tail->next = node;', '    tail.next ← node'),
        otherwise,
        r('head', '    head = node;', '    list->head = node;', '    head ← node'),
        close,
        r('tail', '  tail = node;', '  list->tail = node;', '  tail ← node'),
        countUp,
        endReturn(''),
      ];
    case 'insertAt':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        ...guard(true, ''),
        r(undefined, '  DNode<T> current;', '  DNode *current;', '  DECLARE current'),
        r(
          'endBranch',
          '  if (index == size) {',
          '  if (index == list->size) {',
          '  IF index == size:',
        ),
        r('endCurrent', '    current = null;', '    current = NULL;', '    current ← null'),
        otherwise,
        ...locateRows(false),
        close,
        r(
          'previous',
          '  DNode<T> previous = current != null ? current.prev : tail;',
          '  DNode *previous = current != NULL ? current->prev : list->tail;',
          '  previous ← IF current != null THEN current.prev ELSE tail',
        ),
        create,
        ...allocationGuard,
        r(
          'nodePrev',
          '  node.prev = previous;',
          '  node->prev = previous;',
          '  node.prev ← previous',
        ),
        r('nodeNext', '  node.next = current;', '  node->next = current;', '  node.next ← current'),
        r(
          'previousBranch',
          '  if (previous != null) {',
          '  if (previous != NULL) {',
          '  IF previous != null:',
        ),
        r(
          'previousNext',
          '    previous.next = node;',
          '    previous->next = node;',
          '    previous.next ← node',
        ),
        otherwise,
        r('head', '    head = node;', '    list->head = node;', '    head ← node'),
        close,
        r(
          'currentBranch',
          '  if (current != null) {',
          '  if (current != NULL) {',
          '  IF current != null:',
        ),
        r(
          'currentPrev',
          '    current.prev = node;',
          '    current->prev = node;',
          '    current.prev ← node',
        ),
        otherwise,
        r('tail', '    tail = node;', '    list->tail = node;', '    tail ← node'),
        close,
        countUp,
        endReturn(''),
      ];
    case 'removeAt':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [...guard(), ...locateRows(), ...unlinkRows()];
    case 'removeFirst':
    case 'removeLast': {
      // Okun hedef nesnedeki ayrı giriş noktasını hesaplar.
      const end = name === 'removeFirst' ? 'head' : 'tail';
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        ...emptyGuard(end),
        r(
          'current',
          `  DNode<T> current = ${end};`,
          `  DNode *current = list->${end};`,
          `  current ← ${end}`,
        ),
        ...unlinkRows(),
      ];
    }
    case 'get':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        ...guard(),
        ...locateRows(),
        r(
          'read',
          '  T value = current.data;',
          '  const char *value = current->data;',
          '  value ← current.data',
        ),
        endReturn('value'),
      ];
    case 'getFirst':
    case 'getLast': {
      // Okun hedef nesnedeki ayrı giriş noktasını hesaplar.
      const end = name === 'getFirst' ? 'head' : 'tail';
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        ...emptyGuard(end),
        r(
          'current',
          `  DNode<T> current = ${end};`,
          `  DNode *current = list->${end};`,
          `  current ← ${end}`,
        ),
        r(
          'read',
          '  T value = current.data;',
          '  const char *value = current->data;',
          '  value ← current.data',
        ),
        endReturn('value'),
      ];
    }
    case 'set':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        ...guard(),
        ...locateRows(),
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
        endReturn('oldValue'),
      ];
    case 'indexOf':
    case 'lastIndexOf':
    case 'contains':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return searchRows(name);
    case 'remove':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        r(
          'searchCurrent',
          '  DNode<T> current = head;',
          '  DNode *current = list->head;',
          '  current ← head',
        ),
        r(
          'searchLoop',
          '  while (current != null) {',
          '  while (current != NULL) {',
          '  WHILE current != null:',
        ),
        r(
          'compare',
          '    boolean matched = Objects.equals(current.data, value);',
          '    bool matched = strcmp(current->data, value) == 0;',
          '    matched ← current.data == value',
        ),
        r('matchBranch', '    if (matched) {', '    if (matched) {', '    IF matched:'),
        ...unlinkRows(true),
        close,
        r(
          'searchAdvance',
          '    current = current.next;',
          '    current = current->next;',
          '    current ← current.next',
        ),
        r(undefined, '  }', '  }', '  END WHILE'),
        endReturn('false', 'false', 'returnMissing'),
      ];
    case 'traversal':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        r(
          'output',
          '  List<T> output = new ArrayList<>();',
          '  printf("[");',
          '  output ← EMPTY LIST',
        ),
        r(
          'searchCurrent',
          '  DNode<T> current = head;',
          '  DNode *current = list->head;',
          '  current ← head',
        ),
        r('searchIndex', '  int i = 0;', '  int i = 0;', '  i ← 0'),
        r(
          'searchLoop',
          '  while (current != null) {',
          '  while (current != NULL) {',
          '  WHILE current != null:',
        ),
        r(
          'append',
          '    output.add(current.data);',
          '    printf("%s%s", i ? ", " : "", current->data);',
          '    APPEND current.data TO output',
        ),
        r(
          'searchAdvance',
          '    current = current.next;',
          '    current = current->next;',
          '    current ← current.next',
        ),
        r('searchIncrement', '    i++;', '    i++;', '    i ← i + 1'),
        r(undefined, '  }', '  }', '  END WHILE'),
        r('return', '  return output;', '  printf("]\\n");', '  RETURN output'),
        r(undefined, '', '  return;', ''),
      ];
    case 'clear':
      // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
      return [
        r(
          'searchCurrent',
          '  DNode<T> current = head;',
          '  DNode *current = list->head;',
          '  current ← head',
        ),
        r('head', '  head = null;', '  list->head = NULL;', '  head ← null'),
        r('tail', '  tail = null;', '  list->tail = NULL;', '  tail ← null'),
        r(
          'followingInit',
          '  DNode<T> following = null;',
          '  DNode *following = NULL;',
          '  following ← null',
        ),
        r(
          'searchLoop',
          '  while (current != null) {',
          '  while (current != NULL) {',
          '  WHILE current != null:',
        ),
        r(
          'following',
          '    following = current.next;',
          '    following = current->next;',
          '    following ← current.next',
        ),
        r(
          'clearPrev',
          '    current.prev = null;',
          '    current->prev = NULL;',
          '    current.prev ← null',
        ),
        r(
          'clearNext',
          '    current.next = null;',
          '    current->next = NULL;',
          '    current.next ← null',
        ),
        r(undefined, '', '    free(current); // data ödünç alınmıştır.', ''),
        r(
          'clearAdvance',
          '    current = following;',
          '    current = following;',
          '    current ← following',
        ),
        r(undefined, '  }', '  }', '  END WHILE'),
        r('count', '  size = 0;', '  list->size = 0;', '  size ← 0'),
        endReturn(''),
      ];
  }
}
// Öğretici yorumlar her semantik satırın amacını gösterir; key eşleşmesini bozmaz.
const NOTES: Record<string, string> = {
  guardReturn: 'Geçersiz işlemde listeyi değiştirmeden güvenle dön.',
  guard: 'Geçersiz index veya boş listeyi değiştirmeden sonlandır.',
  create: 'Bağımsız DNode oluştur; komşular daha sonra ayrı bağlanacak.',
  next: 'İleri bağlantıyı bu adımda güncelle.',
  prev: 'Geri bağlantıyı bu adımda güncelle.',
  branch: 'Boş ve dolu liste için farklı uç güncellemesini seç.',
  head: 'Liste başlangıç referansını güncelle.',
  tail: 'Liste bitiş referansını güncelle.',
  count: 'Eleman sayacını bağlantılardan ayrı güncelle.',
  direction: 'Hedefe yakın uçtan başlayarak dolaşma maliyetini azalt.',
  forwardStart: 'Geçici referansı head ile başlat.',
  backwardStart: 'Geçici referansı tail ile başlat.',
  forwardIndex: 'Head konumunun index’i sıfırdır.',
  backwardIndex: 'Tail konumunun index’i size - 1’dir.',
  locateLoop: 'Hedef index’e ulaşana kadar koşulu yeniden kontrol et.',
  locateDirection: 'İndex farkına göre ileri veya geri ilerle.',
  advanceNext: 'Geçici referansı next hedefe taşı.',
  advancePrev: 'Geçici referansı prev hedefe taşı.',
  increment: 'İndex sayacını ayrı adımda artır.',
  decrement: 'İndex sayacını ayrı adımda azalt.',
  endBranch: 'Size konumuna eklemede sonraki nesne bulunmaz.',
  endCurrent: 'Sona eklemenin sonraki komşusu null’dır.',
  previous: 'Önceki komşuyu geçici referansta sakla.',
  following: 'Sonraki komşuyu koparmadan önce sakla.',
  nodePrev: 'Yeni nesnenin geri bağlantısını kur.',
  nodeNext: 'Yeni nesnenin ileri bağlantısını kur.',
  previousBranch: 'Önceki komşu yoksa head güncellenmelidir.',
  currentBranch: 'Sonraki komşu yoksa tail güncellenmelidir.',
  previousNext: 'Önceki komşunun ileri bağlantısını yeni nesneye taşı.',
  currentPrev: 'Sonraki komşunun geri bağlantısını yeni nesneye taşı.',
  current: 'İşlem yapılacak nesneyi geçici referansla seç.',
  save: 'Eski veriyi değiştirmeden veya nesneyi silmeden önce sakla.',
  followingBranch: 'Sonraki komşu yoksa tail güncellenir.',
  unlinkPrevious: 'İleri zincirin silinen nesneyi atlamasını sağla.',
  unlinkFollowing: 'Geri zincirin silinen nesneyi atlamasını sağla.',
  detachPrev: 'Silinen nesnenin geri referansını temizle.',
  detachNext: 'Silinen nesnenin ileri referansını temizle.',
  read: 'Nesnenin veri alanını bağlantıları değiştirmeden oku.',
  update: 'Yalnız data değerini değiştir; bağlantıları koru.',
  searchCurrent: 'Dolaşma için geçici current referansını başlat.',
  searchIndex: 'Dolaşmanın index sayacını başlat.',
  searchLoop: 'Null’a ulaşana kadar koşulu her dönüşte yeniden kontrol et.',
  compare: 'Veri eşitliğini kontrol et; henüz bağlantı değiştirme.',
  matchBranch: 'Karşılaştırma true ise eşleşme koluna gir; sonucu ayrı satırda kullan.',
  found: 'Bulunan index veya mantıksal sonucu ayrı değişkende sakla.',
  searchAdvance: 'Current referansını bir komşuya taşı.',
  searchIncrement: 'Dolaşma sayacını ayrı adımda güncelle.',
  output: 'Dolaşma çıktısını hazırla.',
  append: 'Mevcut veriyi çıktıya ekle.',
  followingInit: 'Sonraki nesneyi tutacak geçici referansı null ile başlat.',
  clearPrev: 'Temizlenen nesnenin prev alanını null yap.',
  clearNext: 'Temizlenen nesnenin next alanını null yap.',
  clearAdvance: 'Saklanan sonraki nesneyle devam et.',
  return: 'İşlemi bitir ve doğrudan sonucu döndür.',
  returnFound: 'Bulunan sonucu döndür.',
  returnMissing: 'Bulunamayan hedef için güvenli sonucu döndür.',
};
// Modelin semantik key’lerini seçilen dilde tek satırlı method kaynağına çevirir.
// Kod panelindeki iç içe blokları başlangıç düzeyinde okunur indentation ile gösterir.
function indentLines(lines: CodeLine[], language: Language): CodeLine[] {
  let depth = 0;
  return lines.map((line) => {
    const text = line.text.trim();
    if (!text) return line;
    if (language === 'pseudo') {
      // END ve ELSE, bir önceki bloğun seviyesine döner; yeni kol tekrar içeriden başlar.
      if (/^(END|ELSE)/.test(text)) depth = Math.max(0, depth - 1);
      const result = { ...line, text: '  '.repeat(depth) + text };
      if (/^(FUNCTION|CLASS|CONSTRUCTOR|IF|WHILE|ELSE).*:$/.test(text)) depth++;
      return result;
    }
    // Yorum ve string içindeki işaretleri blok açma/kapama olarak saymayız.
    const code = text.replace(/"(?:\\.|[^"\\])*"/g, '""').replace(/\/\/.*$/, '');
    const leadingClose = code.match(/^}+/)?.[0].length ?? 0;
    const result = { ...line, text: '  '.repeat(Math.max(0, depth - leadingClose)) + text };
    depth = Math.max(0, depth + (code.match(/{/g)?.length ?? 0) - (code.match(/}/g)?.length ?? 0));
    return result;
  });
}

export function doublyCode(operation: DoublyOperation, language: Language): CodeLine[] {
  // İsimden gerekli prefix veya dil bilgisini ayırır; kullanıcıya gerçek method adı gösterilir.
  const name = doublyName(operation);
  // parameters hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const parameters = ['insertAt', 'set'].includes(name)
    ? ['int index', 'T value']
    : ['removeAt', 'get'].includes(name)
      ? ['int index']
      : ['addFirst', 'addLast', 'indexOf', 'lastIndexOf', 'contains', 'remove'].includes(name)
        ? ['T value']
        : [];
  // javaParams hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const javaParams = parameters.join(', ');
  // cParams hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const cParams = [
    'DoublyLinkedlist *list',
    ...parameters.map((parameter) => (parameter === 'T value' ? 'const char *value' : parameter)),
  ].join(', ');
  // Semantik key ve üç dildeki metin karşılıklarını aynı satır tablosunda birleştirir.
  const rows = [
    r(
      'start',
      `public ${doublyReturnType(operation, 'java')} ${name}(${javaParams}) {`,
      `${doublyReturnType(operation, 'c')} dll_${name}(${cParams}) {`,
      `FUNCTION ${name}(${parameters.map((parameter) => parameter.split(' ')[1]).join(', ')}):`,
    ),
    ...body(name),
    r(undefined, '}', '}', 'END FUNCTION'),
  ];
  // Seçilen dilin satır tablosundaki sütununu belirler; algoritma key’i değişmez.
  const column = language === 'java' ? 1 : language === 'c' ? 2 : 3;
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return indentLines(
    rows
      .flatMap((row) => [
        ...(language !== 'java' && row[0] && NOTES[row[0]]
          ? [{ text: '  // ' + NOTES[row[0]] }]
          : []),
        { key: row[0], text: row[column] ?? '' },
      ])
      .filter((line) => language !== 'java' || line.text.trim()),
    language,
  );
}
