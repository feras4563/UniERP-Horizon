<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-money-bill-wave"></i>
          تسجيل دفعة
        </h2>
        <button @click="closeModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitPayment" class="payment-form">
          <!-- Fee Information -->
          <div class="fee-info-section">
            <h3 class="section-title">معلومات الرسوم</h3>
            <div class="fee-info-card">
              <div class="student-info">
                <img :src="fee?.student?.profile_image || '/default-avatar.png'" :alt="fee?.student?.name" class="student-avatar">
                <div>
                  <h4>{{ fee?.student?.name }}</h4>
                  <p class="student-id">{{ fee?.student?.id }}</p>
                  <p class="student-department">{{ getDepartmentName(fee?.student?.department_id) }}</p>
                </div>
              </div>
              
              <div class="fee-details">
                <div class="fee-detail-row">
                  <span class="detail-label">نوع الرسوم:</span>
                  <span class="detail-value">{{ getFeeTypeName(fee?.fee_type_id) }}</span>
                </div>
                <div class="fee-detail-row">
                  <span class="detail-label">المبلغ الإجمالي:</span>
                  <span class="detail-value amount">{{ formatCurrency(fee?.amount) }}</span>
                </div>
                <div class="fee-detail-row">
                  <span class="detail-label">المدفوع:</span>
                  <span class="detail-value paid">{{ formatCurrency(fee?.amount - fee?.remaining_amount) }}</span>
                </div>
                <div class="fee-detail-row">
                  <span class="detail-label">المتبقي:</span>
                  <span class="detail-value remaining">{{ formatCurrency(fee?.remaining_amount) }}</span>
                </div>
                <div class="fee-detail-row">
                  <span class="detail-label">تاريخ الاستحقاق:</span>
                  <span class="detail-value">{{ formatDate(fee?.due_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="payment-details-section">
            <h3 class="section-title">تفاصيل الدفعة</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>مبلغ الدفعة <span class="required">*</span></label>
                <div class="amount-input-wrapper">
                  <input 
                    type="number" 
                    v-model="paymentData.amount" 
                    class="form-control amount-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    :max="fee?.remaining_amount"
                    required
                    @input="validateAmount"
                  />
                  <span class="currency">د.ل</span>
                </div>
                <small class="form-help">الحد الأقصى: {{ formatCurrency(fee?.remaining_amount) }}</small>
              </div>

              <div class="form-group">
                <label>طريقة الدفع <span class="required">*</span></label>
                <select v-model="paymentData.payment_method" class="form-control" required>
                  <option value="">اختر طريقة الدفع</option>
                  <option value="cash">نقداً</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="credit_card">بطاقة ائتمان</option>
                  <option value="check">شيك</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div class="form-group">
                <label>تاريخ الدفع</label>
                <input 
                  type="date" 
                  v-model="paymentData.payment_date" 
                  class="form-control"
                  :max="today"
                />
                <small class="form-help">اتركه فارغاً ليتم تحديده تلقائياً</small>
              </div>

              <div class="form-group">
                <label>رقم الإيصال</label>
                <input 
                  type="text" 
                  v-model="paymentData.receipt_no" 
                  class="form-control"
                  placeholder="سيتم إنشاؤه تلقائياً"
                  readonly
                />
              </div>

              <div class="form-group">
                <label>رقم المرجع</label>
                <input 
                  type="text" 
                  v-model="paymentData.reference_no" 
                  class="form-control"
                  placeholder="رقم العملية البنكية أو المرجع"
                />
              </div>

              <div class="form-group">
                <label>الدفعة رقم</label>
                <input 
                  type="number" 
                  v-model="paymentData.installment_number" 
                  class="form-control"
                  min="1"
                  :max="fee?.installment_count || 1"
                />
                <small class="form-help">رقم الدفعة من أصل {{ fee?.installment_count || 1 }}</small>
              </div>
            </div>

            <div class="form-group">
              <label>ملاحظات</label>
              <textarea 
                v-model="paymentData.notes" 
                class="form-control"
                rows="3"
                placeholder="أي ملاحظات إضافية حول الدفعة..."
              ></textarea>
            </div>
          </div>

          <!-- Payment Summary -->
          <div v-if="paymentData.amount > 0" class="payment-summary">
            <div class="summary-card">
              <h4>ملخص الدفعة</h4>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="summary-label">المبلغ المدفوع:</span>
                  <span class="summary-value">{{ formatCurrency(paymentData.amount) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">المتبقي بعد الدفعة:</span>
                  <span class="summary-value">{{ formatCurrency(fee?.remaining_amount - paymentData.amount) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">طريقة الدفع:</span>
                  <span class="summary-value">{{ getPaymentMethodText(paymentData.payment_method) }}</span>
                </div>
                <div class="summary-item" v-if="paymentData.reference_no">
                  <span class="summary-label">رقم المرجع:</span>
                  <span class="summary-value">{{ paymentData.reference_no }}</span>
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
              {{ isSubmitting ? 'جاري التسجيل...' : 'تسجيل الدفعة' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  fee: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'payment-recorded'])

// Reactive state
const isSubmitting = ref(false)

// Payment data
const paymentData = ref({
  amount: '',
  payment_method: '',
  payment_date: '',
  receipt_no: '',
  reference_no: '',
  installment_number: 1,
  notes: ''
})

// External data
const departments = ref([])
const feeTypes = ref([])

// Computed properties
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return paymentData.value.amount > 0 && 
         paymentData.value.amount <= props.fee?.remaining_amount &&
         paymentData.value.payment_method
})

// Methods
const loadExternalData = async () => {
  try {
    const [departmentsRes, feeTypesRes] = await Promise.all([
      fetch('/api/departments'),
      fetch('/api/fees/types')
    ])

    if (departmentsRes.ok) {
      const data = await departmentsRes.json()
      departments.value = data.departments || []
    }

    if (feeTypesRes.ok) {
      const data = await feeTypesRes.json()
      feeTypes.value = data.feeTypes || []
    }
  } catch (error) {
    console.error('Error loading external data:', error)
  }
}

const validateAmount = () => {
  const amount = parseFloat(paymentData.value.amount)
  const remaining = props.fee?.remaining_amount || 0
  
  if (amount > remaining) {
    paymentData.value.amount = remaining
  }
}

const generateReceiptNumber = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  return `RCP-${timestamp}-${random}`
}

const submitPayment = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    // Generate receipt number if not provided
    if (!paymentData.value.receipt_no) {
      paymentData.value.receipt_no = generateReceiptNumber()
    }
    
    // Set payment date if not provided
    if (!paymentData.value.payment_date) {
      paymentData.value.payment_date = today.value
    }
    
    const response = await fetch('/api/fees/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fee_id: props.fee.id,
        amount: parseFloat(paymentData.value.amount),
        payment_method: paymentData.value.payment_method,
        payment_date: paymentData.value.payment_date,
        receipt_no: paymentData.value.receipt_no,
        reference_no: paymentData.value.reference_no,
        installment_number: paymentData.value.installment_number,
        notes: paymentData.value.notes
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      alert(`تم تسجيل الدفعة بنجاح. رقم الإيصال: ${result.receipt_no}`)
      emit('payment-recorded')
    } else {
      const error = await response.json()
      alert(`فشل في تسجيل الدفعة: ${error.error}`)
    }
  } catch (error) {
    console.error('Error submitting payment:', error)
    alert('حدث خطأ أثناء تسجيل الدفعة')
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

const getPaymentMethodText = (method) => {
  const methods = {
    cash: 'نقداً',
    bank_transfer: 'تحويل بنكي',
    credit_card: 'بطاقة ائتمان',
    check: 'شيك',
    other: 'أخرى'
  }
  return methods[method] || method
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
  max-width: 700px;
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
.fee-info-section,
.payment-details-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Fee Info Card */
.fee-info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.student-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.student-info h4 {
  margin: 0 0 0.25rem 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.student-info p {
  margin: 0.25rem 0;
  color: #64748b;
  font-size: 0.9rem;
}

.fee-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.fee-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.detail-value {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
}

.detail-value.amount {
  color: #059669;
  font-family: 'Courier New', monospace;
}

.detail-value.paid {
  color: #10b981;
  font-family: 'Courier New', monospace;
}

.detail-value.remaining {
  color: #ef4444;
  font-family: 'Courier New', monospace;
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

.form-control[readonly] {
  background: #f8fafc;
  color: #6b7280;
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

/* Payment Summary */
.payment-summary {
  margin-bottom: 2rem;
}

.summary-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1.5rem;
}

.summary-card h4 {
  margin: 0 0 1rem 0;
  color: #166534;
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
  border-bottom: 1px solid #bbf7d0;
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
  font-weight: 600;
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
  
  .fee-details {
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

