-- Drop and recreate database to fix storage engine issues
DROP DATABASE IF EXISTS yspm_timetable;
CREATE DATABASE yspm_timetable CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE yspm_timetable;

-- Create practical_resources table with InnoDB
CREATE TABLE practical_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch VARCHAR(50),
    subject VARCHAR(100),
    name VARCHAR(255),
    url TEXT,
    type VARCHAR(20),
    size INT,
    is_link TINYINT(1) DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100),
    category VARCHAR(50) DEFAULT 'General',
    file_data LONGBLOB
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create users table with InnoDB
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'teacher'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create notices table with InnoDB
CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    department_id VARCHAR(50),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,
    attachment_path VARCHAR(255),
    attachment_name VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create news_ticker table with InnoDB
CREATE TABLE news_ticker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert test users with bcrypt hashed passwords
-- Password for all users: admin123
INSERT INTO users (email, password, role) VALUES 
('admin@yspm.com', '$2b$10$rXc5qbQw3fLqVZF6xN/1zeXB.2VFvJqY4h0.KxIJG/4eY8Dt/WwZC', 'admin'),
('sagarkhandare@gmail.com', '$2b$10$rXc5qbQw3fLqVZF6xN/1zeXB.2VFvJqY4h0.KxIJG/4eY8Dt/WwZC', 'teacher'),
('faculty@1.com', '$2b$10$rXc5qbQw3fLqVZF6xN/1zeXB.2VFvJqY4h0.KxIJG/4eY8Dt/WwZC', 'teacher');

-- Create indexes for performance
-- Resources table indexes
CREATE INDEX idx_batch_subject ON practical_resources(batch, subject);
CREATE INDEX idx_category ON practical_resources(category);
CREATE INDEX idx_uploaded_at ON practical_resources(uploaded_at);

-- Notices table indexes
CREATE INDEX idx_department_active ON notices(department_id, is_active);
CREATE INDEX idx_created_at ON notices(created_at);

-- News ticker index
CREATE INDEX idx_active_created ON news_ticker(is_active, created_at);

SELECT 'Database recreated successfully with InnoDB!' AS status;
SELECT 'Login with: faculty@1.com / admin123' AS login_info;
