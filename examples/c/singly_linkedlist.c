#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <stdlib.h>
  // Bağımsız Node: liste işlemleri bu sınıfa ait değildir.
typedef struct Node {
  const char *data;
  struct Node *next;
  // next bir Node kopyası değil, aynı nesneye referanstır.
} Node;

Node *newNode(const char *data, Node *next) {
  Node *node = malloc(sizeof *node);
  if (node == NULL) return NULL;
  node->data = data;
  // Constructor next parametresini saklar; null ya da mevcut bir Node verilebilir.
  node->next = next;
  return node;
}
typedef struct { Node *head; int size; } LinkedList;
static void freeChain(Node *current) {
  while (current) { Node *next = current->next; free(current); current = next; }
}
  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
bool ll_isEmpty(LinkedList *list) {
  bool empty = list->head == NULL;
  return empty;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
int ll_size(LinkedList *list) {
  int count = list->size;
  return count;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
void ll_clear(LinkedList *list) {
  // Java erişilemeyen Node’ları GC ile toplar; C belleği açıkça serbest bırakır.
  freeChain(list->head); list->head = NULL;
  list->size = 0;
  return;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
void ll_addFirst(LinkedList *list, const char *value) {
  // Önce eski head’i next’e bağla; sonra head’i değiştir.
  Node *node = newNode(value, NULL); if (!node) return; // Bellek ayrılamadı
  node->next = list->head;
  list->head = node;
  list->size++;
  return;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
void ll_insertAt(LinkedList *list, int index, const char *value) {
  if (index < 0 || index > list->size) return; // Geçersiz index
  Node *node = newNode(value, NULL); if (!node) return; // Bellek ayrılamadı
  if (index == 0) {
    node->next = list->head;
    list->head = node;
  } else {
    Node *previous = list->head; int i = 0;
    while (i < index - 1) {
      previous = previous->next;
      i++;
    }
    node->next = previous->next;
    previous->next = node;
  }
  list->size++;
  return;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
void ll_addLast(LinkedList *list, const char *value) {
  Node *node = newNode(value, NULL); if (!node) return; // Bellek ayrılamadı
  if (list->head == NULL) {
    list->head = node;
  } else {
    Node *current = list->head;
    while (current->next != NULL) {
      current = current->next;
    }
    current->next = node;
  }
  list->size++;
  return;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
const char * ll_removeAt(LinkedList *list, int index) {
  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node *current = list->head, *previous = NULL; int i = 0;
  while (i < index) {
    previous = current;
    current = current->next;
    i++;
  }
  // Silinen Node yerine onun next hedefini bağla.
  if (previous == NULL) {
    list->head = current->next;
  } else {
    previous->next = current->next;
  }
  list->size--;
  const char *removed = current->data; free(current); return removed;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
const char * ll_removeFirst(LinkedList *list) {
  int index = 0;
  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node *current = list->head, *previous = NULL; int i = 0;
  while (i < index) {
    previous = current;
    current = current->next;
    i++;
  }
  // Silinen Node yerine onun next hedefini bağla.
  if (previous == NULL) {
    list->head = current->next;
  } else {
    previous->next = current->next;
  }
  list->size--;
  const char *removed = current->data; free(current); return removed;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
const char * ll_removeLast(LinkedList *list) {
  int index = list->size - 1;
  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node *current = list->head, *previous = NULL; int i = 0;
  while (i < index) {
    previous = current;
    current = current->next;
    i++;
  }
  // Silinen Node yerine onun next hedefini bağla.
  if (previous == NULL) {
    list->head = current->next;
  } else {
    previous->next = current->next;
  }
  list->size--;
  const char *removed = current->data; free(current); return removed;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
int ll_indexOf(LinkedList *list, const char *value) {
  Node *current = list->head; int i = 0, found = -1;
  while (current != NULL) {
    if (strcmp(current->data, value) == 0) {
      found = i;
      break;
    }
    current = current->next;
    i++;
  }
  return found;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
const char * ll_get(LinkedList *list, int index) {
  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node *current = list->head; int i = 0;
  while (i < index) {
    current = current->next;
    i++;
  }
  const char *old = current->data;
  return old;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
const char * ll_getFirst(LinkedList *list) {
  int index = 0;
  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node *current = list->head; int i = 0;
  while (i < index) {
    current = current->next;
    i++;
  }
  const char *old = current->data;
  return old;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
const char * ll_getLast(LinkedList *list) {
  int index = list->size - 1;
  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node *current = list->head; int i = 0;
  while (i < index) {
    current = current->next;
    i++;
  }
  const char *old = current->data;
  return old;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
const char * ll_set(LinkedList *list, int index, const char *value) {
  if (index < 0 || index >= list->size) return NULL; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node *current = list->head; int i = 0;
  while (i < index) {
    current = current->next;
    i++;
  }
  const char *old = current->data;
  current->data = value;
  return old;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
bool ll_contains(LinkedList *list, const char *value) {
  Node *current = list->head; int i = 0, found = -1;
  while (current != NULL) {
    if (strcmp(current->data, value) == 0) {
      found = i;
      break;
    }
    current = current->next;
    i++;
  }
  bool exists = found != -1;
  return exists;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
int ll_lastIndexOf(LinkedList *list, const char *value) {
  Node *current = list->head; int i = 0, found = -1;
  while (current != NULL) {
    if (strcmp(current->data, value) == 0) {
      found = i;
    }
    current = current->next;
    i++;
  }
  return found;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
bool ll_remove(LinkedList *list, const char *value) {
  Node *current = list->head, *previous = NULL;
  while (current != NULL) {
    if (strcmp(current->data, value) == 0) break;
    previous = current;
    current = current->next;
  }
  if (current == NULL) return false;
  // Silinen Node yerine onun next hedefini bağla.
  if (previous == NULL) {
    list->head = current->next;
  } else {
    previous->next = current->next;
  }
  list->size--;
  free(current); return true;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
void ll_traversal(LinkedList *list) {
  Node *current = list->head;
  while (current != NULL) {
    printf("%s\n", current->data);
    current = current->next;
  }
  return;
}
