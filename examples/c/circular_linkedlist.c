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
typedef struct { Node *tail; int size; } CircularLinkedlist;
bool cll_isEmpty(CircularLinkedlist *list);
int cll_size(CircularLinkedlist *list);
void cll_clear(CircularLinkedlist *list);
void cll_addFirst(CircularLinkedlist *list, const char *value);
void cll_insertAt(CircularLinkedlist *list, int index, const char *value);
void cll_addLast(CircularLinkedlist *list, const char *value);
const char * cll_removeAt(CircularLinkedlist *list, int index);
const char * cll_removeFirst(CircularLinkedlist *list);
const char * cll_removeLast(CircularLinkedlist *list);
int cll_indexOf(CircularLinkedlist *list, const char *value);
const char * cll_get(CircularLinkedlist *list, int index);
const char * cll_getFirst(CircularLinkedlist *list);
const char * cll_getLast(CircularLinkedlist *list);
const char * cll_set(CircularLinkedlist *list, int index, const char *value);
bool cll_contains(CircularLinkedlist *list, const char *value);
int cll_lastIndexOf(CircularLinkedlist *list, const char *value);
bool cll_remove(CircularLinkedlist *list, const char *value);
void cll_traversal(CircularLinkedlist *list);
bool cll_isEmpty(CircularLinkedlist *list) {
  return list->tail == NULL;
}

int cll_size(CircularLinkedlist *list) {
  return list->size;
}

void cll_clear(CircularLinkedlist *list) {
// Önce halka açılır; ardından current null olana kadar temizlenir.
  if (list->tail == NULL) {
  return;
  }
  Node *current = list->tail->next;
  list->tail->next = NULL;
  list->tail = NULL;
  while (current != NULL) {
    Node *following = current->next;
  current->next = NULL;
  free(current);
    list->size--;
    current = following;
  }
  return;
}

void cll_addFirst(CircularLinkedlist *list, const char *value) {
  Node *node = newNode(value, NULL);
  if (node == NULL) return;
  if (list->tail == NULL) {
    node->next = node;
    list->tail = node;
  } else {
    node->next = list->tail->next;
    list->tail->next = node;
  }
  list->size++;
  return;
}

void cll_insertAt(CircularLinkedlist *list, int index, const char *value) {
  if (index < 0 || index > list->size) {
  return;
  }
  if (index == 0) {
    cll_addFirst(list, value);
  return;
  }
  if (index == list->size) {
    cll_addLast(list, value);
  return;
  }
  Node *previous = list->tail->next;
  int i = 0;
  while (i < index - 1) {
    previous = previous->next;
    i++;
  }
  Node *node = newNode(value, NULL);
  if (node == NULL) return;
  node->next = previous->next;
  previous->next = node;
  list->size++;
  return;
}

void cll_addLast(CircularLinkedlist *list, const char *value) {
  Node *node = newNode(value, NULL);
  if (node == NULL) return;
  if (list->tail == NULL) {
    node->next = node;
  } else {
    node->next = list->tail->next;
    list->tail->next = node;
  }
  list->tail = node;
  list->size++;
  return;
}

const char * cll_removeAt(CircularLinkedlist *list, int index) {
  if (index < 0 || index >= list->size) {
  return NULL;
  }
  if (index == 0) {
    return cll_removeFirst(list);
  }
  if (index == list->size - 1) {
    return cll_removeLast(list);
  }
  Node *previous = list->tail->next;
  int i = 0;
  while (i < index - 1) {
    previous = previous->next;
    i++;
  }
  Node *current = previous->next;
  const char *value = current->data;
  previous->next = current->next;
  current->next = NULL;
  free(current);
  list->size--;
  return value;
}

const char * cll_removeFirst(CircularLinkedlist *list) {
  if (list->tail == NULL) {
  return NULL;
  }
  Node *current = list->tail->next;
  const char *value = current->data;
  if (current == list->tail) {
    list->tail = NULL;
  } else {
    list->tail->next = current->next;
  }
  current->next = NULL;
  free(current);
  list->size--;
  return value;
}

const char * cll_removeLast(CircularLinkedlist *list) {
  if (list->tail == NULL) {
  return NULL;
  }
  if (list->tail->next == list->tail) {
    return cll_removeFirst(list);
  }
  Node *previous = list->tail->next;
  while (previous->next != list->tail) {
    previous = previous->next;
  }
  Node *current = list->tail;
  const char *value = current->data;
  previous->next = current->next;
  list->tail = previous;
  current->next = NULL;
  free(current);
  list->size--;
  return value;
}

int cll_indexOf(CircularLinkedlist *list, const char *value) {
// Halka null ile bitmez; size adım bir turdur.
  Node *current = list->tail == NULL ? NULL : list->tail->next;
  int i = 0;
  while (i < list->size) {
    if (strcmp(current->data, value) == 0) {
  return i;
  }
    current = current->next;
    i++;
  }
  return -1;
}

const char * cll_get(CircularLinkedlist *list, int index) {
  if (index < 0 || index >= list->size) {
  return NULL;
  }
  Node *current = list->tail->next;
  int i = 0;
  while (i < index) {
    current = current->next;
    i++;
  }
  return current->data;
}

const char * cll_getFirst(CircularLinkedlist *list) {
  if (list->tail == NULL) {
  return NULL;
  }
  return list->tail->next->data;
}

const char * cll_getLast(CircularLinkedlist *list) {
  if (list->tail == NULL) {
  return NULL;
  }
  return list->tail->data;
}

const char * cll_set(CircularLinkedlist *list, int index, const char *value) {
  if (index < 0 || index >= list->size) {
  return NULL;
  }
  Node *current = list->tail->next;
  int i = 0;
  while (i < index) {
    current = current->next;
    i++;
  }
  const char *oldValue = current->data;
  current->data = value;
  return oldValue;
}

bool cll_contains(CircularLinkedlist *list, const char *value) {
  int index = cll_indexOf(list, value);
  return index != -1;
}

int cll_lastIndexOf(CircularLinkedlist *list, const char *value) {
// Halka null ile bitmez; size adım bir turdur.
  Node *current = list->tail == NULL ? NULL : list->tail->next;
  int i = 0;
  int found = -1;
  while (i < list->size) {
    if (strcmp(current->data, value) == 0) {
      found = i;
  }
    current = current->next;
    i++;
  }
  return found;
}

bool cll_remove(CircularLinkedlist *list, const char *value) {
  int index = cll_indexOf(list, value);
  if (index == -1) {
  return false;
  }
  cll_removeAt(list, index);
  return true;
}

void cll_traversal(CircularLinkedlist *list) {
// Yalnız bir tam tur dolaşılır; ikinci tura girilmez.
  printf("[");
  Node *current = list->tail == NULL ? NULL : list->tail->next;
  int i = 0;
  while (i < list->size) {
    printf("%s%s", i == 0 ? "" : ", ", current->data);
    current = current->next;
    i++;
  }
  printf("]\n");
  return;
}
