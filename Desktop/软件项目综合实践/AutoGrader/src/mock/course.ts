import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/courses',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '获取成功',
        data: [
          {
            id: 'C001',
            name: '数据结构与算法',
            teacher: '李老师',
            semester: '2026-2027秋季',
            credits: 4,
            assignments: 5,
            completed: 4
          },
          {
            id: 'C002',
            name: '操作系统原理',
            teacher: '王老师',
            semester: '2026-2027秋季',
            credits: 3,
            assignments: 4,
            completed: 3
          },
          {
            id: 'C003',
            name: '计算机网络',
            teacher: '张老师',
            semester: '2026-2027秋季',
            credits: 3,
            assignments: 6,
            completed: 5
          }
        ]
      }
    }
  },
  {
    url: '/api/courses/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()
      return {
        code: 200,
        message: '获取成功',
        data: {
          id: id,
          name: '数据结构与算法',
          teacher: '李老师',
          semester: '2026-2027秋季',
          credits: 4,
          description: '本课程介绍数据结构和算法的基本概念和应用',
          assignments: [
            {
              id: 'A001',
              name: '第一次作业 - 数组与链表',
              deadline: '2026-04-05 23:59',
              status: 'completed',
              score: 95
            },
            {
              id: 'A002',
              name: '第二次作业 - 栈与队列',
              deadline: '2026-04-10 23:59',
              status: 'completed',
              score: 88
            }
          ]
        }
      }
    }
  }
] as MockMethod[]
