// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { Node } from './node';

// Bu tür, geçerli değerleri derleme sırasında sınırlar; yanlış seçim veya eksik alan erkenden yakalanır.
export type Operation =
  | 'isEmpty'
  | 'size'
  | 'clear'
  | 'addFirst'
  | 'insertAt'
  | 'addLast'
  | 'removeAt'
  | 'removeFirst'
  | 'removeLast'
  | 'indexOf'
  | 'get'
  | 'getFirst'
  | 'getLast'
  | 'set'
  | 'contains'
  | 'lastIndexOf'
  | 'remove'
  | 'traversal';
// Bu tür, geçerli değerleri derleme sırasında sınırlar; yanlış seçim veya eksik alan erkenden yakalanır.
export type Language = 'java' | 'c' | 'pseudo';
// Ortak 18 method adı, Doubly ailesinde ayrı seçim kimliği taşır.
export type DoublyOperation = `doubly${Capitalize<Operation>}`;
// Bu tür, geçerli değerleri derleme sırasında sınırlar; yanlış seçim veya eksik alan erkenden yakalanır.
// Circular işlemler aynı method adlarını ayrı kalıcı listeyle kullanır.
export type CircularOperation = `circular${Capitalize<Operation>}`;
// Explorer her veri yapısını kendi seçim kimliğiyle ayırır.
export type Selection = Operation | DoublyOperation | CircularOperation | 'node' | 'dnode';
// Bu interface nesnenin hangi alanları taşıyacağını derleyiciye söyler; çalışma anında sınıf oluşturmaz.
export interface NodeSnapshot<T> {
  // Adımlar arasında aynı nesneyi izleten görsel kimlik; bu alan kayıt sözleşmesinin parçasıdır.
  id: string;
  // data hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  data: T;
  // next hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  next: string | null;
  // DNode snapshot’ında geri bağlantı da ayrı tutulur.
  prev?: string | null;
}
// Bu interface nesnenin hangi alanları taşıyacağını derleyiciye söyler; çalışma anında sınıf oluşturmaz.
export interface ListSnapshot<T> {
  // Listenin ilk nesnesini gösteren referans; bu alan kayıt sözleşmesinin parçasıdır.
  head: string | null;
  // Doubly listede son nesneye doğrudan erişim bulunur.
  tail?: string | null;
  // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon; bu alan kayıt sözleşmesinin parçasıdır.
  nodes: NodeSnapshot<T>[];
  // size hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  size: number;
}
// Bu tür, geçerli değerleri derleme sırasında sınırlar; yanlış seçim veya eksik alan erkenden yakalanır.
export type Variables = Record<string, string | number | boolean | null>;
// Bu tür, geçerli değerleri derleme sırasında sınırlar; yanlış seçim veya eksik alan erkenden yakalanır.
export type References<T> = Record<string, Node<T> | null>;
// Bu interface nesnenin hangi alanları taşıyacağını derleyiciye söyler; çalışma anında sınıf oluşturmaz.
export interface ExecutionStep<T> {
  // key hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  key: string;
  // explanation hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  explanation: string;
  // Öğretici kartta gösterilen yerel değişkenler; bu alan kayıt sözleşmesinin parçasıdır.
  variables: Variables;
  // Değişken isimlerini gerçek nesne kimlikleriyle eşleyen referanslar; bu alan kayıt sözleşmesinin parçasıdır.
  references: Record<string, string | null>;
  // Nesnelerden bağımsız, belirli bir adımı geri yükleyebilen liste fotoğrafı; bu alan kayıt sözleşmesinin parçasıdır.
  snapshot: ListSnapshot<T>;
  // result hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  result?: string;
  // error hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  error?: boolean;
}
// Bu tür, geçerli değerleri derleme sırasında sınırlar; yanlış seçim veya eksik alan erkenden yakalanır.
export type StepObserver<T> = (step: ExecutionStep<T>) => void;
// Bu interface nesnenin hangi alanları taşıyacağını derleyiciye söyler; çalışma anında sınıf oluşturmaz.
export interface Parameters {
  // value hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  value?: string;
  // Kullanıcının seçtiği, sıfırdan başlayan hedef konum; bu alan kayıt sözleşmesinin parçasıdır.
  index?: number;
}
// Bu interface nesnenin hangi alanları taşıyacağını derleyiciye söyler; çalışma anında sınıf oluşturmaz.
export interface Trace<T> {
  // operation hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  operation: Operation | DoublyOperation | CircularOperation | 'dnode';
  // Reset veya iptal için korunan işlem başlangıç listesi; bu alan kayıt sözleşmesinin parçasıdır.
  baseline: ListSnapshot<T>;
  // steps hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  steps: ExecutionStep<T>[];
  // returnValue hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  returnValue: unknown;
  // error hesabında kullanılan ara değer; bu alan kayıt sözleşmesinin parçasıdır.
  error?: string;
}
