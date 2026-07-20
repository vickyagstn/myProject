# HIMAPROTEKSA DIGITAL

<p align="center">
  <b>Sistem Informasi Manajemen Organisasi Mahasiswa Berbasis Web</b>
</p>

<p align="center">
Website untuk membantu pengelolaan organisasi HIMAPROTEKSA secara digital, mulai dari data anggota, kegiatan, absensi, notulen rapat, pengumuman, dokumentasi, hingga AI Assistant.
</p>

---

# 📖 Tentang Aplikasi

**HIMAPROTEKSA DIGITAL** merupakan sistem informasi manajemen organisasi mahasiswa berbasis web yang dikembangkan untuk membantu pengurus dan anggota dalam mengelola aktivitas organisasi secara lebih efektif, efisien, dan terintegrasi.

Aplikasi ini menyediakan berbagai fitur untuk mendukung digitalisasi organisasi, mulai dari pengelolaan anggota, kegiatan, absensi, notulen rapat, pengumuman, dokumentasi, hingga AI Assistant yang membantu pembuatan notulen dan pengumuman secara otomatis.

---

# ✨ Fitur Utama

## 👨‍💼 Admin

- Login Admin
- Dashboard Admin
- Kelola Data Anggota
- Kelola Data Kegiatan
- Kelola Absensi
- Kelola Notulen Rapat
- Kelola Pengumuman
- Kelola Dokumentasi
- Monitoring Keaktifan Anggota
- AI Assistant
- Logout

---

## 👨‍🎓 Anggota

- Login Anggota
- Dashboard Anggota
- Melihat Profil
- Melihat Kegiatan
- Melakukan Absensi
- Melihat Notulen
- Melihat Pengumuman
- Melihat Dokumentasi
- Logout

---

# 🤖 AI Assistant

Aplikasi mengintegrasikan **OpenRouter API** untuk membantu:

- Membuat notulen rapat
- Membuat ringkasan hasil rapat
- Membantu menyusun pengumuman
- Membantu administrasi organisasi

---

# 🛠️ Teknologi yang Digunakan

| Teknologi | Fungsi |
|-----------|--------|
| React JS (Vite) | Frontend |
| Tailwind CSS | User Interface |
| React Router DOM | Routing |
| Firebase Authentication | Authentication |
| Firebase Firestore | Database |
| Firebase Storage | Penyimpanan File |
| OpenRouter API | AI Assistant |
| GitHub | Version Control |
| Vercel | Deployment |

---

# 📂 Struktur Project

```text
himaproteksa-digital
│
├── public
│   └── images
│       ├── admin-dashboard.png
│       ├── user-dashboard.png
│       └── admin-user-page.png
│
├── src
│   ├── assets
│   ├── components
│   ├── hooks
│   ├── layouts
│   ├── lib
│   ├── pages
│   ├── routes
│   ├── services
│   └── utils
│
├── package.json
├── vite.config.js
└── README.md
```

---

# 📸 Tampilan Aplikasi

## Dashboard

| Dashboard Admin | Dashboard User |
|-----------------|----------------|
| ![](public/images/admin-dashboard.png) | ![](public/images/user-dashboard.png) |

### Halaman Admin & User

![](public/images/admin-user-page.png)

---

# 🚀 Instalasi

Clone repository

```bash
git clone https://github.com/vickyagstn/myProject.git
```

Masuk ke folder project

```bash
cd myProject/himaproteksa-digital
```

Install dependency

```bash
npm install
```

Jalankan aplikasi

```bash
npm run dev
```

Build aplikasi

```bash
npm run build
```

---

# 🔥 Konfigurasi Firebase

Buat file `.env`

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

# 🤖 Konfigurasi OpenRouter

Tambahkan API Key OpenRouter pada file `.env`

```env
VITE_OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
```

---

# 🔑 Cara Mengakses Aplikasi

Setelah aplikasi berhasil dijalankan menggunakan:

```bash
npm run dev
```

Buka browser dan akses:

```text
http://localhost:5173
```

Apabila aplikasi telah di-deploy menggunakan **Vercel**, gunakan URL deployment yang tersedia.

---

# 👤 Akun Demo

## 👨‍💼 Admin

| Keterangan | Data |
|------------|------|
| Email | `admin@himaproteksa.com` |
| Password | `hima1234` |

Hak akses Admin:

- Mengelola Data Anggota
- Mengelola Kegiatan
- Mengelola Absensi
- Mengelola Notulen
- Mengelola Pengumuman
- Mengelola Dokumentasi
- Monitoring Keaktifan Anggota
- Menggunakan AI Assistant

---

## 👨‍🎓 Anggota

| Keterangan | Data |
|------------|------|
| Email | `vicky@himaproteksa.com` |
| Password | `B22054` |

Hak akses Anggota:

- Melihat Profil
- Melihat Kegiatan
- Melakukan Absensi
- Melihat Notulen
- Melihat Pengumuman
- Melihat Dokumentasi

---

> **Catatan**
> untuk mengakses nya harus 2x untuk website 
> Akun di atas merupakan akun demo yang disediakan untuk mencoba seluruh fitur aplikasi sesuai dengan hak akses masing-masing pengguna.

---

# 🎯 Tujuan Pengembangan

- Mendukung digitalisasi organisasi mahasiswa.
- Mempermudah pengelolaan data anggota.
- Mempermudah pengelolaan kegiatan organisasi.
- Menyediakan sistem absensi digital.
- Membantu penyusunan notulen rapat menggunakan AI.
- Mempermudah penyampaian pengumuman.
- Menyimpan dokumentasi organisasi secara terpusat.
- Meningkatkan efisiensi pengelolaan organisasi mahasiswa.

---

# 🌐 Deployment

Aplikasi dapat di-deploy menggunakan:

- Vercel
- Firebase Hosting

---

# 👩‍💻 Developer

**Vicky Agustine**

Program Studi Teknologi Rekayasa Perangkat Lunak

Politeknik Indonusa Surakarta

---

# 📄 Lisensi

Project ini dikembangkan untuk keperluan akademik dan sebagai implementasi **Sistem Informasi Manajemen Organisasi Mahasiswa Berbasis Web**.

Seluruh kode dapat digunakan sebagai referensi pembelajaran dan pengembangan lebih lanjut dengan tetap mencantumkan kredit kepada pengembang.
