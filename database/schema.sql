-- =============================================================================
-- SKKNI / BNSP: PENGEMBANGAN WEB DENGAN NODE.JS DAN REACT
-- Skema: J.620100.020.02 (Menggunakan SQL) & J.620100.007.01 (Entitas & Relasi)
-- Database: PostgreSQL
-- =============================================================================

-- 1. Buat Database (jalankan manual di psql atau DBeaver jika belum ada)
-- CREATE DATABASE db_sekolah_siswa;

-- -----------------------------------------------------------------------------
-- 2. DDL: Drop tabel jika sudah ada (urutan penting: child dulu, baru parent)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS log_aktivitas_siswa;
DROP TABLE IF EXISTS siswa;
DROP TABLE IF EXISTS jurusan;

-- -----------------------------------------------------------------------------
-- 3. DDL: Tabel Entitas 1 - Jurusan (Master Data / Parent)
-- -----------------------------------------------------------------------------
CREATE TABLE jurusan (
    id           SERIAL PRIMARY KEY,
    kode_jurusan VARCHAR(10)  NOT NULL UNIQUE,
    nama_jurusan VARCHAR(100) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. DDL: Tabel Entitas 2 - Siswa (Entitas Utama dengan Relasi Foreign Key)
-- Data Siswa: Kode Siswa, Nama Siswa, Alamat Siswa, Tgl Siswa, Jurusan Siswa
-- -----------------------------------------------------------------------------
CREATE TABLE siswa (
    id           SERIAL PRIMARY KEY,
    kode_siswa   VARCHAR(20)  NOT NULL UNIQUE,
    nama_siswa   VARCHAR(100) NOT NULL,
    alamat_siswa TEXT         NOT NULL,
    tgl_siswa    DATE         NOT NULL,
    id_jurusan   INT          NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_siswa_jurusan
        FOREIGN KEY (id_jurusan) REFERENCES jurusan (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- -----------------------------------------------------------------------------
-- 5. DDL: Tabel Log Aktivitas (Untuk Trigger Audit Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE log_aktivitas_siswa (
    id_log     SERIAL PRIMARY KEY,
    aksi       VARCHAR(20)  NOT NULL,
    kode_siswa VARCHAR(20)  NOT NULL,
    nama_siswa VARCHAR(100) NOT NULL,
    keterangan TEXT         NULL,
    waktu      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. DML: Isi Tabel (Seeding Data Awal)
-- -----------------------------------------------------------------------------
INSERT INTO jurusan (kode_jurusan, nama_jurusan) VALUES
('RPL',  'Rekayasa Perangkat Lunak'),
('TKJ',  'Teknik Komputer dan Jaringan'),
('MM',   'Multimedia'),
('DKV',  'Desain Komunikasi Visual'),
('SIJA', 'Sistem Informasi Jaringan dan Aplikasi');

INSERT INTO siswa (kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan) VALUES
('SIS-001', 'Ahmad Rizky Pratama', 'Jl. Merdeka No. 45, Jakarta Pusat',  '2007-04-15', 1),
('SIS-002', 'Siti Nurhaliza',      'Jl. Sudirman No. 12, Bandung',       '2007-08-22', 1),
('SIS-003', 'Budi Santoso',        'Jl. Diponegoro No. 88, Surabaya',    '2006-11-05', 2),
('SIS-004', 'Dewi Anggraini',      'Jl. Gajah Mada No. 19, Yogyakarta',  '2007-02-18', 3),
('SIS-005', 'Rian Hidayat',        'Jl. Pemuda No. 7, Semarang',         '2006-09-30', 4);

-- -----------------------------------------------------------------------------
-- 7. Operasi Relasional (SQL Query dengan Relasi JOIN)
-- -----------------------------------------------------------------------------
SELECT
    s.id,
    s.kode_siswa,
    s.nama_siswa,
    s.alamat_siswa,
    TO_CHAR(s.tgl_siswa, 'YYYY-MM-DD') AS tgl_siswa,
    j.id            AS id_jurusan,
    j.kode_jurusan,
    j.nama_jurusan
FROM siswa s
INNER JOIN jurusan j ON s.id_jurusan = j.id
ORDER BY s.id DESC;

-- -----------------------------------------------------------------------------
-- 8. SQL Function (Unit 9.f: Membuat Function) - PL/pgSQL
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_hitung_umur(p_tgl_lahir DATE)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_umur INT;
BEGIN
    v_umur := DATE_PART('year', AGE(CURRENT_DATE, p_tgl_lahir))::INT;
    RETURN v_umur;
END;
$$;

-- Contoh penggunaan:
-- SELECT fn_hitung_umur('2007-04-15');

-- -----------------------------------------------------------------------------
-- 9. Stored Procedure (Unit 9.e: Membuat Stored Procedure) - PL/pgSQL
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_tambah_siswa(
    p_kode_siswa   VARCHAR(20),
    p_nama_siswa   VARCHAR(100),
    p_alamat_siswa TEXT,
    p_tgl_siswa    DATE,
    p_id_jurusan   INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO siswa (kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, id_jurusan)
    VALUES (p_kode_siswa, p_nama_siswa, p_alamat_siswa, p_tgl_siswa, p_id_jurusan);
END;
$$;

-- Contoh penggunaan:
-- CALL sp_tambah_siswa('SIS-006', 'Nama Baru', 'Alamat Baru', '2007-01-01', 1);

CREATE OR REPLACE FUNCTION fn_get_siswa_detail(p_id INT)
RETURNS TABLE (
    id           INT,
    kode_siswa   VARCHAR,
    nama_siswa   VARCHAR,
    alamat_siswa TEXT,
    tgl_siswa    TEXT,
    umur         INT,
    kode_jurusan VARCHAR,
    nama_jurusan VARCHAR,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.kode_siswa,
        s.nama_siswa,
        s.alamat_siswa,
        TO_CHAR(s.tgl_siswa, 'YYYY-MM-DD'),
        fn_hitung_umur(s.tgl_siswa),
        j.kode_jurusan,
        j.nama_jurusan,
        s.created_at,
        s.updated_at
    FROM siswa s
    INNER JOIN jurusan j ON s.id_jurusan = j.id
    WHERE s.id = p_id;
END;
$$;

-- Contoh penggunaan:
-- SELECT * FROM fn_get_siswa_detail(1);

-- -----------------------------------------------------------------------------
-- 10. Trigger (Unit 9.g: Membuat Trigger) - PostgreSQL style
-- -----------------------------------------------------------------------------

-- Fungsi yang dipanggil oleh trigger INSERT
CREATE OR REPLACE FUNCTION trg_fn_siswa_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO log_aktivitas_siswa (aksi, kode_siswa, nama_siswa, keterangan)
    VALUES ('INSERT', NEW.kode_siswa, NEW.nama_siswa,
            'Siswa baru ditambahkan dengan ID: ' || NEW.id::TEXT);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_siswa_after_insert ON siswa;
CREATE TRIGGER tr_siswa_after_insert
AFTER INSERT ON siswa
FOR EACH ROW EXECUTE FUNCTION trg_fn_siswa_after_insert();

-- Fungsi yang dipanggil oleh trigger UPDATE
CREATE OR REPLACE FUNCTION trg_fn_siswa_after_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO log_aktivitas_siswa (aksi, kode_siswa, nama_siswa, keterangan)
    VALUES ('UPDATE', NEW.kode_siswa, NEW.nama_siswa,
            'Data siswa ID ' || NEW.id::TEXT || ' berhasil diperbarui');
    -- Auto-update kolom updated_at
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_siswa_after_update ON siswa;
CREATE TRIGGER tr_siswa_after_update
AFTER UPDATE ON siswa
FOR EACH ROW EXECUTE FUNCTION trg_fn_siswa_after_update();
