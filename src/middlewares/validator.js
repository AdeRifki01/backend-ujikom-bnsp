/**
 * File: src/middlewares/validator.js
 * Deskripsi: Middleware untuk validasi data input permintaan klien
 * Standar Kompetensi: J.620100.016.01 (Guidelines & Best Practices) & J.620100.017.02 (Pemrograman Terstruktur)
 */

class Validator {
    /**
     * Memvalidasi payload data siswa saat Create atau Update
     */
    static validateSiswaPayload(req, res, next) {
        const { kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan } = req.body;
        const errors = [];

        // Validasi kode siswa
        if (!kode_siswa || typeof kode_siswa !== 'string' || kode_siswa.trim() === '') {
            errors.push('Kode siswa wajib diisi');
        } else if (kode_siswa.trim().length < 3) {
            errors.push('Kode siswa minimal 3 karakter');
        }

        // Validasi nama siswa
        if (!nama_siswa || typeof nama_siswa !== 'string' || nama_siswa.trim() === '') {
            errors.push('Nama siswa wajib diisi');
        } else if (nama_siswa.trim().length < 2) {
            errors.push('Nama siswa minimal 2 karakter');
        }

        // Validasi alamat siswa
        if (!alamat_siswa || typeof alamat_siswa !== 'string' || alamat_siswa.trim() === '') {
            errors.push('Alamat siswa wajib diisi');
        }

        // Validasi format tanggal (YYYY-MM-DD)
        if (!tgl_siswa) {
            errors.push('Tanggal siswa wajib diisi');
        } else {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(tgl_siswa) || isNaN(new Date(tgl_siswa).getTime())) {
                errors.push('Format tanggal siswa tidak valid (gunakan format YYYY-MM-DD)');
            }
        }

        // Validasi id jurusan
        if (!id_jurusan) {
            errors.push('Jurusan siswa wajib dipilih');
        } else if (isNaN(parseInt(id_jurusan, 10)) || parseInt(id_jurusan, 10) <= 0) {
            errors.push('ID Jurusan harus berupa angka positif');
        }

        // Jika ada kesalahan validasi, kembalikan respons 400 Bad Request
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal, mohon periksa kembali input Anda',
                errors: errors
            });
        }

        next();
    }
}

module.exports = Validator;
