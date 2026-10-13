import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FUNCTIONS, GROUPS } from '../education/catalog';
import type { Selection } from '../core/execution.types';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel-heading"><span>EXPLORER</span><span class="muted">•••</span></div>
    <nav aria-label="Veri yapıları ve fonksiyonlar">
      <div class="tree-root">⌄ <span>DATA STRUCTURES</span></div>
      <button
        class="file node-file"
        [class.selected]="selected() === 'node'"
        (click)="select.emit('node')"
      >
        <span class="file-icon blue">◇</span><span>Node</span><span class="file-tag">class</span>
      </button>
      <button class="folder" [attr.aria-expanded]="expanded()" (click)="expanded.set(!expanded())">
        <span>{{ expanded() ? '⌄' : '›' }}</span
        ><span class="folder-icon">▱</span>Singly Linkedlist
      </button>
      @if (expanded()) {
        @for (group of groups; track group) {
          <div class="tree-group">{{ group }}</div>
          @for (fn of functionsFor(group); track fn.id) {
            <button
              class="file"
              [class.selected]="selected() === fn.id"
              [attr.aria-current]="selected() === fn.id ? 'page' : null"
              (click)="select.emit(fn.id)"
            >
              <span class="file-icon">ƒ</span><span>{{ fn.label }}</span>
            </button>
          }
        }
      }
      <div class="folder future">
        <span>›</span><span class="folder-icon">▱</span>Array<span class="file-tag">Yakında</span>
      </div>
    </nav>
    <div class="sidebar-note">
      <span class="blue">●</span> Her fonksiyon aynı listeden devam eder.
    </div>
  `,
})
export class Sidebar {
  readonly selected = input.required<Selection>();
  readonly select = output<Selection>();
  readonly expanded = signal(true);
  readonly groups = GROUPS;
  functionsFor(group: string) {
    return FUNCTIONS.filter((fn) => fn.group === group);
  }
}
