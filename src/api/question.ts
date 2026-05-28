import { request } from './interceptors'
import b3Instance from './b3'

// 获取题目列表（从 B4）
export const getQuestions = async (params?: any) => {
  return await request.get('/questions', params)
}

// 获取题目详情（从 B4）
export const getQuestionDetail = async (questionId: string) => {
  return await request.get(`/questions/${questionId}`)
}

// 创建题目（同时创建到 B3）
export const createQuestion = async (data: any) => {
  // 先创建到 B4
  const b4Response = await request.post('/questions', data)
  
  // 如果 B4 创建成功，同步创建到 B3
  if (b4Response.status === 200 && b4Response.data) {
    try {
      const b3Payload = {
        id: data.id || b4Response.data.id,
        title: data.title,
        description: data.content || data.description,
        question_type: mapQuestionType(data.questionType),
        difficulty: mapDifficulty(data.difficulty),
        language: data.languages?.[0] || 'shell',
        time_limit_ms: data.timeLimit || 2000,
        memory_limit_mb: data.memoryLimit || 64,
        allowed_commands: data.allowedCommands || [],
        metadata_json: data.metadataJson || {},
        starter_code: data.starterCode,
        solution_code: data.solutionCode,
        test_cases: (data.testCases || []).map((tc: any, index: number) => ({
          case_no: index + 1,
          description: tc.description || `case_${(index + 1).toString().padStart(2, '0')}`,
          input_data: tc.input,
          expected_output: tc.expectedOutput,
          score_weight: tc.scoreWeight || 1.0,
          is_hidden: tc.isHidden || false
        }))
      }
      
      await b3Instance.post('/questions', b3Payload)
    } catch (error) {
      console.warn('[Question] 同步到 B3 失败，但 B4 已创建成功:', error)
    }
  }
  
  return b4Response
}

function mapQuestionType(type: number): string {
  const typeMap: Record<number, string> = {
    1: 'command',
    2: 'command',
    3: 'command'
  }
  return typeMap[type] || 'command'
}

function mapDifficulty(difficulty: number): string {
  const diffMap: Record<number, string> = {
    1: 'EASY',
    2: 'MEDIUM',
    3: 'HARD'
  }
  return diffMap[difficulty] || 'EASY'
}

// 更新题目
export const updateQuestion = async (questionId: string, data: any) => {
  return await request.put(`/questions/${questionId}`, data)
}

// 删除题目
export const deleteQuestion = async (questionId: string) => {
  return await request.delete(`/questions/${questionId}`)
}

// 获取题目测试用例
export const getQuestionTestCases = async (questionId: string) => {
  return await request.get(`/questions/${questionId}/testcases`)
}

// 添加测试用例
export const addQuestionTestCase = async (questionId: string, data: any) => {
  return await request.post(`/questions/${questionId}/testcases`, data)
}

// 删除测试用例
export const deleteQuestionTestCase = async (questionId: string, testCaseId: string) => {
  return await request.delete(`/questions/${questionId}/testcases/${testCaseId}`)
}
