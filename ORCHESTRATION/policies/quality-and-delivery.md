# Kalite ve teslim

[Kaynak karar](../../DECISIONS/orchestration/DEC-0031-tests-review.md): işlevsel veya riskli değişiklik grubu tamamlanınca uygun testler yapılır; uygulayıcı çalıştırabilir. Anlamlı her grup için uygulayıcıdan bağımsız inceleme yapılır. İnceleme test değildir. Yalnız dokümantasyon değişikliğinde uygulama testi gerekmez. Yapılan test, gözlem, kullanıcı kabulü ve production durumunu ayrı raporla.

Yönetici anlamlı, doğrulanmış değişikliğin yalnız ilgili dosyalarını kullanıcı hesabındaki GitHub'a normal push kararıyla gönderebilir; Git icrası worker'a devredilebilir. Production deploy ayrı karardır ve açık kalmıştır. Push; ignored/untracked dosyaları veya sohbetleri yedeklemez. Kritik kayıtların bağımsız yedeği önerilir; yeni servis kurulmuş değildir. Geri yükleme için uygun doğrulanmış yedekten dosyaları ayrı konuma kopyala, manifest hashlerini karşılaştır ve içerikleri incele; bu çalışmada restore testi yapıldığı varsayılmaz.
