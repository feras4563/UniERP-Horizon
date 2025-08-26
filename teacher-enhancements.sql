-- Add basic_salary and education_level columns to teachers table
-- This migration adds fields for teacher salary management and educational qualifications

-- Add the new basic_salary column
ALTER TABLE teachers 
ADD COLUMN basic_salary DECIMAL(10,2);

-- Add the new education_level column
ALTER TABLE teachers 
ADD COLUMN education_level VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN teachers.basic_salary IS 'Basic monthly salary for the teacher in Libyan Dinar';
COMMENT ON COLUMN teachers.education_level IS 'Educational qualification level (PhD, Masters, Bachelor, etc.)';

-- Optional: Update existing records with default values if needed
-- UPDATE teachers SET basic_salary = 0 WHERE basic_salary IS NULL;
-- UPDATE teachers SET education_level = 'بكالوريوس' WHERE education_level IS NULL;
