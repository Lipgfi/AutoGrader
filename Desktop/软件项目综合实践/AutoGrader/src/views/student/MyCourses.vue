<template>
  <div class="student-courses-container">
    <div class="page-header">
      <div class="header-left">
        <h1>我的课程</h1>
        <p class="header-desc">查看和管理您的所有课程</p>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称或教师"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="filterSemester" placeholder="选择学期" clearable class="filter-select">
        <el-option label="全部学期" value="" />
        <el-option label="2026春季学期" value="2026-spring" />
        <el-option label="2025秋季学期" value="2025-fall" />
        <el-option label="2025春季学期" value="2025-spring" />
      </el-select>
      
      <el-select v-model="filterStatus" placeholder="课程状态" clearable class="filter-select">
        <el-option label="全部状态" value="" />
        <el-option label="进行中" value="active" />
        <el-option label="已结束" value="ended" />
      </el-select>
      
      <div class="view-toggle">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="card">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
          <el-radio-button label="list">
            <el-icon><List /></el-icon>
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
    
    <div class="courses-content">
      <template v-if="viewMode === 'card'">
        <div class="courses-grid">
          <el-card
            v-for="course in filteredCourses"
            :key="course.courseId"
            class="course-card"
            @click="goToCourseDetail(course.courseId)"
          >
            <div class="course-header">
              <div class="course-color" :style="{ backgroundColor: course.color }"></div>
              <div class="course-info">
                <h3 class="course-name">{{ course.courseName }}</h3>
                <p class="course-code">{{ course.courseCode }}</p>
              </div>
            </div>
            
            <div class="course-details">
              <div class="detail-item">
                <el-icon><User /></el-icon>
                <span>{{ course.teacher }}</span>
              </div>
              <div class="detail-item">
                <el-icon><School /></el-icon>
                <span>{{ course.className }}</span>
              </div>
              <div class="detail-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ course.semester }}</span>
              </div>
            </div>
            
            <div class="course-stats">
              <div class="stat-item">
                <span class="stat-value">{{ course.totalAssignments }}</span>
                <span class="stat-label">作业总数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ course.completedAssignments }}</span>
                <span class="stat-label">已完成</span>
              </div>
              <div class="stat-item">
                <span class="stat-value warning">{{ course.pendingAssignments }}</span>
                <span class="stat-label">待完成</span>
              </div>
            </div>
            
            <div class="course-progress">
              <el-progress
                :percentage="course.progress"
                :color="course.progress === 100 ? '#00B42A' : '#165DFF'"
                :stroke-width="6"
              />
            </div>
            
            <div class="course-footer">
              <el-tag v-if="course.pendingAssignments > 0" type="danger" effect="dark" size="small">
                <el-icon><Bell /></el-icon>
                {{ course.pendingAssignments }} 项待完成
              </el-tag>
              <el-tag v-else type="success" effect="dark" size="small">
                <el-icon><Check /></el-icon>
                全部完成
              </el-tag>
            </div>
          </el-card>
        </div>
      </template>
      
      <template v-else>
        <el-card class="courses-list-card">
          <el-table :data="filteredCourses" style="width: 100%" @row-click="handleRowClick">
            <el-table-column prop="courseName" label="课程名称" min-width="200">
              <template #default="scope">
                <div class="course-name-cell">
                  <div class="course-color-small" :style="{ backgroundColor: scope.row.color }"></div>
                  <div>
                    <div class="name">{{ scope.row.courseName }}</div>
                    <div class="code">{{ scope.row.courseCode }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="teacher" label="教师" width="120" />
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="semester" label="学期" width="140" />
            <el-table-column prop="progress" label="进度" width="150">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.progress"
                  :color="scope.row.progress === 100 ? '#00B42A' : '#165DFF'"
                  :stroke-width="6"
                />
              </template>
            </el-table-column>
            <el-table-column prop="pendingAssignments" label="待完成" width="100" align="center">
              <template #default="scope">
                <el-tag v-if="scope.row.pendingAssignments > 0" type="danger" effect="dark" size="small">
                  {{ scope.row.pendingAssignments }}
                </el-tag>
                <el-tag v-else type="success" effect="dark" size="small">
                  0
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button type="primary" link size="small" @click.stop="goToCourseDetail(scope.row.courseId)">
                  进入
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Grid, 
  List, 
  User, 
  School, 
  Calendar, 
  Bell, 
  Check 
} from '@element-plus/icons-vue'

const router = useRouter()

const searchKeyword = ref('')
const filterSemester = ref('')
const filterStatus = ref('')
const viewMode = ref('card')

const courses = ref([
  {
    courseId: 'C001',
    courseName: '数据结构与算法',
    courseCode: 'CS101',
    teacher: '张教授',
    className: '计算机2401班',
    semester: '2026春季学期',
    color: '#165DFF',
    totalAssignments: 8,
    completedAssignments: 5,
    pendingAssignments: 3,
    progress: 62
  },
  {
    courseId: 'C002',
    courseName: '操作系统原理',
    courseCode: 'CS201',
    teacher: '李教授',
    className: '计算机2401班',
    semester: '2026春季学期',
    color: '#00B42A',
    totalAssignments: 6,
    completedAssignments: 6,
    pendingAssignments: 0,
    progress: 100
  },
  {
    courseId: 'C003',
    courseName: '计算机网络',
    courseCode: 'CS301',
    teacher: '王教授',
    className: '计算机2401班',
    semester: '2026春季学期',
    color: '#FF7D00',
    totalAssignments: 5,
    completedAssignments: 2,
    pendingAssignments: 3,
    progress: 40
  },
  {
    courseId: 'C004',
    courseName: '数据库系统',
    courseCode: 'CS401',
    teacher: '赵教授',
    className: '计算机2401班',
    semester: '2025秋季学期',
    color: '#F53F3F',
    totalAssignments: 10,
    completedAssignments: 10,
    pendingAssignments: 0,
    progress: 100
  }
])

const filteredCourses = computed(() => {
  let result = courses.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(course => 
      course.courseName.toLowerCase().includes(keyword) ||
      course.teacher.toLowerCase().includes(keyword) ||
      course.courseCode.toLowerCase().includes(keyword)
    )
  }
  
  if (filterSemester.value) {
    result = result.filter(course => course.semester.includes(filterSemester.value))
  }
  
  if (filterStatus.value) {
    if (filterStatus.value === 'active') {
      result = result.filter(course => course.pendingAssignments > 0)
    } else {
      result = result.filter(course => course.pendingAssignments === 0)
    }
  }
  
  return result
})

const goToCourseDetail = (courseId: string) => {
  router.push(`/student/course/${courseId}`)
}

const handleRowClick = (row: any) => {
  goToCourseDetail(row.courseId)
}
</script>

<style scoped>
.student-courses-container {
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

.search-input {
  width: 300px;
}

.filter-bar {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  align-items: center;
}

.filter-select {
  width: 160px;
}

.view-toggle {
  margin-left: auto;
}

.courses-content {
  min-height: 400px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.course-card {
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--primary-color);
}

.course-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.course-color {
  width: 4px;
  border-radius: var(--border-radius-full);
  flex-shrink: 0;
}

.course-info {
  flex: 1;
}

.course-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.course-code {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.course-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.detail-item .el-icon {
  color: var(--text-tertiary);
}

.course-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--spacing-md);
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

.stat-value.warning {
  color: var(--warning-color);
}

.stat-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.course-progress {
  margin-bottom: var(--spacing-md);
}

.course-footer {
  display: flex;
  justify-content: flex-end;
}

.courses-list-card {
  border: 1px solid var(--border-light);
}

.course-name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.course-color-small {
  width: 4px;
  height: 40px;
  border-radius: var(--border-radius-full);
}

.course-name-cell .name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.course-name-cell .code {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

@media (max-width: 1200px) {
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .student-courses-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .search-input {
    width: 100%;
  }
  
  .filter-bar {
    flex-wrap: wrap;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .view-toggle {
    margin-left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
