/**
 * File: src/models/SiswaModel.js
 * Deskripsi: Model berorientasi objek untuk entitas Siswa dengan akses basis data SQL
 * Standar Kompetensi: 
 * - J.620100.007.01 (Entitas & Relasi)
 * - J.620100.018.02 (Pemrograman Berorientasi Objek)
 * - J.620100.020.02 (Menggunakan SQL - Relasional, Transaction Commit/Rollback)
 * - J.620100.021.02 (Akses Basis Data)
 */

const db = require('../config/database');

class SiswaModel {
    /**
     * Konstruktor Entitas Siswa
     */
    constructor({ id, kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan, kode_jurusan, nama_jurusan }) {
        this.id = id;
        this.kode_siswa = kode_siswa;
        this.nama_siswa = nama_siswa;
        this.alamat_siswa = alamat_siswa;
        this.tgl_siswa = tgl_siswa;
        this.id_jurusan = id_jurusan;
        this.kode_jurusan = kode_jurusan;
        this.nama_jurusan = nama_jurusan;
    }

    /**
     * Mengambil semua siswa dengan relasi ke tabel jurusan (INNER JOIN)
     * @param {string} [search] Kata kunci pencarian nama atau kode siswa
     * @returns {Promise<Array<SiswaModel>>}
     */
    static async findAll(search = '') {
        const pool = db.getPool();
        let sql = `
            SELECT 
                s.id,
                s.kode_siswa,
                s.nama_siswa,
                s.alamat_siswa,
                DATE_FORMAT(s.tgl_siswa, '%Y-%m-%d') AS tgl_siswa,
                s.id_jurusan,
                j.kode_jurusan,
                j.nama_jurusan,
                s.created_at,
                s.updated_at
            FROM siswa s
            INNER JOIN jurusan j ON s.id_jurusan = j.id
        `;
        const params = [];

        if (search && search.trim() !== '') {
            sql += ` WHERE s.nama_siswa LIKE ? OR s.kode_siswa LIKE ? OR j.nama_jurusan LIKE ? `;
            const wildcard = `%${search.trim()}%`;
            params.push(wildcard, wildcard, wildcard);
        }

        sql += ` ORDER BY s.id DESC `;

        const [rows] = await pool.query(sql, params);
        return rows.map(row => new SiswaModel(row));
    }

    /**
     * Mengambil detail satu siswa berdasarkan ID
     * @param {number} id 
     * @returns {Promise<SiswaModel|null>}
     */
    static async findById(id) {
        const pool = db.getPool();
        const sql = `
            SELECT 
                s.id,
                s.kode_siswa,
                s.nama_siswa,
                s.alamat_siswa,
                DATE_FORMAT(s.tgl_siswa, '%Y-%m-%d') AS tgl_siswa,
                s.id_jurusan,
                j.kode_jurusan,
                j.nama_jurusan,
                s.created_at,
                s.updated_at
            FROM siswa s
            INNER JOIN jurusan j ON s.id_jurusan = j.id
            WHERE s.id = ?
        `;
        const [rows] = await pool.query(sql, [id]);
        return rows.length > 0 ? new SiswaModel(rows[0]) : null;
    }

    /**
     * Memeriksa apakah kode siswa sudah digunakan
     * @param {string} kode_siswa 
     * @param {number} [excludeId] ID yang dikecualikan (untuk kasus update)
     * @returns {Promise<boolean>}
     */
    static async isKodeSiswaExists(kode_siswa, excludeId = null) {
        const pool = db.getPool();
        let sql = `SELECT id FROM siswa WHERE kode_siswa = ?`;
        const params = [kode_siswa];

        if (excludeId) {
            sql += ` AND id != ?`;
            params.push(excludeId);
        }

        const [rows] = await pool.query(sql, params);
        return rows.length > 0;
    }

    /**
     * Membuat data siswa baru dengan Transaksi SQL (Commit & Rollback)
     * Memenuhi Unit 9.h (Commit dan Rollback)
     * @param {Object} data 
     * @returns {Promise<number>} ID siswa yang baru dibuat
     */
    static async create({ kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan }) {
        const pool = db.getPool();
        const connection = await pool.getConnection();

        try {
            // Memulai transaksi SQL
            await connection.beginTransaction();

            const sql = `
                INSERT INTO siswa (kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await connection.query(sql, [
                kode_siswa,
                nama_siswa,
                alamat_siswa,
                tgl_siswa,
                id_jurusan
            ]);

            // Melakukan commit jika operasi berhasil
            await connection.commit();
            return result.insertId;
        } catch (error) {
            // Melakukan rollback jika terjadi kesalahan untuk menjaga konsistensi data
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Memperbarui data siswa berdasarkan ID
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<boolean>}
     */
    static async update(id, { kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan }) {
        const pool = db.getPool();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const sql = `
                UPDATE siswa 
                SET kode_siswa = ?, nama_siswa = ?, alamat_siswa = ?, tgl_siswa = ?, id_jurusan = ?
                WHERE id = ?
            `;
            const [result] = await connection.query(sql, [
                kode_siswa,
                nama_siswa,
                alamat_siswa,
                tgl_siswa,
                id_jurusan,
                id
            ]);

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Menghapus data siswa berdasarkan ID
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const pool = db.getPool();
        const sql = `DELETE FROM siswa WHERE id = ?`;
        const [result] = await pool.query(sql, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = SiswaModel;
