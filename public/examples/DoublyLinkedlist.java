  // Bağımsız DNode: iki bağlantıyı saklar; komşuların alanlarını otomatik değiştirmez.
class DNode<T> {
  T data;
  DNode<T> prev;
  DNode<T> next;

  // Önce nesne oluşturulur; ardından her alan ayrı adımda atanır.
  public DNode(T data, DNode<T> prev, DNode<T> next) {


  // data parametresini nesnenin veri alanına kaydet.
    this.data = data;
  // prev önceki nesneye referans veya null olabilir.
    this.prev = prev;
  // next sonraki nesneye referans veya null olabilir.
    this.next = next;
  }
}

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
