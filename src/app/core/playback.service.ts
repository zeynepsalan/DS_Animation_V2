// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
import { Injectable, computed, signal } from '@angular/core';
// Node ve okların tek RAF saatinden güncellenmesini sağlayan hareket motorunu getirir.
import { STEP_MS } from './scene-motion';
// Angular’dan bağımsız Doubly algoritmaları ve kayıt üretimini getirir.
import { doublyTrace } from './doubly-linkedlist';
// Circular kendi halkasının çalışma kopyasında trace üretir.
import { circularTrace } from './circular-linkedlist';
// DNode constructor atamalarını ayrı immutable adımlar halinde üretir.
import { dnodeTrace } from './dnode-trace';
// Gerçek Singly algoritmasını immutable adım kayıtlarına dönüştüren motoru getirir.
import { TraceEngine } from './trace-engine';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type {
  ListSnapshot,
  Operation,
  Parameters,
  Trace,
  DoublyOperation,
  CircularOperation,
} from './execution.types';

/** signal değer değişince Angular görünümü günceller; computed türetilmiş değer üretir. */
@Injectable({ providedIn: 'root' })
export class PlaybackService {
  // engine hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private readonly engine = new TraceEngine();
  // Singly Linkedlist’in kalıcı liste durumu değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly list = signal<ListSnapshot<string>>({ head: null, size: 0, nodes: [] });
  // İki veri yapısının tamamlanmış durumları birbirine karışmaz.
  readonly doublyList = signal<ListSnapshot<string>>({
    head: null,
    tail: null,
    size: 0,
    nodes: [],
  });
  // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly trace = signal<Trace<string> | null>(null);
  // Circular diğer iki listeyle veri paylaşmaz; yalnız tail kalıcı uçtur.
  readonly circularList = signal<ListSnapshot<string>>({ head: null, tail: null, size: 0, nodes: [] });
  // Gösterilen adımın sıfırdan başlayan sıra numarası değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly cursor = signal(0);
  // Otomatik oynatmanın açık olup olmadığı değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly playing = signal(false);
  // Animasyon ve adım süresini birlikte ölçekleyen hız değişebilir signal olarak tutulur; set/update sonrası görünüm bu değeri yeniden okur.
  readonly speed = signal(1);
  // Cursor konumundaki kod satırı, açıklama ve liste fotoğrafı diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly step = computed(() => this.trace()?.steps[this.cursor()] ?? null);
  // Son adıma ulaşıldığını gösteren durum diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly atEnd = computed(
    () => !!this.trace() && this.cursor() === this.trace()!.steps.length - 1,
  );
  // inProgress hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly inProgress = computed(() => !!this.trace() && this.cursor() > 0 && !this.atEnd());
  // Pause ile iptal edilebilen otomatik ilerleme zamanlayıcısı bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  private timer: ReturnType<typeof setTimeout> | undefined;

  // İşlemi mevcut Singly listeden immutable adım kayıtlarına dönüştürür.
  start(operation: Operation, params: Parameters) {
    // Tamamlanmamış bir işlem yeniden başlatılırsa yalnızca o işlemin etkileri iptal edilir.
    this.cancelPending();
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.trace.set(this.engine.execute(this.list(), operation, params));
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.cursor.set(0);
  }

  // Doubly işlemi kendi kalıcı listesinden trace üretir.
  startDoubly(operation: DoublyOperation, params: Parameters) {
    // this.cancelPending çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.cancelPending();
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.trace.set(doublyTrace(this.doublyList(), operation, params));
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.cursor.set(0);
  }
  // Aynı kontroller Circular işlemi ayrı kalıcı state üzerinden oynatır.
  startCircular(operation: CircularOperation, params: Parameters) {
    // Yeni işleme geçmeden önce yarım kalan işlem başlangıcına dönülür.
    this.cancelPending();
    // Gerçek tail tabanlı algoritmanın immutable kayıtları hazırlanır.
    this.trace.set(circularTrace(this.circularList(), operation, params));
    // Player her işleme ilk kayıttan başlar.
    this.cursor.set(0);
  }
  // Aktif işlem ailesine göre doğru listenin fotoğrafını geri yükler.
  private restore(snapshot: ListSnapshot<string>) {
    // Constructor trace liste değildir; Doubly ve Singly kendi state’ine yazılır.
    const operation = this.trace()?.operation;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (operation === 'dnode') return;
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (operation?.startsWith('circular')) this.circularList.set(snapshot);
    // Diğer aileler kendi kalıcı listesine geri yüklenir.
    else if (operation?.startsWith('doubly')) this.doublyList.set(snapshot);
    else
      /* Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır. */ this.list.set(
        snapshot,
      );
  }

  // Bağımsız constructor önizlemesi liste durumuna dokunmadan ortak player’ı kullanır.
  startDNode(data: string, prev: boolean, next: boolean) {
    // this.cancelPending çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.cancelPending();
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.trace.set(dnodeTrace(data, prev, next));
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.cursor.set(0);
  }

  // Kayıtlı bir sonraki adımı gösterir; algoritmayı ikinci kez çalıştırmaz.
  next() {
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = this.trace();
    // Kayıt veya adım sınırını kontrol eder; olmayan adıma ilerlenmez.
    if (!trace || this.atEnd()) {
      // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
      this.pause();
      // Bu işlem kolunu erken bitirir; aşağıdaki satırlar bu durumda çalışmaz.
      return;
    }
    // this.seek çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.seek(this.cursor() + 1);
    // Kayıt veya adım sınırını kontrol eder; olmayan adıma ilerlenmez.
    if (this.atEnd()) this.pause();
  }

  // Önceki kayıtlı fotoğrafa döner; bağlantıları ters algoritmayla yeniden hesaplamaz.
  previous() {
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    this.pause();
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (this.cursor() > 0) this.seek(this.cursor() - 1);
  }

  // Geçerli adım index’ini cursor ve doğru liste fotoğrafına birlikte uygular.
  private seek(index: number) {
    // İşlem başlamadan üretilen, ileri ve geri okunabilen adım kayıtları bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const trace = this.trace();
    // Kayıt veya adım sınırını kontrol eder; olmayan adıma ilerlenmez.
    if (!trace || index < 0 || index >= trace.steps.length) return;
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.cursor.set(index);
    // Constructor sahnesi Singly Linkedlist’in kalıcı listesi değildir.
    this.restore(trace.steps[index].snapshot);
  }

  // Oynatmayı durdurup mevcut işlemin başlangıç fotoğrafına döner.
  reset() {
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    this.pause();
    // Kayıt veya adım sınırını kontrol eder; olmayan adıma ilerlenmez.
    if (this.trace()) {
      // this.restore çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.restore(this.trace()!.baseline);
      // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
      this.cursor.set(0);
    }
  }

  // Tamamlanmamış işlemi geri alır, listeyi koruyup aktif kayıtları bırakır.
  cancelPending() {
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    this.pause();
    // Kayıt veya adım sınırını kontrol eder; olmayan adıma ilerlenmez.
    if (this.trace() && !this.atEnd()) this.restore(this.trace()!.baseline);
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.trace.set(null);
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.cursor.set(0);
  }

  // Hazırlanmış kayıtları zamanlayıcıyla otomatik ilerletir.
  play() {
    // Kayıt veya adım sınırını kontrol eder; olmayan adıma ilerlenmez.
    if (!this.trace() || this.atEnd()) return;
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.playing.set(true);
    // this.schedule çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    this.schedule();
  }

  // Oynatmayı kapatır ve bekleyen zamanlayıcıyı iptal eder.
  pause() {
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.playing.set(false);
    // Bekleyen zamanlayıcıyı veya kareyi iptal eder; eski callback yeni durumu değiştiremez.
    clearTimeout(this.timer);
  }
  // Mevcut oynatma durumuna göre Play veya Pause seçer.
  toggle() {
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    this.playing() ? this.pause() : this.play();
  }
  // Geçerli hızı kaydeder; aktif oynatmanın zamanlayıcısını yeni hıza uyarlar.
  setSpeed(value: number) {
    // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
    if (!Number.isFinite(value) || value <= 0) return;
    // Signal veya koleksiyonun yeni değerini kaydeder; görünüm sonraki okumada güncel durumu kullanır.
    this.speed.set(value);
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (this.playing()) this.schedule();
  }

  // Hıza bağlı süre dolunca bir adım ilerleyip gerekiyorsa yeni zamanlayıcı kurar.
  private schedule() {
    // Bekleyen zamanlayıcıyı veya kareyi iptal eder; eski callback yeni durumu değiştiremez.
    clearTimeout(this.timer);
    // Bu atamayla this.timer güncellenir; sonraki satır yeni değeri kullanır.
    this.timer = setTimeout(() => {
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (!this.playing()) return;
      // this.next çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.next();
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (this.playing()) this.schedule();
    }, STEP_MS / this.speed());
  }
}
