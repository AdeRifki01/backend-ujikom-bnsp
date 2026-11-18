/**
 * File: src/routes/jurusanRoutes.js
 * Deskripsi: Rute REST API untuk endpoint Master Jurusan
 */

const express = require('express');
const router = express.Router();
const jurusanController = require('../controllers/JurusanController');

router.get('/', jurusanController.getAll.bind(jurusanController));

module.exports = router;
