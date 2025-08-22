<template>
  <div class="timetable-page">
    <!-- Content Header -->
    <div class="content-header">
      <h1>إدارة الجدول الدراسي</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddClassModal">
          <i class="fas fa-plus"></i>
          إضافة محاضرة
        </button>
        <button class="btn btn-secondary" @click="exportTimetable">
          <i class="fas fa-download"></i>
          تصدير الجدول
        </button>
      </div>
    </div>



    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="searchClasses"
          placeholder="البحث في المقررات أو المدرسين..."
        />
      </div>
      <div class="filters">
        <select v-model="selectedMajor" @change="filterClasses">
          <option value="">جميع التخصصات</option>
          <option value="computer-science">علوم الحاسوب</option>
          <option value="engineering">الهندسة</option>
          <option value="business">إدارة الأعمال</option>
        </select>
        <select v-model="selectedDay" @change="filterClasses">
          <option value="">جميع الأيام</option>
          <option value="sunday">الأحد</option>
          <option value="monday">الاثنين</option>
          <option value="tuesday">الثلاثاء</option>
          <option value="wednesday">الأربعاء</option>
          <option value="thursday">الخميس</option>
        </select>
        <select v-model="selectedTime" @change="filterClasses">
          <option value="">جميع الأوقات</option>
          <option value="morning">صباحاً</option>
          <option value="afternoon">مساءً</option>
        </select>
      </div>
    </div>

    <!-- Timetable Grid -->
    <div class="timetable-container">
      <div class="timetable-header">
        <h3>الجدول الأسبوعي</h3>
        <div class="week-navigation">
          <button class="btn btn-secondary" @click="previousWeek">
            <i class="fas fa-chevron-right"></i>
            الأسبوع السابق
          </button>
          <span class="current-week">{{ currentWeekText }}</span>
          <button class="btn btn-secondary" @click="nextWeek">
            الأسبوع التالي
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>
      </div>

      <div class="timetable-grid">
        <div class="time-column">
          <div class="time-header">الوقت</div>
          <div class="time-slot" v-for="time in timeSlots" :key="time">
            {{ time }}
          </div>
        </div>

        <div class="day-column" v-for="day in weekDays" :key="day.key">
          <div class="day-header">{{ day.label }}</div>
          <div 
            class="class-slot" 
            v-for="time in timeSlots" 
            :key="`${day.key}-${time}`"
            @click="showClassDetails(getClassAt(day.key, time))"
            :class="{ 
              'has-class': hasClass(day.key, time),
              'empty-slot': !hasClass(day.key, time)
            }"
          >
            <div v-if="hasClass(day.key, time)" class="class-info">
              <div class="class-name">{{ getClassAt(day.key, time).courseName }}</div>
              <div class="class-teacher">{{ getClassAt(day.key, time).teacherName }}</div>
              <div class="class-room">{{ getClassAt(day.key, time).room }}</div>
            </div>
            <div v-else class="empty-text">
              <i class="fas fa-plus"></i>
              <span>إضافة محاضرة</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Class Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? 'تعديل المحاضرة' : 'إضافة محاضرة جديدة' }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitClass">
            <div class="form-row">
              <div class="form-group">
                <label>المقرر</label>
                <select v-model="classData.courseId" class="form-control" required>
                  <option value="">اختر المقرر</option>
                  <option value="math101">رياضيات 101</option>
                  <option value="physics101">فيزياء 101</option>
                  <option value="chemistry101">كيمياء 101</option>
                  <option value="programming101">برمجة 101</option>
                </select>
              </div>
              <div class="form-group">
                <label>المدرس</label>
                <select v-model="classData.teacherId" class="form-control" required>
                  <option value="">اختر المدرس</option>
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                    {{ teacher.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>اليوم</label>
                <select v-model="classData.day" class="form-control" required>
                  <option value="">اختر اليوم</option>
                  <option value="sunday">الأحد</option>
                  <option value="monday">الاثنين</option>
                  <option value="tuesday">الثلاثاء</option>
                  <option value="wednesday">الأربعاء</option>
                  <option value="thursday">الخميس</option>
                </select>
              </div>
              <div class="form-group">
                <label>الوقت</label>
                <select v-model="classData.time" class="form-control" required>
                  <option value="">اختر الوقت</option>
                  <option v-for="time in timeSlots" :key="time" :value="time">
                    {{ time }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>القاعة</label>
                <input type="text" v-model="classData.room" class="form-control" required>
              </div>
              <div class="form-group">
                <label>التخصص</label>
                <select v-model="classData.major" class="form-control" required>
                  <option value="">اختر التخصص</option>
                  <option value="computer-science">علوم الحاسوب</option>
                  <option value="engineering">الهندسة</option>
                  <option value="business">إدارة الأعمال</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <textarea v-model="classData.notes" class="form-control" rows="3"></textarea>
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
  name: 'Timetable',
  setup() {
    const classes = ref([])
    const teachers = ref([])
    const searchQuery = ref('')
    const selectedMajor = ref('')
    const selectedDay = ref('')
    const selectedTime = ref('')
    const showModal = ref(false)
    const isEditing = ref(false)
    const currentWeek = ref(0)
    const editingId = ref(null)

    const classData = ref({
      courseId: '',
      teacherId: '',
      day: '',
      time: '',
      room: '',
      major: '',
      notes: ''
    })

    const timeSlots = [
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00'
    ]

    const weekDays = [
      { key: 'sunday', label: 'الأحد' },
      { key: 'monday', label: 'الاثنين' },
      { key: 'tuesday', label: 'الثلاثاء' },
      { key: 'wednesday', label: 'الأربعاء' },
      { key: 'thursday', label: 'الخميس' }
    ]

    // Computed properties
    const filteredClasses = computed(() => {
      let filtered = classes.value

      if (searchQuery.value) {
        filtered = filtered.filter(cls => 
          cls.courseName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          cls.teacherName.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedMajor.value) {
        filtered = filtered.filter(cls => cls.major === selectedMajor.value)
      }

      if (selectedDay.value) {
        filtered = filtered.filter(cls => cls.day === selectedDay.value)
      }

      if (selectedTime.value) {
        filtered = filtered.filter(cls => {
          if (selectedTime.value === 'morning') {
            return cls.time.includes('08:00') || cls.time.includes('09:00') || 
                   cls.time.includes('10:00') || cls.time.includes('11:00') || 
                   cls.time.includes('12:00')
          } else {
            return cls.time.includes('14:00') || cls.time.includes('15:00') || 
                   cls.time.includes('16:00') || cls.time.includes('17:00')
          }
        })
      }

      return filtered
    })

    const totalClasses = computed(() => classes.value.length)
    const totalTeachers = computed(() => new Set(classes.value.map(cls => cls.teacherId)).size)
    const totalStudents = computed(() => 150) // Mock data
    const totalHours = computed(() => classes.value.length)

    const currentWeekText = computed(() => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + (currentWeek.value * 7))
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 4)
      return `${startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })}`
    })

    // Methods
    const loadClasses = () => {
      classes.value = getSampleClasses()
      teachers.value = getSampleTeachers()
    }

    const searchClasses = () => {
      // Search functionality
    }

    const filterClasses = () => {
      // Filter functionality
    }

    const previousWeek = () => {
      currentWeek.value--
    }

    const nextWeek = () => {
      currentWeek.value++
    }

    const showAddClassModal = () => {
      isEditing.value = false
      editingId.value = null
      resetForm()
      showModal.value = true
    }

    const showClassDetails = (cls) => {
      if (cls) {
        alert(`تفاصيل المحاضرة: ${cls.courseName} - ${cls.teacherName} - ${cls.room}`)
      } else {
        showAddClassModal()
      }
    }

    const editClass = (cls) => {
      isEditing.value = true
      editingId.value = cls.id
      classData.value = { ...cls }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      resetForm()
    }

    const resetForm = () => {
      classData.value = {
        courseId: '',
        teacherId: '',
        day: '',
        time: '',
        room: '',
        major: '',
        notes: ''
      }
    }

    const submitClass = () => {
      if (isEditing.value) {
        // Update existing class
        const index = classes.value.findIndex(item => item.id === editingId.value)
        if (index !== -1) {
          classes.value[index] = { ...classData.value, id: editingId.value }
        }
      } else {
        // Add new class
        const newClass = {
          ...classData.value,
          id: Date.now(),
          courseName: getCourseName(classData.value.courseId),
          teacherName: teachers.value.find(t => t.id === classData.value.teacherId)?.name || ''
        }
        classes.value.push(newClass)
      }
      
      closeModal()
    }

    const hasClass = (day, time) => {
      return classes.value.some(cls => cls.day === day && cls.time === time)
    }

    const getClassAt = (day, time) => {
      return classes.value.find(cls => cls.day === day && cls.time === time)
    }

    const exportTimetable = () => {
      alert('سيتم تصدير الجدول الدراسي...')
    }

    const getCourseName = (courseId) => {
      const courses = {
        'math101': 'رياضيات 101',
        'physics101': 'فيزياء 101',
        'chemistry101': 'كيمياء 101',
        'programming101': 'برمجة 101'
      }
      return courses[courseId] || courseId
    }

    const getSampleTeachers = () => {
      return [
        { id: 'T001', name: 'د. أحمد محمد' },
        { id: 'T002', name: 'د. فاطمة علي' },
        { id: 'T003', name: 'د. محمد أحمد' }
      ]
    }

    const getSampleClasses = () => {
      return [
        {
          id: 1,
          courseId: 'math101',
          courseName: 'رياضيات 101',
          teacherId: 'T001',
          teacherName: 'د. أحمد محمد',
          day: 'sunday',
          time: '08:00 - 09:00',
          room: 'قاعة 101',
          major: 'computer-science',
          notes: 'محاضرة نظرية'
        },
        {
          id: 2,
          courseId: 'physics101',
          courseName: 'فيزياء 101',
          teacherId: 'T002',
          teacherName: 'د. فاطمة علي',
          day: 'monday',
          time: '09:00 - 10:00',
          room: 'قاعة 102',
          major: 'engineering',
          notes: 'محاضرة عملية'
        },
        {
          id: 3,
          courseId: 'chemistry101',
          courseName: 'كيمياء 101',
          teacherId: 'T003',
          teacherName: 'د. محمد أحمد',
          day: 'tuesday',
          time: '14:00 - 15:00',
          room: 'مختبر 201',
          major: 'business',
          notes: 'محاضرة مختبر'
        }
      ]
    }

    onMounted(() => {
      loadClasses()
    })

    return {
      classes,
      teachers,
      searchQuery,
      selectedMajor,
      selectedDay,
      selectedTime,
      showModal,
      isEditing,
      currentWeek,
      classData,
      editingId,
      timeSlots,
      weekDays,
      filteredClasses,
      totalClasses,
      totalTeachers,
      totalStudents,
      totalHours,
      currentWeekText,
      searchClasses,
      filterClasses,
      previousWeek,
      nextWeek,
      showAddClassModal,
      showClassDetails,
      editClass,
      closeModal,
      submitClass,
      hasClass,
      getClassAt,
      exportTimetable
    }
  }
}
</script>

<style scoped>
.timetable-page {
  padding: 0;
}

.timetable-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.timetable-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timetable-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-week {
  font-weight: 600;
  color: #27ae60;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.timetable-grid {
  display: flex;
  min-height: 600px;
}

.time-column {
  width: 120px;
  border-right: 1px solid #e9ecef;
}

.time-header {
  padding: 1rem;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.time-slot {
  padding: 1rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.8rem;
  color: #6c757d;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-column {
  flex: 1;
  border-right: 1px solid #e9ecef;
}

.day-column:last-child {
  border-right: none;
}

.day-header {
  padding: 1rem;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.class-slot {
  height: 75px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.class-slot:hover {
  background: #f8f9fa;
}

.class-slot.has-class {
  background: #e8f5e8;
  border-left: 4px solid #27ae60;
}

.class-slot.empty-slot {
  background: #f8f9fa;
  color: #6c757d;
}

.class-info {
  text-align: center;
  width: 100%;
}

.class-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.class-teacher {
  color: #6c757d;
  font-size: 0.7rem;
  margin-bottom: 0.25rem;
}

.class-room {
  color: #27ae60;
  font-size: 0.7rem;
  font-weight: 600;
}

.empty-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
}

.empty-text i {
  font-size: 1rem;
  color: #6c757d;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .timetable-grid {
    flex-direction: column;
  }
  
  .time-column {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
  
  .day-column {
    border-right: none;
  }
  
  .timetable-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .week-navigation {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
