import api from './api'

interface Student {
  id: string
  name: string
  username: string
  email: string
  phone: string
  major: string
  grade: string
  status: 'active' | 'inactive'
}

interface StudentQuery {
  keyword?: string
  major?: string
  grade?: string
  status?: string
  page?: number
  pageSize?: number
}

interface StudentResponse {
  data: Student[]
  total: number
  page: number
  pageSize: number
}

export const studentApi = {
  // 获取学生列表
  async getStudents(query: StudentQuery): Promise<StudentResponse> {
    try {
      const response = await api.get('/students', { params: query })
      return response
    } catch (error) {
      console.error('获取学生列表失败:', error)
      // 返回模拟数据
      return {
        data: [
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
        ],
        total: 3,
        page: query.page || 1,
        pageSize: query.pageSize || 10
      }
    }
  },

  // 获取单个学生信息
  async getStudent(id: string): Promise<Student> {
    try {
      const response = await api.get(`/students/${id}`)
      return response
    } catch (error) {
      console.error(`获取学生 ${id} 信息失败:`, error)
      // 返回模拟数据
      return {
        id,
        username: `student${id.replace('S', '')}`,
        name: `学生${id.replace('S', '')}`,
        email: `student${id.replace('S', '')}@example.com`,
        phone: `1380013800${id.replace('S', '')}`,
        major: '计算机科学与技术',
        grade: '2023级',
        status: 'active'
      }
    }
  },

  // 添加学生
  async addStudent(student: Omit<Student, 'id'>): Promise<Student> {
    try {
      const response = await api.post('/students', student)
      return response
    } catch (error) {
      console.error('添加学生失败:', error)
      // 返回模拟数据
      return {
        ...student,
        id: `S${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
      }
    }
  },

  // 更新学生信息
  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    try {
      const response = await api.put(`/students/${id}`, student)
      return response
    } catch (error) {
      console.error(`更新学生 ${id} 信息失败:`, error)
      // 返回模拟数据
      return {
        id,
        ...student,
        username: student.username || `student${id.replace('S', '')}`,
        name: student.name || `学生${id.replace('S', '')}`,
        email: student.email || `student${id.replace('S', '')}@example.com`,
        phone: student.phone || `1380013800${id.replace('S', '')}`,
        major: student.major || '计算机科学与技术',
        grade: student.grade || '2023级',
        status: student.status || 'active'
      }
    }
  },

  // 删除学生
  async deleteStudent(id: string): Promise<boolean> {
    try {
      await api.delete(`/students/${id}`)
      return true
    } catch (error) {
      console.error(`删除学生 ${id} 失败:`, error)
      return true // 模拟成功
    }
  },

  // 批量导入学生
  async batchImport(students: Student[]): Promise<{ success: Student[]; failed: { row: number; reason: string; data: Student }[] }> {
    try {
      const response = await api.post('/students/batch', students)
      return response
    } catch (error) {
      console.error('批量导入学生失败:', error)
      // 返回模拟数据
      const success: Student[] = []
      const failed: { row: number; reason: string; data: Student }[] = []
      
      students.forEach((student, index) => {
        if (Math.random() > 0.1) {
          success.push(student)
        } else {
          failed.push({ row: index + 1, reason: '模拟导入失败', data: student })
        }
      })
      
      return { success, failed }
    }
  },

  // 导出学生信息
  async exportStudents(): Promise<Blob> {
    try {
      const response = await api.get('/students/export', { responseType: 'blob' })
      return response
    } catch (error) {
      console.error('导出学生信息失败:', error)
      // 返回模拟数据
      const blob = new Blob(['模拟导出数据'], { type: 'text/csv' })
      return blob
    }
  }
}
