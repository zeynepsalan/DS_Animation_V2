/**
 * Node yalnızca veri ve bir sonraki Node'a referans taşır.
 * Angular'ı veya listeyi bilmez: aynı sınıf başka bağlı yapılarda da kullanılabilir.
 * T generic tür parametresidir; Node<string> ve Node<number> aynı yapıyı kullanır.
 */
export class Node<T> {
  // Her yeni Node için görselde kullanılacak benzersiz kimlik sayacını tutar.
  private static sequence = 0;
  // Kimlik, adımlar arasında aynı Node’u izlemeyi sağlar ve sonradan değiştirilemez.
  readonly id: string;

  // Veri ve başlangıç bağlantısı çağıran tarafından açıkça verilir.
  constructor(
    // public parametre, verilen veriyi aynı adlı nesne alanına kaydeder.
    public data: T,
    // null listenin sonunu; bir Node referansı sonraki elemanı temsil eder.
    public next: Node<T> | null,
    // Snapshot geri yüklenirken mevcut görsel kimlik yeniden kullanılabilir.
    id?: string,
  ) {
    // id sadece görselde aynı nesneyi adımlar boyunca takip etmek içindir.
    this.id = id ?? `n${++Node.sequence}`;
  }
}
