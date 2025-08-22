<template>
  <div class="dashboard-page">
    <div class="content-header">
      <h1>لوحة التحكم</h1>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="refreshDashboard()">
          <i class="fas fa-sync-alt"></i>
          تحديث البيانات
        </button>
        <button class="btn btn-secondary" onclick="exportDashboard()">
          <i class="fas fa-download"></i>
          تصدير التقرير
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="card-content">
          <div class="card-value" id="totalStudentsCount">0</div>
          <div class="card-label">إجمالي الطلاب</div>
          <div class="card-change positive">
            <i class="fas fa-arrow-up"></i>
            <span id="studentsChange">0%</span>
          </div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #007bff;">
        <div class="card-icon">
          <i class="fas fa-chalkboard-teacher"></i>
        </div>
        <div class="card-content">
          <div class="card-value" id="totalTeachersCount">0</div>
          <div class="card-label">هيئة التدريس</div>
          <div class="card-change positive">
            <i class="fas fa-arrow-up"></i>
            <span id="teachersChange">0%</span>
          </div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-icon">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="card-content">
          <div class="card-value" id="totalMajorsCount">0</div>
          <div class="card-label">التخصصات</div>
          <div class="card-change neutral">
            <i class="fas fa-minus"></i>
            <span id="majorsChange">0%</span>
          </div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="card-content">
          <div class="card-value" id="attendanceRate">0%</div>
          <div class="card-label">معدل الحضور</div>
          <div class="card-change positive">
            <i class="fas fa-arrow-up"></i>
            <span id="attendanceChange">0%</span>
          </div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #6f42c1;">
        <div class="card-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="card-content">
          <div class="card-value" id="feesCollected">0 ريال</div>
          <div class="card-label">الرسوم المحصلة</div>
          <div class="card-change positive">
            <i class="fas fa-arrow-up"></i>
            <span id="feesChange">0%</span>
          </div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #e83e8c;">
        <div class="card-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="card-content">
          <div class="card-value" id="activeClasses">0</div>
          <div class="card-label">الفصول النشطة</div>
          <div class="card-change positive">
            <i class="fas fa-arrow-up"></i>
            <span id="classesChange">0%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>إجراءات سريعة</h2>
      <div class="actions-grid">
        <div class="action-card" onclick="navigateTo('/students')">
          <div class="action-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="action-title">إضافة طالب جديد</div>
          <div class="action-description">تسجيل طالب جديد في النظام</div>
        </div>

        <div class="action-card" onclick="navigateTo('/teachers')">
          <div class="action-icon">
            <i class="fas fa-chalkboard-teacher"></i>
          </div>
          <div class="action-title">إضافة عضو هيئة تدريس</div>
          <div class="action-description">تسجيل عضو هيئة تدريس جديد</div>
        </div>

        <div class="action-card" onclick="navigateTo('/majors')">
          <div class="action-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="action-title">إضافة تخصص جديد</div>
          <div class="action-description">إنشاء تخصص أكاديمي جديد</div>
        </div>

        <div class="action-card" onclick="navigateTo('/attendance')">
          <div class="action-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="action-title">تسجيل الحضور</div>
          <div class="action-description">تسجيل حضور وانصراف الطلاب</div>
        </div>

        <div class="action-card" onclick="navigateTo('/fees')">
          <div class="action-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="action-title">إدارة الرسوم</div>
          <div class="action-description">إدارة رسوم الطلاب والمدفوعات</div>
        </div>

        <div class="action-card" onclick="navigateTo('/timetable')">
          <div class="action-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="action-title">إدارة الجدول الدراسي</div>
          <div class="action-description">إنشاء وتعديل الجداول الدراسية</div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-activities">
      <h2>النشاطات الأخيرة</h2>
      <div class="activities-list" id="activitiesList">
        <!-- Activities will be populated here -->
      </div>
    </div>

    <!-- System Status -->
    <div class="system-status">
      <h2>حالة النظام</h2>
      <div class="status-grid">
        <div class="status-item">
          <div class="status-indicator online"></div>
          <div class="status-text">قاعدة البيانات</div>
        </div>
        <div class="status-item">
          <div class="status-indicator online"></div>
          <div class="status-text">الخادم</div>
        </div>
        <div class="status-item">
          <div class="status-indicator online"></div>
          <div class="status-text">التطبيق</div>
        </div>
        <div class="status-item">
          <div class="status-indicator online"></div>
          <div class="status-text">الأمان</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Dashboard',
  setup() {
    onMounted(() => {
      // Load dashboard data
      loadDashboardData()
      loadRecentActivities()
    })

    // Load dashboard data
    const loadDashboardData = () => {
      // For demo purposes, load sample data
      const dashboardData = getSampleDashboardData()
      
      // Update summary cards
      document.getElementById('totalStudentsCount').textContent = dashboardData.totalStudents
      document.getElementById('totalTeachersCount').textContent = dashboardData.totalTeachers
      document.getElementById('totalMajorsCount').textContent = dashboardData.totalMajors
      document.getElementById('attendanceRate').textContent = dashboardData.attendanceRate + '%'
      document.getElementById('feesCollected').textContent = dashboardData.feesCollected + ' ريال'
      document.getElementById('activeClasses').textContent = dashboardData.activeClasses

      // Update change indicators
      document.getElementById('studentsChange').textContent = dashboardData.studentsChange + '%'
      document.getElementById('teachersChange').textContent = dashboardData.teachersChange + '%'
      document.getElementById('majorsChange').textContent = dashboardData.majorsChange + '%'
      document.getElementById('attendanceChange').textContent = dashboardData.attendanceChange + '%'
      document.getElementById('feesChange').textContent = dashboardData.feesChange + '%'
      document.getElementById('classesChange').textContent = dashboardData.classesChange + '%'
    }

    // Load recent activities
    const loadRecentActivities = () => {
      const activities = getSampleActivities()
      const activitiesList = document.getElementById('activitiesList')
      
      activitiesList.innerHTML = activities.map(activity => `
        <div class="activity-item">
          <div class="activity-icon ${activity.type}">
            <i class="fas ${getActivityIcon(activity.type)}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-description">${activity.description}</div>
            <div class="activity-time">${activity.time}</div>
          </div>
        </div>
      `).join('')
    }

    // Get activity icon
    const getActivityIcon = (type) => {
      const icons = {
        'student': 'fa-user-plus',
        'teacher': 'fa-chalkboard-teacher',
        'major': 'fa-graduation-cap',
        'attendance': 'fa-calendar-check',
        'fees': 'fa-dollar-sign',
        'system': 'fa-cog'
      }
      return icons[type] || 'fa-info-circle'
    }

    // Get sample dashboard data
    const getSampleDashboardData = () => {
      return {
        totalStudents: 1250,
        totalTeachers: 85,
        totalMajors: 12,
        attendanceRate: 94,
        feesCollected: 1250000,
        activeClasses: 45,
        studentsChange: 12,
        teachersChange: 5,
        majorsChange: 0,
        attendanceChange: 3,
        feesChange: 18,
        classesChange: 8
      }
    }

    // Get sample activities
    const getSampleActivities = () => {
      return [
        {
          type: 'student',
          title: 'تم تسجيل طالب جديد',
          description: 'أحمد محمد تم تسجيله في تخصص علوم الحاسوب',
          time: 'منذ 5 دقائق'
        },
        {
          type: 'teacher',
          title: 'تم تعيين عضو هيئة تدريس',
          description: 'د. فاطمة علي تم تعيينها في كلية الطب',
          time: 'منذ 15 دقيقة'
        },
        {
          type: 'attendance',
          title: 'تم تسجيل الحضور',
          description: 'تم تسجيل حضور 150 طالب في الفصل الدراسي',
          time: 'منذ ساعة'
        },
        {
          type: 'fees',
          title: 'تم تحصيل رسوم',
          description: 'تم تحصيل رسوم بقيمة 50,000 ريال',
          time: 'منذ ساعتين'
        },
        {
          type: 'major',
          title: 'تم إنشاء تخصص جديد',
          description: 'تم إنشاء تخصص الذكاء الاصطناعي',
          time: 'منذ 3 ساعات'
        }
      ]
    }

    // Make functions globally available
    window.loadDashboardData = loadDashboardData
    window.loadRecentActivities = loadRecentActivities
    window.getSampleDashboardData = getSampleDashboardData
    window.getSampleActivities = getSampleActivities

    return {
      // Return reactive data if needed
    }
  }
}
</script>

<style scoped>
/* Component-specific styles */
.dashboard-page {
  padding: 2rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
}

.card-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.card-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-change.positive {
  color: #28a745;
}

.card-change.negative {
  color: #dc3545;
}

.card-change.neutral {
  color: #6c757d;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: white;
}

.action-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.action-description {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
}

/* Recent Activities */
.recent-activities {
  margin-bottom: 3rem;
}

.recent-activities h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.activities-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
}

.activity-icon.student {
  background: #28a745;
}

.activity-icon.teacher {
  background: #007bff;
}

.activity-icon.major {
  background: #ffc107;
}

.activity-icon.attendance {
  background: #17a2b8;
}

.activity-icon.fees {
  background: #6f42c1;
}

.activity-icon.system {
  background: #6c757d;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.activity-description {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: #999;
}

/* System Status */
.system-status {
  margin-bottom: 2rem;
}

.system-status h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.online {
  background: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
}

.status-indicator.offline {
  background: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
}

.status-indicator.warning {
  background: #ffc107;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
}

.status-text {
  font-weight: 500;
  color: #333;
}

/* Responsive design */
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
}
</style>
