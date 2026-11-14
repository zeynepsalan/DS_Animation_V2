# DEC-0034 — question-form

Durum: Kabul edilmiş kaynak süreç hükmü. Kapsam: bu proje; tekrar kullanılabilirliğe uygundur. Özgün karar tarihi: bilinmiyor; konsolidasyon/kayıt: 2026-11-14.

Kaynak: [özgün süreç belgesi](../../ORCHESTRATION/evidence/2026-11-14-documentation-migration/snapshot/ORCHESTRATION.source.md). Bağlam: kullanıcı ile yönetici/worker çalışma düzeni.

Karar: Sorular seçenekli ve serbest metinli formda sunulur, Gönder yanıtı aynı sohbete ulaştırır; kullanıcı ayrıca mesaj göndermemelidir. İzole v1 queue testi gerçekleşti, canlı v2 gerçek deploy yanıtı yoktur.

Gerekçe: kaynakta ayrıca belirtilmediyse bilinmiyor. Yerine aldığı / geçen: kaynakta belirtilmedi. Uygulama ve doğrulama: [güncel durum](../../ORCHESTRATION/context/CURRENT.md); kabul edilmesi, otomatik uygulama veya test edildiği anlamına gelmez.

## Kaynak ayrıntısı

- Kullanıcı soru tercihini şöyle ifade etti: “bana soracağın soruları bir html arayüzünde sor, cevaplar için şıklar ekle, ayrıca şıklarda cevabımı bulamazsam diye ekstra yazma alanım olsun. gönder butonuna bastığımda cevaplar direkt sana gelsin.” Sorular seçenekler ve serbest metin alternatifi sunan bir formda sorulur. Gönderilen yanıtı doğrudan aynı sohbete ileten yerleşik soru formu bu gereksinimi sağladığında kullanılabilir; sırf soru sormak için ayrı site, uygulama veya backend kurulmaz. Bu kayıt özel bir HTML dosyası yapıldığını veya özelleştirilmiş callback'in test edildiğini iddia etmez. Özel HTML gerektiğinde ancak gerçek host-chat bağlantısı varsa yanıtın gönderildiği söylenir; yalnız localStorage, clipboard veya download aynı sohbete gönderim değildir. Kullanıcı doldurup Gönder demeden seçili varsayılan karar veya onay sayılmaz. Gönderilen yanıtlar geldikten sonra kararlar ilgili kanonik dosyaya kaydedilir; cevaplanmamış form maddeleri onaylı gösterilmez.

Yerleşik soru formu kullanıcıya görünmediği için `tools/orchestration-questionnaire/` altında yerel HTML formu ve Python sunucusu hazırlandı. İlk sürümde receiver gerekliydi; otomatik `send_message_to_thread` aracı bulunamadı, başlangıçta ack yazılmadı ve yönetici kullanıcının mevcut mesajı üzerine yanıtı dosyadan okudu. Receiver artık gerekli değildir ve durduruldu.

Güncel sunucu yanıtı kaydettikten sonra desteklenen `codex queue` komutunu doğrudan kullanır. Başlatma ve mevcut sohbeti hedefleyen ortam değişkenleri [araç README'sinde](../../tools/orchestration-questionnaire/README.md) açıklanır; yeni sohbette doğru hedef yeniden yapılandırılmalıdır. Bu, global kurulum değildir. `queued` CLI kabulünü, eski `manager-read` ise yönetici okumasını gösterir. Belirsiz teslimde kör tekrar engellenir. İzole v1 teknik form testi, kullanıcı ek mesaj atmadan yeni yönetici turunun açılması ve test dosyasının okunmasına kadar doğrulandı. Canlı v2 formundan gerçek deploy yanıtı henüz gelmedi; yanıtlanmamış sorular karar değildir.

2026-11-14 kullanıcı gereksinimi: Gönder sonrasında yanıtın okunmasını tetiklemek için kullanıcının ayrıca sohbet mesajı göndermesi gerekmemelidir. Bu akış izole v1 teknik testiyle doğrulandı; canlı v2'nin gerçek kullanıcı yanıtıyla teslimi henüz gerçekleşmedi.
