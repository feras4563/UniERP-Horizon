<template>
  <div class="general-ledger-page">
    <!-- Content Header -->
    <div class="content-header">
      <h1>الأستاذ العام</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="exportLedger">
          <i class="fas fa-download"></i>
          تصدير الأستاذ
        </button>
        <button class="btn btn-secondary" @click="printLedger">
          <i class="fas fa-print"></i>
          طباعة
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
          @input="searchAccounts"
          placeholder="البحث في الحسابات..."
        />
      </div>
      <div class="filters">
        <select v-model="selectedAccount" @change="filterTransactions">
          <option value="">جميع الحسابات</option>
          <option v-for="account in accounts" :key="account.id" :value="account.id">
            {{ account.accountNumber }} - {{ account.accountName }}
          </option>
        </select>
        <select v-model="selectedPeriod" @change="filterTransactions">
          <option value="">جميع الفترات</option>
          <option value="current">الفترة الحالية</option>
          <option value="previous">الفترة السابقة</option>
          <option value="year">السنة الحالية</option>
        </select>
        <div class="date-range">
          <input 
            type="date" 
            v-model="startDate" 
            @change="filterTransactions"
            class="form-control"
            placeholder="من تاريخ"
          />
          <span class="date-separator">إلى</span>
          <input 
            type="date" 
            v-model="endDate" 
            @change="filterTransactions"
            class="form-control"
            placeholder="إلى تاريخ"
          />
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card" style="border-left: 4px solid #28a745;">
        <div class="card-icon">
          <i class="fas fa-sitemap"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalAccounts }}</div>
          <div class="card-label">إجمالي الحسابات</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #007bff;">
        <div class="card-icon">
          <i class="fas fa-exchange-alt"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalTransactions }}</div>
          <div class="card-label">إجمالي المعاملات</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #ffc107;">
        <div class="card-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalDebit }}</div>
          <div class="card-label">إجمالي المدين</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #17a2b8;">
        <div class="card-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalCredit }}</div>
          <div class="card-label">إجمالي الدائن</div>
        </div>
      </div>

      <div class="summary-card" style="border-left: 4px solid #6f42c1;">
        <div class="card-icon">
          <i class="fas fa-calculator"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ netBalance }}</div>
          <div class="card-label">الرصيد الصافي</div>
        </div>
      </div>
    </div>

    <!-- Account Summary Table -->
    <div class="table-container">
      <h3>ملخص الحسابات</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>رقم الحساب</th>
            <th>اسم الحساب</th>
            <th>النوع</th>
            <th>الرصيد الافتتاحي</th>
            <th>إجمالي المدين</th>
            <th>إجمالي الدائن</th>
            <th>الرصيد الحالي</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in paginatedAccounts" :key="account.id">
            <td>
              <span class="account-number">{{ account.accountNumber }}</span>
            </td>
            <td>
              <div class="account-name">
                <span>{{ account.accountName }}</span>
                <span class="account-type-label" v-if="account.type">
                  ({{ getTypeText(account.type) }})
                </span>
              </div>
            </td>
            <td>
              <span class="account-type" :class="getTypeClass(account.type)">
                {{ getTypeText(account.type) }}
              </span>
            </td>
            <td>
              <span class="opening-balance" :class="getBalanceClass(account.openingBalance, account.type)">
                {{ formatAmount(account.openingBalance) }}
              </span>
            </td>
            <td>
              <span class="debit-total">
                {{ formatAmount(account.totalDebit) }}
              </span>
            </td>
            <td>
              <span class="credit-total">
                {{ formatAmount(account.totalCredit) }}
              </span>
            </td>
            <td>
              <span class="current-balance" :class="getBalanceClass(account.currentBalance, account.type)">
                {{ formatAmount(account.currentBalance) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action btn-view" @click="viewAccountDetails(account)" title="عرض التفاصيل">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-print" @click="printAccount(account.id)" title="طباعة">
                  <i class="fas fa-print"></i>
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

    <!-- Account Details Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3 class="modal-title">تفاصيل الحساب: {{ selectedAccount?.accountName }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="account-summary">
            <div class="summary-row">
              <div class="summary-item">
                <label>رقم الحساب:</label>
                <span>{{ selectedAccount?.accountNumber }}</span>
              </div>
              <div class="summary-item">
                <label>النوع:</label>
                <span>{{ getTypeText(selectedAccount?.type) }}</span>
              </div>
              <div class="summary-item">
                <label>الرصيد الافتتاحي:</label>
                <span>{{ formatAmount(selectedAccount?.openingBalance) }}</span>
              </div>
            </div>
            <div class="summary-row">
              <div class="summary-item">
                <label>إجمالي المدين:</label>
                <span>{{ formatAmount(selectedAccount?.totalDebit) }}</span>
              </div>
              <div class="summary-item">
                <label>إجمالي الدائن:</label>
                <span>{{ formatAmount(selectedAccount?.totalCredit) }}</span>
              </div>
              <div class="summary-item">
                <label>الرصيد الحالي:</label>
                <span>{{ formatAmount(selectedAccount?.currentBalance) }}</span>
              </div>
            </div>
          </div>

          <div class="transactions-section">
            <h4>المعاملات</h4>
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>رقم القيد</th>
                  <th>الوصف</th>
                  <th>المدين</th>
                  <th>الدائن</th>
                  <th>الرصيد</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in accountTransactions" :key="transaction.id">
                  <td>{{ formatDate(transaction.date) }}</td>
                  <td>{{ transaction.entryNumber }}</td>
                  <td>{{ transaction.description }}</td>
                  <td>
                    <span class="debit-amount" v-if="transaction.debit > 0">
                      {{ formatAmount(transaction.debit) }}
                    </span>
                  </td>
                  <td>
                    <span class="credit-amount" v-if="transaction.credit > 0">
                      {{ formatAmount(transaction.credit) }}
                    </span>
                  </td>
                  <td>
                    <span class="running-balance" :class="getBalanceClass(transaction.runningBalance, selectedAccount?.type)">
                      {{ formatAmount(transaction.runningBalance) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'GeneralLedger',
  setup() {
    const accounts = ref([])
    const searchQuery = ref('')
    const selectedAccount = ref('')
    const selectedPeriod = ref('')
    const startDate = ref('')
    const endDate = ref('')
    const showModal = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const selectedAccountData = ref(null)

    // Computed properties
    const filteredAccounts = computed(() => {
      let filtered = accounts.value

      if (searchQuery.value) {
        filtered = filtered.filter(account => 
          account.accountNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          account.accountName.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      return filtered
    })

    const paginatedAccounts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredAccounts.value.slice(start, end)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredAccounts.value.length / itemsPerPage.value)
    )

    const totalAccounts = computed(() => accounts.value.length)
    const totalTransactions = computed(() => 
      accounts.value.reduce((sum, account) => sum + account.transactionCount, 0)
    )
    const totalDebit = computed(() => 
      accounts.value.reduce((sum, account) => sum + account.totalDebit, 0)
    )
    const totalCredit = computed(() => 
      accounts.value.reduce((sum, account) => sum + account.totalCredit, 0)
    )
    const netBalance = computed(() => totalDebit.value - totalCredit.value)

    const accountTransactions = computed(() => {
      if (!selectedAccountData.value) return []
      return selectedAccountData.value.transactions || []
    })

    // Methods
    const loadAccounts = () => {
      accounts.value = getSampleAccounts()
    }

    const searchAccounts = () => {
      currentPage.value = 1
    }

    const filterTransactions = () => {
      // Filter functionality
    }

    const changePage = (page) => {
      currentPage.value = page
    }

    const viewAccountDetails = (account) => {
      selectedAccountData.value = account
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      selectedAccountData.value = null
    }

    const printAccount = (accountId) => {
      alert(`سيتم طباعة الحساب: ${accountId}`)
    }

    const exportLedger = () => {
      alert('سيتم تصدير الأستاذ العام...')
    }

    const printLedger = () => {
      alert('سيتم طباعة الأستاذ العام...')
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
        'asset': 'type-asset',
        'liability': 'type-liability',
        'equity': 'type-equity',
        'revenue': 'type-revenue',
        'expense': 'type-expense'
      }
      return classes[type] || ''
    }

    const getTypeText = (type) => {
      const texts = {
        'asset': 'أصول',
        'liability': 'خصوم',
        'equity': 'حقوق ملكية',
        'revenue': 'إيرادات',
        'expense': 'مصروفات'
      }
      return texts[type] || type
    }

    const getBalanceClass = (balance, type) => {
      if (type === 'asset' || type === 'expense') {
        return balance >= 0 ? 'balance-positive' : 'balance-negative'
      } else {
        return balance >= 0 ? 'balance-negative' : 'balance-positive'
      }
    }

    const getSampleAccounts = () => {
      return [
        {
          id: 1,
          accountNumber: '1000',
          accountName: 'النقد وما في حكمه',
          type: 'asset',
          openingBalance: 100000,
          totalDebit: 50000,
          totalCredit: 30000,
          currentBalance: 120000,
          transactionCount: 15
        },
        {
          id: 2,
          accountNumber: '2000',
          accountName: 'المدينون',
          type: 'asset',
          openingBalance: 50000,
          totalDebit: 25000,
          totalCredit: 15000,
          currentBalance: 60000,
          transactionCount: 12
        },
        {
          id: 3,
          accountNumber: '3000',
          accountName: 'المصروفات',
          type: 'expense',
          openingBalance: 0,
          totalDebit: 75000,
          totalCredit: 0,
          currentBalance: 75000,
          transactionCount: 20
        },
        {
          id: 4,
          accountNumber: '4000',
          accountName: 'الإيرادات',
          type: 'revenue',
          openingBalance: 0,
          totalDebit: 0,
          totalCredit: 100000,
          currentBalance: -100000,
          transactionCount: 18
        }
      ]
    }

    onMounted(() => {
      loadAccounts()
    })

    return {
      accounts,
      searchQuery,
      selectedAccount,
      selectedPeriod,
      startDate,
      endDate,
      showModal,
      currentPage,
      selectedAccountData,
      filteredAccounts,
      paginatedAccounts,
      totalPages,
      totalAccounts,
      totalTransactions,
      totalDebit,
      totalCredit,
      netBalance,
      accountTransactions,
      searchAccounts,
      filterTransactions,
      changePage,
      viewAccountDetails,
      closeModal,
      printAccount,
      exportLedger,
      printLedger,
      formatDate,
      formatAmount,
      getTypeClass,
      getTypeText,
      getBalanceClass
    }
  }
}
</script>

<style scoped>
.general-ledger-page {
  padding: 0;
}

.account-number {
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Courier New', monospace;
}

.account-name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-type-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.account-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.type-asset {
  background-color: #d4edda;
  color: #155724;
}

.type-liability {
  background-color: #f8d7da;
  color: #721c24;
}

.type-equity {
  background-color: #fff3cd;
  color: #856404;
}

.type-revenue {
  background-color: #d1ecf1;
  color: #0c5460;
}

.type-expense {
  background-color: #f8d7da;
  color: #721c24;
}

.opening-balance,
.current-balance {
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.debit-total {
  font-weight: 600;
  color: #dc3545;
  font-family: 'Courier New', monospace;
}

.credit-total {
  font-weight: 600;
  color: #28a745;
  font-family: 'Courier New', monospace;
}

.balance-positive {
  color: #28a745;
}

.balance-negative {
  color: #dc3545;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-separator {
  color: #6c757d;
  font-weight: 500;
}

.modal-large {
  max-width: 90%;
  width: 1200px;
}

.account-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 1rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}

.summary-item span {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
}

.transactions-section h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.transactions-table th {
  background-color: #f8f9fa;
  padding: 0.75rem;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.transactions-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.transactions-table tbody tr:hover {
  background-color: #f8f9fa;
}

.running-balance {
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.btn-print {
  background-color: #17a2b8;
  color: white;
}

.btn-print:hover {
  background-color: #138496;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .summary-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .date-range {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modal-large {
    max-width: 95%;
    width: auto;
  }
}
</style>
