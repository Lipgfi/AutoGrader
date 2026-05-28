<template>
  <div class="teacher-grade-container">
    <div class="grade-header">
      <div class="header-left">
        <h1>作业评分</h1>
        <div class="student-info" v-if="currentStudent">
          <el-avatar :size="40" class="student-avatar">
            {{ currentStudent.name.charAt(0) }}
          </el-avatar>
          <div class="student-detail">
            <span class="student-name">{{ currentStudent.name }}</span>
            <span class="student-id">学号：{{ currentStudent.studentId }}</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="prevStudent" :disabled="currentStudentIndex === 0">
          <el-icon><ArrowLeft /></el-icon>
          上一个
        </el-button>
        <el-button type="primary" @click="nextStudent" :disabled="currentStudentIndex === students.length - 1">
          下一个
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
    
    <div class="grade-content">
      <!-- 左侧代码展示区 -->
      <div class="code-panel" :class="{ 'full-width': isCodePanelFull }">
        <div class="code-header">
          <div class="code-header-left">
            <span class="code-title">学生代码</span>
            <el-tag size="small" type="info">{{ currentStudent?.fileName }}</el-tag>
          </div>
          <div class="code-header-right">
            <el-select v-model="codeLanguage" size="small" class="language-select">
              <el-option label="Python" value="python" />
              <el-option label="Java" value="java" />
              <el-option label="C++" value="cpp" />
              <el-option label="JavaScript" value="javascript" />
            </el-select>
            <el-button-group class="code-actions">
              <el-button size="small" @click="copyCode">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
              <el-button size="small" @click="downloadCode">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button size="small" @click="toggleCodePanel">
                <el-icon v-if="isCodePanelFull"><FullScreen /></el-icon>
                <el-icon v-else><Rank /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>
        
        <!-- 代码行号和内容 -->
        <div class="code-content">
          <div class="code-line-numbers">
            <span v-for="line in codeLines" :key="line">{{ line }}</span>
          </div>
          <pre class="code-block"><code ref="codeElement" :class="'language-' + codeLanguage">{{ codeContent }}</code></pre>
        </div>
        
        <!-- 代码统计信息 -->
        <div class="code-stats">
          <span><el-icon><Document /></el-icon> 行数：{{ codeLines }}</span>
          <span><el-icon><ChatDotRound /></el-icon> 字符：{{ codeContent.length }}</span>
          <span><el-icon><Timer /></el-icon> 提交时间：{{ currentStudent?.submitTime }}</span>
        </div>
      </div>
      
      <!-- 右侧评分面板 -->
      <div class="grade-panel" :class="{ 'hidden': isCodePanelFull }">
        <el-collapse v-model="activeNames" class="grade-collapse">
          <!-- 评分项 -->
          <el-collapse-item title="评分项" name="1">
            <template #title>
              <div class="collapse-title">
                <el-icon><EditPen /></el-icon>
                <span>评分项</span>
                <el-tag size="small" type="warning" v-if="totalScore === 0">待评分</el-tag>
                <el-tag size="small" type="success" v-else>{{ totalScore }}分</el-tag>
              </div>
            </template>
            
            <el-form :model="gradeForm" label-width="100px" class="grade-form">
              <el-form-item label="代码正确性">
                <div class="score-item">
                  <el-rate
                    v-model="gradeForm.correctnessScore"
                    :max="10"
                    show-score
                    :score-template="gradeForm.correctnessScore + '分'"
                    @change="calculateTotalScore"
                  />
                  <span class="score-range">（满分10分）</span>
                </div>
              </el-form-item>
              
              <el-form-item label="代码可读性">
                <div class="score-item">
                  <el-rate
                    v-model="gradeForm.readabilityScore"
                    :max="5"
                    show-score
                    :score-template="gradeForm.readabilityScore + '分'"
                    @change="calculateTotalScore"
                  />
                  <span class="score-range">（满分5分）</span>
                </div>
              </el-form-item>
              
              <el-form-item label="代码效率">
                <div class="score-item">
                  <el-rate
                    v-model="gradeForm.efficiencyScore"
                    :max="5"
                    show-score
                    :score-template="gradeForm.efficiencyScore + '分'"
                    @change="calculateTotalScore"
                  />
                  <span class="score-range">（满分5分）</span>
                </div>
              </el-form-item>
              
              <el-form-item label="代码创新性">
                <div class="score-item">
                  <el-rate
                    v-model="gradeForm.creativityScore"
                    :max="5"
                    show-score
                    :score-template="gradeForm.creativityScore + '分'"
                    @change="calculateTotalScore"
                  />
                  <span class="score-range">（满分5分）</span>
                </div>
              </el-form-item>
            </el-form>
          </el-collapse-item>
          
          <!-- 快速评分 -->
          <el-collapse-item title="快速评分" name="quick">
            <template #title>
              <div class="collapse-title">
                <el-icon><Lightning /></el-icon>
                <span>快速评分</span>
              </div>
            </template>
            
            <div class="quick-score-buttons">
              <el-button 
                v-for="score in quickScores" 
                :key="score"
                :type="totalScore === score ? 'primary' : 'default'"
                @click="quickScore(score)"
                class="quick-score-btn"
              >
                {{ score }}分
              </el-button>
            </div>
          </el-collapse-item>
          
          <!-- 备注 -->
          <el-collapse-item title="备注" name="2">
            <template #title>
              <div class="collapse-title">
                <el-icon><ChatLineSquare /></el-icon>
                <span>评分备注</span>
                <el-tag size="small" v-if="gradeForm.remark">已填写</el-tag>
              </div>
            </template>
            
            <el-form :model="gradeForm">
              <el-form-item label="评分备注">
                <el-input
                  v-model="gradeForm.remark"
                  type="textarea"
                  placeholder="请输入评分备注，包括优点、不足和改进建议"
                  rows="6"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
              
              <!-- 快速备注 -->
              <el-form-item label="快速备注">
                <div class="quick-remarks">
                  <el-tag 
                    v-for="remark in quickRemarks" 
                    :key="remark"
                    @click="addQuickRemark(remark)"
                    class="quick-remark-tag"
                    effect="plain"
                  >
                    {{ remark }}
                  </el-tag>
                </div>
              </el-form-item>
            </el-form>
          </el-collapse-item>
          
          <!-- 评分历史 -->
          <el-collapse-item title="评分历史" name="3">
            <template #title>
              <div class="collapse-title">
                <el-icon><Clock /></el-icon>
                <span>评分历史</span>
              </div>
            </template>
            
            <el-timeline class="grade-history">
              <el-timeline-item
                v-for="history in gradeHistory"
                :key="history.id"
                :timestamp="history.time"
                placement="top"
              >
                <el-card>
                  <div class="history-item">
                    <span class="history-score">{{ history.score }}分</span>
                    <span class="history-remark">{{ history.remark }}</span>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </el-collapse-item>
        </el-collapse>
        
        <!-- 总分和操作按钮 -->
        <div class="grade-footer">
          <div class="total-score-display">
            <span class="score-label">总分</span>
            <div class="score-value" :class="getScoreClass(totalScore)">
              {{ totalScore }}
              <span class="score-max">/ 25</span>
            </div>
            <el-progress 
              :percentage="(totalScore / 25) * 100" 
              :stroke-width="8"
              :show-text="false"
              :color="getScoreColor(totalScore)"
            />
          </div>
          <div class="grade-buttons">
            <el-button size="large" @click="saveDraft" :loading="saving">
              <el-icon><FolderChecked /></el-icon>
              暂存
            </el-button>
            <el-button type="primary" size="large" @click="submitGrade" :loading="submitting">
              <el-icon><Check /></el-icon>
              提交评分
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 提交成功弹窗 -->
    <el-dialog
      v-model="successDialogVisible"
      title="评分提交成功"
      width="450px"
      center
      :close-on-click-modal="false"
    >
      <div class="success-dialog-content">
        <el-icon class="success-icon-large"><CircleCheckFilled /></el-icon>
        <h3>评分已成功提交！</h3>
        <div class="submit-summary">
          <div class="summary-item">
            <span class="summary-label">学生姓名</span>
            <span class="summary-value">{{ currentStudent?.name }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">提交ID</span>
            <span class="summary-value">{{ currentStudent?.submissionId }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">作业ID</span>
            <span class="summary-value">{{ currentStudent?.assignmentId }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">题目ID</span>
            <span class="summary-value">{{ currentStudent?.questionId }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最终得分</span>
            <span class="summary-value score">{{ totalScore }}分</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="successDialogVisible = false">继续评分</el-button>
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { 
  ArrowLeft, 
  ArrowRight, 
  CopyDocument, 
  Download, 
  FullScreen, 
  Rank,
  Document,
  ChatDotRound,
  Timer,
  EditPen,
  Lightning,
  ChatLineSquare,
  Clock,
  FolderChecked,
  Check,
  CircleCheckFilled
} from '@element-plus/icons-vue'

const router = useRouter()

const codeElement = ref()
const codeLanguage = ref('python')
const isCodePanelFull = ref(false)
const activeNames = ref(['1', 'quick', '2'])
const submitting = ref(false)
const saving = ref(false)
const successDialogVisible = ref(false)
const currentStudentIndex = ref(0)

const quickScores = [25, 22, 20, 18, 15, 10]
const quickRemarks = [
  '代码规范，逻辑清晰',
  '注释完整，易于理解',
  '算法效率高',
  '有创新点',
  '需要改进代码结构',
  '建议增加注释',
  '存在逻辑错误',
  '代码可读性差'
]

const students = ref([
  {
    id: 1,
    name: '张三',
    studentId: '2024001',
    submissionId: 'S001',
    assignmentId: 'A001',
    questionId: 'Q001',
    fileName: 'homework1.py',
    homeworkTitle: '第一次作业 - Python基础',
    submitTime: '2024-01-15 14:30',
    code: `def hello_world():
    """打印Hello World"""
    print("Hello, World!")

if __name__ == "__main__":
    hello_world()`
  },
  {
    id: 2,
    name: '李四',
    studentId: '2024002',
    submissionId: 'S002',
    assignmentId: 'A001',
    questionId: 'Q002',
    fileName: 'homework2.py',
    homeworkTitle: '第一次作业 - Python基础',
    submitTime: '2024-01-15 15:20',
    code: `def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 测试
for i in range(10):
    print(fibonacci(i))`
  }
])

const currentStudent = computed(() => students.value[currentStudentIndex.value])

const codeContent = ref(currentStudent.value?.code || '')

const codeLines = computed(() => {
  return codeContent.value.split('\n').length
})

const gradeForm = reactive({
  correctnessScore: 0,
  readabilityScore: 0,
  efficiencyScore: 0,
  creativityScore: 0,
  remark: ''
})

const totalScore = computed(() => {
  return gradeForm.correctnessScore + gradeForm.readabilityScore + 
         gradeForm.efficiencyScore + gradeForm.creativityScore
})

const gradeHistory = ref([
  {
    id: 1,
    score: 20,
    remark: '代码规范，逻辑清晰',
    time: '2024-01-16 10:30'
  },
  {
    id: 2,
    score: 18,
    remark: '需要改进代码结构',
    time: '2024-01-16 11:45'
  }
])

const calculateTotalScore = () => {
  // 总分自动计算，使用computed
}

const getScoreClass = (score: number) => {
  if (score >= 20) return 'excellent'
  if (score >= 15) return 'good'
  if (score >= 10) return 'average'
  return 'poor'
}

const getScoreColor = (score: number) => {
  if (score >= 20) return '#67C23A'
  if (score >= 15) return '#409EFF'
  if (score >= 10) return '#E6A23C'
  return '#F56C6C'
}

const quickScore = (score: number) => {
  const correctness = Math.min(score, 10)
  const remaining = score - correctness
  const readability = Math.min(remaining, 5)
  const efficiency = Math.min(remaining - readability, 5)
  const creativity = remaining - readability - efficiency
  
  gradeForm.correctnessScore = correctness
  gradeForm.readabilityScore = readability
  gradeForm.efficiencyScore = Math.max(0, efficiency)
  gradeForm.creativityScore = Math.max(0, creativity)
}

const addQuickRemark = (remark: string) => {
  if (gradeForm.remark) {
    gradeForm.remark += '；' + remark
  } else {
    gradeForm.remark = remark
  }
}

const highlightCode = async () => {
  await nextTick()
  if (codeElement.value) {
    try {
      codeElement.value.removeAttribute('data-highlighted')
      hljs.highlightElement(codeElement.value as HTMLElement)
    } catch (error) {
      console.error('代码高亮失败:', error)
    }
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(codeContent.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadCode = () => {
  const blob = new Blob([codeContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = currentStudent.value?.fileName || 'code.txt'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('代码已下载')
}

const toggleCodePanel = () => {
  isCodePanelFull.value = !isCodePanelFull.value
}

const prevStudent = () => {
  if (currentStudentIndex.value > 0) {
    currentStudentIndex.value--
    resetGradeForm()
  }
}

const nextStudent = () => {
  if (currentStudentIndex.value < students.value.length - 1) {
    currentStudentIndex.value++
    resetGradeForm()
  }
}

const resetGradeForm = () => {
  gradeForm.correctnessScore = 0
  gradeForm.readabilityScore = 0
  gradeForm.efficiencyScore = 0
  gradeForm.creativityScore = 0
  gradeForm.remark = ''
}

const saveDraft = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('评分已暂存')
  }, 500)
}

const submitGrade = () => {
  if (totalScore.value === 0) {
    ElMessage.warning('请完成评分')
    return
  }
  
  submitting.value = true
  
  setTimeout(() => {
    submitting.value = false
    successDialogVisible.value = true
    
    gradeHistory.value.unshift({
      id: gradeHistory.value.length + 1,
      score: totalScore.value,
      remark: gradeForm.remark || '无备注',
      time: new Date().toLocaleString('zh-CN')
    })
  }, 1000)
}

const goBack = () => {
  router.back()
}

watch(codeLanguage, () => {
  highlightCode()
})

watch(currentStudentIndex, () => {
  codeContent.value = currentStudent.value?.code || ''
  highlightCode()
})

onMounted(() => {
  highlightCode()
})
</script>

<style scoped>
.teacher-grade-container {
  padding: var(--spacing-xl);
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.grade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.grade-header h1 {
  color: var(--primary-color);
  font-size: var(--font-size-xl);
  margin: 0;
}

.student-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-left: var(--spacing-lg);
  border-left: 2px solid var(--border-color);
}

.student-avatar {
  background-color: var(--primary-color);
  color: white;
}

.student-detail {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: var(--text-primary);
}

.student-id {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  gap: var(--spacing-sm);
}

.grade-content {
  display: flex;
  gap: var(--spacing-lg);
  min-height: calc(100vh - 200px);
}

/* 左侧代码面板 */
.code-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.code-panel.full-width {
  flex: 1;
}

.code-panel.hidden {
  display: none;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.code-header-left,
.code-header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.code-title {
  font-weight: 600;
  color: var(--text-primary);
}

.language-select {
  width: 120px;
}

.code-actions {
  margin-left: var(--spacing-sm);
}

.code-content {
  flex: 1;
  display: flex;
  overflow: auto;
  background-color: #282c34;
}

.code-line-numbers {
  padding: var(--spacing-md);
  background-color: #21252b;
  color: #636d83;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  text-align: right;
  user-select: none;
  border-right: 1px solid #3e4451;
}

.code-line-numbers span {
  display: block;
}

.code-block {
  flex: 1;
  margin: 0;
  padding: var(--spacing-md);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-x: auto;
}

.code-block code {
  background: transparent !important;
}

.code-stats {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.code-stats span {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 右侧评分面板 */
.grade-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-light);
  overflow: hidden;
  min-width: 400px;
}

.grade-collapse {
  flex: 1;
  overflow-y: auto;
  border: none;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
}

.collapse-title .el-icon {
  color: var(--primary-color);
}

.grade-form {
  padding: var(--spacing-md) 0;
}

.score-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.score-range {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.quick-score-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.quick-score-btn {
  flex: 1;
  min-width: 80px;
}

.quick-remarks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.quick-remark-tag {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-remark-tag:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.grade-history {
  padding: var(--spacing-sm);
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.history-score {
  font-weight: 600;
  color: var(--primary-color);
}

.history-remark {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.grade-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.total-score-display {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.score-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: var(--spacing-sm);
}

.score-value.excellent {
  color: #67C23A;
}

.score-value.good {
  color: #409EFF;
}

.score-value.average {
  color: #E6A23C;
}

.score-value.poor {
  color: #F56C6C;
}

.score-max {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-weight: normal;
}

.grade-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.grade-buttons button {
  flex: 1;
}

/* 成功弹窗 */
.success-dialog-content {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.success-icon-large {
  font-size: 64px;
  color: var(--success-color);
  margin-bottom: var(--spacing-md);
}

.success-dialog-content h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.submit-summary {
  text-align: left;
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: var(--text-secondary);
}

.summary-value {
  font-weight: 500;
  color: var(--text-primary);
}

.summary-value.score {
  color: var(--primary-color);
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .grade-content {
    flex-direction: column;
  }
  
  .code-panel,
  .grade-panel {
    flex: none;
    min-height: 500px;
  }
  
  .grade-panel {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .teacher-grade-container {
    padding: var(--spacing-md);
  }
  
  .grade-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .header-left,
  .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .header-right {
    flex-wrap: wrap;
  }
  
  .grade-header h1 {
    font-size: var(--font-size-lg);
  }
  
  .code-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .code-header-left,
  .code-header-right {
    width: 100%;
    justify-content: center;
  }
  
  .code-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .code-content {
    font-size: var(--font-size-xs);
  }
  
  .grade-buttons {
    flex-direction: column;
  }
}
</style>