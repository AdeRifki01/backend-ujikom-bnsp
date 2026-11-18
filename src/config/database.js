/**
 * File: src/config/database.js
 * Deskripsi: Modul koneksi basis data MySQL menggunakan connection pool
 * Standar Kompetensi: J.620100.018.02 (OOP) & J.620100.021.02 (Akses Basis Data)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        if (!DatabaseConnection.instance) {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'db_sekolah_siswa',
                port: parseInt(process.env.DB_PORT, 10) || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            });
            DatabaseConnection.instance = this;
        }
        return DatabaseConnection.instance;
    }

    /**
     * Mendapatkan instance pool koneksi
     * @returns {import('mysql2/promise').Pool}
     */
    getPool() {
        return this.pool;
    }

    /**
     * Uji koneksi ke basis data MySQL
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            console.log('✅ [Database]: Berhasil terhubung ke database MySQL (' + (process.env.DB_NAME || 'db_sekolah_siswa') + ')');
            connection.release();
            return true;
        } catch (error) {
            console.error('❌ [Database]: Gagal terhubung ke MySQL:', error.message);
            return false;
        }
    }
}

const dbInstance = new DatabaseConnection();
module.exports = dbInstance;
