#include <stdbool.h>
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
bool dll_isEmpty(const DoublyLinkedlist *list) {
  bool empty = list->head == NULL;
  return empty;
}

int dll_size(const DoublyLinkedlist *list) {
  int count = list->size;
  return count;
}

// Her bağlantı ayrı adımda kurulur.
void dll_addFirst(DoublyLinkedlist *list, const char *value) {
  DNode *node = newDNode(value, NULL, NULL);
  if (node == NULL) return;
  // İleri bağlantıyı eski head’e kur.
  node->next = list->head;
  if (list->head != NULL) {
    // Eski head’in geri bağlantısı ayrı güncellenir.
    list->head->prev = node;
  } else {
    list->tail = node;
  }
  list->head = node;
  list->size++;
  return;
}
