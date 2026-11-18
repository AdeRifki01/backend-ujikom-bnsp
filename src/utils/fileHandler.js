/**
 * File: src/utils/fileHandler.js
 * Deskripsi: Modul utilitas untuk operasi input/output berkas log (File Access)
 * Standar Kompetensi: J.620100.017.02 (Pemrograman Terstruktur - Akses File)
 */

const fs = require('fs');
const path = require('path');

class FileHandler {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.logFilePath = path.join(this.logDir, 'aktivitas.log');

        this._ensureDirectories();
    }

    /**
     * Memastikan direktori logs telah dibuat
     */
    _ensureDirectories() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Mencatat aktivitas ke dalam berkas log teks
     * @param {string} aktivitas 
     * @param {string} level 
     */
    tulisLog(aktivitas, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${aktivitas}\n`;

        fs.appendFile(this.logFilePath, logEntry, 'utf8', (err) => {
            if (err) {
                console.error('Gagal menulis log ke berkas:', err);
            }
        });
    }

    /**
     * Membaca isi berkas log
     * @returns {string}
     */
    bacaLog() {
        if (fs.existsSync(this.logFilePath)) {
            return fs.readFileSync(this.logFilePath, 'utf8');
        }
        return 'Belum ada log tercatat.';
    }
}

module.exports = new FileHandler();
