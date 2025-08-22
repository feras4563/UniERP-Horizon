// User management system
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'staff' | 'student';
  name: string;
  email?: string;
  department_id?: string;
  student_id?: string; // For students
  teacher_id?: string; // For teachers
}

// Default users for testing
export const defaultUsers: User[] = [
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    email: 'admin@horizon.ly'
  },
  {
    id: 'teacher1',
    username: 'teacher',
    password: 'teacher123',
    role: 'teacher',
    name: 'د. عبدالرحمن الشريف',
    email: 'alsharif@horizon.ly',
    department_id: 'CS'
  },
  {
    id: 'staff1',
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    name: 'أحمد محمد',
    email: 'staff@horizon.ly'
  },
  {
    id: 'student1',
    username: 'student',
    password: 'student123',
    role: 'student',
    name: 'أحمد محمد علي',
    email: 'ahmed@horizon.ly',
    student_id: 'S2024001'
  }
];

// User authentication service
export class UserService {
  private static users = defaultUsers;

  static authenticate(username: string, password: string): User | null {
    const user = this.users.find(u => u.username === username && u.password === password);
    return user || null;
  }

  static getUserById(id: string): User | null {
    return this.users.find(u => u.id === id) || null;
  }

  static getUsersByRole(role: string): User[] {
    return this.users.filter(u => u.role === role);
  }
}

