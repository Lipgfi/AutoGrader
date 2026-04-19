<template>
  <div class="admin-dashboard-container">
    <div class="page-header">
      <div class="header-left">
        <h1>管理控制台</h1>
        <p class="header-desc">系统运行状态概览</p>
      </div>
      <div class="header-right">
        <span class="current-time">{{ currentTime }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  User, 
  Reading, 
  Document, 
  TrendCharts, 
  Top,
  Setting 
} from '@element-plus/icons-vue'

const currentTime = ref('')
const chartPeriod = ref('week')

const stats = ref({
  totalUsers: 1256,
  totalCourses: 48,
  totalSubmissions: 8562,
  avgScore: 78.5
})

const chartData = ref([
  { label: '周一', value: 65 },
  { label: '周二', value: 78 },
  { label: '周三', value: 82 },
  { label: '周四', value: 70 },
  { label: '周五', value: 90 },
  { label: '周六', value: 45 },
  { label: '周日', value: 55 }
])

const recentSubmissions = ref([
  { id: 1, name: '张三', course: '数据结构与算法', assignment: '第一次作业', score: 95, time: '5分钟前' },
  { id: 2, name: '李四', course: '操作系统原理', assignment: '进程调度', score: 88, time: '12分钟前' },
  { id: 3, name: '王五', course: '计算机网络', assignment: 'TCP连接', score: 72, time: '25分钟前' },
  { id: 4, name: '赵六', course: '数据结构与算法', assignment: '第二次作业', score: 45, time: '1小时前' },
  { id: 5, name: '钱七', course: '操作系统原理', assignment: '内存管理', score: 92, time: '2小时前' }
])

const systemActivities = ref([
  { id: 1, type: 'user', content: '新用户 张三 完成注册', time: '5分钟前' },
  { id: 2, type: 'course', content: '教师 李教授 创建了新课程《算法设计》', time: '30分钟前' },
  { id: 3, type: 'assignment', content: '作业《第三次编程练习》已发布', time: '1小时前' },
  { id: 4, type: 'system', content: '系统已完成数据备份', time: '2小时前' },
  { id: 5, type: 'user', content: '用户 王五 重置了密码', time: '3小时前' }
])

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
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
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
</style>
