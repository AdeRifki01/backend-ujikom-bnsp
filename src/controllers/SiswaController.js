/**
 * File: src/controllers/SiswaController.js
 * Deskripsi: Kontroler CRUD Data Siswa berorientasi objek
 * Standar Kompetensi: 
 * - J.620100.015.01 (Organisasi File & Fungsi Rapi)
 * - J.620100.018.02 (Pemrograman Berorientasi Objek)
 * - J.620100.017.02 (Pemrograman Terstruktur)
 */

const SiswaModel = require('../models/SiswaModel');
const fileHandler = require('../utils/fileHandler');

class SiswaController {
    /**
     * Mengambil seluruh daftar siswa (Read All)
     * GET /api/siswa
     */
    async getAll(req, res, next) {
        try {
            const { search } = req.query;
            const dataSiswa = await SiswaModel.findAll(search);

            fileHandler.tulisLog(`Mengambil daftar data siswa (Total: ${dataSiswa.length})`);

            return res.status(200).json({
                success: true,
                message: 'Berhasil memuat data siswa',
                total: dataSiswa.length,
                data: dataSiswa
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mengambil detail satu siswa berdasarkan ID (Read Detail)
     * GET /api/siswa/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const siswaId = parseInt(id, 10);

            if (isNaN(siswaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter ID harus berupa angka bulat'
                });
            }

            const siswa = await SiswaModel.findById(siswaId);
            if (!siswa) {
                return res.status(404).json({
                    success: false,
                    message: `Data siswa dengan ID ${siswaId} tidak ditemukan`
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Data siswa berhasil ditemukan',
                data: siswa
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Menambahkan siswa baru (Create)
     * POST /api/siswa
     */
    async create(req, res, next) {
        try {
            const { kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan } = req.body;

            // Cek duplikasi kode siswa
            const isExists = await SiswaModel.isKodeSiswaExists(kode_siswa.trim());
            if (isExists) {
                return res.status(409).json({
                    success: false,
                    message: `Kode siswa '${kode_siswa}' sudah terdaftar. Silakan gunakan kode siswa yang berbeda.`
                });
            }

            const insertId = await SiswaModel.create({
                kode_siswa: kode_siswa.trim().toUpperCase(),
                nama_siswa: nama_siswa.trim(),
                alamat_siswa: alamat_siswa.trim(),
                tgl_siswa: tgl_siswa,
                id_jurusan: parseInt(id_jurusan, 10)
            });

            fileHandler.tulisLog(`Menambahkan siswa baru: [${kode_siswa}] ${nama_siswa} (ID: ${insertId})`);

            const newSiswa = await SiswaModel.findById(insertId);

            return res.status(201).json({
                success: true,
                message: 'Data siswa baru berhasil ditambahkan',
                data: newSiswa
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Memperbarui data siswa (Update)
     * PUT /api/siswa/:id
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const siswaId = parseInt(id, 10);

            if (isNaN(siswaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter ID tidak valid'
                });
            }

            const existingSiswa = await SiswaModel.findById(siswaId);
            if (!existingSiswa) {
                return res.status(404).json({
                    success: false,
                    message: `Data siswa dengan ID ${siswaId} tidak ditemukan`
                });
            }

            const { kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan } = req.body;

            // Cek jika kode siswa diubah dan ternyata bentrok dengan siswa lain
            const isExists = await SiswaModel.isKodeSiswaExists(kode_siswa.trim(), siswaId);
            if (isExists) {
                return res.status(409).json({
                    success: false,
                    message: `Kode siswa '${kode_siswa}' sudah digunakan oleh siswa lain.`
                });
            }

            await SiswaModel.update(siswaId, {
                kode_siswa: kode_siswa.trim().toUpperCase(),
                nama_siswa: nama_siswa.trim(),
                alamat_siswa: alamat_siswa.trim(),
                tgl_siswa: tgl_siswa,
                id_jurusan: parseInt(id_jurusan, 10)
            });

            fileHandler.tulisLog(`Memperbarui data siswa ID ${siswaId} (${nama_siswa})`);

            const updatedSiswa = await SiswaModel.findById(siswaId);

            return res.status(200).json({
                success: true,
                message: 'Data siswa berhasil diperbarui',
                data: updatedSiswa
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Menghapus data siswa (Delete)
     * DELETE /api/siswa/:id
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const siswaId = parseInt(id, 10);

            if (isNaN(siswaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter ID tidak valid'
                });
            }

            const existingSiswa = await SiswaModel.findById(siswaId);
            if (!existingSiswa) {
                return res.status(404).json({
                    success: false,
                    message: `Data siswa dengan ID ${siswaId} tidak ditemukan`
                });
            }

            await SiswaModel.delete(siswaId);
            fileHandler.tulisLog(`Menghapus data siswa: [${existingSiswa.kode_siswa}] ${existingSiswa.nama_siswa}`);

            return res.status(200).json({
                success: true,
                message: `Data siswa '${existingSiswa.nama_siswa}' berhasil dihapus`
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SiswaController();
