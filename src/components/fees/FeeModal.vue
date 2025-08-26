<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <button @click="closeModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        <h2 class="modal-title">
          <i class="fas fa-camera"></i>
          {{ isEditing ? 'تعديل الرسوم' : 'إضافة رسوم جديدة' }}
        </h2>
      </div>

      <div class="modal-body">
        <!-- Debug: Check if modal body renders -->
        <div style="background: red; color: white; padding: 10px; margin-bottom: 10px;">
          <strong>DEBUG:</strong> Modal body is rendering. Current step: {{ currentStep }}
        </div>
        
        <form @submit.prevent="submitForm" class="fee-form">
          <!-- Debug: Check if form renders -->
          <div style="background: blue; color: white; padding: 10px; margin-bottom: 10px;">
            <strong>DEBUG:</strong> Form is rendering. Students count: {{ students.length }}
          </div>
          
          <!-- Step 1: Student Selection -->
          <div v-if="currentStep === 1" class="form-step">
            <!-- Debug: Check if step 1 renders -->
            <div style="background: green; color: white; padding: 10px; margin-bottom: 10px;">
              <strong>DEBUG:</strong> Step 1 is rendering!
            </div>
            
            <div class="step-header">
              <div class="step-number">1</div>
              <div class="step-info">
                <h3>اختيار الطالب</h3>
                <p>ابحث عن الطالب واختره من القائمة</p>
              </div>
            </div>

            <div class="form-group">
              <label>البحث عن الطالب</label>
              <div class="search-container">
                <input 
                  type="text" 
                  v-model="studentSearchQuery" 
                  @input="handleStudentSearch"
                  @focus="showSearchResults = true"
                  placeholder="ابحث بالاسم أو رقم الطالب..."
                  class="search-input"
                />
                
                <!-- Search Results -->
                <div v-if="showSearchResults && filteredStudents.length > 0" class="search-results">
                  <div 
                    v-for="student in filteredStudents" 
                    :key="student.id"
                    @click="selectStudent(student)"
                    class="search-result-item"
                  >
                    <div class="student-info">
                      <div class="student-name">{{ student.name }}</div>
                      <div class="student-details">
                        <span>ID: {{ student.id }}</span>
                        <span>{{ getDepartmentName(student.department_id) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Student Display -->
            <div v-if="selectedStudent" class="selected-student">
              <h4>الطالب المختار:</h4>
              <div class="student-card">
                <div class="student-name">{{ selectedStudent.name }}</div>
                <div class="student-details">
                  <span>رقم الطالب: {{ selectedStudent.id }}</span>
                  <span>القسم: {{ getDepartmentName(selectedStudent.department_id) }}</span>
                  <span>السنة: {{ selectedStudent.year || 'غير محدد' }}</span>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                إلغاء
              </button>
              <button 
                type="button" 
                @click="nextStep" 
                class="btn btn-primary"
                :disabled="!selectedStudent"
              >
                التالي
              </button>
            </div>
          </div>

          <!-- Step 2: Fee Details -->
          <div v-if="currentStep === 2" class="form-step">
            <div class="step-header">
              <div class="step-number">2</div>
              <div class="step-info">
                <h3>تفاصيل الرسوم</h3>
                <p>أدخل تفاصيل الرسوم</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>نوع الرسوم <span class="required">*</span></label>
                <select v-model="feeData.fee_type_id" @change="calculateAmount" class="form-control" required>
                  <option value="">اختر نوع الرسوم</option>
                  <option v-for="type in feeTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>خطة الدفع <span class="required">*</span></label>
                <select v-model="feeData.payment_plan_id" @change="calculateAmount" class="form-control" required>
                  <option value="">اختر خطة الدفع</option>
                  <option v-for="plan in paymentPlans" :key="plan.id" :value="plan.id">
                    {{ plan.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>السنة الدراسية <span class="required">*</span></label>
                <select v-model="feeData.academic_year" class="form-control" required>
                  <option value="">اختر السنة الدراسية</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>

              <div class="form-group">
                <label>المبلغ <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model="feeData.amount" 
                  class="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div class="form-group">
                <label>تاريخ الاستحقاق <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="feeData.due_date" 
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label>عدد الدفعات</label>
                <input 
                  type="number" 
                  v-model="feeData.installment_count" 
                  class="form-control"
                  min="1"
                  max="12"
                />
              </div>
            </div>

            <div class="form-group">
              <label>ملاحظات</label>
              <textarea 
                v-model="feeData.payment_notes" 
                class="form-control"
                rows="3"
                placeholder="أي ملاحظات إضافية حول الرسوم..."
              ></textarea>
            </div>

            <div class="step-actions">
              <button type="button" @click="previousStep" class="btn btn-secondary">
                السابق
              </button>
              <button 
                type="button" 
                @click="nextStep" 
                class="btn btn-primary"
                :disabled="!isStep2Valid"
              >
                التالي
              </button>
            </div>
          </div>

          <!-- Step 3: Review and Submit -->
          <div v-if="currentStep === 3" class="form-step">
            <div class="step-header">
              <div class="step-number">3</div>
              <div class="step-info">
                <h3>مراجعة وتأكيد</h3>
                <p>راجع التفاصيل وأكد إضافة الرسوم</p>
              </div>
            </div>

            <div class="review-section">
              <h4>تفاصيل الطالب</h4>
              <div class="review-item">
                <span class="label">الاسم:</span>
                <span class="value">{{ selectedStudent?.name }}</span>
              </div>
              <div class="review-item">
                <span class="label">رقم الطالب:</span>
                <span class="value">{{ selectedStudent?.id }}</span>
              </div>
              <div class="review-item">
                <span class="label">القسم:</span>
                <span class="value">{{ getDepartmentName(selectedStudent?.department_id) }}</span>
              </div>
            </div>

            <div class="review-section">
              <h4>تفاصيل الرسوم</h4>
              <div class="review-item">
                <span class="label">نوع الرسوم:</span>
                <span class="value">{{ getFeeTypeName(feeData.fee_type_id) }}</span>
              </div>
              <div class="review-item">
                <span class="label">خطة الدفع:</span>
                <span class="value">{{ getPaymentPlanName(feeData.payment_plan_id) }}</span>
              </div>
              <div class="review-item">
                <span class="label">السنة الدراسية:</span>
                <span class="value">{{ feeData.academic_year }}</span>
              </div>
              <div class="review-item">
                <span class="label">المبلغ:</span>
                <span class="value">{{ formatCurrency(feeData.amount) }}</span>
              </div>
              <div class="review-item">
                <span class="label">تاريخ الاستحقاق:</span>
                <span class="value">{{ formatDate(feeData.due_date) }}</span>
              </div>
            </div>

            <div class="step-actions">
              <button type="button" @click="previousStep" class="btn btn-secondary">
                السابق
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isSubmitting"
              >
                <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                {{ isSubmitting ? 'جاري الحفظ...' : (isEditing ? 'تحديث الرسوم' : 'إضافة الرسوم') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../../supabase'

// Props
const props = defineProps({
  fee: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'saved'])

// Reactive state
const currentStep = ref(1)
const isSubmitting = ref(false)

// Student search
const studentSearchQuery = ref('')
const selectedStudent = ref(null)
const filteredStudents = ref([])
const showSearchResults = ref(false)

// Fee data
const feeData = ref({
  student_id: '',
  fee_type_id: '',
  payment_plan_id: '',
  academic_year: '',
  amount: '',
  due_date: '',
  installment_count: 1,
  payment_notes: '',
  status: 'pending'
})

// External data
const students = ref([])
const feeTypes = ref([])
const paymentPlans = ref([])
const departments = ref([])

// Computed properties
const isStep2Valid = computed(() => {
  return feeData.value.fee_type_id && 
         feeData.value.payment_plan_id && 
         feeData.value.academic_year && 
         feeData.value.amount && 
         feeData.value.due_date
})

// Methods
const loadExternalData = async () => {
  console.log('loadExternalData called!')
  try {
    // Load students
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('name')
    
    if (studentsError) {
      console.error('Error loading students:', studentsError)
    } else {
      students.value = studentsData || []
    }

    // Load fee types
    const { data: feeTypesData, error: feeTypesError } = await supabase
      .from('fee_types')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (feeTypesError) {
      console.error('Error loading fee types:', feeTypesError)
    } else {
      feeTypes.value = feeTypesData || []
    }

    // Load payment plans
    const { data: paymentPlansData, error: paymentPlansError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (paymentPlansError) {
      console.error('Error loading payment plans:', paymentPlansError)
    } else {
      paymentPlans.value = paymentPlansData || []
    }

    // Load departments
    const { data: departmentsData, error: departmentsError } = await supabase
      .from('departments')
      .select('*')
      .order('name')
    
    if (departmentsError) {
      console.error('Error loading departments:', departmentsError)
    } else {
      departments.value = departmentsData || []
    }
  } catch (error) {
    console.error('Error loading external data:', error)
  }
}

const handleStudentSearch = () => {
  if (!studentSearchQuery.value) {
    filteredStudents.value = []
    return
  }

  const query = studentSearchQuery.value.toLowerCase()
  filteredStudents.value = students.value.filter(student => 
    student.name.toLowerCase().includes(query) ||
    student.id.toLowerCase().includes(query)
  ).slice(0, 10)
}

const selectStudent = (student) => {
  selectedStudent.value = student
  feeData.value.student_id = student.id
  studentSearchQuery.value = student.name
  showSearchResults.value = false
}

const calculateAmount = async () => {
  if (feeData.value.payment_plan_id && selectedStudent.value?.department_id) {
    try {
      const { data, error } = await supabase
        .from('fee_structure')
        .select('amount')
        .eq('payment_plan_id', feeData.value.payment_plan_id)
        .eq('department_id', selectedStudent.value.department_id)
        .eq('is_active', true)
        .single()
      
      if (!error && data) {
        feeData.value.amount = data.amount
      }
    } catch (error) {
      console.error('Error calculating amount:', error)
    }
  }
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitForm = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const feeDataToSubmit = {
      ...feeData.value,
      student_id: selectedStudent.value.id
    }

    let result
    if (props.isEditing) {
      const { data, error } = await supabase
        .from('fees')
        .update(feeDataToSubmit)
        .eq('id', props.fee.id)
        .select()
      
      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabase
        .from('fees')
        .insert([feeDataToSubmit])
        .select()
      
      if (error) throw error
      result = data
    }

    console.log('Fee saved successfully:', result)
    emit('saved')
  } catch (error) {
    console.error('Error saving fee:', error)
    alert('حدث خطأ أثناء حفظ الرسوم')
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

const formatDate = (date) => {
  if (!date) return 'غير محدد'
  return new Date(date).toLocaleDateString('ar-LY')
}

const getDepartmentName = (departmentId) => {
  const dept = departments.value.find(d => d.id === departmentId)
  return dept?.name || 'غير محدد'
}

const getFeeTypeName = (feeTypeId) => {
  const type = feeTypes.value.find(t => t.id === feeTypeId)
  return type?.name || 'غير محدد'
}

const getPaymentPlanName = (paymentPlanId) => {
  const plan = paymentPlans.value.find(p => p.id === paymentPlanId)
  return plan?.name || 'غير محدد'
}

// Initialize form data if editing
const initializeFormData = () => {
  if (props.isEditing && props.fee) {
    feeData.value = { ...props.fee }
    
    // Find and set selected student
    const student = students.value.find(s => s.id === props.fee.student_id)
    if (student) {
      selectedStudent.value = student
      studentSearchQuery.value = student.name
    }
  }
}

// Lifecycle
onMounted(() => {
  console.log('FeeModal mounted!')
  console.log('Initial currentStep:', currentStep.value)
  loadExternalData()
})

// Watch for external data changes
watch([students, feeTypes, paymentPlans, departments], () => {
  initializeFormData()
}, { deep: true })
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
  max-width: 800px;
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

/* Form Steps */
.form-step {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.step-info h3 {
  margin: 0 0 0.25rem 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.step-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Search Styles */
.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f9fafb;
}

.search-result-item:last-child {
  border-bottom: none;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-name {
  font-weight: 600;
  color: #1f2937;
}

.student-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
}

/* Selected Student */
.selected-student {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.selected-student h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1rem;
}

.student-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-card .student-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.1rem;
}

.student-card .student-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
}

/* Review Section */
.review-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.review-section h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1rem;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-item .label {
  font-weight: 600;
  color: #374151;
}

.review-item .value {
  color: #1f2937;
}

/* Step Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}
</style>


