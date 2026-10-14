/**
 * DNode veri ile önceki ve sonraki nesne referanslarını taşır.
 * Listeyi ve Angular'ı bilmez; başka çift bağlantılı yapılarda da kullanılabilir.
 * Constructor sırası kullanıcının seçtiği data, prev, next şeklindedir.
 */
export class DNode<T> {
  // Ayrı sayaç ve dn öneki, Node kimlikleriyle görsel kimlik çakışmasını önler.
  private static sequence = 0;
  // Sabit kimlik, animasyon ve snapshot geri yüklemede aynı nesneyi takip eder.
  readonly id: string;

  // Üç temel parametre zorunludur; uç bağlantılar için açıkça null verilir.
  constructor(
    // Generic veri hem metin hem sayısal değerler gibi farklı türleri destekler.
    public data: T,
    // prev önceki nesnenin kendisine referanstır; bir kopya oluşturmaz.
    public prev: DNode<T> | null,
    // next sonraki nesneyi gösterir; null bu yönde bağlantı olmadığını belirtir.
    public next: DNode<T> | null,
    // Yalnız snapshot geri yükleme mevcut görsel kimliği tekrar verebilir.
    id?: string,
  ) {
    // Kimlik algoritmadaki bellek adresi değildir; yalnız görsel takip içindir.
    this.id = id ?? `dn${++DNode.sequence}`;
  }
}
