import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/students',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '获取成功',
        data: {
          total: 100,
          page: 1,
          pageSize: 10,
          list: [
            {
              id: 'S001',
              username: 'student1',
              name: '张三',
              email: 'zhangsan@example.com',
              phone: '13800138001',
              major: '计算机科学与技术',
              grade: '2023级',
              status: 'active'
            },
            {
              id: 'S002',
              username: 'student2',
              name: '李四',
              email: 'lisi@example.com',
              phone: '13800138002',
              major: '软件工程',
              grade: '2023级',
              status: 'active'
            },
            {
              id: 'S003',
              username: 'student3',
              name: '王五',
              email: 'wangwu@example.com',
              phone: '13800138003',
              major: '数据科学与大数据技术',
              grade: '2023级',
              status: 'active'
            }
          ]
        }
      }
    }
  },
  {
    url: '/api/students/import',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: '导入成功',
        data: {
          success: 50,
          failed: 2,
          failedList: [
            { row: 10, reason: '邮箱格式错误' },
            { row: 25, reason: '手机号格式错误' }
          ]
        }
      }
    }
  }
] as MockMethod[]
