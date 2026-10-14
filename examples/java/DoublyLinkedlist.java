public class DoublyLinkedlist<T> {
  DNode<T> head;
  DNode<T> tail;
  private int size;
public boolean isEmpty() {
  boolean empty = head == null;
  return empty;
}

public int size() {
  int count = size;
  return count;
}

// Her bağlantı ayrı adımda kurulur.
public void addFirst(T value) {
  DNode<T> node = new DNode<>(value, null, null);

  // İleri bağlantıyı eski head’e kur.
  node.next = head;
  if (head != null) {
    // Eski head’in geri bağlantısı ayrı güncellenir.
    head.prev = node;
  } else {
    tail = node;
  }
  head = node;
  size++;
  return;
}
}
