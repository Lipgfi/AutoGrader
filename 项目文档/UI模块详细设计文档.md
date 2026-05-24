# AutoGrader UI模块详细设计文档

## 一、功能各模块的详细设计

### 1.1 学生端模块（Student Portal）

#### 1.1.1 注册登录模块

**功能描述**：提供学生注册和登录功能，支持身份验证和账号安全

**组件结构**：
```
Login.vue (登录页面)
├── 角色选择器（学生/教师/管理员）
├── 登录表单
│   ├── 用户名输入框
│   ├── 密码输入框
│   ├── 验证码组件
│   └── 记住密码选项
└── 注册链接

Register.vue (注册页面)
├── 注册表单
│   ├── 用户名输入（4-20位字母数字）
│   ├── 密码输入（≥8位，含字母+数字）
│   ├── 确认密码
│   ├── 真实姓名
│   ├── 学号（唯一标识）
│   ├── 邮箱（唯一，用于找回密码）
│   └── 手机号（可选）
└── 登录链接
```

**核心功能点**：
- 支持用户名或邮箱登录
- 验证码安全验证
- 记住密码功能（7天Token有效期）
- 忘记密码功能（邮箱验证码重置）
- 表单验证（用户名唯一性、密码强度、邮箱格式）
- 注册后自动跳转到课程列表

#### 1.1.2 个人信息模块

**功能描述**：学生查看和管理个人信息

**组件结构**：
```
Profile.vue (个人信息页面)
├── 用户信息卡片
│   ├── 头像显示和上传
│   ├── 基本信息显示（只读）
│   │   ├── 用户名
│   │   ├── 学号
│   │   ├── 真实姓名
│   │   └── 角色
│   └── 可编辑信息
│       ├── 邮箱（需验证）
│       ├── 手机号
│       └── 密码修改
├── 班级信息卡片
│   ├── 所在班级列表
│   └── 加入时间
└── 账号安全设置
    ├── 修改密码
    └── 绑定手机号
```

**核心功能点**：
- 头像上传和预览
- 邮箱修改（需邮箱验证）
- 手机号修改
- 密码修改（需输入旧密码验证）
- 查看所在班级信息
- 账号安全设置

#### 1.1.3 课程管理模块

**功能描述**：学生查看和管理自己的课程

**组件结构**：
```
MyCourses.vue (我的课程页面)
├── 页面头部
│   ├── 标题和描述
│   └── 搜索框（搜索课程名称或教师）
├── 筛选栏
│   ├── 学期选择器
│   ├── 课程状态筛选
│   └── 视图切换（卡片/列表）
└── 课程内容区
    ├── 卡片视图
    │   └── 课程卡片数组
    │       ├── 课程信息（名称、编号、教师、班级、学期）
    │       ├── 作业统计（总数、已完成、待完成）
    │       ├── 进度条
    │       └── 待完成提醒
    └── 列表视图
        └── 课程表格
            ├── 课程信息列
            ├── 进度列
            ├── 待完成列
            └── 操作列

CourseDetail.vue (课程详情页面)
├── 课程基本信息
│   ├── 课程名称、编号
│   ├── 授课教师
│   ├── 学期、学分
│   └── 课程描述
├── 课程公告区
│   └── 公告列表
├── 作业列表区
│   └── 作业卡片数组
│       ├── 作业标题
│       ├── 截止时间
│       ├── 完成状态
│       ├── 我的得分
│       └── 操作按钮（开始答题/查看详情）
└── 班级成员区
    └── 同班同学列表（姓名，不显示成绩）
```

**核心功能点**：
- 课程搜索功能
- 学期筛选功能
- 课程状态筛选（进行中/已结束）
- 卡片/列表视图切换
- 查看课程详情
- 查看课程公告
- 查看作业列表
- 查看班级成员
- 作业进度统计

#### 1.1.4 在线编程模块

**功能描述**：学生在线编写和提交代码，查看评测结果

**组件结构**：
```
CodingPage.vue (在线编程页面)
├── 编程头部
│   ├── 返回按钮
│   ├── 题目标题和难度标签
│   ├── 语言选择器（Python/Java/C++/JavaScript）
│   └── 历史记录按钮
├── 编程主区域
│   ├── 左侧题目面板
│   │   ├── 面板标签（题目描述/测试用例）
│   │   ├── 题目描述内容
│   │   │   ├── 题目标题和标签
│   │   │   ├── 题目描述
│   │   │   ├── 输入输出格式
│   │   │   ├── 示例输入输出
│   │   │   └── 约束条件
│   │   ├── 测试用例内容
│   │   │   ├── 用例选择器
│   │   │   ├── 输入数据
│   │   │   └── 期望输出
│   │   └── 面板调整手柄
│   └── 右侧代码编辑器
│       ├── 编辑器头部
│       │   ├── 编辑器标题
│       │   ├── 重置按钮
│       │   └── 保存草稿按钮
│       ├── 代码编辑区域
│       │   ├── 行号显示
│       │   └── 代码输入框
│       └── 编辑器底部
│           ├── 代码信息（行数、字符数）
│           └── 提交按钮
├── 历史记录抽屉
│   └── 提交历史卡片列表
│       ├── 提交时间
│       ├── 通过状态
│       ├── 得分
│       ├── 语言
│       └── 运行时间
└── 评测结果对话框
    ├── 结果头部
    │   ├── 通过状态图标
    │   └── 得分圆环
    ├── 结果统计
    │   ├── 通过用例数
    │   ├── 运行时间
    │   ├── 内存消耗
    │   └── 排名
    ├── 测试用例详情
    │   └── 用例列表
    │       ├── 用例状态
    │       ├── 输入数据
    │       ├── 期望输出
    │       └── 实际输出
    └── 操作按钮（关闭/重新提交）
```

**核心功能点**：
- 多语言支持（Python/Java/C++/JavaScript）
- 代码编辑器（语法高亮、行号显示）
- 题目描述展示（Markdown渲染）
- 测试用例查看
- 代码模板自动生成
- 代码自动保存（本地存储）
- 提交历史记录查看
- 实时评测结果展示
- 面板宽度调整
- 代码重置功能
- 草稿保存功能

#### 1.1.5 成绩管理模块

**功能描述**：学生查看自己的成绩和排名

**组件结构**：
```
Grades.vue (成绩总览页面)
├── 页面头部
│   ├── 标题和描述
│   └── 筛选器（按课程/按作业）
├── 成绩统计卡片
│   ├── 总作业数
│   ├── 已完成作业数
│   ├── 平均分
│   └── 班级排名
├── 成绩内容区
│   ├── 按课程视图
│   │   └── 课程成绩卡片
│   │       ├── 课程信息
│   │       ├── 作业得分列表
│   │       ├── 课程总分
│   │       └── 班级排名
│   └── 按作业视图
│       └── 作业成绩表格
│           ├── 作业信息
│           ├── 得分
│           ├── 班级排名
│           └── 操作按钮（查看详情）
└── 成绩详情对话框
    ├── 总体评价
    ├── 得分信息
    ├── 静态问题提示
    └── 各用例详情
        ├── 用例编号
        ├── 通过状态
        ├── 期望输出
        ├── 实际输出
        ├── 运行时间
        └── 错误信息
```

**核心功能点**：
- 成绩统计概览
- 按课程查看成绩
- 按作业查看成绩
- 班级排名显示
- 成绩详情查看
- 测试用例结果展示
- 静态代码问题提示

### 1.2 教师端模块（Teacher Portal）

#### 1.2.1 课程管理模块

**功能描述**：教师创建和管理课程

**组件结构**：
```
CourseManagement.vue (课程管理页面)
├── 页面头部
│   ├── 标题和描述
│   ├── 搜索框
│   └── 新建课程按钮
├── 课程列表区
│   └── 课程卡片数组
│       ├── 课程基本信息
│       │   ├── 课程名称
│       │   ├── 课程编号
│       │   ├── 学期
│       │   └── 学分
│       ├── 课程统计
│       │   ├── 班级数
│       │   ├── 学生总数
│       │   └── 作业数
│       └── 操作按钮
│           ├── 编辑课程
│           ├── 管理班级
│           └── 删除课程
└── 新建/编辑课程对话框
    ├── 课程基本信息表单
    │   ├── 课程名称
    │   ├── 课程编号
    │   ├── 学期
    │   └── 课程简介
    └── 操作按钮（保存/取消）
```

**核心功能点**：
- 课程列表展示
- 新建课程
- 编辑课程信息
- 删除课程
- 课程搜索功能
- 课程统计信息显示

#### 1.2.2 班级管理模块

**功能描述**：教师管理课程下的班级和学生

**组件结构**：
```
ClassManagement.vue (班级管理页面)
├── 页面头部
│   ├── 课程信息
│   ├── 新建班级按钮
│   └── 导入学生按钮
├── 班级列表区
│   └── 班级卡片数组
│       ├── 班级基本信息
│       │   ├── 班级名称
│       │   ├── 课序号
│       │   └── 学生人数
│       ├── 班级统计
│       │   ├── 平均分
│       │   ├── 最高分
│       │   └── 最低分
│       └── 操作按钮
│           ├── 查看学生
│           ├── 添加学生
│           └── 删除班级
└── 学生管理对话框
    ├── 学生列表
    │   ├── 学生信息
    │   ├── 成绩统计
    │   └── 操作按钮
    ├── 添加学生功能
    │   ├── 搜索学生
    │   └── 添加到班级
    └── 导入学生功能
        ├── 文件上传
        ├── 数据预览
        └── 导入结果
```

**核心功能点**：
- 班级列表展示
- 新建班级
- 编辑班级信息
- 删除班级
- 学生列表查看
- 添加学生（单个/批量）
- 移除学生
- 批量导入学生
- 班级成绩统计

#### 1.2.3 作业管理模块

**功能描述**：教师创建和管理作业

**组件结构**：
```
AssignmentManagement.vue (作业管理页面)
├── 页面头部
│   ├── 课程选择器
│   ├── 筛选器（状态/截止时间）
│   └── 新建作业按钮
├── 作业列表区
│   └── 作业卡片数组
│       ├── 作业基本信息
│       │   ├── 作业标题
│       │   ├── 关联题目
│       │   ├── 截止时间
│       │   └── 发布状态
│       ├── 作业统计
│       │   ├── 提交人数
│       │   ├── 总人数
│       │   └── 通过率
│       └── 操作按钮
│           ├── 编辑作业
│           ├── 查看提交
│           ├── 导出成绩
│           └── 删除作业
└── 新建/编辑作业对话框
    ├── 作业基本信息表单
    │   ├── 作业标题
    │   ├── 作业说明
    │   ├── 选择班级（可多选）
    │   ├── 选择题目
    │   ├── 截止时间
    │   ├── 发布状态（草稿/立即发布）
    │   └── 允许重复提交
    └── 操作按钮（保存/取消）
```

**核心功能点**：
- 作业列表展示
- 新建作业
- 编辑作业信息
- 删除作业
- 作业发布管理
- 作业统计信息
- 查看学生提交
- 导出成绩表
- 作业筛选功能

#### 1.2.4 题库管理模块

**功能描述**：教师创建和管理题目

**组件结构**：
```
QuestionBank.vue (题库管理页面)
├── 页面头部
│   ├── 标题和描述
│   ├── 筛选器（题型/难度/课程）
│   └── 新建题目按钮
├── 题目列表区
│   └── 题目卡片数组
│       ├── 题目基本信息
│       │   ├── 题目标题
│       │   ├── 题型标签
│       │   ├── 难度标签
│       │   └── 语言标签
│       ├── 题目统计
│       │   ├── 测试用例数
│       │   └── 使用次数
│       └── 操作按钮
│           ├── 编辑题目
│           ├── 验证答案
│           ├── 复制题目
│           └── 删除题目
└── 新建/编辑题目对话框
    ├── 题目基本信息表单
    │   ├── 题目标题
    │   ├── 题干描述（Markdown编辑器）
    │   ├── 题型选择（CLI/文件/接口）
    │   ├── 难度选择（简单/中等/困难）
    │   ├── 时间限制
    │   ├── 内存限制
    │   └── 目标语言
    ├── 题型专用配置
    │   ├── CLI题：无额外配置
    │   ├── 文件题：输入文件名、输出文件名
    │   └── 接口题：函数名、准备代码
    ├── 测试用例管理
    │   ├── 用例列表
    │   ├── 添加用例
    │   ├── 编辑用例
    │   └── 删除用例
    ├── 标准答案代码
    │   ├── 代码编辑器
    │   └── 验证答案按钮
    └── 操作按钮（保存/取消）
```

**核心功能点**：
- 题目列表展示
- 新建题目
- 编辑题目信息
- 删除题目
- 复制题目
- 题目筛选功能
- 多题型支持（CLI/文件/接口）
- 测试用例管理
- 标准答案验证
- Markdown题干编辑

#### 1.2.5 成绩管理模块

**功能描述**：教师查看和管理学生成绩

**组件结构**：
```
GradeManagement.vue (成绩管理页面)
├── 页面头部
│   ├── 课程选择器
│   ├── 班级选择器
│   ├── 作业选择器
│   └── 导出成绩按钮
├── 成绩统计卡片
│   ├── 平均分
│   ├── 最高分
│   ├── 最低分
│   └── 通过率
├── 成绩表格区
│   └── 学生成绩表格
│       ├── 学生信息列
│       ├── 作业得分列
│       ├── 总分列
│       ├── 排名列
│       └── 操作列（查看详情/修改分数）
└── 成绩详情对话框
    ├── 学生基本信息
    ├── 提交历史
    │   └── 提交记录列表
    │       ├── 提交时间
    │       ├── 代码预览
    │       ├── 评测结果
    │       └── 得分
    └── 手动调整分数
        ├── 调整原因
        ├── 调整分数
        └── 操作按钮（确认/取消）
```

**核心功能点**：
- 成绩统计概览
- 学生成绩列表
- 按课程/班级/作业筛选
- 查看学生提交历史
- 查看代码详情
- 查看评测结果
- 手动调整分数
- 导出成绩表

### 1.3 管理员端模块（Admin Portal）

#### 1.3.1 用户管理模块

**功能描述**：管理员管理系统用户

**组件结构**：
```
UserManagement.vue (用户管理页面)
├── 页面头部
│   ├── 标题和描述
│   ├── 用户类型标签（教师/学生）
│   ├── 搜索框
│   └── 新建用户按钮
├── 用户列表区
│   └── 用户表格
│       ├── 用户基本信息
│       ├── 账号状态
│       ├── 创建时间
│       └── 操作按钮
│           ├── 编辑用户
│           ├── 重置密码
│           ├── 停用/恢复账号
│           └── 删除用户
├── 新建/编辑用户对话框
    ├── 用户基本信息表单
    │   ├── 用户类型（教师/学生）
    │   ├── 工号/学号
    │   ├── 真实姓名
    │   ├── 邮箱
    │   ├── 院系（教师）
    │   ├── 初始密码
    │   └── 账号状态
    └── 操作按钮（保存/取消）
└── 重置密码对话框
    ├── 用户信息显示
    ├── 新密码输入
    └── 操作按钮（确认/取消）
```

**核心功能点**：
- 用户列表展示
- 新建用户（教师/学生）
- 编辑用户信息
- 删除用户
- 重置用户密码
- 停用/恢复账号
- 用户搜索功能
- 用户类型筛选

#### 1.3.2 学生信息管理模块

**功能描述**：管理员批量导入和管理学生信息

**组件结构**：
```
StudentManagement.vue (学生信息管理页面)
├── 页面头部
│   ├── 标题和描述
│   ├── 搜索框
│   └── 批量导入按钮
├── 学生列表区
│   └── 学生表格
│       ├── 学生基本信息
│       ├── 所在班级
│       ├── 注册时间
│       └── 操作按钮
│           ├── 编辑信息
│           ├── 修改班级
│           └── 停用账号
├── 批量导入对话框
    ├── 文件上传
    │   ├── 拖拽上传区
    │   ├── 文件选择按钮
    │   └── 支持格式（PDF/XLSX）
    ├── 数据预览
    │   └── 导入数据表格
    │       ├── 真实姓名
    │       ├── 学号
    │       ├── 课程编号
    │       ├── 课序号
    │       └── 邮箱
    ├── 导入设置
    │   ├── 自动创建账号
    │   ├── 初始密码设置
    │   └── 发送邮件通知
    └── 导入结果
        ├── 成功数量
        ├── 失败数量
        └── 失败详情
└── 编辑学生信息对话框
    ├── 学生基本信息表单
    │   ├── 学号
    │   ├── 真实姓名
    │   ├── 邮箱
    │   ├── 手机号
    │   └── 账号状态
    └── 操作按钮（保存/取消）
```

**核心功能点**：
- 学生列表展示
- 批量导入学生
- 编辑学生信息
- 修改学生班级
- 停用学生账号
- 导入数据预览
- 导入结果展示
- 学生搜索功能

#### 1.3.3 系统设置模块

**功能描述**：管理员配置系统参数和查看系统状态

**组件结构**：
```
SystemSettings.vue (系统设置页面)
├── 页面头部
│   └── 标题和描述
├── 系统统计卡片
│   ├── 总用户数
│   ├── 总课程数
│   ├── 总提交数
│   └── 系统运行时间
├── 系统配置区
│   ├── 基本设置
│   │   ├── 系统名称
│   │   ├── 系统描述
│   │   └── 联系邮箱
│   ├── 安全设置
│   │   ├── 密码策略
│   │   ├── Token有效期
│   │   └── 验证码设置
│   └── 功能开关
│       ├── 注册功能
│       ├── 批量导入功能
│       └── 邮件通知功能
├── 系统监控区
│   ├── 模块状态监控
│   │   ├── B-2 评测服务状态
│   │   ├── B-3 题库服务状态
│   │   └── B-4 统计服务状态
│   └── 系统日志
│       └── 日志列表
│           ├── 操作时间
│           ├── 操作用户
│           ├── 操作类型
│           └── 操作详情
└── 操作按钮（保存设置/刷新状态）
```

**核心功能点**：
- 系统统计信息
- 系统参数配置
- 安全策略设置
- 功能开关管理
- 模块状态监控
- 系统日志查看
- 配置保存功能

## 二、功能点与需求项的覆盖关系

### 2.1 学生端功能覆盖表

| 功能模块 | 功能点 | 需求项 | 覆盖状态 |
|---------|--------|--------|----------|
| 注册登录 | 用户注册 | 学生可以自行注册 | ✅ 完全覆盖 |
| 注册登录 | 用户登录 | 支持用户名/邮箱登录 | ✅ 完全覆盖 |
| 注册登录 | 验证码验证 | 图形验证码安全验证 | ✅ 完全覆盖 |
| 注册登录 | 记住密码 | 7天Token有效期 | ✅ 完全覆盖 |
| 注册登录 | 忘记密码 | 邮箱验证码重置 | ✅ 完全覆盖 |
| 个人信息 | 查看个人信息 | 显示所有个人信息 | ✅ 完全覆盖 |
| 个人信息 | 修改邮箱 | 邮箱修改需验证 | ✅ 完全覆盖 |
| 个人信息 | 修改手机号 | 手机号修改 | ✅ 完全覆盖 |
| 个人信息 | 修改密码 | 需输入旧密码验证 | ✅ 完全覆盖 |
| 个人信息 | 上传头像 | 头像上传和预览 | ✅ 完全覆盖 |
| 个人信息 | 查看班级 | 显示所在班级列表 | ✅ 完全覆盖 |
| 课程管理 | 查看课程列表 | 显示所有课程 | ✅ 完全覆盖 |
| 课程管理 | 课程搜索 | 搜索课程名称或教师 | ✅ 完全覆盖 |
| 课程管理 | 学期筛选 | 按学期筛选课程 | ✅ 完全覆盖 |
| 课程管理 | 状态筛选 | 按课程状态筛选 | ✅ 完全覆盖 |
| 课程管理 | 视图切换 | 卡片/列表视图切换 | ✅ 完全覆盖 |
| 课程管理 | 查看课程详情 | 查看课程详细信息 | ✅ 完全覆盖 |
| 课程管理 | 查看课程公告 | 查看教师发布的公告 | ✅ 完全覆盖 |
| 课程管理 | 查看作业列表 | 查看课程下所有作业 | ✅ 完全覆盖 |
| 课程管理 | 查看班级成员 | 查看同班同学 | ✅ 完全覆盖 |
| 在线编程 | 多语言支持 | Python/Java/C++/JS | ✅ 完全覆盖 |
| 在线编程 | 代码编辑器 | 语法高亮、行号显示 | ✅ 完全覆盖 |
| 在线编程 | 题目描述 | Markdown渲染 | ✅ 完全覆盖 |
| 在线编程 | 测试用例 | 查看测试用例 | ✅ 完全覆盖 |
| 在线编程 | 代码模板 | 自动生成模板 | ✅ 完全覆盖 |
| 在线编程 | 代码保存 | 本地存储自动保存 | ✅ 完全覆盖 |
| 在线编程 | 提交历史 | 查看历史提交记录 | ✅ 完全覆盖 |
| 在线编程 | 评测结果 | 实时显示评测结果 | ✅ 完全覆盖 |
| 在线编程 | 面板调整 | 调整面板宽度 | ✅ 完全覆盖 |
| 在线编程 | 代码重置 | 重置为模板代码 | ✅ 完全覆盖 |
| 在线编程 | 草稿保存 | 手动保存草稿 | ✅ 完全覆盖 |
| 成绩管理 | 成绩统计 | 总作业数、已完成、平均分、排名 | ✅ 完全覆盖 |
| 成绩管理 | 按课程查看 | 查看各课程成绩 | ✅ 完全覆盖 |
| 成绩管理 | 按作业查看 | 查看各作业成绩 | ✅ 完全覆盖 |
| 成绩管理 | 班级排名 | 显示班级排名 | ✅ 完全覆盖 |
| 成绩管理 | 成绩详情 | 查看详细评测结果 | ✅ 完全覆盖 |
| 成绩管理 | 用例详情 | 查看各测试用例结果 | ✅ 完全覆盖 |
| 成绩管理 | 静态问题 | 显示静态代码问题 | ✅ 完全覆盖 |

### 2.2 教师端功能覆盖表

| 功能模块 | 功能点 | 需求项 | 覆盖状态 |
|---------|--------|--------|----------|
| 课程管理 | 查看课程列表 | 显示所有课程 | ✅ 完全覆盖 |
| 课程管理 | 新建课程 | 创建新课程 | ✅ 完全覆盖 |
| 课程管理 | 编辑课程 | 修改课程信息 | ✅ 完全覆盖 |
| 课程管理 | 删除课程 | 删除课程 | ✅ 完全覆盖 |
| 课程管理 | 课程搜索 | 搜索课程 | ✅ 完全覆盖 |
| 班级管理 | 查看班级列表 | 显示所有班级 | ✅ 完全覆盖 |
| 班级管理 | 新建班级 | 创建新班级 | ✅ 完全覆盖 |
| 班级管理 | 编辑班级 | 修改班级信息 | ✅ 完全覆盖 |
| 班级管理 | 删除班级 | 删除班级 | ✅ 完全覆盖 |
| 班级管理 | 查看学生 | 查看班级学生列表 | ✅ 完全覆盖 |
| 班级管理 | 添加学生 | 单个/批量添加学生 | ✅ 完全覆盖 |
| 班级管理 | 移除学生 | 从班级移除学生 | ✅ 完全覆盖 |
| 班级管理 | 批量导入 | 导入学生名单 | ✅ 完全覆盖 |
| 班级管理 | 成绩统计 | 班级平均分、最高分、最低分 | ✅ 完全覆盖 |
| 作业管理 | 查看作业列表 | 显示所有作业 | ✅ 完全覆盖 |
| 作业管理 | 新建作业 | 创建新作业 | ✅ 完全覆盖 |
| 作业管理 | 编辑作业 | 修改作业信息 | ✅ 完全覆盖 |
| 作业管理 | 删除作业 | 删除作业 | ✅ 完全覆盖 |
| 作业管理 | 作业发布 | 草稿/立即发布 | ✅ 完全覆盖 |
| 作业管理 | 关联题目 | 从题库选择题目 | ✅ 完全覆盖 |
| 作业管理 | 作业筛选 | 按状态/截止时间筛选 | ✅ 完全覆盖 |
| 作业管理 | 查看提交 | 查看学生提交情况 | ✅ 完全覆盖 |
| 作业管理 | 导出成绩 | 导出成绩表 | ✅ 完全覆盖 |
| 题库管理 | 查看题目列表 | 显示所有题目 | ✅ 完全覆盖 |
| 题库管理 | 新建题目 | 创建新题目 | ✅ 完全覆盖 |
| 题库管理 | 编辑题目 | 修改题目信息 | ✅ 完全覆盖 |
| 题库管理 | 删除题目 | 删除题目 | ✅ 完全覆盖 |
| 题库管理 | 复制题目 | 复制现有题目 | ✅ 完全覆盖 |
| 题库管理 | 题目筛选 | 按题型/难度/课程筛选 | ✅ 完全覆盖 |
| 题库管理 | 多题型支持 | CLI/文件/接口题型 | ✅ 完全覆盖 |
| 题库管理 | 测试用例管理 | 添加/编辑/删除测试用例 | ✅ 完全覆盖 |
| 题库管理 | 标准答案验证 | 验证标准答案 | ✅ 完全覆盖 |
| 题库管理 | Markdown编辑 | Markdown题干编辑 | ✅ 完全覆盖 |
| 成绩管理 | 成绩统计 | 平均分、最高分、最低分、通过率 | ✅ 完全覆盖 |
| 成绩管理 | 成绩列表 | 显示学生成绩 | ✅ 完全覆盖 |
| 成绩管理 | 成绩筛选 | 按课程/班级/作业筛选 | ✅ 完全覆盖 |
| 成绩管理 | 提交历史 | 查看学生提交历史 | ✅ 完全覆盖 |
| 成绩管理 | 代码详情 | 查看提交代码 | ✅ 完全覆盖 |
| 成绩管理 | 评测结果 | 查看评测结果 | ✅ 完全覆盖 |
| 成绩管理 | 调整分数 | 手动调整分数 | ✅ 完全覆盖 |
| 成绩管理 | 导出成绩 | 导出成绩表 | ✅ 完全覆盖 |

### 2.3 管理员端功能覆盖表

| 功能模块 | 功能点 | 需求项 | 覆盖状态 |
|---------|--------|--------|----------|
| 用户管理 | 查看用户列表 | 显示所有用户 | ✅ 完全覆盖 |
| 用户管理 | 新建用户 | 创建教师/学生账号 | ✅ 完全覆盖 |
| 用户管理 | 编辑用户 | 修改用户信息 | ✅ 完全覆盖 |
| 用户管理 | 删除用户 | 删除用户 | ✅ 完全覆盖 |
| 用户管理 | 重置密码 | 重置用户密码 | ✅ 完全覆盖 |
| 用户管理 | 停用账号 | 停用/恢复账号 | ✅ 完全覆盖 |
| 用户管理 | 用户搜索 | 搜索用户 | ✅ 完全覆盖 |
| 学生管理 | 查看学生列表 | 显示所有学生 | ✅ 完全覆盖 |
| 学生管理 | 批量导入 | 批量导入学生 | ✅ 完全覆盖 |
| 学生管理 | 编辑信息 | 修改学生信息 | ✅ 完全覆盖 |
| 学生管理 | 修改班级 | 修改学生班级 | ✅ 完全覆盖 |
| 学生管理 | 停用账号 | 停用学生账号 | ✅ 完全覆盖 |
| 学生管理 | 数据预览 | 预览导入数据 | ✅ 完全覆盖 |
| 学生管理 | 导入结果 | 显示导入结果 | ✅ 完全覆盖 |
| 系统设置 | 系统统计 | 显示系统统计信息 | ✅ 完全覆盖 |
| 系统设置 | 基本设置 | 配置系统基本参数 | ✅ 完全覆盖 |
| 系统设置 | 安全设置 | 配置安全策略 | ✅ 完全覆盖 |
| 系统设置 | 功能开关 | 管理功能开关 | ✅ 完全覆盖 |
| 系统设置 | 模块监控 | 监控各模块状态 | ✅ 完全覆盖 |
| 系统设置 | 系统日志 | 查看系统日志 | ✅ 完全覆盖 |

## 三、模块之间的接口设计

### 3.1 前端组件间接口

#### 3.1.1 路由接口

```typescript
// 路由配置接口
interface RouteConfig {
  path: string
  name: string
  component: Component
  meta?: {
    title?: string
    role?: 'student' | 'teacher' | 'admin'
    requiresAuth?: boolean
  }
}

// 路由参数接口
interface RouteParams {
  id?: string
  courseId?: string
  assignmentId?: string
  questionId?: string
}
```

#### 3.1.2 组件通信接口

```typescript
// 父子组件通信接口
interface ParentChildProps {
  data: any
  onUpdate: (newData: any) => void
  onDelete: (id: string) => void
}

// 事件总线接口
interface EventBusEvents {
  'user-login': (user: UserInfo) => void
  'user-logout': () => void
  'course-update': (course: CourseInfo) => void
  'assignment-update': (assignment: AssignmentInfo) => void
}
```

#### 3.1.3 状态管理接口

```typescript
// 用户状态接口
interface UserState {
  currentUser: UserInfo | null
  token: string | null
  isAuthenticated: boolean
}

// 应用状态接口
interface AppState {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  sidebarCollapsed: boolean
}
```

### 3.2 前后端接口

#### 3.2.1 API响应接口

```typescript
// 通用API响应接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页响应接口
interface PaginatedResponse<T> {
  total: number
  page: number
  pageSize: number
  list: T[]
}
```

#### 3.2.2 用户相关接口

```typescript
// 登录请求接口
interface LoginRequest {
  username: string
  password: string
  role: 'student' | 'teacher' | 'admin'
}

// 登录响应接口
interface LoginResponse {
  token: string
  user: UserInfo
}

// 用户信息接口
interface UserInfo {
  id: string
  username: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  email: string
  phone?: string
  avatar?: string
  courses?: number
  assignments?: number
  completed?: number
}

// 注册请求接口
interface RegisterRequest {
  username: string
  password: string
  confirmPassword: string
  realName: string
  studentId: string
  email: string
  phone?: string
}
```

#### 3.2.3 课程相关接口

```typescript
// 课程信息接口
interface CourseInfo {
  id: string
  courseCode: string
  courseName: string
  teacher: string
  teacherId: string
  semester: string
  credits: number
  description?: string
  totalAssignments: number
  completedAssignments: number
  pendingAssignments: number
  progress: number
  color?: string
}

// 课程详情接口
interface CourseDetail extends CourseInfo {
  announcements: Announcement[]
  assignments: AssignmentInfo[]
  students: StudentInfo[]
}
```

#### 3.2.4 作业相关接口

```typescript
// 作业信息接口
interface AssignmentInfo {
  id: string
  courseId: string
  courseName: string
  title: string
  description?: string
  questionId: string
  questionTitle: string
  dueDate: string
  status: 'pending' | 'completed' | 'expired'
  score?: number
  totalScore: number
}

// 作业详情接口
interface AssignmentDetail extends AssignmentInfo {
  question: QuestionInfo
  submissions: SubmissionInfo[]
}
```

#### 3.2.5 题目相关接口

```typescript
// 题目信息接口
interface QuestionInfo {
  id: string
  title: string
  description: string
  questionType: 'cli' | 'file' | 'interface'
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  timeLimit: number
  memoryLimit: number
  language: string
  testCases: TestCase[]
  standardAnswer?: string
}

// 测试用例接口
interface TestCase {
  id: string
  input: string
  expectedOutput: string
  score: number
}
```

#### 3.2.6 提交相关接口

```typescript
// 提交信息接口
interface SubmissionInfo {
  id: string
  studentId: string
  studentName: string
  assignmentId: string
  assignmentTitle: string
  code: string
  language: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  score?: number
  totalScore: number
  passRate?: number
  runtime?: number
  submitTime: string
  completedTime?: string
}

// 评测结果接口
interface EvaluationResult {
  id: string
  passed: boolean
  score: number
  passedCases: number
  totalCases: number
  runtime: number
  memory: number
  ranking: number
  testCases: TestCaseResult[]
}

// 测试用例结果接口
interface TestCaseResult {
  passed: boolean
  input: string
  expectedOutput: string
  actualOutput: string
  executionTime: number
}
```

#### 3.2.7 成绩相关接口

```typescript
// 成绩统计接口
interface GradeStats {
  totalAssignments: number
  completedAssignments: number
  avgScore: number
  ranking: number
}

// 成绩信息接口
interface GradeInfo {
  id: string
  courseId: string
  courseName: string
  assignmentId: string
  assignmentName: string
  studentId: string
  studentName: string
  score?: number
  totalScore: number
  passRate?: number
  submitTime?: string
  passedCases?: number
  totalCases?: number
  runtime?: number
  ranking?: number
}

// 成绩详情接口
interface GradeDetail extends GradeInfo {
  testCases: TestCaseResult[]
  staticIssues?: string[]
}
```

### 3.3 数据流设计

#### 3.3.1 用户认证流程

```
用户登录 → 前端表单验证 → API请求登录 → 后端验证 → 返回Token → 存储Token → 跳转到对应页面
```

#### 3.3.2 代码提交流程

```
编写代码 → 点击提交 → 前端验证 → API提交代码 → 后端创建提交记录 → 异步评测 → 轮询/WebSocket获取结果 → 显示评测结果
```

#### 3.3.3 数据同步流程

```
用户操作 → 更新前端状态 → API请求更新 → 后端处理 → 返回更新结果 → 更新前端状态 → 刷新相关页面
```

## 四、数据库设计

### 4.1 数据库表结构

#### 4.1.1 用户表 (users)

```sql
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    real_name VARCHAR(50) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email),
    INDEX idx_username (username)
);
```

#### 4.1.2 学生扩展表 (students)

```sql
CREATE TABLE students (
    user_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_password_changed BOOLEAN DEFAULT FALSE,
    major VARCHAR(50),
    grade VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
);
```

#### 4.1.3 教师扩展表 (teachers)

```sql
CREATE TABLE teachers (
    user_id VARCHAR(36) PRIMARY KEY,
    teacher_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_teacher_id (teacher_id)
);
```

#### 4.1.4 课程表 (courses)

```sql
CREATE TABLE courses (
    course_id VARCHAR(36) PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    teacher_id VARCHAR(36) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    credits INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_course_semester (course_code, semester),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_semester (semester)
);
```

#### 4.1.5 班级表 (classes)

```sql
CREATE TABLE classes (
    class_id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    class_code VARCHAR(10) NOT NULL,
    teacher_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_course_class (course_id, class_code),
    INDEX idx_course_id (course_id),
    INDEX idx_teacher_id (teacher_id)
);
```

#### 4.1.6 学生班级关联表 (class_students)

```sql
CREATE TABLE class_students (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    student_user_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (student_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_class_student (class_id, student_user_id),
    INDEX idx_class_id (class_id),
    INDEX idx_student_user_id (student_user_id)
);
```

#### 4.1.7 题目表 (questions)

```sql
CREATE TABLE questions (
    question_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    question_type ENUM('cli', 'file', 'interface') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    time_limit_ms INT DEFAULT 3000,
    memory_limit_mb INT DEFAULT 64,
    language VARCHAR(20) DEFAULT 'python',
    input_filename VARCHAR(100),
    output_filename VARCHAR(100),
    entry_function VARCHAR(100),
    setup_code TEXT,
    standard_answer TEXT,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_difficulty (difficulty),
    INDEX idx_question_type (question_type)
);
```

#### 4.1.8 测试用例表 (test_cases)

```sql
CREATE TABLE test_cases (
    test_case_id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    case_order INT NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    score_weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id),
    INDEX idx_case_order (question_id, case_order)
);
```

#### 4.1.9 作业表 (assignments)

```sql
CREATE TABLE assignments (
    assignment_id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    question_id VARCHAR(36) NOT NULL,
    due_date DATETIME NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    allow_resubmit BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_question_id (question_id),
    INDEX idx_due_date (due_date),
    INDEX idx_is_published (is_published)
);
```

#### 4.1.10 作业班级关联表 (assignment_classes)

```sql
CREATE TABLE assignment_classes (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    UNIQUE KEY uk_assignment_class (assignment_id, class_id),
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_class_id (class_id)
);
```

#### 4.1.11 提交表 (submissions)

```sql
CREATE TABLE submissions (
    submission_id VARCHAR(36) PRIMARY KEY,
    student_user_id VARCHAR(36) NOT NULL,
    assignment_id VARCHAR(36) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed') NOT NULL,
    score INT,
    total_score INT NOT NULL,
    pass_rate DECIMAL(5,2),
    runtime_ms INT,
    memory_kb INT,
    submit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_time TIMESTAMP,
    FOREIGN KEY (student_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    INDEX idx_student_user_id (student_user_id),
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_status (status),
    INDEX idx_submit_time (submit_time),
    INDEX idx_student_assignment (student_user_id, assignment_id)
);
```

#### 4.1.12 测试结果表 (test_results)

```sql
CREATE TABLE test_results (
    test_result_id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    test_case_id VARCHAR(36) NOT NULL,
    passed BOOLEAN NOT NULL,
    actual_output TEXT,
    execution_time_ms INT,
    memory_kb INT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(test_case_id) ON DELETE CASCADE,
    INDEX idx_submission_id (submission_id),
    INDEX idx_test_case_id (test_case_id)
);
```

#### 4.1.13 公告表 (announcements)

```sql
CREATE TABLE announcements (
    announcement_id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_created_at (created_at)
);
```

#### 4.1.14 系统日志表 (system_logs)

```sql
CREATE TABLE system_logs (
    log_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(36),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);
```

#### 4.1.15 系统配置表 (system_config)

```sql
CREATE TABLE system_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT NOT NULL,
    config_type VARCHAR(20) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_type (config_type)
);
```

### 4.2 数据库索引优化

#### 4.2.1 复合索引

```sql
-- 提交表复合索引
CREATE INDEX idx_student_assignment_time ON submissions(student_user_id, assignment_id, submit_time);

-- 测试结果表复合索引
CREATE INDEX idx_submission_test ON test_results(submission_id, test_case_id);

-- 作业班级关联表复合索引
CREATE INDEX idx_class_assignment ON assignment_classes(class_id, assignment_id);
```

#### 4.2.2 覆盖索引

```sql
-- 课程表覆盖索引
CREATE INDEX idx_teacher_course_semester ON courses(teacher_id, semester, course_name);

-- 作业表覆盖索引
CREATE INDEX idx_course_due_published ON assignments(course_id, due_date, is_published);

-- 提交表覆盖索引
CREATE INDEX idx_student_status_time ON submissions(student_user_id, status, submit_time);
```

## 五、中间件的使用

### 5.1 前端中间件

#### 5.1.1 路由守卫中间件

```typescript
// 路由守卫中间件
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  
  // 检查角色权限
  if (to.meta.role && to.meta.role !== userRole) {
    next('/login')
    return
  }
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - AutoGrader` : 'AutoGrader'
  
  next()
})
```

#### 5.1.2 HTTP请求中间件

```typescript
// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    
    if (code === 200) {
      return data
    } else if (code === 401) {
      // Token过期，跳转登录
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
      return Promise.reject(new Error('登录已过期'))
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          localStorage.removeItem('token')
          localStorage.removeItem('userRole')
          router.push('/login')
          ElMessage.error('登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error('网络错误，请检查网络连接')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求失败，请稍后重试')
    }
    
    return Promise.reject(error)
  }
)
```

#### 5.1.3 状态管理中间件

```typescript
// Pinia状态管理中间件
const appStore = useAppStore()

// 持久化中间件
appStore.$onAction(({ name, after }) => {
  after(() => {
    if (name === 'setTheme' || name === 'setLanguage') {
      localStorage.setItem('appSettings', JSON.stringify({
        theme: appStore.theme,
        language: appStore.language
      }))
    }
  })
})
```

#### 5.1.4 错误处理中间件

```typescript
// 全局错误处理中间件
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  
  // 上报错误到服务器
  reportError({
    error: err.message,
    stack: err.stack,
    component: instance?.$options.name,
    info: info
  })
  
  // 显示错误提示
  ElMessage.error('发生错误，请稍后重试')
}
```

### 5.2 后端中间件建议

#### 5.2.1 认证中间件

```python
# JWT认证中间件
def jwt_auth_middleware(request):
    token = request.headers.get('Authorization')
    
    if not token:
        return JsonResponse({'code': 401, 'message': '未提供认证令牌'}, status=401)
    
    try:
        token = token.replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        request.user_id = payload['user_id']
        request.user_role = payload['role']
    except jwt.ExpiredSignatureError:
        return JsonResponse({'code': 401, 'message': '令牌已过期'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'code': 401, 'message': '无效的令牌'}, status=401)
```

#### 5.2.2 权限中间件

```python
# 角色权限中间件
def role_required(*allowed_roles):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if not hasattr(request, 'user_role'):
                return JsonResponse({'code': 401, 'message': '未认证'}, status=401)
            
            if request.user_role not in allowed_roles:
                return JsonResponse({'code': 403, 'message': '权限不足'}, status=403)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
```

#### 5.2.3 日志中间件

```python
# 请求日志中间件
def logging_middleware(get_response):
    def middleware(request):
        start_time = time.time()
        
        response = get_response(request)
        
        duration = time.time() - start_time
        
        log_data = {
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'duration': duration,
            'ip_address': get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'user_id': getattr(request, 'user_id', None)
        }
        
        logger.info(f"Request: {log_data}")
        
        return response
    return middleware
```

#### 5.2.4 限流中间件

```python
# API限流中间件
from django.core.cache import cache

def rate_limit_middleware(get_response):
    def middleware(request):
        if request.user.is_authenticated:
            user_id = request.user.id
            cache_key = f'rate_limit_{user_id}'
            request_count = cache.get(cache_key, 0)
            
            if request_count >= 100:  # 每分钟100次请求
                return JsonResponse({'code': 429, 'message': '请求过于频繁，请稍后重试'}, status=429)
            
            cache.set(cache_key, request_count + 1, 60)
        
        return get_response(request)
    return middleware
```

#### 5.2.5 CORS中间件

```python
# CORS中间件
class CORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Allow-Credentials'] = 'true'
        
        if request.method == 'OPTIONS':
            response.status_code = 200
        
        return response
```

### 5.3 中间件使用流程

#### 5.3.1 请求处理流程

```
用户请求 → CORS中间件 → 认证中间件 → 权限中间件 → 限流中间件 → 业务逻辑 → 日志中间件 → 响应
```

#### 5.3.2 前端请求流程

```
用户操作 → 组件事件 → 状态管理 → HTTP请求 → 请求拦截器 → 后端API → 响应拦截器 → 状态更新 → UI更新
```

## 六、技术栈总结

### 6.1 前端技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **代码编辑器**: Monaco Editor
- **Markdown渲染**: markdown-it
- **图表**: ECharts
- **样式**: CSS3 + CSS Variables

### 6.2 后端技术栈建议

- **框架**: Spring Boot 3.x / Django 4.x
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **认证**: JWT
- **API文档**: Swagger / OpenAPI
- **代码评测**: Docker容器
- **消息队列**: RabbitMQ / Redis Pub/Sub

### 6.3 开发工具

- **IDE**: Visual Studio Code
- **版本控制**: Git
- **包管理**: npm / yarn
- **代码规范**: ESLint + Prettier
- **测试**: Vitest + Vue Test Utils

## 七、总结

本文档详细描述了AutoGrader作业代码自动评分系统UI模块的设计方案，包括：

1. **功能模块详细设计**：学生端、教师端、管理员端三大模块的详细功能设计
2. **功能点与需求项覆盖关系**：确保所有需求项都有对应的功能点实现
3. **模块间接口设计**：前端组件间接口、前后端接口、数据流设计
4. **数据库设计**：完整的数据库表结构和索引优化方案
5. **中间件使用**：前端和后端中间件的设计和使用方案

该设计方案基于系统功能规划文档，结合前端代码实际情况，确保UI模块能够完整覆盖所有需求项，并提供良好的用户体验和系统性能。
