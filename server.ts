import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseService } from './database.js';
import { UserService } from './users.js';
import { supabase } from './supabase.js';
// import { AccountingService } from './accounting'; // Removed - will be reimplemented

// Helper function to clean student data
function cleanStudentData(data: any) {
  // Handle GPA validation - database has precision 3, scale 2 (max 9.99)
  let gpa: number | null = null;
  if (data.gpa) {
    const parsedGpa = parseFloat(data.gpa);
    if (!isNaN(parsedGpa)) {
      // If GPA is greater than 9.99, it might be a percentage (0-100 scale)
      // Convert it to a 4.0 scale by dividing by 25
      if (parsedGpa > 9.99) {
        gpa = Math.min(4.0, parsedGpa / 25);
      } else {
        gpa = Math.min(9.99, parsedGpa);
      }
    }
  }

  return {
    ...data,
    // Convert empty strings to null for optional fields
    department_id: data.department_id || null,
    year: data.year ? parseInt(data.year) || null : null,
    email: data.email || null,
    phone: data.phone || null,
    academic_history: data.academic_history || null,
    gpa: gpa,
    nationality: data.nationality || null,
    gender: data.gender || null,
    birth_date: data.birth_date || null,
    enrollment_date: data.enrollment_date || null,
    address: data.address || null,
    national_id_passport: data.national_id_passport || null,
    // Set default status if not provided
    status: data.status || 'active'
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
app.get('/', (req, res) => {
  // Redirect to login by default
  res.redirect('/login.html');
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/qr-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr-test.html'));
});

app.get('/student-profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'student-profile.html'));
});

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ 
        error: 'جميع الحقول مطلوبة: اسم المستخدم، كلمة المرور، نوع المستخدم' 
      });
    }

    const user = UserService.authenticate(username, password);
    
    if (!user || user.role !== role) {
      return res.status(401).json({ 
        error: 'بيانات تسجيل الدخول غير صحيحة' 
      });
    }

    // Generate a simple token (in production, use JWT)
    const token = `token_${user.id}_${Date.now()}`;
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token: token,
      message: 'تم تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

// API Routes for Students
app.get('/api/students', async (req, res) => {
  try {
    const students = await DatabaseService.getAllStudents();
    res.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const student = await DatabaseService.getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Get student fees
app.get('/api/students/:id/fees', async (req, res) => {
  try {
    const studentId = req.params.id;
    const fees = await DatabaseService.getFeesByStudent(studentId);
    res.json(fees);
  } catch (error) {
    console.error('Error fetching student fees:', error);
    res.status(500).json({ error: 'Failed to fetch student fees' });
  }
});

// Get student schedule
app.get('/api/students/:id/schedule', async (req, res) => {
  try {
    const studentId = req.params.id;
    const schedule = await DatabaseService.getStudentSchedule(studentId);
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    res.status(500).json({ error: 'Failed to fetch student schedule' });
  }
});

// Get comprehensive student profile (all data in one request)
app.get('/api/students/:id/profile', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Get all student data in parallel
    const [student, fees, schedule, attendance] = await Promise.all([
      DatabaseService.getStudentById(studentId),
      DatabaseService.getFeesByStudent(studentId),
      DatabaseService.getStudentSchedule(studentId),
      DatabaseService.getStudentAttendanceByStudent(studentId)
    ]);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      student,
      fees,
      schedule,
      attendance
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    console.log('Received student data:', req.body);
    
    // Only handle student data here (fees are managed separately)
    const studentData = cleanStudentData(req.body);
    console.log('Cleaned student data:', studentData);
    
    // Generate a structured student ID
    if (studentData.department_id && studentData.enrollment_date) {
      studentData.id = await DatabaseService.generateStudentId(
        studentData.department_id, 
        studentData.enrollment_date
      );
    } else {
      // Fallback to timestamp-based ID if missing required data
      studentData.id = `S${Date.now()}`;
    }
    
    console.log('Final student data with ID:', studentData);
    
    const student = await DatabaseService.createStudent(studentData);
    console.log('Student created successfully:', student);
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific database errors
    if (error.message && error.message.includes('national_id_passport_key')) {
      res.status(400).json({ 
        error: 'رقم الهوية الوطنية موجود مسبقاً في النظام. الرجاء استخدام رقم هوية مختلف.',
        details: 'Duplicate national ID' 
      });
    } else if (error.message && error.message.includes('department_id_fkey')) {
      res.status(400).json({ 
        error: 'القسم المحدد غير موجود في النظام. الرجاء اختيار قسم صحيح.',
        details: 'Invalid department ID' 
      });
    } else if (error.message && error.message.includes('students_email_key')) {
      res.status(400).json({ 
        error: 'البريد الإلكتروني موجود مسبقاً في النظام. الرجاء استخدام بريد إلكتروني مختلف.',
        details: 'Duplicate email' 
      });
    } else if (error.message && error.message.includes('numeric field overflow')) {
      res.status(400).json({ 
        error: 'قيمة المعدل التراكمي غير صحيحة. يجب أن تكون بين 0 و 9.99 أو بين 0 و 100 إذا كانت نسبة مئوية.',
        details: 'Invalid GPA value' 
      });
    } else {
      res.status(500).json({ error: 'Failed to create student', details: error.message });
    }
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = cleanStudentData(req.body);
    const student = await DatabaseService.updateStudent(id, updateData);
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student', details: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await DatabaseService.deleteStudent(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.get('/api/students/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const students = await DatabaseService.searchStudents(query);
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search students' });
  }
});

// Search students by ID pattern (e.g., H259 for all September 2025 students)
app.get('/api/students/search/id/:pattern', async (req, res) => {
  try {
    const pattern = req.params.pattern;
    const students = await DatabaseService.searchStudentsByIdPattern(pattern);
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search students by ID pattern' });
  }
});

app.get('/api/students/department/:departmentId', async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const students = await DatabaseService.getStudentsByDepartment(departmentId);
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students by department' });
  }
});

app.get('/api/students/count', async (req, res) => {
  try {
    const count = await DatabaseService.getStudentCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get student count' });
  }
});

// API Routes for Teachers
app.get('/api/teachers', async (req, res) => {
  try {
    console.log('Fetching teachers from database...');
    const teachers = await DatabaseService.getAllTeachers();
    console.log('Teachers fetched successfully:', teachers.length, 'teachers');
    res.json({ teachers });
  } catch (error) {
    console.error('Error in /api/teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers', details: error.message });
  }
});

app.get('/api/teachers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const teacher = await DatabaseService.getTeacherById(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    const teacherData = { ...req.body };
    // Generate a unique ID for the teacher
    teacherData.id = `T${Date.now()}`;
    const teacher = await DatabaseService.createTeacher(teacherData);
    res.status(201).json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: 'Failed to create teacher', details: error.message });
  }
});

app.put('/api/teachers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const teacher = await DatabaseService.updateTeacher(id, req.body);
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await DatabaseService.deleteTeacher(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

// API Routes for Departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await DatabaseService.getAllDepartments();
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.get('/api/departments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const department = await DatabaseService.getDepartmentById(id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// API Routes for Subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await DatabaseService.getAllSubjects();
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

app.get('/api/subjects/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const subject = await DatabaseService.getSubjectById(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const subjectData = { ...req.body };
    // Generate a unique ID for the subject
    subjectData.id = `SUB${Date.now()}`;
    const subject = await DatabaseService.createSubject(subjectData);
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject', details: error.message });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const subject = await DatabaseService.updateSubject(id, req.body);
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await DatabaseService.deleteSubject(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

app.get('/api/subjects/department/:departmentId', async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const subjects = await DatabaseService.getSubjectsByDepartment(departmentId);
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department subjects' });
  }
});

// API Routes for Teacher-Subject Relationships
app.get('/api/teachers/:teacherId/subjects', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const teacherSubjects = await DatabaseService.getTeacherSubjects(teacherId);
    res.json({ teacherSubjects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher subjects' });
  }
});

app.post('/api/teachers/:teacherId/subjects', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { subjectId, proficiencyLevel, yearsTeaching, isPrimary } = req.body;
    const teacherSubject = await DatabaseService.assignSubjectToTeacher(
      teacherId, 
      subjectId, 
      proficiencyLevel, 
      yearsTeaching, 
      isPrimary
    );
    res.status(201).json(teacherSubject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign subject to teacher' });
  }
});

app.delete('/api/teachers/:teacherId/subjects/:subjectId', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const subjectId = req.params.subjectId;
    await DatabaseService.removeSubjectFromTeacher(teacherId, subjectId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove subject from teacher' });
  }
});

app.get('/api/subjects/:subjectId/teachers', async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const subjectTeachers = await DatabaseService.getTeachersBySubject(subjectId);
    res.json({ subjectTeachers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject teachers' });
  }
});

app.put('/api/teachers/:teacherId/hours', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { hours } = req.body;
    await DatabaseService.updateTeacherHours(teacherId, hours);
    res.json({ message: 'Teaching hours updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teaching hours' });
  }
});

app.get('/api/teachers/:teacherId/hours', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const hours = await DatabaseService.getTeacherTotalHours(teacherId);
    res.json({ hours });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teaching hours' });
  }
});

// API Routes for Timetable & Scheduling
app.get('/api/timetable', async (req, res) => {
  try {
    const { departmentId } = req.query;
    let timetable;
    
    if (departmentId) {
      timetable = await DatabaseService.getTimetableByDepartment(departmentId as string);
    } else {
      timetable = await DatabaseService.getAllTimetableEntries();
    }
    
    res.json({ timetable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

app.get('/api/timetable/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const timetable = await DatabaseService.getTimetableEntryById(id);
    
    if (!timetable) {
      res.status(404).json({ error: 'Timetable entry not found' });
      return;
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetable entry' });
  }
});

app.post('/api/timetable', async (req, res) => {
  try {
    const timetableData = req.body;
    const timetable = await DatabaseService.createTimetableEntry(timetableData);
    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create timetable entry' });
  }
});

app.put('/api/timetable/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const timetable = await DatabaseService.updateTimetableEntry(id, updates);
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update timetable entry' });
  }
});

app.delete('/api/timetable/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await DatabaseService.deleteTimetableEntry(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete timetable entry' });
  }
});

app.get('/api/timetable/conflicts', async (req, res) => {
  try {
    const { dayOfWeek, timeSlot, teacherId, room } = req.query;
    const conflicts = await DatabaseService.checkSchedulingConflicts(
      dayOfWeek as string,
      timeSlot as string,
      teacherId as string,
      room as string
    );
    res.json({ conflicts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check conflicts' });
  }
});

app.get('/api/timetable/available-teachers', async (req, res) => {
  try {
    const { subjectId, dayOfWeek, timeSlot } = req.query;
    const availableTeachers = await DatabaseService.getAvailableTeachersForSubject(
      subjectId as string,
      dayOfWeek as string,
      timeSlot as string
    );
    res.json({ availableTeachers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get available teachers' });
  }
});

app.post('/api/timetable/generate', async (req, res) => {
  try {
    const { departmentId, semester, academicYear, classCount = 2 } = req.body;
    
    console.log('Auto-generation request:', { departmentId, semester, academicYear, classCount });
    
    // First, ensure teachers have availability data
    await DatabaseService.initializeTeacherAvailability(departmentId);
    
    const timetable = await DatabaseService.generateTimetable(departmentId, semester, academicYear, classCount);
    res.json({ timetable });
  } catch (error) {
    console.error('Auto-generation error:', error);
    res.status(500).json({ error: 'Failed to generate timetable: ' + error.message });
  }
});

// API endpoint to update teacher availability
app.put('/api/teachers/:teacherId/availability', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { availability } = req.body;
    await DatabaseService.updateTeacherAvailability(teacherId, availability);
    res.json({ message: 'Teacher availability updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher availability' });
  }
});

// API Routes for Fees - REMOVED DUPLICATE

app.get('/api/fees/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const fees = await DatabaseService.getFeesByStudent(studentId);
    res.json({ fees });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student fees' });
  }
});

// API Routes for Fee Structure and Payment Plans
app.get('/api/fees/payment-plans', async (req, res) => {
  try {
    const paymentPlans = await DatabaseService.getPaymentPlans();
    res.json({ paymentPlans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment plans' });
  }
});

app.get('/api/fees/structure/:departmentId?', async (req, res) => {
  try {
    const departmentId = req.params.departmentId || 'ALL';
    const feeStructure = await DatabaseService.getFeeStructure(departmentId);
    res.json({ feeStructure });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fee structure' });
  }
});

app.post('/api/fees/calculate', async (req, res) => {
  try {
    const { paymentPlanId, departmentId = 'ALL' } = req.body;
    const amount = await DatabaseService.calculateFeeAmount(paymentPlanId, departmentId);
    res.json({ amount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate fee amount' });
  }
});

app.get('/api/fees/statistics', async (req, res) => {
  try {
    const statistics = await DatabaseService.getFeeStatistics();
    res.json({ statistics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fee statistics' });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const department = await DatabaseService.createDepartment(req.body);
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const department = await DatabaseService.updateDepartment(id, req.body);
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await DatabaseService.deleteDepartment(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

// Comprehensive Fees Management API
app.get('/api/fees', async (req, res) => {
  try {
    const { departmentId, status, academicYear } = req.query;
    let fees;
    
    if (departmentId) {
      fees = await DatabaseService.getFeesByDepartment(departmentId as string);
    } else if (status) {
      fees = await DatabaseService.getFeesByStatus(status as string);
    } else if (academicYear) {
      fees = await DatabaseService.getFeesByAcademicYear(academicYear as string);
    } else {
      fees = await DatabaseService.getAllFees();
    }
    
    res.json({ fees });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
});

// Generate default fees for a student based on plan/year
app.post('/api/students/:studentId/fees/generate', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { payment_plan_id, academic_year } = req.body || {};

    if (!payment_plan_id || !academic_year) {
      return res.status(400).json({ error: 'payment_plan_id and academic_year are required' });
    }

    const created = await DatabaseService.createDefaultFees(studentId, {
      payment_plan_id,
      academic_year
    });

    res.status(201).json({ message: 'Fees generated successfully' });
  } catch (error) {
    console.error('Error generating default fees:', error);
    res.status(500).json({ error: 'Failed to generate default fees', details: (error as any).message });
  }
});

app.post('/api/fees', async (req, res) => {
  try {
    const feeData = req.body;
    
    // Validate required fields
    if (!feeData.student_id || !feeData.amount || !feeData.due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate receipt number if not provided
    if (!feeData.receipt_no) {
      feeData.receipt_no = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
    
    // Set default status if not provided
    if (!feeData.status) {
      feeData.status = 'pending';
    }
    
    const newFee = await DatabaseService.createFee(feeData);
    res.status(201).json(newFee);
  } catch (error) {
    console.error('Error creating fee:', error);
    res.status(500).json({ error: 'Failed to create fee' });
  }
});

app.get('/api/fees/:id', async (req, res) => {
  try {
    const feeId = parseInt(req.params.id);
    const fee = await DatabaseService.getFeeById(feeId);
    
    if (!fee) {
      return res.status(404).json({ error: 'Fee not found' });
    }
    
    res.json(fee);
  } catch (error) {
    console.error('Error fetching fee:', error);
    res.status(500).json({ error: 'Failed to fetch fee' });
  }
});

app.put('/api/fees/:id', async (req, res) => {
  try {
    const feeId = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedFee = await DatabaseService.updateFee(feeId, updates);
    
    if (!updatedFee) {
      return res.status(404).json({ error: 'Fee not found' });
    }
    
    res.json(updatedFee);
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({ error: 'Failed to update fee' });
  }
});

app.delete('/api/fees/:id', async (req, res) => {
  try {
    const feeId = parseInt(req.params.id);
    await DatabaseService.deleteFee(feeId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting fee:', error);
    res.status(500).json({ error: 'Failed to delete fee' });
  }
});

app.post('/api/fees/:id/pay', async (req, res) => {
  try {
    const feeId = parseInt(req.params.id);
    const { payment_method, payment_notes } = req.body;
    
    const updatedFee = await DatabaseService.markFeeAsPaid(feeId, {
      payment_method,
      payment_notes,
      paid_date: new Date().toISOString().split('T')[0]
    });
    
    if (!updatedFee) {
      return res.status(404).json({ error: 'Fee not found' });
    }
    
    res.json(updatedFee);
  } catch (error) {
    console.error('Error marking fee as paid:', error);
    res.status(500).json({ error: 'Failed to mark fee as paid' });
  }
});

app.post('/api/fees/bulk', async (req, res) => {
  try {
    const { departmentId, paymentPlan, academicYear, amount, dueDate } = req.body;
    
    if (!departmentId || !paymentPlan || !academicYear || !amount || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields for bulk fee creation' });
    }
    
    const students = await DatabaseService.getStudentsByDepartment(departmentId);
    const createdFees: any[] = [];
    
    for (const student of students) {
      const feeData = {
        student_id: student.id,
        payment_plan_id: paymentPlan,
        academic_year: academicYear,
        amount: parseFloat(amount),
        due_date: dueDate,
        status: 'pending',
        receipt_no: `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      };
      
      const newFee = await DatabaseService.createFee(feeData);
      createdFees.push(newFee);
    }
    
    res.status(201).json({ fees: createdFees, count: createdFees.length });
  } catch (error) {
    console.error('Error creating bulk fees:', error);
    res.status(500).json({ error: 'Failed to create bulk fees' });
  }
});

// ===== QR CODE API ENDPOINTS =====

// Log QR code generation
app.post('/api/qr-codes/log', async (req, res) => {
  try {
    const { qr_type, qr_data, generated_by, generated_for, expires_at, ip_address, user_agent } = req.body;
    
    if (!qr_type || !qr_data) {
      return res.status(400).json({ error: 'QR type and data are required' });
    }
    
    const qrLog = await DatabaseService.generateQRCode({
      qr_type,
      qr_data,
      generated_by,
      generated_for,
      expires_at,
      status: 'active',
      ip_address,
      user_agent
    });
    
    res.status(201).json(qrLog);
  } catch (error) {
    console.error('Error logging QR code generation:', error);
    res.status(500).json({ error: 'Failed to log QR code generation' });
  }
});

// Log QR code scan
app.post('/api/qr-codes/:id/scan', async (req, res) => {
  try {
    const qrId = req.params.id;
    const { scanned_by, ip_address, user_agent } = req.body;
    
    const qrLog = await DatabaseService.scanQRCode(qrId, {
      scanned_by,
      ip_address,
      user_agent
    });
    
    res.json(qrLog);
  } catch (error) {
    console.error('Error logging QR code scan:', error);
    res.status(500).json({ error: 'Failed to log QR code scan' });
  }
});

// Get QR code analytics
app.get('/api/qr-codes/analytics', async (req, res) => {
  try {
    const { qr_type, date_from, date_to, status } = req.query;
    
    const analytics = await DatabaseService.getQRCodeAnalytics({
      qr_type: qr_type as string,
      date_from: date_from as string,
      date_to: date_to as string,
      status: status as string
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching QR analytics:', error);
    res.status(500).json({ error: 'Failed to fetch QR analytics' });
  }
});

// Create attendance session
app.post('/api/attendance/sessions', async (req, res) => {
  try {
    const { class_id, subject, teacher_id, teacher_name, location, start_time, end_time, qr_code_id } = req.body;
    
    if (!class_id || !subject || !teacher_id || !teacher_name) {
      return res.status(400).json({ error: 'Missing required fields for attendance session' });
    }
    
    const session = await DatabaseService.createAttendanceSession({
      class_id,
      subject,
      teacher_id,
      teacher_name,
      location: location || 'قاعة المحاضرات',
      start_time: start_time || new Date().toISOString(),
      end_time: end_time || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours default
      qr_code_id,
      total_students: 0,
      present_students: 0,
      status: 'active'
    });
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating attendance session:', error);
    res.status(500).json({ error: 'Failed to create attendance session' });
  }
});

// Record student attendance
app.post('/api/attendance/record', async (req, res) => {
  try {
    const { session_id, student_id, student_name, qr_code_id, ip_address, device_info } = req.body;
    
    if (!session_id || !student_id || !student_name) {
      return res.status(400).json({ error: 'Missing required fields for attendance record' });
    }
    
    const attendance = await DatabaseService.recordStudentAttendance({
      session_id,
      student_id,
      student_name,
      scan_time: new Date().toISOString(),
      qr_code_id,
      ip_address,
      device_info,
      status: 'present'
    });
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error recording student attendance:', error);
    res.status(500).json({ error: 'Failed to record student attendance' });
  }
});

// Get attendance analytics
app.get('/api/attendance/analytics', async (req, res) => {
  try {
    const { session_id, teacher_id, date_from, date_to } = req.query;
    
    const analytics = await DatabaseService.getAttendanceAnalytics({
      session_id: session_id as string,
      teacher_id: teacher_id as string,
      date_from: date_from as string,
      date_to: date_to as string
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching attendance analytics:', error);
    res.status(500).json({ error: 'Failed to fetch attendance analytics' });
  }
});

// ===== QR CODE ENDPOINTS =====

// Generate QR code
app.post('/api/qr-codes/generate', async (req, res) => {
  try {
    const { qr_type, qr_data, generated_by, generated_for, expires_at } = req.body;
    
    if (!qr_type || !qr_data) {
      return res.status(400).json({ error: 'QR type and data are required' });
    }

    const qrCode = await DatabaseService.generateQRCode({
      qr_type,
      qr_data,
      generated_by,
      generated_for,
      expires_at,
      status: 'active'
    });

    res.status(201).json(qrCode);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get QR code by ID
app.get('/api/qr-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await DatabaseService.getQRCodeById(id);
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    res.json(qrCode);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// Scan QR code
app.post('/api/qr-codes/:id/scan', async (req, res) => {
  try {
    const { id } = req.params;
    const { scanned_by, ip_address, user_agent } = req.body;
    
    const qrCode = await DatabaseService.scanQRCode(id, {
      scanned_by,
      ip_address,
      user_agent
    });
    
    res.json(qrCode);
  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).json({ error: 'Failed to scan QR code' });
  }
});

// Get QR code analytics
app.get('/api/qr-codes/analytics', async (req, res) => {
  try {
    const { qr_type, date_from, date_to, status } = req.query;
    
    const analytics = await DatabaseService.getQRCodeAnalytics({
      qr_type: qr_type as string,
      date_from: date_from as string,
      date_to: date_to as string,
      status: status as string
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching QR analytics:', error);
    res.status(500).json({ error: 'Failed to fetch QR analytics' });
  }
});

// Generate attendance QR code
app.post('/api/qr-codes/attendance/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { teacherId } = req.body;
    
    if (!teacherId) {
      return res.status(400).json({ error: 'Teacher ID is required' });
    }

    const qrCode = await DatabaseService.generateAttendanceQRCode(sessionId, teacherId);
    res.status(201).json(qrCode);
  } catch (error) {
    console.error('Error generating attendance QR code:', error);
    res.status(500).json({ error: 'Failed to generate attendance QR code' });
  }
});

// Generate student QR code
app.post('/api/qr-codes/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const qrCode = await DatabaseService.generateStudentQRCode(studentId);
    res.status(201).json(qrCode);
  } catch (error) {
    console.error('Error generating student QR code:', error);
    res.status(500).json({ error: 'Failed to generate student QR code' });
  }
});

// Generate fee QR code
app.post('/api/qr-codes/fee/:feeId', async (req, res) => {
  try {
    const { feeId } = req.params;
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const qrCode = await DatabaseService.generateFeeQRCode(parseInt(feeId), studentId);
    res.status(201).json(qrCode);
  } catch (error) {
    console.error('Error generating fee QR code:', error);
    res.status(500).json({ error: 'Failed to generate fee QR code' });
  }
});

// Process attendance QR scan
app.post('/api/qr-codes/attendance/:qrCodeId/scan', async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const { studentId, ip_address, user_agent } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const attendance = await DatabaseService.processAttendanceQRScan(qrCodeId, studentId, {
      ip_address,
      user_agent
    });
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error processing attendance QR scan:', error);
    res.status(500).json({ error: 'Failed to process attendance QR scan' });
  }
});

// Get all attendance sessions
app.get('/api/attendance-sessions', async (req, res) => {
  try {
    const sessions = await DatabaseService.getAllAttendanceSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching attendance sessions:', error);
    res.status(500).json({ error: 'Failed to fetch attendance sessions' });
  }
});

// Get attendance session by ID
app.get('/api/attendance-sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await DatabaseService.getAttendanceSessionById(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Attendance session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching attendance session:', error);
    res.status(500).json({ error: 'Failed to fetch attendance session' });
  }
});

// Create attendance session
app.post('/api/attendance-sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    const session = await DatabaseService.createAttendanceSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating attendance session:', error);
    res.status(500).json({ error: 'Failed to create attendance session' });
  }
});

// Update attendance session
app.put('/api/attendance-sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const session = await DatabaseService.updateAttendanceSession(id, updates);
    res.json(session);
  } catch (error) {
    console.error('Error updating attendance session:', error);
    res.status(500).json({ error: 'Failed to update attendance session' });
  }
});

// Get student attendance by session
app.get('/api/attendance-sessions/:sessionId/students', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const attendance = await DatabaseService.getStudentAttendanceBySession(sessionId);
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ error: 'Failed to fetch student attendance' });
  }
});

// Get student attendance by student
app.get('/api/students/:studentId/attendance', async (req, res) => {
  try {
    const { studentId } = req.params;
    const attendance = await DatabaseService.getStudentAttendanceByStudent(studentId);
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ error: 'Failed to fetch student attendance' });
  }
});

// Verify QR code
app.post('/api/qr-codes/verify', async (req, res) => {
  try {
    const { qr_data, ip_address, user_agent } = req.body;
    
    if (!qr_data) {
      return res.status(400).json({ error: 'QR data is required' });
    }
    
    // Parse QR data
    let parsedData;
    try {
      parsedData = JSON.parse(qr_data);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid QR data format' });
    }
    
    // Verify based on QR type
    let verificationResult: { valid: boolean; message: string; data?: any } = { valid: false, message: 'Unknown QR type' };
    
    switch (parsedData.type) {
      case 'student':
        const student = await DatabaseService.getStudentById(parsedData.id);
        if (student) {
          verificationResult = {
            valid: true,
            message: 'Student verified successfully',
            data: {
              student_id: student.id,
              student_name: student.name,
              department: student.department_id,
              year: student.year,
              status: student.status
            }
          };
        } else {
          verificationResult = { valid: false, message: 'Student not found' };
        }
        break;
        
      case 'fee':
        const fee = await DatabaseService.getFeeById(parsedData.feeId);
        if (fee) {
          verificationResult = {
            valid: true,
            message: 'Fee receipt verified successfully',
            data: {
              fee_id: fee.id,
              receipt_no: fee.receipt_no,
              amount: fee.amount,
              status: fee.status,
              student_id: fee.student_id
            }
          };
        } else {
          verificationResult = { valid: false, message: 'Fee receipt not found' };
        }
        break;
        
      case 'attendance':
        // Check if attendance session is still active
        const now = new Date();
        const expirationTime = new Date(parsedData.expiresAt);
        
        if (now > expirationTime) {
          verificationResult = { valid: false, message: 'Attendance QR code has expired' };
        } else {
          verificationResult = {
            valid: true,
            message: 'Attendance QR code is valid',
            data: {
              class_id: parsedData.classId,
              subject: parsedData.subject,
              teacher: parsedData.teacher,
              expires_at: parsedData.expiresAt
            }
          };
        }
        break;
        
      default:
        verificationResult = { valid: false, message: 'Unsupported QR type' };
    }
    
    // Log verification attempt
    await DatabaseService.generateQRCode({
      qr_type: 'verification',
      qr_data: parsedData,
      generated_by: 'system',
      generated_for: parsedData.id || parsedData.feeId || parsedData.classId,
      status: verificationResult.valid ? 'scanned' : 'invalid',
      ip_address,
      user_agent
    });
    
    res.json(verificationResult);
  } catch (error) {
    console.error('Error verifying QR code:', error);
    res.status(500).json({ error: 'Failed to verify QR code' });
  }
});

// ===== ACCOUNTING API ENDPOINTS ===== (TEMPORARILY DISABLED)
/*

// Chart of Accounts endpoints
app.get('/api/accounting/accounts', async (req, res) => {
  try {
    const accounts = await AccountingService.getAllAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.get('/api/accounting/accounts/:id', async (req, res) => {
  try {
    const account = await AccountingService.getAccountById(parseInt(req.params.id));
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

app.get('/api/accounting/accounts/type/:type', async (req, res) => {
  try {
    const accounts = await AccountingService.getAccountsByType(req.params.type);
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts by type:', error);
    res.status(500).json({ error: 'Failed to fetch accounts by type' });
  }
});

app.post('/api/accounting/accounts', async (req, res) => {
  try {
    const account = await AccountingService.createAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
});

app.put('/api/accounting/accounts/:id', async (req, res) => {
  try {
    const account = await AccountingService.updateAccount(parseInt(req.params.id), req.body);
    res.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

app.delete('/api/accounting/accounts/:id', async (req, res) => {
  try {
    await AccountingService.deleteAccount(parseInt(req.params.id));
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
});

// Journal Entries endpoints
app.get('/api/accounting/journal-entries', async (req, res) => {
  try {
    const entries = await AccountingService.getAllJournalEntries();
    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

app.get('/api/accounting/journal-entries/:id', async (req, res) => {
  try {
    const entry = await AccountingService.getJournalEntryById(parseInt(req.params.id));
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

app.post('/api/accounting/journal-entries', async (req, res) => {
  try {
    const entry = await AccountingService.createJournalEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: error.message || 'Failed to create journal entry' });
  }
});

app.put('/api/accounting/journal-entries/:id', async (req, res) => {
  try {
    const entry = await AccountingService.updateJournalEntry(parseInt(req.params.id), req.body);
    res.json(entry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: error.message || 'Failed to update journal entry' });
  }
});

app.post('/api/accounting/journal-entries/:id/post', async (req, res) => {
  try {
    const { posted_by } = req.body;
    if (!posted_by) {
      return res.status(400).json({ error: 'posted_by is required' });
    }
    const entry = await AccountingService.postJournalEntry(parseInt(req.params.id), posted_by);
    res.json(entry);
  } catch (error) {
    console.error('Error posting journal entry:', error);
    res.status(500).json({ error: error.message || 'Failed to post journal entry' });
  }
});

app.post('/api/accounting/journal-entries/:id/reverse', async (req, res) => {
  try {
    const { reversed_by, reason } = req.body;
    if (!reversed_by || !reason) {
      return res.status(400).json({ error: 'reversed_by and reason are required' });
    }
    const entry = await AccountingService.reverseJournalEntry(parseInt(req.params.id), reversed_by, reason);
    res.json(entry);
  } catch (error) {
    console.error('Error reversing journal entry:', error);
    res.status(500).json({ error: error.message || 'Failed to reverse journal entry' });
  }
});

// General Ledger endpoints
app.get('/api/accounting/ledger', async (req, res) => {
  try {
    const filters = {
      account_id: req.query.account_id ? parseInt(req.query.account_id as string) : undefined,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
      fiscal_year: req.query.fiscal_year ? parseInt(req.query.fiscal_year as string) : undefined,
      fiscal_period: req.query.fiscal_period ? parseInt(req.query.fiscal_period as string) : undefined
    };
    const ledger = await AccountingService.getGeneralLedger(filters);
    res.json(ledger);
  } catch (error) {
    console.error('Error fetching general ledger:', error);
    res.status(500).json({ error: 'Failed to fetch general ledger' });
  }
});

app.get('/api/accounting/general-ledger', async (req, res) => {
  try {
    const filters = {
      account_id: req.query.account_id ? parseInt(req.query.account_id as string) : undefined,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
      fiscal_year: req.query.fiscal_year ? parseInt(req.query.fiscal_year as string) : undefined,
      fiscal_period: req.query.fiscal_period ? parseInt(req.query.fiscal_period as string) : undefined
    };
    const ledger = await AccountingService.getGeneralLedger(filters);
    res.json(ledger);
  } catch (error) {
    console.error('Error fetching general ledger:', error);
    res.status(500).json({ error: 'Failed to fetch general ledger' });
  }
});

app.get('/api/accounting/accounts/:id/ledger', async (req, res) => {
  try {
    const accountId = parseInt(req.params.id);
    const dateFrom = req.query.date_from as string;
    const dateTo = req.query.date_to as string;
    const ledger = await AccountingService.getAccountLedger(accountId, dateFrom, dateTo);
    res.json(ledger);
  } catch (error) {
    console.error('Error fetching account ledger:', error);
    res.status(500).json({ error: 'Failed to fetch account ledger' });
  }
});

// Reports endpoints
app.get('/api/accounting/reports/trial-balance', async (req, res) => {
  try {
    const fiscalYear = req.query.fiscal_year ? parseInt(req.query.fiscal_year as string) : undefined;
    const fiscalPeriod = req.query.fiscal_period ? parseInt(req.query.fiscal_period as string) : undefined;
    const trialBalance = await AccountingService.getTrialBalance(fiscalYear, fiscalPeriod);
    res.json(trialBalance);
  } catch (error) {
    console.error('Error fetching trial balance:', error);
    res.status(500).json({ error: 'Failed to fetch trial balance' });
  }
});

app.get('/api/accounting/reports/balance-sheet', async (req, res) => {
  try {
    const asOfDate = req.query.as_of_date as string;
    const balanceSheet = await AccountingService.getBalanceSheet(asOfDate);
    res.json(balanceSheet);
  } catch (error) {
    console.error('Error fetching balance sheet:', error);
    res.status(500).json({ error: 'Failed to fetch balance sheet' });
  }
});

app.get('/api/accounting/reports/income-statement', async (req, res) => {
  try {
    const dateFrom = req.query.date_from as string;
    const dateTo = req.query.date_to as string;
    
    if (!dateFrom || !dateTo) {
      return res.status(400).json({ error: 'date_from and date_to are required' });
    }
    
    const incomeStatement = await AccountingService.getIncomeStatement(dateFrom, dateTo);
    res.json(incomeStatement);
  } catch (error) {
    console.error('Error fetching income statement:', error);
    res.status(500).json({ error: 'Failed to fetch income statement' });
  }
});

// Fiscal Periods endpoints
app.get('/api/accounting/fiscal-periods', async (req, res) => {
  try {
    const fiscalYear = req.query.fiscal_year ? parseInt(req.query.fiscal_year as string) : undefined;
    const periods = await AccountingService.getFiscalPeriods(fiscalYear);
    res.json(periods);
  } catch (error) {
    console.error('Error fetching fiscal periods:', error);
    res.status(500).json({ error: 'Failed to fetch fiscal periods' });
  }
});

app.get('/api/accounting/fiscal-periods/current', async (req, res) => {
  try {
    const currentPeriod = await AccountingService.getCurrentFiscalPeriod();
    res.json(currentPeriod);
  } catch (error) {
    console.error('Error fetching current fiscal period:', error);
    res.status(500).json({ error: 'Failed to fetch current fiscal period' });
  }
});
*/

// Serve accounting dashboard (DISABLED - file removed)
// app.get('/accounting.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'accounting.html'));
// });

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🗄️  Database connected to Supabase`);
});
