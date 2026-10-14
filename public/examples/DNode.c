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
