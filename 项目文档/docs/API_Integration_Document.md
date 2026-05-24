# AutoGrader 接口联调文档

## 1. 接口概述

本文档定义了 AutoGrader 作业代码自动评分系统的前端与后端接口规范，包括接口路径、请求方法、参数说明、返回格式等内容。

## 2. 基础配置

### 2.1 基础 URL
```
/api
```

### 2.2 请求头
```
Content-Type: application/json
Authorization: Bearer {token}  // 登录后获取的token
```

### 2.3 响应格式

所有接口返回统一格式：

```json
{
  "code": 200,           // 状态码，200表示成功
  "message": "成功",     // 提示信息
  "data": {}             // 响应数据
}
```

## 3. 接口列表

### 3.1 用户相关接口

#### 3.1.1 登录
- **路径**: `/user/login`
- **方法**: `POST`
- **参数**:
  | 字段名 | 类型 | 必选 | 说明 |
  |-------|------|------|------|
  | username | string | 是 | 用户名 |
  | password | string | 是 | 密码 |
  | role | string | 是 | 角色 (student/teacher/admin) |
- **返回数据**:
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "name": "string",
      "role": "string",
      "email": "string"
    }
  }
  ```

#### 3.1.2 获取用户信息
- **路径**: `/user/info`
- **方法**: `GET`
- **返回数据**:
  ```json
  {
    "id": "string",
    "username": "string",
    "name": "string",
    "role": "string",
    "email": "string",
    "courses": number,
    "assignments": number,
    "completed": number
  }
  ```

### 3.2 课程相关接口

#### 3.2.1 获取课程列表
- **路径**: `/courses`
- **方法**: `GET`
- **返回数据**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "teacher": "string",
      "semester": "string",
      "credits": number,
      "assignments": number,
      "completed": number
    }
  ]
  ```

#### 3.2.2 获取课程详情
- **路径**: `/courses/:id`
- **方法**: `GET`
- **返回数据**:
  ```json
  {
    "id": "string",
    "name": "string",
    "teacher": "string",
    "semester": "string",
    "credits": number,
    "description": "string",
    "assignments": [
      {
        "id": "string",
        "name": "string",
        "deadline": "string",
        "status": "string",
        "score": number
      }
    ]
  }
  ```

### 3.3 作业相关接口

#### 3.3.1 获取作业列表
- **路径**: `/assignments`
- **方法**: `GET`
- **返回数据**:
  ```json
  [
    {
      "id": "string",
      "courseId": "string",
      "courseName": "string",
      "name": "string",
      "description": "string",
      "deadline": "string",
      "status": "string",
      "score": number
    }
  ]
  ```

#### 3.3.2 获取作业详情
- **路径**: `/assignments/:id`
- **方法**: `GET`
- **返回数据**:
  ```json
  {
    "id": "string",
    "courseId": "string",
    "courseName": "string",
    "name": "string",
    "description": "string",
    "deadline": "string",
    "difficulty": "string",
    "testCases": [
      {
        "id": "string",
        "input": "string",
        "expectedOutput": "string"
      }
    ]
  }
  ```

#### 3.3.3 提交作业
- **路径**: `/assignments/:id/submit`
- **方法**: `POST`
- **参数**:
  | 字段名 | 类型 | 必选 | 说明 |
  |-------|------|------|------|
  | code | string | 是 | 代码内容 |
  | language | string | 是 | 编程语言 |
- **返回数据**:
  ```json
  {
    "id": "string",
    "status": "string",
    "message": "string"
  }
  ```

### 3.4 成绩相关接口

#### 3.4.1 获取成绩列表
- **路径**: `/grades`
- **方法**: `GET`
- **返回数据**:
  ```json
  {
    "stats": {
      "totalAssignments": number,
      "completedAssignments": number,
      "avgScore": number,
      "ranking": number
    },
    "grades": [
      {
        "id": "string",
        "courseId": "string",
        "courseName": "string",
        "assignmentName": "string",
        "deadline": "string",
        "status": "string",
        "score": number,
        "totalScore": number,
        "passRate": number,
        "submitTime": "string",
        "passedCases": number,
        "totalCases": number,
        "runtime": number,
        "ranking": number
      }
    ]
  }
  ```

#### 3.4.2 获取成绩详情
- **路径**: `/grades/:id`
- **方法**: `GET`
- **返回数据**:
  ```json
  {
    "id": "string",
    "courseId": "string",
    "courseName": "string",
    "assignmentName": "string",
    "deadline": "string",
    "status": "string",
    "score": number,
    "totalScore": number,
    "passRate": number,
    "submitTime": "string",
    "passedCases": number,
    "totalCases": number,
    "runtime": number,
    "ranking": number,
    "testCases": [
      {
        "passed": boolean,
        "input": "string",
        "expectedOutput": "string",
        "actualOutput": "string",
        "executionTime": number
      }
    ]
  }
  ```

### 3.5 学生相关接口

#### 3.5.1 获取学生列表
- **路径**: `/students`
- **方法**: `GET`
- **参数**:
  | 字段名 | 类型 | 必选 | 说明 |
  |-------|------|------|------|
  | page | number | 否 | 页码 |
  | pageSize | number | 否 | 每页条数 |
  | keyword | string | 否 | 搜索关键词 |
- **返回数据**:
  ```json
  {
    "total": number,
    "page": number,
    "pageSize": number,
    "list": [
      {
        "id": "string",
        "username": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "major": "string",
        "grade": "string",
        "status": "string"
      }
    ]
  }
  ```

#### 3.5.2 批量导入学生
- **路径**: `/students/import`
- **方法**: `POST`
- **参数**: 文件上传
- **返回数据**:
  ```json
  {
    "success": number,
    "failed": number,
    "failedList": [
      {
        "row": number,
        "reason": "string"
      }
    ]
  }
  ```

## 4. 错误码定义

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 501 | 接口未实现 |

## 5. 联调测试用例

### 5.1 登录测试
- **测试场景**: 学生登录
- **请求**: `POST /api/user/login`
  ```json
  {
    "username": "student",
    "password": "123456",
    "role": "student"
  }
  ```
- **预期响应**: 
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "student-token",
      "user": {
        "id": "S001",
        "username": "student",
        "name": "张三",
        "role": "student",
        "email": "student@example.com"
      }
    }
  }
  ```

### 5.2 获取课程列表测试
- **测试场景**: 获取学生课程列表
- **请求**: `GET /api/courses`
- **请求头**: `Authorization: Bearer student-token`
- **预期响应**: 
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": [
      {
        "id": "C001",
        "name": "数据结构与算法",
        "teacher": "李老师",
        "semester": "2026-2027秋季",
        "credits": 4,
        "assignments": 5,
        "completed": 4
      }
    ]
  }
  ```

### 5.3 提交作业测试
- **测试场景**: 提交代码作业
- **请求**: `POST /api/assignments/A001/submit`
- **请求头**: `Authorization: Bearer student-token`
- **请求体**:
  ```json
  {
    "code": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
    "language": "python"
  }
  ```
- **预期响应**: 
  ```json
  {
    "code": 200,
    "message": "提交成功",
    "data": {
      "id": "S001",
      "status": "pending",
      "message": "评测中，请稍候"
    }
  }
  ```

## 6. 注意事项

1. 所有接口都需要在请求头中携带 `Authorization`  token
2. 接口返回的 `code` 字段为 200 表示成功，其他值表示失败
3. 分页接口默认页码为 1，每页条数为 10
4. 文件上传接口需要使用 `multipart/form-data` 格式
5. 所有时间格式使用 `YYYY-MM-DD HH:mm` 格式
