-- Fee Management System Setup SQL
-- This script creates all necessary tables for the fee management system

-- 1. FEE TYPES TABLE
CREATE TABLE IF NOT EXISTS fee_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PAYMENT PLANS TABLE
CREATE TABLE IF NOT EXISTS payment_plans (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    installments_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FEE STRUCTURE TABLE (for department-specific fee amounts)
CREATE TABLE IF NOT EXISTS fee_structure (
    id SERIAL PRIMARY KEY,
    department_id TEXT REFERENCES departments(id),
    fee_type_id INTEGER REFERENCES fee_types(id),
    payment_plan_id INTEGER REFERENCES payment_plans(id),
    amount NUMERIC(10,2) NOT NULL,
    academic_year VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department_id, fee_type_id, payment_plan_id, academic_year)
);

-- 4. FEE INSTALLMENTS TABLE
CREATE TABLE IF NOT EXISTS fee_installments (
    id SERIAL PRIMARY KEY,
    fee_id BIGINT REFERENCES fees(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paid_amount NUMERIC(10,2) DEFAULT 0,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FEE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    fee_id BIGINT REFERENCES fees(id) ON DELETE CASCADE,
    installment_id INTEGER REFERENCES fee_installments(id),
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATE NOT NULL,
    receipt_number VARCHAR(100) UNIQUE,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default fee types
INSERT INTO fee_types (code, name, name_en, description) VALUES
('TUITION', 'رسوم دراسية', 'Tuition Fees', 'الرسوم الدراسية الأساسية'),
('REGISTRATION', 'رسوم تسجيل', 'Registration Fees', 'رسوم التسجيل للفصل الدراسي'),
('LAB', 'رسوم مختبر', 'Laboratory Fees', 'رسوم استخدام المختبرات'),
('LIBRARY', 'رسوم مكتبة', 'Library Fees', 'رسوم استخدام المكتبة'),
('EXAM', 'رسوم امتحانات', 'Examination Fees', 'رسوم الامتحانات'),
('TRANSPORT', 'رسوم نقل', 'Transportation Fees', 'رسوم النقل المدرسي'),
('MEALS', 'رسوم وجبات', 'Meal Fees', 'رسوم الوجبات المدرسية'),
('ACTIVITIES', 'رسوم أنشطة', 'Activity Fees', 'رسوم الأنشطة اللامنهجية')
ON CONFLICT (code) DO NOTHING;

-- Insert default payment plans
INSERT INTO payment_plans (code, name, name_en, description, installments_count) VALUES
('FULL_YEAR', 'دفع سنوي كامل', 'Full Year Payment', 'دفع جميع الرسوم دفعة واحدة', 1),
('SEMESTER', 'دفع فصلي', 'Semester Payment', 'دفع الرسوم على فترتين', 2),
('QUARTERLY', 'دفع ربع سنوي', 'Quarterly Payment', 'دفع الرسوم على 4 أقساط', 4),
('MONTHLY', 'دفع شهري', 'Monthly Payment', 'دفع الرسوم على 10 أقساط', 10),
('CUSTOM', 'دفع مخصص', 'Custom Payment', 'خطة دفع مخصصة', 1)
ON CONFLICT (code) DO NOTHING;

-- Insert default fee structure for all departments
INSERT INTO fee_structure (department_id, fee_type_id, payment_plan_id, amount, academic_year)
SELECT 
    d.id as department_id,
    ft.id as fee_type_id,
    pp.id as payment_plan_id,
    CASE 
        WHEN ft.code = 'TUITION' THEN 3000.00
        WHEN ft.code = 'REGISTRATION' THEN 500.00
        WHEN ft.code = 'LAB' THEN 200.00
        WHEN ft.code = 'LIBRARY' THEN 100.00
        WHEN ft.code = 'EXAM' THEN 150.00
        WHEN ft.code = 'TRANSPORT' THEN 800.00
        WHEN ft.code = 'MEALS' THEN 1200.00
        WHEN ft.code = 'ACTIVITIES' THEN 300.00
        ELSE 100.00
    END as amount,
    '2024-2025' as academic_year
FROM departments d
CROSS JOIN fee_types ft
CROSS JOIN payment_plans pp
WHERE ft.is_active = true AND pp.is_active = true
ON CONFLICT (department_id, fee_type_id, payment_plan_id, academic_year) DO NOTHING;

-- Add missing columns to existing fees table
ALTER TABLE fees ADD COLUMN IF NOT EXISTS fee_type_id INTEGER REFERENCES fee_types(id);
ALTER TABLE fees ADD COLUMN IF NOT EXISTS payment_plan_id INTEGER REFERENCES payment_plans(id);
ALTER TABLE fees ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);
ALTER TABLE fees ADD COLUMN IF NOT EXISTS installment_count INTEGER DEFAULT 1;
ALTER TABLE fees ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE fees ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_types_code ON fee_types(code);
CREATE INDEX IF NOT EXISTS idx_fee_types_active ON fee_types(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_plans_code ON payment_plans(code);
CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON payment_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_fee_structure_dept ON fee_structure(department_id);
CREATE INDEX IF NOT EXISTS idx_fee_structure_type ON fee_structure(fee_type_id);
CREATE INDEX IF NOT EXISTS idx_fee_structure_plan ON fee_structure(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_fee_installments_fee ON fee_installments(fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_installments_status ON fee_installments(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_fee ON fee_payments(fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_receipt ON fee_payments(receipt_number);

-- Create views for reporting
CREATE OR REPLACE VIEW fee_summary AS
SELECT 
    f.id,
    f.student_id,
    s.name as student_name,
    d.name as department_name,
    ft.name as fee_type_name,
    pp.name as payment_plan_name,
    f.amount,
    f.paid_amount,
    (f.amount - COALESCE(f.paid_amount, 0)) as remaining_amount,
    f.status,
    f.due_date,
    f.academic_year,
    f.created_at
FROM fees f
LEFT JOIN students s ON f.student_id = s.id
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN fee_types ft ON f.fee_type_id = ft.id
LEFT JOIN payment_plans pp ON f.payment_plan_id = pp.id;

CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    fp.id,
    fp.fee_id,
    fp.amount as payment_amount,
    fp.payment_method,
    fp.payment_date,
    fp.receipt_number,
    f.student_id,
    s.name as student_name,
    ft.name as fee_type_name,
    fp.created_at
FROM fee_payments fp
LEFT JOIN fees f ON fp.fee_id = f.id
LEFT JOIN students s ON f.student_id = s.id
LEFT JOIN fee_types ft ON f.fee_type_id = ft.id;

-- Update existing fees to have default values
UPDATE fees 
SET 
    fee_type_id = (SELECT id FROM fee_types WHERE code = 'TUITION' LIMIT 1),
    payment_plan_id = (SELECT id FROM payment_plans WHERE code = 'FULL_YEAR' LIMIT 1),
    academic_year = '2024-2025'
WHERE fee_type_id IS NULL;

-- Commit the transaction
COMMIT;

