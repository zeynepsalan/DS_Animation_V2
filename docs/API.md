# Singly Linkedlist API kapsamı

Bu sözleşme ilk çalışan sürümde uygulanmıştır. Bağımsız Node<T> sınıfı data, next ve görsel kimlik id taşır; listeye veya Angular’a bağımlı değildir. UI data değerlerini String olarak işler; sayısal görünen data değerleri de String’dir. Index tam sayıdır. Fonksiyonlar doğrudan değer döndürür; başarısız beklenen işlemler null/false/erken return ile güvenle sonlanır.

Kaynaklar: src/app/core/, examples/java/, examples/c/. Java/C örnekleri ekrandaki satır kaynağından npm run export:examples ile üretilir. C fonksiyonları ll_ öneki taşır; UI fonksiyon isimleri korunur.

## Doğrudan dönüş sözleşmesi

- `boolean isEmpty()`: head null ise true.
- `int size()`: güncel eleman sayısı.
- `void clear()`: listeyi boşaltır; boş listede de güvenli.
- `void addFirst(T value)` ve `void addLast(T value)`: başa/sona ekler.
- `void insertAt(int index, T value)`: 0 ≤ index ≤ size konumuna ekler; geçersiz index'te erken return, liste değişmez. Java standart karşılığı add(index, element).
- `T removeAt(int index)`: silinen data; index geçersizse null. Java standart karşılığı remove(index).
- `T removeFirst()` ve `T removeLast()`: silinen data; liste boşsa null.
- `T get(int index)`, `T getFirst()`, `T getLast()`: bulunan data; geçersiz index/boş listede null.
- `T set(int index, T value)`: eski data; geçersiz index/boş listede null. next bağlantısı değişmez.
- `int indexOf(T value)` ve `int lastIndexOf(T value)`: ilk/son eşleşmenin index'i; yoksa -1.
- `boolean contains(T value)`: eşleşme var mı?
- `boolean remove(T value)`: ilk eşleşmeyi siler; yoksa false.
- `List<T> traversal()`: Java/TypeScript dolaşma çıktısı. C sürümü void döndürüp stdout'a yazar.

TypeScript'te T döndüren fonksiyonların tipi `T | null` olarak açıktır; Java'da T referansı null olabilir. C metin okumaları `const char *`/NULL, mantıksal sonuçlar bool ve mutasyon işlemleri void kullanır. C isimlerinde ll_ öneki korunur.

## Sınır durumları

Index 0'dan başlar. İndexli okuma/silme/güncelleme için 0 ≤ index < size; ekleme için 0 ≤ index ≤ size. Her fonksiyonun if guard'ı yanlış işlemde listeyi değiştirmeden sonlanır. Boş liste, tek Node, head/tail, tekrar eden değerler ve bulunamayan hedefler kontrol edilir.

UI eksik veya yalnız boşluk içeren value, negatif/kesirli/sonlu olmayan ve güvenli tam sayı sınırını aşan index girdilerini reddeder. Sayısal görünen data da String'dir; büyük/küçük harf ve boşluklar eşleşmede anlamlıdır. UI null data girişi sunmaz; bu nedenle güvenli null dönüşü gerçek bir kullanıcı data değeriyle karışmaz.

Guard adımı hata nedenini Türkçe açıklar. TraceEngine, doğrudan returnValue ve ayrı error açıklamasını kayıt olarak tutar; bu fonksiyonun dönüşünü sarmalamaz. Void sonuç ekranda void, geçersiz okuma/silme sonucu null olarak görünür.

Reset işlem başlangıç listesini geri getirir; clear ayrı bir algoritmadır. C metinleri ödünç const char* değerlerdir; çağıran metni geçerli tutar. Görsel bellek adresleri yerine Node id kullanır, malloc/free veya Java GC'nin iç adımlarını simüle etmez.

## Java kaynağı ve kapsam sınırı

[Oracle Java SE 25 LinkedList API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html) incelendi (2026-10-12). Java sınıfı doubly linked list kullanır; bizim singly yapımızda dolaşma yönü ve bazı işlemlerin maliyeti farklı olacaktır.

Bu dosya kaynak API’nin tamamını yeniden üretmez. Collection/Deque yardımcıları, toplu işlemler, iterator ailesi ve Stack/Queue takma işlemleri ilk kapsamda değildir. Ekleme, silme, okuma, güncelleme ve aramanın temel öğretim işlemleri seçilmiştir.

## DNode (2026-10-14)

Bağımsız `DNode<T>` sınıfı eklendi. Constructor `DNode(data, prev, next)` sırasını kullanır; üç parametre zorunludur. `prev` ve `next` aynı türdeki nesnelere referans veya `null` taşır. Constructor komşuların bağlantılarını otomatik değiştirmez; karşılıklı bağlantıları liste algoritması ayrı adımlarla kuracaktır. İsteğe bağlı dördüncü `id` görsel snapshot geri yükleme içindir. Doubly Linkedlist henüz arayüze entegre edilmedi.

- 2026-10-14: DNode siteye eklendi: Sidebar sınıf dosyası, Java/C/Pseudocode constructor kaynağı, imzada data/prev/next parametreleri, bağımsız komşu veya null seçimi. Her data/prev/next ataması ayrı kod satırı ve ayrı trace adımıdır. Ortak playback ve klavye kısayolları kullanılır; DNode trace Singly listesini değiştirmez. Constructor yalnız kendi alanlarını atar, komşuların ters bağlantıları null kalır. Sahne merkez/sol/sağ slotları ve aşağı ayrılan null yollarıyla çakışmayı önler. Doubly Linkedlist fonksiyonları henüz entegre edilmedi.

## Doubly Linkedlist — ilk fonksiyon grubu

- `boolean isEmpty()`: head null kontrolü; listeyi değiştirmez.
- `int size()`: eleman sayacını okur; listeyi değiştirmez.
- `void addFirst(T value)`: yeni DNode(value, null, null) oluşturur. Önce node.next=head; dolu listede head.prev=node, boş listede tail=node; ardından head=node ve size++ ayrı adımlarda çalışır.

Final koşulları: boş listede head=tail=null; tek elemanda head=tail, prev=next=null. Dolu listede head.prev=null, tail.next=null; komşuların next/prev bağlantıları karşılıklıdır. Tekrarlı ekleme ve aynı değer tekrarları desteklenir. UI eksik/boş value değerinde mevcut listeye dokunmadan Türkçe hata verir. API kaynakları examples/java/DoublyLinkedlist.java ve examples/c/doubly_linkedlist.c; indirilebilir sürümler public/examples altında. Diğer Doubly fonksiyonları henüz uygulanmadı.
