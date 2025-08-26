-- =====================================================
-- FEE MANAGEMENT SYSTEM DATABASE ENHANCEMENT
-- =====================================================

-- 1. FEE TYPES TABLE
CREATE TABLE IF NOT EXISTS fee_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PAYMENT PLANS TABLE
CREATE TABLE IF NOT EXISTS payment_plans (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    installments_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FEE STRUCTURE TABLE (Department-specific fee amounts)
CREATE TABLE IF NOT EXISTS fee_structure (
    id SERIAL PRIMARY KEY,
    department_id VARCHAR(50) REFERENCES departments(id),
    fee_type_id INTEGER REFERENCES fee_types(id),
    payment_plan_id INTEGER REFERENCES payment_plans(id),
    academic_year VARCHAR(9) NOT NULL, -- e.g., "2024-2025"
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LYD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department_id, fee_type_id, payment_plan_id, academic_year)
);

-- 4. FEE INSTALLMENTS TABLE (for tracking installment payments)
CREATE TABLE IF NOT EXISTS fee_installments (
    id SERIAL PRIMARY KEY,
    fee_id INTEGER REFERENCES fees(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    paid_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid, overdue
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FEE PAYMENTS TABLE (for tracking individual payments)
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    fee_id INTEGER REFERENCES fees(id) ON DELETE CASCADE,
    installment_id INTEGER REFERENCES fee_installments(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_method VARCHAR(50), -- cash, bank_transfer, credit_card, etc.
    receipt_no VARCHAR(50) UNIQUE,
    reference_no VARCHAR(100), -- bank reference, transaction ID, etc.
    notes TEXT,
    created_by VARCHAR(50), -- user who processed the payment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default fee types
INSERT INTO fee_types (code, name, name_en, description) VALUES
('TUITION', 'رسوم دراسية', 'Tuition Fees', 'الرسوم الدراسية الأساسية'),
('REGISTRATION', 'رسوم تسجيل', 'Registration Fees', 'رسوم التسجيل للفصل الدراسي'),
('LAB', 'رسوم مختبر', 'Laboratory Fees', 'رسوم استخدام المختبرات'),
('LIBRARY', 'رسوم مكتبة', 'Library Fees', 'رسوم استخدام المكتبة'),
('EXAM', 'رسوم امتحانات', 'Examination Fees', 'رسوم الامتحانات'),
('ACTIVITY', 'رسوم أنشطة', 'Activity Fees', 'رسوم الأنشطة الطلابية'),
('OTHER', 'رسوم أخرى', 'Other Fees', 'رسوم أخرى متنوعة')
ON CONFLICT (code) DO NOTHING;

-- Insert default payment plans
INSERT INTO payment_plans (code, name, name_en, description, installments_count) VALUES
('FULL_YEAR', 'دفعة واحدة', 'Full Year Payment', 'دفع الرسوم كاملة في بداية العام الدراسي', 1),
('SEMESTER', 'دفعتين', 'Semester Payment', 'دفع الرسوم على دفعتين (فصل دراسي)', 2),
('QUARTERLY', 'أربع دفعات', 'Quarterly Payment', 'دفع الرسوم على أربع دفعات', 4),
('MONTHLY', 'دفعات شهرية', 'Monthly Payment', 'دفع الرسوم على دفعات شهرية', 10)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Fee types indexes
CREATE INDEX IF NOT EXISTS idx_fee_types_code ON fee_types(code);
CREATE INDEX IF NOT EXISTS idx_fee_types_active ON fee_types(is_active);

-- Payment plans indexes
CREATE INDEX IF NOT EXISTS idx_payment_plans_code ON payment_plans(code);
CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON payment_plans(is_active);

-- Fee structure indexes
CREATE INDEX IF NOT EXISTS idx_fee_structure_department ON fee_structure(department_id);
CREATE INDEX IF NOT EXISTS idx_fee_structure_academic_year ON fee_structure(academic_year);
CREATE INDEX IF NOT EXISTS idx_fee_structure_active ON fee_structure(is_active);

-- Fee installments indexes
CREATE INDEX IF NOT EXISTS idx_fee_installments_fee_id ON fee_installments(fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_installments_status ON fee_installments(status);
CREATE INDEX IF NOT EXISTS idx_fee_installments_due_date ON fee_installments(due_date);

-- Fee payments indexes
CREATE INDEX IF NOT EXISTS idx_fee_payments_fee_id ON fee_payments(fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_receipt_no ON fee_payments(receipt_no);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_date ON fee_payments(payment_date);

-- =====================================================
-- UPDATE EXISTING FEES TABLE (if needed)
-- =====================================================

-- Add any missing columns to existing fees table
ALTER TABLE fees 
ADD COLUMN IF NOT EXISTS fee_type_id INTEGER REFERENCES fee_types(id),
ADD COLUMN IF NOT EXISTS payment_plan_id INTEGER REFERENCES payment_plans(id),
ADD COLUMN IF NOT EXISTS installment_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for existing fees table
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);
CREATE INDEX IF NOT EXISTS idx_fees_academic_year ON fees(academic_year);
CREATE INDEX IF NOT EXISTS idx_fees_type ON fees(type);

-- =====================================================
-- CREATE VIEWS FOR REPORTING
-- =====================================================

-- View for fee summary
CREATE OR REPLACE VIEW fee_summary AS
SELECT 
    f.id,
    f.student_id,
    s.name as student_name,
    s.department_id,
    d.name as department_name,
    f.amount,
    f.remaining_amount,
    f.status,
    f.due_date,
    f.academic_year,
    ft.name as fee_type_name,
    pp.name as payment_plan_name,
    f.created_at
FROM fees f
LEFT JOIN students s ON f.student_id = s.id
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN fee_types ft ON f.fee_type_id = ft.id
LEFT JOIN payment_plans pp ON f.payment_plan_id = pp.id;

-- View for payment summary
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    fp.id,
    fp.fee_id,
    fp.amount as payment_amount,
    fp.payment_date,
    fp.payment_method,
    fp.receipt_no,
    f.student_id,
    s.name as student_name,
    f.academic_year,
    ft.name as fee_type_name
FROM fee_payments fp
JOIN fees f ON fp.fee_id = f.id
JOIN students s ON f.student_id = s.id
LEFT JOIN fee_types ft ON f.fee_type_id = ft.id;

-- =====================================================
-- COMMIT ALL CHANGES
-- =====================================================

COMMIT;

