<template>
  <div class="student-management">
    <div class="page-header">
      <div class="header-left">
        <h1>学生信息管理</h1>
        <p class="header-desc">管理学生信息，支持批量导入和导出</p>
      </div>
      <div class="header-right">
        <el-upload
          v-if="canPerformAction('import')"
          class="upload-btn"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".xlsx, .xls"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
        </el-upload>
        <el-button 
          v-if="canPerformAction('export')"
          type="success" 
          @click="exportStudents"
        >
          <el-icon><Download /></el-icon>
          导出学生
        </el-button>
        <el-button 
          v-if="canPerformAction('add')"
          type="warning" 
          @click="addStudent"
        >
          <el-icon><Plus /></el-icon>
          添加学生
        </el-button>
      </div>
    </div>
    
    <el-card class="filter-card">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学生姓名/学号"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="filterMajor" placeholder="选择专业" clearable class="filter-select">
          <el-option label="全部专业" value="" />
          <el-option label="计算机科学与技术" value="计算机科学与技术" />
          <el-option label="软件工程" value="软件工程" />
          <el-option label="数据科学与大数据技术" value="数据科学与大数据技术" />
        </el-select>
        <el-select v-model="filterGrade" placeholder="选择年级" clearable class="filter-select">
          <el-option label="全部年级" value="" />
          <el-option label="2023级" value="2023级" />
          <el-option label="2024级" value="2024级" />
          <el-option label="2025级" value="2025级" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="选择状态" clearable class="filter-select">
          <el-option label="全部状态" value="" />
          <el-option label="激活" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
      </div>
    </el-card>
    
    <el-card class="students-card">
      <el-table :data="filteredStudents" style="width: 100%">
        <el-table-column prop="id" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" effect="dark" size="small">
              {{ scope.row.status === 'active' ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="canEditStudent(scope.row)"
              type="primary" 
              link 
              size="small" 
              @click="editStudent(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="canEditStudent(scope.row)"
              :type="scope.row.status === 'active' ? 'danger' : 'success'" 
              link 
              size="small" 
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '激活' }}
            </el-button>
            <el-button 
              v-if="canPerformAction('delete')"
              type="danger" 
              link 
              size="small" 
              @click="deleteStudent(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 导入结果弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入结果"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="importResult" class="import-result">
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-value">{{ importResult.success }}</span>
            <span class="stat-label">成功导入</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ importResult.failed }}</span>
            <span class="stat-label">导入失败</span>
          </div>
        </div>
        
        <div v-if="importResult.failed > 0" class="failed-list">
          <h3>失败详情</h3>
          <el-table :data="importResult.failedList" style="width: 100%">
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="reason" label="失败原因" min-width="400" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="importDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 添加/编辑学生弹窗 -->
    <el-dialog
      v-model="studentDialogVisible"
      :title="isEdit ? '编辑学生' : '添加学生'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="学号">
          <el-input v-model="form.id" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="form.major">
            <el-option label="计算机科学与技术" value="计算机科学与技术" />
            <el-option label="软件工程" value="软件工程" />
            <el-option label="数据科学与大数据技术" value="数据科学与大数据技术" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="form.grade">
            <el-option label="2023级" value="2023级" />
            <el-option label="2024级" value="2024级" />
            <el-option label="2025级" value="2025级" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-value="active" inactive-value="inactive" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStudent">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, 
  Download, 
  Plus
} from '@element-plus/icons-vue'
import { studentApi } from '../../services/studentApi'
import { usePermissions } from '../../services/permissionService'

// 模拟Excel解析功能
function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        // 模拟解析过程
        const results: any[] = []
        // 生成模拟数据
        for (let i = 1; i <= 100; i++) {
          results.push({
            id: `S${String(i).padStart(3, '0')}`,
            name: `学生${i}`,
            username: `student${i}`,
            email: `student${i}@example.com`,
            phone: `13800138${String(i).padStart(4, '0')}`,
            major: ['计算机科学与技术', '软件工程', '数据科学与大数据技术'][Math.floor(Math.random() * 3)],
            grade: ['2023级', '2024级', '2025级'][Math.floor(Math.random() * 3)],
            status: 'active'
          })
        }
        resolve(results)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 验证学生数据
function validateStudentData(student: any): { valid: boolean; error?: string } {
  if (!student.id || student.id.trim() === '') {
    return { valid: false, error: '学号不能为空' }
  }
  if (!student.name || student.name.trim() === '') {
    return { valid: false, error: '姓名不能为空' }
  }
  if (!student.username || student.username.trim() === '') {
    return { valid: false, error: '用户名不能为空' }
  }
  if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    return { valid: false, error: '邮箱格式错误' }
  }
  if (!student.phone || !/^1[3-9]\d{9}$/.test(student.phone)) {
    return { valid: false, error: '手机号格式错误' }
  }
  if (!student.major) {
    return { valid: false, error: '专业不能为空' }
  }
  if (!student.grade) {
    return { valid: false, error: '年级不能为空' }
  }
  return { valid: true }
}

// 批量导入处理
async function processBatchImport(file: File) {
  try {
    const students = await parseExcelFile(file)
    
    // 模拟大文件处理，使用setTimeout模拟异步
    return new Promise((resolve) => {
      setTimeout(() => {
        const success: any[] = []
        const failed: any[] = []
        
        students.forEach((student, index) => {
          const validation = validateStudentData(student)
          if (validation.valid) {
            success.push(student)
          } else {
            failed.push({ row: index + 1, reason: validation.error, data: student })
          }
        })
        
        resolve({ success, failed })
      }, 1500)
    })
  } catch (error) {
    throw new Error('导入失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

const searchKeyword = ref('')
const filterMajor = ref('')
const filterGrade = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const importDialogVisible = ref(false)
const studentDialogVisible = ref(false)
const isEdit = ref(false)
const importResult = ref<any>(null)

const form = ref({
  id: '',
  name: '',
  username: '',
  email: '',
  phone: '',
  major: '',
  grade: '',
  status: 'active'
})

const students = ref<any[]>([])

// 加载学生数据
const loadStudents = async () => {
  try {
    const result = await studentApi.getStudents({
      keyword: searchKeyword.value,
      major: filterMajor.value,
      grade: filterGrade.value,
      status: filterStatus.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    students.value = result.data
    total.value = result.total
  } catch (error) {
    ElMessage.error('加载学生数据失败')
  }
}

// 权限管理
const { canPerformAction, canEditStudent } = usePermissions()

// 组件挂载时加载数据
onMounted(() => {
  loadStudents()
})

const filteredStudents = computed(() => {
  let result = students.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(keyword) ||
      s.id.toLowerCase().includes(keyword)
    )
  }
  
  if (filterMajor.value) {
    result = result.filter(s => s.major === filterMajor.value)
  }
  
  if (filterGrade.value) {
    result = result.filter(s => s.grade === filterGrade.value)
  }
  
  if (filterStatus.value) {
    result = result.filter(s => s.status === filterStatus.value)
  }
  
  return result
})

const handleFileChange = async (file: any) => {
  try {
    const result = await processBatchImport(file.raw)
    
    importResult.value = {
      success: (result as any).success.length,
      failed: (result as any).failed.length,
      failedList: (result as any).failed.map((item: any) => ({
        row: item.row,
        reason: item.reason
      }))
    }
    
    // 导入成功的学生添加到列表
    (result as any).success.forEach((student: any) => {
      const existingIndex = students.value.findIndex(s => s.id === student.id)
      if (existingIndex === -1) {
        students.value.push(student)
      }
    })
    
    importDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导入失败')
  }
}

const exportStudents = () => {
  ElMessage.success('学生信息导出成功')
}

const addStudent = () => {
  isEdit.value = false
  form.value = {
    id: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    major: '',
    grade: '',
    status: 'active'
  }
  studentDialogVisible.value = true
}

const editStudent = (row: any) => {
  isEdit.value = true
  form.value = { ...row }
  studentDialogVisible.value = true
}

const saveStudent = async () => {
  try {
    if (isEdit.value) {
      await studentApi.updateStudent(form.value.id, form.value)
      ElMessage.success('学生信息编辑成功')
    } else {
      const newStudent = await studentApi.addStudent(form.value)
      students.value.push(newStudent)
      ElMessage.success('学生添加成功')
    }
    studentDialogVisible.value = false
    await loadStudents()
  } catch (error) {
    ElMessage.error(isEdit.value ? '学生信息编辑失败' : '学生添加失败')
  }
}

const toggleStatus = async (row: any) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    await studentApi.updateStudent(row.id, { status: newStatus })
    row.status = newStatus
    ElMessage.success(`学生状态已${newStatus === 'active' ? '激活' : '禁用'}`)
  } catch (error) {
    ElMessage.error('修改学生状态失败')
  }
}

const deleteStudent = (row: any) => {
  ElMessageBox.confirm('确定要删除该学生吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await studentApi.deleteStudent(row.id)
      const index = students.value.findIndex(s => s.id === row.id)
      if (index > -1) {
        students.value.splice(index, 1)
      }
      ElMessage.success('学生删除成功')
    } catch (error) {
      ElMessage.error('学生删除失败')
    }
  })
}

const handleSizeChange = async (size: number) => {
  pageSize.value = size
  await loadStudents()
}

const handleCurrentChange = async (current: number) => {
  currentPage.value = current
  await loadStudents()
}
</script>

<style scoped>
.student-management {
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

.header-right {
  display: flex;
  gap: var(--spacing-md);
}

.filter-card {
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-light);
}

.filter-row {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 150px;
}

.students-card {
  border: 1px solid var(--border-light);
}

.pagination {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

.import-result {
  padding: var(--spacing-md) 0;
}

.result-stats {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.failed-list {
  margin-top: var(--spacing-lg);
}

.failed-list h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

@media (max-width: 768px) {
  .student-management {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .header-right {
    flex-wrap: wrap;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .filter-select {
    width: 100%;
  }
  
  .result-stats {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>
