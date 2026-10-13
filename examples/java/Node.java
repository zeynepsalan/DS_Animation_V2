  // Bağımsız Node: liste işlemleri bu sınıfa ait değildir.
public class Node<T> {
  T data;
  Node<T> next;
  // next bir Node kopyası değil, aynı nesneye referanstır.
  public Node(T data, Node<T> next) {
    this.data = data;
  // Constructor next parametresini saklar; null ya da mevcut bir Node verilebilir.
    this.next = next;
  }
}
