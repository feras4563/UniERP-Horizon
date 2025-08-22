<template>
  <div class="chart-of-accounts-page">
    <h1>دليل الحسابات</h1>
    
    <div class="tree-view">
      <div class="tree-item" v-for="item in items" :key="item.id">
        <div class="tree-node" @click="toggleNode(item.id)">
          <div class="node-content">
            <div class="node-toggle" v-if="item.children && item.children.length > 0">
              <i :class="expandedNodes.includes(item.id) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
            </div>
            <div class="node-icon">
              <i class="fas fa-folder"></i>
            </div>
            <div class="node-title">{{ item.title }}</div>
            <div class="node-actions" v-if="selectedNode === item.id">
              <button class="btn-action btn-add" @click.stop="showAddAccountModal(item.id)" title="إضافة حساب">
                <i class="fas fa-plus"></i>
              </button>
              <button class="btn-action btn-view" @click.stop="viewAccount(item)" title="عرض">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-action btn-edit" @click.stop="editAccount(item)" title="تعديل">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-action btn-delete" @click.stop="deleteAccount(item.id)" title="حذف">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Children -->
        <div class="tree-children" v-if="item.children && item.children.length > 0 && expandedNodes.includes(item.id)">
          <div class="tree-item" v-for="child in item.children" :key="child.id">
            <div class="tree-node child-node" @click="toggleNode(child.id)">
              <div class="node-content">
                <div class="node-toggle" v-if="child.children && child.children.length > 0">
                  <i :class="expandedNodes.includes(child.id) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                </div>
                <div class="node-icon">
                  <i class="fas fa-folder"></i>
                </div>
                <div class="node-title">{{ child.title }}</div>
                <div class="node-actions" v-if="selectedNode === child.id">
                  <button class="btn-action btn-add" @click.stop="showAddAccountModal(child.id)" title="إضافة حساب">
                    <i class="fas fa-plus"></i>
                  </button>
                  <button class="btn-action btn-view" @click.stop="viewAccount(child)" title="عرض">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-action btn-edit" @click.stop="editAccount(child)" title="تعديل">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action btn-delete" @click.stop="deleteAccount(child.id)" title="حذف">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Grandchildren -->
            <div class="tree-children" v-if="child.children && child.children.length > 0 && expandedNodes.includes(child.id)">
              <div class="tree-item" v-for="grandchild in child.children" :key="grandchild.id">
                <div class="tree-node grandchild-node" @click="selectNode(grandchild.id)">
                  <div class="node-content">
                    <div class="node-icon">
                      <i class="fas fa-file"></i>
                    </div>
                    <div class="node-title">{{ grandchild.title }}</div>
                    <div class="node-actions" v-if="selectedNode === grandchild.id">
                      <button class="btn-action btn-add" @click.stop="showAddAccountModal(grandchild.id)" title="إضافة حساب">
                        <i class="fas fa-plus"></i>
                      </button>
                      <button class="btn-action btn-view" @click.stop="viewAccount(grandchild)" title="عرض">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-action btn-edit" @click.stop="editAccount(grandchild)" title="تعديل">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-action btn-delete" @click.stop="deleteAccount(grandchild.id)" title="حذف">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Account Modal -->
    <div class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">إضافة حساب جديد</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAccount">
            <div class="form-group">
              <label>اسم الحساب</label>
              <input type="text" v-model="newAccount.title" class="form-control" required>
            </div>
            <div class="form-navigation">
              <button type="button" class="btn btn-secondary" @click="closeModal">إلغاء</button>
              <button type="submit" class="btn btn-primary">إضافة</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ChartOfAccounts',
  setup() {
    const items = ref([])
    const expandedNodes = ref([])
    const selectedNode = ref(null)
    const showModal = ref(false)
    const parentId = ref(null)

    const newAccount = ref({
      title: ''
    })

    const toggleNode = (nodeId) => {
      const index = expandedNodes.value.indexOf(nodeId)
      if (index > -1) {
        expandedNodes.value.splice(index, 1)
      } else {
        expandedNodes.value.push(nodeId)
      }
      // Select the clicked node
      selectNode(nodeId)
    }

    const selectNode = (nodeId) => {
      selectedNode.value = selectedNode.value === nodeId ? null : nodeId
    }

    const showAddAccountModal = (id) => {
      parentId.value = id
      newAccount.value.title = ''
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      newAccount.value.title = ''
      parentId.value = null
    }

    const submitAccount = () => {
      if (newAccount.value.title.trim()) {
        const account = {
          id: Date.now(),
          title: newAccount.value.title.trim(),
          children: []
        }
        
        addAccountToParent(account, parentId.value)
        closeModal()
      }
    }

    const addAccountToParent = (account, parentId) => {
      if (parentId) {
        const parent = findItemById(items.value, parentId)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(account)
        }
      }
    }

    const findItemById = (items, id) => {
      for (let item of items) {
        if (item.id === id) return item
        if (item.children && item.children.length > 0) {
          const found = findItemById(item.children, id)
          if (found) return found
        }
      }
      return null
    }

    const viewAccount = (account) => {
      alert(`عرض تفاصيل الحساب: ${account.title}`)
    }

    const editAccount = (account) => {
      alert(`تعديل الحساب: ${account.title}`)
    }

    const deleteAccount = (id) => {
      if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
        // Remove the account from the tree
        removeAccountById(items.value, id)
        selectedNode.value = null
      }
    }

    const removeAccountById = (items, id) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          items.splice(i, 1)
          return true
        }
        if (items[i].children && items[i].children.length > 0) {
          if (removeAccountById(items[i].children, id)) {
            return true
          }
        }
      }
      return false
    }

    const loadAccounts = () => {
      items.value = [
        {
          id: 1,
          title: 'الأصول',
          children: [
            {
              id: 11,
              title: 'الأصول المتداولة',
              children: [
                { id: 111, title: 'النقد وما في حكمه' },
                { id: 112, title: 'المدينون' },
              ],
            },
            {
              id: 12,
              title: 'الأصول الثابتة',
              children: [
                { id: 121, title: 'المباني' },
                { id: 122, title: 'المعدات' },
              ],
            },
          ],
        },
        {
          id: 2,
          title: 'الخصوم',
          children: [
            { id: 21, title: 'الخصوم المتداولة' },
            { id: 22, title: 'الخصوم طويلة الأجل' },
          ],
        },
        {
          id: 3,
          title: 'حقوق الملكية',
          children: [
            { id: 31, title: 'رأس المال' },
            { id: 32, title: 'الأرباح المحتجزة' },
          ],
        },
        {
          id: 4,
          title: 'الإيرادات',
          children: [
            { id: 41, title: 'إيرادات الرسوم' },
            { id: 42, title: 'إيرادات أخرى' },
          ],
        },
        {
          id: 5,
          title: 'المصروفات',
          children: [
            { id: 51, title: 'مصروفات الرواتب' },
            { id: 52, title: 'مصروفات التشغيل' },
          ],
        },
      ]
      // Expand root nodes by default
      expandedNodes.value = items.value.map(item => item.id)
    }

    onMounted(() => {
      loadAccounts()
    })

    return {
      items,
      expandedNodes,
      selectedNode,
      showModal,
      parentId,
      newAccount,
      toggleNode,
      selectNode,
      showAddAccountModal,
      closeModal,
      submitAccount,
      viewAccount,
      editAccount,
      deleteAccount
    }
  }
}
</script>

<style scoped>
.chart-of-accounts-page {
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.tree-view {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tree-item {
  margin-bottom: 0.25rem;
}

.tree-node {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tree-node:hover {
  background: #f8f9fa;
}

.child-node {
  margin-left: 1.5rem;
}

.grandchild-node {
  margin-left: 1.5rem;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.75rem;
}

.node-toggle {
  width: 16px;
  text-align: center;
  color: #6c757d;
}

.node-icon {
  width: 20px;
  text-align: center;
  color: #6c757d;
}

.node-title {
  color: #495057;
  font-weight: 500;
  flex: 1;
}

.node-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.btn-action {
  width: 28px;
  height: 28px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  background: white;
}

.btn-add {
  background: #28a745;
  color: white;
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

.tree-children {
  margin-left: 1rem;
  border-left: 1px solid #e9ecef;
  padding-left: 1rem;
}

/* Modal Styles */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal.show {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
  color: #2c3e50;
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
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #27ae60;
  box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2);
}

.form-navigation {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #27ae60;
  color: white;
}

.btn-primary:hover {
  background: #218838;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
