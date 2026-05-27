import { MockMethod } from 'vite-plugin-mock'

// 模拟题目数据库
const mockQuestions: any[] = [
  {
    id: 'Q001',
    title: '两数之和',
    difficulty: '简单',
    tags: ['数组', '哈希表'],
    description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。',
    inputFormat: '第一行输入两个整数 n 和 target，分别表示数组长度和目标值。第二行输入 n 个整数，表示数组元素。',
    outputFormat: '输出两个整数，表示两个数的下标（从0开始）。',
    examples: [
      {
        input: '4 9\n2 7 11 15',
        output: '0 1'
      },
      {
        input: '3 6\n3 2 4',
        output: '1 2'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      '只会存在一个有效答案'
    ],
    testcases: [
      { id: 1, input: '4 9\n2 7 11 15', expectedOutput: '0 1' },
      { id: 2, input: '3 6\n3 2 4', expectedOutput: '1 2' },
      { id: 3, input: '2 6\n3 3', expectedOutput: '0 1' }
    ]
  },
  {
    id: 'Q002',
    title: '有效的括号',
    difficulty: '简单',
    tags: ['栈', '字符串'],
    description: "给定一个只包括 '(', ')', '{', '}', '[', ']' 的字符串 s ，判断字符串是否有效。有效字符串需满足：左括号必须用相同类型的右括号闭合，左括号必须以正确的顺序闭合。",
    inputFormat: '输入一个字符串 s',
    outputFormat: '输出 true 或 false',
    examples: [
      {
        input: '()',
        output: 'true'
      },
      {
        input: '()[]{}',
        output: 'true'
      },
      {
        input: '(]',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      "s 仅由括号 '()[]{}' 组成"
    ],
    testcases: [
      { id: 1, input: '()', expectedOutput: 'true' },
      { id: 2, input: '()[]{}', expectedOutput: 'true' },
      { id: 3, input: '(]', expectedOutput: 'false' },
      { id: 4, input: '([)]', expectedOutput: 'false' }
    ]
  },
  {
    id: 'Q003',
    title: '反转链表',
    difficulty: '简单',
    tags: ['链表', '递归'],
    description: '给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。',
    inputFormat: '第一行输入链表节点数 n，第二行输入 n 个整数表示链表节点值（以 -1 表示链表结束）。',
    outputFormat: '输出反转后的链表节点值，用空格分隔。',
    examples: [
      {
        input: '5\n1 2 3 4 5 -1',
        output: '5 4 3 2 1'
      },
      {
        input: '2\n1 2 -1',
        output: '2 1'
      },
      {
        input: '1\n1 -1',
        output: '1'
      }
    ],
    constraints: [
      '链表中节点的数目范围是 [0, 5000]',
      '-5000 <= Node.val <= 5000'
    ],
    testcases: [
      { id: 1, input: '5\n1 2 3 4 5 -1', expectedOutput: '5 4 3 2 1' },
      { id: 2, input: '2\n1 2 -1', expectedOutput: '2 1' },
      { id: 3, input: '1\n1 -1', expectedOutput: '1' }
    ]
  },
  {
    id: 'Q004',
    title: '最大子数组和',
    difficulty: '中等',
    tags: ['数组', '分治', '动态规划'],
    description: '给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。子数组是数组中的一个连续部分。',
    inputFormat: '第一行输入数组长度 n，第二行输入 n 个整数。',
    outputFormat: '输出最大子数组和。',
    examples: [
      {
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6'
      },
      {
        input: '1\n1',
        output: '1'
      },
      {
        input: '5\n5 4 -1 7 8',
        output: '23'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    testcases: [
      { id: 1, input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
      { id: 2, input: '1\n1', expectedOutput: '1' },
      { id: 3, input: '5\n5 4 -1 7 8', expectedOutput: '23' }
    ]
  },
  {
    id: 'Q005',
    title: '爬楼梯',
    difficulty: '简单',
    tags: ['动态规划', '数学'],
    description: '假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？',
    inputFormat: '输入一个整数 n 表示楼梯阶数。',
    outputFormat: '输出爬到楼顶的方法数。',
    examples: [
      {
        input: '2',
        output: '2'
      },
      {
        input: '3',
        output: '3'
      }
    ],
    constraints: [
      '1 <= n <= 45'
    ],
    testcases: [
      { id: 1, input: '2', expectedOutput: '2' },
      { id: 2, input: '3', expectedOutput: '3' },
      { id: 3, input: '5', expectedOutput: '8' },
      { id: 4, input: '10', expectedOutput: '89' }
    ]
  }
]

export default [
  {
    url: '/api/questions/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      console.log('[Mock] 获取题目:', url)
      const id = url.split('/').pop() || 'Q001'
      const question = mockQuestions.find(q => q.id === id)
      
      if (question) {
        return {
          code: 200,
          message: '获取成功',
          data: question
        }
      } else {
        return {
          code: 404,
          message: '题目不存在',
          data: null
        }
      }
    }
  },
  {
    url: '/api/questions/list',
    method: 'get',
    response: () => {
      console.log('[Mock] 获取题目列表')
      return {
        code: 200,
        message: '获取成功',
        data: mockQuestions.map(q => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          tags: q.tags
        }))
      }
    }
  }
] as MockMethod[]
