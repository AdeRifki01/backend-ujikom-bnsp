/**
 * File: src/initDb.js
 * Deskripsi: Skrip inisialisasi basis data dan tabel otomatis
 * Jalankan dengan: npm run init-db
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    console.log('🔄 Memulai inisialisasi database MySQL...');

    // 1. Koneksi awal ke server MySQL (tanpa memilih database terlebih dahulu)
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const port = parseInt(process.env.DB_PORT, 10) || 3306;
    const dbName = process.env.DB_NAME || 'db_sekolah_siswa';

    try {
        const rootConnection = await mysql.createConnection({
            host,
            user,
            password,
            port,
            multipleStatements: true
        });

        console.log(`🔌 Terhubung ke server MySQL di ${host}:${port}`);

        // 2. Buat database jika belum ada
        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        console.log(`✅ Database '${dbName}' siap digunakan.`);
        await rootConnection.end();

        // 3. Terhubung langsung ke database yang dituju
        const dbConnection = await mysql.createConnection({
            host,
            user,
            password,
            port,
            database: dbName,
            multipleStatements: true
        });

        // 4. Buat tabel jurusan
        await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS \`jurusan\` (
                \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                \`kode_jurusan\` VARCHAR(10) NOT NULL UNIQUE,
                \`nama_jurusan\` VARCHAR(100) NOT NULL,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);
        console.log('✅ Tabel `jurusan` berhasil diverifikasi.');

        // 5. Buat tabel siswa
        await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS \`siswa\` (
                \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                \`kode_siswa\` VARCHAR(20) NOT NULL UNIQUE,
                \`nama_siswa\` VARCHAR(100) NOT NULL,
                \`alamat_siswa\` TEXT NOT NULL,
                \`tgl_siswa\` DATE NOT NULL,
                \`id_jurusan\` INT NOT NULL,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT \`fk_siswa_jurusan\` 
                    FOREIGN KEY (\`id_jurusan\`) REFERENCES \`jurusan\` (\`id\`) 
                    ON DELETE RESTRICT 
                    ON UPDATE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('✅ Tabel `siswa` berhasil diverifikasi.');

        // 6. Buat tabel log aktivitas
        await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS \`log_aktivitas_siswa\` (
                \`id_log\` INT AUTO_INCREMENT PRIMARY KEY,
                \`aksi\` VARCHAR(20) NOT NULL,
                \`kode_siswa\` VARCHAR(20) NOT NULL,
                \`nama_siswa\` VARCHAR(100) NOT NULL,
                \`keterangan\` TEXT NULL,
                \`waktu\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);
        console.log('✅ Tabel `log_aktivitas_siswa` berhasil diverifikasi.');

        // 7. Seed master jurusan jika kosong
        const [existingJurusan] = await dbConnection.query('SELECT COUNT(*) AS count FROM jurusan');
        if (existingJurusan[0].count === 0) {
            await dbConnection.query(`
                INSERT INTO \`jurusan\` (\`kode_jurusan\`, \`nama_jurusan\`) VALUES
                ('RPL', 'Rekayasa Perangkat Lunak'),
                ('TKJ', 'Teknik Komputer dan Jaringan'),
                ('MM', 'Multimedia'),
                ('DKV', 'Desain Komunikasi Visual'),
                ('SIJA', 'Sistem Informasi Jaringan dan Aplikasi');
            `);
            console.log('🌱 Data master jurusan berhasil diisi.');
        }

        // 8. Seed data siswa awal jika kosong
        const [existingSiswa] = await dbConnection.query('SELECT COUNT(*) AS count FROM siswa');
        if (existingSiswa[0].count === 0) {
            await dbConnection.query(`
                INSERT INTO \`siswa\` (\`kode_siswa\`, \`nama_siswa\`, \`alamat_siswa\`, \`tgl_siswa\`, \`id_jurusan\`) VALUES
                ('SIS-001', 'Ahmad Rizky Pratama', 'Jl. Merdeka No. 45, Jakarta Pusat', '2007-04-15', 1),
                ('SIS-002', 'Siti Nurhaliza', 'Jl. Sudirman No. 12, Bandung', '2007-08-22', 1),
                ('SIS-003', 'Budi Santoso', 'Jl. Diponegoro No. 88, Surabaya', '2006-11-05', 2),
                ('SIS-004', 'Dewi Anggraini', 'Jl. Gajah Mada No. 19, Yogyakarta', '2007-02-18', 3),
                ('SIS-005', 'Rian Hidayat', 'Jl. Pemuda No. 7, Semarang', '2006-09-30', 4);
            `);
            console.log('🌱 Data sampel siswa berhasil diisi.');
        }

        await dbConnection.end();
        console.log('✨ [Sukses]: Inisialisasi basis data selesai secara sempurna!');
    } catch (err) {
        console.error('❌ Gagal melakukan inisialisasi database:', err.message);
        console.error('💡 Tips: Pastikan server MySQL sudah berjalan (misalnya Start All di Laragon atau XAMPP).');
    }
}

initializeDatabase();
