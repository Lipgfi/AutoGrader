<template>
  <div class="admin-dashboard-container">
    <div v-if="loading" class="loading-overlay">
      <el-spinner size="large" />
      <span class="loading-text">加载中...</span>
    </div>
    
    <div class="page-header">
      <div class="header-left">
        <h1>管理控制台</h1>
        <p class="header-desc">系统运行状态概览</p>
      </div>
      <div class="header-right">
        <span class="current-time">{{ currentTime }}</span>
        <el-button
          icon="ArrowRight"
          @click="handleLogout"
          class="logout-btn"
        >
          退出登录
        </el-button>
      </div>
    </div>
    
    <div class="stats-overview">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: var(--primary-bg);">
            <el-icon :size="28" style="color: var(--primary-color);"><User /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalUsers }}</span>
            <span class="stat-label">用户总数</span>
          </div>
        </div>
        <div class="stat-footer">
          <span class="trend up">
            <el-icon><Top /></el-icon>
            +12%
          </span>
          <span class="period">较上月</span>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: var(--success-bg);">
            <el-icon :size="28" style="color: var(--success-color);"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalCourses }}</span>
            <span class="stat-label">课程总数</span>
          </div>
        </div>
        <div class="stat-footer">
          <span class="trend up">
            <el-icon><Top /></el-icon>
            +8%
          </span>
          <span class="period">较上月</span>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: var(--warning-bg);">
            <el-icon :size="28" style="color: var(--warning-color);"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalSubmissions }}</span>
            <span class="stat-label">提交总数</span>
          </div>
        </div>
        <div class="stat-footer">
          <span class="trend up">
            <el-icon><Top /></el-icon>
            +25%
          </span>
          <span class="period">较上月</span>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background-color: var(--danger-bg);">
            <el-icon :size="28" style="color: var(--danger-color);"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.avgScore }}</span>
            <span class="stat-label">平均分数</span>
          </div>
        </div>
        <div class="stat-footer">
          <span class="trend up">
            <el-icon><Top /></el-icon>
            +3%
          </span>
          <span class="period">较上月</span>
        </div>
      </el-card>
    </div>
    
    <el-row :gutter="24">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>提交趋势</span>
              <el-radio-group v-model="chartPeriod" size="small">
                <el-radio-button label="week">近一周</el-radio-button>
                <el-radio-button label="month">近一月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div v-for="(item, index) in chartData" :key="index" class="chart-bar-item">
                  <div class="bar-wrapper">
                    <div class="bar" :style="{ height: item.value + '%' }"></div>
                  </div>
                  <span class="bar-label">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="pie-chart-card">
          <template #header>
            <span>用户分布</span>
          </template>
          <div class="pie-chart-container">
            <div class="pie-chart">
              <div class="pie-segment student" style="--percentage: 0.7;"></div>
              <div class="pie-segment teacher" style="--percentage: 0.25;"></div>
              <div class="pie-segment admin" style="--percentage: 0.05;"></div>
              <div class="pie-center">
                <span class="pie-total">{{ stats.totalUsers }}</span>
                <span class="pie-label">总用户</span>
              </div>
            </div>
            <div class="pie-legend">
              <div class="legend-item">
                <span class="legend-color student"></span>
                <span class="legend-label">学生</span>
                <span class="legend-value">70%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color teacher"></span>
                <span class="legend-label">教师</span>
                <span class="legend-value">25%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color admin"></span>
                <span class="legend-label">管理员</span>
                <span class="legend-value">5%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="24" style="margin-top: var(--spacing-lg);">
      <el-col :span="12">
        <el-card class="recent-card">
          <template #header>
            <div class="card-header">
              <span>最近提交</span>
              <el-button type="primary" link size="small">查看全部</el-button>
            </div>
          </template>
          <div class="recent-list">
            <div v-for="item in recentSubmissions" :key="item.id" class="recent-item">
              <div class="item-avatar">
                <el-avatar :size="36">{{ item.name.charAt(0) }}</el-avatar>
              </div>
              <div class="item-content">
                <div class="item-header">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-time">{{ item.time }}</span>
                </div>
                <div class="item-desc">{{ item.course }} - {{ item.assignment }}</div>
              </div>
              <div class="item-score">
                <el-tag :type="item.score >= 60 ? 'success' : 'danger'" size="small">
                  {{ item.score }}分
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>系统动态</span>
              <el-button type="primary" link size="small">查看全部</el-button>
            </div>
          </template>
          <div class="activity-list">
            <div v-for="item in systemActivities" :key="item.id" class="activity-item">
              <div class="activity-icon" :class="item.type">
                <el-icon v-if="item.type === 'user'"><User /></el-icon>
                <el-icon v-else-if="item.type === 'course'"><Reading /></el-icon>
                <el-icon v-else-if="item.type === 'assignment'"><Document /></el-icon>
                <el-icon v-else><Setting /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-text">{{ item.content }}</div>
                <div class="activity-time">{{ item.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: var(--spacing-lg);">
      <el-col :span="24">
        <el-card class="weekly-report-card">
          <template #header>
            <div class="card-header">
              <span>📋 第七周项目周报</span>
              <div class="report-meta">
                <el-tag type="info" size="small">项目名称：AutoGrader作业代码自动评分系统</el-tag>
                <el-tag type="warning" size="small">当前版本：Beta1</el-tag>
                <el-tag type="success" size="small">项目进度：65%</el-tag>
              </div>
            </div>
          </template>
          
          <el-tabs v-model="reportActiveTab" class="report-tabs">
            <el-tab-pane label="本周工作内容" name="work">
              <el-table :data="weeklyWorkItems" stripe style="width: 100%" size="small">
                <el-table-column prop="task" label="任务描述" min-width="180" />
                <el-table-column prop="deliverables" label="成果物" min-width="280" />
                <el-table-column prop="progress" label="进度（%）" width="100" align="center">
                  <template #default="scope">
                    <el-progress 
                      :percentage="scope.row.progress" 
                      :status="scope.row.progress === 100 ? 'success' : scope.row.progress >= 70 ? 'warning' : undefined"
                      :stroke-width="10"
                      size="small"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="issue" label="异常原因" min-width="150" />
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="遇到的问题及解决方法" name="problems">
              <el-collapse v-model="activeProblems" accordion class="problem-collapse">
                <el-collapse-item 
                  v-for="(problem, index) in problemsAndSolutions" 
                  :key="index" 
                  :title="(index + 1) + '. ' + problem.problem"
                  :name="index"
                >
                  <template #title>
                    <div class="problem-title">
                      <el-icon><Warning /></el-icon>
                      <span>{{ problem.problem }}</span>
                    </div>
                  </template>
                  <div class="problem-solution">
                    <el-icon color="var(--success-color)"><SuccessFilled /></el-icon>
                    <span>{{ problem.solution }}</span>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>
            
            <el-tab-pane label="需协调解决的问题和建议" name="suggestions">
              <div class="suggestions-list">
                <el-card 
                  v-for="(suggestion, index) in suggestions" 
                  :key="index" 
                  class="suggestion-card"
                  shadow="hover"
                >
                  <template #header>
                    <div class="suggestion-header">
                      <el-icon color="var(--warning-color)"><QuestionFilled /></el-icon>
                      <span>建议 {{ index + 1 }}</span>
                    </div>
                  </template>
                  <div class="suggestion-content">
                    {{ suggestion }}
                  </div>
                </el-card>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { getSystemStats } from '../../api/system'
import { 
  User, 
  Reading, 
  Document, 
  TrendCharts, 
  Top,
  Setting,
  Warning,
  SuccessFilled,
  QuestionFilled,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const currentTime = ref('')
const chartPeriod = ref('week')
const reportActiveTab = ref('work')
const activeProblems = ref<number | string>(0)
const loading = ref(false)

const stats = ref({
  totalUsers: 0,
  totalCourses: 0,
  totalSubmissions: 0,
  avgScore: 0
})

const chartData = ref<{ label: string; value: number }[]>([])
const recentSubmissions = ref<any[]>([])
const systemActivities = ref<any[]>([])

const loadingCount = ref(0)

const setLoading = (isLoading: boolean) => {
  if (isLoading) {
    loadingCount.value++
    loading.value = true
  } else {
    loadingCount.value--
    if (loadingCount.value <= 0) {
      loading.value = false
      loadingCount.value = 0
    }
  }
}

// 加载统计数据
const loadStats = async () => {
  setLoading(true)
  try {
    const response = await getSystemStats()
    if (response.data && response.data.code === 200) {
      stats.value = {
        totalUsers: response.data.totalUsers || 0,
        totalCourses: response.data.totalCourses || 0,
        totalSubmissions: response.data.totalSubmissions || 0,
        avgScore: response.data.avgScore || 0
      }
      // 图表数据
      if (response.data.chartData) {
        chartData.value = response.data.chartData
      }
      // 最近提交
      if (response.data.recentSubmissions) {
        recentSubmissions.value = response.data.recentSubmissions
      }
      // 系统活动
      if (response.data.systemActivities) {
        systemActivities.value = response.data.systemActivities
      }
    }
  } catch (error) {
    console.error('[Dashboard] 加载统计数据失败:', error)
  } finally {
    setLoading(false)
  }
}

const weeklyWorkItems = ref<any[]>([])
const problemsAndSolutions = ref<any[]>([])
const suggestions = ref<string[]>([])

const loadProjectData = async () => {
  setLoading(true)
  try {
    const { request } = await import('../../api/interceptors')
    const response = await request.get('/system/project/data')
    if (response.data && response.data.code === 200) {
      weeklyWorkItems.value = response.data.weeklyWorkItems || []
      problemsAndSolutions.value = response.data.problemsAndSolutions || []
      suggestions.value = response.data.suggestions || []
    }
  } catch (error) {
    console.warn('[Dashboard] 加载项目数据失败，使用默认数据:', error)
    // 使用默认数据作为降级方案
    weeklyWorkItems.value = [
      { task: '系统监控模块', deliverables: '系统状态监控、性能指标展示', progress: 85, issue: '' },
      { task: '用户管理优化', deliverables: '权限管理、角色分配', progress: 90, issue: '' },
      { task: '数据统计分析', deliverables: '报表生成、趋势分析', progress: 75, issue: '' }
    ]
    problemsAndSolutions.value = []
    suggestions.value = []
  } finally {
    setLoading(false)
  }
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

let timer: number

onMounted(() => {
  updateTime()
  loadStats()
  loadProjectData()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-dashboard-container {
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

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-left h1 {
  color: var(--text-primary);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-xs) 0;
}

.logout-btn {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  
  &:hover {
    background-color: var(--danger-light);
    border-color: var(--danger-light);
  }
}

.header-desc {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.current-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: var(--font-family-code);
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

.stat-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.trend.up {
  color: var(--success-color);
}

.trend.down {
  color: var(--danger-color);
}

.period {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.chart-card,
.pie-chart-card,
.recent-card,
.activity-card {
  border: 1px solid var(--border-light);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding: var(--spacing-md);
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  height: 100%;
}

.chart-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.bar-wrapper {
  width: 40px;
  height: 200px;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, var(--primary-color) 0%, var(--primary-light) 100%);
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
  transition: height var(--transition-normal);
}

.bar-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.pie-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
}

.pie-chart {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    var(--primary-color) 0deg calc(0.7 * 360deg),
    var(--success-color) calc(0.7 * 360deg) calc(0.95 * 360deg),
    var(--warning-color) calc(0.95 * 360deg) 360deg
  );
  position: relative;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background-color: var(--bg-primary);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pie-total {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.pie-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: var(--border-radius-full);
}

.legend-color.student { background-color: var(--primary-color); }
.legend-color.teacher { background-color: var(--success-color); }
.legend-color.admin { background-color: var(--warning-color); }

.legend-label {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.legend-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.recent-list,
.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: background-color var(--transition-fast);
}

.recent-item:hover {
  background-color: var(--bg-secondary);
}

.item-content {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.item-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.item-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.activity-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: background-color var(--transition-fast);
}

.activity-item:hover {
  background-color: var(--bg-secondary);
}

.activity-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-full);
  flex-shrink: 0;
}

.activity-icon.user { background-color: var(--primary-bg); color: var(--primary-color); }
.activity-icon.course { background-color: var(--success-bg); color: var(--success-color); }
.activity-icon.assignment { background-color: var(--warning-bg); color: var(--warning-color); }
.activity-icon.system { background-color: var(--bg-tertiary); color: var(--text-secondary); }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.activity-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

@media (max-width: 1200px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-dashboard-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
}

.weekly-report-card {
  border: 1px solid var(--border-light);
}

.report-meta {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.report-tabs {
  margin-top: var(--spacing-md);
}

.problem-collapse {
  margin-top: var(--spacing-md);
}

.problem-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.problem-solution {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-sm);
  line-height: 1.6;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.suggestion-card {
  border: 1px solid var(--border-light);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.suggestion-content {
  line-height: 1.6;
  color: var(--text-secondary);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  gap: var(--spacing-md);
}

.loading-text {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}
</style>
