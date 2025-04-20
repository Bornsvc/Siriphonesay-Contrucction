-- Drop database if exists (be careful with this in production!)
DROP DATABASE IF EXISTS Siriphonesay_Construction;

-- Create database
CREATE DATABASE Siriphonesay_Construction;

-- Connect to the database
\c Siriphonesay_Construction;

-- Create sequence for patient ID
CREATE SEQUENCE IF NOT EXISTS patient_id_seq START 1;

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(7) PRIMARY KEY DEFAULT LPAD(NEXTVAL('patient_id_seq')::TEXT, 7, '0'),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    age INTEGER,
    registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone_number VARCHAR(20),
    gender VARCHAR(10),
    medication TEXT,
    balance DECIMAL(10,2) DEFAULT 0,
    diagnosis TEXT,
    address TEXT,
    nationality VARCHAR(100),
    social_security_id VARCHAR(50),
    social_security_expiration DATE,
    social_security_company VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();