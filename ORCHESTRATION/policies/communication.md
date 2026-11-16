# İletişim ve karar kaydı

[Kullanıcı kararı](../../DECISIONS/orchestration/DEC-0032-decision-preservation.md): yönetici her ara ve final mesajının sonunda doğrudan sohbette gerçek `Worker | Görev | Model | Durum` tablosu gösterir. Atanmamış worker veya tahmini model yazılmaz. Yeni kararlar tarih, kapsam, kaynak, biliniyorsa gerekçe ve yerini aldığı kayıtla kanonik indekse eklenir; bilinmeyen bilgi uydurulmaz, öneri karar diye yazılmaz.

Kullanıcının soruları seçenekli, serbest metinli ve Gönder ile aynı sohbete iletilen formda sunulur. Yerleşik form görünmediğinde yerel araç [README](../../tools/orchestration-questionnaire/README.md) uyarınca desteklenen `codex queue` kullanır. İzole v1 testinin ardından canlı v2 gerçek yanıtı da queue ile yeni yönetici turu açtı ve yönetici tarafından okundu; karar [DEC-0035](../../DECISIONS/orchestration/DEC-0035-production-deploy-approval.md) içindedir. Kullanıcı ayrıca sohbet mesajı göndermek zorunda olmamalıdır. Gönderilmemiş veya alınmamış yanıt onay değildir.

Proje ve süreç bağlamını kullanıcı ayrıca istemeden uygun kanonik kayda işle; kullanıcı uzaktayken soruları soru arayüzüne koy, karar bekleyen bağımlı işi ilerletme ve gerçek engelde güvenle dur ([DEC-0040](../../DECISIONS/orchestration/DEC-0040-proactive-context.md)).
