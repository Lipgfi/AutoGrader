<template>
  <div class="user-management-container">
    <div class="page-header">
      <div class="header-left">
        <h1>用户管理</h1>
        <p class="header-desc">管理系统中的所有用户账号</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          创建教师账号
        </el-button>
      </div>
    </div>
    
    <el-card class="filter-card">
      <div class="filter-row">
        <el-select v-model="filterRole" placeholder="用户角色" clearable class="filter-select">
          <el-option label="全部角色" value="" />
          <el-option label="学生" value="student" />
          <el-option label="教师" value="teacher" />
          <el-option label="管理员" value="admin" />
        </el-select>
        
        <el-select v-model="filterStatus" placeholder="账号状态" clearable class="filter-select">
          <el-option label="全部状态" value="" />
          <el-option label="正常" value="active" />
          <el-option label="已停用" value="disabled" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名、姓名或邮箱"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        
        <el-button type="primary" plain @click="batchOperation" :disabled="selectedUsers.length === 0">
          批量操作
        </el-button>
      </div>
    </el-card>
    
    <el-card class="users-card">
      <el-table
        :data="filteredUsers"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)" effect="dark" size="small">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="department" label="院系/班级" width="160">
          <template #default="scope">
            <span v-if="scope.row.role === 'student'">{{ scope.row.className }}</span>
            <span v-else>{{ scope.row.department }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="active"
              inactive-value="disabled"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="viewUser(scope.row)">
              查看
            </el-button>
            <el-button type="primary" link size="small" @click="resetPassword(scope.row)">
              重置密码
            </el-button>
            <el-button
              v-if="scope.row.role !== 'admin'"
              type="danger"
              link
              size="small"
              @click="deleteUser(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalUsers"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    
    <el-dialog
      v-model="createDialogVisible"
      title="创建教师账号"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="工号" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="院系" prop="department">
          <el-select v-model="createForm.department" placeholder="请选择院系" style="width: 100%">
            <el-option label="计算机科学与技术学院" value="计算机科学与技术学院" />
            <el-option label="软件学院" value="软件学院" />
            <el-option label="信息工程学院" value="信息工程学院" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input v-model="createForm.password" disabled>
            <template #append>
              <el-button @click="generatePassword">生成</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      
      <el-alert
        title="创建后将发送激活邮件到教师邮箱"
        type="info"
        :closable="false"
        style="margin-top: var(--spacing-md);"
      />
      
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createUser">创建并发送邮件</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
    >
      <div v-if="selectedUser" class="user-detail">
        <div class="detail-header">
          <el-avatar :size="80">{{ selectedUser.name.charAt(0) }}</el-avatar>
          <div class="detail-info">
            <h2>{{ selectedUser.name }}</h2>
            <p class="detail-meta">
              <el-tag :type="getRoleType(selectedUser.role)" effect="dark">
                {{ getRoleText(selectedUser.role) }}
              </el-tag>
              <el-tag :type="selectedUser.status === 'active' ? 'success' : 'danger'" effect="plain">
                {{ selectedUser.status === 'active' ? '正常' : '已停用' }}
              </el-tag>
            </p>
          </div>
        </div>
        
        <el-divider />
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedUser.name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedUser.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="院系/班级">
            {{ selectedUser.role === 'student' ? selectedUser.className : selectedUser.department }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ selectedUser.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ selectedUser.lastLogin }}</el-descriptions-item>
          <el-descriptions-item label="登录次数">{{ selectedUser.loginCount }} 次</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
    
    <el-dialog
      v-model="batchDialogVisible"
      title="批量操作"
      width="400px"
    >
      <p style="margin-bottom: var(--spacing-lg);">已选择 {{ selectedUsers.length }} 个用户</p>
      <div class="batch-actions">
        <el-button type="danger" @click="batchDisable">批量停用</el-button>
        <el-button type="warning" @click="batchResetPassword">批量重置密码</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const filterRole = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')
const selectedUsers = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(100)
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const batchDialogVisible = ref(false)
const selectedUser = ref<any>(null)

const createFormRef = ref<FormInstance>()

const createForm = reactive({
  username: '',
  name: '',
  email: '',
  department: '',
  password: ''
})

const createRules: FormRules = {
  username: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  department: [{ required: true, message: '请选择院系', trigger: 'change' }]
}

const users = ref([
  { id: 1, username: '20240001', name: '张三', role: 'student', email: 'zhangsan@example.com', className: '计算机2401班', department: '', status: 'active', lastLogin: '2026-04-01 10:30', createTime: '2026-02-20', phone: '13800138001', loginCount: 25 },
  { id: 2, username: '20240002', name: '李四', role: 'student', email: 'lisi@example.com', className: '计算机2401班', department: '', status: 'active', lastLogin: '2026-04-01 09:15', createTime: '2026-02-20', phone: '13800138002', loginCount: 18 },
  { id: 3, username: 'T001', name: '王教授', role: 'teacher', email: 'wangprof@example.com', className: '', department: '计算机科学与技术学院', status: 'active', lastLogin: '2026-04-01 08:00', createTime: '2025-09-01', phone: '13800138003', loginCount: 156 },
  { id: 4, username: 'T002', name: '李教授', role: 'teacher', email: 'liprof@example.com', className: '', department: '软件学院', status: 'active', lastLogin: '2026-03-31 16:45', createTime: '2025-09-01', phone: '13800138004', loginCount: 89 },
  { id: 5, username: 'admin', name: '系统管理员', role: 'admin', email: 'admin@example.com', className: '', department: '系统管理', status: 'active', lastLogin: '2026-04-01 11:00', createTime: '2025-01-01', phone: '13800138000', loginCount: 320 },
  { id: 6, username: '20240003', name: '赵六', role: 'student', email: 'zhaoliu@example.com', className: '计算机2402班', department: '', status: 'disabled', lastLogin: '2026-03-20 14:30', createTime: '2026-02-20', phone: '13800138005', loginCount: 5 }
])

const filteredUsers = computed(() => {
  let result = users.value
  
  if (filterRole.value) {
    result = result.filter(u => u.role === filterRole.value)
  }
  
  if (filterStatus.value) {
    result = result.filter(u => u.status === filterStatus.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(u => 
      u.username.toLowerCase().includes(keyword) ||
      u.name.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const getRoleType = (role: string): 'primary' | 'success' | 'warning' => {
  switch (role) {
    case 'student': return 'primary'
    case 'teacher': return 'success'
    case 'admin': return 'warning'
    default: return 'primary'
  }
}

const getRoleText = (role: string): string => {
  switch (role) {
    case 'student': return '学生'
    case 'teacher': return '教师'
    case 'admin': return '管理员'
    default: return role
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

const handleStatusChange = (user: any) => {
  ElMessage.success(`用户 ${user.name} 状态已更新`)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const showCreateDialog = () => {
  Object.assign(createForm, {
    username: '',
    name: '',
    email: '',
    department: '',
    password: ''
  })
  generatePassword()
  createDialogVisible.value = true
}

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  createForm.password = password
}

const createUser = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    
    users.value.push({
      id: Date.now(),
      username: createForm.username,
      name: createForm.name,
      role: 'teacher',
      email: createForm.email,
      className: '',
      department: createForm.department,
      status: 'active',
      lastLogin: '-',
      createTime: new Date().toLocaleDateString('zh-CN'),
      phone: '',
      loginCount: 0
    })
    
    ElMessage.success('教师账号创建成功，激活邮件已发送')
    createDialogVisible.value = false
  } catch (error) {
    console.error('表单校验失败', error)
  }
}

const viewUser = (user: any) => {
  selectedUser.value = user
  detailDialogVisible.value = true
}

const resetPassword = (user: any) => {
  ElMessageBox.confirm(`确定要重置用户 ${user.name} 的密码吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置，新密码已发送到用户邮箱')
  })
}

const deleteUser = (user: any) => {
  ElMessageBox.confirm(`确定要删除用户 ${user.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  })
}

const batchOperation = () => {
  batchDialogVisible.value = true
}

const batchDisable = () => {
  selectedUsers.value.forEach(user => {
    user.status = 'disabled'
  })
  ElMessage.success(`已停用 ${selectedUsers.value.length} 个用户`)
  batchDialogVisible.value = false
}

const batchResetPassword = () => {
  ElMessage.success(`已重置 ${selectedUsers.value.length} 个用户的密码`)
  batchDialogVisible.value = false
}
</script>

<style scoped>
.user-management-container {
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

.filter-card {
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-light);
}

.filter-row {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.filter-select {
  width: 140px;
}

.search-input {
  width: 300px;
  flex: 1;
}

.users-card {
  border: 1px solid var(--border-light);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.user-detail {
  padding: var(--spacing-md) 0;
}

.detail-header {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.detail-info h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.detail-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin: 0;
}

.batch-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

@media (max-width: 768px) {
  .user-management-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .filter-row {
    flex-wrap: wrap;
  }
  
  .filter-select,
  .search-input {
    width: 100%;
  }
}
</style>
