<template>
  <div id="app">
    <!-- Top Navigation Bar -->
    <header class="top-navigation">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">
            <i class="fas fa-graduation-cap"></i>
            <span>UniERP Horizon</span>
          </div>
        </div>
        
        <nav class="nav-menu">
          <router-link 
            v-for="item in navigationItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'active': $route.path === item.path }"
            :title="item.title"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </router-link>
          
          <!-- Finance Dropdown -->
          <div class="nav-dropdown">
            <div class="nav-item dropdown-trigger">
              <i class="fas fa-calculator"></i>
              <span>المالية</span>
              <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown-menu">
              <router-link to="/chart-of-accounts" class="dropdown-item">
                <i class="fas fa-sitemap"></i>
                <span>دليل الحسابات</span>
              </router-link>
              <router-link to="/journal-entry" class="dropdown-item">
                <i class="fas fa-book"></i>
                <span>القيود اليومية</span>
              </router-link>
              <router-link to="/general-ledger" class="dropdown-item">
                <i class="fas fa-file-invoice"></i>
                <span>الأستاذ العام</span>
              </router-link>
            </div>
          </div>

          <!-- Settings -->
          <router-link 
            to="/settings"
            class="nav-item"
            :class="{ 'active': $route.path === '/settings' }"
            title="Alt + 9"
          >
            <i class="fas fa-cog"></i>
            <span>الإعدادات</span>
          </router-link>
        </nav>

        <div class="nav-right">
          <div class="user-menu">
            <span class="user-name">مرحباً، المدير</span>
            <i class="fas fa-user-circle"></i>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const route = useRoute()

    const navigationItems = [
      {
        path: '/',
        label: 'لوحة التحكم',
        icon: 'fas fa-tachometer-alt',
        title: 'Alt + 1'
      },
      {
        path: '/students',
        label: 'إدارة الطلاب',
        icon: 'fas fa-user-graduate',
        title: 'Alt + 2'
      },
      {
        path: '/teachers',
        label: 'هيئة التدريس',
        icon: 'fas fa-chalkboard-teacher',
        title: 'Alt + 3'
      },
      {
        path: '/majors',
        label: 'التخصصات',
        icon: 'fas fa-book',
        title: 'Alt + 4'
      },
      {
        path: '/subjects',
        label: 'المقررات',
        icon: 'fas fa-book-open',
        title: 'Alt + 5'
      },
      {
        path: '/attendance',
        label: 'الحضور',
        icon: 'fas fa-calendar-check',
        title: 'Alt + 6'
      },
      {
        path: '/fees',
        label: 'الرسوم',
        icon: 'fas fa-money-bill-wave',
        title: 'Alt + 7'
      },
      {
        path: '/timetable',
        label: 'الجدول',
        icon: 'fas fa-clock',
        title: 'Alt + 8'
      }
    ]

    return {
      navigationItems
    }
  }
}
</script>

<style scoped>
.top-navigation {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
}

.nav-left .logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  flex-shrink: 0;
}

.nav-left .logo i {
  font-size: 1.5rem;
  color: #27ae60;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.875rem;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-item.active {
  background: #27ae60;
  color: white;
}

.nav-item i {
  font-size: 1rem;
  flex-shrink: 0;
}

.nav-item span {
  flex-shrink: 0;
}

.nav-right .user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.nav-right .user-menu:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.user-menu i {
  font-size: 1.5rem;
}

.main-content {
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}

.content-wrapper {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-menu {
    gap: 0;
  }
  
  .nav-item {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-left .logo span {
    display: none;
  }
  
  .dropdown-menu {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    background: transparent;
    border: none;
    padding: 0;
    margin-top: 0.5rem;
  }
  
  .dropdown-item {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* Extra small screens - ensure single line */
@media (max-width: 480px) {
  .nav-item {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .nav-left .logo {
    font-size: 1rem;
  }
  
  .nav-left .logo i {
    font-size: 1.25rem;
  }
}

/* Finance Dropdown Styles */
.nav-dropdown {
  position: relative;
  flex-shrink: 0;
}

.dropdown-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.nav-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
  border: 1px solid #e9ecef;
  padding: 0.5rem 0;
}

.nav-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
  border-radius: 0;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #27ae60;
  transform: translateX(-5px);
}

.dropdown-item i {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.dropdown-item span {
  font-size: 0.95rem;
}
</style>
