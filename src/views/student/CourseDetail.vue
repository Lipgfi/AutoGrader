<template>
  <div class="course-detail-container">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="course-title">
          <div class="course-color" :style="{ backgroundColor: courseInfo.color }"></div>
          <div>
            <h1>{{ courseInfo.courseName }}</h1>
            <p class="course-meta">
              <span>{{ courseInfo.courseCode }}</span>
              <span class="divider">|</span>
              <span>{{ courseInfo.teacher }}</span>
              <span class="divider">|</span>
              <span>{{ courseInfo.className }}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-tag :type="courseInfo.status === 'active' ? 'success' : 'info'" effect="dark">
          {{ courseInfo.status === 'active' ? '进行中' : '已结束' }}
        </el-tag>
      </div>
    </div>
    
    <el-tabs v-model="activeTab" class="course-tabs">
      <el-tab-pane label="课程公告" name="announcements">
        <div class="announcements-list">
          <el-card v-for="announcement in announcements" :key="announcement.id" class="announcement-card">
            <div class="announcement-header">
              <el-tag :type="announcement.type" effect="dark" size="small">
                {{ announcement.type === 'important' ? '重要' : '普通' }}
              </el-tag>
              <span class="announcement-time">{{ announcement.time }}</span>
            </div>
            <h3 class="announcement-title">{{ announcement.title }}</h3>
            <p class="announcement-content">{{ announcement.content }}</p>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="作业列表" name="assignments">
        <div class="assignments-header">
          <el-input
            v-model="assignmentSearch"
            placeholder="搜索作业"
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select v-model="assignmentFilter" placeholder="筛选状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待完成" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已截止" value="expired" />
          </el-select>
        </div>
        
        <div class="assignments-list">
          <el-card
            v-for="assignment in filteredAssignments"
            :key="assignment.id"
            class="assignment-card"
            :class="{ 'expired': assignment.isExpired }"
          >
            <div class="assignment-main">
              <div class="assignment-info">
                <div class="assignment-header-row">
                  <h3 class="assignment-title">{{ assignment.title }}</h3>
                  <el-tag v-if="assignment.isExpired" type="info" effect="dark" size="small">
                    已截止
                  </el-tag>
                  <el-tag v-else-if="assignment.isCompleted" type="success" effect="dark" size="small">
                    已完成
                  </el-tag>
                  <el-tag v-else type="warning" effect="dark" size="small">
                    待完成
                  </el-tag>
                </div>
                <p class="assignment-desc">{{ assignment.description }}</p>
                <div class="assignment-meta">
                  <span class="meta-item">
                    <el-icon><Document /></el-icon>
                    {{ assignment.questionCount }} 道题目
                  </span>
                  <span class="meta-item">
                    <el-icon><Timer /></el-icon>
                    截止时间：{{ assignment.deadline }}
                  </span>
                  <span v-if="assignment.isCompleted" class="meta-item score">
                    <el-icon><TrendCharts /></el-icon>
                    得分：{{ assignment.score }}/{{ assignment.totalScore }}
                  </span>
                  <span v-else-if="assignment.score > 0" class="meta-item score">
                    <el-icon><TrendCharts /></el-icon>
                    最高得分：{{ assignment.score }}/{{ assignment.totalScore }}
                  </span>
                </div>
              </div>
              <div class="assignment-action">
                <el-button
                  v-if="!assignment.isExpired"
                  type="primary"
                  @click="goToAssignment(assignment)"
                >
                  {{ assignment.isCompleted ? '查看详情' : '开始答题' }}
                </el-button>
                <el-button v-else disabled>
                  已截止
                </el-button>
              </div>
            </div>
            <div v-if="!assignment.isExpired && !assignment.isCompleted" class="assignment-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${assignment.timeProgress}%` }"></div>
              </div>
              <span class="progress-text">剩余 {{ assignment.remainingTime }}</span>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="班级成员" name="members">
        <div class="members-header">
          <el-input
            v-model="memberSearch"
            placeholder="搜索成员"
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <span class="member-count">共 {{ filteredMembers.length }} 人</span>
        </div>
        
        <el-card class="members-card">
          <el-table :data="filteredMembers" style="width: 100%">
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="email" label="邮箱" min-width="300" />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { request } from '../../api/interceptors'
import { getCourseDetail } from '../../api/course'
import { getClasses, getClassStudents } from '../../api/class'
import { getAssignments } from '../../api/assignment'
import { 
  ArrowLeft, 
  Document, 
  Timer, 
  TrendCharts 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeTab = ref('assignments')
const assignmentSearch = ref('')
const assignmentFilter = ref('')
const memberSearch = ref('')

const courseInfo = ref({
  courseId: '',
  courseName: '',
  courseCode: '',
  teacher: '',
  className: '',
  semester: '',
  color: '#165DFF',
  status: 'active',
  totalAssignments: 0
})

const announcements = ref([])
const assignments = ref([])
const members = ref([])

const loadData = async () => {
  const courseId = route.params.id as string
  if (!courseId) return

  try {
    const [courseRes, classesRes, assignmentsRes] = await Promise.all([
      getCourseDetail(courseId),
      getClasses(),
      getAssignments()
    ])

    // 课程信息
    if (courseRes.code === 200 && courseRes.data) {
      const c = courseRes.data
      courseInfo.value = {
        courseId: c.course_id || c.courseId || courseId,
        courseName: c.course_name || c.courseName || '',
        courseCode: c.course_code || c.courseCode || '',
        teacher: c.teacher_name || c.teacher || '',
        className: courseInfo.value.className,
        semester: c.semester || '',
        color: '#165DFF',
        status: 'active',
        totalAssignments: courseInfo.value.totalAssignments
      }
    }

    // 班级信息（找到学生在此课程中的班级）
    const apiClasses = (classesRes.code === 200 && classesRes.data) ? (classesRes.data || []) : []
    const matchedClass = apiClasses.find((cls: any) => {
      const cid = cls.course_id || cls.courseId
      return String(cid) === String(courseId)
    })
    const classId = matchedClass ? (matchedClass.class_id || matchedClass.id) : null
    if (matchedClass) {
      courseInfo.value.className = matchedClass.class_name || matchedClass.name || ''

      // 加载班级学生
      try {
        const studentsRes = await getClassStudents(String(classId))
        if (studentsRes.code === 200 && studentsRes.data) {
          members.value = (studentsRes.data || []).map((s: any) => ({
            studentId: s.student_id || s.studentId || '',
            name: s.real_name || s.name || '',
            email: s.email || ''
          }))
        }
      } catch (e) { console.error('加载班级成员失败', e) }
    }

    // 加载学生提交记录，判断作业完成状态
    let submissionsByAsgn: Record<number, any> = {}
    try {
      const subRes = await request.get('/submissions/my')
      if (subRes.code === 200 && subRes.data) {
        for (const s of (subRes.data || [])) {
          const aid = s.assignment_id
          const score = s.overall_score ?? 0
          const prevScore = submissionsByAsgn[aid]?.overall_score ?? -1
          if (score >= prevScore) {
            submissionsByAsgn[aid] = s
          }
        }
      }
    } catch (e) { /* ignore */ }

    // 作业列表 — 仅显示当前课程班级的作业
    const apiAssignments = (assignmentsRes.code === 200 && assignmentsRes.data) ? (assignmentsRes.data || []) : []
    assignments.value = apiAssignments
      .filter((a: any) => !classId || (a.class_id || a.classId) === classId)
      .map((a: any) => {
      const dueDate = new Date(a.due_date || a.dueDate || a.deadline)
      const isExpired = dueDate < new Date()
      const sub = submissionsByAsgn[a.assignment_id || a.id]
      const isCompleted = sub && sub.status === 'COMPLETED'
      return {
        id: a.assignment_id || a.id,
        title: a.title || '',
        description: a.description || '',
        questionId: a.question_id || '',
        questionCount: 1,
        deadline: dueDate.toLocaleString('zh-CN'),
        isExpired,
        isCompleted,
        score: sub ? (sub.overall_score ?? 0) : 0,
        totalScore: 100
      }
    })
    courseInfo.value.totalAssignments = assignments.value.length

  } catch (error) {
    console.error('加载课程详情失败:', error)
  }
}

const filteredAssignments = computed(() => {
  let result = assignments.value
  
  if (assignmentSearch.value) {
    const keyword = assignmentSearch.value.toLowerCase()
    result = result.filter(a => a.title.toLowerCase().includes(keyword))
  }
  
  if (assignmentFilter.value) {
    if (assignmentFilter.value === 'pending') {
      result = result.filter(a => !a.isCompleted && !a.isExpired)
    } else if (assignmentFilter.value === 'completed') {
      result = result.filter(a => a.isCompleted)
    } else if (assignmentFilter.value === 'expired') {
      result = result.filter(a => a.isExpired)
    }
  }
  
  return result.sort((a, b) => {
    if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })
})

const filteredMembers = computed(() => {
  if (!memberSearch.value) return members.value
  
  const keyword = memberSearch.value.toLowerCase()
  return members.value.filter(m => 
    m.studentId.toLowerCase().includes(keyword) ||
    m.name.toLowerCase().includes(keyword) ||
    m.email.toLowerCase().includes(keyword)
  )
})

const getScoreType = (score: number): 'success' | 'warning' | 'danger' => {
  if (score >= 90) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const goBack = () => {
  router.push('/student/courses')
}

const goToAssignment = (assignment: any) => {
  const qId = assignment.questionId || assignment.id
  sessionStorage.setItem('codingContext', JSON.stringify({
    assignmentId: String(assignment.id),
    questionId: String(qId)
  }))
  router.push({ name: 'StudentCoding', params: { id: String(qId) } })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.course-detail-container {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.course-title {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.course-color {
  width: 4px;
  height: 60px;
  border-radius: var(--border-radius-full);
}

.course-title h1 {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.course-meta {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.course-meta .divider {
  margin: 0 var(--spacing-sm);
  color: var(--border-color);
}

.course-tabs {
  margin-top: var(--spacing-lg);
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.announcement-card {
  border: 1px solid var(--border-light);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.announcement-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.announcement-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.announcement-content {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.assignments-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.assignments-header .search-input {
  width: 300px;
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.assignment-card {
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
}

.assignment-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-light);
}

.assignment-card.expired {
  opacity: 0.7;
}

.assignment-main {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.assignment-info {
  flex: 1;
}

.assignment-header-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.assignment-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0;
}

.assignment-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.assignment-meta {
  display: flex;
  gap: var(--spacing-lg);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.meta-item.score {
  color: var(--success-color);
  font-weight: var(--font-weight-medium);
}

.assignment-progress {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--warning-color);
  border-radius: var(--border-radius-full);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.members-header .search-input {
  width: 300px;
}

.member-count {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.members-card {
  border: 1px solid var(--border-light);
}

.all-completed {
  color: var(--success-color);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .course-detail-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .header-right {
    align-self: flex-start;
  }
  
  .course-title h1 {
    font-size: var(--font-size-xl);
  }
  
  .assignments-header {
    flex-direction: column;
  }
  
  .assignments-header .search-input {
    width: 100%;
  }
  
  .assignment-main {
    flex-direction: column;
  }
  
  .assignment-meta {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .members-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
  
  .members-header .search-input {
    width: 100%;
  }
}
</style>
