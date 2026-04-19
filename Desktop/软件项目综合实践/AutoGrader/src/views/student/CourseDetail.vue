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
                </div>
              </div>
              <div class="assignment-action">
                <el-button
                  v-if="!assignment.isExpired"
                  type="primary"
                  @click="goToAssignment(assignment.id)"
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
            <el-table-column prop="email" label="邮箱" min-width="200" />
            <el-table-column prop="completedAssignments" label="已完成作业" width="120" align="center">
              <template #default="scope">
                <span :class="{ 'all-completed': scope.row.completedAssignments === courseInfo.totalAssignments }">
                  {{ scope.row.completedAssignments }}/{{ courseInfo.totalAssignments }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="avgScore" label="平均分" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getScoreType(scope.row.avgScore)" size="small">
                  {{ scope.row.avgScore.toFixed(1) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Document, 
  Timer, 
  TrendCharts 
} from '@element-plus/icons-vue'

const router = useRouter()
// const route = useRoute()

const activeTab = ref('assignments')
const assignmentSearch = ref('')
const assignmentFilter = ref('')
const memberSearch = ref('')

const courseInfo = ref({
  courseId: 'C001',
  courseName: '数据结构与算法',
  courseCode: 'CS101',
  teacher: '张教授',
  className: '计算机2401班',
  semester: '2026春季学期',
  color: '#165DFF',
  status: 'active',
  totalAssignments: 8
})

const announcements = ref([
  {
    id: 1,
    title: '期中考试安排通知',
    content: '期中考试将于第10周进行，考试范围为前五章内容，请同学们提前复习。考试形式为闭卷笔试，时长120分钟。',
    time: '2026-04-01 10:00',
    type: 'important'
  },
  {
    id: 2,
    title: '第三次作业已发布',
    content: '第三次作业已发布，请同学们在截止日期前完成提交。本次作业涉及链表和树的相关内容。',
    time: '2026-03-28 14:30',
    type: 'normal'
  },
  {
    id: 3,
    title: '课程资料更新',
    content: '第四章课件已上传，请同学们自行下载学习。',
    time: '2026-03-25 09:00',
    type: 'normal'
  }
])

const assignments = ref([
  {
    id: 'A001',
    title: '第一次作业 - 数组与链表',
    description: '完成数组基本操作和链表反转相关题目',
    questionCount: 3,
    deadline: '2026-04-05 23:59',
    isExpired: false,
    isCompleted: true,
    score: 95,
    totalScore: 100,
    timeProgress: 60,
    remainingTime: '3天12小时'
  },
  {
    id: 'A002',
    title: '第二次作业 - 栈与队列',
    description: '实现栈和队列的基本操作，解决相关算法问题',
    questionCount: 4,
    deadline: '2026-04-10 23:59',
    isExpired: false,
    isCompleted: false,
    score: 0,
    totalScore: 100,
    timeProgress: 30,
    remainingTime: '8天12小时'
  },
  {
    id: 'A003',
    title: '第三次作业 - 树与二叉树',
    description: '实现二叉树的遍历和相关操作',
    questionCount: 3,
    deadline: '2026-04-15 23:59',
    isExpired: false,
    isCompleted: false,
    score: 0,
    totalScore: 100,
    timeProgress: 10,
    remainingTime: '13天12小时'
  },
  {
    id: 'A004',
    title: '第四次作业 - 图论基础',
    description: '实现图的遍历和最短路径算法',
    questionCount: 2,
    deadline: '2026-03-20 23:59',
    isExpired: true,
    isCompleted: true,
    score: 88,
    totalScore: 100,
    timeProgress: 100,
    remainingTime: '已截止'
  }
])

const members = ref([
  { studentId: '20240001', name: '张三', email: 'zhangsan@example.com', completedAssignments: 5, avgScore: 92.5 },
  { studentId: '20240002', name: '李四', email: 'lisi@example.com', completedAssignments: 4, avgScore: 85.0 },
  { studentId: '20240003', name: '王五', email: 'wangwu@example.com', completedAssignments: 5, avgScore: 78.5 },
  { studentId: '20240004', name: '赵六', email: 'zhaoliu@example.com', completedAssignments: 3, avgScore: 90.0 },
  { studentId: '20240005', name: '钱七', email: 'qianqi@example.com', completedAssignments: 5, avgScore: 95.5 }
])

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

const goToAssignment = (assignmentId: string) => {
  router.push(`/student/assignment/${assignmentId}`)
}
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
