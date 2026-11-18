# Backend API - Manajemen Data Siswa (Express.js)

Aplikasi Backend REST API untuk pengelolaan Data Siswa menggunakan Express.js dan MySQL. Dibuat untuk memenuhi kriteria Uji Praktik Sertifikasi BNSP Skema Pengembangan Web dengan Node.js dan React.

## Fitur Utama
- CRUD (Create, Read, Update, Delete) Data Siswa.
- Endpoint Master Jurusan untuk relasi antarentitas.
- Keamanan input dengan Prepared Statements (mencegah SQL Injection).
- Transaksi database SQL (Commit & Rollback) untuk integritas data.
- Pencatatan log aktivitas dan ekspor file data ke JSON.
- Struktur kode berbasis OOP (Object-Oriented Programming) & MVC.

## Spesifikasi Data Siswa
- **Kode Siswa**: `kode_siswa` (VARCHAR, Unique)
- **Nama Siswa**: `nama_siswa` (VARCHAR)
- **Alamat Siswa**: `alamat_siswa` (TEXT)
- **Tgl Siswa**: `tgl_siswa` (DATE)
- **Jurusan Siswa**: `id_jurusan` (INT, Foreign Key ke tabel `jurusan`)

## Cara Instalasi & Menjalankan

1. Pastikan MySQL sudah aktif (Laragon / XAMPP).
2. Salin berkas lingkungan konfigurasi:
   ```bash
   cp .env.example .env
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Inisialisasi basis data dan tabel secara otomatis:
   ```bash
   npm run init-db
   ```
5. Jalankan server backend:
   ```bash
   npm run dev
   ```
   Server aktif pada `http://localhost:5000`.

## Daftar Endpoint REST API

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/siswa` | Mengambil seluruh data siswa (mendukung query `?search=`) |
| GET | `/api/siswa/:id` | Mengambil detail 1 siswa berdasarkan ID |
| POST | `/api/siswa` | Menambahkan data siswa baru |
| PUT | `/api/siswa/:id` | Memperbarui data siswa |
| DELETE | `/api/siswa/:id` | Menghapus data siswa |
| GET | `/api/jurusan` | Mengambil data master jurusan |
| GET | `/api/siswa/export/json` | Mengekspor data ke file JSON |
| GET | `/api/health` | Cek status kesehatan server & database |
| GET | `/api/logs` | Membaca catatan file log aktivitas |
