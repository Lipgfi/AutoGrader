<template>
  <div class="grade-management-container">
    <div class="grade-header">
      <h1>成绩管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="exportGrades">
          <el-icon><Download /></el-icon>
          导出成绩
        </el-button>
        <el-button @click="refreshGrades">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="学期">
          <el-select v-model="filterForm.semester" placeholder="请选择学期" clearable>
            <el-option label="2023-2024 第一学期" value="2023-1" />
            <el-option label="2023-2024 第二学期" value="2023-2" />
            <el-option label="2024-2025 第一学期" value="2024-1" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="课程">
          <el-select v-model="filterForm.courseId" placeholder="请选择课程" clearable>
            <el-option label="Python程序设计" :value="1" />
            <el-option label="数据结构" :value="2" />
            <el-option label="算法设计" :value="3" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="班级">
          <el-select v-model="filterForm.className" placeholder="请选择班级" clearable>
            <el-option label="计算机2301班" value="计算机2301班" />
            <el-option label="计算机2302班" value="计算机2302班" />
            <el-option label="软件2301班" value="软件2301班" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="学生">
          <el-input v-model="filterForm.studentName" placeholder="请输入学生姓名或学号" clearable />
        </el-form-item>
        
        <el-form-item label="成绩范围">
          <el-slider
            v-model="filterForm.scoreRange"
            range
            :min="0"
            :max="100"
            :marks="scoreMarks"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.totalStudents }}</span>
            <span class="stat-label">总人数</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon submitted">
            <el-icon><DocumentChecked /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.submittedCount }}</span>
            <span class="stat-label">已提交</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon average">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.averageScore }}</span>
            <span class="stat-label">平均分</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pass">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.passRate }}%</span>
            <span class="stat-label">及格率</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon excellent">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.excellentRate }}%</span>
            <span class="stat-label">优秀率</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 成绩分布图表 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>成绩分布</span>
          <el-radio-group v-model="chartType" size="small">
            <el-radio-button label="bar">柱状图</el-radio-button>
            <el-radio-button label="pie">饼图</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="chart-container" ref="chartContainer">
        <!-- 图表区域 -->
        <div class="chart-placeholder">
          <div class="bar-chart" v-if="chartType === 'bar'">
            <div class="bar-item" v-for="(item, index) in scoreDistribution" :key="index">
              <div class="bar" :style="{ height: (item.count / maxCount * 200) + 'px' }">
                <span class="bar-value">{{ item.count }}</span>
              </div>
              <span class="bar-label">{{ item.range }}</span>
            </div>
          </div>
          <div class="pie-chart" v-else>
            <div class="pie-legend">
              <div class="legend-item" v-for="(item, index) in scoreDistribution" :key="index">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-label">{{ item.range }}: {{ item.count }}人</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 成绩列表 -->
    <el-card class="grade-list-card">
      <template #header>
        <div class="card-header">
          <span>成绩列表</span>
          <div class="header-tools">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学生姓名或学号"
              prefix-icon="Search"
              clearable
              class="search-input"
            />
            <el-button-group>
              <el-button :type="viewMode === 'table' ? 'primary' : 'default'" @click="viewMode = 'table'">
                <el-icon><List /></el-icon>
              </el-button>
              <el-button :type="viewMode === 'card' ? 'primary' : 'default'" @click="viewMode = 'card'">
                <el-icon><Grid /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>
      
      <!-- 表格视图 -->
      <el-table
        v-if="viewMode === 'table'"
        :data="gradeList"
        style="width: 100%"
        v-loading="loading"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="rank" label="排名" width="80" sortable />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="homeworkScore" label="作业成绩" width="100" sortable>
          <template #default="scope">
            <el-tag :type="getScoreType(scope.row.homeworkScore)">
              {{ scope.row.homeworkScore }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="examScore" label="考试成绩" width="100" sortable>
          <template #default="scope">
            <el-tag :type="getScoreType(scope.row.examScore)">
              {{ scope.row.examScore }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总评成绩" width="100" sortable>
          <template #default="scope">
            <el-tag :type="getScoreType(scope.row.totalScore)" effect="dark">
              {{ scope.row.totalScore }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gradeLevel" label="等级" width="80">
          <template #default="scope">
            <span :class="'grade-level-' + scope.row.gradeLevel.toLowerCase()">
              {{ scope.row.gradeLevel }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="viewDetail(scope.row)">
              详情
            </el-button>
            <el-button type="primary" link size="small" @click="editGrade(scope.row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 卡片视图 -->
      <div v-else class="grade-card-list">
        <el-card v-for="item in gradeList" :key="item.id" class="grade-item-card">
          <div class="card-content">
            <div class="student-info">
              <el-avatar :size="50" class="student-avatar">
                {{ item.studentName.charAt(0) }}
              </el-avatar>
              <div class="info-text">
                <span class="student-name">{{ item.studentName }}</span>
                <span class="student-no">{{ item.studentNo }}</span>
                <span class="class-name">{{ item.className }}</span>
              </div>
            </div>
            <div class="score-info">
              <div class="score-item">
                <span class="score-label">作业</span>
                <span class="score-value" :class="getScoreClass(item.homeworkScore)">
                  {{ item.homeworkScore }}
                </span>
              </div>
              <div class="score-item">
                <span class="score-label">考试</span>
                <span class="score-value" :class="getScoreClass(item.examScore)">
                  {{ item.examScore }}
                </span>
              </div>
              <div class="score-item total">
                <span class="score-label">总评</span>
                <span class="score-value" :class="getScoreClass(item.totalScore)">
                  {{ item.totalScore }}
                </span>
              </div>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small" @click="viewDetail(item)">详情</el-button>
              <el-button size="small" @click="editGrade(item)">编辑</el-button>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 成绩详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="成绩详情"
      width="600px"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="currentStudent">
        <el-descriptions-item label="学号">{{ currentStudent.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentStudent.studentName }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ currentStudent.className }}</el-descriptions-item>
        <el-descriptions-item label="排名">{{ currentStudent.rank }}</el-descriptions-item>
        <el-descriptions-item label="作业成绩">
          <el-tag :type="getScoreType(currentStudent.homeworkScore)">
            {{ currentStudent.homeworkScore }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="考试成绩">
          <el-tag :type="getScoreType(currentStudent.examScore)">
            {{ currentStudent.examScore }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总评成绩" :span="2">
          <el-tag :type="getScoreType(currentStudent.totalScore)" effect="dark" size="large">
            {{ currentStudent.totalScore }}
          </el-tag>
          <span class="grade-level" :class="'level-' + currentStudent.gradeLevel.toLowerCase()">
            {{ currentStudent.gradeLevel }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">
          {{ currentStudent.submitTime }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="homework-detail">
        <h4>作业详情</h4>
        <el-table :data="currentStudent?.homeworkDetails || []" size="small">
          <el-table-column prop="homeworkName" label="作业名称" />
          <el-table-column prop="submitTime" label="提交时间" width="160" />
          <el-table-column prop="score" label="得分" width="80">
            <template #default="scope">
              <el-tag :type="getScoreType(scope.row.score)" size="small">
                {{ scope.row.score }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === '已评分' ? 'success' : 'warning'" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    
    <!-- 编辑成绩弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑成绩"
      width="500px"
      destroy-on-close
    >
      <el-form :model="editForm" label-width="100px" v-if="currentStudent">
        <el-form-item label="学生">
          <span>{{ currentStudent.studentName }} ({{ currentStudent.studentNo }})</span>
        </el-form-item>
        <el-form-item label="作业成绩">
          <el-input-number v-model="editForm.homeworkScore" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="考试成绩">
          <el-input-number v-model="editForm.examScore" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGrade">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  Refresh, 
  Search, 
  RefreshLeft, 
  User, 
  DocumentChecked, 
  TrendCharts, 
  CircleCheckFilled, 
  Trophy,
  List,
  Grid
} from '@element-plus/icons-vue'

const loading = ref(false)
const viewMode = ref<'table' | 'card'>('table')
const chartType = ref<'bar' | 'pie'>('bar')
const searchKeyword = ref('')
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentStudent = ref<any>(null)

const filterForm = reactive({
  semester: '',
  courseId: null as number | null,
  className: '',
  studentName: '',
  scoreRange: [0, 100] as [number, number]
})

const scoreMarks = {
  0: '0',
  60: '60',
  80: '80',
  100: '100'
}

const statistics = reactive({
  totalStudents: 120,
  submittedCount: 115,
  averageScore: 78.5,
  passRate: 85,
  excellentRate: 25
})

const scoreDistribution = ref([
  { range: '0-59', count: 18, color: '#F56C6C' },
  { range: '60-69', count: 25, color: '#E6A23C' },
  { range: '70-79', count: 32, color: '#409EFF' },
  { range: '80-89', count: 28, color: '#67C23A' },
  { range: '90-100', count: 12, color: '#003D79' }
])

const maxCount = computed(() => Math.max(...scoreDistribution.value.map(item => item.count)))

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 120
})

const gradeList = ref([
  {
    id: 1,
    rank: 1,
    studentNo: '2024001',
    studentName: '张三',
    className: '计算机2301班',
    homeworkScore: 95,
    examScore: 92,
    totalScore: 93,
    gradeLevel: 'A',
    submitTime: '2024-01-20 15:30',
    homeworkDetails: [
      { homeworkName: '第一次作业', submitTime: '2024-01-15 14:30', score: 95, status: '已评分' },
      { homeworkName: '第二次作业', submitTime: '2024-01-20 15:30', score: 92, status: '已评分' }
    ]
  },
  {
    id: 2,
    rank: 2,
    studentNo: '2024002',
    studentName: '李四',
    className: '计算机2301班',
    homeworkScore: 88,
    examScore: 85,
    totalScore: 86,
    gradeLevel: 'B',
    submitTime: '2024-01-20 16:20',
    homeworkDetails: []
  },
  {
    id: 3,
    rank: 3,
    studentNo: '2024003',
    studentName: '王五',
    className: '计算机2302班',
    homeworkScore: 75,
    examScore: 70,
    totalScore: 72,
    gradeLevel: 'C',
    submitTime: '2024-01-20 17:10',
    homeworkDetails: []
  },
  {
    id: 4,
    rank: 4,
    studentNo: '2024004',
    studentName: '赵六',
    className: '软件2301班',
    homeworkScore: 55,
    examScore: 50,
    totalScore: 52,
    gradeLevel: 'D',
    submitTime: '2024-01-21 09:00',
    homeworkDetails: []
  }
])

const editForm = reactive({
  homeworkScore: 0,
  examScore: 0,
  remark: ''
})

const getScoreType = (score: number): 'success' | 'warning' | 'danger' => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const getScoreClass = (score: number): string => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'average'
  if (score >= 60) return 'pass'
  return 'fail'
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const resetFilter = () => {
  filterForm.semester = ''
  filterForm.courseId = null
  filterForm.className = ''
  filterForm.studentName = ''
  filterForm.scoreRange = [0, 100]
  ElMessage.success('筛选条件已重置')
}

const handleSortChange = ({ prop, order }: any) => {
  console.log('排序:', prop, order)
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

const viewDetail = (row: any) => {
  currentStudent.value = row
  detailDialogVisible.value = true
}

const editGrade = (row: any) => {
  currentStudent.value = row
  editForm.homeworkScore = row.homeworkScore
  editForm.examScore = row.examScore
  editForm.remark = ''
  editDialogVisible.value = true
}

const saveGrade = () => {
  ElMessage.success('成绩已保存')
  editDialogVisible.value = false
}

const exportGrades = () => {
  ElMessage.success('成绩导出中...')
}

const refreshGrades = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}
</script>

<style scoped>
.grade-management-container {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.grade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.grade-header h1 {
  color: var(--primary-color);
  font-size: var(--font-size-xl);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.filter-card {
  margin-bottom: var(--spacing-lg);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  cursor: pointer;
  transition: all var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total { background: linear-gradient(135deg, #409EFF, #79bbff); }
.stat-icon.submitted { background: linear-gradient(135deg, #67C23A, #95d475); }
.stat-icon.average { background: linear-gradient(135deg, #E6A23C, #eebe77); }
.stat-icon.pass { background: linear-gradient(135deg, #003D79, #406A9C); }
.stat-icon.excellent { background: linear-gradient(135deg, #F56C6C, #fab6b6); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.chart-card {
  margin-bottom: var(--spacing-lg);
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
  justify-content: center;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-xl);
  height: 250px;
  padding-bottom: 40px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.bar {
  width: 60px;
  background: linear-gradient(180deg, var(--primary-color), var(--primary-light));
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: var(--spacing-sm);
  transition: height var(--transition-normal);
}

.bar-value {
  color: white;
  font-weight: bold;
  font-size: var(--font-size-sm);
}

.bar-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.pie-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: var(--border-radius-sm);
}

.legend-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.grade-list-card {
  margin-bottom: var(--spacing-lg);
}

.header-tools {
  display: flex;
  gap: var(--spacing-md);
}

.search-input {
  width: 200px;
}

.grade-card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.grade-item-card {
  cursor: pointer;
  transition: all var(--transition-normal);
}

.grade-item-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.student-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.student-avatar {
  background-color: var(--primary-color);
  color: white;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: var(--text-primary);
}

.student-no,
.class-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.score-info {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-sm) 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.score-value {
  font-size: var(--font-size-lg);
  font-weight: bold;
}

.score-value.excellent { color: #67C23A; }
.score-value.good { color: #409EFF; }
.score-value.average { color: #E6A23C; }
.score-value.pass { color: #909399; }
.score-value.fail { color: #F56C6C; }

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

.homework-detail {
  margin-top: var(--spacing-lg);
}

.homework-detail h4 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.grade-level {
  margin-left: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-weight: bold;
}

.grade-level.level-a { background-color: #67C23A; color: white; }
.grade-level.level-b { background-color: #409EFF; color: white; }
.grade-level.level-c { background-color: #E6A23C; color: white; }
.grade-level.level-d { background-color: #F56C6C; color: white; }

.grade-level-a { color: #67C23A; font-weight: bold; }
.grade-level-b { color: #409EFF; font-weight: bold; }
.grade-level-c { color: #E6A23C; font-weight: bold; }
.grade-level-d { color: #F56C6C; font-weight: bold; }

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .grade-card-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .grade-management-container {
    padding: var(--spacing-md);
  }
  
  .grade-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grade-card-list {
    grid-template-columns: 1fr;
  }
  
  .header-tools {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>