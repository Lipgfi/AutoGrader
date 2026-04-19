<template>
  <div class="course-management-container">
    <div class="page-header">
      <div class="header-left">
        <h1>课程与班级管理</h1>
        <p class="header-desc">管理您的课程和班级信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateCourseDialog">
          <el-icon><Plus /></el-icon>
          新建课程
        </el-button>
      </div>
    </div>
    
    <el-tabs v-model="activeTab" class="management-tabs">
      <el-tab-pane label="我的课程" name="courses">
        <div class="courses-section">
          <div class="section-header">
            <el-input
              v-model="courseSearch"
              placeholder="搜索课程名称或编号"
              prefix-icon="Search"
              clearable
              class="search-input"
            />
            <el-select v-model="courseStatusFilter" placeholder="课程状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="进行中" value="active" />
              <el-option label="已结束" value="ended" />
            </el-select>
          </div>
          
          <div class="courses-grid">
            <el-card
              v-for="course in filteredCourses"
              :key="course.id"
              class="course-card"
            >
              <div class="course-header">
                <div class="course-color" :style="{ backgroundColor: course.color }"></div>
                <div class="course-info">
                  <h3>{{ course.name }}</h3>
                  <p class="course-code">{{ course.code }}</p>
                </div>
                <el-dropdown trigger="click" @command="handleCourseCommand">
                  <el-button link>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{ action: 'edit', course }">编辑课程</el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'classes', course }">管理班级</el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'delete', course }" divided>删除课程</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              
              <div class="course-stats">
                <div class="stat-item">
                  <el-icon><User /></el-icon>
                  <span>{{ course.classCount }} 个班级</span>
                </div>
                <div class="stat-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ course.assignmentCount }} 份作业</span>
                </div>
                <div class="stat-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ course.semester }}</span>
                </div>
              </div>
              
              <div class="course-classes">
                <span class="classes-label">班级：</span>
                <el-tag
                  v-for="cls in course.classes.slice(0, 3)"
                  :key="cls.id"
                  size="small"
                  effect="plain"
                >
                  {{ cls.name }}
                </el-tag>
                <el-tag v-if="course.classes.length > 3" size="small" type="info">
                  +{{ course.classes.length - 3 }}
                </el-tag>
              </div>
              
              <div class="course-footer">
                <el-tag :type="course.status === 'active' ? 'success' : 'info'" effect="dark" size="small">
                  {{ course.status === 'active' ? '进行中' : '已结束' }}
                </el-tag>
                <el-button type="primary" link size="small" @click="manageClasses(course)">
                  管理班级
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="班级管理" name="classes">
        <div class="classes-section">
          <div class="section-header">
            <el-select v-model="selectedCourseId" placeholder="选择课程" clearable @change="handleCourseSelect">
              <el-option
                v-for="course in courses"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
            <el-input
              v-model="classSearch"
              placeholder="搜索班级名称"
              prefix-icon="Search"
              clearable
              class="search-input"
            />
            <el-button type="primary" @click="showCreateClassDialog" :disabled="!selectedCourseId">
              <el-icon><Plus /></el-icon>
              新建班级
            </el-button>
          </div>
          
          <el-card class="classes-table-card">
            <el-table :data="filteredClasses" style="width: 100%">
              <el-table-column prop="name" label="班级名称" width="180" />
              <el-table-column prop="courseName" label="所属课程" width="180" />
              <el-table-column prop="studentCount" label="学生人数" width="120" align="center">
                <template #default="scope">
                  <el-tag type="info" effect="plain">{{ scope.row.studentCount }} 人</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="semester" label="学期" width="140" />
              <el-table-column prop="createTime" label="创建时间" width="160" />
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="scope">
                  <el-button type="primary" link size="small" @click="viewStudents(scope.row)">
                    查看学生
                  </el-button>
                  <el-button type="primary" link size="small" @click="importStudents(scope.row)">
                    导入学生
                  </el-button>
                  <el-button type="primary" link size="small" @click="editClass(scope.row)">
                    编辑
                  </el-button>
                  <el-button type="danger" link size="small" @click="deleteClass(scope.row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <el-dialog
      v-model="courseDialogVisible"
      :title="editingCourse ? '编辑课程' : '新建课程'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="courseFormRef"
        :model="courseForm"
        :rules="courseRules"
        label-width="100px"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程编号" prop="code">
          <el-input v-model="courseForm.code" placeholder="请输入课程编号" />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="courseForm.semester" placeholder="请选择学期" style="width: 100%">
            <el-option label="2026春季学期" value="2026春季学期" />
            <el-option label="2025秋季学期" value="2025秋季学期" />
            <el-option label="2025春季学期" value="2025春季学期" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="courseForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入课程描述"
          />
        </el-form-item>
        <el-form-item label="课程颜色" prop="color">
          <div class="color-picker">
            <div
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :style="{ backgroundColor: color }"
              :class="{ active: courseForm.color === color }"
              @click="courseForm.color = color"
            ></div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="courseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourse">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="classDialogVisible"
      :title="editingClass ? '编辑班级' : '新建班级'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="classFormRef"
        :model="classForm"
        :rules="classRules"
        label-width="100px"
      >
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="所属课程" prop="courseId">
          <el-select v-model="classForm.courseId" placeholder="请选择课程" style="width: 100%" :disabled="!!editingClass">
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="classForm.semester" placeholder="请选择学期" style="width: 100%">
            <el-option label="2026春季学期" value="2026春季学期" />
            <el-option label="2025秋季学期" value="2025秋季学期" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="classDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveClass">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="importDialogVisible"
      title="导入学生"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="import-content">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: var(--spacing-lg);"
        >
          <p>请上传 Excel 文件（.xlsx 格式）或 PDF 文件，文件需包含以下信息：</p>
          <p>学号、姓名、邮箱、手机号</p>
        </el-alert>
        
        <el-upload
          class="upload-area"
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls,.pdf"
          @change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xlsx/xls/pdf 文件，且不超过 5MB
            </div>
          </template>
        </el-upload>
        
        <div v-if="previewData.length > 0" class="preview-section">
          <h4>数据预览（前5条）</h4>
          <el-table :data="previewData.slice(0, 5)" style="width: 100%">
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="phone" label="手机号" width="120" />
          </el-table>
          <p class="preview-count">共 {{ previewData.length }} 条数据</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :disabled="previewData.length === 0">
          确认导入
        </el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="studentsDialogVisible"
      :title="`学生列表 - ${selectedClass?.name || ''}`"
      width="800px"
    >
      <div class="students-content">
        <div class="students-header">
          <el-input
            v-model="studentSearch"
            placeholder="搜索学生"
            prefix-icon="Search"
            clearable
            class="search-input"
          />
        </div>
        <el-table :data="filteredStudents" style="width: 100%">
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phone" label="手机号" width="120" />
          <el-table-column prop="avgScore" label="平均分" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getScoreType(scope.row.avgScore)" size="small">
                {{ scope.row.avgScore.toFixed(1) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  MoreFilled, 
  User, 
  Document, 
  Calendar,
  UploadFilled 
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const activeTab = ref('courses')
const courseSearch = ref('')
const courseStatusFilter = ref('')
const selectedCourseId = ref('')
const classSearch = ref('')
const courseDialogVisible = ref(false)
const classDialogVisible = ref(false)
const importDialogVisible = ref(false)
const studentsDialogVisible = ref(false)
const editingCourse = ref<any>(null)
const editingClass = ref<any>(null)
const selectedClass = ref<any>(null)
const studentSearch = ref('')
const previewData = ref<any[]>([])

const courseFormRef = ref<FormInstance>()
const classFormRef = ref<FormInstance>()

const colorOptions = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#13C2C2']

const courseForm = reactive({
  name: '',
  code: '',
  semester: '2026春季学期',
  description: '',
  color: '#165DFF'
})

const classForm = reactive({
  name: '',
  courseId: '',
  semester: '2026春季学期'
})

const courseRules: FormRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入课程编号', trigger: 'blur' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }]
}

const classRules: FormRules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }]
}

const courses = ref([
  {
    id: 'C001',
    name: '数据结构与算法',
    code: 'CS101',
    semester: '2026春季学期',
    color: '#165DFF',
    status: 'active',
    classCount: 2,
    assignmentCount: 8,
    classes: [
      { id: 'CL001', name: '计算机2401班' },
      { id: 'CL002', name: '计算机2402班' }
    ]
  },
  {
    id: 'C002',
    name: '操作系统原理',
    code: 'CS201',
    semester: '2026春季学期',
    color: '#00B42A',
    status: 'active',
    classCount: 1,
    assignmentCount: 6,
    classes: [
      { id: 'CL003', name: '计算机2401班' }
    ]
  },
  {
    id: 'C003',
    name: '计算机网络',
    code: 'CS301',
    semester: '2025秋季学期',
    color: '#FF7D00',
    status: 'ended',
    classCount: 3,
    assignmentCount: 10,
    classes: [
      { id: 'CL004', name: '计算机2301班' },
      { id: 'CL005', name: '计算机2302班' },
      { id: 'CL006', name: '计算机2303班' }
    ]
  }
])

const classes = ref([
  { id: 'CL001', name: '计算机2401班', courseId: 'C001', courseName: '数据结构与算法', studentCount: 45, semester: '2026春季学期', createTime: '2026-02-20' },
  { id: 'CL002', name: '计算机2402班', courseId: 'C001', courseName: '数据结构与算法', studentCount: 42, semester: '2026春季学期', createTime: '2026-02-20' },
  { id: 'CL003', name: '计算机2401班', courseId: 'C002', courseName: '操作系统原理', studentCount: 45, semester: '2026春季学期', createTime: '2026-02-25' }
])

const students = ref([
  { studentId: '20240001', name: '张三', email: 'zhangsan@example.com', phone: '13800138001', avgScore: 92.5 },
  { studentId: '20240002', name: '李四', email: 'lisi@example.com', phone: '13800138002', avgScore: 85.0 },
  { studentId: '20240003', name: '王五', email: 'wangwu@example.com', phone: '13800138003', avgScore: 78.5 },
  { studentId: '20240004', name: '赵六', email: 'zhaoliu@example.com', phone: '13800138004', avgScore: 90.0 },
  { studentId: '20240005', name: '钱七', email: 'qianqi@example.com', phone: '13800138005', avgScore: 95.5 }
])

const filteredCourses = computed(() => {
  let result = courses.value
  
  if (courseSearch.value) {
    const keyword = courseSearch.value.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(keyword) ||
      c.code.toLowerCase().includes(keyword)
    )
  }
  
  if (courseStatusFilter.value) {
    result = result.filter(c => c.status === courseStatusFilter.value)
  }
  
  return result
})

const filteredClasses = computed(() => {
  let result = classes.value
  
  if (selectedCourseId.value) {
    result = result.filter(c => c.courseId === selectedCourseId.value)
  }
  
  if (classSearch.value) {
    const keyword = classSearch.value.toLowerCase()
    result = result.filter(c => c.name.toLowerCase().includes(keyword))
  }
  
  return result
})

const filteredStudents = computed(() => {
  if (!studentSearch.value) return students.value
  
  const keyword = studentSearch.value.toLowerCase()
  return students.value.filter(s => 
    s.studentId.toLowerCase().includes(keyword) ||
    s.name.toLowerCase().includes(keyword)
  )
})

const getScoreType = (score: number): 'success' | 'warning' | 'danger' => {
  if (score >= 90) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const showCreateCourseDialog = () => {
  editingCourse.value = null
  Object.assign(courseForm, {
    name: '',
    code: '',
    semester: '2026春季学期',
    description: '',
    color: '#165DFF'
  })
  courseDialogVisible.value = true
}

const handleCourseCommand = (command: any) => {
  const { action, course } = command
  switch (action) {
    case 'edit':
      editingCourse.value = course
      Object.assign(courseForm, {
        name: course.name,
        code: course.code,
        semester: course.semester,
        description: course.description || '',
        color: course.color
      })
      courseDialogVisible.value = true
      break
    case 'classes':
      manageClasses(course)
      break
    case 'delete':
      ElMessageBox.confirm(`确定要删除课程"${course.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = courses.value.findIndex(c => c.id === course.id)
        if (index > -1) {
          courses.value.splice(index, 1)
        }
        ElMessage.success('删除成功')
      })
      break
  }
}

const saveCourse = async () => {
  if (!courseFormRef.value) return
  
  try {
    await courseFormRef.value.validate()
    
    if (editingCourse.value) {
      Object.assign(editingCourse.value, courseForm)
      ElMessage.success('课程更新成功')
    } else {
      courses.value.push({
        id: `C${Date.now()}`,
        ...courseForm,
        status: 'active',
        classCount: 0,
        assignmentCount: 0,
        classes: []
      })
      ElMessage.success('课程创建成功')
    }
    
    courseDialogVisible.value = false
  } catch (error) {
    console.error('表单校验失败', error)
  }
}

const manageClasses = (course: any) => {
  selectedCourseId.value = course.id
  activeTab.value = 'classes'
}

const handleCourseSelect = () => {
  classSearch.value = ''
}

const showCreateClassDialog = () => {
  editingClass.value = null
  Object.assign(classForm, {
    name: '',
    courseId: selectedCourseId.value,
    semester: '2026春季学期'
  })
  classDialogVisible.value = true
}

const editClass = (cls: any) => {
  editingClass.value = cls
  Object.assign(classForm, {
    name: cls.name,
    courseId: cls.courseId,
    semester: cls.semester
  })
  classDialogVisible.value = true
}

const saveClass = async () => {
  if (!classFormRef.value) return
  
  try {
    await classFormRef.value.validate()
    
    const course = courses.value.find(c => c.id === classForm.courseId)
    
    if (editingClass.value) {
      Object.assign(editingClass.value, {
        name: classForm.name,
        semester: classForm.semester
      })
      ElMessage.success('班级更新成功')
    } else {
      const newClass = {
        id: `CL${Date.now()}`,
        name: classForm.name,
        courseId: classForm.courseId,
        courseName: course?.name || '',
        studentCount: 0,
        semester: classForm.semester,
        createTime: new Date().toLocaleDateString('zh-CN')
      }
      classes.value.push(newClass)
      
      if (course) {
        course.classes.push({ id: newClass.id, name: newClass.name })
        course.classCount++
      }
      
      ElMessage.success('班级创建成功')
    }
    
    classDialogVisible.value = false
  } catch (error) {
    console.error('表单校验失败', error)
  }
}

const deleteClass = (cls: any) => {
  ElMessageBox.confirm(`确定要删除班级"${cls.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = classes.value.findIndex(c => c.id === cls.id)
    if (index > -1) {
      classes.value.splice(index, 1)
    }
    
    const course = courses.value.find(c => c.id === cls.courseId)
    if (course) {
      const classIndex = course.classes.findIndex(c => c.id === cls.id)
      if (classIndex > -1) {
        course.classes.splice(classIndex, 1)
        course.classCount--
      }
    }
    
    ElMessage.success('删除成功')
  })
}

const importStudents = (cls: any) => {
  selectedClass.value = cls
  previewData.value = []
  importDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  if (file.raw) {
    const fileName = file.raw.name
    const isPDF = fileName.endsWith('.pdf')
    
    if (isPDF) {
      // 模拟PDF文件解析
      ElMessage.info('正在解析PDF文件...')
    }
    
    // 模拟数据预览
    previewData.value = [
      { studentId: '20240006', name: '测试学生1', email: 'test1@example.com', phone: '13800138006' },
      { studentId: '20240007', name: '测试学生2', email: 'test2@example.com', phone: '13800138007' },
      { studentId: '20240008', name: '测试学生3', email: 'test3@example.com', phone: '13800138008' }
    ]
  }
}

const confirmImport = () => {
  if (selectedClass.value) {
    selectedClass.value.studentCount += previewData.value.length
  }
  ElMessage.success(`成功导入 ${previewData.value.length} 名学生`)
  importDialogVisible.value = false
}

const viewStudents = (cls: any) => {
  selectedClass.value = cls
  studentsDialogVisible.value = true
}
</script>

<style scoped>
.course-management-container {
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

.management-tabs {
  margin-top: var(--spacing-lg);
}

.section-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.search-input {
  width: 300px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.course-card {
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
}

.course-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-light);
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

.course-info h3 {
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

.course-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.course-classes {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-md);
}

.classes-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.classes-table-card {
  border: 1px solid var(--border-light);
}

.color-picker {
  display: flex;
  gap: var(--spacing-sm);
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--bg-primary);
}

.import-content {
  padding: var(--spacing-md) 0;
}

.upload-area {
  width: 100%;
}

.preview-section {
  margin-top: var(--spacing-lg);
}

.preview-section h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.preview-count {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-sm);
}

.students-content {
  padding: var(--spacing-md) 0;
}

.students-header {
  margin-bottom: var(--spacing-md);
}

.students-header .search-input {
  width: 300px;
}

@media (max-width: 1200px) {
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .course-management-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .section-header {
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
