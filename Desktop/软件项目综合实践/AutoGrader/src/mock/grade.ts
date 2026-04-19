import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/grades',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '获取成功',
        data: {
          stats: {
            totalAssignments: 15,
            completedAssignments: 12,
            avgScore: 85.6,
            ranking: 5
          },
          grades: [
            {
              id: 'G001',
              courseId: 'C001',
              courseName: '数据结构与算法',
              assignmentName: '第一次作业 - 数组与链表',
              deadline: '2026-04-05 23:59',
              status: 'completed',
              score: 95,
              totalScore: 100,
              passRate: 100,
              submitTime: '2026-04-03 15:30',
              passedCases: 3,
              totalCases: 3,
              runtime: 32,
              ranking: 2
            },
            {
              id: 'G002',
              courseId: 'C001',
              courseName: '数据结构与算法',
              assignmentName: '第二次作业 - 栈与队列',
              deadline: '2026-04-10 23:59',
              status: 'completed',
              score: 88,
              totalScore: 100,
              passRate: 75,
              submitTime: '2026-04-08 20:15',
              passedCases: 3,
              totalCases: 4,
              runtime: 45,
              ranking: 8
            },
            {
              id: 'G003',
              courseId: 'C002',
              courseName: '操作系统原理',
              assignmentName: '进程调度模拟',
              deadline: '2026-04-15 23:59',
              status: 'pending',
              score: null,
              totalScore: 100,
              passRate: null,
              submitTime: '-',
              passedCases: 0,
              totalCases: 0,
              runtime: 0,
              ranking: 0
            }
          ]
        }
      }
    }
  },
  {
    url: '/api/grades/:id',
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
          assignmentName: '第一次作业 - 数组与链表',
          deadline: '2026-04-05 23:59',
          status: 'completed',
          score: 95,
          totalScore: 100,
          passRate: 100,
          submitTime: '2026-04-03 15:30',
          passedCases: 3,
          totalCases: 3,
          runtime: 32,
          ranking: 2,
          testCases: [
            {
              passed: true,
              input: '[2,7,11,15], 9',
              expectedOutput: '[0,1]',
              actualOutput: '[0,1]',
              executionTime: 12
            },
            {
              passed: true,
              input: '[3,2,4], 6',
              expectedOutput: '[1,2]',
              actualOutput: '[1,2]',
              executionTime: 8
            },
            {
              passed: true,
              input: '[3,3], 6',
              expectedOutput: '[0,1]',
              actualOutput: '[0,1]',
              executionTime: 12
            }
          ]
        }
      }
    }
  }
] as MockMethod[]
