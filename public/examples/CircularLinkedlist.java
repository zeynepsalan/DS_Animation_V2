import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
class Node<T> {
  T data;
  Node<T> next;
  public Node(T data, Node<T> next) {
    this.data = data;
    this.next = next;
  }
}

public class CircularLinkedlist<T> {
  Node<T> tail;
  private int size;
public boolean isEmpty() {
  return tail == null;
}

public int size() {
  return size;
}

public void clear() {
  if (tail == null) {
  return;
  }
  Node<T> current = tail.next;
  tail.next = null;
  tail = null;
  while (current != null) {
    Node<T> following = current.next;
  current.next = null;
    size--;
    current = following;
  }
  return;
}

public void addFirst(T value) {
  Node<T> node = new Node<>(value, null);
  if (tail == null) {
    node.next = node;
    tail = node;
  } else {
    node.next = tail.next;
    tail.next = node;
  }
  size++;
  return;
}

public void insertAt(int index, T value) {
  if (index < 0 || index > size) {
  return;
  }
  if (index == 0) {
    addFirst(value);
  return;
  }
  if (index == size) {
    addLast(value);
  return;
  }
  Node<T> previous = tail.next;
  int i = 0;
  while (i < index - 1) {
    previous = previous.next;
    i++;
  }
  Node<T> node = new Node<>(value, null);
  node.next = previous.next;
  previous.next = node;
  size++;
  return;
}

public void addLast(T value) {
  Node<T> node = new Node<>(value, null);
  if (tail == null) {
    node.next = node;
  } else {
    node.next = tail.next;
    tail.next = node;
  }
  tail = node;
  size++;
  return;
}

public T removeAt(int index) {
  if (index < 0 || index >= size) {
  return null;
  }
  if (index == 0) {
    return removeFirst();
  }
  if (index == size - 1) {
    return removeLast();
  }
  Node<T> previous = tail.next;
  int i = 0;
  while (i < index - 1) {
    previous = previous.next;
    i++;
  }
  Node<T> current = previous.next;
  T value = current.data;
  previous.next = current.next;
  current.next = null;
  size--;
  return value;
}

public T removeFirst() {
  if (tail == null) {
  return null;
  }
  Node<T> current = tail.next;
  T value = current.data;
  if (current == tail) {
    tail = null;
  } else {
    tail.next = current.next;
  }
  current.next = null;
  size--;
  return value;
}

public T removeLast() {
  if (tail == null) {
  return null;
  }
  if (tail.next == tail) {
    return removeFirst();
  }
  Node<T> previous = tail.next;
  while (previous.next != tail) {
    previous = previous.next;
  }
  Node<T> current = tail;
  T value = current.data;
  previous.next = current.next;
  tail = previous;
  current.next = null;
  size--;
  return value;
}

public int indexOf(T value) {
  Node<T> current = tail == null ? null : tail.next;
  int i = 0;
  while (i < size) {
    if (Objects.equals(current.data, value)) {
  return i;
  }
    current = current.next;
    i++;
  }
  return -1;
}

public T get(int index) {
  if (index < 0 || index >= size) {
  return null;
  }
  Node<T> current = tail.next;
  int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  return current.data;
}

public T getFirst() {
  if (tail == null) {
  return null;
  }
  return tail.next.data;
}

public T getLast() {
  if (tail == null) {
  return null;
  }
  return tail.data;
}

public T set(int index, T value) {
  if (index < 0 || index >= size) {
  return null;
  }
  Node<T> current = tail.next;
  int i = 0;
  while (i < index) {
    current = current.next;
    i++;
  }
  T oldValue = current.data;
  current.data = value;
  return oldValue;
}

public boolean contains(T value) {
  int index = indexOf(value);
  return index != -1;
}

public int lastIndexOf(T value) {
  Node<T> current = tail == null ? null : tail.next;
  int i = 0;
  int found = -1;
  while (i < size) {
    if (Objects.equals(current.data, value)) {
      found = i;
  }
    current = current.next;
    i++;
  }
  return found;
}

public boolean remove(T value) {
  int index = indexOf(value);
  if (index == -1) {
  return false;
  }
  removeAt(index);
  return true;
}

public List<T> traversal() {
  List<T> values = new ArrayList<>();
  Node<T> current = tail == null ? null : tail.next;
  int i = 0;
  while (i < size) {
    values.add(current.data);
    current = current.next;
    i++;
  }
  return values;
}
}
