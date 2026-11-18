/**
 * File: src/server.js
 * Deskripsi: Berkas utama server Backend Express.js
 * Standar Kompetensi:
 * - J.620100.010.01 (Menerapkan Perintah Eksekusi Bahasa Pemrograman)
 * - J.620100.015.01 (Organisasi File & Arsitektur Rapi)
 * - J.620100.016.01 (Guidelines dan Best Practices)
 * - J.620100.019.02 (Penggunaan Library Pre-existing Express, CORS, Dotenv)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const siswaRoutes = require('./routes/siswaRoutes');
const jurusanRoutes = require('./routes/jurusanRoutes');
const errorHandler = require('./middlewares/errorHandler');
const fileHandler = require('./utils/fileHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// Middlewares Pre-existing Libraries
// =============================================================================
app.use(cors({
    origin: '*', // Mengizinkan akses dari aplikasi frontend React
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Request Logger Middleware
app.use((req, res, next) => {
    const logInfo = `${req.method} ${req.url} - IP: ${req.ip || '127.0.0.1'}`;
    console.log(`📡 [HTTP Request]: ${logInfo}`);
    fileHandler.tulisLog(logInfo);
    next();
});

// =============================================================================
// Endpoint Status & Health Check
// =============================================================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'REST API Backend Siswa (Express.js) Aktif & Berjalan',
        version: '1.0.0',
        author: 'Asesi Sertifikasi BNSP',
        endpoints: {
            siswa: '/api/siswa',
            jurusan: '/api/jurusan',
            health: '/api/health',
            export: '/api/siswa/export/json',
            logs: '/api/logs'
        }
    });
});

app.get('/api/health', async (req, res) => {
    const isDbConnected = await db.testConnection();
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: isDbConnected ? 'Connected (MySQL)' : 'Disconnected'
    });
});

// Endpoint untuk melihat log berkas
app.get('/api/logs', (req, res) => {
    const isiLog = fileHandler.bacaLog();
    res.type('text/plain').send(isiLog);
});

// =============================================================================
// Rute API Utama
// =============================================================================
app.use('/api/siswa', siswaRoutes);
app.use('/api/jurusan', jurusanRoutes);

// Penanganan Rute 404 Tidak Ditemukan
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint '${req.originalUrl}' tidak ditemukan pada server ini`
    });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

// =============================================================================
// Inisialisasi Server
// =============================================================================
const server = app.listen(PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🚀 Server Backend Express.js berhasil berjalan di port: ${PORT}`);
    console.log(`📍 URL Server: http://localhost:${PORT}`);
    console.log(`📚 API Data Siswa: http://localhost:${PORT}/api/siswa`);
    console.log(`=======================================================`);

    // Uji koneksi ke basis data MySQL
    await db.testConnection();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Menerima sinyal SIGTERM. Menutup server dengan aman...');
    server.close(() => {
        console.log('Server ditutup.');
        process.exit(0);
    });
});

module.exports = app;
