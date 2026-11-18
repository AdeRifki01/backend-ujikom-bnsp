/**
 * File: src/models/JurusanModel.js
 * Deskripsi: Model untuk entitas Jurusan (PostgreSQL)
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
        const result = await pool.query(sql);
        return result.rows;
    }

    /**
     * Mengambil jurusan berdasarkan ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const pool = db.getPool();
        const sql = 'SELECT id, kode_jurusan, nama_jurusan FROM jurusan WHERE id = $1';
        const result = await pool.query(sql, [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
}

module.exports = JurusanModel;
