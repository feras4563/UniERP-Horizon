<template>
  <div class="subjects-page">
    <div class="content-header">
      <h1>المقررات الدراسية</h1>
      <div class="header-actions">
        <button class="btn btn-success" @click="showAddSubjectModal">
          <i class="fas fa-plus"></i>
          إضافة مقرر جديد
        </button>
        <button class="btn btn-secondary" @click="exportSubjects">
          <i class="fas fa-download"></i>
          تصدير البيانات
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-value">{{ totalSubjects }}</div>
        <div class="card-label">إجمالي المقررات</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #007bff;">
        <div class="card-value">{{ totalSubjects }}</div>
        <div class="card-label">المقررات النشطة</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-value">{{ totalCredits }}</div>
        <div class="card-label">إجمالي الساعات المعتمدة</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-value">{{ avgCredits }}</div>
        <div class="card-label">متوسط الساعات المعتمدة</div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="البحث في المقررات..." 
          @input="searchSubjects"
        >
        <i class="fas fa-search"></i>
      </div>
      <div class="filters">
        <select v-model="departmentFilter" @change="filterSubjects">
          <option value="">جميع التخصصات</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
        <select v-model="semesterFilter" @change="filterSubjects">
          <option value="">جميع الفصول</option>
          <option value="الفصل الأول">الفصل الأول</option>
          <option value="الفصل الثاني">الفصل الثاني</option>
          <option value="الفصل الصيفي">الفصل الصيفي</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل بيانات المقررات...</p>
    </div>

    <!-- Subjects Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>رمز المقرر</th>
            <th>اسم المقرر</th>
            <th>التخصص</th>
            <th>الساعات المعتمدة</th>
            <th>الفصل</th>
            <th>المدرس</th>
            <th>الحد الأقصى للطلاب</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in paginatedSubjects" :key="subject.id">
            <td>{{ subject.code }}</td>
            <td>{{ subject.name }}</td>
            <td>{{ getDepartmentName(subject.department_id) }}</td>
            <td>{{ subject.credits || 'غير محدد' }}</td>
            <td>{{ subject.semester || 'غير محدد' }}</td>
            <td>{{ getTeacherName(subject.teacher_id) }}</td>
            <td>{{ subject.max_students || 'غير محدد' }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-view" @click="viewSubjectDetails(subject)" title="عرض التفاصيل">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" @click="editSubject(subject)" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" @click="deleteSubject(subject.id)" title="حذف">
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

    <!-- Add/Edit Subject Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingSubject ? 'تعديل المقرر' : 'إضافة مقرر جديد' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitSubject">
            <div class="form-row">
              <div class="form-group">
                <label>رمز المقرر *</label>
                <input 
                  type="text" 
                  v-model="subjectForm.code" 
                  class="form-control" 
                  required
                >
              </div>
              <div class="form-group">
                <label>اسم المقرر *</label>
                <input 
                  type="text" 
                  v-model="subjectForm.name" 
                  class="form-control" 
                  required
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>اسم المقرر بالإنجليزية</label>
                <input 
                  type="text" 
                  v-model="subjectForm.name_en" 
                  class="form-control"
                >
              </div>
              <div class="form-group">
                <label>التخصص *</label>
                <select v-model="subjectForm.department_id" class="form-control" required>
                  <option value="">اختر التخصص</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>الساعات المعتمدة</label>
                <input 
                  type="number" 
                  v-model="subjectForm.credits" 
                  class="form-control" 
                  min="1" 
                  max="6"
                >
              </div>
              <div class="form-group">
                <label>الفصل الدراسي</label>
                <select v-model="subjectForm.semester" class="form-control">
                  <option value="">اختر الفصل</option>
                  <option value="الفصل الأول">الفصل الأول</option>
                  <option value="الفصل الثاني">الفصل الثاني</option>
                  <option value="الفصل الصيفي">الفصل الصيفي</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>المدرس المسؤول</label>
                <select v-model="subjectForm.teacher_id" class="form-control">
                  <option value="">اختر المدرس</option>
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                    {{ teacher.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>الحد الأقصى للطلاب</label>
                <input 
                  type="number" 
                  v-model="subjectForm.max_students" 
                  class="form-control" 
                  min="1" 
                  max="200"
                >
              </div>
            </div>

            <div class="form-navigation">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                إلغاء
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'جاري الحفظ...' : (editingSubject ? 'تحديث' : 'إضافة') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Subject Details Modal -->
    <div class="modal" :class="{ show: showDetailsModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">تفاصيل المقرر</h2>
          <button class="modal-close" @click="closeDetailsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedSubject" class="subject-details">
            <div class="detail-header">
              <h3>{{ selectedSubject.name }}</h3>
              <p><strong>الرمز:</strong> {{ selectedSubject.code }}</p>
              <p><strong>الاسم بالإنجليزية:</strong> {{ selectedSubject.name_en || 'غير محدد' }}</p>
              <p><strong>التخصص:</strong> {{ getDepartmentName(selectedSubject.department_id) }}</p>
              <p><strong>الساعات المعتمدة:</strong> {{ selectedSubject.credits || 'غير محدد' }}</p>
              <p><strong>الفصل:</strong> {{ selectedSubject.semester || 'غير محدد' }}</p>
              <p><strong>المدرس:</strong> {{ getTeacherName(selectedSubject.teacher_id) }}</p>
              <p><strong>الحد الأقصى للطلاب:</strong> {{ selectedSubject.max_students || 'غير محدد' }}</p>
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
  name: 'Subjects',
  setup() {
    // Reactive data
    const subjects = ref([])
    const departments = ref([])
    const teachers = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const showModal = ref(false)
    const showDetailsModal = ref(false)
    const editingSubject = ref(null)
    const selectedSubject = ref(null)
    const currentPage = ref(1)
    const subjectsPerPage = ref(10)
    
    // Filters
    const searchTerm = ref('')
    const departmentFilter = ref('')
    const semesterFilter = ref('')
    
    // Form data
    const subjectForm = ref({
      code: '',
      name: '',
      name_en: '',
      department_id: '',
      credits: null,
      teacher_id: '',
      semester: '',
      max_students: null
    })

    // Computed properties
    const filteredSubjects = computed(() => {
      let filtered = subjects.value

      // Search filter
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(subject => 
          subject.name.toLowerCase().includes(term) ||
          (subject.name_en && subject.name_en.toLowerCase().includes(term)) ||
          (subject.code && subject.code.toLowerCase().includes(term))
        )
      }

      // Department filter
      if (departmentFilter.value) {
        filtered = filtered.filter(subject => subject.department_id === departmentFilter.value)
      }

      // Semester filter
      if (semesterFilter.value) {
        filtered = filtered.filter(subject => subject.semester === semesterFilter.value)
      }

      return filtered
    })

    const totalSubjects = computed(() => subjects.value.length)
    const activeSubjects = computed(() => subjects.value.length) // All subjects are considered active
    const totalCredits = computed(() => subjects.value.reduce((sum, s) => sum + (s.credits || 0), 0))
    const avgCredits = computed(() => {
      const subjectsWithCredits = subjects.value.filter(s => s.credits)
      if (subjectsWithCredits.length === 0) return 0
      return Math.round(totalCredits.value / subjectsWithCredits.length)
    })

    const totalPages = computed(() => Math.ceil(filteredSubjects.value.length / subjectsPerPage.value))
    const paginatedSubjects = computed(() => {
      const start = (currentPage.value - 1) * subjectsPerPage.value
      const end = start + subjectsPerPage.value
      return filteredSubjects.value.slice(start, end)
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
    const loadSubjects = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name')

        if (error) throw error
        subjects.value = data || []
      } catch (error) {
        console.error('Error loading subjects:', error)
        alert('خطأ في تحميل بيانات المقررات')
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

    const loadTeachers = async () => {
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .order('name')

        if (error) throw error
        teachers.value = data || []
      } catch (error) {
        console.error('Error loading teachers:', error)
      }
    }

    const getDepartmentName = (departmentId) => {
      if (!departmentId) return 'غير محدد'
      const dept = departments.value.find(d => d.id === departmentId)
      return dept ? dept.name : 'غير محدد'
    }

    const getTeacherName = (teacherId) => {
      if (!teacherId) return 'غير محدد'
      const teacher = teachers.value.find(t => t.id === teacherId)
      return teacher ? teacher.name : 'غير محدد'
    }

    const showAddSubjectModal = () => {
      editingSubject.value = null
      resetForm()
      showModal.value = true
    }

    const editSubject = (subject) => {
      editingSubject.value = subject
      subjectForm.value = { ...subject }
      showModal.value = true
    }

    const viewSubjectDetails = (subject) => {
      selectedSubject.value = subject
      showDetailsModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingSubject.value = null
      resetForm()
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedSubject.value = null
    }

    const resetForm = () => {
      subjectForm.value = {
        code: '',
        name: '',
        name_en: '',
        department_id: '',
        credits: null,
        teacher_id: '',
        semester: '',
        max_students: null
      }
    }

    const submitSubject = async () => {
      submitting.value = true
      try {
        if (editingSubject.value) {
          // Update existing subject
          const updateData = {
            code: subjectForm.value.code,
            name: subjectForm.value.name,
            name_en: subjectForm.value.name_en || null,
            department_id: subjectForm.value.department_id || null,
            credits: subjectForm.value.credits || null,
            teacher_id: subjectForm.value.teacher_id || null,
            semester: subjectForm.value.semester || null,
            max_students: subjectForm.value.max_students || null
          }
          
          const { error } = await supabase
            .from('subjects')
            .update(updateData)
            .eq('id', editingSubject.value.id)

          if (error) throw error
          alert('تم تحديث المقرر بنجاح')
        } else {
          // Create new subject - generate a unique ID
          const newSubjectData = {
            id: `SUBJ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            code: subjectForm.value.code,
            name: subjectForm.value.name,
            name_en: subjectForm.value.name_en || null,
            department_id: subjectForm.value.department_id || null,
            credits: subjectForm.value.credits || null,
            teacher_id: subjectForm.value.teacher_id || null,
            semester: subjectForm.value.semester || null,
            max_students: subjectForm.value.max_students || null
          }
          
          const { error } = await supabase
            .from('subjects')
            .insert(newSubjectData)

          if (error) throw error
          alert('تم إضافة المقرر بنجاح')
        }

        closeModal()
        await loadSubjects()
      } catch (error) {
        console.error('Error saving subject:', error)
        alert('خطأ في حفظ بيانات المقرر')
      } finally {
        submitting.value = false
      }
    }

    const deleteSubject = async (subjectId) => {
      if (!confirm('هل أنت متأكد من حذف هذا المقرر؟')) return

      try {
        const { error } = await supabase
          .from('subjects')
          .delete()
          .eq('id', subjectId)

        if (error) throw error
        alert('تم حذف المقرر بنجاح')
        await loadSubjects()
      } catch (error) {
        console.error('Error deleting subject:', error)
        alert('خطأ في حذف المقرر')
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const searchSubjects = () => {
      currentPage.value = 1
    }

    const filterSubjects = () => {
      currentPage.value = 1
    }

    const exportSubjects = () => {
      // TODO: Implement export functionality
      alert('سيتم تنفيذ هذه الميزة قريباً')
    }

    // Watchers
    watch([searchTerm, departmentFilter, semesterFilter], () => {
      currentPage.value = 1
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([loadSubjects(), loadDepartments(), loadTeachers()])
    })

    return {
      // Data
      subjects,
      departments,
      teachers,
      loading,
      submitting,
      showModal,
      showDetailsModal,
      editingSubject,
      selectedSubject,
      currentPage,
      subjectsPerPage,
      
      // Filters
      searchTerm,
      departmentFilter,
      semesterFilter,
      
      // Form
      subjectForm,
      
      // Computed
      filteredSubjects,
      totalSubjects,
      activeSubjects,
      totalCredits,
      avgCredits,
      totalPages,
      paginatedSubjects,
      visiblePages,
      
      // Methods
      loadSubjects,
      loadDepartments,
      loadTeachers,
      getDepartmentName,
      getTeacherName,
      showAddSubjectModal,
      editSubject,
      viewSubjectDetails,
      closeModal,
      closeDetailsModal,
      submitSubject,
      deleteSubject,
      changePage,
      searchSubjects,
      filterSubjects,
      exportSubjects
    }
  }
}
</script>

<style scoped>
.subjects-page {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-header h1 {
  margin: 0;
  color: #333;
  font-size: 1.75rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.search-filters {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
}

.search-bar i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filters select {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.card-label {
  color: #6c757d;
  font-size: 0.875rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: right;
  border-bottom: 1px solid #e9ecef;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
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

/* Modal */
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
  display: block;
}

.modal-content {
  background-color: white;
  margin: 5% auto;
  padding: 0;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f8f9fa;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

/* Form */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.25);
}

.form-navigation {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Subject Details */
.subject-details {
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

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
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
