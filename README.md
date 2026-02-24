# Spam SMS Engelleyici 🛡️

Türkçe bahis, casino ve dolandırıcılık SMS'lerini yapay zeka destekli kelime analizi ile otomatik engelleyen iOS/Android uygulaması.

## Özellikler
- 📥 Gelen kutusu (normal mesajlar)
- 🚫 Spam kutusu (engellenen mesajlar, kategorize)
- 🛡️ Koruma paneli (istatistikler, haftalık grafik)
- ⚙️ Ayarlar (özel anahtar kelimeler ekle/sil)

## IPA Oluşturma (EAS Build)

Bu proje Expo Application Services (EAS) ile IPA üretir.

### Gereksinimler
1. [Expo hesabı](https://expo.dev) oluştur ve EXPO_TOKEN al
2. GitHub Repo → Settings → Secrets → `EXPO_TOKEN` ekle

### Otomatik Build
`main` branch'e her push yapıldığında GitHub Actions otomatik olarak `preview` profili ile iOS IPA üretir.

### Manuel Build
```bash
# Bağımlılıkları kur
npm install

# EAS CLI'yi kur
npm install -g eas-cli

# Giriş yap
eas login

# IPA oluştur (preview = Ad Hoc dağıtım)
eas build --platform ios --profile preview

# Üretim IPA (App Store için)
eas build --platform ios --profile production
```

### GitHub Actions
"Actions" sekmesinden `EAS Build (iOS IPA)` workflow'unu manuel tetikleyebilirsiniz. Build bittikten sonra [expo.dev/accounts](https://expo.dev/accounts) panelinden IPA'yı indirebilirsiniz.
