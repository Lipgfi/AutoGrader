# AutoGrader 数据库表结构设计说明书

## 一、概述

### 1.1 文档目的
本文档定义了AutoGrader作业自动评分系统的数据库表结构，包括表设计、字段说明、索引设计和关联关系。

### 1.2 数据库选型
- **数据库类型**：MySQL 8.0+
- **字符集**：utf8mb4
- **排序规则**：utf8mb4_unicode_ci

### 1.3 命名规范
- 表名：小写字母，下划线分隔，如 `user_info`
- 字段名：小写字母，下划线分隔，如 `user_name`
- 主键：`id`
- 外键：`关联表名_id`，如 `user_id`
- 索引：`idx_表名_字段名`，如 `idx_user_name`

## 二、核心表结构设计

### 2.1 用户表 (user)

用户基础信息表，存储学生、教师、管理员的基本信息。

```sql
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色：1-学生 2-教师 3-管理员',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0-否 1-是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2.2 学生信息表 (student_info)

学生详细信息表，与学生用户关联。

```sql
CREATE TABLE `student_info` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '学生信息ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `student_no` VARCHAR(20) NOT NULL COMMENT '学号',
  `class_name` VARCHAR(50) DEFAULT NULL COMMENT '班级',
  `grade` VARCHAR(20) DEFAULT NULL COMMENT '年级',
  `major` VARCHAR(50) DEFAULT NULL COMMENT '专业',
  `college` VARCHAR(100) DEFAULT NULL COMMENT '学院',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_no` (`student_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_class_name` (`class_name`),
  CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生信息表';
```

### 2.3 教师信息表 (teacher_info)

教师详细信息表，与教师用户关联。

```sql
CREATE TABLE `teacher_info` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '教师信息ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `teacher_no` VARCHAR(20) NOT NULL COMMENT '工号',
  `department` VARCHAR(100) DEFAULT NULL COMMENT '部门',
  `title` VARCHAR(50) DEFAULT NULL COMMENT '职称',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_teacher_no` (`teacher_no`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_teacher_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师信息表';
```

### 2.4 课程表 (course)

课程基础信息表。

```sql
CREATE TABLE `course` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '课程ID',
  `course_code` VARCHAR(20) NOT NULL COMMENT '课程代码',
  `course_name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `teacher_id` BIGINT NOT NULL COMMENT '教师ID',
  `semester` VARCHAR(20) NOT NULL COMMENT '学期',
  `credit` DECIMAL(3,1) DEFAULT NULL COMMENT '学分',
  `description` TEXT DEFAULT NULL COMMENT '课程描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-结束 1-进行中',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_code` (`course_code`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_semester` (`semester`),
  CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_info` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';
```

### 2.5 作业表 (homework)

作业基础信息表。

```sql
CREATE TABLE `homework` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '作业ID',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `title` VARCHAR(200) NOT NULL COMMENT '作业标题',
  `description` TEXT DEFAULT NULL COMMENT '作业描述',
  `homework_type` TINYINT NOT NULL DEFAULT 1 COMMENT '作业类型：1-编程 2-文档 3-其他',
  `total_score` INT NOT NULL DEFAULT 100 COMMENT '总分',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '截止时间',
  `allow_late_submit` TINYINT NOT NULL DEFAULT 0 COMMENT '是否允许迟交：0-否 1-是',
  `late_penalty` DECIMAL(5,2) DEFAULT NULL COMMENT '迟交扣分比例',
  `file_types` VARCHAR(255) DEFAULT NULL COMMENT '允许的文件类型，逗号分隔',
  `max_file_size` INT DEFAULT 10 COMMENT '最大文件大小（MB）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-未开始 1-进行中 2-已结束',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_status` (`status`),
  KEY `idx_end_time` (`end_time`),
  CONSTRAINT `fk_homework_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业表';
```

### 2.6 作业提交表 (homework_submit)

学生作业提交记录表。

```sql
CREATE TABLE `homework_submit` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '提交ID',
  `homework_id` BIGINT NOT NULL COMMENT '作业ID',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `submit_no` INT NOT NULL DEFAULT 1 COMMENT '提交次数',
  `title` VARCHAR(200) DEFAULT NULL COMMENT '作业标题',
  `description` TEXT DEFAULT NULL COMMENT '作业描述',
  `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
  `file_size` BIGINT NOT NULL COMMENT '文件大小（字节）',
  `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
  `submit_time` DATETIME NOT NULL COMMENT '提交时间',
  `is_late` TINYINT NOT NULL DEFAULT 0 COMMENT '是否迟交：0-否 1-是',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-已提交 2-评分中 3-已评分',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_homework_id` (`homework_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_submit_time` (`submit_time`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_submit_homework` FOREIGN KEY (`homework_id`) REFERENCES `homework` (`id`),
  CONSTRAINT `fk_submit_student` FOREIGN KEY (`student_id`) REFERENCES `student_info` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业提交表';
```

### 2.7 测评结果总表 (evaluation_result)

代码测评结果总表，存储测评的整体结果。

```sql
CREATE TABLE `evaluation_result` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '测评结果ID',
  `submit_id` BIGINT NOT NULL COMMENT '提交ID',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `homework_id` BIGINT NOT NULL COMMENT '作业ID',
  `auto_score` DECIMAL(5,2) DEFAULT NULL COMMENT '自动评分',
  `manual_score` DECIMAL(5,2) DEFAULT NULL COMMENT '人工评分',
  `total_score` DECIMAL(5,2) DEFAULT NULL COMMENT '总分',
  `correctness_score` DECIMAL(5,2) DEFAULT NULL COMMENT '正确性得分',
  `readability_score` DECIMAL(5,2) DEFAULT NULL COMMENT '可读性得分',
  `efficiency_score` DECIMAL(5,2) DEFAULT NULL COMMENT '效率得分',
  `creativity_score` DECIMAL(5,2) DEFAULT NULL COMMENT '创新性得分',
  `remark` TEXT DEFAULT NULL COMMENT '评分备注',
  `evaluator_id` BIGINT DEFAULT NULL COMMENT '评分教师ID',
  `evaluate_time` DATETIME DEFAULT NULL COMMENT '评分时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-待测评 2-测评中 3-已完成',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_submit_id` (`submit_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_homework_id` (`homework_id`),
  KEY `idx_evaluator_id` (`evaluator_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_result_submit` FOREIGN KEY (`submit_id`) REFERENCES `homework_submit` (`id`),
  CONSTRAINT `fk_result_student` FOREIGN KEY (`student_id`) REFERENCES `student_info` (`id`),
  CONSTRAINT `fk_result_homework` FOREIGN KEY (`homework_id`) REFERENCES `homework` (`id`),
  CONSTRAINT `fk_result_evaluator` FOREIGN KEY (`evaluator_id`) REFERENCES `teacher_info` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评结果总表';
```

### 2.8 测评结果明细表 (evaluation_detail)

代码测评结果明细表，存储详细的测评项结果。

```sql
CREATE TABLE `evaluation_detail` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `result_id` BIGINT NOT NULL COMMENT '测评结果ID',
  `item_code` VARCHAR(50) NOT NULL COMMENT '测评项代码',
  `item_name` VARCHAR(100) NOT NULL COMMENT '测评项名称',
  `item_type` TINYINT NOT NULL COMMENT '测评项类型：1-自动测评 2-人工评分',
  `max_score` DECIMAL(5,2) NOT NULL COMMENT '满分',
  `actual_score` DECIMAL(5,2) NOT NULL COMMENT '实际得分',
  `detail` TEXT DEFAULT NULL COMMENT '测评详情（JSON格式）',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_result_id` (`result_id`),
  KEY `idx_item_code` (`item_code`),
  KEY `idx_item_type` (`item_type`),
  CONSTRAINT `fk_detail_result` FOREIGN KEY (`result_id`) REFERENCES `evaluation_result` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评结果明细表';
```

### 2.9 题库表 (question_bank)

题库基础信息表。

```sql
CREATE TABLE `question_bank` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '题目ID',
  `course_id` BIGINT DEFAULT NULL COMMENT '关联课程ID',
  `question_type` TINYINT NOT NULL COMMENT '题目类型：1-编程题 2-选择题 3-填空题',
  `title` VARCHAR(500) NOT NULL COMMENT '题目标题',
  `content` TEXT NOT NULL COMMENT '题目内容',
  `answer` TEXT DEFAULT NULL COMMENT '参考答案',
  `test_cases` TEXT DEFAULT NULL COMMENT '测试用例（JSON格式）',
  `difficulty` TINYINT NOT NULL DEFAULT 2 COMMENT '难度：1-简单 2-中等 3-困难',
  `score` INT NOT NULL DEFAULT 10 COMMENT '分值',
  `tags` VARCHAR(255) DEFAULT NULL COMMENT '标签，逗号分隔',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `create_user_id` BIGINT NOT NULL COMMENT '创建人ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_question_type` (`question_type`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_question_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题库表';
```

### 2.10 成绩表 (grade)

学生成绩汇总表。

```sql
CREATE TABLE `grade` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '成绩ID',
  `student_id` BIGINT NOT NULL COMMENT '学生ID',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `homework_id` BIGINT DEFAULT NULL COMMENT '作业ID',
  `grade_type` TINYINT NOT NULL COMMENT '成绩类型：1-作业 2-考试 3-总评',
  `score` DECIMAL(5,2) NOT NULL COMMENT '成绩',
  `rank` INT DEFAULT NULL COMMENT '排名',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_homework_id` (`homework_id`),
  KEY `idx_grade_type` (`grade_type`),
  CONSTRAINT `fk_grade_student` FOREIGN KEY (`student_id`) REFERENCES `student_info` (`id`),
  CONSTRAINT `fk_grade_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`),
  CONSTRAINT `fk_grade_homework` FOREIGN KEY (`homework_id`) REFERENCES `homework` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成绩表';
```

## 三、表关联关系图

```
┌─────────────┐
│    user     │
└──────┬──────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│ student_info │      │ teacher_info │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │                     ▼
       │              ┌─────────────┐
       │              │   course    │
       │              └──────┬──────┘
       │                     │
       │                     ▼
       │              ┌─────────────┐
       │              │  homework   │
       │              └──────┬──────┘
       │                     │
       ▼                     ▼
┌────────────────┐    ┌─────────────────┐
│ homework_submit│◄───│ evaluation_     │
└───────┬────────┘    │    result       │
        │             └───────┬─────────┘
        │                     │
        │                     ▼
        │             ┌─────────────────┐
        │             │ evaluation_     │
        │             │   detail        │
        │             └─────────────────┘
        │
        ▼
┌────────────────┐
│     grade      │
└────────────────┘
```

## 四、索引设计说明

### 4.1 主键索引
- 所有表均使用自增BIGINT作为主键
- 保证数据唯一性和查询效率

### 4.2 唯一索引
- `user.username`：用户名唯一
- `student_info.student_no`：学号唯一
- `teacher_info.teacher_no`：工号唯一
- `course.course_code`：课程代码唯一

### 4.3 普通索引
- 外键字段均建立索引
- 常用查询字段建立索引（如status、create_time）
- 组合查询字段建立联合索引

### 4.4 索引优化建议
1. 避免在低区分度字段建立索引
2. 联合索引遵循最左前缀原则
3. 定期分析索引使用情况，删除无用索引

## 五、数据字典

### 5.1 角色类型 (role)
| 值 | 说明 |
|---|------|
| 1 | 学生 |
| 2 | 教师 |
| 3 | 管理员 |

### 5.2 作业类型 (homework_type)
| 值 | 说明 |
|---|------|
| 1 | 编程作业 |
| 2 | 文档作业 |
| 3 | 其他作业 |

### 5.3 测评状态 (evaluation_status)
| 值 | 说明 |
|---|------|
| 1 | 待测评 |
| 2 | 测评中 |
| 3 | 已完成 |

### 5.4 题目类型 (question_type)
| 值 | 说明 |
|---|------|
| 1 | 编程题 |
| 2 | 选择题 |
| 3 | 填空题 |

### 5.5 难度等级 (difficulty)
| 值 | 说明 |
|---|------|
| 1 | 简单 |
| 2 | 中等 |
| 3 | 困难 |

## 六、性能优化建议

### 6.1 分表策略
- 作业提交表按学期分表
- 测评结果表按学期分表
- 成绩表按学年分表

### 6.2 缓存策略
- 用户信息缓存：Redis，过期时间30分钟
- 课程信息缓存：Redis，过期时间1小时
- 成绩统计缓存：Redis，过期时间5分钟

### 6.3 查询优化
- 使用分页查询，避免全表扫描
- 复杂查询使用视图或存储过程
- 统计查询使用定时任务预计算

## 七、备份策略

### 7.1 备份周期
- 全量备份：每天凌晨2:00
- 增量备份：每小时一次
- 日志备份：每15分钟一次

### 7.2 备份保留
- 全量备份保留30天
- 增量备份保留7天
- 日志备份保留3天

---

**版本历史**
- V1.0 (2024-01-01)：初始版本
- V1.1 (2024-01-20)：优化测评结果表分层设计，补充字段注释及关联关系图