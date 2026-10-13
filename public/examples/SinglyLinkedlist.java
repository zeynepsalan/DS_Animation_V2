import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
  // Bağımsız Node: liste işlemleri bu sınıfa ait değildir.
class Node<T> {
  T data;
  Node<T> next;
  // next bir Node kopyası değil, aynı nesneye referanstır.
  public Node(T data, Node<T> next) {
    this.data = data;
  // Constructor next parametresini saklar; null ya da mevcut bir Node verilebilir.
    this.next = next;
  }
}

/** Eğitim implementasyonu: Node ayrı sınıftır; tail alanı tutulmaz. */
public class SinglyLinkedlist<T> {
  private Node<T> head;
  private int size;
  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public boolean isEmpty() {
  boolean empty = head == null;
  return empty;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public int size() {
  int count = size;
  return count;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public void clear() {
  // Java erişilemeyen Node’ları GC ile toplar; C belleği açıkça serbest bırakır.
  head = null;
  size = 0;
  return;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public void addFirst(T value) {
  // Önce eski head’i next’e bağla; sonra head’i değiştir.
  Node<T> node = new Node<>(value, null);
  node.next = head;
  head = node;
  size++;
  return;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public void insertAt(int index, T value) {
  if (index < 0 || index > size) return; // Geçersiz index
  Node<T> node = new Node<>(value, null);
  if (index == 0) {
    node.next = head;
    head = node;
  } else {
    Node<T> previous = head; int i = 0;
    while (i < index - 1) {
      previous = previous.next;
      i++;
    }
    node.next = previous.next;
    previous.next = node;
  }
  size++;
  return;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public void addLast(T value) {
  Node<T> node = new Node<>(value, null);
  if (head == null) {
    head = node;
  } else {
    Node<T> current = head;
    while (current.next != null) {
      current = current.next;
    }
    current.next = node;
  }
  size++;
  return;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public T removeAt(int index) {
  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node<T> current = head; Node<T> previous = null; int i = 0;
  while (i < index) {
    previous = current;
    current = current.next;
    i++;
  }
  // Silinen Node yerine onun next hedefini bağla.
  if (previous == null) {
    head = current.next;
  } else {
    previous.next = current.next;
  }
  size--;
  return current.data;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public T removeFirst() {
  int index = 0;
  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node<T> current = head; Node<T> previous = null; int i = 0;
  while (i < index) {
    previous = current;
    current = current.next;
    i++;
  }
  // Silinen Node yerine onun next hedefini bağla.
  if (previous == null) {
    head = current.next;
  } else {
    previous.next = current.next;
  }
  size--;
  return current.data;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public T removeLast() {
  int index = size - 1;
  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node<T> current = head; Node<T> previous = null; int i = 0;
  while (i < index) {
    previous = current;
    current = current.next;
    i++;
  }
  // Silinen Node yerine onun next hedefini bağla.
  if (previous == null) {
    head = current.next;
  } else {
    previous.next = current.next;
  }
  size--;
  return current.data;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public int indexOf(T value) {
  Node<T> current = head; int i = 0; int found = -1;
  while (current != null) {
    if (Objects.equals(current.data, value)) {
      found = i;
      break;
    }
    current = current.next;
    i++;
  }
  return found;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public T get(int index) {
  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node<T> current = head; int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T old = current.data;
  return old;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public T getFirst() {
  int index = 0;
  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node<T> current = head; int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T old = current.data;
  return old;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public T getLast() {
  int index = size - 1;
  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node<T> current = head; int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T old = current.data;
  return old;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public T set(int index, T value) {
  if (index < 0 || index >= size) return null; // Geçersiz index veya boş liste
  // Hedefe ulaşana kadar next bağlantılarını takip et.
  Node<T> current = head; int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T old = current.data;
  current.data = value;
  return old;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public boolean contains(T value) {
  Node<T> current = head; int i = 0; int found = -1;
  while (current != null) {
    if (Objects.equals(current.data, value)) {
      found = i;
      break;
    }
    current = current.next;
    i++;
  }
  boolean exists = found != -1;
  return exists;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public int lastIndexOf(T value) {
  Node<T> current = head; int i = 0; int found = -1;
  while (current != null) {
    if (Objects.equals(current.data, value)) {
      found = i;
    }
    current = current.next;
    i++;
  }
  return found;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public boolean remove(T value) {
  Node<T> current = head; Node<T> previous = null;
  while (current != null) {
    if (Objects.equals(current.data, value)) break;
    previous = current;
    current = current.next;
  }
  if (current == null) return false;
  // Silinen Node yerine onun next hedefini bağla.
  if (previous == null) {
    head = current.next;
  } else {
    previous.next = current.next;
  }
  size--;
  return true;
}

  // Geçersiz işlemler if kontrolleriyle listeyi değiştirmeden sonlandırılır.
public List<T> traversal() {
  Node<T> current = head; List<T> output = new ArrayList<>();
  while (current != null) {
    output.add(current.data);
    current = current.next;
  }
  return output;
}
}
