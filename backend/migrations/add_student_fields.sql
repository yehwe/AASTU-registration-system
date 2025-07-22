-- Add student-specific fields to users table
ALTER TABLE users
ADD COLUMN student_id VARCHAR(20) UNIQUE,
ADD COLUMN year INT,
ADD COLUMN semester INT,
ADD COLUMN department VARCHAR(50);

-- Add constraints
ALTER TABLE users
ADD CONSTRAINT check_year CHECK (year BETWEEN 1 AND 5),
ADD CONSTRAINT check_semester CHECK (semester BETWEEN 1 AND 2);

-- Add index for faster lookups
CREATE INDEX idx_student_id ON users(student_id);
CREATE INDEX idx_department ON users(department); 