import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { username, password, role } = body
      if (username === 'student' && password === '123456' && role === 'student') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: 'student-token',
            user: {
              id: 'S001',
              username: 'student',
              name: '张三',
              role: 'student',
              email: 'student@example.com'
            }
          }
        }
      } else if (username === 'teacher' && password === '123456' && role === 'teacher') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: 'teacher-token',
            user: {
              id: 'T001',
              username: 'teacher',
              name: '李老师',
              role: 'teacher',
              email: 'teacher@example.com'
            }
          }
        }
      } else if (username === 'admin' && password === '123456' && role === 'admin') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: 'admin-token',
            user: {
              id: 'A001',
              username: 'admin',
              name: '管理员',
              role: 'admin',
              email: 'admin@example.com'
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
    url: '/api/user/info',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '获取成功',
        data: {
          id: 'S001',
          username: 'student',
          name: '张三',
          role: 'student',
          email: 'student@example.com',
          courses: 3,
          assignments: 15,
          completed: 12
        }
      }
    }
  }
] as MockMethod[]
