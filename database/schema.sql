CREATE DATABASE IF NOT EXISTS pat_system;

USE pat_system;

DROP TABLE IF EXISTS round_results;
DROP TABLE IF EXISTS recruitment_rounds;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS student_analytics;
DROP TABLE IF EXISTS student_academic;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS college_profiles;
DROP TABLE IF EXISTS employers;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    contact_name VARCHAR(120) DEFAULT NULL,
    phone_number VARCHAR(30) DEFAULT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME(6) DEFAULT NULL,

    PRIMARY KEY (user_id),
    UNIQUE KEY email (email)
);

CREATE TABLE students (
    student_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    full_name VARCHAR(255) DEFAULT NULL,
    phone_number VARCHAR(255) DEFAULT NULL,
    college_name VARCHAR(180) DEFAULT NULL,
    usn VARCHAR(255) DEFAULT NULL,
    branch VARCHAR(255) DEFAULT NULL,
    cgpa DECIMAL(38,2) DEFAULT NULL,
    backlog_count INT DEFAULT NULL,
    passing_year INT DEFAULT NULL,
    skills TEXT,
    projects TEXT,
    linkedin_url VARCHAR(255) DEFAULT NULL,
    github_url VARCHAR(255) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    profile_completed BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (student_id),
    UNIQUE KEY user_id (user_id),

    CONSTRAINT students_ibfk_1
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

CREATE TABLE student_academic (
    academic_id INT NOT NULL AUTO_INCREMENT,
    student_id INT DEFAULT NULL,
    degree VARCHAR(255) DEFAULT NULL,
    tenth DOUBLE DEFAULT NULL,
    twelfth DOUBLE DEFAULT NULL,
    semester INT DEFAULT NULL,
    certifications TEXT,

    PRIMARY KEY (academic_id),
    UNIQUE KEY student_id (student_id),

    CONSTRAINT student_academic_ibfk_1
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
);

CREATE TABLE college_profiles (
    college_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    college_name VARCHAR(180) NOT NULL,
    college_description TEXT,
    approved_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (college_id),
    UNIQUE KEY user_id (user_id),
    CONSTRAINT college_profiles_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE employers (
    employer_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_name VARCHAR(255) DEFAULT NULL,
    company_description TEXT,
    approved_status BOOLEAN NOT NULL DEFAULT FALSE,
    rejected_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (employer_id),
    UNIQUE KEY user_id (user_id),

    CONSTRAINT employers_ibfk_1
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

CREATE TABLE jobs (
    job_id INT NOT NULL AUTO_INCREMENT,
    employer_id INT NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT,
    salary_package VARCHAR(255) NOT NULL,
    job_location VARCHAR(255) NOT NULL,
    min_cgpa DECIMAL(3,2) DEFAULT NULL,
    eligible_branches TEXT,
    max_backlogs INT DEFAULT NULL,
    passing_year INT DEFAULT NULL,
    application_deadline DATE NOT NULL,
    placement_drive_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('CLOSED','DELETED','OPEN') NOT NULL,
    requested_college_name VARCHAR(180) DEFAULT NULL,
    college_approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    college_approval_note VARCHAR(1000) DEFAULT NULL,
    approved_by_college_id INT DEFAULT NULL,

    PRIMARY KEY (job_id),
    KEY employer_id (employer_id),

    CONSTRAINT jobs_ibfk_1
        FOREIGN KEY (employer_id)
        REFERENCES employers(employer_id)
);

CREATE TABLE resumes (
    resume_id INT NOT NULL AUTO_INCREMENT,
    student_id INT DEFAULT NULL,
    resume_file TEXT,
    original_file_name VARCHAR(255) DEFAULT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_default BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (resume_id),
    KEY student_id (student_id),

    CONSTRAINT resumes_ibfk_1
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
);

CREATE TABLE applications (
    application_id INT NOT NULL AUTO_INCREMENT,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    resume_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Applied',
    current_round INT NOT NULL DEFAULT 0,
    round_note VARCHAR(1000) DEFAULT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (application_id),

    UNIQUE KEY unique_application (student_id, job_id),

    KEY job_id (job_id),
    KEY resume_id (resume_id),

    CONSTRAINT applications_ibfk_1
        FOREIGN KEY (student_id)
        REFERENCES students(student_id),

    CONSTRAINT applications_ibfk_2
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id),

    CONSTRAINT applications_ibfk_3
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
);

CREATE TABLE recruitment_rounds (
    round_id INT NOT NULL AUTO_INCREMENT,
    job_id INT DEFAULT NULL,
    round_name VARCHAR(255) DEFAULT NULL,
    round_order INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (round_id),
    KEY job_id (job_id),

    CONSTRAINT recruitment_rounds_ibfk_1
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id)
);

CREATE TABLE round_results (
    result_id INT NOT NULL AUTO_INCREMENT,
    application_id INT DEFAULT NULL,
    round_id INT DEFAULT NULL,
    status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (result_id),

    KEY application_id (application_id),
    KEY round_id (round_id),

    CONSTRAINT round_results_ibfk_1
        FOREIGN KEY (application_id)
        REFERENCES applications(application_id),

    CONSTRAINT round_results_ibfk_2
        FOREIGN KEY (round_id)
        REFERENCES recruitment_rounds(round_id)
);

CREATE TABLE notifications (
    notification_id INT NOT NULL AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (notification_id),
    KEY user_id (user_id),

    CONSTRAINT notifications_ibfk_1
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

CREATE TABLE student_analytics (
    student_id INT NOT NULL,
    applications_count INT DEFAULT 0,
    shortlisted_count INT DEFAULT 0,
    interviews_given INT DEFAULT 0,

    PRIMARY KEY (student_id),

    CONSTRAINT student_analytics_ibfk_1
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
);

INSERT INTO users (email, password_hash, role)
VALUES (
    'admin@pat.com',
    '$2a$10$KOHNrRKpnJiVd6x7ymbrZOG573bFW.xQP1kzEJE/BW94h16QmZ/12',
    'admin'
);
