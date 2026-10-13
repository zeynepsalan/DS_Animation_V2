/** java -ea Demo: sözleşmeleri assert ile kontrol eden çalıştırılabilir örnek. */
public class Demo {
  public static void main(String[] args) {
    SinglyLinkedlist<String> list = new SinglyLinkedlist<>();
    assert list.isEmpty() && list.size() == 0;
    assert list.removeFirst() == null && list.removeLast() == null;
    assert list.get(0) == null && list.set(0, "x") == null;
    list.insertAt(-1, "x"); assert list.size() == 0;
    list.addFirst("a"); list.addLast("c"); list.insertAt(1, "b");
    assert list.traversal().equals(java.util.List.of("a", "b", "c"));
    assert list.getFirst().equals("a") && list.getLast().equals("c");
    assert list.set(1, "B").equals("b");
    assert list.contains("B") && !list.contains("yok");
    list.addLast("a");
    assert list.indexOf("a") == 0 && list.lastIndexOf("a") == 3;
    assert list.indexOf("yok") == -1;
    assert list.remove("a");
    assert list.removeAt(1).equals("c");
    assert list.removeLast().equals("a");
    assert list.removeFirst().equals("B");
    assert list.isEmpty() && !list.remove("yok");
    list.clear(); list.addFirst("yeniden"); list.clear(); assert list.size() == 0;
    System.out.println("Java API kontrolleri geçti.");
  }
}
