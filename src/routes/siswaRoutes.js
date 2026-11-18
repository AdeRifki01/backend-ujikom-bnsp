/**
 * File: src/routes/siswaRoutes.js
 * Deskripsi: Rute REST API untuk endpoint Data Siswa
 * Standar Kompetensi: J.620100.015.01 (Organisasi File & Rute yang Rapi)
 */

const express = require('express');
const router = express.Router();
const siswaController = require('../controllers/SiswaController');
const validator = require('../middlewares/validator');

// Ekspor data ke JSON (Harus di atas /:id agar tidak tertimpa parameter id)
router.get('/export/json', siswaController.exportData.bind(siswaController));

// CRUD Endpoints
router.get('/', siswaController.getAll.bind(siswaController));
router.get('/:id', siswaController.getById.bind(siswaController));
router.post('/', validator.validateSiswaPayload, siswaController.create.bind(siswaController));
router.put('/:id', validator.validateSiswaPayload, siswaController.update.bind(siswaController));
router.delete('/:id', siswaController.delete.bind(siswaController));

module.exports = router;
