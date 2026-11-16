# UML — mevcut uygulama ve taslak sınırlar

2026-11-16 kaynak envanteri. Diyagramlar mevcut kaynak ilişkilerinin özetidir; eksiksiz API için [API](API.md), öneri için [mimari](planning/ARCHITECTURE.md) ve [plan](planning/PROJECT_PLAN.md). Aşağıdaki taslak açıkça ayrılmıştır.

## Mevcut sınıflar

```mermaid
classDiagram
    class Node~T~ {
        +id: string
        +data: T
        +next: Node~T~ | null
    }
    class DNode~T~ {
        +id: string
        +data: T
        +prev: DNode~T~ | null
        +next: DNode~T~ | null
    }
    class SinglyLinkedlist~T~ {
        +head: Node~T~ | null
        +snapshot() ListSnapshot~T~
        +insertAt(index, value) void
        +removeAt(index) T | null
        +traversal() T[]
    }
    class DoublyLinkedlist~T~ {
        +head: DNode~T~ | null
        +tail: DNode~T~ | null
        +snapshot() ListSnapshot~T~
        +insertAt(index, value) void
        +removeAt(index) T | null
        +traversal() T[]
    }
    class CircularLinkedlist~T~ {
        +tail: Node~T~ | null
        +snapshot() ListSnapshot~T~
        +insertAt(index, value) void
        +removeAt(index) T | null
        +traversal() T[]
    }
    class ListSnapshot~T~ {
        <<interface>>
        head
        tail optional
        size
        nodes
    }
    class ExecutionStep~T~ {
        <<interface>>
        key
        explanation
        snapshot
        references
        variables
    }
    class Trace~T~ {
        <<interface>>
        operation
        baseline
        steps
        returnValue
    }
    SinglyLinkedlist --> Node : head
    Node --> Node : next
    DoublyLinkedlist --> DNode : head / tail
    DNode --> DNode : prev / next
    CircularLinkedlist --> Node : tail / next halka
    SinglyLinkedlist ..> ExecutionStep : observer
    DoublyLinkedlist ..> ExecutionStep : observer
    CircularLinkedlist ..> ExecutionStep : observer
    Trace --> ExecutionStep : steps
    Trace --> ListSnapshot : baseline
    ExecutionStep --> ListSnapshot : snapshot
```

Diyagram yalnız örnek işlemleri gösterir; üç liste 18 işlemi uygular. Circular `head` saklamaz; snapshot head'i `tail.next` projeksiyonudur. Generic Node, Array önkoşulu değildir. Dönüşler doğrudan değerlerdir; `Result` sınıfı yoktur.

## Mevcut modüller ve akış

```mermaid
flowchart LR
    User[Kullanıcı] --> App[App: seçim / form / çalıştırma]
    App --> Sidebar[Sidebar]
    App --> Codebar[Codebar]
    App --> Views[Visualization / DoublyVisualization / DNodeVisualization]
    App --> Player[PlaybackService]
    Codebar --> Education[education: katalog ve dil satırları]
    Player --> Engine[TraceEngine: Singly]
    Player --> Factories[doublyTrace / circularTrace / dnodeTrace]
    Engine --> Singly[SinglyLinkedlist]
    Factories --> Doubly[DoublyLinkedlist]
    Factories --> Circular[CircularLinkedlist]
    Factories --> DNode[DNode]
    Singly --> Steps[ExecutionStep / ListSnapshot]
    Doubly --> Steps
    Circular --> Steps
    Player --> Steps
    Steps --> Codebar
    Steps --> Views
    Views --> Layout[visual / doubly / circular layout]
    Views --> Motion[SceneMotion]
```

Trace üretimi işlem başında çalışma kopyasında yapılır; player kayıtları cursor ile oynatır. Reset baseline'a döner; tamamlanmamış işlem iptali başlangıcı geri yükler. `PlaybackService` üç listeye ait ayrı kalıcı snapshot tutar. Kod anahtarları, görsel ve açıklama aynı adımla ilerler.

## Taslak — Array entegrasyonu

```mermaid
flowchart LR
    ArrayModel[Sabit kapasiteli Array modeli] --> ArrayTrace[Array trace ve hücre snapshot]
    ArrayTrace --> Playback[Ortak playback sınırı]
    Playback --> ArrayView[İndeksli hücre görünümü]
    Playback --> Code[Kod satırı vurgusu]
```

Bu bölüm yalnız öneridir: sınıf adı, işlem kümesi, kapasite giriş modeli ve kesin trace sözleşmesi henüz onaylanmadı veya uygulanmadı; somut kapasite ve işlem önerisi [planda](planning/PROJECT_PLAN.md) yer alır. Array Node ve linked-list snapshot alanlarına zorlanmaz. Sonraki ADT'ler [kaynak haritasında](planning/SOURCE_MAP.md) incelenir; kapsam kararı ve bağımlılıklar netleşmeden mevcut sınıf olarak çizilmez.

## TASLAK — ADT ve temsil sınırları

Bu kavramsal modül diyagramı [DEC-0038](../DECISIONS/engineering/DEC-0038-foundations-and-interfaces.md) yönünü gösterir; yeni sınıf, kalıtım veya kesin API uygulandığı anlamına gelmez. ArrayList sabit kapasitelidir; Java'nın dinamik ArrayList sınıfı değildir.

```mermaid
flowchart LR
    ADT[ADT / interface davranış sözleşmesi] --> AI[Array tabanlı implementasyon]
    ADT --> LI[Linked List tabanlı implementasyon]
    AI --> AB[Array temeli: indeksli hücreler]
    LI --> LB[Linked List temeli: Node ve bağlantılar]
    AB --> AS[Array state / trace / render]
    LB --> LS[Linked state / trace / render]
```

Bu ayrım composition/delegation ile kurulabilir; bu somut mekanizma öneridir, kullanıcı kararı veya mevcut kod iddiası değildir. Mevcut iki Node ve üç liste sınıfı yukarıdaki mevcut diyagramda gösterilir; Array uygulanmamıştır.

## TASLAK — koşullu interface ve depolama örneği

Bu yalnız `ArrayList` teriminin bağımsız List implementasyonu olarak seçilmesi halinde incelenecek örnektir; seçenek henüz kararlaştırılmadı. Stack ve Queue örnekleri de kapsam onayı değildir. Diyagram kavramsal realization ve depolama kullanımını gösterir; kaynakta bu interface veya sınıfların varlığını iddia etmez. Fiziksel Array ayrı public sınıf olmak zorunda değildir.

```mermaid
classDiagram
    class ListContract~T~ {
        <<interface>>
    }
    class StackContract~T~ {
        <<interface>>
    }
    class QueueContract~T~ {
        <<interface>>
    }
    class FixedArrayList~T~
    class SinglyListVariant~T~
    class DoublyListVariant~T~
    class CircularListVariant~T~
    class ArrayStack~T~
    class LinkedStack~T~
    class ArrayQueue~T~
    class LinkedQueue~T~
    class ArrayStorage~T~ {
        <<internal storage example>>
    }
    class LinkedStorage~T~ {
        <<foundation example>>
    }
    ListContract <|.. FixedArrayList
    ListContract <|.. SinglyListVariant
    ListContract <|.. DoublyListVariant
    ListContract <|.. CircularListVariant
    StackContract <|.. ArrayStack
    StackContract <|.. LinkedStack
    QueueContract <|.. ArrayQueue
    QueueContract <|.. LinkedQueue
    FixedArrayList *-- ArrayStorage
    ArrayStack *-- ArrayStorage
    ArrayQueue *-- ArrayStorage
    LinkedStack --> LinkedStorage : kullanım örneği
    LinkedQueue --> LinkedStorage : kullanım örneği
```

İsimler ve ilişkiler taslaktır; tüm ADT'lere List işlemleri veya aynı kalıtım zinciri zorlanmaz. Queue'nun circular hücre ihtiyaçları packed ArrayList kullanımına bağlanmaz.

## TASLAK — ders fazlarının bağımlılıkları

Aşağıdaki modüller gelecekteki önerilerdir; uygulanmış sınıflar, onaylanmış kapsam veya evrensel bir üst sınıf olarak yorumlanmamalıdır. Ayrıntılı kaynak ve sınırlar [kaynak haritasında](planning/SOURCE_MAP.md) yer alır.

```mermaid
flowchart LR
    A[F1 Sabit Array] --> B[F2 Stack / Queue / Deque]
    B --> C[F3 Call frame ve F4 Tree / traversal]
    A --> D[F5 Priority Queue / Heap]
    C --> D
    D --> E[Ortak Entry ve karşılaştırma sözleşmesi]
    C --> G[Tree geometry ve rotation sınırı]
    E --> H[F6 Map / Hash / Set / Skip List]
    E --> I[F7 BST / AVL / Splay / Red-Black]
    G --> I
    T[Ortak trace / playback sözleşmesi] --> H
    T --> I
    H -.-> J[F8 Graph: kaynak ve kapsam bekleniyor]
    I -.-> J
```

F6 ve F7, ortak Entry, trace ve gerekli layout sınırları sabitlendikten sonra ayrı dosya sahipliğiyle paralel hazırlanabilir. Ortak registry ve playback entegrasyonu tek yazarda kalır. Graph okları yalnız kaynak ve kapsam bekleyen gelecek değerlendirmeyi gösterir; bu konunun tüm bağımlılıklarını veya onayını ifade etmez. AVL ve Red-Black silme için mevcut kaynaklarda tam işlem izi yoktur.

## Kontrol kaydı

2026-11-16: Kaynak dosyalarından mevcut Node, DNode, üç liste, trace, playback ve görselleştirme ilişkileri yeniden yazıldı. Önceki tarihsel taslaklar güncel sınıf gibi gösterilmedi. Bu belge çalıştırma veya test kanıtı değildir; önceki doğrulama için [VALIDATION](VALIDATION.md).
