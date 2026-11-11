import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
class DNode<T> {
  T data;
  DNode<T> prev;
  DNode<T> next;
  public DNode(T data, DNode<T> prev, DNode<T> next) {
    this.data = data;
    this.prev = prev;
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

public void clear() {
  DNode<T> current = head;
  head = null;
  tail = null;
  DNode<T> following = null;
  while (current != null) {
    following = current.next;
    current.prev = null;
    current.next = null;
    current = following;
  }
  size = 0;
  return;
}

public void addFirst(T value) {
  DNode<T> node = new DNode<>(value, null, null);
  node.next = head;
  if (head != null) {
    head.prev = node;
  } else {
    tail = node;
  }
  head = node;
  size++;
  return;
}

public void insertAt(int index, T value) {
  if (index < 0 || index > size) {
    return;
  }
  DNode<T> current;
  if (index == size) {
    current = null;
  } else {
    int i;
    if (index < size / 2.0) {
      current = head;
      i = 0;
    } else {
      current = tail;
      i = size - 1;
    }
    while (i != index) {
      if (i < index) {
        current = current.next;
        i++;
      } else {
        current = current.prev;
        i--;
      }
    }
  }
  DNode<T> previous = current != null ? current.prev : tail;
  DNode<T> node = new DNode<>(value, null, null);
  node.prev = previous;
  node.next = current;
  if (previous != null) {
    previous.next = node;
  } else {
    head = node;
  }
  if (current != null) {
    current.prev = node;
  } else {
    tail = node;
  }
  size++;
  return;
}

public void addLast(T value) {
  DNode<T> node = new DNode<>(value, null, null);
  node.prev = tail;
  if (tail != null) {
    tail.next = node;
  } else {
    head = node;
  }
  tail = node;
  size++;
  return;
}

public T removeAt(int index) {
  if (index < 0 || index >= size) {
    return null;
  }
  DNode<T> current;
  int i;
  if (index < size / 2.0) {
    current = head;
    i = 0;
  } else {
    current = tail;
    i = size - 1;
  }
  while (i != index) {
    if (i < index) {
      current = current.next;
      i++;
    } else {
      current = current.prev;
      i--;
    }
  }
  T oldValue = current.data;
  DNode<T> previous = current.prev;
  DNode<T> following = current.next;
  if (previous != null) {
    previous.next = following;
  } else {
    head = following;
  }
  if (following != null) {
    following.prev = previous;
  } else {
    tail = previous;
  }
  current.prev = null;
  current.next = null;
  size--;
  return oldValue;
}

public T removeFirst() {
  if (head == null) {
    return null;
  }
  DNode<T> current = head;
  T oldValue = current.data;
  DNode<T> previous = current.prev;
  DNode<T> following = current.next;
  if (previous != null) {
    previous.next = following;
  } else {
    head = following;
  }
  if (following != null) {
    following.prev = previous;
  } else {
    tail = previous;
  }
  current.prev = null;
  current.next = null;
  size--;
  return oldValue;
}

public T removeLast() {
  if (tail == null) {
    return null;
  }
  DNode<T> current = tail;
  T oldValue = current.data;
  DNode<T> previous = current.prev;
  DNode<T> following = current.next;
  if (previous != null) {
    previous.next = following;
  } else {
    head = following;
  }
  if (following != null) {
    following.prev = previous;
  } else {
    tail = previous;
  }
  current.prev = null;
  current.next = null;
  size--;
  return oldValue;
}

public int indexOf(T value) {
  DNode<T> current = head;
  int i = 0;
  while (current != null) {
    boolean matched = Objects.equals(current.data, value);
    if (matched) {
      int found = i;
      return found;
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
  DNode<T> current;
  int i;
  if (index < size / 2.0) {
    current = head;
    i = 0;
  } else {
    current = tail;
    i = size - 1;
  }
  while (i != index) {
    if (i < index) {
      current = current.next;
      i++;
    } else {
      current = current.prev;
      i--;
    }
  }
  T value = current.data;
  return value;
}

public T getFirst() {
  if (head == null) {
    return null;
  }
  DNode<T> current = head;
  T value = current.data;
  return value;
}

public T getLast() {
  if (tail == null) {
    return null;
  }
  DNode<T> current = tail;
  T value = current.data;
  return value;
}

public T set(int index, T value) {
  if (index < 0 || index >= size) {
    return null;
  }
  DNode<T> current;
  int i;
  if (index < size / 2.0) {
    current = head;
    i = 0;
  } else {
    current = tail;
    i = size - 1;
  }
  while (i != index) {
    if (i < index) {
      current = current.next;
      i++;
    } else {
      current = current.prev;
      i--;
    }
  }
  T oldValue = current.data;
  current.data = value;
  return oldValue;
}

public boolean contains(T value) {
  DNode<T> current = head;
  int i = 0;
  while (current != null) {
    boolean matched = Objects.equals(current.data, value);
    if (matched) {
      boolean found = true;
      return found;
    }
    current = current.next;
    i++;
  }
  return false;
}

public int lastIndexOf(T value) {
  DNode<T> current = tail;
  int i = size - 1;
  while (current != null) {
    boolean matched = Objects.equals(current.data, value);
    if (matched) {
      int found = i;
      return found;
    }
    current = current.prev;
    i--;
  }
  return -1;
}

public boolean remove(T value) {
  DNode<T> current = head;
  while (current != null) {
    boolean matched = Objects.equals(current.data, value);
    if (matched) {
      T oldValue = current.data;
      DNode<T> previous = current.prev;
      DNode<T> following = current.next;
      if (previous != null) {
        previous.next = following;
      } else {
        head = following;
      }
      if (following != null) {
        following.prev = previous;
      } else {
        tail = previous;
      }
      current.prev = null;
      current.next = null;
      size--;
      return true;
    }
    current = current.next;
  }
  return false;
}

public List<T> traversal() {
  List<T> output = new ArrayList<>();
  DNode<T> current = head;
  int i = 0;
  while (current != null) {
    output.add(current.data);
    current = current.next;
    i++;
  }
  return output;
}
}
