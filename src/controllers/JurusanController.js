/**
 * File: src/controllers/JurusanController.js
 * Deskripsi: Kontroler untuk data master Jurusan
 * Standar Kompetensi: J.620100.007.01 (Entitas & Relasi) & J.620100.018.02 (OOP)
 */

const JurusanModel = require('../models/JurusanModel');

class JurusanController {
    /**
     * Mengambil semua master data jurusan
     * GET /api/jurusan
     */
    async getAll(req, res, next) {
        try {
            const dataJurusan = await JurusanModel.findAll();
            return res.status(200).json({
                success: true,
                message: 'Berhasil memuat data jurusan',
                data: dataJurusan
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new JurusanController();
