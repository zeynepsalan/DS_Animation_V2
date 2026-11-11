// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
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
// Ortak SVG ikon bileşenini getirir; kontroller için aynı çizim sistemi kullanılır.
import { UiIcon } from './ui-icon';
// Fonksiyon imza, parametre, grup ve açıklamalarını ortak katalogdan getirir.
import { LANGUAGES } from '../education/catalog';
// Doubly seçim kimliği ve satır üretimi yardımcılarını paylaşır.
import { isDoubly, doublyName } from '../education/doubly-code';
// Circular dosyası aynı adlı diğer method'lardan yapı adıyla ayrılır.
import { isCircular, circularName } from '../education/circular-code';
// Kod paneli ve indirilebilir örneklerin aynı satır kaynağını getirir.
import { codeFor } from '../education/code-documents';
// Yalnız derleyicide kullanılan tür sözleşmelerini getirir; bu import çalışma anında kod yüklemez.
import type { Language, Selection } from '../core/execution.types';

@Component({
  // Bu isim, bileşenin HTML içinde hangi etiketle kullanılacağını belirler.
  selector: 'app-codebar',
  // Bu bağımsız bileşenin şablonda kullanacağı Angular araçlarını ve alt bileşenleri tanıtır.
  imports: [UiIcon],
  // OnPush ile Angular giriş veya signal değişikliklerini izler; gereksiz görünüm kontrollerini azaltır.
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Bu HTML şablonunda süslü parantezler metni, köşeli parantezler değerleri, normal parantezler olayları bağlar.
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
        <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
        @for (lang of languages; track lang.id) {
          <!-- Click olayı ilgili işleyiciyi çağırır; disabled bağı koşula göre kullanıcı ve klavye eylemini engeller. -->
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
      <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
      @for (line of lines(); track $index) {
        <div
          class="code-line"
          [class.highlighted]="isActive(line.key, $index)"
          [attr.aria-current]="isActive(line.key, $index) ? 'step' : null"
        >
          <span class="line-number">{{ $index + 1 }}</span>
          <code>
            <!-- Angular @for koleksiyonu çizer; track anahtarı aynı nesnenin DOM kimliğini koruyarak animasyonun kesilmesini önler. -->
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
  // Üst bileşen bu girdiyi vermek zorundadır; input signal’ı okunurken fonksiyon gibi çağrılır.
  readonly selection = input.required<Selection>();
  // Üst bileşen bu girdiyi vermek zorundadır; input signal’ı okunurken fonksiyon gibi çağrılır.
  readonly language = input.required<Language>();
  // activeKey hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly activeKey = input<string | null>(null);
  // Alt bileşenin üst bileşene göndereceği olayı tanımlar; emit çağrısı olayı bildirir.
  readonly languageChange = output<Language>();
  // languages hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  readonly languages = LANGUAGES;
  // lines hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly lines = computed(() => codeFor(this.selection(), this.language()));
  // filename hesabında kullanılan ara değer diğer signal değerlerinden türetilir; computed sonucu önbellekte tutar ve bağımlılık değişince yeniden hesaplar.
  readonly filename = computed(() => {
    // Veri yapısı adı, aynı method adını kullanan iki dosyayı ayırt eder.
    const selection = this.selection();
    // İsimden gerekli prefix veya dil bilgisini ayırır; kullanıcıya gerçek method adı gösterilir.
    const name = isCircular(selection) ? `CircularLinkedlist / ${circularName(selection)}` : isDoubly(selection)
      ? `DoublyLinkedlist / ${doublyName(selection)}`
      : selection === 'node'
        ? 'Node'
        : selection === 'dnode'
          ? 'DNode'
          : selection;
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return `${name}.${LANGUAGES.find((language) => language.id === this.language())!.extension}`;
  });
  // HTML’de # ile adlandırılan elemanı render sonrasında bulur; gerçek DOM ölçüsü buradan okunur.
  readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  // Bu sınıf örneği oluşturulunca bir kez çalışır; başlangıç bağımlılıkları veya gözlemcileri burada hazırlanır.
  constructor() {
    // Highlight görünür alandan çıkınca yalnızca editörün iç kaydırmasını değiştiririz.
    afterRenderEffect(() => {
      // this.activeKey çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.activeKey();
      // this.language çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      this.language();
      // İç kaydırmanın ait olduğu HTML kapsayıcısını bulur; sayfa kaydırması değişmez.
      const container = this.scroller()?.nativeElement;
      // Aktif kod satırını veya dönüştürülecek satır kaydını seçer.
      const line = container?.querySelector<HTMLElement>('.highlighted');
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (container && line) {
        // Satırın kapsayıcı içindeki dikey konumunu hesaplar; görünür aralıkla karşılaştırılır.
        const top =
          line.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop;
        // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
        if (
          top < container.scrollTop ||
          top + line.offsetHeight > container.scrollTop + container.clientHeight
        )
          // Bu atamayla container.scrollTop güncellenir; sonraki satır yeni değeri kullanır.
          container.scrollTop = Math.max(0, top - container.clientHeight / 2);
      }
    });
  }
  // Adım key’ini kod satırıyla eşler; yalnız doğru satırı highlight eder.
  isActive(key: string | undefined, index: number) {
    // remove(value) iki farklı return içerir. Varsayılan son return, bulunamadığında ilk return.
    if (!key || key !== this.activeKey()) return false;
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return index === this.lines().findIndex((line) => line.key === key);
  }
  // Kod metnini keyword, yorum, sayı ve normal metin parçalarına ayırır.
  tokenize(text: string): { text: string; kind: string }[] {
    // Keyword, sayı ve yorum parçalarını yakalayacak metin desenini hazırlar.
    const regex =
      /("(?:\\.|[^"\\])*"|\/\/.*$|\b(?:public|class|return|if|else|while|new|int|boolean|bool|void|const|struct|typedef|FUNCTION|RETURN|IF|WHILE|END|CLASS|NULL|null|true|false)\b|\b\d+\b)/g;
    // Editörde farklı renkte gösterilecek metin parçalarını sırayla biriktirir.
    const tokens: { text: string; kind: string }[] = [];
    // En son işlenen konumu veya kaydı saklar; aradaki normal metin ve final sonuç kaybolmaz.
    let last = 0;
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const match of text.matchAll(regex)) {
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (match.index > last) tokens.push({ text: text.slice(last, match.index), kind: '' });
      // token hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const token = match[0];
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
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
      // Bu atamayla last güncellenir; sonraki satır yeni değeri kullanır.
      last = match.index + token.length;
    }
    // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
    if (last < text.length) tokens.push({ text: text.slice(last), kind: '' });
    // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
    return tokens;
  }
}
