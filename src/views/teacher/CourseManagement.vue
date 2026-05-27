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
        <el-button
          icon="ArrowRight"
          @click="handleLogout"
          class="logout-btn"
        >
          退出登录
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
              <el-table-column prop="class_code" label="班级编号" width="120" />
              <el-table-column prop="createTime" label="创建时间" width="160" />
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="scope">
                  <el-button type="primary" link size="small" @click="viewStudents(scope.row)">
                    查看学生
                  </el-button>
                  <el-button type="primary" link size="small" @click="importStudents(scope.row)">
                    导入学生
                  </el-button>
                  <el-button type="primary" link size="small" @click="showAddStudentDialog(scope.row)">
                    添加学生
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
        <el-form-item label="班级编号" prop="classCode">
          <el-input v-model="classForm.classCode" placeholder="请输入班级编号，如 01" />
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

    <!-- 添加学生对话框 -->
    <el-dialog
      v-model="addStudentDialogVisible"
      title="添加学生"
      width="500px"
    >
      <div style="margin-bottom: 16px;">
        <el-input
          v-model="addStudentId"
          placeholder="输入学号搜索"
          clearable
          @keyup.enter="searchStudent"
        >
          <template #append>
            <el-button @click="searchStudent" :loading="searchingStudent">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      <div v-if="foundStudent" class="search-result">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="学号">{{ foundStudent.student_id }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ foundStudent.real_name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ foundStudent.email }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="foundStudent.is_active ? 'success' : 'danger'" size="small">
              {{ foundStudent.is_active ? '正常' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 16px; text-align: center;">
          <el-button type="primary" @click="confirmAddStudent" :loading="addingStudent">
            添加到当前班级
          </el-button>
        </div>
      </div>
      <div v-if="searchDone && !foundStudent" style="text-align: center; color: #999; padding: 20px;">
        未找到该学号的学生
      </div>
      <template #footer>
        <el-button @click="addStudentDialogVisible = false">关闭</el-button>
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
          <el-table-column prop="joinedAt" label="加入时间" width="170" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/course'
import { getAssignments } from '../../api/assignment'
import { getClasses, createClass, getClassStudents, deleteClass as deleteClassApi, importStudents as importClassStudents, addStudentToClass } from '../../api/class'
import { getStudents } from '../../api/student'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  MoreFilled, 
  User,
  Document,
  Calendar,
  UploadFilled,
  ArrowRight
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('courses')
const courseSearch = ref('')
const courseStatusFilter = ref('')
const selectedCourseId = ref('')
const classSearch = ref('')
const courseDialogVisible = ref(false)
const classDialogVisible = ref(false)
const importDialogVisible = ref(false)
const studentsDialogVisible = ref(false)
const addStudentDialogVisible = ref(false)
const addStudentId = ref('')
const foundStudent = ref<any>(null)
const searchingStudent = ref(false)
const addingStudent = ref(false)
const searchDone = ref(false)
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
  classCode: '',
  courseId: ''
})

const courseRules: FormRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入课程编号', trigger: 'blur' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }]
}

const classRules: FormRules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  classCode: [{ required: true, message: '请输入班级编号', trigger: 'blur' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }]
}

const courses = ref([])

const classes = ref([])

const students = ref([])

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
      }).then(async () => {
        try {
          await deleteCourse(String(course.id))
          await loadCourses()
          ElMessage.success('删除成功')
        } catch (e) {
          ElMessage.error('删除失败')
        }
      })
      break
  }
}

const saveCourse = async () => {
  if (!courseFormRef.value) return
  
  try {
    await courseFormRef.value.validate()
    
    if (editingCourse.value) {
      try {
        await updateCourse(String(editingCourse.value.id), {
          courseName: courseForm.name,
          courseCode: courseForm.code,
          semester: courseForm.semester,
          description: courseForm.description
        })
        await loadCourses()
        ElMessage.success('课程更新成功')
      } catch (e) {
        ElMessage.error('课程更新失败')
      }
    } else {
      // 调用API创建课程
      const response = await createCourse({
        courseName: courseForm.name,
        courseCode: courseForm.code,
        semester: courseForm.semester,
        description: courseForm.description
      })
      
      if (response.code === 200 && response.data) {
        ElMessage.success('课程创建成功')
        // 刷新课程列表
        await loadCourses()
      } else {
        ElMessage.error('课程创建失败')
      }
    }
    
    courseDialogVisible.value = false
  } catch (error) {
    console.error('课程保存失败', error)
    ElMessage.error('课程保存失败')
  }
}

// 加载课程列表
const loadCourses = async () => {
  try {
    const [coursesRes, classesRes, assignmentsRes] = await Promise.all([
      getCourses(),
      getClasses(),
      getAssignments()
    ])

    const apiClasses = (classesRes.code === 200 && classesRes.data) ? (classesRes.data || []) : []
    const apiAssignments = (assignmentsRes.code === 200 && assignmentsRes.data) ? (assignmentsRes.data || []) : []

    // 按 course_id 统计班级数
    const classCountByCourse: Record<number, number> = {}
    const classesByCourse: Record<number, any[]> = {}
    for (const cls of apiClasses) {
      const cid = cls.course_id || cls.courseId
      if (cid) {
        classCountByCourse[cid] = (classCountByCourse[cid] || 0) + 1
        if (!classesByCourse[cid]) classesByCourse[cid] = []
        classesByCourse[cid].push({ id: cls.class_id || cls.id, name: cls.class_name || cls.name })
      }
    }

    // 按 course_id 统计作业数（通过 class_id → course_id 关联）
    const assignmentCountByCourse: Record<number, number> = {}
    for (const a of apiAssignments) {
      const cls = apiClasses.find((c: any) => (c.class_id || c.id) === (a.class_id || a.classId))
      if (cls) {
        const cid = cls.course_id || cls.courseId
        if (cid) {
          assignmentCountByCourse[cid] = (assignmentCountByCourse[cid] || 0) + 1
        }
      }
    }

    if (coursesRes.code === 200 && coursesRes.data) {
      courses.value = (coursesRes.data || []).map((course: any) => {
        const cid = course.course_id || course.id
        return {
          ...course,
          id: cid,
          name: course.course_name || course.name,
          code: course.course_code || course.code,
          color: course.color || '#165DFF',
          status: course.status || 'active',
          classCount: classCountByCourse[cid] || 0,
          assignmentCount: assignmentCountByCourse[cid] || 0,
          classes: classesByCourse[cid] || []
        }
      })
    }
  } catch (error) {
    console.error('加载课程失败', error)
  }
}

onMounted(() => {
  loadCourses()
  loadClasses()
})

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
    classCode: '',
    courseId: selectedCourseId.value
  })
  classDialogVisible.value = true
}

const editClass = (cls: any) => {
  editingClass.value = cls
  Object.assign(classForm, {
    name: cls.name,
    classCode: cls.class_code || cls.classCode || '',
    courseId: cls.courseId || cls.course_id
  })
  classDialogVisible.value = true
}

const saveClass = async () => {
  if (!classFormRef.value) return

  try {
    await classFormRef.value.validate()

    if (editingClass.value) {
      ElMessage.success('班级更新成功')
    } else {
      const response = await createClass({
        courseId: Number(classForm.courseId),
        className: classForm.name,
        classCode: classForm.classCode
      })

      if (response.code === 200 && response.data) {
        ElMessage.success('班级创建成功')
        await loadClasses()
      } else {
        ElMessage.error('班级创建失败')
      }
    }

    classDialogVisible.value = false
  } catch (error) {
    console.error('班级保存失败', error)
    ElMessage.error('班级保存失败')
  }
}

const deleteClass = (cls: any) => {
  ElMessageBox.confirm(`确定要删除班级"${cls.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteClassApi(String(cls.id))
      await loadClasses()
      ElMessage.success('删除成功')
    } catch (e) {
      ElMessage.error('删除失败')
    }
  })
}

const importStudents = (cls: any) => {
  selectedClass.value = cls
  previewData.value = []
  importDialogVisible.value = true
}

const showAddStudentDialog = (cls: any) => {
  selectedClass.value = cls
  addStudentId.value = ''
  foundStudent.value = null
  searchDone.value = false
  addStudentDialogVisible.value = true
}

const searchStudent = async () => {
  const keyword = addStudentId.value.trim()
  if (!keyword) return
  searchingStudent.value = true
  searchDone.value = false
  foundStudent.value = null
  try {
    const res = await getStudents({ keyword, size: 10 })
    if (res.code === 200 && res.data) {
      const list = res.data.students || res.data || []
      foundStudent.value = list.find((s: any) => s.student_id === keyword) || list[0] || null
    }
  } catch (e) { console.error('搜索学生失败', e) }
  finally {
    searchingStudent.value = false
    searchDone.value = true
  }
}

const confirmAddStudent = async () => {
  if (!foundStudent.value || !selectedClass.value) return
  addingStudent.value = true
  try {
    const classId = selectedClass.value.id || selectedClass.value.class_id
    await addStudentToClass(String(classId), { studentUserId: foundStudent.value.user_id })
    ElMessage.success(`${foundStudent.value.student_id} 已添加到班级`)
    addStudentDialogVisible.value = false
    await loadClasses()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '添加失败')
  } finally {
    addingStudent.value = false
  }
}

const handleFileChange = async (file: any) => {
  if (file.raw) {
    const fileName = file.raw.name
    const isPDF = fileName.endsWith('.pdf')
    
    if (isPDF) {
      ElMessage.info('正在解析PDF文件...')
    }
    
    try {
      // 读取文件内容
      const fileContent = await readFileContent(file.raw)
      
      // 解析文件内容
      if (isPDF) {
        // PDF文件解析（简单处理）
        previewData.value = parsePDFFile(fileContent)
      } else {
        // Excel文件解析（简单处理）
        previewData.value = parseExcelFile(fileContent)
      }
    } catch (error) {
      console.error('文件解析失败:', error)
      ElMessage.error('文件解析失败，请确保文件格式正确')
    }
  }
}

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result)
      } else {
        reject(new Error('无法读取文件内容'))
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const parsePDFFile = (content: string): any[] => {
  // 简单的PDF文本解析，提取学生信息
  const students: any[] = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    // 匹配学号 姓名 邮箱 手机号格式
    const match = trimmedLine.match(/(\d{8,12})\s+([\u4e00-\u9fa5]+)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s+(\d{11})/)
    if (match) {
      students.push({
        studentId: match[1],
        name: match[2],
        email: match[3],
        phone: match[4]
      })
    }
  }
  
  return students
}

const parseExcelFile = (content: string): any[] => {
  // 简单的CSV/Excel解析
  const students: any[] = []
  const lines = content.split('\n').filter(line => line.trim())
  
  // 跳过表头
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // 支持逗号和制表符分隔
    const parts = line.split(/[,;\t]/).map(p => p.trim())
    
    if (parts.length >= 2) {
      students.push({
        studentId: parts[0] || '',
        name: parts[1] || '',
        email: parts[2] || '',
        phone: parts[3] || ''
      })
    }
  }
  
  return students
}

const confirmImport = async () => {
  if (!selectedClass.value || previewData.value.length === 0) {
    return
  }
  
  try {
    // 调用后端API导入学生
    const response = await importClassStudents(selectedClass.value.id, {
      students: previewData.value.map(s => ({
        student_id: s.studentId,
        name: s.name,
        email: s.email,
        phone: s.phone
      }))
    })
    
    if (response.code === 200) {
      const importedCount = response.data?.count || previewData.value.length
      selectedClass.value.studentCount += importedCount
      ElMessage.success(`成功导入 ${importedCount} 名学生`)
      // 刷新班级列表
      await loadClasses()
    } else {
      ElMessage.error(response.data?.message || '导入失败')
    }
  } catch (error) {
    console.error('导入学生失败:', error)
    ElMessage.error('导入失败，请检查网络连接')
  } finally {
    importDialogVisible.value = false
  }
}

const loadClasses = async () => {
  try {
    const response = await getClasses()
    if (response.code === 200 && response.data) {
      const list = (response.data || []).map((cls: any) => ({
        ...cls,
        id: cls.class_id || cls.id,
        name: cls.class_name || cls.name,
        courseId: cls.course_id || cls.courseId,
        courseName: cls.course_name || '',
        studentCount: 0,
        createTime: cls.create_time || ''
      }))

      // 异步加载每个班级的学生数
      await Promise.all(list.map(async (c: any) => {
        try {
          const sRes = await getClassStudents(String(c.id))
          if (sRes.code === 200 && sRes.data) {
            c.studentCount = (sRes.data || []).length
          }
        } catch (e) { /* ignore */ }
      }))

      classes.value = list
    }
  } catch (error) {
    console.error('加载班级列表失败:', error)
  }
}

const viewStudents = async (cls: any) => {
  selectedClass.value = cls
  studentsDialogVisible.value = true
  try {
    const response = await getClassStudents(cls.id || cls.class_id)
    if (response.code === 200 && response.data) {
      students.value = (response.data || []).map((s: any) => ({
        id: s.user_id || s.id,
        name: s.real_name || s.name,
        studentId: s.student_id || s.studentId,
        email: s.email || '',
        phone: s.phone || '',
        joinedAt: s.joined_at ? new Date(s.joined_at).toLocaleString('zh-CN') : ''
      }))
    }
  } catch (error) {
    console.error('加载学生列表失败', error)
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
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

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-desc {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.logout-btn {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  
  &:hover {
    background-color: var(--danger-light);
    border-color: var(--danger-light);
  }
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
