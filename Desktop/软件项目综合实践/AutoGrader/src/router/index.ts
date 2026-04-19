import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  
  {
    path: '/student',
    redirect: '/student/courses',
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
  document.title = to.meta.title ? `${to.meta.title} - AutoGrader` : 'AutoGrader'
  
  // 不需要登录的页面
  const publicPages = ['/login', '/register']
  const isPublicPage = publicPages.includes(to.path)
  
  // 临时允许所有页面访问，以便测试
  next()
})

export default router
