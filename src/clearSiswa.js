/**
 * File: src/clearSiswa.js
 * Deskripsi: Skrip utilitas untuk mengosongkan seluruh data tabel siswa di PostgreSQL
 * Menyetel ulang urutan ID (auto increment) kembali ke 1.
 * Master jurusan tetap aman.
 */

require('dotenv').config();
const db = require('./config/database');

async function clearSiswaData() {
    console.log('🧹 Mengosongkan data siswa pada database PostgreSQL...');
    const pool = db.getPool();

    try {
        // TRUNCATE dengan RESTART IDENTITY mereset ID kembali ke 1
        await pool.query('TRUNCATE TABLE siswa RESTART IDENTITY CASCADE;');
        console.log('✅ Berhasil: Seluruh data siswa telah dikosongkan.');
        console.log('🔄 Nomor urut ID siswa telah direset kembali mulai dari 1.');

        // Opsional: kosongkan juga log aktivitas lama
        await pool.query('TRUNCATE TABLE log_aktivitas_siswa RESTART IDENTITY CASCADE;');
        console.log('🧹 Log aktivitas siswa juga telah dibersihkan.');

        console.log('\n💡 Data master jurusan tetap tersimpan utuh untuk input data baru.');
    } catch (error) {
        console.error('❌ Terjadi kesalahan saat mengosongkan data:', error.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

clearSiswaData();
