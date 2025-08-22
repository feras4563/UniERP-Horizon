<template>
  <div class="fees-page">
    <!-- Content Header -->
    <div class="content-header">
      <h1>إدارة الرسوم</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddFeeModal">
          <i class="fas fa-plus"></i>
          إضافة رسوم
        </button>
        <button class="btn btn-secondary" @click="exportFees">
          <i class="fas fa-download"></i>
          تصدير التقرير
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalStudents }}</div>
          <div class="card-label">إجمالي الطلاب</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ paidCount }}</div>
          <div class="card-label">مدفوع</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #dc3545;">
        <div class="card-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ unpaidCount }}</div>
          <div class="card-label">غير مدفوع</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ partialCount }}</div>
          <div class="card-label">مدفوع جزئياً</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-icon">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalCollected }} ريال</div>
          <div class="card-label">إجمالي المحصل</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #6f42c1;">
        <div class="card-icon">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ collectionRate }}%</div>
          <div class="card-label">معدل التحصيل</div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="searchFees"
          placeholder="البحث في الطلاب أو أنواع الرسوم..."
        />
      </div>
      <div class="filters">
        <select v-model="selectedMajor" @change="filterFees">
          <option value="">جميع التخصصات</option>
          <option value="computer-science">علوم الحاسوب</option>
          <option value="engineering">الهندسة</option>
          <option value="business">إدارة الأعمال</option>
        </select>
        <select v-model="selectedStatus" @change="filterFees">
          <option value="">جميع الحالات</option>
          <option value="paid">مدفوع</option>
          <option value="unpaid">غير مدفوع</option>
          <option value="partial">مدفوع جزئياً</option>
        </select>
        <select v-model="selectedType" @change="filterFees">
          <option value="">جميع الأنواع</option>
          <option value="tuition">رسوم دراسية</option>
          <option value="lab">رسوم مختبر</option>
          <option value="library">رسوم مكتبة</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
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
          <tr v-for="fee in paginatedFees" :key="fee.id">
            <td>
              <div class="student-info">
                <img :src="fee.studentImage" :alt="fee.studentName" class="student-avatar">
                <div>
                  <div class="student-name">{{ fee.studentName }}</div>
                  <div class="student-id">{{ fee.studentId }}</div>
                </div>
              </div>
            </td>
            <td>{{ fee.major }}</td>
            <td>{{ fee.feeType }}</td>
            <td>{{ fee.amount }} ريال</td>
            <td>{{ fee.paid }} ريال</td>
            <td>{{ fee.remaining }} ريال</td>
            <td>{{ formatDate(fee.dueDate) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(fee.status)">
                {{ getStatusText(fee.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-view" @click="viewFee(fee)" title="عرض">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" @click="editFee(fee)" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" @click="deleteFee(fee.id)" title="حذف">
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
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
      >
        السابق
      </button>
      <button 
        v-for="page in totalPages" 
        :key="page"
        @click="changePage(page)"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
      >
        التالي
      </button>
    </div>

    <!-- Add/Edit Fee Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? 'تعديل الرسوم' : 'إضافة رسوم جديدة' }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitFee">
            <div class="form-row">
              <div class="form-group">
                <label>الطالب</label>
                <select v-model="feeData.studentId" class="form-control" required>
                  <option value="">اختر الطالب</option>
                  <option v-for="student in students" :key="student.id" :value="student.id">
                    {{ student.name }} - {{ student.id }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>نوع الرسوم</label>
                <select v-model="feeData.feeType" class="form-control" required>
                  <option value="">اختر نوع الرسوم</option>
                  <option value="tuition">رسوم دراسية</option>
                  <option value="lab">رسوم مختبر</option>
                  <option value="library">رسوم مكتبة</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>المبلغ الإجمالي</label>
                <input type="number" v-model="feeData.amount" class="form-control" min="0" step="0.01" required>
              </div>
              <div class="form-group">
                <label>المدفوع</label>
                <input type="number" v-model="feeData.paid" class="form-control" min="0" step="0.01" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>تاريخ الاستحقاق</label>
                <input type="date" v-model="feeData.dueDate" class="form-control" required>
              </div>
              <div class="form-group">
                <label>الحالة</label>
                <select v-model="feeData.status" class="form-control" required>
                  <option value="paid">مدفوع</option>
                  <option value="unpaid">غير مدفوع</option>
                  <option value="partial">مدفوع جزئياً</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <textarea v-model="feeData.notes" class="form-control" rows="3"></textarea>
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
  name: 'Fees',
  setup() {
    const fees = ref([])
    const students = ref([])
    const searchQuery = ref('')
    const selectedMajor = ref('')
    const selectedStatus = ref('')
    const selectedType = ref('')
    const showModal = ref(false)
    const isEditing = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const editingId = ref(null)

    const feeData = ref({
      studentId: '',
      feeType: '',
      amount: '',
      paid: '',
      dueDate: '',
      status: 'unpaid',
      notes: ''
    })

    // Computed properties
    const filteredFees = computed(() => {
      let filtered = fees.value

      if (searchQuery.value) {
        filtered = filtered.filter(fee => 
          fee.studentName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          fee.feeType.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedMajor.value) {
        filtered = filtered.filter(fee => fee.major === selectedMajor.value)
      }

      if (selectedStatus.value) {
        filtered = filtered.filter(fee => fee.status === selectedStatus.value)
      }

      if (selectedType.value) {
        filtered = filtered.filter(fee => fee.feeType === selectedType.value)
      }

      return filtered
    })

    const paginatedFees = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredFees.value.slice(start, end)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredFees.value.length / itemsPerPage.value)
    )

    const totalStudents = computed(() => fees.value.length)
    const paidCount = computed(() => 
      fees.value.filter(fee => fee.status === 'paid').length
    )
    const unpaidCount = computed(() => 
      fees.value.filter(fee => fee.status === 'unpaid').length
    )
    const partialCount = computed(() => 
      fees.value.filter(fee => fee.status === 'partial').length
    )
    const totalCollected = computed(() => 
      fees.value.reduce((sum, fee) => sum + fee.paid, 0)
    )
    const collectionRate = computed(() => {
      if (totalStudents.value === 0) return 0
      const totalAmount = fees.value.reduce((sum, fee) => sum + fee.amount, 0)
      return Math.round((totalCollected.value / totalAmount) * 100)
    })

    // Methods
    const loadFees = () => {
      fees.value = getSampleFees()
      students.value = getSampleStudents()
    }

    const searchFees = () => {
      currentPage.value = 1
    }

    const filterFees = () => {
      currentPage.value = 1
    }

    const changePage = (page) => {
      currentPage.value = page
    }

    const showAddFeeModal = () => {
      isEditing.value = false
      editingId.value = null
      resetForm()
      showModal.value = true
    }

    const editFee = (fee) => {
      isEditing.value = true
      editingId.value = fee.id
      feeData.value = { ...fee }
      showModal.value = true
    }

    const viewFee = (fee) => {
      alert(`تفاصيل الرسوم: ${fee.studentName} - ${fee.feeType}`)
    }

    const closeModal = () => {
      showModal.value = false
      resetForm()
    }

    const resetForm = () => {
      feeData.value = {
        studentId: '',
        feeType: '',
        amount: '',
        paid: '',
        dueDate: '',
        status: 'unpaid',
        notes: ''
      }
    }

    const submitFee = () => {
      if (isEditing.value) {
        // Update existing fee
        const index = fees.value.findIndex(item => item.id === editingId.value)
        if (index !== -1) {
          fees.value[index] = { ...feeData.value, id: editingId.value }
        }
      } else {
        // Add new fee
        const newFee = {
          ...feeData.value,
          id: Date.now(),
          studentName: students.value.find(s => s.id === feeData.value.studentId)?.name || '',
          studentId: students.value.find(s => s.id === feeData.value.studentId)?.id || '',
          major: students.value.find(s => s.id === feeData.value.studentId)?.major || '',
          studentImage: students.value.find(s => s.id === feeData.value.studentId)?.image || '',
          remaining: feeData.value.amount - feeData.value.paid
        }
        fees.value.unshift(newFee)
      }
      
      closeModal()
    }

    const deleteFee = (id) => {
      if (confirm('هل أنت متأكد من حذف هذه الرسوم؟')) {
        fees.value = fees.value.filter(item => item.id !== id)
      }
    }

    const exportFees = () => {
      alert('سيتم تصدير تقرير الرسوم...')
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'paid': return 'status-active'
        case 'unpaid': return 'status-inactive'
        case 'partial': return 'status-pending'
        default: return ''
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'paid': return 'مدفوع'
        case 'unpaid': return 'غير مدفوع'
        case 'partial': return 'مدفوع جزئياً'
        default: return status
      }
    }

    const getSampleStudents = () => {
      return [
        { id: 'ST001', name: 'أحمد محمد', major: 'computer-science', image: 'https://via.placeholder.com/40' },
        { id: 'ST002', name: 'فاطمة علي', major: 'engineering', image: 'https://via.placeholder.com/40' },
        { id: 'ST003', name: 'محمد أحمد', major: 'business', image: 'https://via.placeholder.com/40' }
      ]
    }

    const getSampleFees = () => {
      return [
        {
          id: 1,
          studentName: 'أحمد محمد',
          studentId: 'ST001',
          major: 'computer-science',
          feeType: 'رسوم دراسية',
          amount: 5000,
          paid: 5000,
          remaining: 0,
          dueDate: '2024-02-15',
          status: 'paid',
          notes: 'تم الدفع كاملاً',
          studentImage: 'https://via.placeholder.com/40'
        },
        {
          id: 2,
          studentName: 'فاطمة علي',
          studentId: 'ST002',
          major: 'engineering',
          feeType: 'رسوم مختبر',
          amount: 2000,
          paid: 1000,
          remaining: 1000,
          dueDate: '2024-02-20',
          status: 'partial',
          notes: 'مدفوع جزئياً',
          studentImage: 'https://via.placeholder.com/40'
        },
        {
          id: 3,
          studentName: 'محمد أحمد',
          studentId: 'ST003',
          major: 'business',
          feeType: 'رسوم مكتبة',
          amount: 500,
          paid: 0,
          remaining: 500,
          dueDate: '2024-02-25',
          status: 'unpaid',
          notes: 'غير مدفوع',
          studentImage: 'https://via.placeholder.com/40'
        }
      ]
    }

    onMounted(() => {
      loadFees()
    })

    return {
      fees,
      students,
      searchQuery,
      selectedMajor,
      selectedStatus,
      selectedType,
      showModal,
      isEditing,
      currentPage,
      feeData,
      editingId,
      filteredFees,
      paginatedFees,
      totalPages,
      totalStudents,
      paidCount,
      unpaidCount,
      partialCount,
      totalCollected,
      collectionRate,
      searchFees,
      filterFees,
      changePage,
      showAddFeeModal,
      editFee,
      viewFee,
      closeModal,
      submitFee,
      deleteFee,
      exportFees,
      formatDate,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.fees-page {
  padding: 0;
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
  color: #2c3e50;
}

.student-id {
  font-size: 0.8rem;
  color: #6c757d;
}

.status-badge.status-active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.status-inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .student-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
