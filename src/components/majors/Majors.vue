<template>
  <div class="majors-page">
    <div class="content-header">
      <h1>التخصصات والمقررات</h1>
      <div class="header-actions">
        <button class="btn btn-success" @click="showAddMajorModal">
          <i class="fas fa-plus"></i>
          إضافة تخصص جديد
        </button>
        <button class="btn btn-secondary" @click="exportMajors">
          <i class="fas fa-download"></i>
          تصدير البيانات
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-value">{{ totalMajors }}</div>
        <div class="card-label">إجمالي التخصصات</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #007bff;">
        <div class="card-value">{{ activeMajors }}</div>
        <div class="card-label">التخصصات النشطة</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-value">{{ inactiveMajors }}</div>
        <div class="card-label">التخصصات غير النشطة</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-value">{{ totalSubjects }}</div>
        <div class="card-label">إجمالي المقررات</div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="البحث في التخصصات..." 
          @input="searchMajors"
        >
        <i class="fas fa-search"></i>
      </div>
      <div class="filters">
        <!-- No filters needed for departments -->
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل بيانات التخصصات...</p>
    </div>

    <!-- Majors Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>رمز التخصص</th>
            <th>اسم التخصص</th>
            <th>الكلية</th>
            <th>عدد المقررات</th>
            <th>عدد الطلاب</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="major in paginatedMajors" :key="major.id">
            <td>{{ major.id }}</td>
            <td>{{ major.name }}</td>
            <td>{{ major.name_en || 'غير محدد' }}</td>
            <td>{{ getSubjectCount(major.id) }}</td>
            <td>{{ getStudentCount(major.id) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-view" @click="viewMajorDetails(major)" title="عرض التفاصيل">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" @click="editMajor(major)" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" @click="deleteMajor(major.id)" title="حذف">
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

    <!-- Add/Edit Major Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingMajor ? 'تعديل التخصص' : 'إضافة تخصص جديد' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitMajor">
            <div class="form-row">
              <div class="form-group">
                <label>اسم التخصص *</label>
                <input 
                  type="text" 
                  v-model="majorForm.name" 
                  class="form-control" 
                  required
                >
              </div>
              <div class="form-group">
                <label>اسم التخصص بالإنجليزية</label>
                <input 
                  type="text" 
                  v-model="majorForm.name_en" 
                  class="form-control"
                >
              </div>
            </div>

            <div class="form-group">
              <label>رئيس القسم</label>
              <input 
                type="text" 
                v-model="majorForm.head" 
                class="form-control"
              >
            </div>

            <div class="form-navigation">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                إلغاء
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'جاري الحفظ...' : (editingMajor ? 'تحديث' : 'إضافة') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Major Details Modal -->
    <div class="modal" :class="{ show: showDetailsModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">تفاصيل التخصص</h2>
          <button class="modal-close" @click="closeDetailsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedMajor" class="major-details">
            <div class="detail-header">
              <h3>{{ selectedMajor.name }}</h3>
              <p><strong>الرمز:</strong> {{ selectedMajor.id }}</p>
              <p><strong>الاسم بالإنجليزية:</strong> {{ selectedMajor.name_en || 'غير محدد' }}</p>
              <p><strong>رئيس القسم:</strong> {{ selectedMajor.head || 'غير محدد' }}</p>
            </div>
            
            <div class="detail-sections">
              <div class="detail-section">
                <h4>المقررات الدراسية</h4>
                <div v-if="majorSubjects.length > 0" class="subjects-list">
                  <div v-for="subject in majorSubjects" :key="subject.id" class="subject-item">
                    <div class="subject-info">
                      <strong>{{ subject.code }}</strong> - {{ subject.name }}
                      <span class="subject-credits">({{ subject.credits }} ساعات معتمدة)</span>
                    </div>
                    <div class="subject-details">
                      <small>الفصل: {{ subject.semester || 'غير محدد' }}</small>
                      <small>الحد الأقصى للطلاب: {{ subject.max_students || 'غير محدد' }}</small>
                    </div>
                  </div>
                </div>
                <div v-else class="no-subjects">
                  <p>لا توجد مقررات لهذا التخصص</p>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>إحصائيات الطلاب</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">إجمالي الطلاب:</span>
                    <span class="stat-value">{{ getStudentCount(selectedMajor.id) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">عدد المقررات:</span>
                    <span class="stat-value">{{ getSubjectCount(selectedMajor.id) }}</span>
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
  name: 'Majors',
  setup() {
    // Reactive data
    const majors = ref([])
    const subjects = ref([])
    const students = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const showModal = ref(false)
    const showDetailsModal = ref(false)
    const editingMajor = ref(null)
    const selectedMajor = ref(null)
    const currentPage = ref(1)
    const majorsPerPage = ref(10)
    
    // Filters
    const searchTerm = ref('')
    
    // Form data
    const majorForm = ref({
      name: '',
      name_en: '',
      head: ''
    })

    // Computed properties
    const filteredMajors = computed(() => {
      let filtered = majors.value

      // Search filter
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(major => 
          major.name.toLowerCase().includes(term) ||
          (major.name_en && major.name_en.toLowerCase().includes(term)) ||
          (major.id && major.id.toLowerCase().includes(term))
        )
      }

      return filtered
    })

    const totalMajors = computed(() => majors.value.length)
    const activeMajors = computed(() => majors.value.length) // All departments are considered active
    const inactiveMajors = computed(() => 0) // No inactive departments
    const totalSubjects = computed(() => subjects.value.length)

    const totalPages = computed(() => Math.ceil(filteredMajors.value.length / majorsPerPage.value))
    const paginatedMajors = computed(() => {
      const start = (currentPage.value - 1) * majorsPerPage.value
      const end = start + majorsPerPage.value
      return filteredMajors.value.slice(start, end)
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

    const majorSubjects = computed(() => {
      if (!selectedMajor.value) return []
      return subjects.value.filter(s => s.department_id === selectedMajor.value.id)
    })

    // Methods
    const loadMajors = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name')

        if (error) throw error
        majors.value = data || []
      } catch (error) {
        console.error('Error loading majors:', error)
        alert('خطأ في تحميل بيانات التخصصات')
      } finally {
        loading.value = false
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

    const loadStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')

        if (error) throw error
        students.value = data || []
      } catch (error) {
        console.error('Error loading students:', error)
      }
    }

    const getSubjectCount = (majorId) => {
      return subjects.value.filter(s => s.department_id === majorId).length
    }

    const getStudentCount = (majorId) => {
      return students.value.filter(s => s.department_id === majorId).length
    }

    const showAddMajorModal = () => {
      editingMajor.value = null
      resetForm()
      showModal.value = true
    }

    const editMajor = (major) => {
      editingMajor.value = major
      majorForm.value = { ...major }
      showModal.value = true
    }

    const viewMajorDetails = (major) => {
      selectedMajor.value = major
      showDetailsModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingMajor.value = null
      resetForm()
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedMajor.value = null
    }

    const resetForm = () => {
      majorForm.value = {
        name: '',
        name_en: '',
        head: ''
      }
    }

    const submitMajor = async () => {
      submitting.value = true
      try {
        if (editingMajor.value) {
          // Update existing major
          const updateData = {
            name: majorForm.value.name,
            name_en: majorForm.value.name_en || null,
            head: majorForm.value.head || null
          }
          
          const { error } = await supabase
            .from('departments')
            .update(updateData)
            .eq('id', editingMajor.value.id)

          if (error) throw error
          alert('تم تحديث التخصص بنجاح')
        } else {
          // Create new major - generate a unique ID and handle required fields
          const newMajorData = {
            id: `DEPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: majorForm.value.name,
            name_en: majorForm.value.name_en || null,
            head: majorForm.value.head || null
          }
          
          const { error } = await supabase
            .from('departments')
            .insert(newMajorData)

          if (error) throw error
          alert('تم إضافة التخصص بنجاح')
        }

        closeModal()
        await loadMajors()
      } catch (error) {
        console.error('Error saving major:', error)
        alert('خطأ في حفظ بيانات التخصص')
      } finally {
        submitting.value = false
      }
    }

    const deleteMajor = async (majorId) => {
      if (!confirm('هل أنت متأكد من حذف هذا التخصص؟')) return

      try {
        const { error } = await supabase
          .from('departments')
          .delete()
          .eq('id', majorId)

        if (error) throw error
        alert('تم حذف التخصص بنجاح')
        await loadMajors()
      } catch (error) {
        console.error('Error deleting major:', error)
        alert('خطأ في حذف التخصص')
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const searchMajors = () => {
      currentPage.value = 1
    }

    const filterMajors = () => {
      currentPage.value = 1
    }

    const exportMajors = () => {
      // TODO: Implement export functionality
      alert('سيتم تنفيذ هذه الميزة قريباً')
    }

    // Watchers
    watch([searchTerm], () => {
      currentPage.value = 1
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([loadMajors(), loadSubjects(), loadStudents()])
    })

    return {
      // Data
      majors,
      subjects,
      students,
      loading,
      submitting,
      showModal,
      showDetailsModal,
      editingMajor,
      selectedMajor,
      currentPage,
      majorsPerPage,
      
      // Filters
      searchTerm,
      
      // Form
      majorForm,
      
      // Computed
      filteredMajors,
      totalMajors,
      activeMajors,
      inactiveMajors,
      totalSubjects,
      totalPages,
      paginatedMajors,
      visiblePages,
      majorSubjects,
      
      // Methods
      loadMajors,
      loadSubjects,
      loadStudents,
      getSubjectCount,
      getStudentCount,
      showAddMajorModal,
      editMajor,
      viewMajorDetails,
      closeModal,
      closeDetailsModal,
      submitMajor,
      deleteMajor,
      changePage,
      searchMajors,
      filterMajors,
      exportMajors
    }
  }
}
</script>

<style scoped>
/* Component-specific styles */
.majors-page {
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

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  margin-left: 0.5rem;
  transform: scale(1.2);
  cursor: pointer;
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

/* Major Details */
.major-details {
  padding: 1rem 0;
}

.detail-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.detail-header h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.detail-header p {
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

.subjects-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subject-item {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.subject-info {
  margin-bottom: 0.5rem;
}

.subject-credits {
  color: #6c757d;
  font-size: 0.875rem;
}

.subject-details {
  display: flex;
  gap: 1rem;
}

.subject-details small {
  color: #6c757d;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.no-subjects {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-label {
  font-weight: 600;
  color: #495057;
}

.stat-value {
  font-weight: 700;
  color: #28a745;
  font-size: 1.1rem;
}
</style>

