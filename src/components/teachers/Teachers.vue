<template>
  <div class="teachers-page">
    <div class="content-header">
      <h1>هيئة التدريس</h1>
      <div class="header-actions">
        <button class="btn btn-success" @click="showAddTeacherModal">
          <i class="fas fa-plus"></i>
          إضافة عضو هيئة تدريس
        </button>
        <button class="btn btn-secondary" @click="exportTeachers">
          <i class="fas fa-download"></i>
          تصدير البيانات
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-value">{{ totalTeachers }}</div>
        <div class="card-label">إجمالي هيئة التدريس</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #007bff;">
        <div class="card-value">{{ activeTeachers }}</div>
        <div class="card-label">أعضاء هيئة التدريس النشطين</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-value">{{ professorsCount }}</div>
        <div class="card-label">أساتذة</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-value">{{ avgExperience }}</div>
        <div class="card-label">متوسط الخبرة</div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="البحث في هيئة التدريس..." 
          @input="searchTeachers"
        >
        <i class="fas fa-search"></i>
      </div>
      <div class="filters">
        <select v-model="departmentFilter" @change="filterTeachers">
          <option value="">جميع التخصصات</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
        <select v-model="qualificationFilter" @change="filterTeachers">
          <option value="">جميع الرتب</option>
          <option value="أستاذ">أستاذ</option>
          <option value="أستاذ مشارك">أستاذ مشارك</option>
          <option value="أستاذ مساعد">أستاذ مساعد</option>
          <option value="محاضر">محاضر</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل بيانات هيئة التدريس...</p>
    </div>

    <!-- Teachers Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الرتبة العلمية</th>
            <th>التخصص</th>
            <th>الخبرة</th>
            <th>البريد الإلكتروني</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in paginatedTeachers" :key="teacher.id">
            <td>{{ teacher.name }}</td>
            <td>{{ teacher.qualification || 'غير محدد' }}</td>
            <td>{{ getDepartmentName(teacher.department_id) }}</td>
            <td>{{ teacher.years_experience ? `${teacher.years_experience} سنوات` : 'غير محدد' }}</td>
            <td>{{ teacher.email || 'غير محدد' }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-view" @click="viewTeacherProfile(teacher)" title="عرض الملف الشخصي">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" @click="editTeacher(teacher)" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" @click="deleteTeacher(teacher.id)" title="حذف">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="btn-page"
      >
        السابق
      </button>
      
      <button 
        v-for="page in visiblePages" 
        :key="page"
        @click="changePage(page)"
        :class="['btn-page', { active: page === currentPage }]"
      >
        {{ page }}
      </button>
      
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="btn-page"
      >
        التالي
      </button>
    </div>

    <!-- Add/Edit Teacher Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingTeacher ? 'تعديل عضو هيئة التدريس' : 'إضافة عضو هيئة تدريس جديد' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Step Indicators -->
          <div class="step-indicator">
            <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
              <div class="step-number">1</div>
              <div class="step-title">المعلومات الشخصية</div>
            </div>
            <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
              <div class="step-number">2</div>
              <div class="step-title">الراتب والساعات</div>
            </div>
            <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
              <div class="step-number">3</div>
              <div class="step-title">الجدول الأسبوعي</div>
            </div>
          </div>

          <form @submit.prevent="submitTeacher">
            <!-- Step 1: Personal Information -->
            <div v-show="currentStep === 1" class="form-step">
              <h3 class="step-heading">المعلومات الشخصية</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label>الاسم الكامل *</label>
                  <input 
                    type="text" 
                    v-model="teacherForm.name" 
                    class="form-control" 
                    required
                    placeholder="الاسم الكامل"
                  >
                </div>
                <div class="form-group">
                  <label>الاسم بالإنجليزية</label>
                  <input 
                    type="text" 
                    v-model="teacherForm.name_en" 
                    class="form-control"
                    placeholder="Full Name in English"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>التخصص *</label>
                  <select v-model="teacherForm.department_id" class="form-control" required>
                    <option value="">اختر التخصص</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                      {{ dept.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>المؤهل العلمي *</label>
                  <select v-model="teacherForm.education_level" class="form-control" required>
                    <option value="">اختر المؤهل العلمي</option>
                    <option value="دكتوراه">دكتوراه (PhD)</option>
                    <option value="ماجستير">ماجستير (Masters)</option>
                    <option value="بكالوريوس">بكالوريوس (Bachelor)</option>
                    <option value="دبلوم عالي">دبلوم عالي</option>
                    <option value="دبلوم">دبلوم</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>الرتبة العلمية *</label>
                  <select v-model="teacherForm.qualification" class="form-control" required>
                    <option value="">اختر الرتبة</option>
                    <option value="أستاذ">أستاذ</option>
                    <option value="أستاذ مشارك">أستاذ مشارك</option>
                    <option value="أستاذ مساعد">أستاذ مساعد</option>
                    <option value="محاضر">محاضر</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>سنوات الخبرة *</label>
                  <input 
                    type="number" 
                    v-model="teacherForm.years_experience" 
                    class="form-control" 
                    min="0" 
                    max="50"
                    required
                    placeholder="عدد سنوات الخبرة"
                  >
                </div>
              </div>

              <div class="form-group">
                <label>التخصصات الدقيقة *</label>
                <div class="specializations-container">
                  <div class="selected-specializations" v-if="teacherForm.specializations.length > 0">
                    <div class="specialization-tag" v-for="(spec, index) in teacherForm.specializations" :key="index">
                      {{ spec }}
                      <button type="button" class="remove-spec" @click="removeSpecialization(index)">&times;</button>
                    </div>
                  </div>
                  <div class="add-specialization">
                    <select v-model="selectedSpecialization" class="form-control" @change="addSpecialization">
                      <option value="">اختر تخصص دقيق لإضافته</option>
                      <option v-for="subject in availableSubjects" :key="subject.id" :value="subject.name">
                        {{ subject.name }} ({{ subject.code }})
                      </option>
                    </select>
                  </div>
                  <small class="form-text">يمكن اختيار عدة تخصصات دقيقة</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    v-model="teacherForm.email" 
                    class="form-control"
                    placeholder="البريد الإلكتروني"
                  >
                </div>
                <div class="form-group">
                  <label>رقم الهاتف *</label>
                  <input 
                    type="tel" 
                    v-model="teacherForm.phone" 
                    class="form-control"
                    required
                    placeholder="رقم الهاتف"
                  >
                </div>
              </div>
            </div>

            <!-- Step 2: Salary and Hours -->
            <div v-show="currentStep === 2" class="form-step">
              <h3 class="step-heading">معلومات الراتب والساعات</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label>الراتب الأساسي *</label>
                  <input 
                    type="number" 
                    v-model="teacherForm.basic_salary" 
                    class="form-control" 
                    min="0" 
                    step="0.01"
                    required
                    placeholder="الراتب الأساسي بالدينار الليبي"
                  >
                </div>
                <div class="form-group">
                  <label>معدل الساعة الإضافية</label>
                  <input 
                    type="number" 
                    v-model="teacherForm.hourly_rate" 
                    class="form-control" 
                    min="0" 
                    step="0.01"
                    placeholder="معدل الساعة الإضافية"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>ساعات التدريس الأسبوعية المطلوبة *</label>
                  <input 
                    type="number" 
                    v-model="teacherForm.teaching_hours" 
                    class="form-control" 
                    min="1" 
                    max="40"
                    required
                    placeholder="عدد الساعات الأسبوعية"
                  >
                  <small class="form-text">الحد الأقصى 40 ساعة أسبوعياً</small>
                </div>
                <div class="form-group">
                  <label>نوع العقد</label>
                  <select v-model="teacherForm.contract_type" class="form-control">
                    <option value="">اختر نوع العقد</option>
                    <option value="دوام كامل">دوام كامل</option>
                    <option value="دوام جزئي">دوام جزئي</option>
                    <option value="بالساعة">بالساعة</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 3: Weekly Availability -->
            <div v-show="currentStep === 3" class="form-step">
              <h3 class="step-heading">الجدول الأسبوعي والتوفر</h3>
              
              <div class="availability-calendar">
                <div class="calendar-header">
                  <div class="time-slot">الوقت</div>
                  <div class="day-header" v-for="day in workDays" :key="day.key">
                    {{ day.name }}
                  </div>
                </div>
                
                <div class="calendar-body">
                  <div class="time-row" v-for="slot in timeSlots" :key="slot.key">
                    <div class="time-label">{{ slot.label }}</div>
                    <div class="day-cell" v-for="day in workDays" :key="day.key">
                      <input 
                        type="checkbox" 
                        :id="`${day.key}-${slot.key}`"
                        v-model="teacherForm.availability[day.key][slot.key]"
                        class="availability-checkbox"
                      >
                      <label :for="`${day.key}-${slot.key}`" class="availability-label">
                        <span class="checkmark"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="availability-summary">
                <h4>ملخص التوفر</h4>
                <p>إجمالي الساعات المتاحة: <strong>{{ totalAvailableHours }}</strong> ساعة أسبوعياً</p>
                <p class="form-text">يرجى تحديد الأوقات المتاحة للتدريس (كل خانة تمثل ساعتين)</p>
              </div>
            </div>

            <div class="form-navigation">
              <div class="nav-left">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  إلغاء
                </button>
                <button 
                  v-if="currentStep > 1" 
                  type="button" 
                  class="btn btn-outline-primary" 
                  @click="previousStep"
                >
                  السابق
                </button>
              </div>
              <div class="nav-right">
                <button 
                  v-if="currentStep < 3" 
                  type="button" 
                  class="btn btn-primary" 
                  @click="nextStep"
                  :disabled="!canProceedToNextStep"
                >
                  التالي
                </button>
                <button 
                  v-if="currentStep === 3" 
                  type="submit" 
                  class="btn btn-success" 
                  :disabled="submitting || !isFormValid"
                >
                  {{ submitting ? 'جاري الحفظ...' : (editingTeacher ? 'تحديث' : 'إضافة') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Teacher Profile Modal -->
    <div class="modal" :class="{ show: showProfileModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">الملف الشخصي لعضو هيئة التدريس</h2>
          <button class="modal-close" @click="closeProfileModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedTeacher" class="teacher-profile">
            <div class="profile-header">
              <div class="profile-info">
                <h3>{{ selectedTeacher.name }}</h3>
                <p><strong>الرتبة العلمية:</strong> {{ selectedTeacher.qualification || 'غير محدد' }}</p>
                <p><strong>التخصص:</strong> {{ getDepartmentName(selectedTeacher.department_id) }}</p>
                <p><strong>سنوات الخبرة:</strong> {{ selectedTeacher.years_experience ? `${selectedTeacher.years_experience} سنوات` : 'غير محدد' }}</p>
              </div>
            </div>
            
            <div class="detail-sections">
              <div class="detail-section">
                <h4>معلومات الاتصال</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">البريد الإلكتروني:</span>
                    <span>{{ selectedTeacher.email || 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">رقم الهاتف:</span>
                    <span>{{ selectedTeacher.phone || 'غير محدد' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>المعلومات المهنية</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">التخصص الدقيق:</span>
                    <span>{{ selectedTeacher.specialization || 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">ساعات التدريس:</span>
                    <span>{{ selectedTeacher.teaching_hours ? `${selectedTeacher.teaching_hours} ساعة/أسبوع` : 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">معدل الساعة:</span>
                    <span>{{ selectedTeacher.hourly_rate ? `${selectedTeacher.hourly_rate} ريال` : 'غير محدد' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../../supabase'

export default {
  name: 'Teachers',
  setup() {
    // Reactive data
    const teachers = ref([])
    const departments = ref([])
    const subjects = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const showModal = ref(false)
    const showProfileModal = ref(false)
    const editingTeacher = ref(null)
    const selectedTeacher = ref(null)
    const currentPage = ref(1)
    const teachersPerPage = ref(10)
    const currentStep = ref(1)
    
    // Filters
    const searchTerm = ref('')
    const departmentFilter = ref('')
    const qualificationFilter = ref('')
    
    // Form data
    const teacherForm = ref({
      name: '',
      name_en: '',
      department_id: '',
      email: '',
      phone: '',
      qualification: '',
      education_level: '',
      specialization: '',
      years_experience: null,
      availability: {
        sunday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
        monday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
        tuesday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
        wednesday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
        thursday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false }
      },
      specializations: [],
      teaching_hours: null,
      hourly_rate: null,
      basic_salary: null,
      contract_type: ''
    })

    // Additional reactive data for specializations
    const selectedSpecialization = ref('')

    // Computed properties
    const filteredTeachers = computed(() => {
      let filtered = teachers.value

      // Search filter
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(teacher => 
          teacher.name.toLowerCase().includes(term) ||
          (teacher.name_en && teacher.name_en.toLowerCase().includes(term)) ||
          (teacher.qualification && teacher.qualification.toLowerCase().includes(term))
        )
      }

      // Department filter
      if (departmentFilter.value) {
        filtered = filtered.filter(teacher => teacher.department_id === departmentFilter.value)
      }

      // Qualification filter
      if (qualificationFilter.value) {
        filtered = filtered.filter(teacher => teacher.qualification === qualificationFilter.value)
      }

      return filtered
    })

    const totalTeachers = computed(() => teachers.value.length)
    const activeTeachers = computed(() => teachers.value.length) // All teachers are considered active
    const professorsCount = computed(() => teachers.value.filter(t => t.qualification === 'أستاذ').length)
    const avgExperience = computed(() => {
      const teachersWithExperience = teachers.value.filter(t => t.years_experience)
      if (teachersWithExperience.length === 0) return 0
      const total = teachersWithExperience.reduce((sum, t) => sum + t.years_experience, 0)
      return Math.round(total / teachersWithExperience.length)
    })

    // Multi-step form computed properties
    const availableSubjects = computed(() => {
      if (!teacherForm.value.department_id) return []
      return subjects.value.filter(s => s.department_id === teacherForm.value.department_id)
    })

    const workDays = ref([
      { key: 'sunday', name: 'الأحد' },
      { key: 'monday', name: 'الاثنين' },
      { key: 'tuesday', name: 'الثلاثاء' },
      { key: 'wednesday', name: 'الأربعاء' },
      { key: 'thursday', name: 'الخميس' }
    ])

    const timeSlots = ref([
      { key: 'slot1', label: '08:00 - 10:00' },
      { key: 'slot2', label: '10:00 - 12:00' },
      { key: 'slot3', label: '12:00 - 14:00' },
      { key: 'slot4', label: '14:00 - 16:00' },
      { key: 'slot5', label: '16:00 - 18:00' }
    ])

    const totalAvailableHours = computed(() => {
      let total = 0
      Object.keys(teacherForm.value.availability).forEach(day => {
        Object.keys(teacherForm.value.availability[day]).forEach(slot => {
          if (teacherForm.value.availability[day][slot]) {
            total += 2 // Each slot is 2 hours
          }
        })
      })
      return total
    })

    const canProceedToNextStep = computed(() => {
      if (currentStep.value === 1) {
        return teacherForm.value.name && 
               teacherForm.value.department_id && 
               teacherForm.value.qualification &&
               teacherForm.value.education_level &&
               teacherForm.value.specializations.length > 0 &&
               teacherForm.value.years_experience &&
               teacherForm.value.phone
      }
      if (currentStep.value === 2) {
        return teacherForm.value.basic_salary && 
               teacherForm.value.teaching_hours
      }
      return true
    })

    const isFormValid = computed(() => {
      return canProceedToNextStep.value && totalAvailableHours.value >= teacherForm.value.teaching_hours
    })

    const totalPages = computed(() => Math.ceil(filteredTeachers.value.length / teachersPerPage.value))
    const paginatedTeachers = computed(() => {
      const start = (currentPage.value - 1) * teachersPerPage.value
      const end = start + teachersPerPage.value
      return filteredTeachers.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // Methods
    const loadTeachers = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        teachers.value = data || []
      } catch (error) {
        console.error('Error loading teachers:', error)
        alert('خطأ في تحميل بيانات هيئة التدريس')
      } finally {
        loading.value = false
      }
    }

    const loadDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name')

        if (error) throw error
        departments.value = data || []
      } catch (error) {
        console.error('Error loading departments:', error)
      }
    }

    const loadSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name')

        if (error) throw error
        subjects.value = data || []
      } catch (error) {
        console.error('Error loading subjects:', error)
      }
    }

    const getDepartmentName = (departmentId) => {
      if (!departmentId) return 'غير محدد'
      const dept = departments.value.find(d => d.id === departmentId)
      return dept ? dept.name : 'غير محدد'
    }

    const showAddTeacherModal = () => {
      editingTeacher.value = null
      currentStep.value = 1
      resetForm()
      showModal.value = true
    }

    const editTeacher = (teacher) => {
      editingTeacher.value = teacher
      currentStep.value = 1
      teacherForm.value = { 
        ...teacher,
        availability: teacher.availability || {
          sunday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
          monday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
          tuesday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
          wednesday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
          thursday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false }
        }
      }
      showModal.value = true
    }

    const viewTeacherProfile = (teacher) => {
      selectedTeacher.value = teacher
      showProfileModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingTeacher.value = null
      currentStep.value = 1
      resetForm()
    }

    const closeProfileModal = () => {
      showProfileModal.value = false
      selectedTeacher.value = null
    }

    const resetForm = () => {
      teacherForm.value = {
        name: '',
        name_en: '',
        department_id: '',
        email: '',
        phone: '',
        qualification: '',
        education_level: '',
        specialization: '',
        years_experience: null,
        availability: {
          sunday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
          monday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
          tuesday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
          wednesday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false },
          thursday: { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false }
        },
        specializations: [],
        teaching_hours: null,
        hourly_rate: null,
        basic_salary: null,
        contract_type: ''
      }
      selectedSpecialization.value = ''
    }

    // Methods for handling multiple specializations
    const addSpecialization = () => {
      if (selectedSpecialization.value && !teacherForm.value.specializations.includes(selectedSpecialization.value)) {
        teacherForm.value.specializations.push(selectedSpecialization.value)
        selectedSpecialization.value = ''
      }
    }

    const removeSpecialization = (index) => {
      teacherForm.value.specializations.splice(index, 1)
    }

    const submitTeacher = async () => {
      submitting.value = true
      try {
        if (editingTeacher.value) {
          // Update existing teacher
          const updateData = {
            name: teacherForm.value.name,
            name_en: teacherForm.value.name_en || null,
            department_id: teacherForm.value.department_id || null,
            email: teacherForm.value.email || null,
            phone: teacherForm.value.phone || null,
            qualification: teacherForm.value.qualification || null,
            education_level: teacherForm.value.education_level || null,
            specialization: teacherForm.value.specialization || null,
            years_experience: teacherForm.value.years_experience || null,
            availability: teacherForm.value.availability || null,
            specializations: teacherForm.value.specializations || null,
            teaching_hours: teacherForm.value.teaching_hours || null,
            hourly_rate: teacherForm.value.hourly_rate || null,
            basic_salary: teacherForm.value.basic_salary || null
          }
          
          console.log('Updating teacher data:', updateData)
          
          const { error } = await supabase
            .from('teachers')
            .update(updateData)
            .eq('id', editingTeacher.value.id)

          if (error) throw error
          alert('تم تحديث المدرس بنجاح')
        } else {
          // Create new teacher - generate a unique ID
          const newTeacherData = {
            id: `TCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: teacherForm.value.name,
            name_en: teacherForm.value.name_en || null,
            department_id: teacherForm.value.department_id || null,
            email: teacherForm.value.email || null,
            phone: teacherForm.value.phone || null,
            qualification: teacherForm.value.qualification || null,
            education_level: teacherForm.value.education_level || null,
            specialization: teacherForm.value.specialization || null,
            years_experience: teacherForm.value.years_experience || null,
            availability: teacherForm.value.availability || null,
            specializations: teacherForm.value.specializations || null,
            teaching_hours: teacherForm.value.teaching_hours || null,
            hourly_rate: teacherForm.value.hourly_rate || null,
            basic_salary: teacherForm.value.basic_salary || null
          }
          
          console.log('Sending teacher data:', newTeacherData)
          
          const { error } = await supabase
            .from('teachers')
            .insert(newTeacherData)

          if (error) throw error
          alert('تم إضافة المدرس بنجاح')
        }

        closeModal()
        await loadTeachers()
      } catch (error) {
        console.error('Error saving teacher:', error)
        alert('خطأ في حفظ بيانات المدرس')
      } finally {
        submitting.value = false
      }
    }

    const deleteTeacher = async (teacherId) => {
      if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return

      try {
        const { error } = await supabase
          .from('teachers')
          .delete()
          .eq('id', teacherId)

        if (error) throw error
        alert('تم حذف عضو هيئة التدريس بنجاح')
        await loadTeachers()
      } catch (error) {
        console.error('Error deleting teacher:', error)
        alert('خطأ في حذف عضو هيئة التدريس')
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const searchTeachers = () => {
      currentPage.value = 1
    }

    const filterTeachers = () => {
      currentPage.value = 1
    }

    const exportTeachers = () => {
      // TODO: Implement export functionality
      alert('سيتم تنفيذ هذه الميزة قريباً')
    }

    // Multi-step navigation
    const nextStep = () => {
      if (currentStep.value < 3 && canProceedToNextStep.value) {
        currentStep.value++
      }
    }

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    // Watchers
    watch([searchTerm, departmentFilter, qualificationFilter], () => {
      currentPage.value = 1
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([loadTeachers(), loadDepartments(), loadSubjects()])
    })

    return {
      // Data
      teachers,
      departments,
      subjects,
      loading,
      submitting,
      showModal,
      showProfileModal,
      editingTeacher,
      selectedTeacher,
      currentPage,
      teachersPerPage,
      currentStep,
      
      // Filters
      searchTerm,
      departmentFilter,
      qualificationFilter,
      
      // Form
      teacherForm,
      
      // Computed
      filteredTeachers,
      totalTeachers,
      activeTeachers,
      professorsCount,
      avgExperience,
      totalPages,
      paginatedTeachers,
      visiblePages,
      
      // Multi-step form
      availableSubjects,
      workDays,
      timeSlots,
      totalAvailableHours,
      canProceedToNextStep,
      isFormValid,
      nextStep,
      previousStep,
      
      // Specializations
      selectedSpecialization,
      addSpecialization,
      removeSpecialization,
      
      // Methods
      loadTeachers,
      loadDepartments,
      loadSubjects,
      getDepartmentName,
      showAddTeacherModal,
      editTeacher,
      viewTeacherProfile,
      closeModal,
      closeProfileModal,
      submitTeacher,
      deleteTeacher,
      changePage,
      searchTeachers,
      filterTeachers,
      exportTeachers
    }
  }
}
</script>

<style scoped>
/* Component-specific styles */
.teachers-page {
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

.teacher-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.teacher-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Modal styles */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  margin: auto;
  padding: 0;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.modal-close:hover {
  color: #dc3545;
  background-color: #f8f9fa;
}

.modal-body {
  padding: 2rem;
}

/* Step indicator styles */
.step-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 150px;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  right: -50%;
  width: 100%;
  height: 2px;
  background-color: #e9ecef;
  z-index: 1;
  transition: background-color 0.3s ease;
}

.step.active:not(:last-child)::after,
.step.completed:not(:last-child)::after {
  background-color: #28a745;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.step.active .step-number,
.step.completed .step-number {
  background-color: #28a745;
  color: white;
  transform: scale(1.1);
}

.step-title {
  font-size: 0.875rem;
  color: #6c757d;
  text-align: center;
  font-weight: 500;
}

.step.active .step-title,
.step.completed .step-title {
  color: #28a745;
  font-weight: 600;
}

/* Availability Calendar Styles */
.availability-calendar {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.calendar-header {
  display: grid;
  grid-template-columns: 120px repeat(5, 1fr);
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.time-slot,
.day-header {
  padding: 0.75rem;
  font-weight: 600;
  text-align: center;
  border-right: 1px solid #e9ecef;
}

.time-slot {
  background-color: #e9ecef;
}

.calendar-body {
  display: flex;
  flex-direction: column;
}

.time-row {
  display: grid;
  grid-template-columns: 120px repeat(5, 1fr);
  border-bottom: 1px solid #f0f0f0;
}

.time-row:last-child {
  border-bottom: none;
}

.time-label {
  padding: 1rem 0.75rem;
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
  font-weight: 500;
  text-align: center;
  font-size: 0.875rem;
}

.day-cell {
  padding: 1rem;
  border-right: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.day-cell:last-child {
  border-right: none;
}

.availability-checkbox {
  display: none;
}

.availability-label {
  width: 30px;
  height: 30px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.availability-label:hover {
  border-color: #28a745;
  background-color: #f8fff9;
}

.availability-checkbox:checked + .availability-label {
  background-color: #28a745;
  border-color: #28a745;
}

.checkmark {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.availability-checkbox:checked + .availability-label .checkmark {
  opacity: 1;
}

.availability-summary {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.availability-summary h4 {
  margin: 0 0 1rem 0;
  color: #28a745;
  font-size: 1.1rem;
}

.availability-summary p {
  margin: 0.5rem 0;
}

/* Form Navigation Styles */
.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.nav-left,
.nav-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-outline-primary {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline-primary:hover {
  background: #007bff;
  color: white;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form step styles */
.form-step {
  display: block;
}

/* Specializations styles */
.specializations-container {
  margin-top: 0.5rem;
}

.selected-specializations {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.specialization-tag {
  display: inline-flex;
  align-items: center;
  background-color: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.remove-spec {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-spec:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.add-specialization {
  margin-bottom: 0.5rem;
}

.step-heading {
  font-size: 1.25rem;
  font-weight: 600;
  color: #28a745;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

/* Form styles */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.15s ease;
}

.form-control:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* Form navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .detail-grid {
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

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #28a745;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.btn-page.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  background: white;
}

.btn-view {
  color: #6c757d;
  border-color: #dee2e6;
}

.btn-edit {
  color: #6c757d;
  border-color: #dee2e6;
}

.btn-delete {
  color: #6c757d;
  border-color: #dee2e6;
}

.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn-view:hover {
  background: #f8f9fa;
  color: #0d6efd;
  border-color: #0d6efd;
}

.btn-edit:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #adb5bd;
}

.btn-delete:hover {
  background: #f8f9fa;
  color: #dc3545;
  border-color: #dc3545;
}

/* Teacher Profile */
.teacher-profile {
  padding: 1rem 0;
}

.profile-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.profile-info h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.profile-info p {
  margin: 0.5rem 0;
  color: #666;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section h4 {
  color: #28a745;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.detail-label {
  font-weight: 600;
  color: #333;
}
</style>
