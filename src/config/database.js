/**
 * File: src/config/database.js
 * Deskripsi: Modul koneksi basis data PostgreSQL menggunakan connection pool
 * Standar Kompetensi: J.620100.018.02 (OOP) & J.620100.021.02 (Akses Basis Data)
 */

const { Pool } = require('pg');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        if (!DatabaseConnection.instance) {
            this.pool = new Pool({
                host:     process.env.DB_HOST     || 'localhost',
                user:     process.env.DB_USER     || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME     || 'db_sekolah_siswa',
                port:     parseInt(process.env.DB_PORT, 10) || 5432,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000
            });
            DatabaseConnection.instance = this;
        }
        return DatabaseConnection.instance;
    }

    /**
     * Mendapatkan instance pool koneksi
     * @returns {import('pg').Pool}
     */
    getPool() {
        return this.pool;
    }

    /**
     * Uji koneksi ke basis data PostgreSQL
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        try {
            const client = await this.pool.connect();
            console.log('✅ [Database]: Berhasil terhubung ke database PostgreSQL (' + (process.env.DB_NAME || 'db_sekolah_siswa') + ')');
            client.release();
            return true;
        } catch (error) {
            console.error('❌ [Database]: Gagal terhubung ke PostgreSQL:', error.message);
            return false;
        }
    }
}

const dbInstance = new DatabaseConnection();
module.exports = dbInstance;
