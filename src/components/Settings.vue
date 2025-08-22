<template>
  <div class="settings-page">
    <div class="content-header">
      <h1>إعدادات النظام</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="saveAllSettings" :disabled="saving">
          <i class="fas fa-save"></i>
          {{ saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات' }}
        </button>
        <button class="btn btn-secondary" @click="resetToDefaults">
          <i class="fas fa-undo"></i>
          إعادة تعيين
        </button>
      </div>
    </div>

    <!-- Settings Tabs -->
    <div class="settings-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
      >
        <i :class="tab.icon"></i>
        {{ tab.name }}
      </button>
    </div>

    <!-- General Settings -->
    <div v-if="activeTab === 'general'" class="settings-section">
      <div class="settings-card">
        <h3>الإعدادات العامة</h3>
        <div class="form-group">
          <label>اسم المؤسسة</label>
          <input 
            type="text" 
            v-model="settings.general.institutionName" 
            class="form-control"
            placeholder="اسم المؤسسة التعليمية"
          >
        </div>
        <div class="form-group">
          <label>اللغة الافتراضية</label>
          <select v-model="settings.general.defaultLanguage" class="form-control">
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="form-group">
          <label>المنطقة الزمنية</label>
          <select v-model="settings.general.timezone" class="form-control">
            <option value="Asia/Riyadh">الرياض (GMT+3)</option>
            <option value="Asia/Dubai">دبي (GMT+4)</option>
            <option value="Europe/London">لندن (GMT+0)</option>
            <option value="America/New_York">نيويورك (GMT-5)</option>
          </select>
        </div>
        <div class="form-group">
          <label>تنسيق التاريخ</label>
          <select v-model="settings.general.dateFormat" class="form-control">
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Academic Settings -->
    <div v-if="activeTab === 'academic'" class="settings-section">
      <div class="settings-card">
        <h3>الإعدادات الأكاديمية</h3>
        <div class="form-group">
          <label>عدد الفصول الدراسية</label>
          <input 
            type="number" 
            v-model="settings.academic.semesters" 
            class="form-control"
            min="1"
            max="4"
          >
        </div>
        <div class="form-group">
          <label>الحد الأقصى للساعات المعتمدة</label>
          <input 
            type="number" 
            v-model="settings.academic.maxCredits" 
            class="form-control"
            min="15"
            max="25"
          >
        </div>
        <div class="form-group">
          <label>المعدل التراكمي الأدنى للتخرج</label>
          <input 
            type="number" 
            v-model="settings.academic.minGPA" 
            class="form-control"
            min="1.0"
            max="4.0"
            step="0.1"
          >
        </div>
        <div class="form-group">
          <label>عدد أيام الحضور المطلوبة (%)</label>
          <input 
            type="number" 
            v-model="settings.academic.attendanceThreshold" 
            class="form-control"
            min="70"
            max="100"
          >
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div v-if="activeTab === 'notifications'" class="settings-section">
      <div class="settings-card">
        <h3>إعدادات الإشعارات</h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="settings.notifications.emailNotifications"
            >
            تفعيل الإشعارات عبر البريد الإلكتروني
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="settings.notifications.smsNotifications"
            >
            تفعيل الإشعارات عبر الرسائل النصية
          </label>
        </div>
        <div class="form-group">
          <label>البريد الإلكتروني للإشعارات</label>
          <input 
            type="email" 
            v-model="settings.notifications.adminEmail" 
            class="form-control"
            placeholder="admin@institution.edu"
          >
        </div>
        <div class="form-group">
          <label>عدد أيام تذكير الرسوم</label>
          <input 
            type="number" 
            v-model="settings.notifications.feeReminderDays" 
            class="form-control"
            min="1"
            max="30"
          >
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div v-if="activeTab === 'security'" class="settings-section">
      <div class="settings-card">
        <h3>إعدادات الأمان</h3>
        <div class="form-group">
          <label>الحد الأدنى لطول كلمة المرور</label>
          <input 
            type="number" 
            v-model="settings.security.minPasswordLength" 
            class="form-control"
            min="8"
            max="20"
          >
        </div>
        <div class="form-group">
          <label>مدة انتهاء صلاحية الجلسة (بالدقائق)</label>
          <input 
            type="number" 
            v-model="settings.security.sessionTimeout" 
            class="form-control"
            min="15"
            max="480"
          >
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="settings.security.requireTwoFactor"
            >
            تفعيل المصادقة الثنائية
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="settings.security.logUserActions"
            >
            تسجيل جميع إجراءات المستخدمين
          </label>
        </div>
      </div>
    </div>

    <!-- Backup & Maintenance -->
    <div v-if="activeTab === 'maintenance'" class="settings-section">
      <div class="settings-card">
        <h3>النسخ الاحتياطي والصيانة</h3>
        <div class="form-group">
          <label>تفعيل النسخ الاحتياطي التلقائي</label>
          <select v-model="settings.maintenance.autoBackup" class="form-control">
            <option value="daily">يومياً</option>
            <option value="weekly">أسبوعياً</option>
            <option value="monthly">شهرياً</option>
            <option value="disabled">معطل</option>
          </select>
        </div>
        <div class="form-group">
          <label>عدد النسخ الاحتياطية المحتفظ بها</label>
          <input 
            type="number" 
            v-model="settings.maintenance.backupRetention" 
            class="form-control"
            min="1"
            max="30"
          >
        </div>
        <div class="form-group">
          <label>تفعيل وضع الصيانة</label>
          <select v-model="settings.maintenance.maintenanceMode" class="form-control">
            <option value="disabled">معطل</option>
            <option value="enabled">مفعل</option>
            <option value="scheduled">مجدول</option>
          </select>
        </div>
        <div class="form-group">
          <label>رسالة وضع الصيانة</label>
          <textarea 
            v-model="settings.maintenance.maintenanceMessage" 
            class="form-control"
            rows="3"
            placeholder="رسالة تظهر للمستخدمين أثناء الصيانة"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- System Information -->
    <div v-if="activeTab === 'system'" class="settings-section">
      <div class="settings-card">
        <h3>معلومات النظام</h3>
        <div class="system-info">
          <div class="info-item">
            <span class="info-label">إصدار النظام:</span>
            <span class="info-value">{{ systemInfo.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">آخر تحديث:</span>
            <span class="info-value">{{ systemInfo.lastUpdate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">حالة قاعدة البيانات:</span>
            <span class="info-value status-success">متصل</span>
          </div>
          <div class="info-item">
            <span class="info-label">مساحة التخزين المستخدمة:</span>
            <span class="info-value">{{ systemInfo.storageUsed }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">عدد المستخدمين النشطين:</span>
            <span class="info-value">{{ systemInfo.activeUsers }}</span>
          </div>
        </div>
        <div class="system-actions">
          <button class="btn btn-info" @click="checkSystemHealth">
            <i class="fas fa-heartbeat"></i>
            فحص صحة النظام
          </button>
          <button class="btn btn-warning" @click="clearCache">
            <i class="fas fa-broom"></i>
            مسح الذاكرة المؤقتة
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '../../supabase'

export default {
  name: 'Settings',
  setup() {
    const activeTab = ref('general')
    const saving = ref(false)
    
    // Settings structure
    const settings = reactive({
      general: {
        institutionName: 'UniERP Horizon',
        defaultLanguage: 'ar',
        timezone: 'Asia/Riyadh',
        dateFormat: 'DD/MM/YYYY'
      },
      academic: {
        semesters: 2,
        maxCredits: 18,
        minGPA: 2.0,
        attendanceThreshold: 75
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        adminEmail: 'admin@institution.edu',
        feeReminderDays: 7
      },
      security: {
        minPasswordLength: 8,
        sessionTimeout: 120,
        requireTwoFactor: false,
        logUserActions: true
      },
      maintenance: {
        autoBackup: 'daily',
        backupRetention: 7,
        maintenanceMode: 'disabled',
        maintenanceMessage: 'النظام تحت الصيانة. يرجى المحاولة لاحقاً.'
      }
    })

    // System information
    const systemInfo = reactive({
      version: '1.0.0',
      lastUpdate: new Date().toLocaleDateString('ar-SA'),
      storageUsed: '2.5 GB',
      activeUsers: 15
    })

    // Available tabs
    const tabs = [
      { id: 'general', name: 'عام', icon: 'fas fa-cog' },
      { id: 'academic', name: 'أكاديمي', icon: 'fas fa-graduation-cap' },
      { id: 'notifications', name: 'إشعارات', icon: 'fas fa-bell' },
      { id: 'security', name: 'أمان', icon: 'fas fa-shield-alt' },
      { id: 'maintenance', name: 'صيانة', icon: 'fas fa-tools' },
      { id: 'system', name: 'النظام', icon: 'fas fa-info-circle' }
    ]

    // Load settings from database
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading settings:', error)
          return
        }

        if (data) {
          // Merge loaded settings with defaults
          Object.assign(settings, data.settings || {})
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    // Save all settings
    const saveAllSettings = async () => {
      saving.value = true
      try {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            id: 'main',
            settings: settings,
            updated_at: new Date().toISOString()
          })

        if (error) throw error

        // Show success message
        showSuccessMessage('تم حفظ الإعدادات بنجاح')
      } catch (error) {
        console.error('Error saving settings:', error)
        showErrorMessage('خطأ في حفظ الإعدادات')
      } finally {
        saving.value = false
      }
    }

    // Reset to defaults
    const resetToDefaults = () => {
      if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
        // Reset to default values
        Object.assign(settings, {
          general: {
            institutionName: 'UniERP Horizon',
            defaultLanguage: 'ar',
            timezone: 'Asia/Riyadh',
            dateFormat: 'DD/MM/YYYY'
          },
          academic: {
            semesters: 2,
            maxCredits: 18,
            minGPA: 2.0,
            attendanceThreshold: 75
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
            adminEmail: 'admin@institution.edu',
            feeReminderDays: 7
          },
          security: {
            minPasswordLength: 8,
            sessionTimeout: 120,
            requireTwoFactor: false,
            logUserActions: true
          },
          maintenance: {
            autoBackup: 'daily',
            backupRetention: 7,
            maintenanceMode: 'disabled',
            maintenanceMessage: 'النظام تحت الصيانة. يرجى المحاولة لاحقاً.'
          }
        })
        
        showSuccessMessage('تم إعادة تعيين الإعدادات')
      }
    }

    // System health check
    const checkSystemHealth = async () => {
      try {
        // Check database connection
        const { data, error } = await supabase
          .from('students')
          .select('count')
          .limit(1)

        if (error) throw error

        showSuccessMessage('النظام يعمل بشكل طبيعي')
      } catch (error) {
        showErrorMessage('مشكلة في الاتصال بقاعدة البيانات')
      }
    }

    // Clear cache
    const clearCache = () => {
      // Clear localStorage
      localStorage.clear()
      // Clear sessionStorage
      sessionStorage.clear()
      
      showSuccessMessage('تم مسح الذاكرة المؤقتة')
    }

    // Utility functions
    const showSuccessMessage = (message) => {
      // Create temporary success notification
      const notification = document.createElement('div')
      notification.className = 'success-notification'
      notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => notification.remove(), 3000)
    }

    const showErrorMessage = (message) => {
      // Create temporary error notification
      const notification = document.createElement('div')
      notification.className = 'error-notification'
      notification.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => notification.remove(), 3000)
    }

    // Load settings on mount
    onMounted(() => {
      loadSettings()
    })

    return {
      activeTab,
      saving,
      settings,
      systemInfo,
      tabs,
      saveAllSettings,
      resetToDefaults,
      checkSystemHealth,
      clearCache
    }
  }
}
</script>

<style scoped>
.settings-page {
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

/* Settings Tabs */
.settings-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-button:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-button.active {
  background: #28a745;
  color: white;
}

.tab-button i {
  font-size: 1rem;
}

/* Settings Sections */
.settings-section {
  margin-bottom: 2rem;
}

.settings-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-card h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e9ecef;
}

.form-group {
  margin-bottom: 1.5rem;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

/* System Information */
.system-info {
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #495057;
}

.info-value {
  color: #6c757d;
}

.status-success {
  color: #28a745;
  font-weight: 600;
}

.system-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Notifications */
.success-notification,
.error-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
}

.success-notification {
  background: #28a745;
  color: white;
}

.error-notification {
  background: #dc3545;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }
  
  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .settings-tabs {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .settings-card {
    padding: 1.5rem;
  }
  
  .system-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .tab-button span {
    display: none;
  }
  
  .tab-button {
    padding: 0.75rem;
    justify-content: center;
  }
}
</style>
