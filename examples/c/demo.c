/* Tek translation unit örneği. Derleme: clang -std=c11 demo.c -o demo */
#include <assert.h>
#include "singly_linkedlist.c"
int main(void) {
  LinkedList list = {0};
  assert(ll_isEmpty(&list) && ll_size(&list) == 0);
  assert(ll_removeFirst(&list) == NULL && ll_removeLast(&list) == NULL);
  assert(ll_get(&list, 0) == NULL && ll_set(&list, 0, "x") == NULL);
  ll_insertAt(&list, -1, "x"); assert(ll_size(&list) == 0);
  ll_addFirst(&list, "a"); ll_addLast(&list, "c"); ll_insertAt(&list, 1, "b");
  assert(strcmp(ll_getFirst(&list), "a") == 0);
  assert(strcmp(ll_getLast(&list), "c") == 0);
  assert(strcmp(ll_set(&list, 1, "B"), "b") == 0);
  assert(ll_contains(&list, "B") && !ll_contains(&list, "yok"));
  ll_addLast(&list, "a");
  assert(ll_indexOf(&list, "a") == 0 && ll_lastIndexOf(&list, "a") == 3);
  assert(ll_indexOf(&list, "yok") == -1);
  assert(ll_remove(&list, "a"));
  assert(strcmp(ll_removeAt(&list, 1), "c") == 0);
  assert(strcmp(ll_removeLast(&list), "a") == 0);
  assert(strcmp(ll_removeFirst(&list), "B") == 0);
  assert(ll_isEmpty(&list) && !ll_remove(&list, "yok"));
  ll_clear(&list); ll_addFirst(&list, "yeniden"); ll_traversal(&list); ll_clear(&list);
  assert(ll_size(&list) == 0);
  puts("C API kontrolleri geçti.");
}
