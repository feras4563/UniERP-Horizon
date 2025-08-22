import { supabase } from './supabase';
import type { Database } from './supabase';
// import { FeeStructureService, PAYMENT_PLANS, DEFAULT_FEE_STRUCTURE } from './fee-structure.js'; // Removed - will be reimplemented

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];

type Teacher = Database['public']['Tables']['teachers']['Row'];
type TeacherInsert = Database['public']['Tables']['teachers']['Insert'];
type TeacherUpdate = Database['public']['Tables']['teachers']['Update'];

type Department = Database['public']['Tables']['departments']['Row'];
type DepartmentInsert = Database['public']['Tables']['departments']['Insert'];
type DepartmentUpdate = Database['public']['Tables']['departments']['Update'];

type Subject = Database['public']['Tables']['subjects']['Row'];
type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];
type SubjectUpdate = Database['public']['Tables']['subjects']['Update'];

type TeacherSubject = Database['public']['Tables']['teacher_subjects']['Row'];
type TeacherSubjectInsert = Database['public']['Tables']['teacher_subjects']['Insert'];
type TeacherSubjectUpdate = Database['public']['Tables']['teacher_subjects']['Update'];

type Timetable = Database['public']['Tables']['timetable']['Row'];
type TimetableInsert = Database['public']['Tables']['timetable']['Insert'];
type TimetableUpdate = Database['public']['Tables']['timetable']['Update'];

type SchedulingConstraint = Database['public']['Tables']['scheduling_constraints']['Row'];
type SchedulingConstraintInsert = Database['public']['Tables']['scheduling_constraints']['Insert'];
type SchedulingConstraintUpdate = Database['public']['Tables']['scheduling_constraints']['Update'];

type Fee = Database['public']['Tables']['fees']['Row'];
type FeeInsert = Database['public']['Tables']['fees']['Insert'];
type FeeUpdate = Database['public']['Tables']['fees']['Update'];

// QR Code Types
type QRCode = Database['public']['Tables']['qr_codes']['Row'];
type QRCodeInsert = Database['public']['Tables']['qr_codes']['Insert'];
type QRCodeUpdate = Database['public']['Tables']['qr_codes']['Update'];

type AttendanceSession = Database['public']['Tables']['attendance_sessions']['Row'];
type AttendanceSessionInsert = Database['public']['Tables']['attendance_sessions']['Insert'];
type AttendanceSessionUpdate = Database['public']['Tables']['attendance_sessions']['Update'];

type StudentAttendance = Database['public']['Tables']['student_attendance']['Row'];
type StudentAttendanceInsert = Database['public']['Tables']['student_attendance']['Insert'];
type StudentAttendanceUpdate = Database['public']['Tables']['student_attendance']['Update'];

export class DatabaseService {
  // ===== STUDENT ID GENERATION =====
  
  // Generate a structured student ID
  static async generateStudentId(departmentId: string, enrollmentDate: string): Promise<string> {
    try {
      // Parse enrollment date
      const enrollment = new Date(enrollmentDate);
      const year = enrollment.getFullYear();
      const month = enrollment.getMonth() + 1; // getMonth() returns 0-11
      
      // Get batch number for this department and month
      const batchNumber = await this.getNextBatchNumber(departmentId, year, month);
      
      // Format: H90001 (H = Horizon, 9 = September, 0001 = batch number)
      const studentId = `H${month}${batchNumber.toString().padStart(4, '0')}`;
      
      console.log(`Generated student ID: ${studentId} for department ${departmentId}, year ${year}, month ${month}`);
      
      return studentId;
    } catch (error) {
      console.error('Error generating student ID:', error);
      // Fallback to timestamp-based ID
      return `S${Date.now()}`;
    }
  }
  

  
  // Get next batch number for month (global across all departments)
  private static async getNextBatchNumber(departmentId: string, year: number, month: number): Promise<number> {
    try {
      // Get all students for this enrollment month (across all departments)
      const startDate = new Date(year, month - 1, 1); // First day of month
      const endDate = new Date(year, month, 0); // Last day of month
      
      const { data: students, error } = await supabase
        .from('students')
        .select('id')
        .gte('enrollment_date', startDate.toISOString().split('T')[0])
        .lte('enrollment_date', endDate.toISOString().split('T')[0]);
      
      if (error) {
        console.error('Error getting batch number:', error);
        return 1; // Start with 1 if error
      }
      
      // Count existing students + 1 for new student
      return (students?.length || 0) + 1;
    } catch (error) {
      console.error('Error calculating batch number:', error);
      return 1;
    }
  }
  
  // Parse student ID to extract information
  static parseStudentId(studentId: string): {
    year: number;
    month: string;
    batchNumber: number;
    departmentCode: string;
    isValid: boolean;
  } {
    try {
      // Format: H90001
      if (!studentId || studentId.length < 6 || !studentId.startsWith('H')) {
        return { year: 0, month: '', batchNumber: 0, departmentCode: '', isValid: false };
      }
      
      const month = parseInt(studentId.slice(1, 2)); // H9 -> 9
      const batchNumber = parseInt(studentId.slice(2)); // 0001 -> 1
      
      // Get month name
      const monthNames = [
        '', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      
      return {
        year: 0, // Year not encoded in new format
        month: monthNames[month] || month.toString(),
        batchNumber,
        departmentCode: '', // Not encoded in current format
        isValid: true
      };
    } catch (error) {
      return { year: 0, month: '', batchNumber: 0, departmentCode: '', isValid: false };
    }
  }
  
  // Search students by ID pattern
  static async searchStudentsByIdPattern(pattern: string): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .ilike('id', `%${pattern}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error searching students by ID pattern:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in searchStudentsByIdPattern:', error);
      throw error;
    }
  }

  // ===== STUDENTS =====
  
  // Get all students
  static async getAllStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    return data || [];
  }

  // Get student by ID
  static async getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching student:', error);
      throw error;
    }

    return data;
  }

  // Create new student (no fees side-effects)
  static async createStudent(student: StudentInsert): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      throw error;
    }
    return data;
  }

  // Create fees for a student
  static async createDefaultFees(studentId: string, feeData?: any): Promise<void> {
    // TEMPORARILY DISABLED - Fee structure service removed
    console.log('Fee creation temporarily disabled - will be reimplemented');
    return;
    
    /* ORIGINAL CODE - TO BE RESTORED
    const paymentPlanId = feeData?.payment_plan_id || 'full_year';
    const academicYear = feeData?.academic_year || '2025-2026';
    
    // Calculate fee amount based on payment plan
    const feeAmount = FeeStructureService.calculateFee(paymentPlanId, DEFAULT_FEE_STRUCTURE.full_year_amount);
    const semester = FeeStructureService.getSemesterName(paymentPlanId);
    const dueDates = FeeStructureService.calculateDueDates(paymentPlanId, academicYear);
    
    // Create fee records based on payment plan
    const feeRecords: FeeInsert[] = [];
    
    if (paymentPlanId === 'installment_4') {
      // Create 4 installment records
      const installments = FeeStructureService.calculateInstallments(paymentPlanId);
      installments.forEach((amount, index) => {
              feeRecords.push({
        student_id: studentId,
        amount: amount,
        due_date: dueDates[index]?.toISOString().split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        paid_date: null,
        semester: index < 2 ? 'الأول' : 'الثاني',
        type: `قسط ${index + 1}`,
        receipt_no: null
      });
      });
    } else {
      // Create single fee record
      feeRecords.push({
        student_id: studentId,
        amount: feeAmount,
        due_date: dueDates[0]?.toISOString().split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        paid_date: null,
        semester: semester,
        type: 'رسوم دراسية',
        receipt_no: null
      });
    }

    const { error } = await supabase
      .from('fees')
      .insert(feeRecords);

    if (error) {
      console.error('Error creating fees:', error);
      throw error;
    }
    */
  }

  // Get all fees - REMOVED DUPLICATE

  // Get fees by student ID
  static async getFeesByStudent(studentId: string): Promise<Fee[]> {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student fees:', error);
      throw error;
    }

    return data || [];
  }

  // Get student schedule
  static async getStudentSchedule(studentId: string): Promise<any[]> {
    try {
      // Get student's department and year
      const student = await this.getStudentById(studentId);
      if (!student || !student.department_id) {
        return [];
      }

      // Get timetable entries for the student's department and year
      const { data, error } = await supabase
        .from('timetable')
        .select(`
          *,
          subjects (
            name,
            name_en,
            code
          ),
          teachers (
            name,
            name_en
          )
        `)
        .eq('department_id', student.department_id)
        .eq('year', student.year || 1);

      if (error) {
        console.error('Error fetching student schedule:', error);
        throw error;
      }

      // Transform the data to include subject and teacher names
      return (data || []).map(item => ({
        id: item.id,
        subject_name: item.subjects?.name || item.subject_name,
        subject_code: item.subjects?.code,
        teacher_name: item.teachers?.name || item.teacher_name,
        day: item.day,
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location,
        room: item.room
      }));
    } catch (error) {
      console.error('Error in getStudentSchedule:', error);
      return [];
    }
  }

  // Get payment plans
  static async getPaymentPlans(): Promise<any[]> {
    // TEMPORARILY DISABLED - will be reimplemented
    return [
      { id: 'full_year', name: 'دفع سنوي كامل', name_en: 'Full Year Payment' },
      { id: 'semester', name: 'دفع فصلي', name_en: 'Semester Payment' },
      { id: 'installment_4', name: '4 أقساط', name_en: '4 Installments' }
    ];
  }

  // Get fee structure for department
  static async getFeeStructure(departmentId: string = 'ALL'): Promise<any> {
    // TEMPORARILY DISABLED - will be reimplemented
    return {
      full_year_amount: 3000,
      semester_amount: 1600,
      installment_amount: 800,
      currency: 'LYD'
    };
  }

  // Calculate fee amount for payment plan
  static async calculateFeeAmount(paymentPlanId: string, departmentId: string = 'ALL'): Promise<number> {
    // TEMPORARILY DISABLED - will be reimplemented with simple calculation
    const baseAmount = 3000; // Default full year amount
    switch (paymentPlanId) {
      case 'full_year': return baseAmount;
      case 'semester': return Math.floor(baseAmount * 0.55); // 1650
      case 'installment_4': return Math.floor(baseAmount * 0.27); // 810 per installment
      default: return baseAmount;
    }
  }

  // Get fee statistics
  static async getFeeStatistics(): Promise<any> {
    const { data: fees, error } = await supabase
      .from('fees')
      .select('*');

    if (error) {
      console.error('Error fetching fee statistics:', error);
      throw error;
    }

    const totalFees = fees?.length || 0;
    const totalAmount = fees?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
    const paidAmount = fees?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
    const pendingAmount = totalAmount - paidAmount;

    return {
      totalFees,
      totalAmount,
      paidAmount,
      pendingAmount,
      paymentRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    };
  }

  // ===== QR CODE FUNCTIONALITY =====
  
  // Generate QR code
  static async generateQRCode(qrData: QRCodeInsert): Promise<QRCode> {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        ...qrData,
        id: `QR${Date.now()}`,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
    return data;
  }

  // Get QR code by ID
  static async getQRCodeById(id: string): Promise<QRCode | null> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching QR code:', error);
      throw error;
    }
    return data;
  }

  // Update QR code
  static async updateQRCode(id: string, updates: QRCodeUpdate): Promise<QRCode> {
    const { data, error } = await supabase
      .from('qr_codes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating QR code:', error);
      throw error;
    }
    return data;
  }

  // Scan QR code
  static async scanQRCode(qrId: string, scanData: {
    scanned_by?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<QRCode> {
    const { data, error } = await supabase
      .from('qr_codes')
      .update({
        scanned_by: scanData.scanned_by,
        scanned_at: new Date().toISOString(),
        status: 'scanned',
        ip_address: scanData.ip_address,
        user_agent: scanData.user_agent,
        updated_at: new Date().toISOString()
      })
      .eq('id', qrId)
      .select()
      .single();

    if (error) {
      console.error('Error scanning QR code:', error);
      throw error;
    }
    return data;
  }

  // Get QR code analytics
  static async getQRCodeAnalytics(filters?: {
    qr_type?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
  }): Promise<{
    total_generated: number;
    total_scanned: number;
    scan_rate: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    recent_activity: QRCode[];
  }> {
    let query = supabase
      .from('qr_codes')
      .select('*');

    if (filters?.qr_type) {
      query = query.eq('qr_type', filters.qr_type);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QR analytics:', error);
      throw error;
    }

    const logs = data || [];
    const total_generated = logs.length;
    const total_scanned = logs.filter(log => log.status === 'scanned').length;
    const scan_rate = total_generated > 0 ? (total_scanned / total_generated) * 100 : 0;

    const by_type = logs.reduce((acc, log) => {
      acc[log.qr_type] = (acc[log.qr_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const by_status = logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_generated,
      total_scanned,
      scan_rate,
      by_type,
      by_status,
      recent_activity: logs.slice(0, 10)
    };
  }

  // Create attendance session
  static async createAttendanceSession(session: AttendanceSessionInsert): Promise<AttendanceSession> {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert({
        ...session,
        id: `AS${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating attendance session:', error);
      throw error;
    }
    return data;
  }

  // Get attendance session by ID
  static async getAttendanceSessionById(id: string): Promise<AttendanceSession | null> {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching attendance session:', error);
      throw error;
    }
    return data;
  }

  // Update attendance session
  static async updateAttendanceSession(id: string, updates: AttendanceSessionUpdate): Promise<AttendanceSession> {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendance session:', error);
      throw error;
    }
    return data;
  }

  // Get all attendance sessions
  static async getAllAttendanceSessions(): Promise<AttendanceSession[]> {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attendance sessions:', error);
      throw error;
    }
    return data || [];
  }

  // Record student attendance
  static async recordStudentAttendance(attendance: StudentAttendanceInsert): Promise<StudentAttendance> {
    const { data, error } = await supabase
      .from('student_attendance')
      .insert({
        ...attendance,
        id: `SA${Date.now()}`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording student attendance:', error);
      throw error;
    }
    return data;
  }

  // Get student attendance by session
  static async getStudentAttendanceBySession(sessionId: string): Promise<StudentAttendance[]> {
    const { data, error } = await supabase
      .from('student_attendance')
      .select('*')
      .eq('session_id', sessionId)
      .order('scan_time', { ascending: false });

    if (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
    return data || [];
  }

  // Get student attendance by student
  static async getStudentAttendanceByStudent(studentId: string): Promise<StudentAttendance[]> {
    const { data, error } = await supabase
      .from('student_attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('scan_time', { ascending: false });

    if (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
    return data || [];
  }

  // Update student attendance
  static async updateStudentAttendance(id: string, updates: StudentAttendanceUpdate): Promise<StudentAttendance> {
    const { data, error } = await supabase
      .from('student_attendance')
      .update({
        ...updates,
        created_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student attendance:', error);
      throw error;
    }
    return data;
  }

  // Generate QR code for attendance session
  static async generateAttendanceQRCode(sessionId: string, teacherId: string): Promise<QRCode> {
    const session = await this.getAttendanceSessionById(sessionId);
    if (!session) {
      throw new Error('Attendance session not found');
    }

    const qrData: QRCodeInsert = {
      qr_type: 'attendance',
      qr_data: {
        session_id: sessionId,
        teacher_id: teacherId,
        subject: session.subject,
        location: session.location,
        start_time: session.start_time,
        end_time: session.end_time
      },
      generated_by: teacherId,
      generated_for: sessionId,
      expires_at: session.end_time,
      status: 'active'
    };

    return await this.generateQRCode(qrData);
  }

  // Generate QR code for student verification
  static async generateStudentQRCode(studentId: string): Promise<QRCode> {
    const student = await this.getStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const qrData: QRCodeInsert = {
      qr_type: 'student',
      qr_data: {
        student_id: studentId,
        name: student.name,
        department_id: student.department_id,
        year: student.year
      },
      generated_for: studentId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'active'
    };

    return await this.generateQRCode(qrData);
  }

  // Generate QR code for fee payment
  static async generateFeeQRCode(feeId: number, studentId: string): Promise<QRCode> {
    const fee = await this.getFeeById(feeId);
    if (!fee) {
      throw new Error('Fee not found');
    }

    const qrData: QRCodeInsert = {
      qr_type: 'fee',
      qr_data: {
        fee_id: feeId,
        student_id: studentId,
        amount: fee.amount,
        due_date: fee.due_date
      },
      generated_for: studentId,
      expires_at: fee.due_date,
      status: 'active'
    };

    return await this.generateQRCode(qrData);
  }

  // Process QR code scan for attendance
  static async processAttendanceQRScan(qrCodeId: string, studentId: string, scanData: {
    ip_address?: string;
    user_agent?: string;
  }): Promise<StudentAttendance> {
    // Get QR code
    const qrCode = await this.getQRCodeById(qrCodeId);
    if (!qrCode || qrCode.status !== 'active') {
      throw new Error('Invalid or expired QR code');
    }

    if (qrCode.qr_type !== 'attendance') {
      throw new Error('QR code is not for attendance');
    }

    // Get student
    const student = await this.getStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Get session
    const sessionId = qrCode.qr_data.session_id;
    const session = await this.getAttendanceSessionById(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error('Attendance session not active');
    }

    // Check if student already attended
    const existingAttendance = await this.getStudentAttendanceBySession(sessionId);
    const alreadyAttended = existingAttendance.some(att => att.student_id === studentId);
    if (alreadyAttended) {
      throw new Error('Student already marked attendance for this session');
    }

    // Determine status (present/late)
    const now = new Date();
    const startTime = new Date(session.start_time);
    const status = now > startTime ? 'late' : 'present';

    // Record attendance
    const attendance: StudentAttendanceInsert = {
      session_id: sessionId,
      student_id: studentId,
      student_name: student.name,
      scan_time: now.toISOString(),
      qr_code_id: qrCodeId,
      ip_address: scanData.ip_address,
      device_info: scanData.user_agent,
      status
    };

    const recordedAttendance = await this.recordStudentAttendance(attendance);

    // Update session present count
    await this.updateAttendanceSession(sessionId, {
      present_students: session.present_students + 1
    });

    // Mark QR code as scanned
    await this.scanQRCode(qrCodeId, {
      scanned_by: studentId,
      ip_address: scanData.ip_address,
      user_agent: scanData.user_agent
    });

    return recordedAttendance;
  }

  // Get attendance analytics
  static async getAttendanceAnalytics(filters?: {
    session_id?: string;
    teacher_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total_sessions: number;
    total_attendance: number;
    average_attendance_rate: number;
    by_subject: Record<string, number>;
    by_teacher: Record<string, number>;
    recent_sessions: AttendanceSession[];
  }> {
    let query = supabase
      .from('attendance_sessions')
      .select('*');

    if (filters?.teacher_id) {
      query = query.eq('teacher_id', filters.teacher_id);
    }
    if (filters?.date_from) {
      query = query.gte('start_time', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('start_time', filters.date_to);
    }

    const { data: sessions, error: sessionsError } = await query.order('start_time', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching attendance sessions:', sessionsError);
      throw sessionsError;
    }

    const sessionsList = sessions || [];
    const total_sessions = sessionsList.length;
    const total_attendance = sessionsList.reduce((sum, session) => sum + session.present_students, 0);
    const average_attendance_rate = total_sessions > 0 ? (total_attendance / total_sessions) : 0;

    const by_subject = sessionsList.reduce((acc, session) => {
      acc[session.subject] = (acc[session.subject] || 0) + session.present_students;
      return acc;
    }, {} as Record<string, number>);

    const by_teacher = sessionsList.reduce((acc, session) => {
      acc[session.teacher_name] = (acc[session.teacher_name] || 0) + session.present_students;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_sessions,
      total_attendance,
      average_attendance_rate,
      by_subject,
      by_teacher,
      recent_sessions: sessionsList.slice(0, 10)
    };
  }

  // ===== COMPREHENSIVE FEES MANAGEMENT =====
  static async getAllFees(): Promise<any[]> {
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        students (
          id,
          name,
          name_en,
          department_id,
          year,
          email,
          phone,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all fees:', error);
      throw error;
    }

    return data || [];
  }

  static async getFeesByDepartment(departmentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        students (
          id,
          name,
          department_id
        )
      `)
      .eq('students.department_id', departmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fees by department:', error);
      throw error;
    }

    return data || [];
  }

  static async getFeesByStatus(status: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        students (
          id,
          name,
          department_id
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fees by status:', error);
      throw error;
    }

    return data || [];
  }

  static async getFeesByAcademicYear(academicYear: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        students (
          id,
          name,
          department_id
        )
      `)
      .eq('academic_year', academicYear)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fees by academic year:', error);
      throw error;
    }

    return data || [];
  }

  static async createFee(feeData: any): Promise<any> {
    const { data, error } = await supabase
      .from('fees')
      .insert([feeData])
      .select()
      .single();

    if (error) {
      console.error('Error creating fee:', error);
      throw error;
    }

    return data;
  }

  static async getFeeById(feeId: number): Promise<any> {
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        students (
          id,
          name,
          department_id
        )
      `)
      .eq('id', feeId)
      .single();

    if (error) {
      console.error('Error fetching fee by ID:', error);
      throw error;
    }

    return data;
  }

  static async updateFee(feeId: number, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('fees')
      .update(updates)
      .eq('id', feeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating fee:', error);
      throw error;
    }

    return data;
  }

  static async deleteFee(feeId: number): Promise<void> {
    const { error } = await supabase
      .from('fees')
      .delete()
      .eq('id', feeId);

    if (error) {
      console.error('Error deleting fee:', error);
      throw error;
    }
  }

  static async markFeeAsPaid(feeId: number, paymentDetails: any): Promise<any> {
    const updates = {
      ...paymentDetails,
      status: 'paid',
      paid_date: paymentDetails.paid_date || new Date().toISOString().split('T')[0]
    };

    return await this.updateFee(feeId, updates);
  }

  // Update student
  static async updateStudent(id: string, updates: StudentUpdate): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }

    return data;
  }

  // Delete student
  static async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Search students by name or ID
  static async searchStudents(query: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .or(`name.ilike.%${query}%,id.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching students:', error);
      throw error;
    }

    return data || [];
  }

  // Get students by department
  static async getStudentsByDepartment(departmentId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('department_id', departmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students by department:', error);
      throw error;
    }

    return data || [];
  }

  // Get total count of students
  static async getStudentCount(): Promise<number> {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting student count:', error);
      throw error;
    }

    return count || 0;
  }

  // ===== TEACHERS =====

  // Get all teachers
  static async getAllTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }

    return data || [];
  }

  // Get teacher by ID
  static async getTeacherById(id: string): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }

    return data;
  }

  // Create new teacher
  static async createTeacher(teacher: TeacherInsert): Promise<Teacher> {
    const { data, error } = await supabase
      .from('teachers')
      .insert(teacher)
      .select()
      .single();

    if (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }

    return data;
  }

  // Update teacher
  static async updateTeacher(id: string, updates: TeacherUpdate): Promise<Teacher> {
    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }

    return data;
  }

  // Delete teacher
  static async deleteTeacher(id: string): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  }

  // ===== DEPARTMENTS =====

  // Get all departments
  static async getAllDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }

    return data || [];
  }

  // Get department by ID
  static async getDepartmentById(id: string): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching department:', error);
      throw error;
    }

    return data;
  }

  // Create new department
  static async createDepartment(department: DepartmentInsert): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      throw error;
    }

    return data;
  }

  // Update department
  static async updateDepartment(id: string, updates: DepartmentUpdate): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating department:', error);
      throw error;
    }

    return data;
  }

  // Delete department
  static async deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  // ===== SUBJECTS =====

  // Get all subjects
  static async getAllSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }

    return data || [];
  }

  // Get subject by ID
  static async getSubjectById(id: string): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }

    return data;
  }

  // Create new subject
  static async createSubject(subject: SubjectInsert): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      throw error;
    }

    return data;
  }

  // Update subject
  static async updateSubject(id: string, updates: SubjectUpdate): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subject:', error);
      throw error;
    }

    return data;
  }

  // Delete subject
  static async deleteSubject(id: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  // Get subjects by department
  static async getSubjectsByDepartment(departmentId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('department_id', departmentId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching department subjects:', error);
      throw error;
    }

    return data || [];
  }

  // ===== TEACHER-SUBJECT RELATIONSHIPS =====

  // Get teacher's subjects
  static async getTeacherSubjects(teacherId: string): Promise<TeacherSubject[]> {
    const { data, error } = await supabase
      .from('teacher_subjects')
      .select(`
        *,
        subjects (
          id,
          code,
          name,
          name_en,
          department_id,
          credits,
          semester
        )
      `)
      .eq('teacher_id', teacherId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching teacher subjects:', error);
      throw error;
    }

    return data || [];
  }

  // Assign subject to teacher
  static async assignSubjectToTeacher(teacherId: string, subjectId: string, proficiencyLevel: string = 'Intermediate', yearsTeaching: number = 0, isPrimary: boolean = false): Promise<TeacherSubject> {
    const { data, error } = await supabase
      .from('teacher_subjects')
      .insert({
        teacher_id: teacherId,
        subject_id: subjectId,
        proficiency_level: proficiencyLevel,
        years_teaching: yearsTeaching,
        is_primary: isPrimary
      })
      .select()
      .single();

    if (error) {
      console.error('Error assigning subject to teacher:', error);
      throw error;
    }

    return data;
  }

  // Remove subject from teacher
  static async removeSubjectFromTeacher(teacherId: string, subjectId: string): Promise<void> {
    const { error } = await supabase
      .from('teacher_subjects')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('subject_id', subjectId);

    if (error) {
      console.error('Error removing subject from teacher:', error);
      throw error;
    }
  }

  // Get teachers by subject
  static async getTeachersBySubject(subjectId: string): Promise<TeacherSubject[]> {
    const { data, error } = await supabase
      .from('teacher_subjects')
      .select(`
        *,
        teachers (
          id,
          name,
          name_en,
          department_id,
          qualification,
          years_experience,
          availability
        )
      `)
      .eq('subject_id', subjectId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching subject teachers:', error);
      throw error;
    }

    return data || [];
  }

  // Update teacher's teaching hours
  static async updateTeacherHours(teacherId: string, hours: number): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .update({ teaching_hours: hours })
      .eq('id', teacherId);

    if (error) {
      console.error('Error updating teacher hours:', error);
      throw error;
    }
  }

  // Get teacher's total teaching hours
  static async getTeacherTotalHours(teacherId: string): Promise<number> {
    const { data, error } = await supabase
      .from('teachers')
      .select('teaching_hours')
      .eq('id', teacherId)
      .single();

    if (error) {
      console.error('Error fetching teacher hours:', error);
      throw error;
    }

    return data?.teaching_hours || 0;
  }

  // Helper function to create sample availability for teachers
  static createSampleAvailability(): any {
    return {
      mon: ['08_00-10_00', '10_00-12_00', '14_00-16_00'],
      tue: ['08_00-10_00', '12_00-14_00', '16_00-18_00'],
      wed: ['10_00-12_00', '14_00-16_00', '16_00-18_00'],
      thu: ['08_00-10_00', '10_00-12_00', '12_00-14_00'],
      fri: ['08_00-10_00', '14_00-16_00', '16_00-18_00']
    };
  }

  // Update teacher availability
  static async updateTeacherAvailability(teacherId: string, availability: any): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .update({ availability })
      .eq('id', teacherId);

    if (error) {
      console.error('Error updating teacher availability:', error);
      throw error;
    }
  }

  // Initialize teacher availability for a department
  static async initializeTeacherAvailability(departmentId: string): Promise<void> {
    try {
      // Get all teachers in the department
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, name, availability')
        .eq('department_id', departmentId);

      if (teachersError) {
        console.error('Error fetching teachers for availability initialization:', teachersError);
        throw teachersError;
      }

      if (!teachers || teachers.length === 0) {
        console.log('No teachers found for department:', departmentId);
        return;
      }

      // Create different availability patterns for variety
      const availabilityPatterns = [
        {
          mon: ['08_10', '10_12', '14_16'],
          tue: ['08_10', '12_14', '16_18'],
          wed: ['10_12', '14_16', '16_18'],
          thu: ['08_10', '10_12', '12_14'],
          fri: ['08_10', '14_16', '16_18']
        },
        {
          mon: ['10_12', '12_14', '16_18'],
          tue: ['08_10', '10_12', '14_16'],
          wed: ['08_10', '12_14', '16_18'],
          thu: ['10_12', '14_16', '16_18'],
          fri: ['08_10', '10_12', '12_14']
        },
        {
          mon: ['08_10', '12_14', '16_18'],
          tue: ['10_12', '14_16', '16_18'],
          wed: ['08_10', '10_12', '14_16'],
          thu: ['08_10', '12_14', '16_18'],
          fri: ['10_12', '14_16', '16_18']
        }
      ];

      // Update teachers who don't have availability
      let initializedCount = 0;
      for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[i];
        if (!teacher.availability) {
          const patternIndex = i % availabilityPatterns.length;
          const availability = availabilityPatterns[patternIndex];
          
          await this.updateTeacherAvailability(teacher.id, availability);
          console.log(`Initialized availability for teacher ${teacher.id} (${teacher.name}) with pattern ${patternIndex + 1}`);
          initializedCount++;
        } else {
          console.log(`Teacher ${teacher.id} (${teacher.name}) already has availability data`);
        }
      }
      
      console.log(`Initialized availability for ${initializedCount} teachers`);
    } catch (error) {
      console.error('Error initializing teacher availability:', error);
      throw error;
    }
  }

  // ===== SCHEDULING & TIMETABLE =====

  // Get all timetable entries
  static async getAllTimetableEntries(): Promise<Timetable[]> {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        subjects (
          id,
          code,
          name,
          name_en,
          credits,
          semester
        ),
        teachers (
          id,
          name,
          name_en,
          department_id
        )
      `)
      .order('day_of_week', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) {
      console.error('Error fetching timetable entries:', error);
      throw error;
    }

    return data || [];
  }

  // Get timetable entry by ID
  static async getTimetableEntryById(id: number): Promise<Timetable | null> {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        subjects (
          id,
          code,
          name,
          name_en,
          credits,
          semester
        ),
        teachers (
          id,
          name,
          name_en,
          department_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching timetable entry:', error);
      throw error;
    }

    return data;
  }

  // Get timetable by department
  static async getTimetableByDepartment(departmentId: string): Promise<Timetable[]> {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        subjects (
          id,
          code,
          name,
          name_en,
          credits,
          semester
        ),
        teachers (
          id,
          name,
          name_en,
          department_id
        )
      `)
      .eq('department_id', departmentId)
      .order('day_of_week', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) {
      console.error('Error fetching department timetable:', error);
      throw error;
    }

    return data || [];
  }

  // Create timetable entry
  static async createTimetableEntry(timetable: TimetableInsert): Promise<Timetable> {
    const { data, error } = await supabase
      .from('timetable')
      .insert(timetable)
      .select()
      .single();

    if (error) {
      console.error('Error creating timetable entry:', error);
      throw error;
    }

    return data;
  }

  // Update timetable entry
  static async updateTimetableEntry(id: number, updates: TimetableUpdate): Promise<Timetable> {
    const { data, error } = await supabase
      .from('timetable')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating timetable entry:', error);
      throw error;
    }

    return data;
  }

  // Delete timetable entry
  static async deleteTimetableEntry(id: number): Promise<void> {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting timetable entry:', error);
      throw error;
    }
  }

  // Check for scheduling conflicts
  static async checkSchedulingConflicts(dayOfWeek: string, timeSlot: string, teacherId?: string, room?: string): Promise<any[]> {
    let query = supabase
      .from('timetable')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('time_slot', timeSlot);

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    if (room) {
      query = query.eq('room', room);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking scheduling conflicts:', error);
      throw error;
    }

    return data || [];
  }

  // Get available teachers for a subject and time slot
  static async getAvailableTeachersForSubject(subjectId: string, dayOfWeek: string, timeSlot: string): Promise<any[]> {
    // Get teachers who can teach this subject
    const { data: teacherSubjects, error: tsError } = await supabase
      .from('teacher_subjects')
      .select(`
        teacher_id,
        proficiency_level,
        is_primary,
        teachers (
          id,
          name,
          name_en,
          department_id,
          availability
        )
      `)
      .eq('subject_id', subjectId);

    if (tsError) {
      console.error('Error fetching teacher subjects:', tsError);
      throw tsError;
    }

    // Filter teachers based on availability
    const availableTeachers = teacherSubjects?.filter((ts: any) => {
      const teacher = ts.teachers;
      if (!teacher?.availability) return false;

      const availability = teacher.availability;
      const dayKey = dayOfWeek.toLowerCase().substring(0, 3); // Convert "Monday" to "mon"
      const timeKey = timeSlot.replace(':', '_'); // Convert "08:00-10:00" to "08_00-10_00"

      return availability[dayKey]?.includes(timeKey);
    }) || [];

    return availableTeachers;
  }

  // Auto-generate timetable using intelligent scheduling
  static async generateTimetable(departmentId: string, semester: string, academicYear: string, classCount: number = 2): Promise<any[]> {
    try {
      console.log(`Starting timetable generation for department: ${departmentId}, semester: ${semester}, year: ${academicYear}`);
      
      // Clear existing timetable entries for this department and semester
      const { error: deleteError } = await supabase
        .from('timetable')
        .delete()
        .eq('department_id', departmentId)
        .eq('semester', semester)
        .eq('academic_year', academicYear);

      if (deleteError) {
        console.error('Error clearing existing timetable entries:', deleteError);
        throw deleteError;
      }

      console.log(`Cleared existing timetable entries for department ${departmentId}, semester ${semester}, year ${academicYear}`);

      // Get all subjects for the department
      const subjects = await this.getSubjectsByDepartment(departmentId);
      
      if (!subjects || subjects.length === 0) {
        console.log('No subjects found for department:', departmentId);
        return [];
      }

      console.log(`Found ${subjects.length} subjects:`, subjects.map(s => s.name));

      // Get all teachers for the department with their availability
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('department_id', departmentId);

      if (teachersError) {
        console.error('Error fetching teachers:', teachersError);
        throw teachersError;
      }

      if (!teachers || teachers.length === 0) {
        console.log('No teachers found for department:', departmentId);
        return [];
      }

      console.log(`Found ${teachers.length} teachers:`, teachers.map(t => t.name));
      console.log('Teacher availability data:', teachers.map(t => ({ id: t.id, name: t.name, availability: t.availability })));

      const timetable = [];
      const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

      console.log(`Generating timetable for ${subjects.length} subjects in department ${departmentId}`);

      // Track assignments per subject and teacher
      const subjectAssignments = new Map<string, number>(); // subject_id -> count
      const teacherAssignments = new Map<string, Map<string, number>>(); // teacher_id -> day -> count

      // Initialize tracking
      subjects.forEach(subject => subjectAssignments.set(subject.id, 0));
      teachers.forEach(teacher => {
        teacherAssignments.set(teacher.id, new Map());
        daysOfWeek.forEach(day => teacherAssignments.get(teacher.id)!.set(day, 0));
      });

      for (const subject of subjects) {
        console.log(`Processing subject: ${subject.name}`);
        
        // Get current assignment count for this subject
        const currentSubjectAssignments = subjectAssignments.get(subject.id) || 0;
        
        // Limit to classCount classes per week per subject
        if (currentSubjectAssignments >= classCount) {
          console.log(`Subject ${subject.name} already has ${currentSubjectAssignments} assignments, skipping`);
          continue;
        }

        // Find teachers who can teach this subject
        let availableTeachers: string[] = [];
        
        // First, try to find teachers specifically assigned to this subject
        const { data: teacherSubjects, error: tsError } = await supabase
          .from('teacher_subjects')
          .select('teacher_id')
          .eq('subject_id', subject.id);

        if (!tsError && teacherSubjects && teacherSubjects.length > 0) {
          availableTeachers = teacherSubjects.map(ts => ts.teacher_id);
        } else {
          // If no specific assignment, use all department teachers
          availableTeachers = teachers.map(t => t.id);
        }

        // Try to assign up to classCount classes for this subject
        const classesToAssign = Math.min(classCount - currentSubjectAssignments, classCount);
        
        for (let classIndex = 0; classIndex < classesToAssign; classIndex++) {
          let slotAssigned = false;
          
          // Try each available teacher
          for (const teacherId of availableTeachers) {
            if (slotAssigned) break;
            
            const teacher = teachers.find(t => t.id === teacherId);
            if (!teacher) continue;

            // Get teacher's availability
            const teacherAvailability = teacher.availability || {};
            
            // Try each day of the week
            for (const day of daysOfWeek) {
              if (slotAssigned) break;
              
              // Check if teacher has too many classes on this day (max 2 per day)
              const teacherDayAssignments = teacherAssignments.get(teacherId)?.get(day) || 0;
              if (teacherDayAssignments >= 2) {
                continue;
              }
              
              // Try each time slot
              for (const timeSlot of timeSlots) {
                if (slotAssigned) break;
                
                // Check teacher availability for this day and time
                const dayKey = day.toLowerCase().substring(0, 3); // "Monday" -> "mon"
                
                // Convert time slot to match the availability format
                // timeSlot: "08:00-10:00" -> timeKey: "08_10"
                const timeParts = timeSlot.split('-');
                const startHour = timeParts[0].split(':')[0]; // "08:00" -> "08"
                const endHour = timeParts[1].split(':')[0];   // "10:00" -> "10"
                const timeKey = `${startHour}_${endHour}`;    // "08_10"
                
                const isTeacherAvailable = teacherAvailability[dayKey]?.includes(timeKey);
                
                console.log(`Checking availability for teacher ${teacher.name} on ${day} (${dayKey}) at ${timeSlot} (${timeKey}):`, {
                  teacherAvailability: teacherAvailability[dayKey],
                  isAvailable: isTeacherAvailable
                });
                
                // Check for conflicts (existing entries for this day/time/department)
                const { data: existingEntries, error: conflictError } = await supabase
                  .from('timetable')
                  .select('id')
                  .eq('day_of_week', day)
                  .eq('time_slot', timeSlot)
                  .eq('department_id', departmentId);

                const hasConflict = conflictError || (existingEntries && existingEntries.length > 0);
                
                // Assign if teacher is available and no conflicts
                // Also allow assignment if no availability data exists (fallback)
                if ((isTeacherAvailable || !teacherAvailability[dayKey]) && !hasConflict) {
                  // Create timetable entry
                  const entry: TimetableInsert = {
                    day_of_week: day,
                    time_slot: timeSlot,
                    subject_id: subject.id,
                    teacher_id: teacherId,
                    department_id: departmentId,
                    semester: semester,
                    academic_year: academicYear,
                    max_students: subject.max_students || 50,
                    current_enrollment: 0,
                    status: 'scheduled'
                  };

                  try {
                    console.log('Attempting to create timetable entry:', entry);
                    const createdEntry: Timetable = await this.createTimetableEntry(entry);
                    (timetable as Timetable[]).push(createdEntry);
                    
                    // Update tracking
                    subjectAssignments.set(subject.id, (subjectAssignments.get(subject.id) || 0) + 1);
                    const teacherDayMap = teacherAssignments.get(teacherId)!;
                    teacherDayMap.set(day, (teacherDayMap.get(day) || 0) + 1);
                    
                    console.log(`✅ Created timetable entry for ${subject.name} on ${day} at ${timeSlot} with teacher ${teacher.name}`);
                    slotAssigned = true;
                  } catch (error) {
                    console.error('❌ Error creating timetable entry:', error);
                    continue;
                  }
                }
              }
            }
          }
          
          if (!slotAssigned) {
            console.log(`Could not assign class ${classIndex + 1} for subject: ${subject.name}`);
          }
        }
      }

      console.log(`Generated ${timetable.length} timetable entries`);
      console.log('Subject assignments:', Object.fromEntries(subjectAssignments));
      
      return timetable;
    } catch (error) {
      console.error('Error in generateTimetable:', error);
      throw error;
    }
  }
}
