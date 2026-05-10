import { MockMethod } from 'vite-plugin-mock'

// 模拟用户数据库
const mockUsers: any[] = [
  {
    id: 1,
    userId: 1,
    username: 'student',
    passwordHash: '123456',
    email: 'student@autograder.com',
    phone: '13700000001',
    realName: '王小明',
    role: 'student',
    avatarUrl: null,
    isActive: true,
    createdAt: '2026-03-01 09:00:00',
    lastLoginAt: null,
    studentId: '20250001',
    teacherId: null,
    department: null
  },
  {
    id: 2,
    userId: 2,
    username: 'teacher',
    passwordHash: '123456',
    email: 'teacher@autograder.com',
    phone: '13900000001',
    realName: '李老师',
    role: 'teacher',
    avatarUrl: null,
    isActive: true,
    createdAt: '2026-03-01 10:00:00',
    lastLoginAt: null,
    studentId: null,
    teacherId: 'T001',
    department: '计算机学院'
  },
  {
    id: 3,
    userId: 3,
    username: 'admin',
    passwordHash: '123456',
    email: 'admin@autograder.com',
    phone: '13800000001',
    realName: '系统管理员',
    role: 'admin',
    avatarUrl: null,
    isActive: true,
    createdAt: '2026-03-01 08:00:00',
    lastLoginAt: null,
    studentId: null,
    teacherId: null,
    department: null
  }
]

let nextUserId = 4

export default [
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }: { body: any }) => {
      console.log('[Mock] 收到登录请求:', body)
      const { username, password, role } = body
      
      const user = mockUsers.find(u => u.username === username && u.passwordHash === password)
      
      if (user) {
        // 验证角色是否匹配
        if (role && user.role !== role) {
          return {
            code: 401,
            message: '账号或角色错误',
            data: null
          }
        }
        
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: `${user.role}-token-${Date.now()}`,
            user: {
              id: user.id,
              userId: user.userId,
              username: user.username,
              realName: user.realName,
              role: user.role,
              email: user.email,
              phone: user.phone,
              avatarUrl: user.avatarUrl,
              studentId: user.studentId,
              teacherId: user.teacherId,
              department: user.department
            }
          }
        }
      } else {
        return {
          code: 401,
          message: '账号或密码错误',
          data: null
        }
      }
    }
  },
  {
    url: '/api/auth/register',
    method: 'post',
    response: ({ body }: { body: any }) => {
      console.log('[Mock] 收到注册请求:', body)
      
      let requestBody = body
      if (typeof body === 'string') {
        try {
          requestBody = JSON.parse(body)
        } catch (e) {
          console.log('[Mock] 解析body失败')
        }
      }
      
      const { username, password, realName, role, email, phone, studentId, teacherId, department } = requestBody
      
      // 验证必填字段
      if (!username || !password || !realName || !role || !email) {
        return {
          code: 400,
          message: '请填写必填字段',
          data: null
        }
      }
      
      // 验证密码长度
      if (password.length < 6) {
        return {
          code: 400,
          message: '密码长度不能少于6位',
          data: null
        }
      }
      
      // 检查用户名是否已存在
      if (mockUsers.some(u => u.username === username)) {
        return {
          code: 400,
          message: '用户名已存在',
          data: null
        }
      }
      
      // 检查邮箱是否已存在
      if (mockUsers.some(u => u.email === email)) {
        return {
          code: 400,
          message: '邮箱已被注册',
          data: null
        }
      }
      
      // 创建新用户
      const newUser = {
        id: nextUserId,
        userId: nextUserId,
        username,
        passwordHash: password,
        email,
        phone: phone || null,
        realName,
        role,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        studentId: role === 'student' ? studentId : null,
        teacherId: role === 'teacher' ? teacherId : null,
        department: role === 'teacher' ? (department || null) : null
      }
      
      mockUsers.push(newUser)
      nextUserId++
      
      console.log('[Mock] 新用户注册成功:', newUser)
      
      return {
        code: 201,
        message: '注册成功',
        data: {
          id: newUser.id,
          username: newUser.username,
          realName: newUser.realName,
          role: newUser.role,
          email: newUser.email
        }
      }
    }
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '获取成功',
        data: {
          id: 1,
          username: 'student',
          realName: '王小明',
          role: 'student',
          email: 'student@autograder.com',
          studentId: '20250001',
          courses: 3,
          assignments: 15,
          completed: 12
        }
      }
    }
  }
] as MockMethod[]
