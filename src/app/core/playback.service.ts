import { Injectable, computed, signal } from '@angular/core';
import { STEP_MS } from './scene-motion';
import { doublyTrace } from './doubly-linkedlist';
import { dnodeTrace } from './dnode-trace';
import { TraceEngine } from './trace-engine';
import type {
  ListSnapshot,
  Operation,
  Parameters,
  Trace,
  DoublyOperation,
} from './execution.types';

/** signal değer değişince Angular görünümü günceller; computed türetilmiş değer üretir. */
@Injectable({ providedIn: 'root' })
export class PlaybackService {
  private readonly engine = new TraceEngine();
  readonly list = signal<ListSnapshot<string>>({ head: null, size: 0, nodes: [] });
  // İki veri yapısının tamamlanmış durumları birbirine karışmaz.
  readonly doublyList = signal<ListSnapshot<string>>({
    head: null,
    tail: null,
    size: 0,
    nodes: [],
  });
  readonly trace = signal<Trace<string> | null>(null);
  readonly cursor = signal(0);
  readonly playing = signal(false);
  readonly speed = signal(1);
  readonly step = computed(() => this.trace()?.steps[this.cursor()] ?? null);
  readonly atEnd = computed(
    () => !!this.trace() && this.cursor() === this.trace()!.steps.length - 1,
  );
  readonly inProgress = computed(() => !!this.trace() && this.cursor() > 0 && !this.atEnd());
  private timer: ReturnType<typeof setTimeout> | undefined;

  start(operation: Operation, params: Parameters) {
    // Tamamlanmamış bir işlem yeniden başlatılırsa yalnızca o işlemin etkileri iptal edilir.
    this.cancelPending();
    this.trace.set(this.engine.execute(this.list(), operation, params));
    this.cursor.set(0);
  }

  // Doubly işlemi kendi kalıcı listesinden trace üretir.
  startDoubly(operation: DoublyOperation, params: Parameters) {
    this.cancelPending();
    this.trace.set(doublyTrace(this.doublyList(), operation, params));
    this.cursor.set(0);
  }
  private restore(snapshot: ListSnapshot<string>) {
    // Constructor trace liste değildir; Doubly ve Singly kendi state’ine yazılır.
    const operation = this.trace()?.operation;
    if (operation === 'dnode') return;
    if (operation?.startsWith('doubly')) this.doublyList.set(snapshot);
    else this.list.set(snapshot);
  }

  // Bağımsız constructor önizlemesi liste durumuna dokunmadan ortak player’ı kullanır.
  startDNode(data: string, prev: boolean, next: boolean) {
    this.cancelPending();
    this.trace.set(dnodeTrace(data, prev, next));
    this.cursor.set(0);
  }

  next() {
    const trace = this.trace();
    if (!trace || this.atEnd()) {
      this.pause();
      return;
    }
    this.seek(this.cursor() + 1);
    if (this.atEnd()) this.pause();
  }

  previous() {
    this.pause();
    if (this.cursor() > 0) this.seek(this.cursor() - 1);
  }

  private seek(index: number) {
    const trace = this.trace();
    if (!trace || index < 0 || index >= trace.steps.length) return;
    this.cursor.set(index);
    // Constructor sahnesi Singly Linkedlist’in kalıcı listesi değildir.
    this.restore(trace.steps[index].snapshot);
  }

  reset() {
    this.pause();
    if (this.trace()) {
      this.restore(this.trace()!.baseline);
      this.cursor.set(0);
    }
  }

  cancelPending() {
    this.pause();
    if (this.trace() && !this.atEnd()) this.restore(this.trace()!.baseline);
    this.trace.set(null);
    this.cursor.set(0);
  }

  play() {
    if (!this.trace() || this.atEnd()) return;
    this.playing.set(true);
    this.schedule();
  }

  pause() {
    this.playing.set(false);
    clearTimeout(this.timer);
  }
  toggle() {
    this.playing() ? this.pause() : this.play();
  }
  setSpeed(value: number) {
    if (!Number.isFinite(value) || value <= 0) return;
    this.speed.set(value);
    if (this.playing()) this.schedule();
  }

  private schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!this.playing()) return;
      this.next();
      if (this.playing()) this.schedule();
    }, STEP_MS / this.speed());
  }
}
