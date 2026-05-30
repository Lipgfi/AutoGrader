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
            value-format="YYYY-MM-DD HH:mm:ss"
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
            value-format="YYYY-MM-DD HH:mm:ss"
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
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '../../api/interceptors'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment as deleteAssignmentApi, publishAssignment as publishAssignmentApi } from '../../api/assignment'
import { getCourses } from '../../api/course'
import { getQuestions } from '../../api/question'
import { getB3Questions } from '../../api/b3'
import { getClasses } from '../../api/class'
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

const questions = ref<any[]>([])

const loadQuestions = async () => {
  try {
    const response: any = await getB3Questions()
    if (response && Array.isArray(response)) {
      questions.value = response.map((q: any) => ({
        id: q.id,
        title: q.title
      }))
    }
  } catch (error) {
    console.error('[AssignmentManagement] 加载题目列表失败:', error)
    questions.value = []
  }
}

const assignments = ref<any[]>([])

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

// 将 ISO/数据库返回的 datetime 字符串统一转成 "YYYY-MM-DD HH:mm:ss"
const formatDeadline = (raw: string): string => {
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

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
    
    // 调用API创建作业
    const response = await createAssignment({
      title: assignmentForm.title,
      classId: Number(assignmentForm.classId),
      question_id: assignmentForm.questionId,
      dueDate: new Date(assignmentForm.deadline).toISOString(),
      description: assignmentForm.description,
      isPublished: false,
      allowResubmit: true
    })
    
    if (response.code === 200 && response.data) {
      ElMessage.success('草稿保存成功')
      createDialogVisible.value = false
      // 刷新作业列表
      await loadData()
    } else {
      ElMessage.error('保存失败')
    }
  } catch (error) {
    console.error('保存失败', error)
    ElMessage.error('保存失败')
  }
}

// 加载数据
const loadData = async () => {
  try {
    // 加载课程
    const coursesResponse = await getCourses()
    if (coursesResponse.code === 200 && coursesResponse.data) {
      const courseList = Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data.data || []
      courses.value = courseList.map((c: any) => ({
        id: c.course_id || c.id,
        name: c.course_name || c.name
      }))
    }
    
    // 加载班级
    const classesResponse = await getClasses()
    if (classesResponse.code === 200 && classesResponse.data) {
      const classList = Array.isArray(classesResponse.data) ? classesResponse.data : classesResponse.data.data || []
      classes.value = classList.map((c: any) => ({
        id: c.class_id || c.id,
        name: c.class_name || c.name,
        courseId: c.course_id || c.courseId
      }))
    }
    
    // 加载题目（从B3判题引擎获取）
    try {
      const b3QuestionsResponse: any = await getB3Questions()
      if (b3QuestionsResponse && Array.isArray(b3QuestionsResponse)) {
        questions.value = b3QuestionsResponse.map((q: any) => ({
          id: q.id,
          title: q.title
        }))
      }
    } catch (error) {
      console.warn('[AssignmentManagement] 从B3加载题目失败，尝试从B4加载:', error)
      const questionsResponse = await getQuestions()
      if (questionsResponse.code === 200 && questionsResponse.data) {
        const questionList = Array.isArray(questionsResponse.data) ? questionsResponse.data : questionsResponse.data.data || questionsResponse.data.questions || []
        questions.value = questionList.map((q: any) => ({
          id: q.id,
          title: q.title
        }))
      }
    }
    
    // 加载作业
    const assignmentsResponse = await getAssignments()
    if (assignmentsResponse.code === 200 && assignmentsResponse.data) {
      const assignmentList = Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : assignmentsResponse.data.data || []
      assignments.value = assignmentList.map((a: any) => ({
        ...a,
        id: a.assignment_id || a.id,
        title: a.title || '',
        description: a.description || '',
        classId: a.class_id || a.classId,
        courseId: classes.value.find((c: any) => c.id === a.class_id)?.courseId || a.course_id || '',
        courseName: a.class_name || classes.value.find((c: any) => c.id === a.class_id)?.name || '',
        className: a.class_name || classes.value.find((c: any) => c.id === a.class_id)?.name || '',
        questionId: a.question_id || '',
        questionTitle: questions.value.find((q: any) => q.id === a.question_id)?.title || '',
        deadline: formatDeadline(a.due_date || a.deadline || ''),
        status: a.is_published ? 'published' : 'draft',
        submitRate: 0,
        passRate: 0,
        totalStudents: 0,
        submittedCount: 0,
        passedCount: 0,
        avgScore: 0
      }))
    }
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

onMounted(() => {
  loadData()
})

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

const publishAssignment = async (assignment: any) => {
  ElMessageBox.confirm('确定要发布此作业吗？发布后题目将不可修改。', '发布确认', {
    confirmButtonText: '确定发布',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await publishAssignmentApi(String(assignment.id))
      if (response.code === 200) {
        assignment.status = 'published'
        ElMessage.success('作业发布成功')
      } else {
        ElMessage.error('发布失败')
      }
    } catch (error: any) {
      console.error('发布作业失败', error)
      ElMessage.error('发布失败: ' + (error.message || error))
    }
  })
}

const editDeadline = (assignment: any) => {
  selectedAssignment.value = assignment
  newDeadline.value = assignment.deadline
  deadlineDialogVisible.value = true
}

const confirmDeadlineChange = async () => {
  if (!selectedAssignment.value || !newDeadline.value) return
  try {
    await updateAssignment(String(selectedAssignment.value.id), { dueDate: newDeadline.value })
    selectedAssignment.value.deadline = newDeadline.value
    ElMessage.success('截止时间修改成功')
    deadlineDialogVisible.value = false
  } catch (error: any) {
    console.error('修改截止时间失败', error)
    const detail = error?.response?.data?.detail
    ElMessage.error(typeof detail === 'string' ? detail : '修改失败')
  }
}

const viewDetails = (assignment: any) => {
  selectedAssignment.value = assignment
  detailDialogVisible.value = true
}

const exportGrades = (assignment: any) => {
  ElMessage.success(`正在导出"${assignment.title}"的成绩...`)
}

const deleteAssignment = async (assignment: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除作业"${assignment.title}"吗？此操作不可恢复，所有相关提交记录也将被删除。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const response = await deleteAssignmentApi(String(assignment.id))
    if (response.code === 200) {
      const index = assignments.value.findIndex(a => a.id === assignment.id)
      if (index > -1) {
        assignments.value.splice(index, 1)
      }
      ElMessage.success('作业已删除')
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      const detail = error?.response?.data?.detail
      ElMessage.error(typeof detail === 'string' ? detail : '删除失败')
    }
  }
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
