import { createRouter, createWebHistory } from 'vue-router'

// Import page components
import Dashboard from '../components/Dashboard.vue'
import Students from '../components/students/Students.vue'
import Teachers from '../components/teachers/Teachers.vue'
import Majors from '../components/majors/Majors.vue'
import Subjects from '../components/subjects/Subjects.vue'
import Attendance from '../components/attendance/Attendance.vue'
import Fees from '../components/fees/Fees.vue'
import Timetable from '../components/timetable/Timetable.vue'
import ChartOfAccounts from '../components/finance/ChartOfAccounts.vue'
import JournalEntry from '../components/finance/JournalEntry.vue'
import GeneralLedger from '../components/finance/GeneralLedger.vue'
import Settings from '../components/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/students',
    name: 'Students',
    component: Students
  },
  {
    path: '/teachers',
    name: 'Teachers',
    component: Teachers
  },
  {
    path: '/majors',
    name: 'Majors',
    component: Majors
  },
  {
    path: '/subjects',
    name: 'Subjects',
    component: Subjects
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance
  },
  {
    path: '/fees',
    name: 'Fees',
    component: Fees
  },
  {
    path: '/timetable',
    name: 'Timetable',
    component: Timetable
  },
  {
    path: '/chart-of-accounts',
    name: 'ChartOfAccounts',
    component: ChartOfAccounts
  },
  {
    path: '/journal-entry',
    name: 'JournalEntry',
    component: JournalEntry
  },
  {
    path: '/general-ledger',
    name: 'GeneralLedger',
    component: GeneralLedger
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Title update logic
const titleMap = {
  '/': 'لوحة التحكم',
  '/students': 'إدارة الطلاب',
  '/teachers': 'هيئة التدريس',
  '/majors': 'التخصصات والمقررات',
  '/subjects': 'المقررات الدراسية',
  '/attendance': 'إدارة الحضور',
  '/fees': 'إدارة الرسوم',
  '/timetable': 'الجدول الدراسي',
  '/chart-of-accounts': 'دليل الحسابات',
  '/journal-entry': 'القيود اليومية',
  '/general-ledger': 'الأستاذ العام',
  '/settings': 'إعدادات النظام'
}

router.beforeEach((to, from, next) => {
  const title = titleMap[to.path] || 'نظام إدارة الجامعة'
  document.title = title
  next()
})

export default router
