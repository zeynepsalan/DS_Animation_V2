# Yerel plan ve soru alanı

Yalnız loopback üzerinde çalışan bu araç, **Orkestrasyon** ve **Proje Planı ve Mimari** kategorilerini ayırır. Plan kategorisinde Plan, Mimari, UML, Kaynaklar ve Sorular bölümleri vardır. Kanonik Markdown dosyaları salt okunur allowlist üzerinden sunulur; bu araç Angular ürün uygulamasını değiştirmez.

## Başlatma

Süreç ortamına `QUESTIONNAIRE_THREAD_ID` (hedef mevcut sohbet UUID), `QUESTIONNAIRE_CODEX` (`command -v codex` ile bulunan mutlak CLI yolu) verin. `QUESTIONNAIRE_PORT` isteğe bağlıdır; varsayılan boş port seçilir. `QUESTIONNAIRE_RUNTIME` varsayılanı Git dışında tutulan `runtime/` dizinidir. Sohbet kimliği veya yanıtlar kaynak koda yazılmaz.

`python3 tools/orchestration-questionnaire/start_server.py` terminal/worker ömründen bağımsız, `start_new_session=True` ve kapalı stdin ile başlatır. Log ve PID özel runtime dizinindedir. Kullanımdaki portta bulunan süreci kendiliğinden kapatmaz. Doğrudan ön planda başlatmak için `python3 tools/orchestration-questionnaire/server.py` kullanılabilir. Sistem genelinde servis kurulmaz. Yeniden başlatmadan önce PID'nin gerçekten bu araca ait olduğunu doğrulayın; gerçek yanıt/ack/delivery dosyalarını silmeyin veya değiştirmeyin.

Adres sonuna `#project-planning/plan`, `#project-planning/architecture`, `#project-planning/uml`, `#project-planning/sources`, `#project-planning/questions` veya `#orchestration/questions` eklenebilir.

## Cevapların korunması ve anlamı

`catalog.json` v3 kategorileri, kalıcı soru kimliklerini, revizyonları ve seçenekleri tanımlar. Sorunun anlamı veya seçenekleri değişirse revizyon ve katalog sürümü yükseltilir. Her yeni yanıt soru kimliği/revizyonu ile **başlık, açıklama ve tüm seçenek etiketlerini** snapshot olarak taşır. Sunucu bunları katalogla birebir doğrular. Eski v1/v2 soruları `legacy-catalog.json` içindeki sabit özgün sıralarıyla eşleşir; bu dosyanın tarihsel anlamı değiştirilmez. Eski sorular ve tüm seçenekler karar kaydıyla birlikte görünür; tekrar yanıtlanmaları istenmez. Ham geçmiş dosyaları hiçbir adapter tarafından yeniden yazılmaz.

Yeni gönderimde dört kanonik belgenin (`PROJECT_PLAN`, `ARCHITECTURE`, `UML`, `SOURCE_MAP`) yol ve SHA-256 kimlikleri de taşınır. Belgeler GET ve POST arasında değişirse 409 `documents_changed` döner; yanıt kaydedilmez ve queue çağrılmaz. Taslak korunur, güncel belgeleri okuyup tekrar gönderme istenir. Başarılı yanıtın özel `.response.json` kaydı `artifactSnapshot` içinde onaya konu olan dört belgenin tam metnini ve hashlerini saklar. Böylece sonraki belge düzenlemeleri geçmiş yanıtın bağlı olduğu öneriyi değiştirmez. Bu özel bundle'lar Git'e alınmaz.

Taslaklar kategori/katalog/soru revizyonuna göre tarayıcı `localStorage` alanında korunur. Sekme geçişi ve sayfa yenileme yanıtları silmez. Önceki revizyon taslakları ayrı okunur bölümde kalır; başka soruya otomatik uygulanmaz. Eski v1/v2 `sessionStorage` taslakları da silinmez. Depolama engellenirse kullanıcıya açık uyarı gösterilir. Host, Origin ve oturum token'ı doğrulanır; özel GET uçları token gerektirir. Kullanıcı metni HTML olarak yorumlanmaz. Belgelerde yalnız bilinen araç bölümlerine ait bağlantılar etkinleştirilir; PDF dosyaları sunulmaz, kaynak adları ve sayfaları okunabilir metindir.

## Sohbete iletim

Yanıt önce `<submitId>.response.json` olarak atomik kaydedilir. Ardından desteklenen `codex queue --thread … --message …` çağrılır (`shell=False`, 25 saniye timeout). Uzun cevap dosyada kalır; kuyruk mesajı yalnız kısa dosya bildirimidir, ayrı model/agent açılmaz. Exit 0 sonrası `.ack.json` içindeki `queued` yalnız kuyruk kabulünü belirtir; yönetici okuması değildir. Eski `manager-read` ack'i ayrı `read` durumu taşır.

Eşzamanlı aynı gönderi bir CLI çağrısı üretir. Aynı kimlik/farklı içerik 409 döner. Aynı kimlik/aynı içerik, belgeler daha sonra değişse bile zaten kaydedilen gönderiye bağlanır. Süreç oluşturma OSError hatası güvenli tekrar denemeye açıktır. Queue çağrısından önce `.delivery.json` dispatching niyeti atomik yazılır. Timeout, nonzero, çökme veya kabul sonrası ack yazma hatası **unknown** sayılır ve yeniden gönderim engellenir; yönetici doğrulamadan kör tekrar yapılmaz. Tam exactly-once garantisi yoktur. Sunucu açılışta geçmiş yanıtları yeniden queue etmez. Token restart sonrası değişince taslak silinmeden yenilenir.

## Çevrimdışı UML

`render_diagrams.py` kanonik `docs/UML.md` Mermaid bloklarını yerel SVG'ye çevirir. Resmî [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) `@mermaid-js/mermaid-cli@12.2.0`, örneğin `/tmp/questionnaire-mermaid-render` gibi repo dışı cache ortamına kurulabilir; ürün package/lock dosyaları değiştirilmez. CLI yolu `--mmdc /tam/yol/mmdc` ile verilir. Gerekiyorsa mevcut Chrome yolu `PUPPETEER_EXECUTABLE_PATH` ortam değişkeniyle belirtilir.

`python3 tools/orchestration-questionnaire/render_diagrams.py --mmdc /tam/yol/mmdc`

`static/diagrams.json` kaynak SHA-256 ve render aracı provenansını içerir. UI hash eşleşmeyen eski görseli göstermez; belge değişince tekrar render gerekir. Mevcut ve taslak başlıkları kaynakla aynıdır. Runtime CDN gerektirmez; Sığdır, büyüt/küçült ve Gerçek boyut kontrolleri diyagram alanı içinde çalışır.

## Doğrulama ve sınırlamalar

`python3 tools/orchestration-questionnaire/test_server.py`: izole geçici runtime ile queue hataları/idempotency, sahte CLI alt süreci, sürüm/snapshot doğrulaması, belge değişimi, geçmişin değişmezliği, Host/Origin/token ve allowlist kontrolü. Gerçek kullanıcı dosyaları test fixture değildir; gerçek sohbet callback testi ancak açıkça teknik test olarak ayrıca koordine edilir.

2026-11-16 arayüz geçişi `layout/flow` kapsamındadır; ürünün `docs/DESIGN.md` indigo/açık yüzey paleti ve mevcut formun system font, 12px kart, 8px buton, 20px içerik ritmi korunur. Hareket veya yeni görsel varlık yoktur; SVG'ler kanonik diyagram çıktısıdır. Checkpoint `/tmp/questionnaire-checkpoint/` orijinal dört araç dosyasını tutar; yalnız araç dosyaları geri alınabilir. Web Vitals/INP ölçülmedi. Tarayıcı gözlemi kullanıcı kabulü veya production kabulü değildir; deploy yapılmadı.
