<template>
  <div class="journal-entry-page">
    <!-- Content Header -->
    <div class="content-header">
      <h1>القيود اليومية</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddEntryModal">
          <i class="fas fa-plus"></i>
          إضافة قيد
        </button>
        <button class="btn btn-secondary" @click="exportJournal">
          <i class="fas fa-download"></i>
          تصدير اليومية
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="searchEntries"
          placeholder="البحث في القيود..."
        />
      </div>
      <div class="filters">
        <select v-model="selectedType" @change="filterEntries">
          <option value="">جميع الأنواع</option>
          <option value="regular">عادي</option>
          <option value="adjusting">تسوية</option>
          <option value="closing">إقفال</option>
        </select>
        <select v-model="selectedStatus" @change="filterEntries">
          <option value="">جميع الحالات</option>
          <option value="posted">مرحل</option>
          <option value="draft">مسودة</option>
          <option value="void">ملغي</option>
        </select>
        <input 
          type="date" 
          v-model="selectedDate" 
          @change="filterEntries"
          class="form-control"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-icon">
          <i class="fas fa-book"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalEntries }}</div>
          <div class="card-label">إجمالي القيود</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #007bff;">
        <div class="card-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ postedEntries }}</div>
          <div class="card-label">القيود المرفلة</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-icon">
          <i class="fas fa-edit"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ draftEntries }}</div>
          <div class="card-label">المسودات</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalDebit }}</div>
          <div class="card-label">إجمالي المدين</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #6f42c1;">
        <div class="card-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalCredit }}</div>
          <div class="card-label">إجمالي الدائن</div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>رقم القيد</th>
            <th>التاريخ</th>
            <th>الوصف</th>
            <th>النوع</th>
            <th>المدين</th>
            <th>الدائن</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in paginatedEntries" :key="entry.id">
            <td>
              <div class="entry-number">
                <span class="number">{{ entry.entryNumber }}</span>
                <span class="reference" v-if="entry.reference">
                  ({{ entry.reference }})
                </span>
              </div>
            </td>
            <td>{{ formatDate(entry.date) }}</td>
            <td>
              <div class="entry-description">
                <span>{{ entry.description }}</span>
                <span class="entry-details" v-if="entry.details">
                  {{ entry.details }}
                </span>
              </div>
            </td>
            <td>
              <span class="entry-type" :class="getTypeClass(entry.type)">
                {{ getTypeText(entry.type) }}
              </span>
            </td>
            <td>
              <span class="debit-amount">
                {{ formatAmount(entry.debit) }}
              </span>
            </td>
            <td>
              <span class="credit-amount">
                {{ formatAmount(entry.credit) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(entry.status)">
                {{ getStatusText(entry.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-view" @click="viewEntry(entry)" title="عرض">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" @click="editEntry(entry)" title="تعديل">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-post" v-if="entry.status === 'draft'" @click="postEntry(entry.id)" title="ترحيل">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn-action btn-delete" @click="deleteEntry(entry.id)" title="حذف">
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

    <!-- Add/Edit Entry Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? 'تعديل القيد' : 'إضافة قيد جديد' }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEntry">
            <div class="form-row">
              <div class="form-group">
                <label>رقم القيد</label>
                <input type="text" v-model="entryData.entryNumber" class="form-control" required>
              </div>
              <div class="form-group">
                <label>التاريخ</label>
                <input type="date" v-model="entryData.date" class="form-control" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>الوصف</label>
                <input type="text" v-model="entryData.description" class="form-control" required>
              </div>
              <div class="form-group">
                <label>النوع</label>
                <select v-model="entryData.type" class="form-control" required>
                  <option value="">اختر نوع القيد</option>
                  <option value="regular">عادي</option>
                  <option value="adjusting">تسوية</option>
                  <option value="closing">إقفال</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>المرجع</label>
                <input type="text" v-model="entryData.reference" class="form-control">
              </div>
              <div class="form-group">
                <label>الحالة</label>
                <select v-model="entryData.status" class="form-control" required>
                  <option value="draft">مسودة</option>
                  <option value="posted">مرحل</option>
                </select>
              </div>
            </div>
            
            <!-- Entry Lines -->
            <div class="entry-lines">
              <h4>تفاصيل القيد</h4>
              <div class="entry-line" v-for="(line, index) in entryData.lines" :key="index">
                <div class="form-row">
                  <div class="form-group">
                    <label>الحساب</label>
                    <select v-model="line.accountId" class="form-control" required>
                      <option value="">اختر الحساب</option>
                      <option v-for="account in accounts" :key="account.id" :value="account.id">
                        {{ account.accountNumber }} - {{ account.accountName }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>المدين</label>
                    <input type="number" v-model="line.debit" class="form-control" min="0" step="0.01">
                  </div>
                  <div class="form-group">
                    <label>الدائن</label>
                    <input type="number" v-model="line.credit" class="form-control" min="0" step="0.01">
                  </div>
                  <div class="form-group">
                    <label>الوصف</label>
                    <input type="text" v-model="line.description" class="form-control">
                  </div>
                  <button type="button" class="btn btn-danger" @click="removeLine(index)" v-if="entryData.lines.length > 2">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <button type="button" class="btn btn-secondary" @click="addLine">
                <i class="fas fa-plus"></i>
                إضافة سطر
              </button>
            </div>

            <div class="form-group">
              <label>ملاحظات</label>
              <textarea v-model="entryData.notes" class="form-control" rows="3"></textarea>
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
  name: 'JournalEntry',
  setup() {
    const entries = ref([])
    const accounts = ref([])
    const searchQuery = ref('')
    const selectedType = ref('')
    const selectedStatus = ref('')
    const selectedDate = ref('')
    const showModal = ref(false)
    const isEditing = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const editingId = ref(null)

    const entryData = ref({
      entryNumber: '',
      date: '',
      description: '',
      type: 'regular',
      reference: '',
      status: 'draft',
      notes: '',
      lines: [
        { accountId: '', debit: '', credit: '', description: '' },
        { accountId: '', debit: '', credit: '', description: '' }
      ]
    })

    // Computed properties
    const filteredEntries = computed(() => {
      let filtered = entries.value

      if (searchQuery.value) {
        filtered = filtered.filter(entry => 
          entry.entryNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          entry.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedType.value) {
        filtered = filtered.filter(entry => entry.type === selectedType.value)
      }

      if (selectedStatus.value) {
        filtered = filtered.filter(entry => entry.status === selectedStatus.value)
      }

      if (selectedDate.value) {
        filtered = filtered.filter(entry => entry.date === selectedDate.value)
      }

      return filtered
    })

    const paginatedEntries = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredEntries.value.slice(start, end)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredEntries.value.length / itemsPerPage.value)
    )

    const totalEntries = computed(() => entries.value.length)
    const postedEntries = computed(() => 
      entries.value.filter(entry => entry.status === 'posted').length
    )
    const draftEntries = computed(() => 
      entries.value.filter(entry => entry.status === 'draft').length
    )
    const totalDebit = computed(() => 
      entries.value.reduce((sum, entry) => sum + entry.debit, 0)
    )
    const totalCredit = computed(() => 
      entries.value.reduce((sum, entry) => sum + entry.credit, 0)
    )

    // Methods
    const loadEntries = () => {
      entries.value = getSampleEntries()
      accounts.value = getSampleAccounts()
    }

    const searchEntries = () => {
      currentPage.value = 1
    }

    const filterEntries = () => {
      currentPage.value = 1
    }

    const changePage = (page) => {
      currentPage.value = page
    }

    const showAddEntryModal = () => {
      isEditing.value = false
      editingId.value = null
      resetForm()
      showModal.value = true
    }

    const editEntry = (entry) => {
      isEditing.value = true
      editingId.value = entry.id
      entryData.value = { ...entry }
      showModal.value = true
    }

    const viewEntry = (entry) => {
      alert(`تفاصيل القيد: ${entry.entryNumber} - ${entry.description}`)
    }

    const postEntry = (id) => {
      const index = entries.value.findIndex(item => item.id === id)
      if (index !== -1) {
        entries.value[index].status = 'posted'
      }
    }

    const closeModal = () => {
      showModal.value = false
      resetForm()
    }

    const resetForm = () => {
      entryData.value = {
        entryNumber: '',
        date: '',
        description: '',
        type: 'regular',
        reference: '',
        status: 'draft',
        notes: '',
        lines: [
          { accountId: '', debit: '', credit: '', description: '' },
          { accountId: '', debit: '', credit: '', description: '' }
        ]
      }
    }

    const addLine = () => {
      entryData.value.lines.push({ accountId: '', debit: '', credit: '', description: '' })
    }

    const removeLine = (index) => {
      if (entryData.value.lines.length > 2) {
        entryData.value.lines.splice(index, 1)
      }
    }

    const submitEntry = () => {
      if (isEditing.value) {
        // Update existing entry
        const index = entries.value.findIndex(item => item.id === editingId.value)
        if (index !== -1) {
          entries.value[index] = { ...entryData.value, id: editingId.value }
        }
      } else {
        // Add new entry
        const newEntry = {
          ...entryData.value,
          id: Date.now(),
          debit: entryData.value.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0),
          credit: entryData.value.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0)
        }
        entries.value.unshift(newEntry)
      }
      
      closeModal()
    }

    const deleteEntry = (id) => {
      if (confirm('هل أنت متأكد من حذف هذا القيد؟')) {
        entries.value = entries.value.filter(item => item.id !== id)
      }
    }

    const exportJournal = () => {
      alert('سيتم تصدير اليومية...')
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatAmount = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2
      }).format(amount)
    }

    const getTypeClass = (type) => {
      const classes = {
        'regular': 'type-regular',
        'adjusting': 'type-adjusting',
        'closing': 'type-closing'
      }
      return classes[type] || ''
    }

    const getTypeText = (type) => {
      const texts = {
        'regular': 'عادي',
        'adjusting': 'تسوية',
        'closing': 'إقفال'
      }
      return texts[type] || type
    }

    const getStatusClass = (status) => {
      const classes = {
        'posted': 'status-active',
        'draft': 'status-pending',
        'void': 'status-inactive'
      }
      return classes[status] || ''
    }

    const getStatusText = (status) => {
      const texts = {
        'posted': 'مرحل',
        'draft': 'مسودة',
        'void': 'ملغي'
      }
      return texts[status] || status
    }

    const getSampleAccounts = () => {
      return [
        { id: 1, accountNumber: '1000', accountName: 'النقد' },
        { id: 2, accountNumber: '2000', accountName: 'المدينون' },
        { id: 3, accountNumber: '3000', accountName: 'المصروفات' },
        { id: 4, accountNumber: '4000', accountName: 'الإيرادات' }
      ]
    }

    const getSampleEntries = () => {
      return [
        {
          id: 1,
          entryNumber: 'JE-001',
          date: '2024-02-15',
          description: 'تسجيل مصروفات المكتب',
          type: 'regular',
          reference: 'INV-001',
          status: 'posted',
          debit: 500,
          credit: 500,
          notes: 'مصروفات مكتبية للشهر الحالي'
        },
        {
          id: 2,
          entryNumber: 'JE-002',
          date: '2024-02-16',
          description: 'تسجيل إيرادات الخدمات',
          type: 'regular',
          reference: 'SRV-001',
          status: 'posted',
          debit: 1000,
          credit: 1000,
          notes: 'إيرادات خدمات مقدمة'
        }
      ]
    }

    onMounted(() => {
      loadEntries()
    })

    return {
      entries,
      accounts,
      searchQuery,
      selectedType,
      selectedStatus,
      selectedDate,
      showModal,
      isEditing,
      currentPage,
      entryData,
      editingId,
      filteredEntries,
      paginatedEntries,
      totalPages,
      totalEntries,
      postedEntries,
      draftEntries,
      totalDebit,
      totalCredit,
      searchEntries,
      filterEntries,
      changePage,
      showAddEntryModal,
      editEntry,
      viewEntry,
      postEntry,
      closeModal,
      addLine,
      removeLine,
      submitEntry,
      deleteEntry,
      exportJournal,
      formatDate,
      formatAmount,
      getTypeClass,
      getTypeText,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.journal-entry-page {
  padding: 0;
}

.entry-number {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.number {
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Courier New', monospace;
}

.reference {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.entry-description {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.entry-details {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.entry-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.type-regular {
  background-color: #d4edda;
  color: #155724;
}

.type-adjusting {
  background-color: #fff3cd;
  color: #856404;
}

.type-closing {
  background-color: #f8d7da;
  color: #721c24;
}

.debit-amount {
  font-weight: 600;
  color: #dc3545;
  font-family: 'Courier New', monospace;
}

.credit-amount {
  font-weight: 600;
  color: #28a745;
  font-family: 'Courier New', monospace;
}

.status-badge.status-active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.status-inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.entry-lines {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.entry-lines h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
}

.entry-line {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.btn-post {
  background-color: #28a745;
  color: white;
}

.btn-post:hover {
  background-color: #218838;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .entry-number {
    align-items: flex-start;
  }
}
</style>
