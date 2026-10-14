import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { UiIcon } from './ui-icon';
import { LANGUAGES } from '../education/catalog';
import { isDoubly, doublyName } from '../education/doubly-code';
import { codeFor } from '../education/code-documents';
import type { Language, Selection } from '../core/execution.types';

@Component({
  selector: 'app-codebar',
  imports: [UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="editor-tab">
      <span class="file-icon">{{
        language() === 'java' ? 'J' : language() === 'c' ? 'C' : '≡'
      }}</span
      >{{ filename() }}<span class="muted tab-close"><app-icon name="close" /></span>
    </div>
    <div class="editor-toolbar">
      <!-- Dosya konumu üst barda gösterildiğinden burada yalnız kod dili seçilir. -->
      <div class="language-tabs" aria-label="Kod dili">
        @for (lang of languages; track lang.id) {
          <button
            [class.active]="language() === lang.id"
            [attr.aria-pressed]="language() === lang.id"
            (click)="languageChange.emit(lang.id)"
          >
            {{ lang.label }}
          </button>
        }
      </div>
    </div>
    <div #scroller class="code-scroll" tabindex="0" aria-label="Kod örneği">
      @for (line of lines(); track $index) {
        <div
          class="code-line"
          [class.highlighted]="isActive(line.key, $index)"
          [attr.aria-current]="isActive(line.key, $index) ? 'step' : null"
        >
          <span class="line-number">{{ $index + 1 }}</span>
          <code>
            @for (token of tokenize(line.text); track $index) {
              <span [class]="token.kind">{{ token.text }}</span>
            }
          </code>
        </div>
      }
    </div>
    <div class="code-footer">
      <span
        ><span class="blue">●</span>
        {{ selection() === 'node' ? 'Bağımsız sınıf' : 'Kod ve animasyon eş zamanlı' }}</span
      ><span>UTF-8</span>
    </div>
  `,
})
export class Codebar {
  readonly selection = input.required<Selection>();
  readonly language = input.required<Language>();
  readonly activeKey = input<string | null>(null);
  readonly languageChange = output<Language>();
  readonly languages = LANGUAGES;
  readonly lines = computed(() => codeFor(this.selection(), this.language()));
  readonly filename = computed(() => {
    // Veri yapısı adı, aynı method adını kullanan iki dosyayı ayırt eder.
    const selection = this.selection();
    const name = isDoubly(selection)
      ? `DoublyLinkedlist / ${doublyName(selection)}`
      : selection === 'node'
        ? 'Node'
        : selection === 'dnode'
          ? 'DNode'
          : selection;
    return `${name}.${LANGUAGES.find((language) => language.id === this.language())!.extension}`;
  });
  readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  constructor() {
    // Highlight görünür alandan çıkınca yalnızca editörün iç kaydırmasını değiştiririz.
    afterRenderEffect(() => {
      this.activeKey();
      this.language();
      const container = this.scroller()?.nativeElement;
      const line = container?.querySelector<HTMLElement>('.highlighted');
      if (container && line) {
        const top =
          line.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop;
        if (
          top < container.scrollTop ||
          top + line.offsetHeight > container.scrollTop + container.clientHeight
        )
          container.scrollTop = Math.max(0, top - container.clientHeight / 2);
      }
    });
  }
  isActive(key: string | undefined, index: number) {
    // remove(value) iki farklı return içerir. Varsayılan son return, bulunamadığında ilk return.
    if (!key || key !== this.activeKey()) return false;
    return index === this.lines().findIndex((line) => line.key === key);
  }
  tokenize(text: string): { text: string; kind: string }[] {
    const regex =
      /("(?:\\.|[^"\\])*"|\/\/.*$|\b(?:public|class|return|if|else|while|new|int|boolean|bool|void|const|struct|typedef|FUNCTION|RETURN|IF|WHILE|END|CLASS|NULL|null|true|false)\b|\b\d+\b)/g;
    const tokens: { text: string; kind: string }[] = [];
    let last = 0;
    for (const match of text.matchAll(regex)) {
      if (match.index > last) tokens.push({ text: text.slice(last, match.index), kind: '' });
      const token = match[0];
      tokens.push({
        text: token,
        kind: token.startsWith('//')
          ? 'syntax-comment'
          : token.startsWith('"')
            ? 'syntax-string'
            : /^\d+$/.test(token)
              ? 'syntax-number'
              : 'syntax-keyword',
      });
      last = match.index + token.length;
    }
    if (last < text.length) tokens.push({ text: text.slice(last), kind: '' });
    return tokens;
  }
}
