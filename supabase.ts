import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xpejwpfyusjppgnntaig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZWp3cGZ5dXNqcHBnbm50YWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTY5NjYsImV4cCI6MjA3MDQ3Mjk2Nn0.QcQDyCmZFcKX9tPHBh0xD92IHsHsOtkz2tS4Wek-yNM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for University ERP system
export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          department_id: string | null;
          year: number | null;
          email: string | null;
          phone: string | null;
          status: string;
          academic_history: string | null;
          academic_history_type: string | null;
          gpa: number | null;
          academic_score: number | null;
          score_type: string | null;
          transcript_file: string | null;
          sponsor_name: string | null;
          sponsor_contact: string | null;
          nationality: string | null;
          gender: string | null;
          birth_date: string | null;
          enrollment_date: string | null;
          address: string | null;
          national_id_passport: string | null;
          qr_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          name_en?: string | null;
          department_id?: string | null;
          year?: number | null;
          email?: string | null;
          phone?: string | null;
          status?: string;
          academic_history?: string | null;
          academic_history_type?: string | null;
          gpa?: number | null;
          academic_score?: number | null;
          score_type?: string | null;
          transcript_file?: string | null;
          sponsor_name?: string | null;
          sponsor_contact?: string | null;
          nationality?: string | null;
          gender?: string | null;
          birth_date?: string | null;
          enrollment_date?: string | null;
          address?: string | null;
          national_id_passport?: string | null;
          qr_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          department_id?: string | null;
          year?: number | null;
          email?: string | null;
          phone?: string | null;
          status?: string;
          academic_history?: string | null;
          academic_history_type?: string | null;
          gpa?: number | null;
          academic_score?: number | null;
          score_type?: string | null;
          transcript_file?: string | null;
          sponsor_name?: string | null;
          sponsor_contact?: string | null;
          nationality?: string | null;
          gender?: string | null;
          birth_date?: string | null;
          enrollment_date?: string | null;
          address?: string | null;
          national_id_passport?: string | null;
          qr_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          department_id: string | null;
          email: string | null;
          phone: string | null;
          qualification: string | null;
          specialization: string | null;
          years_experience: number | null;
          availability: any | null;
          specializations: string[] | null;
          teaching_hours: number | null;
          hourly_rate: number | null;
          basic_salary: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          department_id?: string | null;
          email?: string | null;
          phone?: string | null;
          qualification?: string | null;
          specialization?: string | null;
          years_experience?: number | null;
          availability?: any | null;
          specializations?: string[] | null;
          teaching_hours?: number | null;
          hourly_rate?: number | null;
          basic_salary?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          department_id?: string | null;
          email?: string | null;
          phone?: string | null;
          qualification?: string | null;
          specialization?: string | null;
          years_experience?: number | null;
          availability?: any | null;
          specializations?: string[] | null;
          teaching_hours?: number | null;
          hourly_rate?: number | null;
          basic_salary?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          head: string | null;
          is_locked: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          name_en?: string | null;
          head?: string | null;
          is_locked?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          head?: string | null;
          is_locked?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          code: string;
          name: string;
          name_en: string | null;
          department_id: string | null;
          credits: number | null;
          teacher_id: string | null;
          semester: string | null;
          max_students: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          name_en?: string | null;
          department_id?: string | null;
          credits?: number | null;
          teacher_id?: string | null;
          semester?: string | null;
          max_students?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          name_en?: string | null;
          department_id?: string | null;
          credits?: number | null;
          teacher_id?: string | null;
          semester?: string | null;
          max_students?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fees: {
        Row: {
          id: number;
          student_id: string | null;
          amount: number;
          due_date: string | null;
          status: string;
          paid_date: string | null;
          semester: string | null;
          type: string | null;
          receipt_no: string | null;
          payment_plan_id: string | null;
          academic_year: string | null;
          payment_method: string | null;
          payment_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          student_id?: string | null;
          amount: number;
          due_date?: string | null;
          status?: string;
          paid_date?: string | null;
          semester?: string | null;
          type?: string | null;
          receipt_no?: string | null;
          payment_plan_id?: string | null;
          academic_year?: string | null;
          payment_method?: string | null;
          payment_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          student_id?: string | null;
          amount?: number;
          due_date?: string | null;
          status?: string;
          paid_date?: string | null;
          semester?: string | null;
          type?: string | null;
          receipt_no?: string | null;
          payment_plan_id?: string | null;
          academic_year?: string | null;
          payment_method?: string | null;
          payment_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teacher_subjects: {
        Row: {
          id: number;
          teacher_id: string;
          subject_id: string;
          proficiency_level: string | null;
          years_teaching: number | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          teacher_id: string;
          subject_id: string;
          proficiency_level?: string | null;
          years_teaching?: number | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          teacher_id?: string;
          subject_id?: string;
          proficiency_level?: string | null;
          years_teaching?: number | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      grades: {
        Row: {
          id: number;
          student_id: string | null;
          subject_id: string | null;
          midterm: number | null;
          final: number | null;
          assignments: number | null;
          total: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          student_id?: string | null;
          subject_id?: string | null;
          midterm?: number | null;
          final?: number | null;
          assignments?: number | null;
          total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          student_id?: string | null;
          subject_id?: string | null;
          midterm?: number | null;
          final?: number | null;
          assignments?: number | null;
          total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: number;
          student_id: string | null;
          subject_id: string | null;
          date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          student_id?: string | null;
          subject_id?: string | null;
          date: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          student_id?: string | null;
          subject_id?: string | null;
          date?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      timetable: {
        Row: {
          id: number;
          day_of_week: string;
          time_slot: string;
          subject_id: string | null;
          room: string | null;
          teacher_id: string | null;
          department_id: string | null;
          semester: string | null;
          academic_year: string | null;
          max_students: number | null;
          current_enrollment: number | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          day_of_week: string;
          time_slot: string;
          subject_id?: string | null;
          room?: string | null;
          teacher_id?: string | null;
          department_id?: string | null;
          semester?: string | null;
          academic_year?: string | null;
          max_students?: number | null;
          current_enrollment?: number | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          day_of_week?: string;
          time_slot?: string;
          subject_id?: string | null;
          room?: string | null;
          teacher_id?: string | null;
          department_id?: string | null;
          semester?: string | null;
          academic_year?: string | null;
          max_students?: number | null;
          current_enrollment?: number | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scheduling_constraints: {
        Row: {
          id: number;
          constraint_type: string;
          constraint_value: any;
          priority: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          constraint_type: string;
          constraint_value?: any;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          constraint_type?: string;
          constraint_value?: any;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          qr_type: 'student' | 'attendance' | 'fee' | 'verification';
          qr_data: any;
          generated_by?: string;
          generated_for?: string;
          scanned_by?: string;
          scanned_at?: string;
          expires_at?: string;
          status: 'active' | 'expired' | 'scanned' | 'invalid';
          ip_address?: string;
          user_agent?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          qr_type: 'student' | 'attendance' | 'fee' | 'verification';
          qr_data: any;
          generated_by?: string;
          generated_for?: string;
          scanned_by?: string;
          scanned_at?: string;
          expires_at?: string;
          status?: 'active' | 'expired' | 'scanned' | 'invalid';
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          qr_type?: 'student' | 'attendance' | 'fee' | 'verification';
          qr_data?: any;
          generated_by?: string;
          generated_for?: string;
          scanned_by?: string;
          scanned_at?: string;
          expires_at?: string;
          status?: 'active' | 'expired' | 'scanned' | 'invalid';
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_sessions: {
        Row: {
          id: string;
          class_id: string;
          subject: string;
          teacher_id: string;
          teacher_name: string;
          location: string;
          start_time: string;
          end_time: string;
          qr_code_id: string;
          total_students: number;
          present_students: number;
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          subject: string;
          teacher_id: string;
          teacher_name: string;
          location: string;
          start_time: string;
          end_time: string;
          qr_code_id: string;
          total_students?: number;
          present_students?: number;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          subject?: string;
          teacher_id?: string;
          teacher_name?: string;
          location?: string;
          start_time?: string;
          end_time?: string;
          qr_code_id?: string;
          total_students?: number;
          present_students?: number;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      student_attendance: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          student_name: string;
          scan_time: string;
          qr_code_id: string;
          ip_address?: string;
          device_info?: string;
          status: 'present' | 'late' | 'absent';
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          student_name: string;
          scan_time: string;
          qr_code_id: string;
          ip_address?: string;
          device_info?: string;
          status?: 'present' | 'late' | 'absent';
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          student_id?: string;
          student_name?: string;
          scan_time?: string;
          qr_code_id?: string;
          ip_address?: string;
          device_info?: string;
          status?: 'present' | 'late' | 'absent';
          created_at?: string;
        };
      };
    };
  };
}
