# AEROFY · ESP32C3 Telemetry Command Center

AEROFY adalah aplikasi dashboard monitoring telemetry ESP32C3 siap pakai (ready to deploy) yang dibangun dengan Node.js & Express.

---

## 🚀 Fitur Utama
- **Monitoring Telemetry Real-time**: Pembacaan sensor ESP32C3 untuk lingkungan budidaya.
- **Node.js Express Server**: Server produksi yang cepat dan aman.
- **Multi-Platform Deployment Ready**: Konfigurasi lengkap untuk Vercel, Netlify, Render, Railway, Docker, dan VPS.
- **Zero Watermark**: Bersih dari watermark eksternal dengan branding penuh **AEROFY**.

---

## 🛠️ Menjalankan Secara Lokal

### Prerequisites
- Node.js (v18.0.0 atau yang lebih baru)
- npm

### Langkah-langkah:
1. Install dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembang/produksi:
   ```bash
   npm start
   ```
3. Buka browser di [http://localhost:3000](http://localhost:3000).
4. Cek API Healthcheck di [http://localhost:3000/api/health](http://localhost:3000/api/health).

---

## 🌐 Panduan Deploy

### 1. Deploy ke Vercel (Rekomendasi Utama)
- File konfigurasi `vercel.json` sudah disediakan.
- Jalankan perintah berikut menggunakan Vercel CLI:
  ```bash
  npx vercel
  ```
- Atau hubungkan repositori GitHub Anda secara langsung ke **Vercel Dashboard**.

### 2. Deploy ke Netlify
- File `netlify.toml` sudah disiapkan.
- Jalankan Netlify CLI:
  ```bash
  npx netlify deploy --prod
  ```
- Atau hubungkan repositori GitHub ke **Netlify Dashboard**.

### 3. Deploy dengan Docker / Render / Railway / VPS
- File `Dockerfile` dan `Procfile` sudah lengkap.
- Untuk Docker:
  ```bash
  docker build -t aerofy-app .
  docker run -p 3000:3000 aerofy-app
  ```
- Di Render / Railway: Pilih opsi deployment Docker atau Node.js webservice, gunakan start command `npm start`.

---

## 📄 Struktur Folder Node.js
```
AEROFY/
├── assets/                  # CSS & JavaScript Bundle produksi AEROFY
│   ├── index-Cgxf8hgB.css
│   └── index-DOHC32gY.js
├── .dockerignore            # File perabaian Docker
├── .env.example             # Template variabel lingkungan
├── .gitignore               # Perabaian Git
├── Dockerfile               # Konfigurasi container Docker
├── index.html               # Halaman utama HTML AEROFY
├── netlify.toml             # Konfigurasi deployment Netlify
├── package.json             # Dependensi & skrip Node.js
├── Procfile                 # Konfigurasi Heroku / Render / Railway
├── README.md                # Dokumentasi aplikasi
├── server.js                # Server Node.js Express & SPA router
└── vercel.json              # Konfigurasi deployment Vercel
```

---
© 2026 **AEROFY Team** · ESP32C3 Telemetry Command Center
