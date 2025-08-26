<template>
  <div class="students-page">
    <div class="content-header">
      <h1>إدارة الطلاب</h1>
      <div class="header-actions">
        <button class="btn-icon btn-primary" @click="showAddStudentModal" title="إضافة طالب جديد">
          <i class="fas fa-plus"></i>
        </button>
        <button class="btn-icon btn-secondary" @click="generateQRForAllStudents" title="إنشاء رموز QR للجميع">
          <i class="fas fa-qrcode"></i>
        </button>
        <button class="btn-icon btn-outline" @click="exportStudents" title="تصدير البيانات">
          <i class="fas fa-download"></i>
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-value">{{ totalStudents }}</div>
        <div class="card-label">إجمالي الطلاب</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #007bff;">
        <div class="card-value">{{ activeStudents }}</div>
        <div class="card-label">الطلاب النشطين</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-value">{{ newStudents }}</div>
        <div class="card-label">طلاب جدد</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-value">{{ graduatingStudents }}</div>
        <div class="card-label">طلاب متوقع تخرجهم</div>
      </div>
      <div class="summary-card" style="border-left: 4px solid #6f42c1;">
        <div class="card-value">{{ studentsWithQR }}</div>
        <div class="card-label">طلاب لديهم رمز QR</div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="البحث في الطلاب..." 
          @input="searchStudents"
        >
        <i class="fas fa-search"></i>
      </div>
      <div class="filters">
        <select v-model="departmentFilter" @change="filterStudents">
          <option value="">جميع التخصصات</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
        <select v-model="yearFilter" @change="filterStudents">
          <option value="">جميع السنوات</option>
          <option value="1">السنة الأولى</option>
          <option value="2">السنة الثانية</option>
          <option value="3">السنة الثالثة</option>
          <option value="4">السنة الرابعة</option>
        </select>
        <select v-model="statusFilter" @change="filterStudents">
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل بيانات الطلاب...</p>
    </div>

    <!-- Students Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>رقم الهوية</th>
            <th>التخصص</th>
            <th>السنة الدراسية</th>
            <th>المعدل</th>
            <th>الحالة</th>
            <th>رمز QR</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in paginatedStudents" :key="student.id">
            <td>{{ student.name }}</td>
            <td>{{ student.national_id_passport || 'غير محدد' }}</td>
            <td>{{ getDepartmentName(student.department_id) }}</td>
            <td>السنة {{ student.year || 'غير محدد' }}</td>
            <td>{{ student.gpa || 'غير محدد' }}</td>
            <td>
              <span class="status-badge" :class="student.status === 'active' ? 'status-active' : 'status-inactive'">
                {{ student.status === 'active' ? 'نشط' : 'غير نشط' }}
              </span>
            </td>
            <td>
              <div class="qr-code-preview">
                <img 
                  v-if="student.qr_code" 
                  :src="student.qr_code" 
                  alt="QR Code" 
                  class="qr-code-thumbnail"
                  @click="viewQRCode(student)"
                  title="انقر لعرض الرمز"
                >
                <span v-else class="no-qr">لا يوجد</span>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-view" @click="viewStudentProfile(student)" title="عرض الملف الشخصي">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" @click="editStudent(student)" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" @click="deleteStudent(student.id)" title="حذف">
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

    <!-- Add/Edit Student Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content multi-page-modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingStudent ? 'تعديل الطالب' : 'إضافة طالب جديد' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        
        <!-- Progress Steps -->
        <div class="form-steps">
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">المعلومات الشخصية</div>
          </div>
          <div class="step-connector" :class="{ active: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">السجل الأكاديمي</div>
          </div>
          <div class="step-connector" :class="{ active: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
            <div class="step-number">3</div>
            <div class="step-label">التسجيل</div>
          </div>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitStudent">
            <!-- Step 1: Personal Information -->
            <div v-if="currentStep === 1" class="form-step">
              <h3 class="step-title">المعلومات الشخصية</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label>الاسم الكامل *</label>
                  <input 
                    type="text" 
                    v-model="studentForm.name" 
                    class="form-control" 
                    required
                    placeholder="أدخل الاسم الكامل"
                  >
                </div>
                <div class="form-group">
                  <label>الاسم بالإنجليزية</label>
                  <input 
                    type="text" 
                    v-model="studentForm.name_en" 
                    class="form-control"
                    placeholder="Enter full name in English"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>الجنس *</label>
                  <select v-model="studentForm.gender" class="form-control" required>
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>الجنسية *</label>
                  <input 
                    type="text" 
                    v-model="studentForm.nationality" 
                    class="form-control"
                    required
                    placeholder="الجنسية"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>تاريخ الميلاد *</label>
                  <input 
                    type="date" 
                    v-model="studentForm.birth_date" 
                    class="form-control"
                    required
                  >
                </div>
                <div class="form-group">
                  <label>رقم الهوية/جواز السفر *</label>
                  <input 
                    type="text" 
                    v-model="studentForm.national_id_passport" 
                    class="form-control"
                    required
                    placeholder="رقم الهوية أو جواز السفر"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    v-model="studentForm.email" 
                    class="form-control"
                    placeholder="البريد الإلكتروني"
                  >
                </div>
                <div class="form-group">
                  <label>رقم الهاتف</label>
                  <input 
                    type="tel" 
                    v-model="studentForm.phone" 
                    class="form-control"
                    placeholder="رقم الهاتف"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>العنوان</label>
                  <textarea 
                    v-model="studentForm.address" 
                    class="form-control"
                    rows="3"
                    placeholder="العنوان الكامل"
                  ></textarea>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>اسم الكفيل</label>
                  <input 
                    type="text" 
                    v-model="studentForm.sponsor_name" 
                    class="form-control"
                    placeholder="اسم الكفيل"
                  >
                </div>
                <div class="form-group">
                  <label>رقم هاتف الكفيل</label>
                  <input 
                    type="tel" 
                    v-model="studentForm.sponsor_contact" 
                    class="form-control"
                    placeholder="رقم هاتف الكفيل"
                  >
                </div>
              </div>
            </div>

            <!-- Step 2: Academic History -->
            <div v-if="currentStep === 2" class="form-step">
              <h3 class="step-title">السجل الأكاديمي</h3>
              
              <div class="form-group">
                <label>نوع التعليم السابق</label>
                <select v-model="studentForm.academic_history_type" class="form-control" @change="onAcademicTypeChange">
                  <option value="">اختر نوع التعليم</option>
                  <option value="ثانوية">ثانوية</option>
                  <option value="بكالوريوس">بكالوريوس</option>
                  <option value="دبلوم">دبلوم</option>
                </select>
              </div>

              <div v-if="studentForm.academic_history_type" class="form-group">
                <label>{{ getScoreLabel() }}</label>
                <input 
                  type="number" 
                  v-model="studentForm.academic_score" 
                  class="form-control" 
                  :step="studentForm.academic_history_type === 'ثانوية' ? '0.1' : '0.01'"
                  :min="0" 
                  :max="studentForm.academic_history_type === 'ثانوية' ? 100 : 4"
                  :placeholder="getScorePlaceholder()"
                >
                <small class="form-text">{{ getScoreHint() }}</small>
              </div>

              <div class="form-group">
                <label>تفاصيل التعليم السابق</label>
                <textarea 
                  v-model="studentForm.academic_history" 
                  class="form-control" 
                  rows="4"
                  placeholder="أدخل تفاصيل التعليم السابق (اسم المؤسسة، التخصص، سنة التخرج، إلخ)"
                ></textarea>
                <small class="form-text">يمكن تركه فارغاً وإضافته لاحقاً</small>
              </div>

              <div class="form-group">
                <label>رفع كشف الدرجات (اختياري)</label>
                <input 
                  type="file" 
                  @change="onTranscriptUpload"
                  class="form-control"
                  accept=".pdf,.jpg,.jpeg,.png"
                >
                <small class="form-text">يمكن رفع ملف PDF أو صورة لكشف الدرجات</small>
                <div v-if="studentForm.transcript_file" class="mt-2">
                  <small class="text-success">✓ تم رفع الملف: {{ getFileName(studentForm.transcript_file) }}</small>
                </div>
              </div>
            </div>

            <!-- Step 3: Enrollment -->
            <div v-if="currentStep === 3" class="form-step">
              <h3 class="step-title">معلومات التسجيل</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label>التخصص *</label>
                  <select v-model="studentForm.department_id" class="form-control" required>
                    <option value="">اختر التخصص</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                      {{ dept.name }} ({{ dept.name_en }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>السنة الدراسية *</label>
                  <select v-model="studentForm.year" class="form-control" required>
                    <option value="">اختر السنة</option>
                    <option value="1">السنة الأولى</option>
                    <option value="2">السنة الثانية</option>
                    <option value="3">السنة الثالثة</option>
                    <option value="4">السنة الرابعة</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>تاريخ التسجيل *</label>
                  <input 
                    type="date" 
                    v-model="studentForm.enrollment_date" 
                    class="form-control"
                    required
                  >
                </div>
                <div class="form-group">
                  <label>حالة الطالب</label>
                  <select v-model="studentForm.status" class="form-control">
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              <!-- Summary Section -->
              <div class="enrollment-summary">
                <h4>ملخص البيانات</h4>
                <div class="summary-grid">
                  <div class="summary-item">
                    <strong>الاسم:</strong> {{ studentForm.name || 'غير محدد' }}
                  </div>
                  <div class="summary-item">
                    <strong>التخصص:</strong> {{ getDepartmentName(studentForm.department_id) }}
                  </div>
                  <div class="summary-item">
                    <strong>السنة:</strong> {{ getYearLabel(studentForm.year) }}
                  </div>
                  <div class="summary-item">
                    <strong>تاريخ التسجيل:</strong> {{ studentForm.enrollment_date || 'غير محدد' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-navigation">
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="closeModal"
              >
                إلغاء
              </button>
              
              <button 
                v-if="currentStep > 1"
                type="button" 
                class="btn btn-outline" 
                @click="previousStep"
              >
                السابق
              </button>
              
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
                {{ submitting ? 'جاري الحفظ...' : (editingStudent ? 'تحديث الطالب' : 'إضافة الطالب') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Student Profile Modal -->
    <div class="modal" :class="{ show: showProfileModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">الملف الشخصي للطالب</h2>
          <button class="modal-close" @click="closeProfileModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedStudent" class="student-profile">
            <div class="profile-header">
              <div class="profile-info">
                <h3>{{ selectedStudent.name }}</h3>
                <p><strong>رقم الهوية:</strong> {{ selectedStudent.national_id_passport || 'غير محدد' }}</p>
                <p><strong>التخصص:</strong> {{ getDepartmentName(selectedStudent.department_id) }}</p>
                <p><strong>السنة الدراسية:</strong> {{ selectedStudent.year || 'غير محدد' }}</p>
              </div>
              
              <!-- QR Code Display -->
              <div class="qr-code-section" v-if="selectedStudent.qr_code">
                <h4>رمز QR للطالب</h4>
                <div class="qr-code-container">
                  <img :src="selectedStudent.qr_code" alt="Student QR Code" class="qr-code-image">
                  <p class="qr-code-info">يمكن استخدام هذا الرمز للتعرف على الطالب</p>
                  <div class="qr-code-actions">
                    <button class="btn btn-secondary btn-sm" @click="regenerateQRCode(selectedStudent)">
                      <i class="fas fa-refresh"></i>
                      إعادة إنشاء الرمز
                    </button>
                    <button class="btn btn-info btn-sm" @click="downloadQRCode(selectedStudent)">
                      <i class="fas fa-download"></i>
                      تحميل الرمز
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Generate QR Code for existing students -->
              <div class="qr-code-section" v-else>
                <h4>رمز QR للطالب</h4>
                <div class="qr-code-container">
                  <p class="qr-code-info">لم يتم إنشاء رمز QR لهذا الطالب بعد</p>
                  <button class="btn btn-primary btn-sm" @click="regenerateQRCode(selectedStudent)">
                    <i class="fas fa-qrcode"></i>
                    إنشاء رمز QR
                  </button>
                </div>
              </div>
            </div>
            
            <div class="detail-sections">
              <div class="detail-section">
                <h4>المعلومات الشخصية</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">البريد الإلكتروني:</span>
                    <span>{{ selectedStudent.email || 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">رقم الهاتف:</span>
                    <span>{{ selectedStudent.phone || 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">الجنس:</span>
                    <span>{{ selectedStudent.gender === 'male' ? 'ذكر' : selectedStudent.gender === 'female' ? 'أنثى' : 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">الجنسية:</span>
                    <span>{{ selectedStudent.nationality || 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">تاريخ الميلاد:</span>
                    <span>{{ selectedStudent.birth_date ? formatDate(selectedStudent.birth_date) : 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">تاريخ التسجيل:</span>
                    <span>{{ selectedStudent.enrollment_date ? formatDate(selectedStudent.enrollment_date) : 'غير at' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>المعلومات الأكاديمية</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">المعدل التراكمي:</span>
                    <span>{{ selectedStudent.gpa || 'غير محدد' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">الحالة:</span>
                    <span class="status-badge" :class="selectedStudent.status === 'active' ? 'status-active' : 'status-inactive'">
                      {{ selectedStudent.status === 'active' ? 'نشط' : 'غير نشط' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="detail-section" v-if="selectedStudent.address">
                <h4>العنوان</h4>
                <p>{{ selectedStudent.address }}</p>
              </div>
              
              <div class="detail-section" v-if="selectedStudent.sponsor_name || selectedStudent.sponsor_contact">
                <h4>معلومات الكفيل</h4>
                <div class="detail-grid">
                  <div class="detail-item" v-if="selectedStudent.sponsor_name">
                    <span class="detail-label">اسم الكفيل:</span>
                    <span>{{ selectedStudent.sponsor_name }}</span>
                  </div>
                  <div class="detail-item" v-if="selectedStudent.sponsor_contact">
                    <span class="detail-label">رقم هاتف الكفيل:</span>
                    <span>{{ selectedStudent.sponsor_contact }}</span>
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
import QRCode from 'qrcode'

export default {
  name: 'Students',
  setup() {
    // Reactive data
    const students = ref([])
    const departments = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const showModal = ref(false)
    const showProfileModal = ref(false)
    const editingStudent = ref(null)
    const selectedStudent = ref(null)
    const currentPage = ref(1)
    const studentsPerPage = ref(10)
    
    // Multi-step form data
    const currentStep = ref(1)
    
    // Filters
    const searchTerm = ref('')
    const departmentFilter = ref('')
    const yearFilter = ref('')
    const statusFilter = ref('')
    
    // Form data
    const studentForm = ref({
      name: '',
      name_en: '',
      department_id: '',
      year: '',
      email: '',
      phone: '',
      gender: '',
      nationality: '',
      birth_date: '',
      enrollment_date: '',
      address: '',
      national_id_passport: '',
      sponsor_name: '',
      sponsor_contact: '',
      gpa: null,
      academic_history: '',
      academic_history_type: '',
      academic_score: null,
      score_type: '',
      transcript_file: '',
      status: 'active'
    })

    // Computed properties
    const filteredStudents = computed(() => {
      let filtered = students.value

      // Search filter
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(student => 
          student.name.toLowerCase().includes(term) ||
          (student.name_en && student.name_en.toLowerCase().includes(term)) ||
          (student.national_id_passport && student.national_id_passport.toLowerCase().includes(term))
        )
      }

      // Department filter
      if (departmentFilter.value) {
        filtered = filtered.filter(student => student.department_id === departmentFilter.value)
      }

      // Year filter
      if (yearFilter.value) {
        filtered = filtered.filter(student => student.year === parseInt(yearFilter.value))
      }

      // Status filter
      if (statusFilter.value) {
        filtered = filtered.filter(student => student.status === statusFilter.value)
      }

      return filtered
    })

    const totalStudents = computed(() => students.value.length)
    const activeStudents = computed(() => students.value.filter(s => s.status === 'active').length)
    const newStudents = computed(() => {
      const currentYear = new Date().getFullYear()
      return students.value.filter(s => {
        if (!s.enrollment_date) return false
        const enrollmentYear = new Date(s.enrollment_date).getFullYear()
        return enrollmentYear === currentYear
      }).length
    })
    const graduatingStudents = computed(() => students.value.filter(s => s.year === 4).length)
    const studentsWithQR = computed(() => students.value.filter(s => s.qr_code).length)

    const totalPages = computed(() => Math.ceil(filteredStudents.value.length / studentsPerPage.value))
    const paginatedStudents = computed(() => {
      const start = (currentPage.value - 1) * studentsPerPage.value
      const end = start + studentsPerPage.value
      return filteredStudents.value.slice(start, end)
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

    // Multi-step form validation
    const canProceedToNextStep = computed(() => {
      switch (currentStep.value) {
        case 1:
          // Personal Information - required fields
          return !!
            studentForm.value.name &&
            studentForm.value.gender &&
            studentForm.value.nationality &&
            studentForm.value.birth_date &&
            studentForm.value.national_id_passport
        case 2:
          // Academic History - no required fields
          return true
        case 3:
          // Enrollment - required fields
          return !!
            studentForm.value.department_id &&
            studentForm.value.year &&
            studentForm.value.enrollment_date
        default:
          return false
      }
    })

    const isFormValid = computed(() => {
      return !!
        studentForm.value.name &&
        studentForm.value.gender &&
        studentForm.value.nationality &&
        studentForm.value.birth_date &&
        studentForm.value.national_id_passport &&
        studentForm.value.department_id &&
        studentForm.value.year &&
        studentForm.value.enrollment_date
    })

    // Methods
    const loadStudents = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        students.value = data || []
      } catch (error) {
        console.error('Error loading students:', error)
        alert('خطأ في تحميل بيانات الطلاب')
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

    const formatDate = (dateString) => {
      if (!dateString) return 'غير محدد'
      return new Date(dateString).toLocaleDateString('ar-SA')
    }

    const showAddStudentModal = () => {
      editingStudent.value = null
      resetForm()
      currentStep.value = 1
      showModal.value = true
    }

    const editStudent = (student) => {
      editingStudent.value = student
      studentForm.value = { ...student }
      currentStep.value = 1
      showModal.value = true
    }

    const viewStudentProfile = (student) => {
      selectedStudent.value = student
      showProfileModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingStudent.value = null
      currentStep.value = 1
      resetForm()
    }

    const closeProfileModal = () => {
      showProfileModal.value = false
      selectedStudent.value = null
    }

    const resetForm = () => {
      studentForm.value = {
        name: '',
        name_en: '',
        department_id: '',
        year: '',
        email: '',
        phone: '',
        gender: '',
        nationality: '',
        birth_date: '',
        enrollment_date: '',
        address: '',
        national_id_passport: '',
        sponsor_contact: '',
        gpa: null,
        academic_history: '',
        academic_history_type: '',
        academic_score: null,
        score_type: '',
        transcript_file: '',
        status: 'active'
      }
    }

    const generateQRCode = async (studentData) => {
      try {
        // Create a unique identifier for the student
        const qrData = {
          studentId: studentData.id,
          name: studentData.name,
          department: studentData.department_id,
          type: 'student'
        }
        
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        return qrCodeDataURL
      } catch (error) {
        console.error('Error generating QR code:', error)
        return null
      }
    }

    const submitStudent = async () => {
      submitting.value = true
      try {
        if (editingStudent.value) {
          // Update existing student
          const updateData = {
            name: studentForm.value.name,
            name_en: studentForm.value.name_en || null,
            department_id: studentForm.value.department_id || null,
            year: studentForm.value.year ? parseInt(studentForm.value.year) : null,
            email: studentForm.value.email || null,
            phone: studentForm.value.phone || null,
            gender: studentForm.value.gender || null,
            nationality: studentForm.value.nationality || null,
            birth_date: studentForm.value.birth_date || null,
            enrollment_date: studentForm.value.enrollment_date || null,
            address: studentForm.value.address || null,
            national_id_passport: studentForm.value.national_id_passport || null,
            gpa: studentForm.value.gpa ? parseFloat(studentForm.value.gpa) : null,
            status: studentForm.value.status || 'active',
            academic_history: studentForm.value.academic_history || null
          }
          
          console.log('Updating student data:', updateData)
          
          const { error } = await supabase
            .from('students')
            .update(updateData)
            .eq('id', editingStudent.value.id)

          if (error) throw error
          alert('تم تحديث الطالب بنجاح')
        } else {
          // Create new student - generate a unique ID
          const newStudentData = {
            id: `STU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: studentForm.value.name,
            name_en: studentForm.value.name_en || null,
            department_id: studentForm.value.department_id || null,
            year: studentForm.value.year ? parseInt(studentForm.value.year) : null,
            email: studentForm.value.email || null,
            phone: studentForm.value.phone || null,
            gender: studentForm.value.gender || null,
            nationality: studentForm.value.nationality || null,
            birth_date: studentForm.value.birth_date || null,
            enrollment_date: studentForm.value.enrollment_date || null,
            address: studentForm.value.address || null,
            national_id_passport: studentForm.value.national_id_passport || null,
            gpa: studentForm.value.gpa ? parseFloat(studentForm.value.gpa) : null,
            status: studentForm.value.status || 'active',
            academic_history: studentForm.value.academic_history || null
          }
          
          // Generate QR code for the new student
          const qrCodeDataURL = await generateQRCode(newStudentData)
          if (qrCodeDataURL) {
            newStudentData.qr_code = qrCodeDataURL
          }
          
          console.log('Sending student data:', newStudentData)
          
          const { error } = await supabase
            .from('students')
            .insert(newStudentData)

          if (error) throw error
          alert('تم إضافة الطالب بنجاح')
        }

        closeModal()
        await loadStudents()
      } catch (error) {
        console.error('Error saving student:', error)
        alert('خطأ في حفظ بيانات الطالب')
      } finally {
        submitting.value = false
      }
    }

    const deleteStudent = async (studentId) => {
      if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return

      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentId)

        if (error) throw error
        alert('تم حذف الطالب بنجاح')
        await loadStudents()
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('خطأ في حذف الطالب')
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const searchStudents = () => {
      currentPage.value = 1
    }

    const filterStudents = () => {
      currentPage.value = 1
    }

    const exportStudents = () => {
      // TODO: Implement export functionality
      alert('سيتم تنفيذ هذه الميزة قريباً')
    }

    const regenerateQRCode = async (student) => {
      if (!student) return
      try {
        const qrCodeDataURL = await generateQRCode(student)
        if (qrCodeDataURL) {
          const { error } = await supabase
            .from('students')
            .update({ qr_code: qrCodeDataURL })
            .eq('id', student.id)

          if (error) throw error
          alert('تم إعادة إنشاء رمز QR بنجاح')
          selectedStudent.value = { ...student, qr_code: qrCodeDataURL } // Update selectedStudent in the modal
        } else {
          alert('فشل إعادة إنشاء رمز QR')
        }
      } catch (error) {
        console.error('Error regenerating QR code:', error)
        alert('خطأ في إعادة إنشاء رمز QR')
      }
    }

    const downloadQRCode = (student) => {
      if (!student || !student.qr_code) {
        alert('لا يوجد رمز QR لهذا الطالب لتحميله.')
        return
      }
      const link = document.createElement('a')
      link.href = student.qr_code
      link.download = `${student.name}_QR.png` // Suggest a filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      alert('تم تحميل رمز QR بنجاح!')
    }

    const viewQRCode = (student) => {
      selectedStudent.value = student
      showProfileModal.value = true
    }

    // Multi-step form navigation
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

    const getYearLabel = (year) => {
      const yearLabels = {
        '1': 'السنة الأولى',
        '2': 'السنة الثانية', 
        '3': 'السنة الثالثة',
        '4': 'السنة الرابعة'
      }
      return yearLabels[year] || 'غير محدد'
    }

    // Academic History Helper Functions
    const onAcademicTypeChange = () => {
      // Reset score when academic type changes
      studentForm.value.academic_score = null
      
      // Set score type based on academic history type
      if (studentForm.value.academic_history_type === 'ثانوية') {
        studentForm.value.score_type = 'percentage'
      } else if (studentForm.value.academic_history_type === 'بكالوريوس' || studentForm.value.academic_history_type === 'دبلوم') {
        studentForm.value.score_type = 'gpa'
      } else {
        studentForm.value.score_type = ''
      }
    }

    const getScoreLabel = () => {
      if (studentForm.value.academic_history_type === 'ثانوية') {
        return 'المعدل (نسبة مئوية) *'
      } else if (studentForm.value.academic_history_type === 'بكالوريوس' || studentForm.value.academic_history_type === 'دبلوم') {
        return 'المعدل التراكمي (GPA) *'
      }
      return 'المعدل'
    }

    const getScorePlaceholder = () => {
      if (studentForm.value.academic_history_type === 'ثانوية') {
        return 'أدخل النسبة المئوية (0-100)'
      } else if (studentForm.value.academic_history_type === 'بكالوريوس' || studentForm.value.academic_history_type === 'دبلوم') {
        return 'أدخل المعدل التراكمي (0.00-4.00)'
      }
      return ''
    }

    const getScoreHint = () => {
      if (studentForm.value.academic_history_type === 'ثانوية') {
        return 'مطلوب للطلاب من خريجي الثانوية العامة'
      } else if (studentForm.value.academic_history_type === 'بكالوريوس' || studentForm.value.academic_history_type === 'دبلوم') {
        return 'مطلوب للطلاب الحاصلين على شهادة جامعية سابقة'
      }
      return ''
    }

    // File Upload Handler
    const onTranscriptUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        // In a real application, you would upload this to a server
        // For now, we'll just store the file name
        studentForm.value.transcript_file = file.name
        console.log('Transcript file selected:', file.name)
        
        // TODO: Implement actual file upload to server/cloud storage
        // const formData = new FormData()
        // formData.append('transcript', file)
        // uploadTranscript(formData)
      }
    }

    const getFileName = (filePath) => {
      if (!filePath) return ''
      return filePath.split('/').pop() || filePath
    }

    const generateQRForAllStudents = async () => {
      if (!confirm('هل أنت متأكد من إنشاء رموز QR لجميع الطلاب؟ هذا سيستغرق بعض الوقت.')) {
        return
      }
      loading.value = true
      try {
        const studentsToUpdate = students.value.filter(student => !student.qr_code);
        if (studentsToUpdate.length === 0) {
          alert('لا يوجد طلاب لديهم رموز QR لإعادة إنشائها.');
          return;
        }

        for (const student of studentsToUpdate) {
          const qrCodeDataURL = await generateQRCode(student);
          if (qrCodeDataURL) {
            const { error } = await supabase
              .from('students')
              .update({ qr_code: qrCodeDataURL })
              .eq('id', student.id);
            if (error) throw error;
            console.log(`Generated QR for student ID: ${student.id}`);
          } else {
            console.warn(`Failed to generate QR for student ID: ${student.id}`);
          }
        }
        alert(`تم إنشاء رموز QR لـ ${studentsToUpdate.length} طالب بنجاح!`);
      } catch (error) {
        console.error('Error generating QR for all students:', error);
        alert('خطأ في إنشاء رموز QR للجميع');
      } finally {
        loading.value = false;
        await loadStudents(); // Refresh the table to show updated QR codes
      }
    };

    // Watchers
    watch([searchTerm, departmentFilter, yearFilter, statusFilter], () => {
      currentPage.value = 1
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([loadStudents(), loadDepartments()])
    })

    return {
      // Data
      students,
      departments,
      loading,
      submitting,
      showModal,
      showProfileModal,
      editingStudent,
      selectedStudent,
      currentPage,
      studentsPerPage,
      
      // Filters
      searchTerm,
      departmentFilter,
      yearFilter,
      statusFilter,
      
      // Form
      studentForm,
      currentStep,
      
      // Computed
      filteredStudents,
      totalStudents,
      activeStudents,
      newStudents,
      graduatingStudents,
      totalPages,
      paginatedStudents,
      visiblePages,
      studentsWithQR,
      canProceedToNextStep,
      isFormValid,
      
      // Methods
      loadStudents,
      loadDepartments,
      getDepartmentName,
      formatDate,
      showAddStudentModal,
      editStudent,
      viewStudentProfile,
      closeModal,
      closeProfileModal,
      submitStudent,
      deleteStudent,
      changePage,
      searchStudents,
      filterStudents,
      exportStudents,
      regenerateQRCode,
      downloadQRCode,
      viewQRCode,
      generateQRForAllStudents,
      nextStep,
      previousStep,
      getYearLabel,
      onAcademicTypeChange,
      getScoreLabel,
      getScorePlaceholder,
      getScoreHint,
      onTranscriptUpload,
      getFileName
    }
  }
}
</script>

<style scoped>
/* Component-specific styles */
.students-page {
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
  gap: 0.75rem;
  align-items: center;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.student-avatar img {
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

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Form Steps - Horizontal Layout */
.form-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 120px;
}

.step-number {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
  border: 3px solid #e9ecef;
}

.step.active .step-number {
  background-color: #28a745;
  color: white;
  transform: scale(1.15);
  border-color: #28a745;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.step.completed .step-number {
  background-color: #20c997;
  color: white;
  border-color: #20c997;
}

.step-label {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step.active .step-label {
  color: #28a745;
  font-weight: 700;
  transform: translateY(-2px);
}

.step.completed .step-label {
  color: #20c997;
  font-weight: 600;
}

/* Step Connectors */
.step-connector {
  flex: 1;
  height: 3px;
  background-color: #e9ecef;
  margin: 0 1rem;
  position: relative;
  top: -22px;
  transition: all 0.4s ease;
}

.step-connector.active {
  background-color: #28a745;
}

/* Form step styles */
.form-step {
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

/* Form navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Student profile styles */
.student-profile {
  padding: 1rem 0;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #28a745;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.profile-info p {
  margin: 0.25rem 0;
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

/* QR Code Section */
.qr-code-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.qr-code-section h4 {
  color: #28a745;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.qr-code-image {
  width: 150px;
  height: 150px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.qr-code-info {
  font-size: 0.875rem;
  color: #6c757d;
  text-align: center;
  margin-bottom: 0.5rem;
}

.qr-code-container .btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.qr-code-container .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.qr-code-container .btn i {
  margin-left: 0.5rem;
}

.qr-code-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.qr-code-actions .btn {
  min-width: 120px;
}

/* QR Code Preview in Table */
.qr-code-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-code-thumbnail {
  width: 40px;
  height: 40px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qr-code-thumbnail:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.no-qr {
  color: #6c757d;
  font-size: 0.875rem;
  font-style: italic;
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

/* Icon-only Header Action Buttons */
.btn-icon {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  color: white;
  background: #6c757d;
}

.btn-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-icon.btn-primary {
  background: #28a745;
}

.btn-icon.btn-primary:hover {
  background: #218838;
}

.btn-icon.btn-secondary {
  background: #6c757d;
}

.btn-icon.btn-secondary:hover {
  background: #5a6268;
}

.btn-icon.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-icon.btn-outline:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #adb5bd;
}
</style>

