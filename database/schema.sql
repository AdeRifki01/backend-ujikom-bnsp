-- =============================================================================
-- SKKNI / BNSP: PENGEMBANGAN WEB DENGAN NODE.JS DAN REACT
-- Skema: J.620100.020.02 (Menggunakan SQL) & J.620100.007.01 (Entitas & Relasi)
-- =============================================================================

-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS `db_sekolah_siswa`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `db_sekolah_siswa`;

-- -----------------------------------------------------------------------------
-- 2. DDL: Tabel Entitas 1: Jurusan (Master Data)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `siswa`;
DROP TABLE IF EXISTS `jurusan`;
DROP TABLE IF EXISTS `log_aktivitas_siswa`;

CREATE TABLE `jurusan` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `kode_jurusan` VARCHAR(10) NOT NULL UNIQUE,
    `nama_jurusan` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. DDL: Tabel Entitas 2: Siswa (Entitas Utama dengan Relasi Foreign Key)
-- Data Siswa: Kode Siswa, Nama Siswa, Alamat Siswa, Tgl Siswa, Jurusan Siswa
-- -----------------------------------------------------------------------------
CREATE TABLE `siswa` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `kode_siswa` VARCHAR(20) NOT NULL UNIQUE,
    `nama_siswa` VARCHAR(100) NOT NULL,
    `alamat_siswa` TEXT NOT NULL,
    `tgl_siswa` DATE NOT NULL,
    `id_jurusan` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_siswa_jurusan` 
        FOREIGN KEY (`id_jurusan`) REFERENCES `jurusan` (`id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. DDL: Tabel Log Aktivitas (Untuk Trigger Audit Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE `log_aktivitas_siswa` (
    `id_log` INT AUTO_INCREMENT PRIMARY KEY,
    `aksi` VARCHAR(20) NOT NULL,
    `kode_siswa` VARCHAR(20) NOT NULL,
    `nama_siswa` VARCHAR(100) NOT NULL,
    `keterangan` TEXT NULL,
    `waktu` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. DML: Isi Tabel (Seeding Data Awal)
-- -----------------------------------------------------------------------------
-- Isi Tabel Jurusan
INSERT INTO `jurusan` (`kode_jurusan`, `nama_jurusan`) VALUES
('RPL', 'Rekayasa Perangkat Lunak'),
('TKJ', 'Teknik Komputer dan Jaringan'),
('MM', 'Multimedia'),
('DKV', 'Desain Komunikasi Visual'),
('SIJA', 'Sistem Informasi Jaringan dan Aplikasi');

-- Isi Tabel Siswa
INSERT INTO `siswa` (`kode_siswa`, `nama_siswa`, `alamat_siswa`, `tgl_siswa`, `id_jurusan`) VALUES
('SIS-001', 'Ahmad Rizky Pratama', 'Jl. Merdeka No. 45, Jakarta Pusat', '2007-04-15', 1),
('SIS-002', 'Siti Nurhaliza', 'Jl. Sudirman No. 12, Bandung', '2007-08-22', 1),
('SIS-003', 'Budi Santoso', 'Jl. Diponegoro No. 88, Surabaya', '2006-11-05', 2),
('SIS-004', 'Dewi Anggraini', 'Jl. Gajah Mada No. 19, Yogyakarta', '2007-02-18', 3),
('SIS-005', 'Rian Hidayat', 'Jl. Pemuda No. 7, Semarang', '2006-09-30', 4);

-- -----------------------------------------------------------------------------
-- 6. Operasi Relasional (SQL Query dengan Relasi JOIN)
-- -----------------------------------------------------------------------------
SELECT 
    s.id,
    s.kode_siswa,
    s.nama_siswa,
    s.alamat_siswa,
    s.tgl_siswa,
    j.id AS id_jurusan,
    j.kode_jurusan,
    j.nama_jurusan
FROM `siswa` s
INNER JOIN `jurusan` j ON s.id_jurusan = j.id
ORDER BY s.id DESC;

-- -----------------------------------------------------------------------------
-- 7. SQL Function (Unit 9.f: Membuat Function)
-- -----------------------------------------------------------------------------
DELIMITER $$
DROP FUNCTION IF EXISTS `fn_hitung_umur`$$
CREATE FUNCTION `fn_hitung_umur`(p_tgl_lahir DATE) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_umur INT;
    SET v_umur = TIMESTAMPDIFF(YEAR, p_tgl_lahir, CURDATE());
    RETURN v_umur;
END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 8. Stored Procedure (Unit 9.e: Membuat Stored Procedure)
-- -----------------------------------------------------------------------------
DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_get_siswa_detail`$$
CREATE PROCEDURE `sp_get_siswa_detail`(IN p_id INT)
BEGIN
    SELECT 
        s.id,
        s.kode_siswa,
        s.nama_siswa,
        s.alamat_siswa,
        s.tgl_siswa,
        fn_hitung_umur(s.tgl_siswa) AS umur,
        j.kode_jurusan,
        j.nama_jurusan,
        s.created_at,
        s.updated_at
    FROM `siswa` s
    INNER JOIN `jurusan` j ON s.id_jurusan = j.id
    WHERE s.id = p_id;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_tambah_siswa`$$
CREATE PROCEDURE `sp_tambah_siswa`(
    IN p_kode_siswa VARCHAR(20),
    IN p_nama_siswa VARCHAR(100),
    IN p_alamat_siswa TEXT,
    IN p_tgl_siswa DATE,
    IN p_id_jurusan INT
)
BEGIN
    INSERT INTO `siswa` (`kode_siswa`, `nama_siswa`, `alamat_siswa`, `tgl_siswa`, `id_jurusan`)
    VALUES (p_kode_siswa, p_nama_siswa, p_alamat_siswa, p_tgl_siswa, p_id_jurusan);
END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 9. Trigger (Unit 9.g: Membuat Trigger)
-- -----------------------------------------------------------------------------
DELIMITER $$
DROP TRIGGER IF EXISTS `tr_siswa_after_insert`$$
CREATE TRIGGER `tr_siswa_after_insert`
AFTER INSERT ON `siswa`
FOR EACH ROW
BEGIN
    INSERT INTO `log_aktivitas_siswa` (`aksi`, `kode_siswa`, `nama_siswa`, `keterangan`)
    VALUES ('INSERT', NEW.kode_siswa, NEW.nama_siswa, CONCAT('Siswa baru ditambahkan dengan ID: ', NEW.id));
END$$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS `tr_siswa_after_update`$$
CREATE TRIGGER `tr_siswa_after_update`
AFTER UPDATE ON `siswa`
FOR EACH ROW
BEGIN
    INSERT INTO `log_aktivitas_siswa` (`aksi`, `kode_siswa`, `nama_siswa`, `keterangan`)
    VALUES ('UPDATE', NEW.kode_siswa, NEW.nama_siswa, CONCAT('Data siswa ID ', NEW.id, ' berhasil diperbarui'));
END$$
DELIMITER ;
