/**
 * File: src/initDb.js
 * Deskripsi: Skrip inisialisasi basis data PostgreSQL otomatis
 * Jalankan dengan: npm run init-db
 */

require('dotenv').config();
const { Client } = require('pg');

async function initializeDatabase() {
    console.log('🔄 Memulai inisialisasi database PostgreSQL...');

    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    const port = parseInt(process.env.DB_PORT, 10) || 5432;
    const dbName = process.env.DB_NAME || 'db_sekolah_siswa';

    // 1. Koneksi awal ke database default 'postgres' untuk membuat database jika belum ada
    const defaultClient = new Client({
        host,
        user,
        password,
        port,
        database: 'postgres'
    });

    try {
        await defaultClient.connect();
        console.log(`🔌 Terhubung ke server PostgreSQL (${host}:${port})`);

        // Cek apakah database db_sekolah_siswa sudah ada
        const checkDbRes = await defaultClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );

        if (checkDbRes.rowCount === 0) {
            await defaultClient.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Basis data '${dbName}' berhasil dibuat.`);
        } else {
            console.log(`ℹ️ Basis data '${dbName}' sudah tersedia.`);
        }
        await defaultClient.end();

        // 2. Koneksi ke basis data yang dituju
        const dbClient = new Client({
            host,
            user,
            password,
            port,
            database: dbName
        });

        await dbClient.connect();

        // Buat tabel jurusan
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS jurusan (
                id SERIAL PRIMARY KEY,
                kode_jurusan VARCHAR(10) NOT NULL UNIQUE,
                nama_jurusan VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabel `jurusan` siap.');

        // Buat tabel siswa
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS siswa (
                id SERIAL PRIMARY KEY,
                kode_siswa VARCHAR(20) NOT NULL UNIQUE,
                nama_siswa VARCHAR(100) NOT NULL,
                alamat_siswa TEXT NOT NULL,
                tgl_siswa DATE NOT NULL,
                id_jurusan INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_siswa_jurusan 
                    FOREIGN KEY (id_jurusan) REFERENCES jurusan (id) 
                    ON DELETE RESTRICT 
                    ON UPDATE CASCADE
            );
        `);
        console.log('✅ Tabel `siswa` siap.');

        // Buat tabel log aktivitas
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS log_aktivitas_siswa (
                id_log SERIAL PRIMARY KEY,
                aksi VARCHAR(20) NOT NULL,
                kode_siswa VARCHAR(20) NOT NULL,
                nama_siswa VARCHAR(100) NOT NULL,
                keterangan TEXT NULL,
                waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabel `log_aktivitas_siswa` siap.');

        // Seeding Jurusan jika kosong
        const jurusanCountRes = await dbClient.query('SELECT COUNT(*) FROM jurusan');
        if (parseInt(jurusanCountRes.rows[0].count, 10) === 0) {
            await dbClient.query(`
                INSERT INTO jurusan (kode_jurusan, nama_jurusan) VALUES
                ('RPL', 'Rekayasa Perangkat Lunak'),
                ('TKJ', 'Teknik Komputer dan Jaringan'),
                ('MM', 'Multimedia'),
                ('DKV', 'Desain Komunikasi Visual'),
                ('SIJA', 'Sistem Informasi Jaringan dan Aplikasi');
            `);
            console.log('🌱 Data master jurusan berhasil diisi.');
        }

        // Seeding Siswa jika kosong
        const siswaCountRes = await dbClient.query('SELECT COUNT(*) FROM siswa');
        if (parseInt(siswaCountRes.rows[0].count, 10) === 0) {
            await dbClient.query(`
                INSERT INTO siswa (kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan) VALUES
                ('SIS-001', 'Ahmad Rizky Pratama', 'Jl. Merdeka No. 45, Jakarta Pusat', '2007-04-15', 1),
                ('SIS-002', 'Siti Nurhaliza', 'Jl. Sudirman No. 12, Bandung', '2007-08-22', 1),
                ('SIS-003', 'Budi Santoso', 'Jl. Diponegoro No. 88, Surabaya', '2006-11-05', 2),
                ('SIS-004', 'Dewi Anggraini', 'Jl. Gajah Mada No. 19, Yogyakarta', '2007-02-18', 3),
                ('SIS-005', 'Rian Hidayat', 'Jl. Pemuda No. 7, Semarang', '2006-09-30', 4);
            `);
            console.log('🌱 Data sampel siswa berhasil diisi.');
        }

        await dbClient.end();
        console.log('✨ [Sukses]: Inisialisasi basis data PostgreSQL selesai!');
    } catch (err) {
        console.error('❌ Gagal inisialisasi basis data PostgreSQL:', err.message);
        console.error('💡 Tips: Pastikan server PostgreSQL sudah aktif dan password di .env sudah sesuai.');
    }
}

initializeDatabase();
