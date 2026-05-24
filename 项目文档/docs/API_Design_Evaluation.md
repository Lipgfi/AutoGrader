# AutoGrader 代码测评模块接口设计文档

## 一、概述

### 1.1 文档目的
本文档定义了AutoGrader作业自动评分系统代码测评模块的API接口规范，包括接口定义、参数说明、返回格式和异常处理。

### 1.2 接口基础信息
- **基础URL**：`/api/v1/evaluation`
- **请求格式**：JSON
- **响应格式**：JSON
- **字符编码**：UTF-8
- **认证方式**：JWT Token

### 1.3 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1705689600000
}
```

### 1.4 状态码定义

| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

## 二、异步处理流程

### 2.1 处理流程图

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  提交作业  │────►│  消息队列  │────►│  测评服务  │────►│  结果存储  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │                │                │                │
     ▼                ▼                ▼                ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ 返回任务ID │     │  任务调度  │     │  执行测评  │     │  回调通知  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### 2.2 状态流转

```
待测评 (PENDING) 
    ↓
测评中 (RUNNING)
    ↓
┌───────────────────┬───────────────────┐
│                   │                   │
▼                   ▼                   ▼
成功 (SUCCESS)    失败 (FAILED)    超时 (TIMEOUT)
```

## 三、核心接口定义

### 3.1 提交代码测评

**接口描述**：提交代码进行自动测评

**请求方式**：POST

**请求路径**：`/submit`

**请求头**：
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| submitId | Long | 是 | 作业提交ID |
| language | String | 是 | 编程语言：python/java/cpp/javascript |
| code | String | 是 | 源代码内容 |
| testCases | Array | 否 | 自定义测试用例 |
| timeout | Integer | 否 | 超时时间（秒），默认30 |
| memoryLimit | Integer | 否 | 内存限制（MB），默认256 |

**请求示例**：
```json
{
  "submitId": 1001,
  "language": "python",
  "code": "def add(a, b):\n    return a + b",
  "testCases": [
    {
      "input": "1, 2",
      "expectedOutput": "3"
    }
  ],
  "timeout": 30,
  "memoryLimit": 256
}
```

**响应参数**：

| 参数名 | 类型 | 说明 |
|-------|------|------|
| taskId | String | 测评任务ID |
| status | String | 任务状态 |
| estimatedTime | Integer | 预计完成时间（秒） |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "eval_20240120_001",
    "status": "PENDING",
    "estimatedTime": 10
  },
  "timestamp": 1705689600000
}
```

### 3.2 查询测评状态

**接口描述**：查询代码测评任务的执行状态

**请求方式**：GET

**请求路径**：`/status/{taskId}`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| taskId | String | 是 | 测评任务ID |

**响应参数**：

| 参数名 | 类型 | 说明 |
|-------|------|------|
| taskId | String | 测评任务ID |
| status | String | 任务状态：PENDING/RUNNING/SUCCESS/FAILED/TIMEOUT |
| progress | Integer | 执行进度（0-100） |
| startTime | Long | 开始时间戳 |
| endTime | Long | 结束时间戳 |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "eval_20240120_001",
    "status": "RUNNING",
    "progress": 50,
    "startTime": 1705689600000,
    "endTime": null
  },
  "timestamp": 1705689600000
}
```

### 3.3 获取测评结果

**接口描述**：获取代码测评的详细结果

**请求方式**：GET

**请求路径**：`/result/{taskId}`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| taskId | String | 是 | 测评任务ID |

**响应参数**：

| 参数名 | 类型 | 说明 |
|-------|------|------|
| taskId | String | 测评任务ID |
| submitId | Long | 作业提交ID |
| totalScore | Decimal | 总得分 |
| maxScore | Decimal | 满分 |
| passRate | Decimal | 通过率 |
| details | Array | 测评详情列表 |
| summary | Object | 测评摘要 |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "eval_20240120_001",
    "submitId": 1001,
    "totalScore": 85.5,
    "maxScore": 100,
    "passRate": 0.85,
    "details": [
      {
        "caseId": 1,
        "input": "1, 2",
        "expectedOutput": "3",
        "actualOutput": "3",
        "status": "PASSED",
        "score": 10,
        "executionTime": 5,
        "memoryUsed": 1024
      },
      {
        "caseId": 2,
        "input": "10, 20",
        "expectedOutput": "30",
        "actualOutput": "30",
        "status": "PASSED",
        "score": 10,
        "executionTime": 3,
        "memoryUsed": 1024
      }
    ],
    "summary": {
      "totalCases": 10,
      "passedCases": 8,
      "failedCases": 2,
      "avgExecutionTime": 4.5,
      "maxMemoryUsed": 2048
    }
  },
  "timestamp": 1705689600000
}
```

### 3.4 取消测评任务

**接口描述**：取消正在执行的测评任务

**请求方式**：POST

**请求路径**：`/cancel/{taskId}`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| taskId | String | 是 | 测评任务ID |

**响应参数**：

| 参数名 | 类型 | 说明 |
|-------|------|------|
| taskId | String | 测评任务ID |
| cancelled | Boolean | 是否取消成功 |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "eval_20240120_001",
    "cancelled": true
  },
  "timestamp": 1705689600000
}
```

## 四、状态回调机制

### 4.1 回调配置

**回调URL**：由客户端在提交测评时指定

**回调方式**：POST

**超时时间**：5秒

**重试策略**：失败后重试3次，间隔分别为1秒、3秒、5秒

### 4.2 回调参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| taskId | String | 测评任务ID |
| submitId | Long | 作业提交ID |
| status | String | 任务状态 |
| totalScore | Decimal | 总得分 |
| callbackTime | Long | 回调时间戳 |
| signature | String | 签名（用于验证） |

### 4.3 回调示例

```json
{
  "taskId": "eval_20240120_001",
  "submitId": 1001,
  "status": "SUCCESS",
  "totalScore": 85.5,
  "callbackTime": 1705689600000,
  "signature": "a1b2c3d4e5f6..."
}
```

### 4.4 签名验证

```
signature = MD5(taskId + submitId + status + secretKey + callbackTime)
```

## 五、异常处理场景

### 5.1 超时处理

**触发条件**：
- 代码执行时间超过设定的超时时间
- 测评任务整体执行时间超过最大限制

**处理方式**：
1. 终止代码执行进程
2. 记录超时日志
3. 返回超时状态
4. 触发超时回调

**错误响应**：
```json
{
  "code": 408,
  "message": "Evaluation timeout",
  "data": {
    "taskId": "eval_20240120_001",
    "status": "TIMEOUT",
    "timeoutSeconds": 30,
    "suggestion": "请优化代码或增加超时时间"
  },
  "timestamp": 1705689600000
}
```

### 5.2 格式错误处理

**触发条件**：
- 代码语法错误
- 不支持的编程语言
- 测试用例格式错误

**处理方式**：
1. 解析错误信息
2. 返回详细错误提示
3. 记录错误日志

**错误响应**：
```json
{
  "code": 400,
  "message": "Code format error",
  "data": {
    "taskId": "eval_20240120_001",
    "status": "FAILED",
    "errorType": "SYNTAX_ERROR",
    "errorLine": 10,
    "errorMessage": "SyntaxError: invalid syntax",
    "suggestion": "请检查第10行代码语法"
  },
  "timestamp": 1705689600000
}
```

### 5.3 内存溢出处理

**触发条件**：
- 代码执行过程中内存使用超过限制

**处理方式**：
1. 终止代码执行进程
2. 返回内存溢出错误
3. 提供优化建议

**错误响应**：
```json
{
  "code": 507,
  "message": "Memory limit exceeded",
  "data": {
    "taskId": "eval_20240120_001",
    "status": "FAILED",
    "memoryLimit": 256,
    "memoryUsed": 300,
    "suggestion": "请优化代码以减少内存使用"
  },
  "timestamp": 1705689600000
}
```

### 5.4 运行时错误处理

**触发条件**：
- 代码运行时抛出异常
- 空指针、数组越界等错误

**处理方式**：
1. 捕获异常信息
2. 返回错误堆栈
3. 记录错误日志

**错误响应**：
```json
{
  "code": 500,
  "message": "Runtime error",
  "data": {
    "taskId": "eval_20240120_001",
    "status": "FAILED",
    "errorType": "RUNTIME_ERROR",
    "errorMessage": "IndexError: list index out of range",
    "stackTrace": "File \"main.py\", line 15, in <module>\n    print(arr[10])",
    "suggestion": "请检查数组访问是否越界"
  },
  "timestamp": 1705689600000
}
```

### 5.5 安全违规处理

**触发条件**：
- 代码包含危险操作（文件操作、网络请求等）
- 代码尝试访问系统资源

**处理方式**：
1. 立即终止执行
2. 返回安全违规警告
3. 记录安全日志

**错误响应**：
```json
{
  "code": 403,
  "message": "Security violation detected",
  "data": {
    "taskId": "eval_20240120_001",
    "status": "FAILED",
    "violationType": "FILE_ACCESS",
    "description": "检测到非法文件操作",
    "suggestion": "代码中不允许进行文件操作"
  },
  "timestamp": 1705689600000
}
```

## 六、WebSocket 实时推送

### 6.1 连接建立

**WebSocket URL**：`ws://host/api/v1/evaluation/ws`

**连接参数**：

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| token | String | 是 | JWT Token |

### 6.2 消息格式

**客户端发送**：
```json
{
  "type": "subscribe",
  "taskId": "eval_20240120_001"
}
```

**服务端推送**：
```json
{
  "type": "progress",
  "taskId": "eval_20240120_001",
  "progress": 50,
  "status": "RUNNING",
  "timestamp": 1705689600000
}
```

### 6.3 消息类型

| 类型 | 说明 |
|-----|------|
| subscribe | 订阅任务 |
| unsubscribe | 取消订阅 |
| progress | 进度更新 |
| completed | 测评完成 |
| error | 错误通知 |

## 七、限流与配额

### 7.1 限流策略

| 限流维度 | 限制 | 说明 |
|---------|------|------|
| 单用户QPS | 10 | 每秒最多10次请求 |
| 单用户并发任务 | 5 | 最多5个并发测评任务 |
| 单任务执行时间 | 300秒 | 最长执行5分钟 |

### 7.2 配额管理

| 用户类型 | 每日配额 | 说明 |
|---------|---------|------|
| 学生 | 100次 | 每日最多提交100次测评 |
| 教师 | 500次 | 每日最多提交500次测评 |
| 管理员 | 无限制 | 不限制 |

## 八、Mock 数据示例

### 8.1 提交测评请求

```json
{
  "submitId": 1001,
  "language": "python",
  "code": "def solution(nums):\n    return sum(nums)",
  "testCases": [
    {"input": "[1, 2, 3]", "expectedOutput": "6"},
    {"input": "[10, 20, 30]", "expectedOutput": "60"},
    {"input": "[-1, 1]", "expectedOutput": "0"}
  ],
  "timeout": 30,
  "memoryLimit": 256,
  "callbackUrl": "https://example.com/callback"
}
```

### 8.2 测评结果响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "eval_20240120_001",
    "submitId": 1001,
    "totalScore": 100,
    "maxScore": 100,
    "passRate": 1.0,
    "details": [
      {
        "caseId": 1,
        "input": "[1, 2, 3]",
        "expectedOutput": "6",
        "actualOutput": "6",
        "status": "PASSED",
        "score": 33.33,
        "executionTime": 2,
        "memoryUsed": 512
      },
      {
        "caseId": 2,
        "input": "[10, 20, 30]",
        "expectedOutput": "60",
        "actualOutput": "60",
        "status": "PASSED",
        "score": 33.33,
        "executionTime": 1,
        "memoryUsed": 512
      },
      {
        "caseId": 3,
        "input": "[-1, 1]",
        "expectedOutput": "0",
        "actualOutput": "0",
        "status": "PASSED",
        "score": 33.34,
        "executionTime": 1,
        "memoryUsed": 512
      }
    ],
    "summary": {
      "totalCases": 3,
      "passedCases": 3,
      "failedCases": 0,
      "avgExecutionTime": 1.33,
      "maxMemoryUsed": 512
    }
  },
  "timestamp": 1705689600000
}
```

---

**版本历史**
- V1.0 (2024-01-01)：初始版本
- V1.1 (2024-01-20)：明确异步处理流程及状态回调机制，补充异常处理场景