import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  
  {
    path: '/student',
    redirect: '/student/courses',
    meta: { requiresAuth: true, role: 'student' },
    children: [
      {
        path: 'courses',
        name: 'StudentCourses',
        component: () => import('../views/student/MyCourses.vue'),
        meta: { title: '我的课程', role: 'student' }
      },
      {
        path: 'course/:id',
        name: 'StudentCourseDetail',
        component: () => import('../views/student/CourseDetail.vue'),
        meta: { title: '课程详情', role: 'student' }
      },
      {
        path: 'coding/:id?',
        name: 'StudentCoding',
        component: () => import('../views/student/CodingPage.vue'),
        meta: { title: '在线编程', role: 'student' }
      },
      {
        path: 'grades',
        name: 'StudentGrades',
        component: () => import('../views/student/Grades.vue'),
        meta: { title: '成绩总览', role: 'student' }
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: () => import('../views/student/Profile.vue'),
        meta: { title: '个人信息', role: 'student' }
      },
      {
        path: 'submit',
        name: 'StudentSubmit',
        component: () => import('../views/StudentSubmit.vue'),
        meta: { title: '作业提交', role: 'student' }
      }
    ]
  },
  
  {
    path: '/teacher',
    redirect: '/teacher/courses',
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      {
        path: 'courses',
        name: 'TeacherCourses',
        component: () => import('../views/teacher/CourseManagement.vue'),
        meta: { title: '课程管理', role: 'teacher' }
      },
      {
        path: 'assignments',
        name: 'TeacherAssignments',
        component: () => import('../views/teacher/AssignmentManagement.vue'),
        meta: { title: '作业管理', role: 'teacher' }
      },
      {
        path: 'questions',
        name: 'TeacherQuestions',
        component: () => import('../views/QuestionBank.vue'),
        meta: { title: '题库管理', role: 'teacher' }
      },
      {
        path: 'grades',
        name: 'TeacherGrades',
        component: () => import('../views/GradeManagement.vue'),
        meta: { title: '成绩管理', role: 'teacher' }
      },
      {
        path: 'grade',
        name: 'TeacherGrade',
        component: () => import('../views/TeacherGrade.vue'),
        meta: { title: '评分界面', role: 'teacher' }
      }
    ]
  },
  
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '控制台', role: 'admin' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { title: '用户管理', role: 'admin' }
      },
      {
        path: 'students',
        name: 'AdminStudents',
        component: () => import('../views/admin/StudentManagement.vue'),
        meta: { title: '学生信息管理', role: 'admin' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/SystemSettings.vue'),
        meta: { title: '系统设置', role: 'admin' }
      }
    ]
  },
  
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - AutoGrader` : 'AutoGrader'
  
  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth !== false // 默认需要登录
  const isLoggedIn = userStore.isLoggedIn
  
  console.log('[Router] 路由跳转:', to.path, '需要登录:', requiresAuth, '已登录:', isLoggedIn)
  
  // 不需要登录的页面
  if (!requiresAuth) {
    // 如果已登录且去登录/注册页面，重定向到对应首页
    if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
      const userRole = userStore.userInfo?.role || 'student'
      const redirectPath = getHomePathByRole(userRole)
      console.log('[Router] 已登录用户访问登录页，重定向到:', redirectPath)
      next(redirectPath)
      return
    }
    next()
    return
  }
  
  // 需要登录的页面
  if (!isLoggedIn) {
    ElMessage.warning('请先登录')
    console.log('[Router] 未登录，重定向到登录页')
    next('/login')
    return
  }
  
  // 检查角色权限
  const requiredRole = to.meta.role
  const userRole = userStore.userInfo?.role
  
  console.log('[Router] 角色检查 - 需要:', requiredRole, '用户:', userRole)
  
  if (requiredRole && userRole !== requiredRole) {
    ElMessage.error('您没有访问该页面的权限')
    const redirectPath = getHomePathByRole(userRole)
    console.log('[Router] 角色不匹配，重定向到:', redirectPath)
    next(redirectPath)
    return
  }
  
  next()
})

// 根据角色获取首页路径
function getHomePathByRole(role: string): string {
  switch (role) {
    case 'student':
      return '/student/courses'
    case 'teacher':
      return '/teacher/courses'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/student/courses'
  }
}

export default router
