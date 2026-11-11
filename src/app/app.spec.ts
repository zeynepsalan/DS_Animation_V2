// Bileşen, signal ve yaşam döngüsü araçları Angular’dan gelir; görünümü bu araçlarla yönetiriz.
import { TestBed } from '@angular/core/testing';
// Test tanımları ve beklentiler Vitest ile çalışır; algoritma ve görünüm hataları burada yakalanır.
import { beforeEach, describe, expect, it } from 'vitest';
// Bu dosyanın kullandığı model veya yardımcı, ayrı modülden alınır; aynı mantık tekrar yazılmaz.
import { App } from './app';
// Sidebar bileşeni Explorer ağacını ve fonksiyon seçimi olayını gösterir.
import { Sidebar } from './components/sidebar';
// Bu dosyanın kullandığı model veya yardımcı, ayrı modülden alınır; aynı mantık tekrar yazılmaz.
import { By } from '@angular/platform-browser';
// Singly sahnesi Node/next çizimini, referansları ve Fit ölçüsünü yönetir.
import { Visualization, SCENE_MOTION_ENABLED } from './components/visualization';

// Test ortamını gerçek Angular bileşen ve bağımlılıklarıyla hazırlar; verilen provider test davranışını seçer.
describe('Çalışma ekranı', () => {
  // Template testleri deterministik kalır; hareket geometrisi ayrı testlerde örneklenir.
  beforeEach(() =>
    TestBed.configureTestingModule({
      // Angular’ın uygulama veya test boyunca oluşturup paylaşacağı servisleri tanımlar.
      providers: [{ provide: SCENE_MOTION_ENABLED, useValue: false }],
    }),
  );
  // Gerçek template seçim, highlight ve yalnız tail referansını aynı anda doğrular.
  it('Circular dosyalarını Doubly altına koyar; aynı listede çalışır ve head göstermez', async () => {
    // Ortak kök bileşen gerçek servisleriyle oluşturulur.
    const fixture = TestBed.createComponent(App);
    // İlk render signal bağlantılarını kurar.
    await fixture.whenStable();
    // Bileşenin public olayları gerçek UI ile aynı yolu kullanır.
    const app = fixture.componentInstance;
    // Test gerçek DOM üstünden dosya seçer.
    const root = fixture.nativeElement as HTMLElement;
    // Folder sırası kullanıcının istediği şekilde sabittir.
    expect([...root.querySelectorAll('app-sidebar .folder')].map(node => node.textContent)).toEqual([
      expect.stringContaining('Singly Linkedlist'), expect.stringContaining('Doubly Linkedlist'), expect.stringContaining('Circular Linkedlist'), expect.stringContaining('Array'),
    ]);
    // Circular bütün method dosyalarını sunar.
    expect(root.querySelectorAll('app-sidebar .file[aria-label^="Circular"]').length).toBe(18);
    // Gerçek dosya tıklaması Circular state'ini seçer.
    root.querySelector<HTMLButtonElement>('[aria-label="Circular addLast(value)"]')!.click();
    // İşlem verisi formdaki model alanına verilir.
    app.value = 'A';
    // Run normal form işleyicisini kullanır.
    app.run();
    // Otomatik saat durdurulur; kayıtlar deterministik tamamlanır.
    app.player.pause();
    // Bütün gerçek algoritma kayıtları ilerletilir.
    while (!app.player.atEnd()) app.player.next();
    // Signal güncellemelerinin DOM'a yansıması beklenir.
    await fixture.whenStable();
    // Head yerine yalnız tail çizilmelidir.
    expect(root.querySelector('[data-reference="head"]')).toBeNull();
    // Tail gerçek tek Node'u gösterir.
    expect(root.querySelector('[data-reference="tail"]')).not.toBeNull();
    // Kodla animasyonun bir tek aktif satırı vardır.
    expect(root.querySelectorAll('.code-line.highlighted').length).toBe(1);
    // Doğru tam kaynak indirilebilir olmalıdır.
    expect(root.querySelector('.source-download')?.getAttribute('href')).toBe('/examples/CircularLinkedlist.java');
    // Fonksiyon değiştirmek tamamlanan halkayı korur.
    app.select('circularTraversal');
    // Yeni işlem aynı state üzerinde başlar.
    app.run(); app.player.pause();
    // Gerçek traversal kayıtları tamamlanır.
    while (!app.player.atEnd()) app.player.next();
    // Sonuç diğer listelerden veri almaz.
    expect(app.player.trace()?.returnValue).toEqual(['A']);
    // Render tamamlanınca tekrar tek highlight kontrol edilir.
    await fixture.whenStable();
    // C/Pseudocode dil değişimi de aynı semantik anahtarı vurgular.
    app.language.set('c'); await fixture.whenStable();
    // Dil değişince aktif satır kaybolmamalıdır.
    expect(root.querySelectorAll('.code-line.highlighted').length).toBe(1);
    // Ayrı Singly listesi boş kalır.
    expect(app.player.list().size).toBe(0);
    // Timer ve RAF işlemleri test sonunda temizlenir.
    fixture.destroy();
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('açık Sidebar yanında şerit oluşturmaz ve kapalıyken açma kontrolünü korur', async () => {
    // Açık durumda logo ve kontrol yalnız Sidebar içinde bulunur.
    const fixture = TestBed.createComponent(App);
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // root hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const root = fixture.nativeElement as HTMLElement;
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.closed-rail')).toBeNull();
    // root.querySelector<HTMLButtonElement>('app-sidebar .sidebar-toggle')!.click çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    root.querySelector<HTMLButtonElement>('app-sidebar .sidebar-toggle')!.click();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Kapalı durumda erişilebilir açma kontrolü logo altındaki dar şeritte kalır.
    const openButton = root.querySelector<HTMLButtonElement>('.closed-rail .sidebar-toggle')!;
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(openButton.getAttribute('aria-expanded')).toBe('false');
    // openButton.click çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    openButton.click();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Tekrar açılınca boş sol sütun kaldırılır ve iç kontrol kullanılabilir kalır.
    expect(root.querySelector('.closed-rail')).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('app-sidebar .sidebar-toggle')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    // Test bileşenini kapatır; yaşam döngüsü temizliği ve zamanlayıcı iptali çalışır.
    fixture.destroy();
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('oynatma kısayolları adımları yönetir ve parametre yazımını korur', async () => {
    // Gerçek butonların guard kurallarıyla aynı klavye yolunu çalıştırırız.
    const fixture = TestBed.createComponent(App);
    // app hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const app = fixture.componentInstance;
    // app.select çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.select('addFirst');
    // Bu atamayla app.value güncellenir; sonraki satır yeni değeri kullanır.
    app.value = 'A';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    app.player.pause();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // root hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const root = fixture.nativeElement as HTMLElement;
    // Sağ ok bir sonraki adıma, sol ok önceki adıma döner.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.cursor()).toBe(1);
    // document.dispatchEvent çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.cursor()).toBe(0);
    // Input üzerinde yazılan R ve ok tuşları liste oynatmasını etkilemez.
    const input = root.querySelector('input')!;
    // input.dispatchEvent çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.cursor()).toBe(0);
    // Space duraklatma/oynatma durumunu değiştirir; R başlangıca döner.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.playing()).toBe(true);
    // document.dispatchEvent çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.playing()).toBe(false);
    // document.dispatchEvent çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // document.dispatchEvent çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true }));
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.cursor()).toBe(0);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('[aria-label="Next Step"]')?.getAttribute('title')).toContain('→');
    // Test bileşenini kapatır; yaşam döngüsü temizliği ve zamanlayıcı iptali çalışır.
    fixture.destroy();
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('DNode constructor atamalarını ayrı kod satırlarında ve ayrı sahnede gösterir', async () => {
    // Constructor kullanıcı parametrelerinden hazırlanır; ortak player adımları yönetir.
    const fixture = TestBed.createComponent(App);
    // app hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const app = fixture.componentInstance;
    // app.select çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.select('dnode');
    // Bu atamayla app.nodeValue güncellenir; sonraki satır yeni değeri kullanır.
    app.nodeValue = 'X';
    // Bu atamayla app.dnodePrev güncellenir; sonraki satır yeni değeri kullanır.
    app.dnodePrev = 'previous';
    // Bu atamayla app.dnodeNext güncellenir; sonraki satır yeni değeri kullanır.
    app.dnodeNext = 'next';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    app.player.pause();
    // prev atamasında next henüz null olmalı ve yalnız prev satırı highlight edilmelidir.
    for (let i = 0; i < 3; i++) app.player.next();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // root hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const root = fixture.nativeElement as HTMLElement;
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.highlighted')?.textContent).toContain('this.prev = prev;');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelectorAll('.highlighted')).toHaveLength(1);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelectorAll('app-dnode-visualization .node-shape')).toHaveLength(3);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('[data-dnode="center"]')?.textContent).toContain('∅');
    // Sonraki adım next satırına geçerken eski Singly liste korunur.
    app.player.next();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.highlighted')?.textContent).toContain('this.next = next;');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.list().size).toBe(0);
    // Test bileşenini kapatır; yaşam döngüsü temizliği ve zamanlayıcı iptali çalışır.
    fixture.destroy();
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('Doubly addFirst gerçek formdan çalışır ve head.prev satırına eşleşir', async () => {
    // Her listede kendi kalıcı state ve sahne bulunmalıdır.
    const fixture = TestBed.createComponent(App);
    // app hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const app = fixture.componentInstance;
    // app.select çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.select('doublyAddFirst');
    // Bu atamayla app.value güncellenir; sonraki satır yeni değeri kullanır.
    app.value = 'A';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    app.player.pause();
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!app.player.atEnd()) app.player.next();
    // Bu atamayla app.value güncellenir; sonraki satır yeni değeri kullanır.
    app.value = 'B';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    app.player.pause();
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (let i = 0; i < 4; i++) app.player.next();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // root hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const root = fixture.nativeElement as HTMLElement;
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.highlighted')?.textContent).toContain('head.prev = node;');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelectorAll('.highlighted')).toHaveLength(1);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelectorAll('app-doubly-visualization .node-shape')).toHaveLength(2);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(
      root.querySelector('app-doubly-visualization .canvas-scroll')?.classList.contains('auto-fit'),
    ).toBe(true);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.signature-prefix')?.textContent).toContain('public void addFirst');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.source-download')?.getAttribute('href')).toContain(
      'DoublyLinkedlist.java',
    );
    // app.player.reset çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.player.reset();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.doublyList().size).toBe(1);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.list().size).toBe(0);
    // Test bileşenini kapatır; yaşam döngüsü temizliği ve zamanlayıcı iptali çalışır.
    fixture.destroy();
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('Node açılışını ve parametre doğrulamasını gerçek template ile gösterir', async () => {
    // fixture hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const fixture = TestBed.createComponent(App);
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // root hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const root = fixture.nativeElement as HTMLElement;
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.sidebar-brand')).not.toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('header')).toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelectorAll('app-sidebar button').length).toBeGreaterThan(18);
    // app hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const app = fixture.componentInstance;
    // app.select çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.select('insertAt');
    // Bu atamayla app.value güncellenir; sonraki satır yeni değeri kullanır.
    app.value = 'merhaba';
    // Bu atamayla app.index güncellenir; sonraki satır yeni değeri kullanır.
    app.index = '-1';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('tam sayı');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.trace()).toBeNull();
    // Bu atamayla app.index güncellenir; sonraki satır yeni değeri kullanır.
    app.index = '0';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    app.player.pause();
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!app.player.atEnd()) app.player.next();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.list().nodes[0].data).toBe('merhaba');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.node-value')?.textContent?.trim()).toBe('merhaba');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelectorAll('.highlighted').length).toBe(1);
    // Test bileşenini kapatır; yaşam döngüsü temizliği ve zamanlayıcı iptali çalışır.
    fixture.destroy();
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('ok hedefi değiştiğinde SVG öğesini korur ve zoom listeyi değiştirmez', async () => {
    // fixture hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const fixture = TestBed.createComponent(App);
    // app hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const app = fixture.componentInstance;
    // app.select çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.select('addFirst');
    // Bu atamayla app.value güncellenir; sonraki satır yeni değeri kullanır.
    app.value = 'A';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    app.player.pause();
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!app.player.atEnd()) app.player.next();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // root hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const root = fixture.nativeElement as HTMLElement;
    // Üretilecek kod metnini veya okun başlangıç portunu saklar.
    const source = app.player.list().head!;
    // arrow hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const arrow = root.querySelector(`.pointer-path[data-source="${source}"]`);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(arrow?.getAttribute('data-target')).toBe('null');
    // app.select çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.select('addLast');
    // Bu atamayla app.value güncellenir; sonraki satır yeni değeri kullanır.
    app.value = 'B';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    app.player.pause();
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!app.player.atEnd()) app.player.next();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector(`.pointer-path[data-source="${source}"]`)).toBe(arrow);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(arrow?.getAttribute('data-target')).not.toBe('null');
    // Reset veya iptal için korunan işlem başlangıç listesi bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const baseline = app.player.list();
    // visual hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const visual = fixture.debugElement.query(By.directive(Visualization))
      .componentInstance as Visualization;
    // oldZoom hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const oldZoom = visual.zoom();
    // visual.zoomIn çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    visual.zoomIn();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(visual.zoom()).toBeGreaterThan(oldZoom);
    // visual.zoomOut çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    visual.zoomOut();
    // visual.fit çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    visual.fit();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.list()).toEqual(baseline);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.editor-column .function-signature')?.textContent).toContain(
      'public void addLast',
    );
    // Test bileşenini kapatır; yaşam döngüsü temizliği ve zamanlayıcı iptali çalışır.
    fixture.destroy();
  });
  // Test senaryosunu veya hazırlık/temizlik adımını tanımlar; uygulama çalışırken bu kod yürütülmez.
  it('Explorer araması listeyi ve seçili işlemi değiştirmeden dosyaları filtreler', async () => {
    // Gerçek component ağacı üzerinden arama ve controls yerleşimi kontrol edilir.
    const fixture = TestBed.createComponent(App);
    // app hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const app = fixture.componentInstance;
    // Paylaşılan listeye bir eleman ekleyip işlemi tamamlarız.
    app.select('addFirst');
    // Bu atamayla app.value güncellenir; sonraki satır yeni değeri kullanır.
    app.value = 'metin';
    // app.run çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    app.run();
    // Yeni manuel işlemden önce otomatik oynatmayı durdurur; iki kontrol aynı anda ilerlemez.
    app.player.pause();
    // Koşul sağlandıkça dolaşmayı sürdürür; null, hedef index veya break satırı döngüyü sonlandırır.
    while (!app.player.atEnd()) app.player.next();
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Liste snapshot'ını saklamak aramanın algoritma state'ine dokunmadığını doğrular.
    const baseline = app.player.list();
    // Input metni seçildiğinde native select olayı dış component'in işlem seçimini tetiklememelidir.
    const searchInput = (fixture.nativeElement as HTMLElement).querySelector(
      '.sidebar-search input',
    )!;
    // searchInput.dispatchEvent çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
    searchInput.dispatchEvent(new Event('select', { bubbles: true }));
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.selection()).toBe('addFirst');
    // sidebar hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const sidebar = fixture.debugElement.query(By.directive(Sidebar)).componentInstance as Sidebar;
    // Büyük harf ve çevre boşlukları normalizasyon ile arama sonucunu etkilemez.
    sidebar.query.set(' REMOVE ');
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // root hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
    const root = fixture.nativeElement as HTMLElement;
    // Remove araması her veri yapısında dört dosyayı getirir.
    expect(root.querySelectorAll('app-sidebar .file[aria-label^="Doubly"]').length).toBe(4);
    // Aynı arama Circular ailesinin de dört silme dosyasını getirir.
    expect(root.querySelectorAll('app-sidebar .file[aria-label^="Circular"]').length).toBe(4);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelectorAll('app-sidebar .file:not([aria-label^="Doubly"]):not([aria-label^="Circular"])').length).toBe(4);
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.selection()).toBe('addFirst');
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(app.player.list()).toBe(baseline);
    // Playback aynı method kartında bulunur; görsel panelde ikinci kopyası yoktur.
    expect(root.querySelector('.operation-form .playback')).not.toBeNull();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.visual-panel .playback')).toBeNull();
    // Eşleşmeyen sorgu hata atmadan boş sonuç mesajı gösterir.
    sidebar.query.set('bulunmayan');
    // Angular’ın bekleyen render işlerinin tamamlanmasını bekler; test güncel DOM’u kontrol eder.
    await fixture.whenStable();
    // Bu senaryoda gerçek sonucu beklenen sözleşmeyle karşılaştırır; sapmada test başarısız olur.
    expect(root.querySelector('.search-empty')?.textContent).toContain('Eşleşen fonksiyon yok');
    // Test bileşenini kapatır; yaşam döngüsü temizliği ve zamanlayıcı iptali çalışır.
    fixture.destroy();
  });
});
