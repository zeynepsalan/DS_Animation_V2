import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
/** Eğitim implementasyonu: Node ayrı sınıftır; tail alanı tutulmaz. */
public class SinglyLinkedlist<T> {
  private Node<T> head;
  private int size;
public boolean isEmpty() {
  boolean empty = head == null;
  return empty;
}

public int size() {
  int count = size;
  return count;
}

public void clear() {
  head = null;
  size = 0;
  return;
}

public void addFirst(T value) {
  Node<T> node = new Node<>(value, null);
  node.next = head;
  head = node;
  size++;
  return;
}

public void insertAt(int index, T value) {
  if (index < 0 || index > size) return;
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

public T removeAt(int index) {
  if (index < 0 || index >= size) return null;
  Node<T> current = head; Node<T> previous = null; int i = 0;
  while (i < index) {
    previous = current;
    current = current.next;
    i++;
  }
  if (previous == null) {
    head = current.next;
  } else {
    previous.next = current.next;
  }
  size--;
  return current.data;
}

public T removeFirst() {
  int index = 0;
  if (index < 0 || index >= size) return null;
  Node<T> current = head; Node<T> previous = null; int i = 0;
  while (i < index) {
    previous = current;
    current = current.next;
    i++;
  }
  if (previous == null) {
    head = current.next;
  } else {
    previous.next = current.next;
  }
  size--;
  return current.data;
}

public T removeLast() {
  int index = size - 1;
  if (index < 0 || index >= size) return null;
  Node<T> current = head; Node<T> previous = null; int i = 0;
  while (i < index) {
    previous = current;
    current = current.next;
    i++;
  }
  if (previous == null) {
    head = current.next;
  } else {
    previous.next = current.next;
  }
  size--;
  return current.data;
}

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

public T get(int index) {
  if (index < 0 || index >= size) return null;
  Node<T> current = head; int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T old = current.data;
  return old;
}

public T getFirst() {
  int index = 0;
  if (index < 0 || index >= size) return null;
  Node<T> current = head; int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T old = current.data;
  return old;
}

public T getLast() {
  int index = size - 1;
  if (index < 0 || index >= size) return null;
  Node<T> current = head; int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T old = current.data;
  return old;
}

public T set(int index, T value) {
  if (index < 0 || index >= size) return null;
  Node<T> current = head; int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T old = current.data;
  current.data = value;
  return old;
}

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

public boolean remove(T value) {
  Node<T> current = head; Node<T> previous = null;
  while (current != null) {
    if (Objects.equals(current.data, value)) break;
    previous = current;
    current = current.next;
  }
  if (current == null) return false;
  if (previous == null) {
    head = current.next;
  } else {
    previous.next = current.next;
  }
  size--;
  return true;
}

public List<T> traversal() {
  Node<T> current = head; List<T> output = new ArrayList<>();
  while (current != null) {
    output.add(current.data);
    current = current.next;
  }
  return output;
}
}
