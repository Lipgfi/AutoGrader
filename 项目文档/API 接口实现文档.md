# 📡 API 接口实现文档

## 一、已创建的 API 模块

### 1. 认证模块 (`src/api/auth.ts`)
- ✅ `POST /auth/login` - 登录
- ✅ `POST /auth/register` - 注册
- ✅ `POST /auth/logout` - 登出
- ✅ `POST /auth/refresh` - 刷新令牌
- ✅ `POST /auth/reset-password` - 重置密码

### 2. 用户管理 (`src/api/user.ts`)
- ✅ `GET /users/me` - 获取当前用户信息
- ✅ `PUT /users/me` - 更新当前用户
- ✅ `GET /users` - 获取用户列表
- ✅ `POST /users` - 创建教师账号
- ✅ `POST /users/{user_id}/deactivate` - 禁用用户

### 3. 课程管理 (`src/api/course.ts`)
- ✅ `GET /courses` - 获取课程列表
- ✅ `GET /courses/{course_id}` - 获取课程详情
- ✅ `POST /courses` - 创建课程
- ✅ `PUT /courses/{course_id}` - 更新课程
- ✅ `DELETE /courses/{course_id}` - 删除课程

### 4. 班级管理 (`src/api/class.ts`)
- ✅ `GET /classes` - 获取班级列表
- ✅ `POST /classes` - 创建班级
- ✅ `GET /classes/{class_id}/students` - 获取班级学生
- ✅ `POST /classes/{class_id}/students` - 添加学生到班级
- ✅ `POST /classes/{class_id}/students/import` - 批量导入学生
- ✅ `DELETE /classes/{class_id}/students/{student_user_id}` - 移除班级学生

### 5. 作业管理 (`src/api/assignment.ts`)
- ✅ `GET /assignments` - 获取作业列表
- ✅ `GET /assignments/{assignment_id}` - 获取作业详情
- ✅ `POST /assignments` - 创建作业
- ✅ `PUT /assignments/{assignment_id}` - 更新作业
- ✅ `POST /assignments/{assignment_id}/publish` - 发布作业

### 6. 提交管理 (`src/api/submission.ts`)
- ✅ `POST /submissions` - 创建提交
- ✅ `GET /submissions/{submission_id}` - 获取提交详情
- ✅ `PATCH /submissions/{submission_id}/result` - 更新提交结果
- ✅ `GET /submissions/my` - 获取我的提交
- ✅ `GET /submissions/assignment/{assignment_id}/all` - 获取作业全部提交
- ✅ `PATCH /submissions/{submission_id}/override` - 手动修改提交分数
- ✅ `GET /submissions/statistics/assignment/{assignment_id}` - 获取作业提交统计

### 7. 成绩管理 (`src/api/grade.ts`)
- ✅ `GET /grades/my` - 获取我的成绩
- ✅ `GET /grades/class/{class_id}` - 获取班级成绩
- ✅ `GET /grades/export/{assignment_id}` - 导出作业成绩

### 8. 题库管理 (`src/api/question.ts`)
- ✅ `GET /questions` - 获取题目列表
- ✅ `GET /questions/{question_id}` - 获取题目详情
- ✅ `POST /questions` - 创建题目
- ✅ `PUT /questions/{question_id}` - 更新题目
- ✅ `DELETE /questions/{question_id}` - 删除题目
- ✅ `POST /questions/{question_id}/testcases` - 添加测试用例
- ✅ `GET /questions/{question_id}/testcases` - 获取题目测试用例
- ✅ `DELETE /questions/{question_id}/testcases/{test_case_id}` - 删除测试用例

### 9. 学生管理 (`src/api/student.ts`)
- ✅ `POST /students/import` - 批量导入学生
- ✅ `GET /students` - 获取学生列表
- ✅ `POST /students/{user_id}/reset-password` - 重置学生密码
- ✅ `PATCH /students/{user_id}/status` - 切换学生状态

### 10. 系统管理 (`src/api/system.ts`)
- ✅ `GET /system/stats` - 获取系统统计
- ✅ `GET /system/health` - 数据库健康检查
- ✅ `GET /system/announcements` - 获取公告
- ✅ `POST /system/announcements` - 创建公告
- ✅ `PUT /system/announcements/{announcement_id}` - 更新公告
- ✅ `DELETE /system/announcements/{announcement_id}` - 删除公告
- ✅ `GET /system/logs` - 获取系统日志

---

## 二、已集成的页面

### 1. 学生课程页面 (`src/views/student/MyCourses.vue`)
- ✅ 集成 `getCourses()` API
- ✅ 页面加载时自动获取课程列表
- ✅ 支持错误处理和日志输出

### 2. 编程页面 (`src/views/student/CodingPage.vue`)
- ✅ 集成 `getQuestionDetail(questionId)` API
- ✅ 页面加载时自动获取题目详情
- ✅ 支持降级到本地 mock 数据
- ✅ 完整的错误处理

### 3. 登录页面 (`src/views/Login.vue`)
- ✅ 集成 `POST /auth/login` API
- ✅ 使用真实 API 进行登录验证

### 4. 注册页面 (`src/views/Register.vue`)
- ✅ 集成 `POST /auth/register` API
- ✅ 使用真实 API 进行注册

---

## 三、使用示例

### 获取课程列表
```typescript
import { getCourses } from '@/api/course'

const loadCourses = async () => {
  try {
    const response = await getCourses()
    if (response.code === 200 && response.data) {
      courses.value = response.data
    }
  } catch (error) {
    console.error('加载课程失败:', error)
  }
}
```

### 获取题目详情
```typescript
import { getQuestionDetail } from '@/api/question'

const loadQuestion = async () => {
  try {
    const questionId = route.params.id
    const response = await getQuestionDetail(questionId)
    
    if (response.code === 200 && response.data) {
      currentProblem.value = response.data
    }
  } catch (error) {
    console.error('加载题目失败:', error)
  }
}
```

### 创建提交
```typescript
import { createSubmission } from '@/api/submission'

const handleSubmit = async () => {
  try {
    const response = await createSubmission({
      assignmentId: assignmentId.value,
      code: code.value,
      language: selectedLanguage.value
    })
    
    if (response.code === 200) {
      ElMessage.success('提交成功')
    }
  } catch (error) {
    console.error('提交失败:', error)
  }
}
```

---

## 四、API 响应格式

所有 API 返回统一格式：
```typescript
{
  code: number,      // 状态码：200 成功，400 错误，401 未授权，500 服务器错误
  message: string,   // 响应消息
  data: any          // 响应数据
}
```

---

## 五、错误处理

所有 API 调用都包含错误处理：

1. **网络错误**: 捕获并记录到控制台
2. **401 未授权**: 自动清除登录状态并跳转到登录页
3. **403 拒绝访问**: 显示错误提示
4. **404 资源不存在**: 显示错误提示
5. **500 服务器错误**: 显示错误提示

---

## 六、下一步计划

### 1. 完善页面集成
- [ ] 教师端课程管理页面集成课程 API
- [ ] 作业管理页面集成作业 API
- [ ] 成绩页面集成成绩 API
- [ ] 班级管理页面集成班级 API

### 2. 添加更多功能
- [ ] 代码提交功能
- [ ] 实时判题功能
- [ ] 成绩统计功能
- [ ] 学生管理功能

### 3. 优化用户体验
- [ ] 添加加载状态
- [ ] 添加空状态提示
- [ ] 优化错误提示
- [ ] 添加数据缓存

---

**文档版本**: v1.0  
**更新日期**: 2026-05-11
