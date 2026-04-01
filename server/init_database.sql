-- Initialize YSPM Timetable Database (PostgreSQL)

-- Create practical_resources table
CREATE TABLE IF NOT EXISTS practical_resources (
    id SERIAL PRIMARY KEY,
    batch VARCHAR(50),
    subject VARCHAR(100),
    name VARCHAR(255),
    url TEXT,
    type VARCHAR(20),
    size INT,
    is_link BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100),
    category VARCHAR(50) DEFAULT 'General',
    file_data BYTEA
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'teacher'
);

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    department_id VARCHAR(50),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    attachment_path VARCHAR(255),
    attachment_name VARCHAR(255)
);

-- Create news_ticker table
CREATE TABLE IF NOT EXISTS news_ticker (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

-- Insert default admin user (password: admin123)
-- Hash generated with bcrypt for 'admin123'
INSERT INTO users (email, password, role) VALUES
('admin@yspm.com', '$2b$10$rXc5qbQw3fLqVZF6xN/1zeXB.2VFvJqY4h0.KxIJG/4eY8Dt/WwZC', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert demo user (password: admin123)
INSERT INTO users (email, password, role) VALUES
('sagarkhandare@gmail.com', '$2b$10$rXc5qbQw3fLqVZF6xN/1zeXB.2VFvJqY4h0.KxIJG/4eY8Dt/WwZC', 'teacher')
ON CONFLICT (email) DO NOTHING;

-- Insert faculty test user (email: faculty@1.com, password: admin123)
INSERT INTO users (email, password, role) VALUES
('faculty@1.com', '$2b$10$rXc5qbQw3fLqVZF6xN/1zeXB.2VFvJqY4h0.KxIJG/4eY8Dt/WwZC', 'teacher')
ON CONFLICT (email) DO NOTHING;
