

export interface TestCase {
  caseId: string
  description: string
  passed: boolean
  actualOutput: string
  expectedOutput: string
  error?: string
  executionTimeMs: number
}

export interface StaticIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  line?: number
}

export interface EvaluationResult {
  submissionId: string
  questionId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR'
  overallScore: number
  passedCount: number
  totalCount: number
  overallComment: string
  staticIssues: StaticIssue[]
  caseResults: TestCase[]
  ranking?: {
    currentRank: number
    totalParticipants: number
    scorePercentile: number
  }
}

export interface QuestionInfo {
  questionId: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  timeLimit: number
  memoryLimit: number
  testCases: TestCase[]
}

const questionDatabase: Record<string, QuestionInfo> = {
  'Q001': {
    questionId: 'Q001',
    title: '数组求和',
    description: '给定一个整数数组，计算数组中所有元素的和。',
    difficulty: 'Easy',
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: [
      {
        caseId: 'case_01',
        description: '基本正整数',
        passed: true,
        actualOutput: '15',
        expectedOutput: '15',
        executionTimeMs: 12.5
      },
      {
        caseId: 'case_02',
        description: '包含负数',
        passed: true,
        actualOutput: '12',
        expectedOutput: '12',
        executionTimeMs: 10.2
      },
      {
        caseId: 'case_03',
        description: '单个元素',
        passed: true,
        actualOutput: '5',
        expectedOutput: '5',
        executionTimeMs: 8.3
      },
      {
        caseId: 'case_04',
        description: '空数组',
        passed: true,
        actualOutput: '0',
        expectedOutput: '0',
        executionTimeMs: 6.7
      }
    ]
  },
  'Q002': {
    questionId: 'Q002',
    title: '判断奇偶数',
    description: '给定一个整数，判断它是奇数还是偶数。',
    difficulty: 'Easy',
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: [
      {
        caseId: 'case_01',
        description: '偶数',
        passed: true,
        actualOutput: 'even',
        expectedOutput: 'even',
        executionTimeMs: 9.8
      },
      {
        caseId: 'case_02',
        description: '奇数',
        passed: true,
        actualOutput: 'odd',
        expectedOutput: 'odd',
        executionTimeMs: 8.5
      },
      {
        caseId: 'case_03',
        description: '零',
        passed: true,
        actualOutput: 'even',
        expectedOutput: 'even',
        executionTimeMs: 7.2
      },
      {
        caseId: 'case_04',
        description: '负数偶数',
        passed: true,
        actualOutput: 'even',
        expectedOutput: 'even',
        executionTimeMs: 8.9
      }
    ]
  },
  'Q003': {
    questionId: 'Q003',
    title: '斐波那契数列',
    description: '计算斐波那契数列的第n项。',
    difficulty: 'Medium',
    timeLimit: 2000,
    memoryLimit: 512,
    testCases: [
      {
        caseId: 'case_01',
        description: 'n=0',
        passed: true,
        actualOutput: '0',
        expectedOutput: '0',
        executionTimeMs: 8.2
      },
      {
        caseId: 'case_02',
        description: 'n=1',
        passed: true,
        actualOutput: '1',
        expectedOutput: '1',
        executionTimeMs: 7.8
      },
      {
        caseId: 'case_03',
        description: 'n=10',
        passed: true,
        actualOutput: '55',
        expectedOutput: '55',
        executionTimeMs: 15.3
      },
      {
        caseId: 'case_04',
        description: 'n=20',
        passed: true,
        actualOutput: '6765',
        expectedOutput: '6765',
        executionTimeMs: 45.2
      }
    ]
  },
  'Q004': {
    questionId: 'Q004',
    title: '链表反转',
    description: '反转一个单链表。',
    difficulty: 'Medium',
    timeLimit: 2000,
    memoryLimit: 512,
    testCases: [
      {
        caseId: 'case_01',
        description: '空链表',
        passed: true,
        actualOutput: '[]',
        expectedOutput: '[]',
        executionTimeMs: 6.5
      },
      {
        caseId: 'case_02',
        description: '单节点',
        passed: true,
        actualOutput: '[5]',
        expectedOutput: '[5]',
        executionTimeMs: 8.7
      },
      {
        caseId: 'case_03',
        description: '多节点',
        passed: true,
        actualOutput: '[3,2,1]',
        expectedOutput: '[3,2,1]',
        executionTimeMs: 12.4
      },
      {
        caseId: 'case_04',
        description: '长链表',
        passed: true,
        actualOutput: '[10,9,8,7,6,5,4,3,2,1]',
        expectedOutput: '[10,9,8,7,6,5,4,3,2,1]',
        executionTimeMs: 25.8
      }
    ]
  },
  'Q101': {
    questionId: 'Q101',
    title: '链表基础',
    description: '实现链表的基本操作。',
    difficulty: 'Medium',
    timeLimit: 2000,
    memoryLimit: 512,
    testCases: [
      {
        caseId: 'case_01',
        description: '空链表',
        passed: true,
        actualOutput: '[]',
        expectedOutput: '[]',
        executionTimeMs: 8.6
      },
      {
        caseId: 'case_02',
        description: '单节点',
        passed: true,
        actualOutput: '[5]',
        expectedOutput: '[5]',
        executionTimeMs: 8.9
      },
      {
        caseId: 'case_03',
        description: '多节点遍历',
        passed: true,
        actualOutput: '[1,2,3]',
        expectedOutput: '[1,2,3]',
        executionTimeMs: 9.1
      },
      {
        caseId: 'case_04',
        description: '非法输入保护',
        passed: false,
        actualOutput: '',
        expectedOutput: 'ValueError',
        error: '运行时异常',
        executionTimeMs: 7.7
      }
    ]
  }
}

const submissionHistory: Record<string, EvaluationResult[]> = {}

function generateSubmissionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function analyzeCodeQuality(code: string, language: string): StaticIssue[] {
  const issues: StaticIssue[] = []
  
  if (!code.trim()) {
    issues.push({
      type: 'error',
      message: '代码为空'
    })
    return issues
  }
  
  const lines = code.split('\n')
  lines.forEach((line, index) => {
    if (line.includes('print(') && !line.includes('#')) {
      issues.push({
        type: 'warning',
        message: '建议移除调试输出语句',
        line: index + 1
      })
    }
    
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        type: 'info',
        message: '代码中包含待办事项',
        line: index + 1
      })
    }
  })
  
  if (code.length < 50) {
    issues.push({
      type: 'warning',
      message: '代码过于简单，可能存在逻辑问题'
    })
  }
  
  if (!code.includes('def ') && !code.includes('class ') && language === 'python') {
    issues.push({
      type: 'warning',
      message: '建议使用函数或类来组织代码'
    })
  }
  
  return issues
}

function simulateCodeExecution(code: string, question: QuestionInfo, language: string): TestCase[] {
  const results: TestCase[] = []
  const codeQuality = analyzeCodeQuality(code, language)
  const hasErrors = codeQuality.some(issue => issue.type === 'error')
  
  question.testCases.forEach((testCase) => {
    const passed = !hasErrors && Math.random() > 0.2
    
    results.push({
      ...testCase,
      passed: passed,
      actualOutput: passed ? testCase.expectedOutput : '错误输出',
      error: !passed ? (hasErrors ? '语法错误' : '逻辑错误') : undefined,
      executionTimeMs: testCase.executionTimeMs + (Math.random() * 5)
    })
  })
  
  return results
}

function calculateRanking(score: number): EvaluationResult['ranking'] {
  const allScores = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5]
  const betterScores = allScores.filter(s => s > score).length
  const currentRank = betterScores + 1
  const totalParticipants = allScores.length
  const scorePercentile = ((totalParticipants - betterScores) / totalParticipants * 100).toFixed(1)
  
  return {
    currentRank,
    totalParticipants,
    scorePercentile: parseFloat(scorePercentile)
  }
}

export async function evaluateCode(
  code: string,
  questionId: string,
  language: string
): Promise<EvaluationResult> {
  const question = questionDatabase[questionId]
  
  if (!question) {
    throw new Error(`题目 ${questionId} 不存在`)
  }
  
  const submissionId = generateSubmissionId()
  
  const caseResults = simulateCodeExecution(code, question, language)
  const passedCount = caseResults.filter(c => c.passed).length
  const totalCount = caseResults.length
  const overallScore = (passedCount / totalCount) * 100
  
  const staticIssues = analyzeCodeQuality(code, language)
  
  let overallComment = ''
  if (overallScore === 100) {
    overallComment = '🎉 完美！所有测试用例都通过了！'
  } else if (overallScore >= 80) {
    overallComment = '👍 很好！大部分测试用例都通过了。'
  } else if (overallScore >= 60) {
    overallComment = '😊 还可以，但还有改进空间。'
  } else if (overallScore >= 40) {
    overallComment = '😟 需要努力，代码存在一些问题。'
  } else {
    overallComment = '😞 继续加油！建议仔细检查代码逻辑。'
  }
  
  const ranking = calculateRanking(overallScore)
  
  const result: EvaluationResult = {
    submissionId,
    questionId,
    status: 'COMPLETED',
    overallScore,
    passedCount,
    totalCount,
    overallComment,
    staticIssues,
    caseResults,
    ranking
  }
  
  if (!submissionHistory[questionId]) {
    submissionHistory[questionId] = []
  }
  submissionHistory[questionId].push(result)
  
  return result
}

export function getQuestionInfo(questionId: string): QuestionInfo | undefined {
  return questionDatabase[questionId]
}

export function getSubmissionHistory(questionId: string): EvaluationResult[] {
  return submissionHistory[questionId] || []
}

export function getLeaderboard(questionId: string, limit: number = 10): Array<{
  rank: number
  submissionId: string
  score: number
  participant: string
  time: string
}> {
  const history = getSubmissionHistory(questionId)
  const sorted = [...history].sort((a, b) => b.overallScore - a.overallScore)
  
  return sorted.slice(0, limit).map((result, index) => ({
    rank: index + 1,
    submissionId: result.submissionId,
    score: result.overallScore,
    participant: '匿名用户',
    time: new Date().toLocaleString('zh-CN')
  }))
}

export function getStatistics(questionId: string): {
  totalSubmissions: number
  averageScore: number
  passRate: number
  scoreDistribution: { range: string, count: number }[]
} {
  const history = getSubmissionHistory(questionId)
  
  if (history.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      passRate: 0,
      scoreDistribution: []
    }
  }
  
  const totalSubmissions = history.length
  const averageScore = history.reduce((sum, r) => sum + r.overallScore, 0) / totalSubmissions
  const passCount = history.filter(r => r.overallScore >= 60).length
  const passRate = (passCount / totalSubmissions) * 100
  
  const scoreDistribution = [
    { range: '90-100', count: history.filter(r => r.overallScore >= 90).length },
    { range: '80-89', count: history.filter(r => r.overallScore >= 80 && r.overallScore < 90).length },
    { range: '70-79', count: history.filter(r => r.overallScore >= 70 && r.overallScore < 80).length },
    { range: '60-69', count: history.filter(r => r.overallScore >= 60 && r.overallScore < 70).length },
    { range: '0-59', count: history.filter(r => r.overallScore < 60).length }
  ]
  
  return {
    totalSubmissions,
    averageScore,
    passRate,
    scoreDistribution
  }
}