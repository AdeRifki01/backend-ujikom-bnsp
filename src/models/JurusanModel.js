/**
 * File: src/models/JurusanModel.js
 * Deskripsi: Model untuk entitas Jurusan (Master Data)
 * Standar Kompetensi: J.620100.007.01 (Entitas) & J.620100.018.02 (OOP)
 */

const db = require('../config/database');

class JurusanModel {
    /**
     * Mengambil seluruh data jurusan
     * @returns {Promise<Array>}
     */
    static async findAll() {
        const pool = db.getPool();
        const sql = 'SELECT id, kode_jurusan, nama_jurusan FROM jurusan ORDER BY nama_jurusan ASC';
        const [rows] = await pool.query(sql);
        return rows;
    }

    /**
     * Mengambil jurusan berdasarkan ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const pool = db.getPool();
        const sql = 'SELECT id, kode_jurusan, nama_jurusan FROM jurusan WHERE id = ?';
        const [rows] = await pool.query(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
}

module.exports = JurusanModel;
