<template>
  <div class="grades-container">
    <div class="page-header">
      <div class="header-left">
        <h1>成绩总览</h1>
        <p class="header-desc">查看您的所有作业成绩和统计数据</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="exportGrades">
          <el-icon><Download /></el-icon>
          导出成绩
        </el-button>
      </div>
    </div>
    
    <div class="stats-overview">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: var(--primary-bg);">
            <el-icon :size="24" style="color: var(--primary-color);"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalAssignments }}</span>
            <span class="stat-label">作业总数</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: var(--success-bg);">
            <el-icon :size="24" style="color: var(--success-color);"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.completedAssignments }}</span>
            <span class="stat-label">已完成</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: var(--warning-bg);">
            <el-icon :size="24" style="color: var(--warning-color);"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.avgScore }}</span>
            <span class="stat-label">平均分</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: var(--danger-bg);">
            <el-icon :size="24" style="color: var(--danger-color);"><Trophy /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">#{{ stats.ranking }}</span>
            <span class="stat-label">班级排名</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-card class="filter-card">
      <div class="filter-row">
        <el-select v-model="filterCourse" placeholder="选择课程" clearable class="filter-select">
          <el-option label="全部课程" value="" />
          <el-option v-for="course in courses" :key="course.id" :label="course.name" :value="course.id" />
        </el-select>
        
        <el-select v-model="filterStatus" placeholder="完成状态" clearable class="filter-select">
          <el-option label="全部状态" value="" />
          <el-option label="已完成" value="completed" />
          <el-option label="未完成" value="pending" />
        </el-select>
        
        <el-select v-model="filterScoreRange" placeholder="分数范围" clearable class="filter-select">
          <el-option label="全部分数" value="" />
          <el-option label="90-100分" value="90-100" />
          <el-option label="80-89分" value="80-89" />
          <el-option label="60-79分" value="60-79" />
          <el-option label="60分以下" value="0-59" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索作业名称"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>
    </el-card>
    
    <el-card class="grades-card">
      <el-table :data="filteredGrades" style="width: 100%" @row-click="viewDetail">
        <el-table-column prop="courseName" label="课程" width="180" />
        <el-table-column prop="assignmentName" label="作业名称" min-width="200">
          <template #default="scope">
            <div class="assignment-name">
              <span class="name">{{ scope.row.assignmentName }}</span>
              <span class="deadline">截止：{{ scope.row.deadline }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'" effect="dark" size="small">
              {{ scope.row.status === 'completed' ? '已完成' : '未完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="120" align="center">
          <template #default="scope">
            <div v-if="scope.row.score !== null" class="score-display">
              <span class="score" :class="getScoreClass(scope.row.score)">
                {{ scope.row.score }}
              </span>
              <span class="score-total">/ {{ scope.row.totalScore }}</span>
            </div>
            <span v-else class="no-score">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="通过率" width="120" align="center">
          <template #default="scope">
            <el-progress
              v-if="scope.row.passRate !== null"
              :percentage="scope.row.passRate"
              :color="getProgressColor(scope.row.passRate)"
              :stroke-width="8"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'completed'"
              type="primary"
              link
              size="small"
              @click.stop="viewDetail(scope.row)"
            >
              查看详情
            </el-button>
            <el-button
              v-else
              type="primary"
              link
              size="small"
              @click.stop="goToSubmit(scope.row)"
            >
              去提交
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog
      v-model="detailDialogVisible"
      title="成绩详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedGrade" class="detail-content">
        <div class="detail-header">
          <div class="detail-info">
            <h2>{{ selectedGrade.assignmentName }}</h2>
            <p class="detail-meta">
              <span>{{ selectedGrade.courseName }}</span>
              <span class="divider">|</span>
              <span>提交时间：{{ selectedGrade.submitTime }}</span>
            </p>
          </div>
          <div class="detail-score">
            <div class="score-circle" :class="getScoreClass(selectedGrade.score || 0)">
              <span class="score-num">{{ selectedGrade.score || 0 }}</span>
              <span class="score-unit">分</span>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-stats">
          <div class="stat-item">
            <span class="stat-value">{{ selectedGrade.passedCases }}/{{ selectedGrade.totalCases }}</span>
            <span class="stat-label">通过用例</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ selectedGrade.passRate }}%</span>
            <span class="stat-label">通过率</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ selectedGrade.runtime }}ms</span>
            <span class="stat-label">运行时间</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">#{{ selectedGrade.ranking }}</span>
            <span class="stat-label">排名</span>
          </div>
        </div>
        
        <div class="testcases-detail">
          <h3>测试用例详情</h3>
          <div class="testcases-list">
            <div
              v-for="(tc, index) in selectedGrade.testCases"
              :key="index"
              class="testcase-item"
              :class="tc.passed ? 'passed' : 'failed'"
            >
              <div class="testcase-header">
                <span class="testcase-name">用例 {{ (index as number) + 1 }}</span>
                <el-tag :type="tc.passed ? 'success' : 'danger'" size="small">
                  {{ tc.passed ? '通过' : '失败' }}
                </el-tag>
              </div>
              <div class="testcase-body">
                <div class="testcase-row">
                  <span class="row-label">输入：</span>
                  <pre class="row-code">{{ tc.input }}</pre>
                </div>
                <div class="testcase-row">
                  <span class="row-label">期望输出：</span>
                  <pre class="row-code expected">{{ tc.expectedOutput }}</pre>
                </div>
                <div v-if="!tc.passed" class="testcase-row">
                  <span class="row-label">实际输出：</span>
                  <pre class="row-code actual">{{ tc.actualOutput }}</pre>
                </div>
                <div class="testcase-row">
                  <span class="row-label">执行时间：</span>
                  <span class="row-value">{{ tc.executionTime }}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="retrySubmit">重新提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  Document, 
  CircleCheck, 
  TrendCharts, 
  Trophy 
} from '@element-plus/icons-vue'

const router = useRouter()

const filterCourse = ref('')
const filterStatus = ref('')
const filterScoreRange = ref('')
const searchKeyword = ref('')
const detailDialogVisible = ref(false)
const selectedGrade = ref<any>(null)

const stats = ref({
  totalAssignments: 15,
  completedAssignments: 12,
  avgScore: 85.6,
  ranking: 5
})

const courses = ref([
  { id: 'C001', name: '数据结构与算法' },
  { id: 'C002', name: '操作系统原理' },
  { id: 'C003', name: '计算机网络' }
])

const grades = ref([
  {
    id: 'G001',
    courseId: 'C001',
    courseName: '数据结构与算法',
    assignmentName: '第一次作业 - 数组与链表',
    deadline: '2026-04-05 23:59',
    status: 'completed',
    score: 95,
    totalScore: 100,
    passRate: 100,
    submitTime: '2026-04-03 15:30',
    passedCases: 3,
    totalCases: 3,
    runtime: 32,
    ranking: 2,
    testCases: [
      { passed: true, input: '[2,7,11,15], 9', expectedOutput: '[0,1]', actualOutput: '[0,1]', executionTime: 12 },
      { passed: true, input: '[3,2,4], 6', expectedOutput: '[1,2]', actualOutput: '[1,2]', executionTime: 8 },
      { passed: true, input: '[3,3], 6', expectedOutput: '[0,1]', actualOutput: '[0,1]', executionTime: 12 }
    ]
  },
  {
    id: 'G002',
    courseId: 'C001',
    courseName: '数据结构与算法',
    assignmentName: '第二次作业 - 栈与队列',
    deadline: '2026-04-10 23:59',
    status: 'completed',
    score: 88,
    totalScore: 100,
    passRate: 75,
    submitTime: '2026-04-08 20:15',
    passedCases: 3,
    totalCases: 4,
    runtime: 45,
    ranking: 8,
    testCases: [
      { passed: true, input: '["2","1","+","3","*"]', expectedOutput: '9', actualOutput: '9', executionTime: 15 },
      { passed: true, input: '["4","13","5","/","+"]', expectedOutput: '6', actualOutput: '6', executionTime: 12 },
      { passed: true, input: '["10","6","9","3","+","-11","*","/","*","17","+","5","+"]', expectedOutput: '22', actualOutput: '22', executionTime: 18 },
      { passed: false, input: '["3","2","1","-","*","5","*"]', expectedOutput: '-15', actualOutput: '15', executionTime: 10 }
    ]
  },
  {
    id: 'G003',
    courseId: 'C002',
    courseName: '操作系统原理',
    assignmentName: '进程调度模拟',
    deadline: '2026-04-15 23:59',
    status: 'pending',
    score: null,
    totalScore: 100,
    passRate: null,
    submitTime: '-',
    passedCases: 0,
    totalCases: 0,
    runtime: 0,
    ranking: 0,
    testCases: []
  },
  {
    id: 'G004',
    courseId: 'C003',
    courseName: '计算机网络',
    assignmentName: 'TCP连接模拟',
    deadline: '2026-04-12 23:59',
    status: 'completed',
    score: 72,
    totalScore: 100,
    passRate: 60,
    submitTime: '2026-04-11 18:45',
    passedCases: 3,
    totalCases: 5,
    runtime: 68,
    ranking: 15,
    testCases: [
      { passed: true, input: 'SYN', expectedOutput: 'SYN-ACK', actualOutput: 'SYN-ACK', executionTime: 20 },
      { passed: true, input: 'ACK', expectedOutput: 'ESTABLISHED', actualOutput: 'ESTABLISHED', executionTime: 15 },
      { passed: true, input: 'FIN', expectedOutput: 'FIN-ACK', actualOutput: 'FIN-ACK', executionTime: 18 },
      { passed: false, input: 'RST', expectedOutput: 'CLOSED', actualOutput: 'ERROR', executionTime: 10 },
      { passed: false, input: 'PSH', expectedOutput: 'DATA_TRANSFER', actualOutput: 'UNKNOWN', executionTime: 5 }
    ]
  }
])

const filteredGrades = computed(() => {
  let result = grades.value
  
  if (filterCourse.value) {
    result = result.filter(g => g.courseId === filterCourse.value)
  }
  
  if (filterStatus.value) {
    result = result.filter(g => g.status === filterStatus.value)
  }
  
  if (filterScoreRange.value) {
    const [min, max] = filterScoreRange.value.split('-').map(Number)
    result = result.filter(g => g.score !== null && g.score >= min && g.score <= max)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(g => 
      g.assignmentName.toLowerCase().includes(keyword) ||
      g.courseName.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const getScoreClass = (score: number): string => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 60) return 'average'
  return 'poor'
}

const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return '#00B42A'
  if (percentage >= 60) return '#165DFF'
  if (percentage >= 40) return '#FF7D00'
  return '#F53F3F'
}

const viewDetail = (row: any) => {
  if (row.status !== 'completed') {
    goToSubmit(row)
    return
  }
  selectedGrade.value = row
  detailDialogVisible.value = true
}

const goToSubmit = (row: any) => {
  router.push(`/student/coding/${row.id}`)
}

const retrySubmit = () => {
  if (selectedGrade.value) {
    router.push(`/student/coding/${selectedGrade.value.id}`)
  }
}

const exportGrades = () => {
  ElMessage.success('成绩导出成功')
}
</script>

<style scoped>
.grades-container {
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

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  border: 1px solid var(--border-light);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.filter-card {
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-light);
}

.filter-row {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.filter-select {
  width: 160px;
}

.search-input {
  width: 250px;
  margin-left: auto;
}

.grades-card {
  border: 1px solid var(--border-light);
}

.assignment-name {
  display: flex;
  flex-direction: column;
}

.assignment-name .name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.assignment-name .deadline {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.score {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.score.excellent { color: var(--success-color); }
.score.good { color: var(--primary-color); }
.score.average { color: var(--warning-color); }
.score.poor { color: var(--danger-color); }

.score-total {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.no-score {
  color: var(--text-tertiary);
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

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.score-circle.excellent { background: linear-gradient(135deg, #00B42A 0%, #52C41A 100%); }
.score-circle.good { background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%); }
.score-circle.average { background: linear-gradient(135deg, #FF7D00 0%, #FFA940 100%); }
.score-circle.poor { background: linear-gradient(135deg, #F53F3F 0%, #F76560 100%); }

.score-num {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.score-unit {
  font-size: var(--font-size-xs);
}

.detail-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xxl);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
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
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.testcases-detail h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.testcases-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
}

.testcase-item {
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.testcase-item.passed {
  border-left: 4px solid var(--success-color);
}

.testcase-item.failed {
  border-left: 4px solid var(--danger-color);
}

.testcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-secondary);
}

.testcase-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.testcase-body {
  padding: var(--spacing-md);
}

.testcase-row {
  margin-bottom: var(--spacing-sm);
}

.testcase-row:last-child {
  margin-bottom: 0;
}

.row-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.row-code {
  background-color: var(--bg-tertiary);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-code);
  font-size: var(--font-size-xs);
  margin: 0;
  white-space: pre-wrap;
}

.row-code.expected {
  border-left: 3px solid var(--success-color);
}

.row-code.actual {
  border-left: 3px solid var(--danger-color);
}

.row-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

@media (max-width: 1200px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .grades-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .filter-select,
  .search-input {
    width: 100%;
    margin-left: 0;
  }
  
  .detail-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: center;
    text-align: center;
  }
  
  .detail-stats {
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }
}
</style>
