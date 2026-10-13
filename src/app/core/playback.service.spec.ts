import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaybackService } from './playback.service';

function finish(player: PlaybackService) {
  while (!player.atEnd()) player.next();
}
describe('PlaybackService', () => {
  let player: PlaybackService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    player = TestBed.inject(PlaybackService);
  });
  afterEach(() => {
    player.pause();
    vi.useRealTimers();
  });
  it('farklı fonksiyonları aynı listeyle çalıştırır, Previous ve Reset tam durumu geri getirir', () => {
    player.start('addFirst', { value: 'a' });
    finish(player);
    const baseline = player.list();
    player.start('addLast', { value: 'b' });
    finish(player);
    expect(player.list().size).toBe(2);
    const final = player.list();
    player.previous();
    player.next();
    expect(player.list()).toEqual(final);
    player.reset();
    expect(player.list()).toEqual(baseline);
    expect(player.cursor()).toBe(0);
    finish(player);
    player.start('clear', {});
    finish(player);
    expect(player.list()).toEqual({ head: null, size: 0, nodes: [] });
    player.reset();
    expect(player.list()).toEqual(final);
  });
  it('işlem değişince yalnızca yarım kalan işlemi iptal eder', () => {
    player.start('addFirst', { value: 'a' });
    finish(player);
    const baseline = player.list();
    player.start('addFirst', { value: 'b' });
    player.next();
    player.next();
    player.cancelPending();
    expect(player.list()).toEqual(baseline);
    expect(player.trace()).toBeNull();
    player.start('addLast', { value: 'c' });
    finish(player);
    player.cancelPending();
    expect(player.list().size).toBe(2);
  });
  it('Pause timerı durdurur, hız değişir ve son adımda otomatik durur', () => {
    vi.useFakeTimers();
    player.start('addFirst', { value: 'a' });
    player.play();
    vi.advanceTimersByTime(1700);
    expect(player.cursor()).toBe(1);
    player.pause();
    vi.advanceTimersByTime(10000);
    expect(player.cursor()).toBe(1);
    player.setSpeed(2);
    player.play();
    vi.advanceTimersByTime(850);
    expect(player.cursor()).toBe(2);
    vi.runAllTimers();
    expect(player.atEnd()).toBe(true);
    expect(player.playing()).toBe(false);
    const end = player.cursor();
    player.next();
    expect(player.cursor()).toBe(end);
    player.reset();
    player.previous();
    expect(player.cursor()).toBe(0);
  });
});
