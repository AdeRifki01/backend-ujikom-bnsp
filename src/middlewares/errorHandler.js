/**
 * File: src/middlewares/errorHandler.js
 * Deskripsi: Middleware penanganan kesalahan terpusat (Centralized Error Handler)
 * Standar Kompetensi: J.620100.016.01 (Guidelines and Best Practices)
 */

const fileHandler = require('../utils/fileHandler');

function errorHandler(err, req, res, next) {
    console.error('⚠️ [Error Terdeteksi]:', err);

    // Tulis ke file log aktivitas
    fileHandler.tulisLog(`Error pada ${req.method} ${req.originalUrl}: ${err.message}`, 'ERROR');

    // Penanganan error duplikasi kunci unik MySQL (misal kode_siswa duplikat)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Kode siswa sudah terdaftar dalam sistem. Gunakan kode lain.',
            error: err.message
        });
    }

    // Penanganan error foreign key MySQL
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Jurusan yang dipilih tidak ditemukan dalam basis data.',
            error: err.message
        });
    }

    // Penanganan error koneksi database terputus
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(503).json({
            success: false,
            message: 'Layanan basis data MySQL sedang tidak aktif. Pastikan Laragon/MySQL telah dinyalakan.',
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
