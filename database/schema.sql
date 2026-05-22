-- ============================================================
-- College Academic Material Management System - MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_cms;
USE college_cms;

-- ===== DEPARTMENTS =====
CREATE TABLE departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(10) UNIQUE,
    description TEXT
);

-- ===== USERS =====
CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(15),
    profile_picture VARCHAR(255),
    role            ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    department_id   BIGINT,
    active          BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login      DATETIME,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ===== COURSES =====
CREATE TABLE courses (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(10) UNIQUE,
    duration_years  INT DEFAULT 4,
    department_id   BIGINT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- ===== SUBJECTS =====
CREATE TABLE subjects (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(15) UNIQUE,
    semester    INT NOT NULL,
    year        INT NOT NULL,
    total_units INT DEFAULT 5,
    course_id   BIGINT NOT NULL,
    faculty_id  BIGINT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ===== MATERIALS =====
CREATE TABLE materials (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    type           ENUM('PDF','PPT','DOC','ASSIGNMENT','LAB_MANUAL','PREVIOUS_PAPER','OTHER') NOT NULL,
    file_name      VARCHAR(255) NOT NULL,
    file_path      VARCHAR(500) NOT NULL,
    file_size      VARCHAR(20),
    mime_type      VARCHAR(100),
    unit_number    INT,
    download_count BIGINT DEFAULT 0,
    subject_id     BIGINT NOT NULL,
    uploaded_by    BIGINT NOT NULL,
    uploaded_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== ANNOUNCEMENTS =====
CREATE TABLE announcements (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    content       TEXT NOT NULL,
    priority      ENUM('LOW','NORMAL','HIGH','URGENT') DEFAULT 'NORMAL',
    posted_by     BIGINT NOT NULL,
    department_id BIGINT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    active        BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ===== INDEXES =====
CREATE INDEX idx_materials_subject    ON materials(subject_id);
CREATE INDEX idx_materials_uploader   ON materials(uploaded_by);
CREATE INDEX idx_materials_type       ON materials(type);
CREATE INDEX idx_subjects_course      ON subjects(course_id);
CREATE INDEX idx_subjects_faculty     ON subjects(faculty_id);
CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_announcements_dept   ON announcements(department_id);

-- ============================================================
-- NOTE: Sample data is auto-seeded by DataInitializer.java
-- Default credentials:
--   Admin:   admin   / admin123
--   Faculty: faculty1 / faculty123
--   Student: student1 / student123
-- ============================================================
