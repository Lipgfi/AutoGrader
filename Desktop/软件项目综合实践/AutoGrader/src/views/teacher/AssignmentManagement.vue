<template>
  <div class="assignment-management-container">
    <div class="page-header">
      <div class="header-left">
        <h1>作业管理</h1>
        <p class="header-desc">创建和管理课程作业</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          新建作业
        </el-button>
      </div>
    </div>
    
    <div class="filter-section">
      <el-select v-model="filterCourse" placeholder="选择课程" clearable class="filter-select">
        <el-option label="全部课程" value="" />
        <el-option v-for="course in courses" :key="course.id" :label="course.name" :value="course.id" />
      </el-select>
      
      <el-select v-model="filterStatus" placeholder="作业状态" clearable class="filter-select">
        <el-option label="全部状态" value="" />
        <el-option label="草稿" value="draft" />
        <el-option label="已发布" value="published" />
        <el-option label="已截止" value="ended" />
      </el-select>
      
      <el-input
        v-model="searchKeyword"
        placeholder="搜索作业名称"
        prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>
    
    <el-card class="assignments-card">
      <el-table :data="filteredAssignments" style="width: 100%">
        <el-table-column prop="title" label="作业名称" min-width="200">
          <template #default="scope">
            <div class="assignment-title">
              <span class="title-text">{{ scope.row.title }}</span>
              <span class="course-name">{{ scope.row.courseName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="140" />
        <el-table-column prop="questionTitle" label="关联题目" width="180">
          <template #default="scope">
            <div class="question-info">
              <span class="question-id">{{ scope.row.questionId }}</span>
              <span class="question-title">{{ scope.row.questionTitle }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="160">
          <template #default="scope">
            <div class="deadline-info">
              <span class="deadline-text">{{ scope.row.deadline }}</span>
              <el-tag v-if="isExpired(scope.row.deadline)" type="info" size="small">已截止</el-tag>
              <el-tag v-else-if="isNearDeadline(scope.row.deadline)" type="warning" size="small">即将截止</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="stats" label="提交统计" width="160">
          <template #default="scope">
            <div class="stats-info">
              <div class="stat-row">
                <span class="stat-label">提交率:</span>
                <span class="stat-value">{{ scope.row.submitRate }}%</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">通过率:</span>
                <span class="stat-value">{{ scope.row.passRate }}%</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="dark" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'draft'"
              type="primary"
              link
              size="small"
              @click="publishAssignment(scope.row)"
            >
              发布
            </el-button>
            <el-button
              v-if="scope.row.status === 'published'"
              type="primary"
              link
              size="small"
              @click="editDeadline(scope.row)"
            >
              修改截止时间
            </el-button>
            <el-button type="primary" link size="small" @click="viewDetails(scope.row)">
              查看详情
            </el-button>
            <el-button type="primary" link size="small" @click="exportGrades(scope.row)">
              导出成绩
            </el-button>
            <el-button
              v-if="scope.row.status === 'draft'"
              type="danger"
              link
              size="small"
              @click="deleteAssignment(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog
      v-model="createDialogVisible"
      :title="editingAssignment ? '编辑作业' : '新建作业'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="assignmentForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="作业名称" prop="title">
          <el-input v-model="assignmentForm.title" placeholder="请输入作业名称" />
        </el-form-item>
        
        <el-form-item label="所属课程" prop="courseId">
          <el-select
            v-model="assignmentForm.courseId"
            placeholder="请选择课程"
            style="width: 100%"
            @change="handleCourseChange"
            :disabled="!!editingAssignment && editingAssignment.status === 'published'"
          >
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="所属班级" prop="classId">
          <el-select
            v-model="assignmentForm.classId"
            placeholder="请选择班级"
            style="width: 100%"
            :disabled="!!editingAssignment && editingAssignment.status === 'published'"
          >
            <el-option
              v-for="cls in filteredClasses"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="关联题目" prop="questionId">
          <el-select
            v-model="assignmentForm.questionId"
            placeholder="请选择题目"
            style="width: 100%"
            :disabled="!!editingAssignment && editingAssignment.status === 'published'"
          >
            <el-option
              v-for="question in questions"
              :key="question.id"
              :label="`${question.id} - ${question.title}`"
              :value="question.id"
            />
          </el-select>
          <div v-if="editingAssignment && editingAssignment.status === 'published'" class="field-notice">
            <el-icon><Lock /></el-icon>
            发布后题目不可修改
          </div>
        </el-form-item>
        
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="assignmentForm.deadline"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="作业描述" prop="description">
          <el-input
            v-model="assignmentForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入作业描述"
          />
        </el-form-item>
        
        <el-form-item label="总分" prop="totalScore">
          <el-input-number v-model="assignmentForm.totalScore" :min="1" :max="200" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button v-if="!editingAssignment" @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="saveAssignment">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="deadlineDialogVisible"
      title="修改截止时间"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="当前截止时间">
          <span>{{ selectedAssignment?.deadline }}</span>
        </el-form-item>
        <el-form-item label="新截止时间">
          <el-date-picker
            v-model="newDeadline"
            type="datetime"
            placeholder="选择新的截止时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deadlineDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDeadlineChange">确认修改</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="detailDialogVisible"
      title="作业详情"
      width="900px"
    >
      <div v-if="selectedAssignment" class="detail-content">
        <div class="detail-header">
          <div class="detail-info">
            <h2>{{ selectedAssignment.title }}</h2>
            <p class="detail-meta">
              <span>{{ selectedAssignment.courseName }}</span>
              <span class="divider">|</span>
              <span>{{ selectedAssignment.className }}</span>
            </p>
          </div>
          <el-tag :type="getStatusType(selectedAssignment.status)" effect="dark">
            {{ getStatusText(selectedAssignment.status) }}
          </el-tag>
        </div>
        
        <el-divider />
        
        <div class="detail-stats">
          <div class="stat-card">
            <div class="stat-value">{{ selectedAssignment.totalStudents }}</div>
            <div class="stat-label">学生总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ selectedAssignment.submittedCount }}</div>
            <div class="stat-label">已提交</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ selectedAssignment.passedCount }}</div>
            <div class="stat-label">通过人数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ selectedAssignment.avgScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
        </div>
        
        <div class="score-distribution">
          <h3>分数分布</h3>
          <div class="distribution-bars">
            <div class="distribution-item">
              <span class="range">90-100</span>
              <div class="bar-container">
                <div class="bar excellent" :style="{ width: '30%' }"></div>
              </div>
              <span class="count">15人</span>
            </div>
            <div class="distribution-item">
              <span class="range">80-89</span>
              <div class="bar-container">
                <div class="bar good" :style="{ width: '25%' }"></div>
              </div>
              <span class="count">12人</span>
            </div>
            <div class="distribution-item">
              <span class="range">60-79</span>
              <div class="bar-container">
                <div class="bar average" :style="{ width: '20%' }"></div>
              </div>
              <span class="count">10人</span>
            </div>
            <div class="distribution-item">
              <span class="range">60以下</span>
              <div class="bar-container">
                <div class="bar poor" :style="{ width: '10%' }"></div>
              </div>
              <span class="count">5人</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportGrades(selectedAssignment)">导出成绩</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const filterCourse = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')
const createDialogVisible = ref(false)
const deadlineDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const editingAssignment = ref<any>(null)
const selectedAssignment = ref<any>(null)
const newDeadline = ref('')

const formRef = ref<FormInstance>()

const assignmentForm = reactive({
  title: '',
  courseId: '',
  classId: '',
  questionId: '',
  deadline: '',
  description: '',
  totalScore: 100
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入作业名称', trigger: 'blur' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  questionId: [{ required: true, message: '请选择题目', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

const courses = ref([
  { id: 'C001', name: '数据结构与算法' },
  { id: 'C002', name: '操作系统原理' },
  { id: 'C003', name: '计算机网络' }
])

const classes = ref([
  { id: 'CL001', name: '计算机2401班', courseId: 'C001' },
  { id: 'CL002', name: '计算机2402班', courseId: 'C001' },
  { id: 'CL003', name: '计算机2401班', courseId: 'C002' }
])

const questions = ref([
  { id: 'Q001', title: '两数之和' },
  { id: 'Q002', title: '反转链表' },
  { id: 'Q003', title: '有效的括号' },
  { id: 'Q004', title: '二叉树遍历' }
])

const assignments = ref([
  {
    id: 'A001',
    title: '第一次作业 - 数组与链表',
    courseId: 'C001',
    courseName: '数据结构与算法',
    classId: 'CL001',
    className: '计算机2401班',
    questionId: 'Q001',
    questionTitle: '两数之和',
    deadline: '2026-04-05 23:59',
    status: 'published',
    submitRate: 85,
    passRate: 72,
    totalStudents: 45,
    submittedCount: 38,
    passedCount: 32,
    avgScore: 82.5
  },
  {
    id: 'A002',
    title: '第二次作业 - 栈与队列',
    courseId: 'C001',
    courseName: '数据结构与算法',
    classId: 'CL001',
    className: '计算机2401班',
    questionId: 'Q003',
    questionTitle: '有效的括号',
    deadline: '2026-04-10 23:59',
    status: 'published',
    submitRate: 60,
    passRate: 55,
    totalStudents: 45,
    submittedCount: 27,
    passedCount: 25,
    avgScore: 75.8
  },
  {
    id: 'A003',
    title: '第三次作业 - 树与图',
    courseId: 'C001',
    courseName: '数据结构与算法',
    classId: 'CL001',
    className: '计算机2401班',
    questionId: 'Q004',
    questionTitle: '二叉树遍历',
    deadline: '2026-04-15 23:59',
    status: 'draft',
    submitRate: 0,
    passRate: 0,
    totalStudents: 45,
    submittedCount: 0,
    passedCount: 0,
    avgScore: 0
  },
  {
    id: 'A004',
    title: '进程调度模拟',
    courseId: 'C002',
    courseName: '操作系统原理',
    classId: 'CL003',
    className: '计算机2401班',
    questionId: 'Q002',
    questionTitle: '反转链表',
    deadline: '2026-03-20 23:59',
    status: 'ended',
    submitRate: 92,
    passRate: 80,
    totalStudents: 45,
    submittedCount: 41,
    passedCount: 36,
    avgScore: 78.2
  }
])

const filteredClasses = computed(() => {
  if (!assignmentForm.courseId) return []
  return classes.value.filter(c => c.courseId === assignmentForm.courseId)
})

const filteredAssignments = computed(() => {
  let result = assignments.value
  
  if (filterCourse.value) {
    result = result.filter(a => a.courseId === filterCourse.value)
  }
  
  if (filterStatus.value) {
    result = result.filter(a => a.status === filterStatus.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(a => a.title.toLowerCase().includes(keyword))
  }
  
  return result
})

const isExpired = (deadline: string): boolean => {
  return new Date(deadline) < new Date()
}

const isNearDeadline = (deadline: string): boolean => {
  const diff = new Date(deadline).getTime() - new Date().getTime()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
}

const getStatusType = (status: string): 'success' | 'warning' | 'info' => {
  switch (status) {
    case 'published': return 'success'
    case 'draft': return 'warning'
    case 'ended': return 'info'
    default: return 'info'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'published': return '已发布'
    case 'draft': return '草稿'
    case 'ended': return '已截止'
    default: return status
  }
}

const showCreateDialog = () => {
  editingAssignment.value = null
  Object.assign(assignmentForm, {
    title: '',
    courseId: '',
    classId: '',
    questionId: '',
    deadline: '',
    description: '',
    totalScore: 100
  })
  createDialogVisible.value = true
}

const handleCourseChange = () => {
  assignmentForm.classId = ''
}

const saveDraft = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const course = courses.value.find(c => c.id === assignmentForm.courseId)
    const cls = classes.value.find(c => c.id === assignmentForm.classId)
    const question = questions.value.find(q => q.id === assignmentForm.questionId)
    
    assignments.value.push({
      id: `A${Date.now()}`,
      title: assignmentForm.title,
      courseId: assignmentForm.courseId,
      courseName: course?.name || '',
      classId: assignmentForm.classId,
      className: cls?.name || '',
      questionId: assignmentForm.questionId,
      questionTitle: question?.title || '',
      deadline: assignmentForm.deadline,
      status: 'draft',
      submitRate: 0,
      passRate: 0,
      totalStudents: 45,
      submittedCount: 0,
      passedCount: 0,
      avgScore: 0
    })
    
    ElMessage.success('草稿保存成功')
    createDialogVisible.value = false
  } catch (error) {
    console.error('表单校验失败', error)
  }
}

const saveAssignment = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (editingAssignment.value) {
      Object.assign(editingAssignment.value, {
        title: assignmentForm.title,
        deadline: assignmentForm.deadline,
        description: assignmentForm.description,
        totalScore: assignmentForm.totalScore
      })
      ElMessage.success('作业更新成功')
    } else {
      saveDraft()
      return
    }
    
    createDialogVisible.value = false
  } catch (error) {
    console.error('表单校验失败', error)
  }
}

const publishAssignment = (assignment: any) => {
  ElMessageBox.confirm('确定要发布此作业吗？发布后题目将不可修改。', '发布确认', {
    confirmButtonText: '确定发布',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    assignment.status = 'published'
    ElMessage.success('作业发布成功')
  })
}

const editDeadline = (assignment: any) => {
  selectedAssignment.value = assignment
  newDeadline.value = assignment.deadline
  deadlineDialogVisible.value = true
}

const confirmDeadlineChange = () => {
  if (selectedAssignment.value && newDeadline.value) {
    selectedAssignment.value.deadline = newDeadline.value
    ElMessage.success('截止时间修改成功')
    deadlineDialogVisible.value = false
  }
}

const viewDetails = (assignment: any) => {
  selectedAssignment.value = assignment
  detailDialogVisible.value = true
}

const exportGrades = (assignment: any) => {
  ElMessage.success(`正在导出"${assignment.title}"的成绩...`)
}

const deleteAssignment = (assignment: any) => {
  ElMessageBox.confirm(`确定要删除作业"${assignment.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = assignments.value.findIndex(a => a.id === assignment.id)
    if (index > -1) {
      assignments.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  })
}
</script>

<style scoped>
.assignment-management-container {
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

.filter-section {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.filter-select {
  width: 160px;
}

.search-input {
  width: 300px;
}

.assignments-card {
  border: 1px solid var(--border-light);
}

.assignment-title {
  display: flex;
  flex-direction: column;
}

.title-text {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.course-name {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.question-info {
  display: flex;
  flex-direction: column;
}

.question-id {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.question-title {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.deadline-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.deadline-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.stat-label {
  color: var(--text-tertiary);
}

.stat-value {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.field-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.detail-content {
  padding: var(--spacing-md) 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-info h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.detail-meta {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.detail-meta .divider {
  margin: 0 var(--spacing-sm);
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
}

.stat-card .stat-value {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  color: var(--primary-color);
}

.stat-card .stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-sm);
}

.score-distribution h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.range {
  width: 60px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.bar-container {
  flex: 1;
  height: 20px;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: var(--border-radius-sm);
}

.bar.excellent { background-color: var(--success-color); }
.bar.good { background-color: var(--primary-color); }
.bar.average { background-color: var(--warning-color); }
.bar.poor { background-color: var(--danger-color); }

.count {
  width: 50px;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  text-align: right;
}

@media (max-width: 768px) {
  .assignment-management-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .filter-section {
    flex-wrap: wrap;
  }
  
  .filter-select,
  .search-input {
    width: 100%;
  }
  
  .detail-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
