/**
 * File: src/middlewares/errorHandler.js
 * Deskripsi: Middleware penanganan kesalahan terpusat (PostgreSQL compatible)
 */

const fileHandler = require('../utils/fileHandler');

function errorHandler(err, req, res, next) {
    console.error('⚠️ [Error Terdeteksi]:', err);

    fileHandler.tulisLog(`Error pada ${req.method} ${req.originalUrl}: ${err.message}`, 'ERROR');

    // Penanganan kode unik duplikat PostgreSQL (23505: unique_violation)
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Kode siswa sudah terdaftar dalam sistem. Gunakan kode siswa lain.',
            error: err.detail || err.message
        });
    }

    // Penanganan pelanggaran foreign key PostgreSQL (23503: foreign_key_violation)
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Jurusan yang dipilih tidak ditemukan dalam basis data.',
            error: err.detail || err.message
        });
    }

    // Penanganan error koneksi database
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            message: 'Layanan basis data PostgreSQL tidak dapat dihubungi. Pastikan service PostgreSQL dan DBeaver aktif pada port 5432.',
            error: err.message
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan internal pada server';

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

module.exports = errorHandler;
