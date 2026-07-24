# 🍽️ Kasir Kuliner


<h2 align="center">🍽️ Sistem Kasir Digital untuk Pengelolaan Usaha Kuliner</h2>

<p align="center">
Kasir Kuliner merupakan aplikasi kasir (Point of Sale) berbasis web yang dikembangkan menggunakan <b>Google Apps Script</b> dan <b>Google Spreadsheet</b>. Aplikasi ini membantu proses transaksi penjualan makanan dan minuman secara lebih cepat, praktis, dan terdokumentasi secara otomatis.
</p>

---

# 📖 Tentang Project

**Kasir Kuliner** merupakan aplikasi Point of Sale (POS) berbasis web yang dikembangkan sebagai project magang.

Aplikasi ini dirancang untuk membantu proses transaksi pada usaha kuliner, mulai dari pemilihan menu, pengelolaan keranjang belanja, pembayaran menggunakan Cash maupun QRIS, hingga penyimpanan data transaksi secara otomatis ke Google Spreadsheet.

---

# 🎯 Tujuan

- Mempermudah proses transaksi penjualan.
- Mengurangi pencatatan transaksi secara manual.
- Menyimpan data transaksi secara digital.
- Mempermudah pengelolaan data penjualan.
- Menyediakan laporan transaksi yang tersimpan secara otomatis.

---

# ✨ Fitur

## 🛒 Dashboard Kasir

- Menampilkan daftar menu makanan, minuman, dan snack.
- Filter kategori produk.
- Keranjang belanja.
- Pengaturan jumlah pembelian (Qty).
- Perhitungan subtotal dan total otomatis.
- Pembayaran menggunakan Cash.
- Pembayaran menggunakan QRIS.
- Cetak struk transaksi.
- Penyimpanan transaksi ke Google Spreadsheet.

---

## 📊 Laporan Transaksi

- Menampilkan seluruh riwayat transaksi.
- Menampilkan tanggal transaksi.
- Menampilkan total pembayaran.
- Menampilkan metode pembayaran.
- Menampilkan detail transaksi.
- Data tersimpan otomatis di Google Spreadsheet.

---

# 🖼️ Tampilan Aplikasi

## 🛒 Dashboard Kasir

<p align="center">
<img src="./images/dashboard.png" width="900">
</p>

---

## 📊 Laporan Transaksi

<p align="center">
<img src="./images/Laporan.png" width="900">
</p>

---

# 🌐 Demo & Project

## 🚀 Demo Aplikasi

Akses aplikasi melalui Google Apps Script.

**🔗 Demo Web**

```
https://script.google.com/macros/s/AKfycbximc76rqalPcDXb4jDJM7E_n_kLAUmUpiA7CmTyW0eIsTC1kq9gQPLDUYzLGroAY38/exec
```

---

## 📊 Database Google Spreadsheet

Seluruh data transaksi disimpan pada Google Spreadsheet.

**🔗 Spreadsheet**

```
https://docs.google.com/spreadsheets/d/14Whmc1WOsSs18AGrMygBn7GB6lI1EsQlrvNrqQFBhW0/edit?gid=0#gid=0
```

---

## 💻 Source Code

Repository GitHub

```
https://github.com/vickyagstn/myProject/tree/main/Kasir-Kuliner
```

---

# 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| HTML | Struktur Halaman |
| CSS | Tampilan Aplikasi |
| JavaScript | Interaksi Sistem |
| Google Apps Script | Backend |
| Google Spreadsheet | Database |

---

# 📂 Struktur Database

Database menggunakan Google Spreadsheet.

### Sheet User

| Kolom |
|-------|
| id_user |
| nama |
| username |
| password |

---

### Sheet Produk

| Kolom |
|-------|
| id_produk |
| nama_produk |
| harga |
| kategori |

---

### Sheet Transaksi

| Kolom |
|-------|
| id_transaksi |
| tanggal |
| total |
| metode |

---

### Sheet Detail_Transaksi

| Kolom |
|-------|
| id_transaksi |
| produk |
| qty |
| subtotal |

---

# 📂 Struktur Project

```text
Kasir-Kuliner
│
├── images/
│   ├── dashboard.png
│   └── Laporan.png
│
├── Code.gs
├── index.html
└── README.md
```

---

# 🚀 Cara Menggunakan

1. Buka aplikasi melalui Google Apps Script.
2. Pilih menu makanan atau minuman.
3. Tambahkan produk ke keranjang.
4. Atur jumlah pembelian (Qty).
5. Pilih metode pembayaran (Cash atau QRIS).
6. Sistem menghitung total pembayaran secara otomatis.
7. Cetak struk transaksi.
8. Data transaksi tersimpan ke Google Spreadsheet.
9. Riwayat transaksi dapat dilihat pada halaman Laporan.

---

# 📱 Responsive

Aplikasi dapat digunakan pada berbagai perangkat.

- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

---

# ⭐ Kelebihan Aplikasi

- Tampilan sederhana dan mudah digunakan.
- Mendukung pembayaran Cash dan QRIS.
- Perhitungan total dan kembalian otomatis.
- Data transaksi tersimpan otomatis di Google Spreadsheet.
- Riwayat transaksi terdokumentasi dengan baik.
- Mudah dikembangkan sesuai kebutuhan usaha kuliner.

---

# 👨‍💻 Developer

**Vicky Agustine**

Mahasiswa Teknologi Rekayasa Perangkat Lunak

Project Magang

---

# 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan project magang.

---

<p align="center">
⭐ Jangan lupa berikan <b>Star</b> jika project ini bermanfaat.
</p>

<p align="center">
Made with ❤️ by <b>Vicky Agustine</b>
</p>
