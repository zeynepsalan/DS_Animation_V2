# Çalışma ekranı tasarım sözleşmesi

## Yetki ve kapsam
Kullanıcının docs/DECISIONS.md ve AGENTS.md gereksinimleri esastır. 2026-10-13 değişikliği layout/flow kapsamındadır. Tek dosya yazarı Codex; Claude Code salt okunur ve sınırlı kaynak incelemesi yaptı. Yeni asset, paket veya ücretli servis eklenmedi.

## Yerleşim
Öğrenci kod ile animasyonu eşzamanlı karşılaştırır. Ana eylem method imzasına parametre girip Run kullanmaktır. Üç seçenek değerlendirildi: üstte büyük ders başlığı (fazla yükseklik tüketiyor), üstte kompakt dosya yolu (seçildi), kod içinde ek konum başlığı (tekrarlı içerik). Seçilen konum üst bardadır; kod alanında dil sekmeleri kalır.
Masaüstünde Sidebar / Code / Visualization; dar ekranda kod ve görsel üst üste, Sidebar açılabilir katmandır. Sayfa 100dvh içinde kalır; kod, Sidebar ve kart içerikleri gerekirse kendi içinde kayar. Bilgi kartları 1:3 oranını korur. Öğretici açıklamalar Türkçe; teknik keywordler İngilizce.

## Tokenlar ve biçim
src/styles.css: --bg #ffffff, --panel #1e2046, --surface #2d305b, --line #42466e, --muted #b4bedb, --text #e6edf8, --blue #a4d8f5. Parameter input #3b3f70. Hata #ffb3c4. Sistem sans-serif ve mevcut monospace stack korunur. Kart radius 9–12px; aralık 8–10px; çalışma üst boşluğu 12px. Bilgi kartı başlıkları 9px, açıklama 12px/1.5. Mevcut sembol ikonları ve erişilebilir button adları korunur. Animasyon motoru değiştirilmedi; reduced-motion davranışı korunur.

## Kontrol ve geri alma
Değişiklik öncesi dosyalar /tmp/ds-layout-checkpoint altında; ön görünüm /tmp/ds-before.png. Geri alma yalnız görev dosyaları incelenerek yapılmalı; sonraki değişiklikler korunmalıdır. Source testleri ve browser ölçümleri docs/VALIDATION.md içindedir. Kullanıcı kabulü henüz alınmadı; production yayını yapılmadı. Web Vitals ve frame performansı ölçülmedi; bu değişiklikte yeni media/motion eklenmedi. Build boyutu ayrıca kaydedilir.
