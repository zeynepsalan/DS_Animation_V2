// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
import { signal } from '@angular/core';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { PositionedNode } from './visual-layout';

// Bu interface nesnenin hangi alanları taşıyacağını derleyiciye söyler; çalışma anında sınıf oluşturmaz.
export interface MotionNode extends PositionedNode {
  opacity: number;
}
// Bu tür, geçerli değerleri derleme sırasında sınırlar; yanlış seçim veya eksik alan erkenden yakalanır.
export type Bindings = Record<string, string | null>;
// Bu interface nesnenin hangi alanları taşıyacağını derleyiciye söyler; çalışma anında sınıf oluşturmaz.
export interface MotionReference {
  name: string;
  target: string;
  opacity: number;
}
// MOTION_MS hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
export const MOTION_MS = 1100;
// STEP_MS hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
export const STEP_MS = 1700;
// clamp hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const clamp = (value: number) => Math.max(0, Math.min(1, value));
/** Yumuşak başlangıç/bitiş; her öğe ve ok aynı zaman oranını kullanır. */
export const ease = (t: number) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

/**
 * Ara pozlar DOM'dan bağımsız hesaplanır. Yer açma / toparlama iki fazlıdır:
 * yükselmeden önce x konumu, geriye dönüşte önce y konumu değiştirilir.
 * Böylece Node'lar birbirinin içinden geçmez.
 */
export function sampleNodes(
  from: MotionNode[],
  to: PositionedNode[],
  progress: number,
): MotionNode[] {
  // Hareket ilerlemesini 0 ile 1 arasında sınırlar; hesaplama uçları aşmaz.
  const p = clamp(progress);
  // Hedef sahnede yeni kimlik olup olmadığını bulur; önce yer açma fazı seçilir.
  const entering = to.some((n) => !from.some((old) => old.id === n.id));
  // Nesnenin silme hazırlığına alınıp alınmadığını bulur; önce dikey hareket yapılır.
  const removing = to.some(
    (n) => n.detached && from.some((old) => old.id === n.id && !old.detached),
  );
  // Hedefte bulunmayan eski nesneyi bulur; kapanmadan önce görünürlüğü azaltılır.
  const exiting = from.some((n) => !to.some((next) => next.id === n.id));
  // Hazırlık satırından dönerken boş slotun kapanacağını bulur; yatay hareket önce yapılır.
  const closing = to.some((n) =>
    from.some((old) => old.id === n.id && old.y > n.y && old.x !== n.x),
  );
  // Previous Step ile hazırlık alanı yeniden açılıyorsa önce dikey yer açma seçilir.
  const reopening = to.some((n) =>
    from.some((old) => old.id === n.id && old.y < n.y && old.x !== n.x),
  );
  // Bu karenin nesne koordinatlarını ve görünürlük oranlarını biriktirir.
  const poses = to.map((target) => {
    // Bir önceki karedeki nesne veya referans hedefini bulur; geçiş buradan başlar.
    const old = from.find((n) => n.id === target.id);
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!old) return { ...target, opacity: entering ? ease((p - 0.5) / 0.5) : ease(p) };
    // Yatay hareketin bu karedeki oranını hesaplar; iki fazlı hareket için dikey orandan ayrıdır.
    let tx = ease(p),
      ty = tx;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (entering) {
      tx = ease(p / 0.5);
      ty = tx;
    } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
      removing
    ) {
      // Bu atamayla ty güncellenir; sonraki satır yeni değeri kullanır.
      ty = ease(p / 0.5);
      // Bu atamayla tx güncellenir; sonraki satır yeni değeri kullanır.
      tx = ease((p - 0.5) / 0.5);
    } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
      closing
    ) {
      /* Bu atamayla tx güncellenir; sonraki satır yeni değeri kullanır. */ tx = ease(p / 0.5);
      /* Bu atamayla ty güncellenir; sonraki satır yeni değeri kullanır. */ ty = ease(
        (p - 0.5) / 0.5,
      );
    } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
      reopening
    ) {
      /* Bu atamayla ty güncellenir; sonraki satır yeni değeri kullanır. */ ty = ease(p / 0.5);
      /* Bu atamayla tx güncellenir; sonraki satır yeni değeri kullanır. */ tx = ease(
        (p - 0.5) / 0.5,
      );
    } else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
      exiting
    ) {
      /* Bu atamayla tx güncellenir; sonraki satır yeni değeri kullanır. */ tx = ease(
        (p - 0.4) / 0.6,
      );
      /* Bu atamayla ty güncellenir; sonraki satır yeni değeri kullanır. */ ty = tx;
    }
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return {
      ...target,
      x: old.x + (target.x - old.x) * tx,
      y: old.y + (target.y - old.y) * ty,
      opacity: old.opacity + (1 - old.opacity) * ease(p),
    };
  });
  // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
  for (const old of from)
    if (!to.some((n) => n.id === old.id))
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      poses.push({ ...old, opacity: old.opacity * (1 - ease(p / 0.4)) });
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return poses;
}

/** Aynı referans başka Node'a geçerken eski ok önce solar, yeni ok sonra belirir. */
export function sampleReferences(
  from: Bindings,
  to: Bindings,
  progress: number,
  relocated: ReadonlySet<string> = new Set(),
): MotionReference[] {
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return [...new Set([...Object.keys(from), ...Object.keys(to)])].flatMap((name) => {
    // Bir önceki karedeki nesne veya referans hedefini bulur; geçiş buradan başlar.
    const old = from[name],
      target = to[name];
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (old === target && !relocated.has(name)) return target ? [{ name, target, opacity: 1 }] : [];
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (progress < 0.45 && old) return [{ name, target: old, opacity: 1 - ease(progress / 0.45) }];
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return target ? [{ name, target, opacity: ease((progress - 0.45) / 0.55) }] : [];
  });
}

/** Tek RAF saati: Node ve pointer uçları farklı CSS geçiş saatlerine bağlı kalmaz. */
export class SceneMotion {
  // Görsel kimliklerle nesnelere veya konumlara erişilen koleksiyon değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly nodes = signal<MotionNode[]>([]);
  // Değişken isimlerini gerçek nesne kimlikleriyle eşleyen referanslar değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly references = signal<MotionReference[]>([]);
  // busy hesabında kullanılan ara değer değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly busy = signal(false);
  // İptal edebilmek için saklanan son animation frame kimliği bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private frame = 0;
  // Bir önceki referans hedefleri; değişen oklar bunlarla karşılaştırılır bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private bindings: Bindings = {};
  // Aynı hedefte etiket portu değişirse görünür sıçramayı fade ile gizleyen göreli yerleşim kayıtları.
  private layoutHints: Record<string, string> = {};

  // Mevcut pozdan hedef pozu tek RAF saatiyle üretir; öğeler aynı hareket oranını paylaşır.
  moveTo(
    target: PositionedNode[],
    bindings: Bindings,
    duration: number,
    hints: Record<string, string> = {},
  ) {
    // Hedefi aynı kalan etiketin portu değiştiğinde eski/yeni yerleşimler arasında sönme kullanılır.
    const relocated = new Set(
      Object.keys(hints).filter(
        (name) => this.layoutHints[name] !== undefined && this.layoutHints[name] !== hints[name],
      ),
    );
    this.layoutHints = hints;
    // this.stop çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.stop();
    // from hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const from = this.nodes();
    const oldBindings = this.bindings;
    // Bu atamayla this.bindings güncellenir; sonraki satır yeni değeri kullanır.
    this.bindings = bindings;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (!duration || typeof requestAnimationFrame === 'undefined') {
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      this.nodes.set(target.map((n) => ({ ...n, opacity: 1 })));
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      this.references.set(sampleReferences(bindings, bindings, 1));
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // Yerleşim aynı olsa da referansın hedef değişimi kendi fade geçişini yapar.
    this.busy.set(true);
    // Hareketin başlangıç zamanını saklar; geçen süre tek RAF saatinden hesaplanır.
    const start = performance.now();
    // Her animation frame’de konum ve opaklığı güncelleyen callback’i hazırlar.
    const draw = (now: number) => {
      // Hareketin sıfır ile bir arasındaki tamamlanma oranı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const progress = Math.min(1, (now - start) / duration);
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      this.nodes.set(sampleNodes(from, target, progress));
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      this.references.set(sampleReferences(oldBindings, bindings, progress, relocated));
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (progress < 1) this.frame = requestAnimationFrame(draw);
      else {
        // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
        this.nodes.set(target.map((n) => ({ ...n, opacity: 1 })));
        // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
        this.references.set(sampleReferences(bindings, bindings, 1));
        // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
        this.busy.set(false);
      }
    };
    // Bu atamayla this.frame güncellenir; sonraki satır yeni değeri kullanır.
    this.frame = requestAnimationFrame(draw);
  }
  // Bekleyen animasyon karesini iptal eder; eski callback yeni sahneyi değiştiremez.
  stop() {
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.frame);
    this.busy.set(false);
  }
}
