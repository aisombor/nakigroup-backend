-- ========================================================
-- Naki Group Recruitment & Job Application Database Schema
-- ========================================================

-- 1. Users Table (HR Managers and Administrators)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'hr', -- 'admin', 'hr'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jobs Table (Job Postings shown on Careers page)
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) DEFAULT 'Full-Time', -- 'Full-Time', 'Part-Time', 'Contract', 'Internship'
    location VARCHAR(100) DEFAULT 'Phnom Penh, Cambodia',
    experience_level VARCHAR(50) DEFAULT 'Mid-Level',
    salary_range VARCHAR(100) DEFAULT 'Negotiable',
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Applications Table (Candidate Submissions with CVs)
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    cv_file_path VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    cover_letter TEXT,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'reviewed', 'shortlisted', 'rejected'
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

