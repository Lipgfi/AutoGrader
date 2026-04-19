import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/assignments',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '获取成功',
        data: [
          {
            id: 'A001',
            courseId: 'C001',
            courseName: '数据结构与算法',
            name: '第一次作业 - 数组与链表',
            description: '实现数组和链表的基本操作',
            deadline: '2026-04-05 23:59',
            status: 'completed',
            score: 95
          },
          {
            id: 'A002',
            courseId: 'C001',
            courseName: '数据结构与算法',
            name: '第二次作业 - 栈与队列',
            description: '实现栈和队列的基本操作',
            deadline: '2026-04-10 23:59',
            status: 'completed',
            score: 88
          },
          {
            id: 'A003',
            courseId: 'C002',
            courseName: '操作系统原理',
            name: '进程调度模拟',
            description: '模拟实现进程调度算法',
            deadline: '2026-04-15 23:59',
            status: 'pending',
            score: null
          }
        ]
      }
    }
  },
  {
    url: '/api/assignments/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()
      return {
        code: 200,
        message: '获取成功',
        data: {
          id: id,
          courseId: 'C001',
          courseName: '数据结构与算法',
          name: '第一次作业 - 数组与链表',
          description: '实现数组和链表的基本操作',
          deadline: '2026-04-05 23:59',
          difficulty: 'medium',
          testCases: [
            {
              id: 'TC001',
              input: '[2,7,11,15], 9',
              expectedOutput: '[0,1]'
            },
            {
              id: 'TC002',
              input: '[3,2,4], 6',
              expectedOutput: '[1,2]'
            },
            {
              id: 'TC003',
              input: '[3,3], 6',
              expectedOutput: '[0,1]'
            }
          ]
        }
      }
    }
  },
  {
    url: '/api/assignments/:id/submit',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: '提交成功',
        data: {
          id: 'S001',
          status: 'pending',
          message: '评测中，请稍候'
        }
      }
    }
  }
] as MockMethod[]
