<template>
  <div class="fees-management">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-money-bill-wave"></i>
          إدارة الرسوم الدراسية
        </h1>
        <p class="page-subtitle">إدارة وتتبع جميع الرسوم الدراسية للطلاب</p>
      </div>
      <div class="header-actions">
        <button @click="showAddFeeModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          إضافة رسوم جديدة
        </button>
        <button @click="showBulkFeeModal = true" class="btn btn-secondary">
          <i class="fas fa-layer-group"></i>
          إضافة رسوم جماعية
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalStudents }}</h3>
          <p>إجمالي الطلاب</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon paid">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ paidCount }}</h3>
          <p>الرسوم المدفوعة</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ pendingCount }}</h3>
          <p>الرسوم المعلقة</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon overdue">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ overdueCount }}</h3>
          <p>الرسوم المتأخرة</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon revenue">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatCurrency(totalRevenue) }}</h3>
          <p>إجمالي الإيرادات</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon collection">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="stat-content">
          <h3>{{ collectionRate }}%</h3>
          <p>معدل التحصيل</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="filter-group">
          <label>البحث</label>
        <input 
          v-model="searchQuery" 
            @input="handleSearch"
            placeholder="ابحث بالاسم أو رقم الطالب..."
            class="filter-input"
        />
      </div>
        <div class="filter-group">
          <label>التخصص</label>
          <select v-model="selectedDepartment" @change="handleFilter" class="filter-select">
          <option value="">جميع التخصصات</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>نوع الرسوم</label>
          <select v-model="selectedFeeType" @change="handleFilter" class="filter-select">
            <option value="">جميع الأنواع</option>
            <option v-for="type in feeTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
        </select>
        </div>
        <div class="filter-group">
          <label>الحالة</label>
          <select v-model="selectedStatus" @change="handleFilter" class="filter-select">
          <option value="">جميع الحالات</option>
          <option value="paid">مدفوع</option>
            <option value="pending">معلق</option>
            <option value="overdue">متأخر</option>
          <option value="partial">مدفوع جزئياً</option>
        </select>
        </div>
        <div class="filter-group">
          <label>السنة الدراسية</label>
          <select v-model="selectedAcademicYear" @change="handleFilter" class="filter-select">
            <option value="">جميع السنوات</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
        </select>
        </div>
      </div>
    </div>

    <!-- Fees Table -->
    <div class="table-container">
      <div class="table-header">
        <h3>قائمة الرسوم الدراسية</h3>
        <div class="table-actions">
          <button @click="exportFees" class="btn btn-outline">
            <i class="fas fa-download"></i>
            تصدير البيانات
          </button>
          <button @click="refreshData" class="btn btn-outline">
            <i class="fas fa-refresh"></i>
            تحديث
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>الطالب</th>
            <th>التخصص</th>
            <th>نوع الرسوم</th>
            <th>المبلغ</th>
            <th>المدفوع</th>
            <th>المتبقي</th>
            <th>تاريخ الاستحقاق</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
            <tr v-for="fee in paginatedFees" :key="fee.id" class="fee-row">
              <td class="student-cell">
              <div class="student-info">
                  <img :src="fee.student?.profile_image || '/default-avatar.png'" :alt="fee.student?.name" class="student-avatar">
                <div>
                    <div class="student-name">{{ fee.student?.name }}</div>
                    <div class="student-id">{{ fee.student?.id }}</div>
                </div>
              </div>
            </td>
              <td>{{ getDepartmentName(fee.student?.department_id) }}</td>
              <td>{{ getFeeTypeName(fee.fee_type_id) }}</td>
              <td class="amount-cell">{{ formatCurrency(fee.amount) }}</td>
              <td class="amount-cell">{{ formatCurrency(fee.amount - fee.remaining_amount) }}</td>
              <td class="amount-cell">{{ formatCurrency(fee.remaining_amount) }}</td>
              <td>{{ formatDate(fee.due_date) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(fee.status)">
                {{ getStatusText(fee.status) }}
              </span>
            </td>
              <td class="actions-cell">
              <div class="action-buttons">
                  <button @click="viewFee(fee)" class="btn-icon" title="عرض التفاصيل">
                  <i class="fas fa-eye"></i>
                </button>
                  <button @click="editFee(fee)" class="btn-icon" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                  <button @click="recordPayment(fee)" class="btn-icon" title="تسجيل دفعة">
                    <i class="fas fa-money-bill"></i>
                  </button>
                  <button @click="deleteFee(fee)" class="btn-icon danger" title="حذف">
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
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page">
          <i class="fas fa-chevron-right"></i>
      </button>
        <span class="page-info">صفحة {{ currentPage }} من {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page">
          <i class="fas fa-chevron-left"></i>
      </button>
    </div>
    </div>

    <!-- Add Fee Modal -->
    <FeeModal 
      v-if="showAddFeeModal"
      :fee="editingFee"
      :is-editing="isEditing"
      @close="closeFeeModal"
      @saved="onFeeSaved"
    />

    <!-- Bulk Fee Modal -->
    <BulkFeeModal 
      v-if="showBulkFeeModal"
      @close="showBulkFeeModal = false"
      @saved="onBulkFeesSaved"
    />

    <!-- Payment Modal -->
    <PaymentModal 
      v-if="showPaymentModal"
      :fee="selectedFee"
      @close="showPaymentModal = false"
      @payment-recorded="onPaymentRecorded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../../supabase'
import FeeModal from './FeeModal.vue'
import BulkFeeModal from './BulkFeeModal.vue'
import PaymentModal from './PaymentModal.vue'

// Reactive state
    const fees = ref([])
    const students = ref([])
const departments = ref([])
const feeTypes = ref([])
const paymentPlans = ref([])

// Search and filters
    const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedFeeType = ref('')
    const selectedStatus = ref('')
const selectedAcademicYear = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Modal states
const showAddFeeModal = ref(false)
const showBulkFeeModal = ref(false)
const showPaymentModal = ref(false)
    const isEditing = ref(false)
const editingFee = ref(null)
const selectedFee = ref(null)

// Loading states
const isLoading = ref(false)

    // Computed properties
    const filteredFees = computed(() => {
      let filtered = fees.value

  // Search filter
      if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(fee => 
      fee.student?.name?.toLowerCase().includes(query) ||
      fee.student?.id?.toLowerCase().includes(query)
    )
  }

  // Department filter
  if (selectedDepartment.value) {
    filtered = filtered.filter(fee => fee.student?.department_id === selectedDepartment.value)
  }

  // Fee type filter
  if (selectedFeeType.value) {
    filtered = filtered.filter(fee => fee.fee_type_id === selectedFeeType.value)
  }

  // Status filter
      if (selectedStatus.value) {
        filtered = filtered.filter(fee => fee.status === selectedStatus.value)
      }

  // Academic year filter
  if (selectedAcademicYear.value) {
    filtered = filtered.filter(fee => fee.academic_year === selectedAcademicYear.value)
      }

      return filtered
    })

    const paginatedFees = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredFees.value.slice(start, end)
    })

const totalPages = computed(() => Math.ceil(filteredFees.value.length / itemsPerPage.value))

// Statistics
const totalStudents = computed(() => students.value.length)
const paidCount = computed(() => fees.value.filter(f => f.status === 'paid').length)
const pendingCount = computed(() => fees.value.filter(f => f.status === 'pending').length)
const overdueCount = computed(() => fees.value.filter(f => f.status === 'overdue').length)
const totalRevenue = computed(() => fees.value.reduce((sum, f) => sum + (f.amount - f.remaining_amount), 0))
    const collectionRate = computed(() => {
  const totalAmount = fees.value.reduce((sum, f) => sum + f.amount, 0)
  const collectedAmount = fees.value.reduce((sum, f) => sum + (f.amount - f.remaining_amount), 0)
  return totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0
    })

    // Methods
const loadData = async () => {
  try {
    isLoading.value = true

    // Load fees using Supabase directly
    const { data: feesData, error: feesError } = await supabase
      .from('fees')
      .select(`
        *,
        student:students(name, id, department_id),
        fee_type:fee_types(name),
        payment_plan:payment_plans(name)
      `)
      .order('created_at', { ascending: false })

    if (feesError) {
      console.error('Error loading fees:', feesError)
    } else {
      fees.value = feesData || []
    }

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

  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
      currentPage.value = 1
    }

const handleFilter = () => {
      currentPage.value = 1
    }

    const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
  }
}

const refreshData = () => {
  loadData()
}

const exportFees = () => {
  // TODO: Implement export functionality
  console.log('Exporting fees...')
}

// Fee operations
    const editFee = (fee) => {
  editingFee.value = fee
      isEditing.value = true
  showAddFeeModal.value = true
    }

    const viewFee = (fee) => {
  // TODO: Implement view fee details
  console.log('Viewing fee:', fee)
}

const recordPayment = (fee) => {
  selectedFee.value = fee
  showPaymentModal.value = true
}

const deleteFee = async (fee) => {
  if (!confirm('هل أنت متأكد من حذف هذه الرسوم؟')) return

  try {
    const { error } = await supabase
      .from('fees')
      .delete()
      .eq('id', fee.id)

    if (error) {
      throw error
    }

    await loadData()
  } catch (error) {
    console.error('Error deleting fee:', error)
    alert('حدث خطأ أثناء حذف الرسوم')
  }
}

const closeFeeModal = () => {
  showAddFeeModal.value = false
  editingFee.value = null
  isEditing.value = false
}

const onFeeSaved = () => {
  closeFeeModal()
  loadData()
}

const onBulkFeesSaved = () => {
  showBulkFeeModal.value = false
  loadData()
}

const onPaymentRecorded = () => {
  showPaymentModal.value = false
  loadData()
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

    const getStatusClass = (status) => {
  const classes = {
    paid: 'status-paid',
    pending: 'status-pending',
    overdue: 'status-overdue',
    partial: 'status-partial'
  }
  return classes[status] || 'status-pending'
    }

    const getStatusText = (status) => {
  const texts = {
    paid: 'مدفوع',
    pending: 'معلق',
    overdue: 'متأخر',
    partial: 'مدفوع جزئياً'
  }
  return texts[status] || status
}

// Lifecycle
onMounted(() => {
  loadData()
})

// Watch for filter changes
watch([selectedDepartment, selectedFeeType, selectedStatus, selectedAcademicYear], () => {
  handleFilter()
})
</script>

<style scoped>
.fees-management {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header Styles */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content .page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.total { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.paid { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.pending { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.overdue { background: linear-gradient(135deg, #ef4444, #dc2626); }
.stat-icon.revenue { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.collection { background: linear-gradient(135deg, #06b6d4, #0891b2); }

.stat-content h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.stat-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Filters Section */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Table Styles */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.2rem;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: right;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.fee-row:hover {
  background: #f8fafc;
}

.student-cell {
  min-width: 200px;
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
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.student-id {
  font-size: 0.8rem;
  color: #64748b;
}

.amount-cell {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  text-align: left;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.status-paid {
  background: #dcfce7;
  color: #166534;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-overdue {
  background: #fee2e2;
  color: #991b1b;
}

.status-partial {
  background: #dbeafe;
  color: #1e40af;
}

.actions-cell {
  min-width: 120px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: #e2e8f0;
  color: #374151;
}

.btn-icon.danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-page {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #d1d5db;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-size: 0.9rem;
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

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover {
  background: #475569;
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
@media (max-width: 1024px) {
  .fees-management {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .data-table {
    font-size: 0.8rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
