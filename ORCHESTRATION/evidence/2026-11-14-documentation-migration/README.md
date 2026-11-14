# Belge göçü kanıtı

Baseline: `cb22c7fe4fcf33da8fb55c406a427919588c04b1`. Erişilen 11 tracked Markdown, Git blobuyla byte karşılaştırılıp [manifest](manifest.json) ile boyut, SHA-256 ve blob kaydedildi. [Kapsama defteri](coverage.json) 590 başlık, liste öğesi veya paragrafı kaynak satırları, blok hash'i, hedef ve işleme biçimiyle eşler. Kapsama sayısı semantik doğruluğu tek başına kanıtlamaz; bağımsız kaynak karşılaştırması gereklidir.

Snapshot'lar özgün byte'ları korur; relative linkler arşiv konumunda çözülecek şekilde değiştirilmedi ve aktif bağlantı kontrolünden bu nedenle çıkarıldı. AGENTS snapshot adı otomatik talimat olarak yüklenmemesi için AGENTS.source.md'dir. Runtime, gerçek cevaplar, credentials ve global kişisel memory arşivlenmedi. Bilinmeyen eski sohbetlerin eksiksizliği doğrulanamaz.

Doğrulama: `python3 tools/verify-documentation.py`. Restore gerektiğinde snapshot dosyasını manifestteki source yoluna ayrı bir çalışma alanında kopyalayın ve SHA-256 karşılaştırın; restore testi burada yapılmış sayılmaz.
