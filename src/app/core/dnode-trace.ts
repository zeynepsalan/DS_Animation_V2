import { DNode } from './dnode';
import type { ExecutionStep, ListSnapshot, Trace } from './execution.types';

/** Constructor atamalarını ayrı immutable adımlar olarak kaydeder. */
export function dnodeTrace(data: string, hasPrev: boolean, hasNext: boolean): Trace<string> {
  // Hazır komşular listeye bağlı değildir; constructor yalnız bu nesneleri gösterir.
  const previous = hasPrev ? new DNode('previous', null, null) : null;
  const following = hasNext ? new DNode('following', null, null) : null;
  // Henüz data atanmayan alan boş gösterilir; bu gerçek kullanıcı data’sı değildir.
  const node = new DNode('', null, null);
  // Her kayıt nesnelerden yeni fotoğraf üretir; sonraki atamalar eski adımı değiştiremez.
  const snapshot = (includeNode: boolean): ListSnapshot<string> => ({
    head: null,
    size: 0,
    nodes: [previous, includeNode ? node : null, following]
      .filter((n): n is DNode<string> => n !== null)
      .map((n) => ({ id: n.id, data: n.data, prev: n.prev?.id ?? null, next: n.next?.id ?? null })),
  });
  // Parametreler ve nesne referansı ayrı isimlerde tutulur.
  const variables = { data, prev: previous?.id ?? null, next: following?.id ?? null };
  const steps: ExecutionStep<string>[] = [];
  // Tek yardımcı her semantik adım için ayrı açıklama ve kod key’i kaydeder.
  const record = (key: string, explanation: string, includeNode = true) =>
    steps.push({
      key,
      explanation,
      variables: { ...variables },
      references: includeNode ? { node: node.id } : {},
      snapshot: snapshot(includeNode),
    });
  record(
    'start',
    'Parametreleri incele. Hazır komşular bağımsız nesnelerdir; henüz yeni DNode yok.',
    false,
  );
  record(
    'constructor',
    'Yeni DNode için nesne oluşturulur. data atanmamıştır; prev ve next başlangıçta null.',
  );
  // Her alan güncellemesinin ardından kendi fotoğrafını alırız.
  node.data = data;
  record('data', 'this.data = data. Girilen veri yalnız data alanına kaydedildi.');
  // Önce geri bağlantı atanır; next bu adımda hâlâ null’dır.
  node.prev = previous;
  record(
    'prev',
    `this.prev = prev. ${previous ? 'Önceki nesneye geri referans kuruldu.' : 'Önceki referans null olarak kaldı.'}`,
  );
  // İleri bağlantı ayrı satır ve ayrı adımla atanır.
  node.next = following;
  record(
    'next',
    `this.next = next. ${following ? 'Sonraki nesneye ileri referans kuruldu.' : 'Sonraki referans null olarak kaldı.'}`,
  );
  // Komşuların ters bağlantıları constructor tarafından değiştirilmez.
  record(
    'return',
    'Constructor tamamlandı. Komşuların bağlantıları otomatik değişmedi; bunları liste algoritması kuracak.',
  );
  return { operation: 'dnode', baseline: steps[0].snapshot, steps, returnValue: node.id };
}
