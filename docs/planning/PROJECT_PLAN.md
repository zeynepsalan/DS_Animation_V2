# Geliştirmeye devam planı — öneri

Durum: 2026-11-16 planlama taslağı; kullanıcı tarafından henüz kabul edilmiş geliştirme sırası veya yeni kapsam kararı değildir. Kullanıcının geliştirmeye başlama isteği önceki bekleme durumundan sonra planlama başlatır; ürün uygulaması bu belgeyle başlamış sayılmaz. [Mimari envanter](ARCHITECTURE.md), [kaynak haritası](SOURCE_MAP.md), [UML](../UML.md), [geçerli kararlar](../../DECISIONS/README.md).

## Başlangıç gerçeği

Node, DNode ve üç bağlı liste kaynakta vardır; Array henüz yoktur. Dolayısıyla [DEC-0021](../../DECISIONS/product/DEC-0021-circular-priority.md) gereğince sonraki temel sabit kapasiteli Array'dir. Bu kaynak envanteri yeni test veya cihaz gözlemi değildir. Mevcut liste işlevleri ve davranış sözleşmeleri [API](../API.md) ve [proje kuralları](../../ORCHESTRATION/context/PROJECT.md) ile korunur.

## Çalışma biçimi

[DEC-0039](../../DECISIONS/orchestration/DEC-0039-concept-worktrees.md) paralelliği konsept başına ayrı worktree, her biri için gerekli testler ve tek entegrasyon worktree'sinde toplama olarak tanımlar. Paylaşılan trace, registry ve playback sınırları ile bağımlılıklar önce belirlenir; tek dosya tek yazara aittir. Bu karar tüm konuların hemen paralel başlatılması anlamına gelmez; bu görevde worktree oluşturulmadı.

## Fazlar ve teslim kapıları

### P0 — Kapsam ve sözleşme

- **Amaç:** Array işlem kümesi, kapasite girişi ve dolu/boş hata davranışlarını netleştirmek; kaynak haritasından sonraki adayları karara sunmak. Kullanıcının belirlediği temel ve temsil kararları uygulanır; yalnız işlem kümesi ve gerçekten eksik ayrıntılar sorulur.
- **İzinli alan:** plan, mimari, UML ve ilgili karar/görev belgeleri; ürün kodu yok. **Bağımlılık:** kaynak haritası ve mevcut API. **Bittiğinde:** seçilen kapsam ve trace/state sınırı kayıtlı; liste davranışları için regresyon ölçütleri yazılı. **Kontrol:** belge bağlantıları ve kaynak/karar çapraz incelemesi. **Kesin sınır:** Array tabanlı gerçek durum indeksli Array/cell kullanır; Node snapshot’ına zorlanmaz ([DEC-0037](../../DECISIONS/engineering/DEC-0037-array-representation.md)). **Risk:** ortak trace tasarımının bu sınırı ihlal etmesi. **Devir:** kullanıcı kararlarıyla Array entegrasyon briefi.

### P1 — Sabit kapasiteli Array

- **Amaç:** bağımsız Array modeli, indeksli hücre snapshot/trace, örnek kod ve görselleştirme ile mevcut ortak oynatma. **İzinli alan:** atanmış `src/app/core/`, `src/app/components/`, `src/app/education/`, `app.*`, ilgili testler, örnek üretimi ve belgeler; paylaşılan dosyalarda tek yazar. **Bağımlılık:** P0 kararı ve sözleşme. **Bittiğinde:** kapasite sabit, büyüme yok; seçilen işlemler ve sınır durumları, String girdisi, kod/animasyon adım eşleşmesi, bağımsız state ve Reset/iptal çalışır. **Kontrol:** model ve trace testleri, playback regresyonları, build, Java/C örnek export ve doğrulama, masaüstü/mobil gözlemi. **Risk:** ortak snapshot ve state değişiklikleri mevcut listeleri bozabilir. **Devir:** test kanıtı, API/UML ve örnekler güncel.

### P2 — Kaynaklardan sonraki ADT kapsamı ve tasarım

- **Amaç:** [SOURCE_MAP](SOURCE_MAP.md) ile ders kapsamını ve önkoşulları eşleştirip kullanıcının seçeceği sonraki yapılar için işlem ve öğretim sınırlarını belirlemek. Array ve Linked List tabanlı uygulama seçenekleri mevcut karara uygun değerlendirilir. **İzinli alan:** plan/mimari/UML, karar ve görev belgeleri. **Bağımlılık:** P0; P1'in tamamlanması uygulamaya geçiş için gereklidir. **Bittiğinde:** her adayın kaynak dayanağı, seçilmiş kapsamı, bağımlılığı ve kabul ölçütü kayıtlı. **Kontrol:** kaynak incelemesi ve kullanıcı kararı. **Risk:** ders içeriğini otomatik ürün taahhüdü saymak. **Devir:** her yapı için ayrı görev ve dosya sahipliği.

### P3 — Seçilen yapıların artımlı uygulaması

- **Amaç:** kullanıcının seçtiği ADT'leri bağımlılık sırasıyla, küçük işlem grupları halinde geliştirmek. **İzinli alan:** her görev briefinde atanmış model, test, görsel, kod örnekleri ve belgeler. **Bağımlılık:** P1, P2 ve ilgili yapı önkoşulları. **Bittiğinde:** seçilen işlemler ve hata sınırları gerçek algoritma, trace, kod ve görselle aynı sonucu verir; önceki yapıların state ve playback davranışı korunur. **Kontrol:** her grupta ilgili testler/build, `npm run export:examples`, uygun olduğunda `npm run verify:examples`, cihaz gözlemi ve bağımsız inceleme. **Risk:** ortak entegrasyon çatışması ve farklı uygulamalarda davranış sapması. **Devir:** entegre edilmiş kaynak, test ve UML/API kanıtı; sıradaki yapı için güncel sözleşme.

### P4 — Bütünleşik doğrulama ve teslim

- **Amaç:** tüm seçilen kapsamda öğrenme akışını ve regresyonu doğrulamak. **İzinli alan:** ilgili testler, düzeltmeler ve doğrulama belgeleri; dosya sahipliği görev başına belirlenir. **Bağımlılık:** seçilen P3 grupları. **Bittiğinde:** sonuçlar kaynak/build, tarayıcı/cihaz, performans ölçümü, kullanıcı kabulü ve production olarak ayrı raporlanır. **Kontrol:** uygun test/build ve örnek doğrulaması, desteklenen cihazlarda gözlem; performans veya kullanıcı kabulü ölçülmediyse açıkça belirtilir. **Risk:** tarayıcı gözleminin kullanıcı kabulü sayılması. **Devir:** açık kusurlar ve ayrı production onayı gereksinimiyle teslim.

## Ders kaynaklarından önerilen konu sırası

Ayrıntılı sayfa ve kanıt bağlantıları [SOURCE_MAP](SOURCE_MAP.md) içindedir. Bu sıra kapsam taahhüdü değil, karar vermeyi kolaylaştıran bağımlılık önerisidir:

1. Week02 indeksleme ve kaydırma ile sabit Array; dersin dinamik büyümesi mevcut sabit kapasite kararını değiştirmez.
2. Week01/05 Stack (Array ve Singly), Queue (dairesel Array ve bağlı yapı), ardından Deque (dairesel Array ve Doubly). Her temsil için işlem kapsamı ve doluluk kuralları ayrıca seçilir; ders ArrayDeque için tam kod sağlamaz.
3. Week03/04 analiz ve Recursion öğretimi: sayaç ve call frame, Binary Search örneği; bağımsız menü olup olmayacağı karara bağlıdır.
4. Week06 Binary Tree ve traversal; yardımcı Queue/Stack durumu ve call frame gösterimi önceki sınırlarla uyumlu olmalıdır.
5. Week07/09 Priority Queue ve Heap; Array indeksleri, ağaç geometrisi ve karşılaştırma/Entry sözleşmesi gerekir. Sorting örneklerinin ürün konumu ayrıca seçilir.
6. Week10 Map/Hash/Set/Skip List ve Week11/12 BST/AVL/Splay/Red-Black: ortak anahtar ve geometri sözleşmelerinden sonra ayrı dilimler halinde değerlendirilebilir. AVL silme tam onarım izi ve Red-Black silme tam izi verilen kaynaklarda yoktur; ek kaynak ve kabul ölçütü gerektirir. Splay araması durumu değiştirebilir.
7. Graph/Paths/MST için mevcut PDF'ler tam ders kapsamı sağlamaz; Week13/14 veya eşdeğer birincil kaynak ve ürün kararı gelene kadar bekler. Week08 yol haritasında ara sınavdır.

Her ADT'ye otomatik olarak iki temsil atanmaz: Stack, Queue ve Deque için doğal alternatifler açıkken Tree, Heap, Hash ve Skip List için temsil pedagojik yarara göre ayrı seçilir. Ortak trace; mantıksal sıra ile fiziksel slotları, yardımcı state'i, kalıcı görsel kimliği ve mutasyon yapan okumaları doğru kaydetmelidir. Kaynaklardaki tree yükseklik convention farkı seçilen ürün convention'ında açıklanmalıdır.

## Karar bekleyen konular

İki temel yapı, sabit kapasite, gerçek Array/cell temsili ve paralel worktree tanımı karardır; tekrar sorulmaz. Aşağıdaki iki soru, serbest metinle birlikte soru arayüzünde sunulmak üzere hazırlanmıştır; cevap veya onay değildir:

- `planning.arraylist_meaning.v2` r1: `ArrayList (fixed capacity)` bağımsız List implementasyonu mu, tüm Array tabanlı implementasyonların genel adı mı, yoksa fark önce açıklansın mı? İlk seçenek öneridir.
- `planning.initial_scope.v2` r1: önce Array ve seçilen List anlamı, ardından Stack/Queue/Deque mi; yoksa yeterli kaynaklı tüm PDF konuları aşamalı mı? İlk seçenek öneridir. Eksik Graph kaynağı ve tam deletion izleri otomatik kapsama girmez.

Hata davranışı ayrıca sorulmaz: mevcut null/erken return ve anlaşılır Türkçe geri bildirim kuralları geçerlidir. Somut trace API'si ve composition/delegation tasarım ayrıntılarıdır; genel mimarinin yeniden onaylanması istenmez.
