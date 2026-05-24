<template>
  <div class="student-submit-container">
    <div class="submit-header">
      <h1>作业提交</h1>
      <el-button type="primary" @click="goBack">返回</el-button>
    </div>
    
    <div class="submit-content">
      <!-- 作业信息填写 -->
      <el-card class="submit-form-card">
        <el-form
          ref="submitFormRef"
          :model="submitForm"
          :rules="submitRules"
          label-width="100px"
        >
          <el-form-item label="选择课程" prop="courseId">
            <el-select v-model="submitForm.courseId" placeholder="请选择课程" @change="handleCourseChange">
              <el-option
                v-for="course in courses"
                :key="course.courseId"
                :label="course.courseName"
                :value="course.courseId"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="选择作业" prop="assignmentId">
            <el-select v-model="submitForm.assignmentId" placeholder="请选择作业" @change="handleAssignmentChange">
              <el-option
                v-for="assignment in filteredAssignments"
                :key="assignment.assignmentId"
                :label="assignment.title"
                :value="assignment.assignmentId"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="选择题目" prop="questionId">
            <el-select v-model="submitForm.questionId" placeholder="请选择题目">
              <el-option
                v-for="question in filteredQuestions"
                :key="question.questionId"
                :label="question.questionId"
                :value="question.questionId"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="编程语言" prop="language">
            <el-select v-model="submitForm.language" placeholder="请选择编程语言">
              <el-option label="Python" value="python" />
              <el-option label="Java" value="java" />
              <el-option label="C++" value="cpp" />
              <el-option label="JavaScript" value="javascript" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="代码" prop="code">
            <el-input
              v-model="submitForm.code"
              type="textarea"
              placeholder="请输入代码"
              rows="10"
              class="code-textarea"
            />
          </el-form-item>
          
          <el-form-item label="作业描述" prop="description">
            <el-input
              v-model="submitForm.description"
              type="textarea"
              placeholder="请输入作业描述"
              rows="3"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-button"
              @click="handleSubmit"
              :loading="submitting"
              :disabled="!submitForm.assignmentId || !submitForm.questionId || !submitForm.code"
            >
              提交并评测
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 提交记录 -->
      <el-card class="submit-history-card" style="margin-top: var(--spacing-lg);">
        <template #header>
          <div class="card-header">
            <span>提交记录</span>
            <el-button type="primary" link @click="refreshHistory">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        
        <el-table :data="submitHistory" style="width: 100%" v-loading="historyLoading">
          <el-table-column prop="submissionId" label="提交ID" width="120" />
          <el-table-column prop="assignmentId" label="作业ID" width="100" />
          <el-table-column prop="questionId" label="题目ID" width="100" />
          <el-table-column prop="language" label="语言" width="100" />
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" effect="dark">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="分数" width="80">
            <template #default="scope">
              <span v-if="scope.row.score !== null" :class="getScoreClass(scope.row.score)">
                {{ scope.row.score.toFixed(0) }}分
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="ranking" label="排名" width="80">
            <template #default="scope">
              <span v-if="scope.row.ranking !== null">
                #{{ scope.row.ranking }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" link size="small" @click="viewEvaluation(scope.row)">
                查看评测
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 评测结果弹窗 -->
    <el-dialog
      v-model="evaluationDialogVisible"
      title="代码评测结果"
      width="900px"
      center
      :close-on-click-modal="false"
    >
      <div v-if="evaluationResult" class="evaluation-dialog-content">
        <div class="evaluation-header">
          <div class="score-display">
            <div class="score-circle" :class="getScoreClass(evaluationResult.overallScore)">
              <span class="score-value">{{ evaluationResult.overallScore.toFixed(0) }}</span>
              <span class="score-label">分</span>
            </div>
            <div class="score-info">
              <p class="score-comment">{{ evaluationResult.overallComment }}</p>
              <div v-if="evaluationResult.ranking" class="ranking-info">
                <el-tag type="info" size="large">
                  <el-icon><Trophy /></el-icon>
                  排名: {{ evaluationResult.ranking.currentRank }}/{{ evaluationResult.ranking.totalParticipants }}
                </el-tag>
                <el-tag type="success" size="large">
                  <el-icon><TrendCharts /></el-icon>
                  超过 {{ evaluationResult.ranking.scorePercentile }}% 的用户
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="evaluation-details">
          <div class="test-results-section">
            <h3>测试用例结果</h3>
            <div class="test-summary">
              <el-statistic title="通过用例" :value="evaluationResult.passedCount" />
              <el-statistic title="总用例" :value="evaluationResult.totalCount" />
              <el-statistic title="通过率" :value="((evaluationResult.passedCount / evaluationResult.totalCount) * 100).toFixed(1) + '%'" />
            </div>
            
            <el-table :data="evaluationResult.caseResults" style="margin-top: 20px;">
              <el-table-column prop="caseId" label="用例ID" width="100" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="actualOutput" label="实际输出" width="150" />
              <el-table-column prop="expectedOutput" label="期望输出" width="150" />
              <el-table-column prop="executionTimeMs" label="执行时间(ms)" width="120">
                <template #default="scope">
                  {{ scope.row.executionTimeMs.toFixed(1) }}
                </template>
              </el-table-column>
              <el-table-column prop="passed" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.passed ? 'success' : 'danger'" effect="dark">
                    {{ scope.row.passed ? '通过' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <div v-if="evaluationResult.staticIssues && evaluationResult.staticIssues.length > 0" class="static-analysis-section">
            <h3>代码质量分析</h3>
            <el-alert
              v-for="(issue, index) in evaluationResult.staticIssues"
              :key="index"
              :title="issue.message"
              :type="issue.type"
              :closable="false"
              style="margin-bottom: 10px;"
            >
              <template v-if="issue.line">
                <span>行号: {{ issue.line }}</span>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="evaluationDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="viewLeaderboard">查看排名</el-button>
      </template>
    </el-dialog>
    
    <!-- 排名弹窗 -->
    <el-dialog
      v-model="leaderboardDialogVisible"
      title="排行榜"
      width="700px"
      center
    >
      <div class="leaderboard-content">
        <el-table :data="leaderboardData" style="width: 100%">
          <el-table-column prop="rank" label="排名" width="80">
            <template #default="scope">
              <div v-if="scope.row.rank === 1" class="rank-badge gold">🥇</div>
              <div v-else-if="scope.row.rank === 2" class="rank-badge silver">🥈</div>
              <div v-else-if="scope.row.rank === 3" class="rank-badge bronze">🥉</div>
              <div v-else class="rank-badge">{{ scope.row.rank }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="分数" width="100">
            <template #default="scope">
              <span :class="getScoreClass(scope.row.score)" class="score-text">
                {{ scope.row.score.toFixed(0) }}分
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="participant" label="参与者" />
          <el-table-column prop="time" label="提交时间" width="180" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Refresh,
  Trophy,
  TrendCharts
} from '@element-plus/icons-vue'
import { 
  evaluateCode, 
  getLeaderboard, 
  type EvaluationResult 
} from '../services/codeEvaluation'

const router = useRouter()

const submitFormRef = ref()

const submitForm = reactive({
  courseId: '',
  assignmentId: '',
  questionId: '',
  language: 'python',
  code: '',
  description: ''
})

const submitRules = {
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  assignmentId: [
    { required: true, message: '请选择作业', trigger: 'change' }
  ],
  questionId: [
    { required: true, message: '请选择题目', trigger: 'change' }
  ],
  language: [
    { required: true, message: '请选择编程语言', trigger: 'change' }
  ],
  code: [
    { required: true, message: '请输入代码', trigger: 'blur' },
    { min: 10, message: '代码长度至少10个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不超过200字', trigger: 'blur' }
  ]
}

const courses = ref([
  { courseId: 'C001', courseName: '数据结构与算法' },
  { courseId: 'C002', courseName: '操作系统' },
  { courseId: 'C003', courseName: '计算机网络' }
])

const assignments = ref([
  { assignmentId: 'A001', title: '第一次作业', courseId: 'C001' },
  { assignmentId: 'A002', title: '第二次作业', courseId: 'C001' },
  { assignmentId: 'A003', title: '第一次作业', courseId: 'C002' }
])

const questions = ref([
  { questionId: 'Q001', assignmentId: 'A001' },
  { questionId: 'Q002', assignmentId: 'A001' },
  { questionId: 'Q003', assignmentId: 'A002' },
  { questionId: 'Q004', assignmentId: 'A003' }
])

const submitting = ref(false)
const evaluationDialogVisible = ref(false)
const leaderboardDialogVisible = ref(false)
const evaluationResult = ref<EvaluationResult | null>(null)
const historyLoading = ref(false)
const leaderboardData = ref<any[]>([])

const filteredAssignments = computed(() => {
  if (!submitForm.courseId) return []
  return assignments.value.filter(a => a.courseId === submitForm.courseId)
})

const filteredQuestions = computed(() => {
  if (!submitForm.assignmentId) return []
  return questions.value.filter(q => q.assignmentId === submitForm.assignmentId)
})

const submitHistory = ref([
  {
    submissionId: 'S001',
    assignmentId: 'A001',
    questionId: 'Q001',
    studentId: '20240001',
    code: 'print("Hello World")',
    language: 'python',
    submitTime: '2024-01-15 14:30',
    status: '已评分',
    score: 95,
    ranking: 2
  },
  {
    submissionId: 'S002',
    assignmentId: 'A001',
    questionId: 'Q002',
    studentId: '20240001',
    code: 'print("Hello World")',
    language: 'python',
    submitTime: '2024-01-20 10:15',
    status: '已评分',
    score: 88,
    ranking: 5
  },
  {
    submissionId: 'S003',
    assignmentId: 'A002',
    questionId: 'Q003',
    studentId: '20240001',
    code: 'print("Hello World")',
    language: 'python',
    submitTime: '2024-01-25 09:20',
    status: '已评分',
    score: 76,
    ranking: 8
  }
])

const getStatusType = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
  switch (status) {
    case '已提交':
      return 'success'
    case '已评分':
      return 'success'
    case '待评分':
      return 'warning'
    case '提交失败':
      return 'danger'
    default:
      return 'info'
  }
}

const getScoreClass = (score: number): string => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 60) return 'average'
  return 'poor'
}

const handleCourseChange = () => {
  submitForm.assignmentId = ''
  submitForm.questionId = ''
}

const handleAssignmentChange = () => {
  submitForm.questionId = ''
}

const handleSubmit = async () => {
  if (!submitFormRef.value) return
  
  try {
    await submitFormRef.value.validate()
    
    if (!submitForm.questionId) {
      ElMessage.warning('请选择题目')
      return
    }
    
    submitting.value = true
    
    const result = await evaluateCode(
      submitForm.code,
      submitForm.questionId,
      submitForm.language
    )
    
    evaluationResult.value = result
    
    submitHistory.value.unshift({
      submissionId: result.submissionId,
      assignmentId: submitForm.assignmentId,
      questionId: submitForm.questionId,
      studentId: '20240001',
      code: submitForm.code,
      language: submitForm.language,
      submitTime: new Date().toLocaleString('zh-CN'),
      status: '已评分',
      score: result.overallScore,
      ranking: result.ranking?.currentRank || 0
    })
    
    evaluationDialogVisible.value = true
    ElMessage.success('代码提交并评测成功！')
    
    submitting.value = false
  } catch (error: any) {
    console.error('提交失败', error)
    submitting.value = false
    ElMessage.error(error.message || '提交失败，请重试')
  }
}

const viewEvaluation = (row: any) => {
  ElMessage.info(`查看评测结果：${row.assignmentId} - ${row.questionId}`)
}

const viewLeaderboard = () => {
  if (!submitForm.questionId) {
    ElMessage.warning('请先选择题目')
    return
  }
  
  leaderboardData.value = getLeaderboard(submitForm.questionId)
  leaderboardDialogVisible.value = true
}

const refreshHistory = () => {
  historyLoading.value = true
  setTimeout(() => {
    historyLoading.value = false
    ElMessage.success('记录已刷新')
  }, 1000)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.student-submit-container {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.submit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.submit-header h1 {
  color: var(--primary-color);
  font-size: var(--font-size-xl);
}

.submit-content {
  gap: var(--spacing-lg);
}

.submit-form-card {
  margin-bottom: var(--spacing-lg);
}

.submit-button {
  width: 200px;
}

.code-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f5f5f5;
  border-radius: var(--border-radius-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evaluation-dialog-content {
  padding: 20px 0;
}

.evaluation-header {
  text-align: center;
  margin-bottom: 20px;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.score-circle.excellent {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  color: white;
}

.score-circle.good {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  color: white;
}

.score-circle.average {
  background: linear-gradient(135deg, #E6A23C 0%, #f0c78a 100%);
  color: white;
}

.score-circle.poor {
  background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
  color: white;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  opacity: 0.9;
}

.score-info {
  text-align: center;
}

.score-comment {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 15px 0;
}

.ranking-info {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.evaluation-details {
  padding: 20px 0;
}

.test-results-section,
.static-analysis-section {
  margin-bottom: 30px;
}

.test-results-section h3,
.static-analysis-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
  border-left: 4px solid var(--primary-color);
  padding-left: 10px;
}

.test-summary {
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-bottom: 20px;
}

.leaderboard-content {
  padding: 20px 0;
}

.rank-badge {
  font-size: 24px;
  text-align: center;
  font-weight: bold;
}

.rank-badge.gold {
  color: #FFD700;
}

.rank-badge.silver {
  color: #C0C0C0;
}

.rank-badge.bronze {
  color: #CD7F32;
}

.score-text {
  font-weight: 600;
}

.score-text.excellent {
  color: #67C23A;
}

.score-text.good {
  color: #409EFF;
}

.score-text.average {
  color: #E6A23C;
}

.score-text.poor {
  color: #F56C6C;
}

@media (max-width: 768px) {
  .student-submit-container {
    padding: var(--spacing-lg);
  }
  
  .submit-header h1 {
    font-size: var(--font-size-lg);
  }
  
  .submit-button {
    width: 100%;
  }
  
  .score-circle {
    width: 120px;
    height: 120px;
  }
  
  .score-value {
    font-size: 36px;
  }
  
  .test-summary {
    flex-direction: column;
    gap: 15px;
  }
  
  .ranking-info {
    flex-direction: column;
  }
}
</style>