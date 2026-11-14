# DEC-0009 — next-ports

Durum: Kabul edilmiş kullanıcı kararı; güncel hükümler sonraki ilişkili kararlarla birlikte okunur. Kaynak: [DECISIONS eski kayıt](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/docs/DECISIONS.source.md). Aşağıdaki tarih kaynakta verilen tarihtir; kabul, uygulama ve test ayrı olaylardır.

- 2026-10-13: Kullanıcı next bağlantı kararı: aynı Node’a gelen birden fazla ok aynı noktada birleşmez. Hedef sol kenarı eşit aralıklı girişlere bölünür; iki ok merkez çevresinde yukarı/aşağı simetriktir. Kaynaklar y/x/kimlik sırasıyla deterministik sıralanır. Aynı satırdaki ok yalnız giriş yüksekliği farkı kadar kısa radiuslu koridorda ayrılır; tek bağlantı merkezde düz kalır.

Kapsam: bu proje. Gerekçe: kaynakta belirtilenler dışında bilinmiyor. Uygulama ve doğrulama: kaynak kayıtları ve [doğrulama kaydı](../../docs/VALIDATION.md); kararın kabulü uygulama veya test kanıtı değildir.
