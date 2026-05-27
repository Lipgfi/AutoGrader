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
        <el-form-item label="课程">
          <el-select v-model="filterForm.courseId" placeholder="请选择课程" clearable @change="onFilterCourseChange">
            <el-option v-for="c in filterCourses" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="班级">
          <el-select v-model="filterForm.className" placeholder="请选择班级" clearable>
            <el-option v-for="c in filterClasses" :key="c.id" :label="c.name" :value="c.name" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="学生">
          <el-input v-model="filterForm.studentName" placeholder="请输入学生姓名或学号" clearable />
        </el-form-item>
        
        <el-form-item label="成绩范围" class="score-range-item">
          <el-slider
            v-model="filterForm.scoreRange"
            range
            :min="0"
            :max="100"
            style="width: 160px"
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
            <span class="stat-value">{{ computedStats.totalStudents }}</span>
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
            <span class="stat-value">{{ computedStats.submittedCount }}</span>
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
            <span class="stat-value">{{ computedStats.averageScore }}</span>
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
            <span class="stat-value">{{ computedStats.passRate }}%</span>
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
            <span class="stat-value">{{ computedStats.excellentRate }}%</span>
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
      <div class="chart-container">
        <div class="bar-chart" v-if="chartType === 'bar'">
          <div class="bar-wrapper" v-for="(item, index) in computedStats.distribution" :key="index">
            <span class="bar-label-text">{{ item.name }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{
                  width: maxCount > 0 ? (item.count / maxCount * 100) + '%' : '0%',
                  backgroundColor: barColors[index % barColors.length]
                }"
              >
                <span class="bar-count" v-if="item.count > 0">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="pie-chart-wrap" v-else>
          <div class="pie-visual">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle
                v-for="(seg, si) in pieSegments"
                :key="si"
                cx="100" cy="100" r="80"
                fill="none"
                stroke-width="40"
                :stroke="seg.color"
                :stroke-dasharray="`${seg.dashLen} ${100 - seg.dashLen}`"
                :stroke-dashoffset="seg.offset"
                transform="rotate(-90 100 100)"
                class="pie-segment"
              />
              <text x="100" y="95" text-anchor="middle" class="pie-total">{{ computedStats.submittedCount }}</text>
              <text x="100" y="115" text-anchor="middle" class="pie-total-label">总人数</text>
            </svg>
          </div>
          <div class="pie-legend">
            <div class="legend-item" v-for="(item, index) in computedStats.distribution" :key="index">
              <span class="legend-dot" :style="{ backgroundColor: barColors[index % barColors.length] }"></span>
              <span class="legend-name">{{ item.name }}</span>
              <span class="legend-count">{{ item.count }}人</span>
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
        :data="filteredGradeList"
        style="width: 100%"
        v-loading="loading"
        :span-method="spanMethod"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="courseName" label="课程" width="150" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
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
        <el-card v-for="item in filteredGradeList" :key="item.id" class="grade-item-card">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAssignments } from '../api/assignment'
import { getClasses } from '../api/class'
import { getCourses } from '../api/course'
import { getAssignmentSubmissions, overrideSubmissionScore } from '../api/submission'
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

const barColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']

const maxCount = computed(() => {
  const dist = computedStats.value.distribution
  return dist.length > 0 ? Math.max(...dist.map((item: any) => item.count), 1) : 1
})

const pieSegments = computed(() => {
  const dist = computedStats.value.distribution
  const total = dist.reduce((sum: number, d: any) => sum + d.count, 0)
  if (total === 0) return []
  let offset = 0
  return dist.map((d: any, i: number) => {
    const pct = d.count / total
    const seg = { ...d, color: barColors[i % barColors.length], dashLen: pct * 100, offset: -offset }
    offset += pct * 100
    return seg
  })
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filterCourses = ref<any[]>([])
const filterClasses = ref<any[]>([])
const gradeList = ref([])

const filteredGradeList = computed(() => {
  let result = gradeList.value
  if (filterForm.studentName) {
    const kw = filterForm.studentName.toLowerCase()
    result = result.filter((g: any) =>
      (g.studentName || '').toLowerCase().includes(kw) ||
      (g.studentNo || '').toLowerCase().includes(kw)
    )
  }
  if (filterForm.courseId) {
    result = result.filter((g: any) => String(g.courseId || '') === String(filterForm.courseId))
  }
  if (filterForm.className) {
    result = result.filter((g: any) => g.className === filterForm.className)
  }
  if (filterForm.scoreRange) {
    const [min, max] = filterForm.scoreRange
    result = result.filter((g: any) => g.totalScore >= min && g.totalScore <= max)
  }
  // 排序：课程 → 班级 → 分数降序
  result.sort((a: any, b: any) => {
    const courseCmp = (a.courseName || '').localeCompare(b.courseName || '')
    if (courseCmp !== 0) return courseCmp
    const classCmp = (a.className || '').localeCompare(b.className || '')
    if (classCmp !== 0) return classCmp
    return (b.totalScore || 0) - (a.totalScore || 0)
  })
  return result
})

const loadGradeData = async () => {
  try {
    const [asgnRes, classesRes, coursesRes] = await Promise.all([
      getAssignments(),
      getClasses(),
      getCourses()
    ])
    const apiAssignments = (asgnRes.code === 200 && asgnRes.data) ? (asgnRes.data || []) : []
    const apiClasses = (classesRes.code === 200 && classesRes.data) ? (classesRes.data || []) : []
    const apiCourses = (coursesRes.code === 200 && coursesRes.data) ? (coursesRes.data || []) : []

    // 填充筛选下拉框
    filterCourses.value = apiCourses.map((c: any) => ({ id: c.course_id || c.id, name: c.course_name || c.name }))
    filterClasses.value = apiClasses.map((c: any) => ({ id: c.class_id || c.id, name: c.class_name || c.name }))
    // 为每个作业加载提交记录
    const allGrades: any[] = []
    // 按作业和学生统计最高分（用于计算统计数据）
    const bestByAsgnStudent: Record<string, number> = {}

    for (const asgn of apiAssignments) {
      const cls = apiClasses.find((c: any) => (c.class_id || c.id) === (asgn.class_id || asgn.classId))
      const course = cls ? apiCourses.find((c: any) => (c.course_id || c.id) === (cls.course_id || cls.courseId)) : null
      const asgnId = asgn.assignment_id || asgn.id
      try {
        const subRes = await getAssignmentSubmissions(String(asgnId))
        if (subRes.code === 200 && subRes.data) {
          const subs = subRes.data.submissions || subRes.data || []
          for (const s of subs) {
            const score = s.overall_score ?? s.score ?? 0
            const stuId = s.student_user_id || s.student_id || ''
            const gradeLevel = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
            allGrades.push({
              id: s.submission_id || s.id,
              rank: 0,
              studentNo: s.student_id || String(stuId),
              studentName: s.student_name || s.real_name || '',
              studentId: stuId,
              assignmentId: asgnId,
              assignmentTitle: asgn.title,
              courseId: course ? (course.course_id || course.id) : '',
              courseName: course ? (course.course_name || course.name) : '',
              className: cls ? (cls.class_name || cls.name) : '',
              semester: course ? (course.semester || '') : '',
              homeworkScore: score,
              examScore: 0,
              totalScore: score,
              gradeLevel,
              score,
              status: s.status === 'COMPLETED' ? 'graded' : 'pending',
              submitTime: s.submitted_at || ''
            })
            // 每作业每学生取最高分
            const key = `${asgnId}_${stuId}`
            if (!(key in bestByAsgnStudent) || score > bestByAsgnStudent[key]) {
              bestByAsgnStudent[key] = score
            }
          }
        }
      } catch (e) { /* skip failed stats */ }
    }

    // 按总评分排序并计算排名
    allGrades.sort((a: any, b: any) => b.totalScore - a.totalScore)
    allGrades.forEach((g: any, i: number) => { g.rank = i + 1 })
    gradeList.value = allGrades
    pagination.total = filteredGradeList.value.length

  } catch (e) {
    console.error('加载成绩数据失败:', e)
  }
}

const computedStats = computed(() => {
  const list = filteredGradeList.value

  // 每个学生取最高分
  const bestByStudent: Record<string, { score: number; courseName: string; className: string }> = {}
  for (const g of list) {
    const key = g.studentId
    if (!bestByStudent[key] || g.totalScore > bestByStudent[key].score) {
      bestByStudent[key] = { score: g.totalScore, courseName: g.courseName, className: g.className }
    }
  }
  const bestScores = Object.values(bestByStudent).map(b => b.score)
  const uniqueStudents = Object.keys(bestByStudent)

  const passedScores = bestScores.filter(s => s >= 60)
  const excellentScores = bestScores.filter(s => s >= 90)

  // 分布图：无筛选→按课程，选课程→按班级，两者都选→分数段
  let distribution: { name: string; count: number }[] = []
  if (!filterForm.courseId) {
    const courseMap: Record<string, number> = {}
    for (const b of Object.values(bestByStudent)) {
      const name = b.courseName || '未知课程'
      courseMap[name] = (courseMap[name] || 0) + 1
    }
    distribution = Object.entries(courseMap).map(([name, count]) => ({ name, count }))
  } else if (!filterForm.className) {
    const classMap: Record<string, number> = {}
    for (const b of Object.values(bestByStudent)) {
      const name = b.className || '未知班级'
      classMap[name] = (classMap[name] || 0) + 1
    }
    distribution = Object.entries(classMap).map(([name, count]) => ({ name, count }))
  } else {
    const distMap: Record<string, number> = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '0-59': 0 }
    for (const s of bestScores) {
      if (s >= 90) distMap['90-100']++
      else if (s >= 80) distMap['80-89']++
      else if (s >= 70) distMap['70-79']++
      else if (s >= 60) distMap['60-69']++
      else distMap['0-59']++
    }
    distribution = Object.entries(distMap).map(([name, count]) => ({ name, count }))
  }

  return {
    totalStudents: uniqueStudents.length,
    submittedCount: bestScores.length,
    averageScore: bestScores.length > 0 ? Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length * 10) / 10 : 0,
    passRate: uniqueStudents.length > 0 ? Math.round(passedScores.length / uniqueStudents.length * 100) : 0,
    excellentRate: uniqueStudents.length > 0 ? Math.round(excellentScores.length / uniqueStudents.length * 100) : 0,
    distribution
  }
})

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
  loadGradeData()
}

const onFilterCourseChange = () => {
  filterForm.className = ''
}

const resetFilter = () => {
  filterForm.courseId = null
  filterForm.className = ''
  filterForm.studentName = ''
  filterForm.scoreRange = [0, 100]
}

const spanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  const list = filteredGradeList.value
  // 课程列(0)合并
  if (columnIndex === 0) {
    const prev = rowIndex > 0 ? list[rowIndex - 1] : null
    if (prev && prev.courseName === row.courseName) return { rowspan: 0, colspan: 0 }
    let span = 1
    for (let i = rowIndex + 1; i < list.length && list[i].courseName === row.courseName; i++) span++
    return { rowspan: span, colspan: 1 }
  }
  // 班级列(1)合并
  if (columnIndex === 1) {
    const prev = rowIndex > 0 ? list[rowIndex - 1] : null
    if (prev && prev.courseName === row.courseName && prev.className === row.className) return { rowspan: 0, colspan: 0 }
    let span = 1
    for (let i = rowIndex + 1; i < list.length && list[i].courseName === row.courseName && list[i].className === row.className; i++) span++
    return { rowspan: span, colspan: 1 }
  }
  return { rowspan: 1, colspan: 1 }
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

const saveGrade = async () => {
  if (currentStudent.value?.id) {
    try {
      await overrideSubmissionScore(currentStudent.value.id, {
        overallScore: editForm.homeworkScore,
        overrideReason: editForm.remark || undefined
      })
    } catch (e) { /* ignore */ }
  }
  ElMessage.success('成绩已保存')
  editDialogVisible.value = false
}

const exportGrades = () => {
  ElMessage.success('成绩导出中...')
}

const refreshGrades = () => {
  loadGradeData()
}

onMounted(() => {
  loadGradeData()
})
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
  padding: 20px 0;
  min-height: 260px;
}

/* 横向柱状图 */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 20px;
}

.bar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label-text {
  width: 80px;
  font-size: 13px;
  color: #606266;
  text-align: right;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  height: 28px;
  background: #f0f2f5;
  border-radius: 14px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 14px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 0.6s ease;
}

.bar-count {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

/* 饼图 */
.pie-chart-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 10px;
}

.pie-visual {
  flex-shrink: 0;
}

.pie-svg {
  width: 180px;
  height: 180px;
}

.pie-segment {
  transition: stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease;
}

.pie-total {
  font-size: 22px;
  font-weight: 700;
  fill: #303133;
}

.pie-total-label {
  font-size: 12px;
  fill: #909399;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  color: #606266;
  min-width: 60px;
}

.legend-count {
  color: #909399;
  font-weight: 500;
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