-- Insert mock subjects data - 4 subjects for each department
-- This will help with testing teacher assignments and academic management

-- Information Technology Department (DEPT_IT)
INSERT INTO subjects (id, code, name, name_en, department_id, credits, semester, max_students) VALUES
('SUBJ_IT_001', 'IT101', 'مقدمة في البرمجة', 'Introduction to Programming', 'DEPT_IT', 3, 'Fall', 30),
('SUBJ_IT_002', 'IT201', 'قواعد البيانات', 'Database Systems', 'DEPT_IT', 4, 'Spring', 25),
('SUBJ_IT_003', 'IT301', 'هندسة البرمجيات', 'Software Engineering', 'DEPT_IT', 3, 'Fall', 28),
('SUBJ_IT_004', 'IT401', 'أمن المعلومات', 'Information Security', 'DEPT_IT', 3, 'Spring', 20);

-- Architecture Engineering Department (DEPT_ARCH)
INSERT INTO subjects (id, code, name, name_en, department_id, credits, semester, max_students) VALUES
('SUBJ_ARCH_001', 'ARCH101', 'أساسيات التصميم المعماري', 'Fundamentals of Architectural Design', 'DEPT_ARCH', 4, 'Fall', 25),
('SUBJ_ARCH_002', 'ARCH201', 'تاريخ العمارة', 'History of Architecture', 'DEPT_ARCH', 3, 'Spring', 30),
('SUBJ_ARCH_003', 'ARCH301', 'التصميم البيئي', 'Environmental Design', 'DEPT_ARCH', 4, 'Fall', 20),
('SUBJ_ARCH_004', 'ARCH401', 'مشروع التخرج المعماري', 'Architectural Graduation Project', 'DEPT_ARCH', 6, 'Spring', 15);

-- Interior Design Department (DEPT_INTERIOR)
INSERT INTO subjects (id, code, name, name_en, department_id, credits, semester, max_students) VALUES
('SUBJ_INT_001', 'INT101', 'أساسيات التصميم الداخلي', 'Interior Design Fundamentals', 'DEPT_INTERIOR', 3, 'Fall', 25),
('SUBJ_INT_002', 'INT201', 'الألوان والإضاءة', 'Colors and Lighting', 'DEPT_INTERIOR', 3, 'Spring', 30),
('SUBJ_INT_003', 'INT301', 'تصميم المساحات التجارية', 'Commercial Space Design', 'DEPT_INTERIOR', 4, 'Fall', 20),
('SUBJ_INT_004', 'INT401', 'مشروع التصميم الداخلي', 'Interior Design Project', 'DEPT_INTERIOR', 5, 'Spring', 18);

-- Visual Arts and Multimedia Department (DEPT_VISUAL)
INSERT INTO subjects (id, code, name, name_en, department_id, credits, semester, max_students) VALUES
('SUBJ_VIS_001', 'VIS101', 'أساسيات الفنون البصرية', 'Visual Arts Fundamentals', 'DEPT_VISUAL', 3, 'Fall', 30),
('SUBJ_VIS_002', 'VIS201', 'التصميم الجرافيكي', 'Graphic Design', 'DEPT_VISUAL', 4, 'Spring', 25),
('SUBJ_VIS_003', 'VIS301', 'الوسائط المتعددة', 'Multimedia Production', 'DEPT_VISUAL', 4, 'Fall', 22),
('SUBJ_VIS_004', 'VIS401', 'الرسوم المتحركة', 'Animation', 'DEPT_VISUAL', 4, 'Spring', 20);

-- Accounting Department (DEPT_ACCOUNTING)
INSERT INTO subjects (id, code, name, name_en, department_id, credits, semester, max_students) VALUES
('SUBJ_ACC_001', 'ACC101', 'مبادئ المحاسبة', 'Principles of Accounting', 'DEPT_ACCOUNTING', 3, 'Fall', 35),
('SUBJ_ACC_002', 'ACC201', 'المحاسبة المالية', 'Financial Accounting', 'DEPT_ACCOUNTING', 4, 'Spring', 30),
('SUBJ_ACC_003', 'ACC301', 'محاسبة التكاليف', 'Cost Accounting', 'DEPT_ACCOUNTING', 3, 'Fall', 28),
('SUBJ_ACC_004', 'ACC401', 'التدقيق والمراجعة', 'Auditing and Review', 'DEPT_ACCOUNTING', 4, 'Spring', 25);

-- Management Department (DEPT_MANAGEMENT)
INSERT INTO subjects (id, code, name, name_en, department_id, credits, semester, max_students) VALUES
('SUBJ_MGT_001', 'MGT101', 'مبادئ الإدارة', 'Principles of Management', 'DEPT_MANAGEMENT', 3, 'Fall', 40),
('SUBJ_MGT_002', 'MGT201', 'إدارة الموارد البشرية', 'Human Resource Management', 'DEPT_MANAGEMENT', 3, 'Spring', 35),
('SUBJ_MGT_003', 'MGT301', 'التسويق', 'Marketing', 'DEPT_MANAGEMENT', 4, 'Fall', 30),
('SUBJ_MGT_004', 'MGT401', 'إدارة المشاريع', 'Project Management', 'DEPT_MANAGEMENT', 4, 'Spring', 25);
