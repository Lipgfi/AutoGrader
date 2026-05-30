<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo-section">
        <h2 class="logo">AutoGrader</h2>
        <p class="logo-desc">{{ roleName }}端</p>
      </div>
      
      <el-menu 
        :default-active="activeMenu" 
        class="sidebar-menu"
        router
        mode="vertical"
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
      </el-menu>
      
      <div class="user-section">
        <div class="user-info">
          <div class="avatar">
            <el-icon><User /></el-icon>
          </div>
          <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
        </div>
        <el-button 
          type="text" 
          class="logout-btn"
          @click="handleLogout"
        >
          <el-icon><ArrowRight /></el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </aside>
    
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { User, ArrowRight, HomeFilled, Document, Files, PieChart, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const role = computed(() => userStore.userInfo?.role || 'student')

const roleName = computed(() => {
  switch (role.value) {
    case 'student': return '学生'
    case 'teacher': return '教师'
    case 'admin': return '管理员'
    default: return '用户'
  }
})

const menuItems = computed(() => {
  const menus: Record<string, any[]> = {
    student: [
      { path: '/student/courses', label: '我的课程', icon: HomeFilled },
      { path: '/student/grades', label: '成绩总览', icon: PieChart },
      { path: '/student/profile', label: '个人信息', icon: User }
    ],
    teacher: [
      { path: '/teacher/courses', label: '课程管理', icon: HomeFilled },
      { path: '/teacher/assignments', label: '作业管理', icon: Document },
      { path: '/teacher/questions', label: '题库管理', icon: Files },
      { path: '/teacher/grades', label: '成绩管理', icon: PieChart }
    ],
    admin: [
      { path: '/admin/dashboard', label: '控制台', icon: HomeFilled },
      { path: '/admin/users', label: '用户管理', icon: User },
      { path: '/admin/students', label: '学生管理', icon: User },
      { path: '/admin/settings', label: '系统设置', icon: Setting }
    ]
  }
  return menus[role.value] || []
})

const activeMenu = computed(() => {
  return route.path
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.logo-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  margin: 0;
}

.logo-desc {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0 0;
}

.sidebar-menu {
  flex: 1;
  padding-top: 16px;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  padding: 0 20px;
  margin: 4px 8px;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #f6f6f6;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #e6f7ff;
  color: #1890ff;
}

.sidebar-menu :deep(.el-menu-item i) {
  font-size: 16px;
  margin-right: 8px;
}

.user-section {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 8px;
}

.avatar :deep(.el-icon) {
  font-size: 14px;
}

.username {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  justify-content: flex-start;
  color: #999;
  font-size: 13px;
  padding: 8px 12px;
}

.logout-btn:hover {
  background-color: #fafafa;
  color: #f5222d;
}

.logout-btn :deep(.el-icon) {
  margin-right: 6px;
}

.main-content {
  flex: 1;
  margin-left: 200px;
  min-height: 100vh;
  padding: 24px;
  background-color: #f5f5f5;
}
</style>
