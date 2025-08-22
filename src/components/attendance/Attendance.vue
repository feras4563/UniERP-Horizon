<template>
  <div class="attendance-page">
    <!-- Content Header -->
    <div class="content-header">
      <h1>إدارة الحضور</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddAttendanceModal">
          <i class="fas fa-plus"></i>
          إضافة حضور
        </button>
        <button class="btn btn-secondary" @click="exportAttendance">
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
          <div class="card-value">{{ totalStudents }}</div>
          <div class="card-label">إجمالي الطلاب</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ presentCount }}</div>
          <div class="card-label">الحضور</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #dc3545;">
        <div class="card-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ absentCount }}</div>
          <div class="card-label">الغياب</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ lateCount }}</div>
          <div class="card-label">التأخير</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-icon">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ attendanceRate }}%</div>
          <div class="card-label">معدل الحضور</div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="searchAttendance"
          placeholder="البحث في الطلاب أو المقررات..."
        />
      </div>
      <div class="filters">
        <select v-model="selectedMajor" @change="filterAttendance">
          <option value="">جميع التخصصات</option>
          <option value="computer-science">علوم الحاسوب</option>
          <option value="engineering">الهندسة</option>
          <option value="business">إدارة الأعمال</option>
        </select>
        <select v-model="selectedStatus" @change="filterAttendance">
          <option value="">جميع الحالات</option>
          <option value="present">حاضر</option>
          <option value="absent">غائب</option>
          <option value="late">متأخر</option>
        </select>
        <input 
          type="date" 
          v-model="selectedDate" 
          @change="filterAttendance"
          class="form-control"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>الطالب</th>
            <th>التخصص</th>
            <th>المقرر</th>
            <th>التاريخ</th>
            <th>الحالة</th>
            <th>الوقت</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in paginatedAttendance" :key="record.id">
            <td>
              <div class="student-info">
                <img :src="record.studentImage" :alt="record.studentName" class="student-avatar">
                <div>
                  <div class="student-name">{{ record.studentName }}</div>
                  <div class="student-id">{{ record.studentId }}</div>
                </div>
              </div>
            </td>
            <td>{{ record.major }}</td>
            <td>{{ record.course }}</td>
            <td>{{ formatDate(record.date) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(record.status)">
                {{ getStatusText(record.status) }}
              </span>
            </td>
            <td>{{ record.time }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-edit" @click="editAttendance(record)" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" @click="deleteAttendance(record.id)" title="حذف">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
      >
        السابق
      </button>
      <button 
        v-for="page in totalPages" 
        :key="page"
        @click="changePage(page)"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
      >
        التالي
      </button>
    </div>

    <!-- Add/Edit Attendance Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? 'تعديل الحضور' : 'إضافة حضور جديد' }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAttendance">
            <div class="form-row">
              <div class="form-group">
                <label>الطالب</label>
                <select v-model="attendanceData.studentId" class="form-control" required>
                  <option value="">اختر الطالب</option>
                  <option v-for="student in students" :key="student.id" :value="student.id">
                    {{ student.name }} - {{ student.id }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>المقرر</label>
                <select v-model="attendanceData.courseId" class="form-control" required>
                  <option value="">اختر المقرر</option>
                  <option value="math101">رياضيات 101</option>
                  <option value="physics101">فيزياء 101</option>
                  <option value="chemistry101">كيمياء 101</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>التاريخ</label>
                <input type="date" v-model="attendanceData.date" class="form-control" required>
              </div>
              <div class="form-group">
                <label>الوقت</label>
                <input type="time" v-model="attendanceData.time" class="form-control" required>
              </div>
            </div>
            <div class="form-group">
              <label>الحالة</label>
              <select v-model="attendanceData.status" class="form-control" required>
                <option value="present">حاضر</option>
                <option value="absent">غائب</option>
                <option value="late">متأخر</option>
              </select>
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <textarea v-model="attendanceData.notes" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-navigation">
              <button type="button" class="btn btn-secondary" @click="closeModal">إلغاء</button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'تحديث' : 'إضافة' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'Attendance',
  setup() {
    const attendance = ref([])
    const students = ref([])
    const searchQuery = ref('')
    const selectedMajor = ref('')
    const selectedStatus = ref('')
    const selectedDate = ref('')
    const showModal = ref(false)
    const isEditing = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const editingId = ref(null)

    const attendanceData = ref({
      studentId: '',
      courseId: '',
      date: '',
      time: '',
      status: 'present',
      notes: ''
    })

    // Computed properties
    const filteredAttendance = computed(() => {
      let filtered = attendance.value

      if (searchQuery.value) {
        filtered = filtered.filter(record => 
          record.studentName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          record.course.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedMajor.value) {
        filtered = filtered.filter(record => record.major === selectedMajor.value)
      }

      if (selectedStatus.value) {
        filtered = filtered.filter(record => record.status === selectedStatus.value)
      }

      if (selectedDate.value) {
        filtered = filtered.filter(record => record.date === selectedDate.value)
      }

      return filtered
    })

    const paginatedAttendance = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredAttendance.value.slice(start, end)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredAttendance.value.length / itemsPerPage.value)
    )

    const totalStudents = computed(() => attendance.value.length)
    const presentCount = computed(() => 
      attendance.value.filter(record => record.status === 'present').length
    )
    const absentCount = computed(() => 
      attendance.value.filter(record => record.status === 'absent').length
    )
    const lateCount = computed(() => 
      attendance.value.filter(record => record.status === 'late').length
    )
    const attendanceRate = computed(() => {
      if (totalStudents.value === 0) return 0
      return Math.round((presentCount.value / totalStudents.value) * 100)
    })

    // Methods
    const loadAttendance = () => {
      attendance.value = getSampleAttendance()
      students.value = getSampleStudents()
    }

    const searchAttendance = () => {
      currentPage.value = 1
    }

    const filterAttendance = () => {
      currentPage.value = 1
    }

    const changePage = (page) => {
      currentPage.value = page
    }

    const showAddAttendanceModal = () => {
      isEditing.value = false
      editingId.value = null
      resetForm()
      showModal.value = true
    }

    const editAttendance = (record) => {
      isEditing.value = true
      editingId.value = record.id
      attendanceData.value = { ...record }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      resetForm()
    }

    const resetForm = () => {
      attendanceData.value = {
        studentId: '',
        courseId: '',
        date: '',
        time: '',
        status: 'present',
        notes: ''
      }
    }

    const submitAttendance = () => {
      if (isEditing.value) {
        // Update existing attendance
        const index = attendance.value.findIndex(item => item.id === editingId.value)
        if (index !== -1) {
          attendance.value[index] = { ...attendanceData.value, id: editingId.value }
        }
      } else {
        // Add new attendance
        const newAttendance = {
          ...attendanceData.value,
          id: Date.now(),
          studentName: students.value.find(s => s.id === attendanceData.value.studentId)?.name || '',
          studentId: students.value.find(s => s.id === attendanceData.value.studentId)?.id || '',
          course: getCourseName(attendanceData.value.courseId),
          major: students.value.find(s => s.id === attendanceData.value.studentId)?.major || '',
          studentImage: students.value.find(s => s.id === attendanceData.value.studentId)?.image || ''
        }
        attendance.value.unshift(newAttendance)
      }
      
      closeModal()
    }

    const deleteAttendance = (id) => {
      if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        attendance.value = attendance.value.filter(item => item.id !== id)
      }
    }

    const exportAttendance = () => {
      alert('سيتم تصدير تقرير الحضور...')
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'present': return 'status-active'
        case 'absent': return 'status-inactive'
        case 'late': return 'status-pending'
        default: return ''
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'present': return 'حاضر'
        case 'absent': return 'غائب'
        case 'late': return 'متأخر'
        default: return status
      }
    }

    const getCourseName = (courseId) => {
      const courses = {
        'math101': 'رياضيات 101',
        'physics101': 'فيزياء 101',
        'chemistry101': 'كيمياء 101'
      }
      return courses[courseId] || courseId
    }

    const getSampleStudents = () => {
      return [
        { id: 'ST001', name: 'أحمد محمد', major: 'computer-science', image: 'https://via.placeholder.com/40' },
        { id: 'ST002', name: 'فاطمة علي', major: 'engineering', image: 'https://via.placeholder.com/40' },
        { id: 'ST003', name: 'محمد أحمد', major: 'business', image: 'https://via.placeholder.com/40' }
      ]
    }

    const getSampleAttendance = () => {
      return [
        {
          id: 1,
          studentName: 'أحمد محمد',
          studentId: 'ST001',
          major: 'computer-science',
          course: 'رياضيات 101',
          date: '2024-01-15',
          time: '09:00',
          status: 'present',
          notes: '',
          studentImage: 'https://via.placeholder.com/40'
        },
        {
          id: 2,
          studentName: 'فاطمة علي',
          studentId: 'ST002',
          major: 'engineering',
          course: 'فيزياء 101',
          date: '2024-01-16',
          time: '09:15',
          status: 'late',
          notes: 'تأخر 15 دقيقة',
          studentImage: 'https://via.placeholder.com/40'
        },
        {
          id: 3,
          studentName: 'محمد أحمد',
          studentId: 'ST003',
          major: 'business',
          course: 'كيمياء 101',
          date: '2024-01-17',
          time: '09:00',
          status: 'absent',
          notes: 'غياب بدون عذر',
          studentImage: 'https://via.placeholder.com/40'
        }
      ]
    }

    onMounted(() => {
      loadAttendance()
    })

    return {
      attendance,
      students,
      searchQuery,
      selectedMajor,
      selectedStatus,
      selectedDate,
      showModal,
      isEditing,
      currentPage,
      attendanceData,
      editingId,
      filteredAttendance,
      paginatedAttendance,
      totalPages,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate,
      searchAttendance,
      filterAttendance,
      changePage,
      showAddAttendanceModal,
      editAttendance,
      closeModal,
      submitAttendance,
      deleteAttendance,
      exportAttendance,
      formatDate,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.attendance-page {
  padding: 0;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.student-name {
  font-weight: 600;
  color: #2c3e50;
}

.student-id {
  font-size: 0.8rem;
  color: #6c757d;
}

.status-badge.status-active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.status-inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .student-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
