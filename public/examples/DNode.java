  // Bağımsız DNode: iki bağlantıyı saklar; komşuların alanlarını otomatik değiştirmez.
public class DNode<T> {
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
