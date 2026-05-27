// API 请求类型定义

// 用户相关
export interface UserLoginRequest {
  username: string
  password: string
  role?: string
}

export interface UserRegisterRequest {
  username: string
  password: string
  real_name: string
  role: string
  email: string
  phone?: string | null
  department?: string | null
  student_id?: string
  teacher_id?: string
}

export interface UserInfo {
  id: string
  username: string
  real_name: string
  role: string
  email: string
  phone?: string
  department?: string
  student_id?: string
  teacher_id?: string
}

// 课程相关
export interface CourseCreateRequest {
  courseName: string
  courseCode: string
  semester: string
  description?: string
}

export interface Course {
  id: string
  name: string
  code: string
  semester: string
  description?: string
  color?: string
  status?: string
  classCount?: number
  assignmentCount?: number
  classes?: Class[]
}

// 班级相关
export interface ClassCreateRequest {
  className: string
  classCode: string
  courseId: number
}

export interface Class {
  id: string
  name: string
  courseId: string
  classId?: number
  class_name?: string
  class_code?: string
  course_id?: number
  course_name?: string
}

// 作业相关
export interface AssignmentCreateRequest {
  title: string
  courseId: string
  classId: string
  questionId: string
  deadline: string
  description?: string
}

export interface Assignment {
  id: string
  title: string
  courseId: string
  courseName?: string
  classId: string
  className?: string
  questionId: string
  questionTitle?: string
  deadline: string
  description?: string
  status?: string
  submitRate?: number
  passRate?: number
  totalStudents?: number
  submittedCount?: number
  passedCount?: number
  avgScore?: number
}

// 题目相关
export interface QuestionCreateRequest {
  title: string
  content: string
  difficulty: number
  score: number
  status?: number
  tags?: string[]
  answer?: string
  languages?: string[]
  testCases?: TestCase[]
  options?: QuestionOption[]
  correctOption?: number
  fillBlanks?: FillBlank[]
}

export interface Question {
  id: string
  title: string
  content: string
  difficulty: number
  score: number
  status?: number
  tags?: string[]
  answer?: string
  languages?: string[]
  useCount?: number
  createTime?: string
}

export interface TestCase {
  input: string
  expectedOutput: string
  actualOutput?: string
  passed?: boolean
}

export interface QuestionOption {
  content: string
}

export interface FillBlank {
  answer: string
}

// 提交相关
export interface SubmissionCreateRequest {
  questionId: string
  code: string
  language: string
}

export interface Submission {
  id: string
  questionId: string
  code: string
  language: string
  status?: string
  score?: number
  passed?: boolean
  passedCases?: number
  totalCases?: number
  runtime?: number
  memory?: number
  ranking?: number
  testCases?: TestCase[]
  submitTime?: string
}

// 成绩相关
export interface Grade {
  id: string
  assignmentId: string
  assignmentName?: string
  questionId: string
  questionTitle?: string
  score: number
  submitTime?: string
}

// 响应类型
export interface ApiResponse<T = any> {
  code: number
  message?: string
  data?: T
}

// 分页响应
export interface PagedResponse<T = any> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
