# Yerel soru formu

Bu araç yalnız loopback adresinde çalışır. `codex queue --help` ile belgelenen mevcut oturuma mesaj kuyruklama komutunu kullanır; ayrı agent veya model açmaz. Kod içine sohbet kimliği, port, kimlik bilgisi veya kullanıcı yanıtı yazılmaz.

Başlatmadan önce süreç ortamında `QUESTIONNAIRE_THREAD_ID` hedef mevcut sohbet UUID'si, `QUESTIONNAIRE_CODEX` ise `command -v codex` ile bulunan mutlak çalıştırılabilir dosya yolu olmalıdır. `QUESTIONNAIRE_PORT` isteğe bağlıdır (varsayılan rastgele boş port). `QUESTIONNAIRE_RUNTIME` isteğe bağlıdır; varsayılan Git dışında tutulan `runtime/` dizinidir.

Sunucu `python3 tools/orchestration-questionnaire/server.py` ile çalıştırılır. Adresi stdout'a yazar. Süreç durmuşsa yeniden başlatılmalıdır; yeni sohbet için hedef kimliği yeniden yapılandırılır. Bu yerel başlatma sistem genelinde kalıcı servis kurulumu değildir.

Gönderim önce `<submitId>.response.json` dosyasını atomik yazar. Ardından `codex queue --thread … --message …` çağrısı yapılır (`shell=False`, 25 saniye timeout). Mesaj 1000 UTF-8 baytını aşmaz; uzun cevap dosyada kalır. CLI exit0 sonrası `<submitId>.ack.json` dosyasındaki `state: queued` yalnız sohbet kuyruğuna kabulü belirtir. Bu durum cevapların okunduğu veya karar kaydının tamamlandığı anlamına gelmez. Aktif sohbet mevcut işi bitirdiğinde kuyruktaki mesaj yeni tur başlatır; bunun için kullanıcının ayrıca sohbet mesajı göndermesi gerekmez.

Aynı süreçte eşzamanlı tekrarlar kilitle korunur. Aynı kimlik ve aynı içerik yeniden gönderilince mevcut ack ikinci queue çağrısını engeller; farklı içerik 409 döner. Süreç oluşturulamaması (OSError) cevap dosyasını korur ve güvenli tekrar deneme sunar. CLI çağrısından önce atomik `.delivery.json` dispatching kaydı yazılır. Timeout, nonzero çıkış, süreç çökmesi veya kabul sonrası ack yazma hatasında sonuç belirsizdir: UI açıkça bunu söyler ve yeniden gönderimi engeller. Yeniden başlatmada dispatching kaydı da unknown sayılır. Yönetici teslim durumunu doğrulamadan tekrar queue yapılmaz; tam exactly-once garantisi yoktur. Eski yanıtlar sunucu başlatılırken kendiliğinden tekrar gönderilmez.

Sunucu yeniden başlatıldığında token değişir. Yeni form kodu eski token hatasında cevabı koruyup token'ı yeniler ve yeniden Gönder'e basılmasını ister. Eski kodu açık tutan sekmelerde sayfayı yenilemek gerekir; aynı sekmedeki taslak sessionStorage'dan geri yüklenir. Kullanıcının gerçek yanıt dosyaları testte kullanılmaz.

Kontrol: `python3 tools/orchestration-questionnaire/test_server.py`. Testler geçici runtime ve sahte CLI kullanır. Gerçek sohbet testi ayrıca açıkça teknik test olarak işaretlenmelidir; bu test kullanıcı kararı değildir.

Form v2 yalnız açık production deploy sorusunu gönderir; worker/worktree kararları tekrar sorulmaz. Eski v1 dosyaları korunur; v1 POST schema_changed döner ve taslağı koruyarak sayfanın yenilenmesini ister. Eski manager-read ack durumları read olarak sunulur, codex-queue kabulü sayılmaz.
