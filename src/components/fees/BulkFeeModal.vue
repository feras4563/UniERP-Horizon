<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-layer-group"></i>
          إضافة رسوم جماعية
        </h2>
        <button @click="closeModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitForm" class="bulk-fee-form">
          <div class="form-section">
            <h3 class="section-title">اختيار الطلاب</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>التخصص</label>
                <select v-model="bulkData.departmentId" @change="loadStudentsByDepartment" class="form-control">
                  <option value="">جميع التخصصات</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>السنة الدراسية</label>
                <select v-model="bulkData.studentYear" @change="filterStudents" class="form-control">
                  <option value="">جميع السنوات</option>
                  <option value="1">السنة الأولى</option>
                  <option value="2">السنة الثانية</option>
                  <option value="3">السنة الثالثة</option>
                  <option value="4">السنة الرابعة</option>
                </select>
              </div>

              <div class="form-group">
                <label>حالة الطالب</label>
                <select v-model="bulkData.studentStatus" @change="filterStudents" class="form-control">
                  <option value="">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>

            <!-- Selected Students Preview -->
            <div v-if="filteredStudents.length > 0" class="students-preview">
              <div class="preview-header">
                <h4>الطلاب المختارون ({{ filteredStudents.length }})</h4>
                <button type="button" @click="selectAllStudents" class="btn btn-sm btn-outline">
                  <i class="fas fa-check-double"></i>
                  تحديد الكل
                </button>
              </div>
              
              <div class="students-grid">
                <div 
                  v-for="student in filteredStudents" 
                  :key="student.id"
                  :class="['student-card', { 'selected': selectedStudents.includes(student.id) }]"
                  @click="toggleStudent(student.id)"
                >
                  <div class="student-avatar">
                    <img :src="student.profile_image || '/default-avatar.png'" :alt="student.name">
                  </div>
                  <div class="student-info">
                    <div class="student-name">{{ student.name }}</div>
                    <div class="student-id">{{ student.id }}</div>
                    <div class="student-year">السنة {{ student.year }}</div>
                  </div>
                  <div class="selection-indicator">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="bulkData.departmentId" class="no-students">
              <i class="fas fa-users"></i>
              <p>لا يوجد طلاب في هذا التخصص</p>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">تفاصيل الرسوم</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>نوع الرسوم <span class="required">*</span></label>
                <select v-model="bulkData.feeTypeId" class="form-control" required>
                  <option value="">اختر نوع الرسوم</option>
                  <option v-for="type in feeTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>خطة الدفع <span class="required">*</span></label>
                <select v-model="bulkData.paymentPlanId" @change="calculateBulkAmount" class="form-control" required>
                  <option value="">اختر خطة الدفع</option>
                  <option v-for="plan in paymentPlans" :key="plan.id" :value="plan.id">
                    {{ plan.name }} ({{ plan.installments_count }} دفعة)
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>السنة الدراسية <span class="required">*</span></label>
                <select v-model="bulkData.academicYear" class="form-control" required>
                  <option value="">اختر السنة الدراسية</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>

              <div class="form-group">
                <label>المبلغ لكل طالب <span class="required">*</span></label>
                <div class="amount-input-wrapper">
                  <input 
                    type="number" 
                    v-model="bulkData.amount" 
                    class="form-control amount-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                  <span class="currency">د.ل</span>
                </div>
              </div>

              <div class="form-group">
                <label>تاريخ الاستحقاق <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="bulkData.dueDate" 
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label>عدد الدفعات</label>
                <input 
                  type="number" 
                  v-model="bulkData.installmentCount" 
                  class="form-control"
                  min="1"
                  max="12"
                  :disabled="bulkData.paymentPlanId"
                />
                <small class="form-help">اتركه فارغاً ليتم تحديده تلقائياً حسب خطة الدفع</small>
              </div>
            </div>

            <div class="form-group">
              <label>ملاحظات</label>
              <textarea 
                v-model="bulkData.notes" 
                class="form-control"
                rows="3"
                placeholder="ملاحظات إضافية للرسوم الجماعية..."
              ></textarea>
            </div>
          </div>

          <!-- Summary -->
          <div v-if="selectedStudents.length > 0" class="summary-section">
            <div class="summary-card">
              <h4>ملخص العملية</h4>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="summary-label">عدد الطلاب:</span>
                  <span class="summary-value">{{ selectedStudents.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">المبلغ لكل طالب:</span>
                  <span class="summary-value">{{ formatCurrency(bulkData.amount) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">إجمالي المبلغ:</span>
                  <span class="summary-value total">{{ formatCurrency(bulkData.amount * selectedStudents.length) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">نوع الرسوم:</span>
                  <span class="summary-value">{{ getFeeTypeName(bulkData.feeTypeId) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">خطة الدفع:</span>
                  <span class="summary-value">{{ getPaymentPlanName(bulkData.paymentPlanId) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-outline">
              إلغاء
            </button>
            <button 
              type="submit" 
              class="btn btn-success"
              :disabled="isSubmitting || !isFormValid"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              {{ isSubmitting ? 'جاري الإضافة...' : `إضافة الرسوم (${selectedStudents.length})` }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Emits
const emit = defineEmits(['close', 'saved'])

// Reactive state
const isSubmitting = ref(false)

// Bulk fee data
const bulkData = ref({
  departmentId: '',
  studentYear: '',
  studentStatus: '',
  feeTypeId: '',
  paymentPlanId: '',
  academicYear: '',
  amount: '',
  dueDate: '',
  installmentCount: 1,
  notes: ''
})

// Students and selections
const allStudents = ref([])
const filteredStudents = ref([])
const selectedStudents = ref([])

// External data
const departments = ref([])
const feeTypes = ref([])
const paymentPlans = ref([])

// Computed properties
const isFormValid = computed(() => {
  return bulkData.value.feeTypeId && 
         bulkData.value.paymentPlanId && 
         bulkData.value.academicYear && 
         bulkData.value.amount && 
         bulkData.value.dueDate &&
         selectedStudents.value.length > 0
})

// Methods
const loadExternalData = async () => {
  try {
    const [departmentsRes, feeTypesRes, paymentPlansRes] = await Promise.all([
      fetch('/api/departments'),
      fetch('/api/fees/types'),
      fetch('/api/fees/payment-plans')
    ])

    if (departmentsRes.ok) {
      const data = await departmentsRes.json()
      departments.value = data.departments || []
    }

    if (feeTypesRes.ok) {
      const data = await feeTypesRes.json()
      feeTypes.value = data.feeTypes || []
    }

    if (paymentPlansRes.ok) {
      const data = await paymentPlansRes.json()
      paymentPlans.value = data.paymentPlans || []
    }
  } catch (error) {
    console.error('Error loading external data:', error)
  }
}

const loadStudentsByDepartment = async () => {
  if (!bulkData.value.departmentId) {
    allStudents.value = []
    filteredStudents.value = []
    selectedStudents.value = []
    return
  }

  try {
    const response = await fetch(`/api/students/department/${bulkData.value.departmentId}`)
    if (response.ok) {
      const data = await response.json()
      allStudents.value = data.students || []
      filterStudents()
    }
  } catch (error) {
    console.error('Error loading students by department:', error)
  }
}

const filterStudents = () => {
  let filtered = allStudents.value

  // Filter by year
  if (bulkData.value.studentYear) {
    filtered = filtered.filter(student => student.year === parseInt(bulkData.value.studentYear))
  }

  // Filter by status
  if (bulkData.value.studentStatus) {
    filtered = filtered.filter(student => student.status === bulkData.value.studentStatus)
  }

  filteredStudents.value = filtered
  selectedStudents.value = [] // Reset selection when filters change
}

const toggleStudent = (studentId) => {
  const index = selectedStudents.value.indexOf(studentId)
  if (index > -1) {
    selectedStudents.value.splice(index, 1)
  } else {
    selectedStudents.value.push(studentId)
  }
}

const selectAllStudents = () => {
  if (selectedStudents.value.length === filteredStudents.value.length) {
    selectedStudents.value = []
  } else {
    selectedStudents.value = filteredStudents.value.map(student => student.id)
  }
}

const calculateBulkAmount = async () => {
  if (bulkData.value.paymentPlanId && bulkData.value.departmentId) {
    try {
      const response = await fetch('/api/fees/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentPlanId: bulkData.value.paymentPlanId,
          departmentId: bulkData.value.departmentId
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        bulkData.value.amount = data.amount
      }
    } catch (error) {
      console.error('Error calculating fee amount:', error)
    }
  }
}

const submitForm = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    const response = await fetch('/api/fees/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentIds: selectedStudents.value,
        feeTypeId: bulkData.value.feeTypeId,
        paymentPlanId: bulkData.value.paymentPlanId,
        academicYear: bulkData.value.academicYear,
        amount: parseFloat(bulkData.value.amount),
        dueDate: bulkData.value.dueDate,
        installmentCount: bulkData.value.installmentCount,
        notes: bulkData.value.notes
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      alert(`تم إضافة الرسوم بنجاح لـ ${result.count} طالب`)
      emit('saved')
    } else {
      const error = await response.json()
      alert(`فشل في إضافة الرسوم: ${error.error}`)
    }
  } catch (error) {
    console.error('Error submitting bulk fees:', error)
    alert('حدث خطأ أثناء إضافة الرسوم')
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('close')
}

// Utility methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-LY', {
    style: 'currency',
    currency: 'LYD'
  }).format(amount || 0)
}

const getFeeTypeName = (feeTypeId) => {
  const type = feeTypes.value.find(t => t.id === feeTypeId)
  return type?.name || 'غير محدد'
}

const getPaymentPlanName = (paymentPlanId) => {
  const plan = paymentPlans.value.find(p => p.id === paymentPlanId)
  return plan?.name || 'غير محدد'
}

// Lifecycle
onMounted(() => {
  loadExternalData()
})
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

/* Form Sections */
.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Amount Input */
.amount-input-wrapper {
  position: relative;
}

.amount-input {
  padding-right: 3rem;
}

.currency {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 600;
}

/* Students Preview */
.students-preview {
  margin-top: 1.5rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-header h4 {
  margin: 0;
  color: #1e293b;
  font-size: 1rem;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.student-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-card:hover {
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.student-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.student-avatar {
  flex-shrink: 0;
}

.student-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-id {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.student-year {
  font-size: 0.8rem;
  color: #6b7280;
}

.selection-indicator {
  color: #3b82f6;
  font-size: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.student-card.selected .selection-indicator {
  opacity: 1;
}

.no-students {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-students i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-students p {
  margin: 0;
  font-size: 1rem;
}

/* Summary Section */
.summary-section {
  margin-top: 2rem;
}

.summary-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.summary-card h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.summary-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.summary-value {
  color: #64748b;
  font-size: 0.9rem;
}

.summary-value.total {
  font-weight: 600;
  color: #059669;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-content {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

