<template>
  <div class="system-settings">
    <div class="page-header">
      <div class="header-left">
        <h1>系统设置</h1>
        <p class="header-desc">配置系统参数、权限和安全设置</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="saveSettings">
          <el-icon><Check /></el-icon>
          保存设置
        </el-button>
      </div>
    </div>
    
    <el-card class="settings-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="settings.basic" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="settings.basic.systemName" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="settings.basic.systemVersion" disabled />
            </el-form-item>
            <el-form-item label="维护模式">
              <el-switch v-model="settings.basic.maintenanceMode" />
            </el-form-item>
            <el-form-item label="维护公告">
              <el-input v-model="settings.basic.maintenanceMessage" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="系统语言">
              <el-select v-model="settings.basic.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="权限配置" name="permissions">
          <div class="permissions-container">
            <el-tree
              :data="roles"
              node-key="id"
              default-expand-all
              @current-change="handleRoleChange"
            >
              <template #default="{ node }">
                <span class="role-name">{{ node.label }}</span>
              </template>
            </el-tree>
            
            <div class="permission-detail" v-if="selectedRole">
              <h3>{{ selectedRole.name }} 权限设置</h3>
              <el-checkbox-group v-model="selectedRole.permissions" class="permission-list">
                <el-checkbox v-for="perm in allPermissions" :key="perm.id" :label="perm.id">
                  {{ perm.name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="通知设置" name="notification">
          <el-form :model="settings.notification" label-width="120px">
            <el-form-item label="邮件服务器">
              <el-input v-model="settings.notification.smtpServer" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input v-model="settings.notification.smtpPort" type="number" />
            </el-form-item>
            <el-form-item label="发件人邮箱">
              <el-input v-model="settings.notification.senderEmail" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="settings.notification.smtpUsername" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="settings.notification.smtpPassword" type="password" />
            </el-form-item>
            <el-form-item label="启用邮件通知">
              <el-switch v-model="settings.notification.enableEmail" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="settings.security" label-width="120px">
            <el-form-item label="密码最小长度">
              <el-input v-model="settings.security.passwordMinLength" type="number" />
            </el-form-item>
            <el-form-item label="密码复杂度">
              <el-select v-model="settings.security.passwordComplexity">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item label="登录失败限制">
              <el-input v-model="settings.security.loginFailureLimit" type="number" />
            </el-form-item>
            <el-form-item label="登录失败锁定时间">
              <el-input v-model="settings.security.loginLockoutTime" type="number" suffix="分钟" />
            </el-form-item>
            <el-form-item label="会话超时时间">
              <el-input v-model="settings.security.sessionTimeout" type="number" suffix="分钟" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

const activeTab = ref('basic')
const selectedRole = ref<any>(null)

const settings = reactive({
  basic: {
    systemName: 'AutoGrader 作业代码自动评分系统',
    systemVersion: '1.0.0',
    maintenanceMode: false,
    maintenanceMessage: '系统维护中，请稍后再试',
    language: 'zh-CN'
  },
  notification: {
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    senderEmail: 'noreply@example.com',
    smtpUsername: 'username',
    smtpPassword: 'password',
    enableEmail: true
  },
  security: {
    passwordMinLength: 8,
    passwordComplexity: 'medium',
    loginFailureLimit: 5,
    loginLockoutTime: 30,
    sessionTimeout: 60
  }
})

const roles = ref([
  {
    id: 'admin',
    label: '管理员',
    children: []
  },
  {
    id: 'teacher',
    label: '教师',
    children: []
  },
  {
    id: 'student',
    label: '学生',
    children: []
  }
])

const allPermissions = ref([
  { id: 'system:settings', name: '系统设置' },
  { id: 'user:management', name: '用户管理' },
  { id: 'student:management', name: '学生管理' },
  { id: 'course:management', name: '课程管理' },
  { id: 'assignment:management', name: '作业管理' },
  { id: 'grade:management', name: '成绩管理' },
  { id: 'question:management', name: '题库管理' },
  { id: 'code:submit', name: '代码提交' },
  { id: 'code:evaluate', name: '代码评测' },
  { id: 'grade:view', name: '成绩查看' }
])

const rolePermissions = {
  admin: ['system:settings', 'user:management', 'student:management', 'course:management', 'assignment:management', 'grade:management', 'question:management', 'code:submit', 'code:evaluate', 'grade:view'],
  teacher: ['course:management', 'assignment:management', 'grade:management', 'question:management', 'code:evaluate'],
  student: ['code:submit', 'grade:view']
}

const handleRoleChange = (role: any) => {
  selectedRole.value = {
    id: role.id,
    name: role.label,
    permissions: rolePermissions[role.id as keyof typeof rolePermissions] || []
  }
}

const saveSettings = () => {
  // 模拟保存设置
  ElMessage.success('设置保存成功')
}
</script>

<style scoped>
.system-settings {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.header-left h1 {
  color: var(--text-primary);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-xs) 0;
}

.header-desc {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.settings-card {
  border: 1px solid var(--border-light);
}

.permissions-container {
  display: flex;
  gap: var(--spacing-lg);
  min-height: 400px;
}

.el-tree {
  flex: 1;
  border-right: 1px solid var(--border-light);
  padding-right: var(--spacing-lg);
}

.role-name {
  font-weight: var(--font-weight-medium);
}

.permission-detail {
  flex: 2;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
}

.permission-detail h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.permission-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .system-settings {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .permissions-container {
    flex-direction: column;
  }
  
  .el-tree {
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    padding-right: 0;
    padding-bottom: var(--spacing-lg);
  }
  
  .permission-list {
    grid-template-columns: 1fr;
  }
}
</style>
