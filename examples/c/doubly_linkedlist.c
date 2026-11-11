#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
  // Bağımsız DNode: iki bağlantıyı saklar; komşuların alanlarını otomatik değiştirmez.
typedef struct DNode {
  const char *data;
  struct DNode *prev;
  struct DNode *next;
} DNode;
  // Önce nesne oluşturulur; ardından her alan ayrı adımda atanır.
DNode *newDNode(const char *data, DNode *prev, DNode *next) {
  DNode *node = malloc(sizeof *node);
  if (node == NULL) return NULL;
  // data parametresini nesnenin veri alanına kaydet.
  node->data = data;
  // prev önceki nesneye referans veya null olabilir.
  node->prev = prev;
  // next sonraki nesneye referans veya null olabilir.
  node->next = next;
  return node;
}

typedef struct { DNode *head; DNode *tail; int size; } DoublyLinkedlist;
bool dll_isEmpty(DoublyLinkedlist *list) {
  bool empty = list->head == NULL;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return empty;
}

int dll_size(DoublyLinkedlist *list) {
  int count = list->size;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return count;
}

void dll_clear(DoublyLinkedlist *list) {
  // Dolaşma için geçici current referansını başlat.
  DNode *current = list->head;
  // Liste başlangıç referansını güncelle.
  list->head = NULL;
  // Liste bitiş referansını güncelle.
  list->tail = NULL;
  // Sonraki nesneyi tutacak geçici referansı null ile başlat.
  DNode *following = NULL;
  // Null’a ulaşana kadar koşulu her dönüşte yeniden kontrol et.
  while (current != NULL) {
    // Sonraki komşuyu koparmadan önce sakla.
    following = current->next;
    // Temizlenen nesnenin prev alanını null yap.
    current->prev = NULL;
    // Temizlenen nesnenin next alanını null yap.
    current->next = NULL;
    free(current); // data ödünç alınmıştır.
    // Saklanan sonraki nesneyle devam et.
    current = following;
  }
  // Eleman sayacını bağlantılardan ayrı güncelle.
  list->size = 0;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return;
}

void dll_addFirst(DoublyLinkedlist *list, const char *value) {
  // Bağımsız DNode oluştur; komşular daha sonra ayrı bağlanacak.
  DNode *node = newDNode(value, NULL, NULL);
  if (node == NULL) {
    return;
  }
  // İleri bağlantıyı bu adımda güncelle.
  node->next = list->head;
  // Boş ve dolu liste için farklı uç güncellemesini seç.
  if (list->head != NULL) {
    // Geri bağlantıyı bu adımda güncelle.
    list->head->prev = node;
  } else {
    // Liste bitiş referansını güncelle.
    list->tail = node;
  }
  // Liste başlangıç referansını güncelle.
  list->head = node;
  // Eleman sayacını bağlantılardan ayrı güncelle.
  list->size++;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return;
}

void dll_insertAt(DoublyLinkedlist *list, int index, const char *value) {
  // Geçersiz index veya boş listeyi değiştirmeden sonlandır.
  if (index < 0 || index > list->size) {
    // Geçersiz işlemde listeyi değiştirmeden güvenle dön.
    return;
  }
  DNode *current;
  // Size konumuna eklemede sonraki nesne bulunmaz.
  if (index == list->size) {
    // Sona eklemenin sonraki komşusu null’dır.
    current = NULL;
  } else {
    int i;
    // Hedefe yakın uçtan başlayarak dolaşma maliyetini azalt.
    if (index < list->size / 2.0) {
      // Geçici referansı head ile başlat.
      current = list->head;
      // Head konumunun index’i sıfırdır.
      i = 0;
    } else {
      // Geçici referansı tail ile başlat.
      current = list->tail;
      // Tail konumunun index’i size - 1’dir.
      i = list->size - 1;
    }
    // Hedef index’e ulaşana kadar koşulu yeniden kontrol et.
    while (i != index) {
      // İndex farkına göre ileri veya geri ilerle.
      if (i < index) {
        // Geçici referansı next hedefe taşı.
        current = current->next;
        // İndex sayacını ayrı adımda artır.
        i++;
      } else {
        // Geçici referansı prev hedefe taşı.
        current = current->prev;
        // İndex sayacını ayrı adımda azalt.
        i--;
      }
    }
  }
  // Önceki komşuyu geçici referansta sakla.
  DNode *previous = current != NULL ? current->prev : list->tail;
  // Bağımsız DNode oluştur; komşular daha sonra ayrı bağlanacak.
  DNode *node = newDNode(value, NULL, NULL);
  if (node == NULL) {
    return;
  }
  // Yeni nesnenin geri bağlantısını kur.
  node->prev = previous;
  // Yeni nesnenin ileri bağlantısını kur.
  node->next = current;
  // Önceki komşu yoksa head güncellenmelidir.
  if (previous != NULL) {
    // Önceki komşunun ileri bağlantısını yeni nesneye taşı.
    previous->next = node;
  } else {
    // Liste başlangıç referansını güncelle.
    list->head = node;
  }
  // Sonraki komşu yoksa tail güncellenmelidir.
  if (current != NULL) {
    // Sonraki komşunun geri bağlantısını yeni nesneye taşı.
    current->prev = node;
  } else {
    // Liste bitiş referansını güncelle.
    list->tail = node;
  }
  // Eleman sayacını bağlantılardan ayrı güncelle.
  list->size++;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return;
}

void dll_addLast(DoublyLinkedlist *list, const char *value) {
  // Bağımsız DNode oluştur; komşular daha sonra ayrı bağlanacak.
  DNode *node = newDNode(value, NULL, NULL);
  if (node == NULL) {
    return;
  }
  // Geri bağlantıyı bu adımda güncelle.
  node->prev = list->tail;
  // Boş ve dolu liste için farklı uç güncellemesini seç.
  if (list->tail != NULL) {
    // İleri bağlantıyı bu adımda güncelle.
    list->tail->next = node;
  } else {
    // Liste başlangıç referansını güncelle.
    list->head = node;
  }
  // Liste bitiş referansını güncelle.
  list->tail = node;
  // Eleman sayacını bağlantılardan ayrı güncelle.
  list->size++;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return;
}

const char * dll_removeAt(DoublyLinkedlist *list, int index) {
  // Geçersiz index veya boş listeyi değiştirmeden sonlandır.
  if (index < 0 || index >= list->size) {
    // Geçersiz işlemde listeyi değiştirmeden güvenle dön.
    return NULL;
  }
  DNode *current;
  int i;
  // Hedefe yakın uçtan başlayarak dolaşma maliyetini azalt.
  if (index < list->size / 2.0) {
    // Geçici referansı head ile başlat.
    current = list->head;
    // Head konumunun index’i sıfırdır.
    i = 0;
  } else {
    // Geçici referansı tail ile başlat.
    current = list->tail;
    // Tail konumunun index’i size - 1’dir.
    i = list->size - 1;
  }
  // Hedef index’e ulaşana kadar koşulu yeniden kontrol et.
  while (i != index) {
    // İndex farkına göre ileri veya geri ilerle.
    if (i < index) {
      // Geçici referansı next hedefe taşı.
      current = current->next;
      // İndex sayacını ayrı adımda artır.
      i++;
    } else {
      // Geçici referansı prev hedefe taşı.
      current = current->prev;
      // İndex sayacını ayrı adımda azalt.
      i--;
    }
  }
  // Eski veriyi değiştirmeden veya nesneyi silmeden önce sakla.
  const char *oldValue = current->data;
  // Önceki komşuyu geçici referansta sakla.
  DNode *previous = current->prev;
  // Sonraki komşuyu koparmadan önce sakla.
  DNode *following = current->next;
  // Önceki komşu yoksa head güncellenmelidir.
  if (previous != NULL) {
    // İleri zincirin silinen nesneyi atlamasını sağla.
    previous->next = following;
  } else {
    // Liste başlangıç referansını güncelle.
    list->head = following;
  }
  // Sonraki komşu yoksa tail güncellenir.
  if (following != NULL) {
    // Geri zincirin silinen nesneyi atlamasını sağla.
    following->prev = previous;
  } else {
    // Liste bitiş referansını güncelle.
    list->tail = previous;
  }
  // Silinen nesnenin geri referansını temizle.
  current->prev = NULL;
  // Silinen nesnenin ileri referansını temizle.
  current->next = NULL;
  free(current); // Yalnız nesne belleği; data ödünç metindir.
  // Eleman sayacını bağlantılardan ayrı güncelle.
  list->size--;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return oldValue;
}

const char * dll_removeFirst(DoublyLinkedlist *list) {
  // Geçersiz index veya boş listeyi değiştirmeden sonlandır.
  if (list->head == NULL) {
    // Geçersiz işlemde listeyi değiştirmeden güvenle dön.
    return NULL;
  }
  // İşlem yapılacak nesneyi geçici referansla seç.
  DNode *current = list->head;
  // Eski veriyi değiştirmeden veya nesneyi silmeden önce sakla.
  const char *oldValue = current->data;
  // Önceki komşuyu geçici referansta sakla.
  DNode *previous = current->prev;
  // Sonraki komşuyu koparmadan önce sakla.
  DNode *following = current->next;
  // Önceki komşu yoksa head güncellenmelidir.
  if (previous != NULL) {
    // İleri zincirin silinen nesneyi atlamasını sağla.
    previous->next = following;
  } else {
    // Liste başlangıç referansını güncelle.
    list->head = following;
  }
  // Sonraki komşu yoksa tail güncellenir.
  if (following != NULL) {
    // Geri zincirin silinen nesneyi atlamasını sağla.
    following->prev = previous;
  } else {
    // Liste bitiş referansını güncelle.
    list->tail = previous;
  }
  // Silinen nesnenin geri referansını temizle.
  current->prev = NULL;
  // Silinen nesnenin ileri referansını temizle.
  current->next = NULL;
  free(current); // Yalnız nesne belleği; data ödünç metindir.
  // Eleman sayacını bağlantılardan ayrı güncelle.
  list->size--;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return oldValue;
}

const char * dll_removeLast(DoublyLinkedlist *list) {
  // Geçersiz index veya boş listeyi değiştirmeden sonlandır.
  if (list->tail == NULL) {
    // Geçersiz işlemde listeyi değiştirmeden güvenle dön.
    return NULL;
  }
  // İşlem yapılacak nesneyi geçici referansla seç.
  DNode *current = list->tail;
  // Eski veriyi değiştirmeden veya nesneyi silmeden önce sakla.
  const char *oldValue = current->data;
  // Önceki komşuyu geçici referansta sakla.
  DNode *previous = current->prev;
  // Sonraki komşuyu koparmadan önce sakla.
  DNode *following = current->next;
  // Önceki komşu yoksa head güncellenmelidir.
  if (previous != NULL) {
    // İleri zincirin silinen nesneyi atlamasını sağla.
    previous->next = following;
  } else {
    // Liste başlangıç referansını güncelle.
    list->head = following;
  }
  // Sonraki komşu yoksa tail güncellenir.
  if (following != NULL) {
    // Geri zincirin silinen nesneyi atlamasını sağla.
    following->prev = previous;
  } else {
    // Liste bitiş referansını güncelle.
    list->tail = previous;
  }
  // Silinen nesnenin geri referansını temizle.
  current->prev = NULL;
  // Silinen nesnenin ileri referansını temizle.
  current->next = NULL;
  free(current); // Yalnız nesne belleği; data ödünç metindir.
  // Eleman sayacını bağlantılardan ayrı güncelle.
  list->size--;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return oldValue;
}

int dll_indexOf(DoublyLinkedlist *list, const char *value) {
  // Dolaşma için geçici current referansını başlat.
  DNode *current = list->head;
  // Dolaşmanın index sayacını başlat.
  int i = 0;
  // Null’a ulaşana kadar koşulu her dönüşte yeniden kontrol et.
  while (current != NULL) {
    // Veri eşitliğini kontrol et; henüz bağlantı değiştirme.
    bool matched = strcmp(current->data, value) == 0;
    // Karşılaştırma true ise eşleşme koluna gir; sonucu ayrı satırda kullan.
    if (matched) {
      // Bulunan index veya mantıksal sonucu ayrı değişkende sakla.
      int found = i;
      // Bulunan sonucu döndür.
      return found;
    }
    // Current referansını bir komşuya taşı.
    current = current->next;
    // Dolaşma sayacını ayrı adımda güncelle.
    i++;
  }
  // Bulunamayan hedef için güvenli sonucu döndür.
  return -1;
}

const char * dll_get(DoublyLinkedlist *list, int index) {
  // Geçersiz index veya boş listeyi değiştirmeden sonlandır.
  if (index < 0 || index >= list->size) {
    // Geçersiz işlemde listeyi değiştirmeden güvenle dön.
    return NULL;
  }
  DNode *current;
  int i;
  // Hedefe yakın uçtan başlayarak dolaşma maliyetini azalt.
  if (index < list->size / 2.0) {
    // Geçici referansı head ile başlat.
    current = list->head;
    // Head konumunun index’i sıfırdır.
    i = 0;
  } else {
    // Geçici referansı tail ile başlat.
    current = list->tail;
    // Tail konumunun index’i size - 1’dir.
    i = list->size - 1;
  }
  // Hedef index’e ulaşana kadar koşulu yeniden kontrol et.
  while (i != index) {
    // İndex farkına göre ileri veya geri ilerle.
    if (i < index) {
      // Geçici referansı next hedefe taşı.
      current = current->next;
      // İndex sayacını ayrı adımda artır.
      i++;
    } else {
      // Geçici referansı prev hedefe taşı.
      current = current->prev;
      // İndex sayacını ayrı adımda azalt.
      i--;
    }
  }
  // Nesnenin veri alanını bağlantıları değiştirmeden oku.
  const char *value = current->data;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return value;
}

const char * dll_getFirst(DoublyLinkedlist *list) {
  // Geçersiz index veya boş listeyi değiştirmeden sonlandır.
  if (list->head == NULL) {
    // Geçersiz işlemde listeyi değiştirmeden güvenle dön.
    return NULL;
  }
  // İşlem yapılacak nesneyi geçici referansla seç.
  DNode *current = list->head;
  // Nesnenin veri alanını bağlantıları değiştirmeden oku.
  const char *value = current->data;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return value;
}

const char * dll_getLast(DoublyLinkedlist *list) {
  // Geçersiz index veya boş listeyi değiştirmeden sonlandır.
  if (list->tail == NULL) {
    // Geçersiz işlemde listeyi değiştirmeden güvenle dön.
    return NULL;
  }
  // İşlem yapılacak nesneyi geçici referansla seç.
  DNode *current = list->tail;
  // Nesnenin veri alanını bağlantıları değiştirmeden oku.
  const char *value = current->data;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return value;
}

const char * dll_set(DoublyLinkedlist *list, int index, const char *value) {
  // Geçersiz index veya boş listeyi değiştirmeden sonlandır.
  if (index < 0 || index >= list->size) {
    // Geçersiz işlemde listeyi değiştirmeden güvenle dön.
    return NULL;
  }
  DNode *current;
  int i;
  // Hedefe yakın uçtan başlayarak dolaşma maliyetini azalt.
  if (index < list->size / 2.0) {
    // Geçici referansı head ile başlat.
    current = list->head;
    // Head konumunun index’i sıfırdır.
    i = 0;
  } else {
    // Geçici referansı tail ile başlat.
    current = list->tail;
    // Tail konumunun index’i size - 1’dir.
    i = list->size - 1;
  }
  // Hedef index’e ulaşana kadar koşulu yeniden kontrol et.
  while (i != index) {
    // İndex farkına göre ileri veya geri ilerle.
    if (i < index) {
      // Geçici referansı next hedefe taşı.
      current = current->next;
      // İndex sayacını ayrı adımda artır.
      i++;
    } else {
      // Geçici referansı prev hedefe taşı.
      current = current->prev;
      // İndex sayacını ayrı adımda azalt.
      i--;
    }
  }
  // Eski veriyi değiştirmeden veya nesneyi silmeden önce sakla.
  const char *oldValue = current->data;
  // Yalnız data değerini değiştir; bağlantıları koru.
  current->data = value;
  // İşlemi bitir ve doğrudan sonucu döndür.
  return oldValue;
}

bool dll_contains(DoublyLinkedlist *list, const char *value) {
  // Dolaşma için geçici current referansını başlat.
  DNode *current = list->head;
  // Dolaşmanın index sayacını başlat.
  int i = 0;
  // Null’a ulaşana kadar koşulu her dönüşte yeniden kontrol et.
  while (current != NULL) {
    // Veri eşitliğini kontrol et; henüz bağlantı değiştirme.
    bool matched = strcmp(current->data, value) == 0;
    // Karşılaştırma true ise eşleşme koluna gir; sonucu ayrı satırda kullan.
    if (matched) {
      // Bulunan index veya mantıksal sonucu ayrı değişkende sakla.
      bool found = true;
      // Bulunan sonucu döndür.
      return found;
    }
    // Current referansını bir komşuya taşı.
    current = current->next;
    // Dolaşma sayacını ayrı adımda güncelle.
    i++;
  }
  (void)i;
  // Bulunamayan hedef için güvenli sonucu döndür.
  return false;
}

int dll_lastIndexOf(DoublyLinkedlist *list, const char *value) {
  // Dolaşma için geçici current referansını başlat.
  DNode *current = list->tail;
  // Dolaşmanın index sayacını başlat.
  int i = list->size - 1;
  // Null’a ulaşana kadar koşulu her dönüşte yeniden kontrol et.
  while (current != NULL) {
    // Veri eşitliğini kontrol et; henüz bağlantı değiştirme.
    bool matched = strcmp(current->data, value) == 0;
    // Karşılaştırma true ise eşleşme koluna gir; sonucu ayrı satırda kullan.
    if (matched) {
      // Bulunan index veya mantıksal sonucu ayrı değişkende sakla.
      int found = i;
      // Bulunan sonucu döndür.
      return found;
    }
    // Current referansını bir komşuya taşı.
    current = current->prev;
    // Dolaşma sayacını ayrı adımda güncelle.
    i--;
  }
  // Bulunamayan hedef için güvenli sonucu döndür.
  return -1;
}

bool dll_remove(DoublyLinkedlist *list, const char *value) {
  // Dolaşma için geçici current referansını başlat.
  DNode *current = list->head;
  // Null’a ulaşana kadar koşulu her dönüşte yeniden kontrol et.
  while (current != NULL) {
    // Veri eşitliğini kontrol et; henüz bağlantı değiştirme.
    bool matched = strcmp(current->data, value) == 0;
    // Karşılaştırma true ise eşleşme koluna gir; sonucu ayrı satırda kullan.
    if (matched) {
      // Eski veriyi değiştirmeden veya nesneyi silmeden önce sakla.
      const char *oldValue = current->data;
      (void)oldValue; // Bu method bool döndürür.
      // Önceki komşuyu geçici referansta sakla.
      DNode *previous = current->prev;
      // Sonraki komşuyu koparmadan önce sakla.
      DNode *following = current->next;
      // Önceki komşu yoksa head güncellenmelidir.
      if (previous != NULL) {
        // İleri zincirin silinen nesneyi atlamasını sağla.
        previous->next = following;
      } else {
        // Liste başlangıç referansını güncelle.
        list->head = following;
      }
      // Sonraki komşu yoksa tail güncellenir.
      if (following != NULL) {
        // Geri zincirin silinen nesneyi atlamasını sağla.
        following->prev = previous;
      } else {
        // Liste bitiş referansını güncelle.
        list->tail = previous;
      }
      // Silinen nesnenin geri referansını temizle.
      current->prev = NULL;
      // Silinen nesnenin ileri referansını temizle.
      current->next = NULL;
      free(current); // Yalnız nesne belleği; data ödünç metindir.
      // Eleman sayacını bağlantılardan ayrı güncelle.
      list->size--;
      // İşlemi bitir ve doğrudan sonucu döndür.
      return true;
    }
    // Current referansını bir komşuya taşı.
    current = current->next;
  }
  // Bulunamayan hedef için güvenli sonucu döndür.
  return false;
}

void dll_traversal(DoublyLinkedlist *list) {
  // Dolaşma çıktısını hazırla.
  printf("[");
  // Dolaşma için geçici current referansını başlat.
  DNode *current = list->head;
  // Dolaşmanın index sayacını başlat.
  int i = 0;
  // Null’a ulaşana kadar koşulu her dönüşte yeniden kontrol et.
  while (current != NULL) {
    // Mevcut veriyi çıktıya ekle.
    printf("%s%s", i ? ", " : "", current->data);
    // Current referansını bir komşuya taşı.
    current = current->next;
    // Dolaşma sayacını ayrı adımda güncelle.
    i++;
  }
  // İşlemi bitir ve doğrudan sonucu döndür.
  printf("]\n");
  return;
}
