# UML diyagramı

## Durum

2026-10-13: Bu diyagram artık çalışan kaynak kodu yansıtır. Angular ekranı TypeScript sınıflarını çalıştırır; Java/C örnekleri aynı işlem davranışını öğretir. Array henüz uygulanmadı.

## Sınıflar ve ilişkiler

```mermaid
classDiagram
    class App {
        selection: Signal
        language: Signal
        node: Signal
        signature: ComputedSignal
        select(selection)
        run()
        next()
        ngOnDestroy()
    }
    class Sidebar {
        selected: InputSignal
        functionSelected: OutputEmitterRef
        query: Signal
        normalizedQuery: ComputedSignal
        groups: ComputedSignal
        search(event)
        expanded: Signal
        functionsFor(group)
    }
    class Codebar {
        selection: InputSignal
        language: InputSignal
        activeKey: InputSignal
        lines: ComputedSignal
        languageChange: OutputEmitterRef
        tokenize(text)
    }
    class Visualization {
        snapshot: InputSignal
        step: InputSignal
        nodes: Signal
        targetNodes: ComputedSignal
        variables: ComputedSignal
        positionedReferences: ComputedSignal
        path(node)
        viewport: Signal
        autoFit: Signal
        manualZoom: Signal
        zoom: ComputedSignal
        zoomIn()
        zoomOut()
        fit()
    }
    class UiIcon {
        name: InputSignal
        path: ComputedSignal
    }
    class PanelLayout {
        sidebarOpen: Signal
        sidebarWidth: Signal
        codeWidth: Signal
        compact: ComputedSignal
        overlay: ComputedSignal
        effectiveSidebarWidth: ComputedSignal
        effectiveCodeWidth: ComputedSignal
        setViewport(width)
        toggleSidebar()
        resizeSidebar(width)
        resizeCode(width, available)
    }
    class SceneMotion {
        nodes: Signal
        references: Signal
        busy: Signal
        moveTo(nodes, bindings, duration)
        stop()
    }
    class PlaybackService {
        list: Signal
        trace: Signal
        cursor: Signal
        playing: Signal
        speed: Signal
        start(operation, params)
        next()
        previous()
        reset()
        cancelPending()
        play()
        pause()
        setSpeed(value)
    }
    class TraceEngine {
        execute(baseline, operation, params) Trace
    }
    class Trace {
        <<interface>>
        operation
        baseline
        steps
        returnValue
        error
    }
    class ExecutionStep {
        <<interface>>
        key
        explanation
        variables
        references
        snapshot
        result
        error
    }
    class ListSnapshot {
        <<interface>>
        head
        nodes
        size
    }
    class NodeSnapshot {
        <<interface>>
        id
        data
        next
    }
    class SinglyLinkedlist~T~ {
        head: Node
        -count: number
        -observer: StepObserver
        snapshot() ListSnapshot
        fromSnapshot(snapshot, observer)$ SinglyLinkedlist
        isEmpty() boolean
        size() number
        clear() void
        addFirst(value) void
        insertAt(index, value) void
        addLast(value) void
        removeAt(index) T
        removeFirst() T
        removeLast() T
        indexOf(value) number
        get(index) T
        getFirst() T
        getLast() T
        set(index, value) T
        contains(value) boolean
        lastIndexOf(value) number
        remove(value) boolean
        traversal() T[]
    }
    class Node~T~ {
        +constructor(data: T, next: Node|null, id?: string)
        id: string
        data: T
        next: Node
    }
    class VisualGeometry {
        <<module functions>>
        layoutNodes(snapshot, standalone, detachedIndex, context)
        nextPath(node, nodes)
        nextPoints(node, nodes)
        layoutReferences(nodes, references)
        sceneBounds(nodes, references)
        detachedIndexFor(step, operation)
    }
    App *-- Sidebar
    App *-- Codebar
    App *-- Visualization
    App --> PlaybackService : inject
    App --> PanelLayout : inject
    App *-- UiIcon
    Sidebar *-- UiIcon
    Codebar *-- UiIcon
    Visualization *-- UiIcon
    Visualization *-- SceneMotion : interpolates geometry
    App --> Node~T~ : independent preview
    PlaybackService *-- TraceEngine
    PlaybackService --> "0..1" Trace
    PlaybackService --> ListSnapshot : displayed state
    TraceEngine ..> SinglyLinkedlist~T~ : executes on snapshot copy
    Trace --> "1..*" ExecutionStep
    Trace --> ListSnapshot : baseline
    ExecutionStep --> ListSnapshot
    ListSnapshot --> "0..*" NodeSnapshot
    SinglyLinkedlist~T~ --> "0..1" Node~T~ : head
    Node~T~ --> "0..1" Node~T~ : next
    SinglyLinkedlist~T~ ..> ExecutionStep : observer emits
    Codebar ..> ExecutionStep : key highlights code line
    Visualization ..> ExecutionStep : explanation and references
    Visualization ..> VisualGeometry : layout and pointer paths
```

Fonksiyonlar doğrudan değer döndürür. TypeScript'te data dönüşleri T | null, Java'da T, C'de const char * olarak gösterilir. Trace.returnValue yalnızca dönen değeri saklar; error ayrı açıklamadır. Node listeye veya Angular'a bağımlı değildir. id görsel kimliktir, bellek adresi değildir. Liste head ve count tutar; tail saklanmaz.

## Bir işlemin ilerleyişi

```mermaid
sequenceDiagram
    participant User as Kullanıcı
    participant App
    participant Player as PlaybackService
    participant Engine as TraceEngine
    participant List as SinglyLinkedlist
    participant Views as Codebar + Visualization
    User->>App: Parametreleri gir, Run
    App->>App: Girişleri doğrula
    App->>Player: start(operation, params)
    Player->>Player: Yarım işlemi baseline'a geri al
    Player->>Engine: execute(list snapshot)
    Engine->>List: fromSnapshot ve fonksiyon çağrısı
    loop Anlamlı işlem adımları
        List-->>Engine: Observer ile ExecutionStep
    end
    Engine-->>Player: Trace (baseline + steps + returnValue + error)
    Player->>Player: play / next / previous ile cursor değiştir
    Player-->>Views: Aynı ExecutionStep
    User->>Player: Reset
    Player->>Player: baseline, cursor = 0, pause
    Player-->>Views: İşlem öncesindeki liste ve ilk adım
```

Fonksiyon değişimi tamamlanmamış işlemi iptal eder; tamamlanan işlemin listesi korunur. Completed adımından Previous Step ile geri dönülmüşse fonksiyon değişimi yine o işlemin baseline'ına döner.

## Kaynak eşleştirmesi

- `src/app/core/node.ts`: bağımsız Node.
- `src/app/core/singly-linkedlist.ts`: algoritmalar ve observer.
- `src/app/core/execution.types.ts`: snapshot, step, trace ve result sözleşmeleri.
- `src/app/core/trace-engine.ts`: işlemi kayda dönüştürme.
- `src/app/core/playback.service.ts`: ortak liste, oynatma ve geri alma.
- `src/app/components/`: Sidebar, Codebar, Visualization.
- `src/app/education/`: fonksiyon kataloğu ve Java/C/sözde kod satır eşleştirmeleri.

## Kontrol kaydı

- 2026-10-12: Kavramsal taslak oluşturuldu.
- 2026-10-12: Bağımsız Node ve API fonksiyon kapsamı eklendi.
- 2026-10-12: Angular ilk uygulaması, TraceEngine, PlaybackService, gerçek modeller ve panel component'leriyle güncellendi. İleri/geri oynatma ve iptal ilişkileri eklendi.
- 2026-10-12: Kod örnekleri export/doğrulama script'leri ve tests eklendi; uygulama sınıf ilişkilerini değiştirmediği kontrol edildi.

- 2026-10-12: Son HTML biçimlendirmesi, test düzeltmesi ve doğrulama dokümanları sonrası UML ilişkileri gözden geçirildi; sınıf ilişkilerinde değişiklik yok.

- 2026-10-12: Yerel başlatma adresi ve sunucu temizliği kaydı gözden geçirildi; UML ilişkileri değişmedi.

- 2026-10-12: Yerel sunucunun yeniden başlatılması sonrası kontrol edildi; kaynak kod ve UML ilişkileri değişmedi.

- 2026-10-12: Result kaldırıldı; doğrudan dönüşler, App.signature, VisualGeometry modülü, zoom ve viewport alanları gerçek kodla eşleştirildi. Çalıştırma alanı Codebar altında App tarafından yönetilir.

- 2026-10-12: Node id etiket konumu, next eğrisi alt şeridi ve C/Pseudocode Node çağrı imzası güncellendi; sınıf ilişkileri değişmedi.

- 2026-10-12: Zoom sahne wrapper’ı ve CSS scale geçişi eklendi; Visualization sınıf ilişkileri değişmedi.

- 2026-10-12: Sonuç kadrajı ve boş liste adım açıklaması güncellendi; model/component ilişkileri değişmedi.

- 2026-10-12: Codebar görünür satır kaydırma hesabı ve referans tooltip’leri kontrol edildi; UML ilişkileri aynı.

- 2026-10-12: Son doğrulama/screenshot kayıtlarıyla birlikte kontrol edildi; diyagram güncel gerçek kaynak yapısını yansıtıyor.

- 2026-10-13: Node constructor next parametresini açıkça alır; Java/C/Pseudocode örnekleri aynı sözleşmeyi kullanır. Ekleme adımlarını korumak için başlangıçta null gönderilir.

- 2026-10-13: UI yerleşimi gözden geçirildi: App üst barı seçili dosyanın breadcrumb’ını gösterir; ayrı workbench-heading kaldırılmıştır. Codebar yalnız dil seçimi ve IDE’yi sunar; method kartı App içinde aşağıdadır. Visualization içindeki execution-summary, değişken ve açıklama kartlarını 1:3 yan yana gruplar. Mevcut component ilişkileri değişmedi.

- 2026-10-13: Git başlangıcı sırasında UML gözden geçirildi; sürüm kontrolü uygulama sınıflarını veya ilişkilerini değiştirmedi.

- 2026-10-13: GitHub remote ve push kurulumu sonrasında UML kontrol edildi; uygulama sınıfları ve ilişkileri değişmedi.

- 2026-10-13: Referans tasarım revizyonu: Sidebar.query ile ağaç filtrelenir; output functionSelected native input select olayıyla çakışmaz. UiIcon paylaşılan yerel SVG componentidir. App, playback'i method kartında tutar. PanelLayout rail/overlay ve normalize genişlikleri yönetir. SceneMotion gerçek ara node pozlarını üretir; yeni data/next renkleri aynı SVG grubunda uygulanır. Liste algoritması değişmedi.

- Son-adım kamera düzeltmesi: SceneMotion.busy bitmeden trace sahnesinin geniş/yüksek sınırları korunur; Node’lar yerleşince final kamera ölçüsüne geçilir. Component ilişkileri değişmedi.

- 2026-10-13: VisualGeometry pointer port dağıtımı ve sceneBounds kamera sınırlarını sağlar. Visualization.bounds, tüm trace pozları ve hareketli pozlardan türetilir; autoFit sınırları kullanır. Normal sırada düz ok ve canvas sol üst hizası uygulandı. Sınıf ilişkileri değişmedi.

- Canvas ölçümü afterRenderEffect ile gerçek ViewChild elementini izler; ResizeObserver cleanup eski DOM ölçümlerini sonlandırır. UML sınıf ilişkileri değişmedi.

- 2026-10-13: App header yerine activity-rail kullanır; logo ve Sidebar toggle bu şerittedir. PanelLayout SIDEBAR_MAX=240 sınırını uygular, 48px şerit kullanılabilir genişlikten çıkarılır. SVG favicon eklendi; sınıf ilişkileri değişmedi.

- Sidebar.toggle output’u App üzerinden PanelLayout.toggleSidebar() çağırır. Logo/başlık ve search/menu Sidebar içinde gruplanır. VisualGeometry.nextPath, nextPoints koridorlarını radiuslu L/Q path’e dönüştürür; layoutReferences etiketleri koridor dışında tutar. Normal sıra y=122, alt hazırlık satırı y=290. Sınıf ilişkileri değişmedi.

- VisualGeometry.nextPoints, incoming kaynak grubundan her next okunun hedef portunu hesaplar: y=target.y+height×(rank+1)/(count+1). Node veri modeli değişmedi; ayrı portlar yalnız görsel geometridir.

- 2026-10-13: Kalıcı sol şerit App template’indedir; Sidebar.toggle output kaldırıldı. Tek kontrol doğrudan PanelLayout.toggleSidebar() çağırır; aria-expanded durumla eşleşir. Sidebar yalnız başlık, search ve fonksiyon ağacını taşır. Model ve animasyon sınıf ilişkileri değişmedi.

- 2026-10-13: App kapalı Sidebar için conditional rail render eder; açık Sidebar.toggle output yeniden App→PanelLayout.toggleSidebar ilişkisini kullanır. PanelLayout açık durumda rail genişliğini düşmez. Veri modeli/animasyon ilişkileri değişmedi.

- 2026-10-13: App.playbackShortcut(KeyboardEvent), document keydown olayını dinler; editable/disabled guard sonrası mevcut playback button click yoluna yönlendirir. PlaybackService ve veri yapısı sınıfları değişmedi.

## Doubly Linkedlist genişletmesi — taslak (2026-10-14)

DNode sınıfı kaynak koda eklendi; kullanıcı constructor sırasını data, prev, next olarak seçti. DoublyLinkedlist ilk fonksiyon grubuyla uygulandı (isEmpty/size/addFirst). Reverse Traversal kapsamı kullanıcı yanıtını bekler.

```mermaid
classDiagram
    class DoublyLinkedlist {
        head
        tail
        size()
        snapshot()
    }
    class DNode {
        id: string
        data: T
        prev: DNode~T~
        next: DNode~T~
        constructor(data, prev, next, id?)
    }
    DoublyLinkedlist o-- DNode : taslak
    DNode --> DNode : next / prev
```

Ortak playback ve RAF hareket motoru kullanılabilir. Snapshot, model, kod satırı kaynakları ve ok geometrisi prev/tail desteği gerektirir. Her prev/next ataması ayrı öğretici adım olmalı; ara adımlarda henüz karşılıklı bağlanmamış pointer durumları görünür kalmalı. Final durumda head.prev=null, tail.next=null ve komşuların next/prev bağlantıları karşılıklı olmalı. Veri yapısı seçimi fonksiyon seçiminden ayrı tutulmalı; iki listenin durumu birbirine karışmamalı.

## DNode arayüz entegrasyonu (uygulandı, 2026-10-14)

```mermaid
classDiagram
    class DNodeVisualization {
        step: InputSignal
        center: ComputedSignal
        neighbors: ComputedSignal
        variables: ComputedSignal
        neighborX(id)
    }
    class DNodeTraceFactory {
        dnodeTrace(data, hasPrev, hasNext) Trace
    }
    App --> DNodeVisualization : constructor sahnesi
    PlaybackService --> DNodeTraceFactory : startDNode
    DNodeTraceFactory --> DNode : gerçek alan atamaları
    DNodeVisualization --> ExecutionStep : immutable görüntü
    Codebar --> CodeDocuments : DNode ayrı satır ve key
```

DNodeTraceFactory işlev grubunu ifade eder; kaynakta sınıf değil dnodeTrace fonksiyonudur. Trace.operation dnode değerini de alır. NodeSnapshot.prev isteğe bağlıdır; Singly snapshot’larında kullanılmaz. Playback.seek/reset/cancelPending DNode trace’i kalıcı listeye yazmaz. DNode sınıfı ve sahnesi uygulandı; DoublyLinkedlist ilk grubu da uygulandı; kalan fonksiyonlar planlıdır.

## Doubly ilk fonksiyon grubu (uygulandı)

```mermaid
classDiagram
    class DoublyLinkedlist~T~ {
        head: DNode
        tail: DNode
        count: int
        pending: DNode
        snapshot() ListSnapshot
        fromSnapshot(snapshot, observer)
        isEmpty() boolean
        size() int
        addFirst(value) void
    }
    class DoublyVisualization {
        snapshot: InputSignal
        step: InputSignal
        target: ComputedSignal
        references: ComputedSignal
        viewport: Signal
        autoFit: Signal
        moving: OutputEmitterRef
        path(node, direction)
        changeZoom(delta)
    }
    App --> DoublyVisualization
    PlaybackService --> DoublyLinkedlist : doublyTrace factory
    PlaybackService --> ListSnapshot : doublyList signal
    DoublyLinkedlist o-- DNode : head / tail / pending
    DoublyVisualization --> SceneMotion : tek RAF
    DoublyVisualization --> DoublyGeometry : positions / ports
    Codebar --> DoublyCode : dil satırları ve step key
```

DoublyGeometry ve DoublyCode kaynakta saf fonksiyon gruplarıdır. Trace.operation üç Doubly seçim kimliğini destekler; ListSnapshot.tail ve NodeSnapshot.prev eklenir. Playback.restore aktif trace ailesine göre doğru liste signal’ını günceller. Snapshot ziyaretleri iteratif ve kimlik bazlıdır; iki yönlü bağlantılarda döngüye girmez.
