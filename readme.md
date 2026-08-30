<div align="center">

# 🌴 Sawitify

### Sistem Informasi Operasional Lapangan Perkebunan Kelapa Sawit

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-success?style=for-the-badge)](https://sawitify.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/rafialfd/sawitify)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**Submission for ITECHNO CUP 2026 – Web Development**

**By Nyawit Nih Orang**

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Unggulan](#-fitur-unggulan)
- [Demo & Screenshot](#-demo--screenshot)
- [Teknologi](#-teknologi)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Instalasi & Setup](#-instalasi--setup)
- [Penggunaan](#-penggunaan)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Tim Pengembang](#-tim-pengembang)
- [Lisensi](#-lisensi)

---

## 👥 Tim Pengembang

| Nama                        | Peran                | GitHub                                   |
| --------------------------- | -------------------- | ---------------------------------------- |
| **Mikael Abe Christanto**   | Ketua Tim            | -                                        |
| **Muhammad Rafi Alfirdaus** | Full Stack Developer | [@rafialfd](https://github.com/rafialfd) |

---

## 🎯 Tentang Proyek

### Latar Belakang

Operasional perkebunan kelapa sawit melibatkan koordinasi antara **mandor** dan **pemanen** dalam pembagian area kerja (ancak), pencatatan hasil panen, serta pelaporan brondolan setiap hari.

Pada banyak kondisi, proses tersebut masih dilakukan secara **manual menggunakan kertas atau pencatatan terpisah**, sehingga berpotensi menimbulkan keterlambatan pelaporan, duplikasi data, kesalahan pencatatan, dan kesulitan melakukan monitoring secara real-time.

Permasalahan tersebut menghambat efisiensi operasional dan memperlambat pengambilan keputusan di lapangan.

### Solusi yang Ditawarkan

**Sawitify** merupakan sistem informasi operasional berbasis web yang menghubungkan administrator, mandor, dan pemanen dalam satu platform digital.

Melalui sistem ini, penugasan ancak, pencatatan hasil panen, pelaporan brondolan, serta monitoring aktivitas lapangan dilakukan secara terintegrasi sehingga proses operasional menjadi lebih cepat, terstruktur, dan terdokumentasi.

### Tujuan Proyek

- 🎯 **Tujuan Utama**: Mendigitalisasi operasional mandor dan pemanen.
- 👥 **Target Pengguna**: Administrator, Mandor, dan Pemanen.
- 💡 **Value Proposition**: Sistem terintegrasi yang menggantikan pencatatan manual menjadi proses digital yang lebih efisien.

### Kontribusi terhadap SDGs

Sawitify dikembangkan sesuai tema **Smart Sustainable Digital Solution for Inclusive Society**, dengan fokus pada:

#### SDG 8 — Pekerjaan Layak dan Pertumbuhan Ekonomi

- Digitalisasi alur kerja mandor dan pemanen.
- Meningkatkan efisiensi administrasi lapangan.
- Mempermudah pelaporan hasil panen.

#### SDG 9 — Industri, Inovasi, dan Infrastruktur

- Sistem operasional berbasis web modern.
- Infrastruktur cloud menggunakan Vercel.
- Database PostgreSQL terpusat.
- Arsitektur Serverless API.

---

## ✨ Fitur Unggulan

### Fitur Utama

| Fitur                      | Deskripsi                                   | Keunggulan                         |
| -------------------------- | ------------------------------------------- | ---------------------------------- |
| **Dashboard Admin**        | Mengelola data master sistem                | Semua data terpusat                |
| **Penugasan Ancak**        | Mandor membagikan ancak kepada pemanen      | Distribusi tugas lebih terstruktur |
| **Pelaporan Hasil Panen**  | Pemanen menginput hasil panen dan brondolan | Data masuk secara real-time        |
| **Monitoring Operasional** | Melihat status pekerjaan dan hasil panen    | Mempermudah pengawasan lapangan    |

### Fitur Tambahan

- **Role-Based Access** (Admin, Mandor, Pemanen)
- **JWT Authentication**
- **REST API**
- **Responsive Interface**
- **Riwayat Penugasan**
- **Detail Hasil Panen per Ancak**

---

## 📸 Demo & Screenshot

### Live Demo

🔗 **[Kunjungi Website](https://sawitify.vercel.app)**

### Screenshot Aplikasi

<div align="center">

<img src="https://live.staticflickr.com/65535/55489374090_22e2fa2a54_b.jpg" alt="Dashboard Admin" width="800"/>
<p><em>Halaman Login</em></p>

<img src="https://live.staticflickr.com/65535/55489374080_4600d1d978_b.jpg" alt="Dashboard Admin" width="800"/>
<p><em>Dashboard Admin</em></p>

<img src="https://live.staticflickr.com/65535/55489099763_8f5319a5c8_b.jpg" alt="Dashboard Mandor" width="800"/>

<p><em>Dashboard Mandor</em></p>

<img src="https://live.staticflickr.com/65535/55488982261_8c30cbbc4c_b.jpg" alt="Dashboard Pemanen" width="800"/>

<p><em>Dashboard Pemanen</em></p>

</div>

---

## 🛠️ Teknologi

### Tech Stack

#### Frontend

```text
Framework    : Next.js
Language     : JavaScript
UI           : HTML, CSS, JavaScript
API Client   : Fetch API
Authentication : JWT
```

#### Backend

```text
Runtime      : Node.js
Architecture : Serverless API
Database     : PostgreSQL
Driver       : node-postgres (pg)
Authentication : JWT
```

#### DevOps & Tools

```text
Deployment   : Vercel
Version Control : Git & GitHub
Database     : PostgreSQL
Development  : Visual Studio Code
```

### Alasan Pemilihan Teknologi

| Teknologi      | Alasan Pemilihan                                                                  |
| -------------- | --------------------------------------------------------------------------------- |
| **Next.js**    | Mendukung frontend dan backend dalam satu proyek serta serverless deployment.     |
| **PostgreSQL** | Database relasional yang sesuai untuk relasi Divisi, Petak, Ancak, dan Aktivitas. |
| **JWT**        | Autentikasi ringan dengan role-based access.                                      |

### Dependencies Utama

```json
{
  "dependencies": {
    "next": "^15.x",
    "pg": "^8.x",
    "jsonwebtoken": "^9.x"
  }
}
```

---

## 🏗️ Arsitektur Sistem

## System Architecture

Sawitify menggunakan arsitektur serverless berbasis **Next.js**, **Vercel**, **Neon PostgreSQL**, dan **Vercel Blob** untuk mengelola operasional lapangan perkebunan sawit.

```mermaid
flowchart TD
    A[Admin]
    M[Mandor]
    P[Pemanen]

    A -->|Browser| V[Vercel / Next.js]
    M -->|Browser| V
    P -->|Browser| V

    subgraph "Vercel (Next.js)"
        UI[Frontend]
        API[Serverless API]
        AUTH[JWT Authentication]
        BLOB[Vercel Blob]
    end

    V --> UI
    UI --> API
    API --> AUTH
    API --> DB[(Neon PostgreSQL)]
    API --> BLOB

    BLOB --> API
    API --> UI
```

### Database Schema

![Entity Relationship Diagram](https://live.staticflickr.com/65535/55489099478_af4f098e47_b.jpg)

### Folder Structure

```text
.
├── api/
│   ├── mandor.js
│   ├── pemanen_page.js
│   ├── pemanen.js
│   ├── petak.js
│   ├── report_pemanen.js
│   ├── upload.js
│   └── user.js
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── assets
│      erd/
│        └── sawitify-erd.png
├── schema.sql
├── seed.sql
├── manifest.webmanifest
├── sw.js
├── admin.html
├── admin.js
├── index.html
├── mandor.html
├── mandor_page.js
├── pemanen.html
├── pemanen_page.js
├── script.js
├── style.css
├── package.json
└── README.md
```

---

## ⚙️ Instalasi & Setup (Vercel)

Sawitify dirancang untuk dijalankan menggunakan **Vercel** sebagai platform deployment. Database dapat menggunakan layanan PostgreSQL apa pun selama telah mengimpor struktur tabel dari `schema.sql`.

### Prerequisites

Pastikan telah menginstal atau memiliki:

- Node.js v18 atau lebih tinggi
- npm
- Git
- Akun Vercel
- Database PostgreSQL

### 1️⃣ Clone Repository

```bash
git clone https://github.com/rafialfd/sawitify.git
cd sawitify
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Database

1. Buat database PostgreSQL.
2. Import file `schema.sql` ke database.
3. Import `seed.sql` untuk menambahkan akses admin.

### 4️⃣ Login ke Vercel

Install Vercel CLI:

```bash
npm install -g vercel
```

Login ke akun Vercel:

```bash
vercel login
```

### 5️⃣ Hubungkan Proyek ke Vercel

Jalankan:

```bash
vercel
```

Saat pertama kali menjalankan perintah tersebut, pilih konfigurasi berikut:

- **Set up and deploy?** → `Y`
- **Link to existing project?** → `N` (atau `Y` jika proyek sudah ada)
- **Project Name** → `sawitify`
- **Directory** → `./`

### 6️⃣ Tambahkan Environment Variables

Tambahkan variabel berikut melalui **Vercel Dashboard → Project Settings → Environment Variables**:

```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your_secret_key
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxx
```

### 7️⃣ Deploy ke Production

Setelah environment variables selesai ditambahkan, lakukan deploy:

```bash
vercel --prod
```

Setelah proses selesai, Sawitify dapat diakses melalui domain yang diberikan oleh Vercel.

### User Guide

#### Untuk Pemanen

1. Login menggunakan akun pemanen.
2. Melihat penugasan hari ini.
3. Menginput hasil panen.
4. Menginput jumlah brondolan.
5. Melihat riwayat pekerjaan.

#### Untuk Mandor

1. Login sebagai mandor.
2. Memberikan penugasan ancak.
3. Melihat status pekerjaan.
4. Memantau hasil panen setiap pemanen.

#### Untuk Admin

1. Login sebagai administrator.
2. Mengelola data pengguna.
3. Mengelola Divisi, Petak, dan Ancak.
4. Memastikan data operasional tetap valid.

---

## 📚 API Documentation

### Base URL

```text
Production:
https://sawitify.vercel.app/api
```

> Seluruh endpoint menggunakan metode **POST** dengan autentikasi **JWT** (kecuali endpoint upload).

### Endpoints

#### Authentication

```http
POST /api/user
```

Digunakan untuk:

- Login
- Validasi token pengguna
- Mengambil informasi role pengguna

#### Admin

```http
POST /api/admin_page
POST /api/divisi
POST /api/petak
POST /api/ancak
POST /api/mandor
POST /api/pemanen
```

Fungsi utama:

- Mengelola data Divisi
- Mengelola Petak
- Mengelola Ancak
- Mengelola Mandor
- Mengelola Pemanen

#### Mandor

```http
POST /api/mandor_page
```

Digunakan untuk:

- Mengambil daftar pemanen
- Mengambil daftar ancak
- Membuat penugasan
- Melihat riwayat penugasan
- Melihat performa pemanen
- Menghasilkan laporan bulanan

#### Pemanen

```http
POST /api/pemanen_page
```

Digunakan untuk:

- Mengambil penugasan hari ini
- Menyimpan hasil panen
- Melihat riwayat panen
- Mengambil data analitik

#### Upload Foto

```http
POST /api/upload
```

Mengunggah foto bukti panen ke **Vercel Blob Storage**.

#### Laporan PDF

```http
POST /api/report_pemanen
```

Menghasilkan laporan panen dalam format PDF.

### Example Request

```javascript
const response = await fetch("/api/user", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "mandor01",
    password: "password",
    refer: "LOGIN",
  }),
});
```

---

## 🧪 Testing

Pengujian dilakukan secara fungsional pada seluruh fitur utama aplikasi setelah deployment di Vercel.

### Skenario Pengujian

| Fitur                       | Status |
| --------------------------- | ------ |
| JWT Authentication          | ✅     |
| Role-Based Authorization    | ✅     |
| CRUD Data Master            | ✅     |
| Penugasan Ancak             | ✅     |
| Input Hasil Panen           | ✅     |
| Upload Foto Bukti Panen     | ✅     |
| Riwayat Penugasan           | ✅     |
| Dashboard Performa          | ✅     |
| Laporan PDF                 | ✅     |
| Validasi Relasi Petak–Ancak | ✅     |
| Response Serverless API     | ✅     |

### Environment Testing

- **Deployment:** Vercel
- **Database:** PostgreSQL
- **Storage:** Vercel Blob
- **Browser:** Google Chrome

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

---

<div align="center">

**Made with ❤️ by Nyawit Nih Orang**

**ITECHNO CUP 2026 – Smart Sustainable Digital Solution for Inclusive Society**

</div>
