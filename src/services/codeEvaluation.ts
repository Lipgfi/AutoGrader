import { evaluateSubmission, type B3EvaluateResponse, type B3CaseResult } from '../api/b3'

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

function convertB3CaseResult(caseResult: B3CaseResult): TestCase {
  return {
    caseId: caseResult.case_id,
    description: caseResult.description,
    passed: caseResult.passed,
    actualOutput: caseResult.actual_output || '',
    expectedOutput: caseResult.expected_output || '',
    error: caseResult.error || undefined,
    executionTimeMs: caseResult.execution_time_ms
  }
}

function convertB3StaticIssues(b3Issues: { code: string; message: string }[]): StaticIssue[] {
  return b3Issues.map(issue => ({
    type: issue.code.startsWith('E') ? 'error' as const : 
          issue.code.startsWith('W') ? 'warning' as const : 'info' as const,
    message: issue.message
  }))
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
  const submissionId = generateSubmissionId()
  
  try {
    const response: B3EvaluateResponse = await evaluateSubmission({
      question_id: questionId,
      submitted_code: code,
      submission_id: submissionId,
      language: language
    })
    
    const caseResults: TestCase[] = response.case_results.map(convertB3CaseResult)
    const staticIssues = convertB3StaticIssues(response.static_issues || [])
    
    let overallComment = response.overall_comment || ''
    if (!overallComment) {
      if (response.overall_score === 100) {
        overallComment = '🎉 完美！所有测试用例都通过了！'
      } else if (response.overall_score >= 80) {
        overallComment = '👍 很好！大部分测试用例都通过了。'
      } else if (response.overall_score >= 60) {
        overallComment = '😊 还可以，但还有改进空间。'
      } else if (response.overall_score >= 40) {
        overallComment = '😟 需要努力，代码存在一些问题。'
      } else {
        overallComment = '😞 继续加油！建议仔细检查代码逻辑。'
      }
    }
    
    const ranking = calculateRanking(response.overall_score)
    
    const result: EvaluationResult = {
      submissionId: response.submission_id,
      questionId: response.question_id,
      status: 'COMPLETED',
      overallScore: response.overall_score,
      passedCount: response.passed_count,
      totalCount: response.total_count,
      overallComment,
      staticIssues: [...staticIssues, ...analyzeCodeQuality(code, language)],
      caseResults,
      ranking
    }
    
    if (!submissionHistory[questionId]) {
      submissionHistory[questionId] = []
    }
    submissionHistory[questionId].push(result)
    
    return result
    
  } catch (error: any) {
    console.error('[CodeEvaluation] B3服务调用失败:', error)
    
    const staticIssues = analyzeCodeQuality(code, language)
    
    const result: EvaluationResult = {
      submissionId,
      questionId,
      status: 'ERROR',
      overallScore: 0,
      passedCount: 0,
      totalCount: 1,
      overallComment: '❌ 评测服务不可用，请稍后重试',
      staticIssues: [
        {
          type: 'error',
          message: '无法连接到判题服务，请检查B3服务是否已启动'
        },
        ...staticIssues
      ],
      caseResults: [{
        caseId: 'error_case',
        description: '服务错误',
        passed: false,
        actualOutput: '',
        expectedOutput: '',
        error: error.message || '连接失败',
        executionTimeMs: 0
      }]
    }
    
    if (!submissionHistory[questionId]) {
      submissionHistory[questionId] = []
    }
    submissionHistory[questionId].push(result)
    
    return result
  }
}

export function getQuestionInfo(questionId: string): QuestionInfo | undefined {
  return undefined
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
  scoreDistribution: { range: string; count: number }[]
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
