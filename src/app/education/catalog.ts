import type { Language, Operation, Selection } from '../core/execution.types';

export interface FunctionInfo {
  id: Operation;
  label: string;
  group: string;
  description: string;
  value?: boolean;
  index?: boolean;
}
/** Sidebar ve parametre formu aynı katalogdan gelir; imzalar ayrı ayrı tekrar edilmez. */
export const FUNCTIONS: FunctionInfo[] = [
  {
    id: 'isEmpty',
    label: 'isEmpty()',
    group: 'Inspect',
    description: 'Listenin boş olup olmadığını kontrol et.',
  },
  {
    id: 'size',
    label: 'size()',
    group: 'Inspect',
    description: 'Listedeki eleman sayısını öğren.',
  },
  {
    id: 'traversal',
    label: 'Traversal',
    group: 'Inspect',
    description: 'Node bağlantılarını takip ederek bütün listeyi dolaş.',
  },
  {
    id: 'addFirst',
    label: 'addFirst(value)',
    group: 'Insert',
    value: true,
    description: 'Yeni Node’u listenin başına ekle.',
  },
  {
    id: 'insertAt',
    label: 'insertAt(index, value)',
    group: 'Insert',
    value: true,
    index: true,
    description: 'Yeni Node’u seçtiğin index’e yerleştir.',
  },
  {
    id: 'addLast',
    label: 'addLast(value)',
    group: 'Insert',
    value: true,
    description: 'Son Node’a kadar ilerle ve yeni Node’u bağla.',
  },
  {
    id: 'removeAt',
    label: 'removeAt(index)',
    group: 'Remove',
    index: true,
    description: 'Seçtiğin index’teki Node’u listeden ayır.',
  },
  {
    id: 'removeFirst',
    label: 'removeFirst()',
    group: 'Remove',
    description: 'İlk Node’u sil ve head referansını güncelle.',
  },
  {
    id: 'removeLast',
    label: 'removeLast()',
    group: 'Remove',
    description: 'Son Node’u silmek için bir önceki Node’u bul.',
  },
  {
    id: 'remove',
    label: 'remove(value)',
    group: 'Remove',
    value: true,
    description: 'Girilen değerin ilk eşleşmesini sil.',
  },
  {
    id: 'clear',
    label: 'clear()',
    group: 'Remove',
    description: 'Listeyi boşalt. Reset ile aynı işlem değildir.',
  },
  {
    id: 'get',
    label: 'get(index)',
    group: 'Read & Update',
    index: true,
    description: 'Seçtiğin Node’un data değerini oku.',
  },
  {
    id: 'getFirst',
    label: 'getFirst()',
    group: 'Read & Update',
    description: 'İlk Node’un data değerini oku.',
  },
  {
    id: 'getLast',
    label: 'getLast()',
    group: 'Read & Update',
    description: 'Son Node’un data değerini oku.',
  },
  {
    id: 'set',
    label: 'set(index, value)',
    group: 'Read & Update',
    value: true,
    index: true,
    description: 'Node’un data değerini değiştir; bağlantıları koru.',
  },
  {
    id: 'indexOf',
    label: 'indexOf(value)',
    group: 'Search',
    value: true,
    description: 'İlk eşleşmenin index’ini bul; yoksa -1.',
  },
  {
    id: 'lastIndexOf',
    label: 'lastIndexOf(value)',
    group: 'Search',
    value: true,
    description: 'Son eşleşmeyi bulmak için listeyi sonuna kadar dolaş.',
  },
  {
    id: 'contains',
    label: 'contains(value)',
    group: 'Search',
    value: true,
    description: 'Değerin listede bulunup bulunmadığını öğren.',
  },
];
export const GROUPS = ['Inspect', 'Insert', 'Remove', 'Read & Update', 'Search'];
export const LANGUAGES: { id: Language; label: string; extension: string }[] = [
  { id: 'java', label: 'Java', extension: 'java' },
  { id: 'c', label: 'C', extension: 'c' },
  { id: 'pseudo', label: 'Pseudocode', extension: 'pseudo' },
];
export function infoFor(selection: Selection): FunctionInfo | undefined {
  // Doubly fonksiyonları aynı parametre sözleşmesini kullanır.
  const id =
    selection === 'doublyAddFirst'
      ? 'addFirst'
      : selection === 'doublyIsEmpty'
        ? 'isEmpty'
        : selection === 'doublySize'
          ? 'size'
          : selection;
  return FUNCTIONS.find((f) => f.id === id);
}
