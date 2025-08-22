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
          <form @submit.prevent="submitTeacher">
            <div class="form-row">
              <div class="form-group">
                <label>الاسم الكامل *</label>
                <input 
                  type="text" 
                  v-model="teacherForm.name" 
                  class="form-control" 
                  required
                >
              </div>
              <div class="form-group">
                <label>الاسم بالإنجليزية</label>
                <input 
                  type="text" 
                  v-model="teacherForm.name_en" 
                  class="form-control"
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
                <label>الرتبة العلمية</label>
                <select v-model="teacherForm.qualification" class="form-control">
                  <option value="">اختر الرتبة</option>
                  <option value="أستاذ">أستاذ</option>
                  <option value="أستاذ مشارك">أستاذ مشارك</option>
                  <option value="أستاذ مساعد">أستاذ مساعد</option>
                  <option value="محاضر">محاضر</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input 
                  type="email" 
                  v-model="teacherForm.email" 
                  class="form-control"
                >
              </div>
              <div class="form-group">
                <label>رقم الهاتف</label>
                <input 
                  type="tel" 
                  v-model="teacherForm.phone" 
                  class="form-control"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>التخصص الدقيق</label>
                <input 
                  type="text" 
                  v-model="teacherForm.specialization" 
                  class="form-control"
                >
              </div>
              <div class="form-group">
                <label>سنوات الخبرة</label>
                <input 
                  type="number" 
                  v-model="teacherForm.years_experience" 
                  class="form-control" 
                  min="0" 
                  max="50"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>ساعات التدريس الأسبوعية</label>
                <input 
                  type="number" 
                  v-model="teacherForm.teaching_hours" 
                  class="form-control" 
                  min="0" 
                  max="40"
                >
              </div>
              <div class="form-group">
                <label>معدل الساعة</label>
                <input 
                  type="number" 
                  v-model="teacherForm.hourly_rate" 
                  class="form-control" 
                  min="0" 
                  step="0.01"
                >
              </div>
            </div>

            <div class="form-navigation">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                إلغاء
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'جاري الحفظ...' : (editingTeacher ? 'تحديث' : 'إضافة') }}
              </button>
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
    const loading = ref(false)
    const submitting = ref(false)
    const showModal = ref(false)
    const showProfileModal = ref(false)
    const editingTeacher = ref(null)
    const selectedTeacher = ref(null)
    const currentPage = ref(1)
    const teachersPerPage = ref(10)
    
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
      specialization: '',
      years_experience: null,
      availability: null,
      specializations: [],
      teaching_hours: null,
      hourly_rate: null
    })

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

    const getDepartmentName = (departmentId) => {
      if (!departmentId) return 'غير محدد'
      const dept = departments.value.find(d => d.id === departmentId)
      return dept ? dept.name : 'غير محدد'
    }

    const showAddTeacherModal = () => {
      editingTeacher.value = null
      resetForm()
      showModal.value = true
    }

    const editTeacher = (teacher) => {
      editingTeacher.value = teacher
      teacherForm.value = { ...teacher }
      showModal.value = true
    }

    const viewTeacherProfile = (teacher) => {
      selectedTeacher.value = teacher
      showProfileModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingTeacher.value = null
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
        specialization: '',
        years_experience: null,
        availability: null,
        specializations: [],
        teaching_hours: null,
        hourly_rate: null
      }
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
            specialization: teacherForm.value.specialization || null,
            years_experience: teacherForm.value.years_experience || null,
            availability: teacherForm.value.availability || null,
            specializations: teacherForm.value.specializations || null,
            teaching_hours: teacherForm.value.teaching_hours || null,
            hourly_rate: teacherForm.value.hourly_rate || null
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
            specialization: teacherForm.value.specialization || null,
            years_experience: teacherForm.value.years_experience || null,
            availability: teacherForm.value.availability || null,
            specializations: teacherForm.value.specializations || null,
            teaching_hours: teacherForm.value.teaching_hours || null,
            hourly_rate: teacherForm.value.hourly_rate || null
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

    // Watchers
    watch([searchTerm, departmentFilter, qualificationFilter], () => {
      currentPage.value = 1
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([loadTeachers(), loadDepartments()])
    })

    return {
      // Data
      teachers,
      departments,
      loading,
      submitting,
      showModal,
      showProfileModal,
      editingTeacher,
      selectedTeacher,
      currentPage,
      teachersPerPage,
      
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
      
      // Methods
      loadTeachers,
      loadDepartments,
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
}

.step.active:not(:last-child)::after {
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

.step.active .step-number {
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

.step.active .step-title {
  color: #28a745;
  font-weight: 600;
}

/* Form step styles */
.form-step {
  display: none;
}

.form-step.active {
  display: block;
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
