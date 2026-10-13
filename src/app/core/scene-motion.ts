import { signal } from '@angular/core';
import type { PositionedNode } from './visual-layout';

export interface MotionNode extends PositionedNode { opacity: number }
export type Bindings = Record<string, string | null>;
export interface MotionReference { name: string; target: string; opacity: number }
export const MOTION_MS = 1100;
export const STEP_MS = 1700;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
/** Yumuşak başlangıç/bitiş; her öğe ve ok aynı zaman oranını kullanır. */
export const ease = (t: number) => { t = clamp(t); return t * t * (3 - 2 * t); };

/**
 * Ara pozlar DOM'dan bağımsız hesaplanır. Yer açma / toparlama iki fazlıdır:
 * yükselmeden önce x konumu, geriye dönüşte önce y konumu değiştirilir.
 * Böylece Node'lar birbirinin içinden geçmez.
 */
export function sampleNodes(from: MotionNode[], to: PositionedNode[], progress: number): MotionNode[] {
  const p = clamp(progress);
  const entering = to.some(n => !from.some(old => old.id === n.id));
  const removing = to.some(n => n.detached && from.some(old => old.id === n.id && !old.detached));
  const exiting = from.some(n => !to.some(next => next.id === n.id));
  const closing = to.some(n => from.some(old => old.id === n.id && old.y > n.y && old.x !== n.x));
  const reopening = to.some(n => from.some(old => old.id === n.id && old.y < n.y && old.x !== n.x));
  const poses = to.map(target => {
    const old = from.find(n => n.id === target.id);
    if (!old) return { ...target, opacity: entering ? ease((p - 0.5) / 0.5) : ease(p) };
    let tx = ease(p), ty = tx;
    if (entering) { tx = ease(p / 0.5); ty = tx; }
    else if (removing) {
      ty = ease(p / 0.5);
      tx = ease((p - 0.5) / 0.5);
    } else if (closing) { tx = ease(p / 0.5); ty = ease((p - 0.5) / 0.5); }
    else if (reopening) { ty = ease(p / 0.5); tx = ease((p - 0.5) / 0.5); }
    else if (exiting) { tx = ease((p - 0.4) / 0.6); ty = tx; }
    return { ...target, x: old.x + (target.x - old.x) * tx, y: old.y + (target.y - old.y) * ty,
      opacity: old.opacity + (1 - old.opacity) * ease(p) };
  });
  for (const old of from) if (!to.some(n => n.id === old.id))
    poses.push({ ...old, opacity: old.opacity * (1 - ease(p / 0.4)) });
  return poses;
}

/** Aynı referans başka Node'a geçerken eski ok önce solar, yeni ok sonra belirir. */
export function sampleReferences(from: Bindings, to: Bindings, progress: number): MotionReference[] {
  return [...new Set([...Object.keys(from), ...Object.keys(to)])].flatMap(name => {
    const old = from[name], target = to[name];
    if (old === target) return target ? [{ name, target, opacity: 1 }] : [];
    if (progress < 0.45 && old) return [{ name, target: old, opacity: 1 - ease(progress / 0.45) }];
    return target ? [{ name, target, opacity: ease((progress - 0.45) / 0.55) }] : [];
  });
}

/** Tek RAF saati: Node ve pointer uçları farklı CSS geçiş saatlerine bağlı kalmaz. */
export class SceneMotion {
  readonly nodes = signal<MotionNode[]>([]);
  readonly references = signal<MotionReference[]>([]);
  readonly busy = signal(false);
  private frame = 0;
  private bindings: Bindings = {};

  moveTo(target: PositionedNode[], bindings: Bindings, duration: number) {
    this.stop();
    const from = this.nodes(); const oldBindings = this.bindings;
    this.bindings = bindings;
    if (!duration || typeof requestAnimationFrame === 'undefined') {
      this.nodes.set(target.map(n => ({ ...n, opacity: 1 })));
      this.references.set(sampleReferences(bindings, bindings, 1));
      return;
    }
    // Yerleşim aynı olsa da referansın hedef değişimi kendi fade geçişini yapar.
    this.busy.set(true);
    const start = performance.now();
    const draw = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      this.nodes.set(sampleNodes(from, target, progress));
      this.references.set(sampleReferences(oldBindings, bindings, progress));
      if (progress < 1) this.frame = requestAnimationFrame(draw);
      else {
        this.nodes.set(target.map(n => ({ ...n, opacity: 1 })));
        this.references.set(sampleReferences(bindings, bindings, 1));
        this.busy.set(false);
      }
    };
    this.frame = requestAnimationFrame(draw);
  }
  stop() { if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.frame); this.busy.set(false); }
}
