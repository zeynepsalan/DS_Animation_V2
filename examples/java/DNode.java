public class DNode<T> {
  T data;
  DNode<T> prev;
  DNode<T> next;
  public DNode(T data, DNode<T> prev, DNode<T> next) {
    this.data = data;
    this.prev = prev;
    this.next = next;
  }
}
