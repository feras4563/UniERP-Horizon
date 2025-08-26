-- Add sponsor_name field to students table
-- This migration adds a separate sponsor_name field alongside the existing sponsor_contact field

-- Add the new sponsor_name column
ALTER TABLE students 
ADD COLUMN sponsor_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN students.sponsor_name IS 'Name of the student sponsor/guardian';
COMMENT ON COLUMN students.sponsor_contact IS 'Contact information (phone/email) of the student sponsor/guardian';

-- Optional: If you want to migrate existing sponsor_contact data that contains names
-- You can manually update records where sponsor_contact contains both name and contact info
-- Example update (run manually if needed):
-- UPDATE students 
-- SET sponsor_name = 'Extract name from sponsor_contact field'
-- WHERE sponsor_contact IS NOT NULL AND sponsor_contact != '';
