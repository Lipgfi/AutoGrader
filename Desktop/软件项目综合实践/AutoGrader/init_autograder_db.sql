-- =========================================================
-- AutoGrader MySQL 8.0 建表脚本（含 DROP IF EXISTS + 示例数据）
-- 说明：
-- 1) 基于核心数据模型落地
-- 2) 使用 MySQL 8.0，字符集 utf8mb4
-- 3) question_id 为 B-3 题库中的外部字符串 ID，因此不做本地外键
-- 4) 当前 assignments 按文档模型是“一个作业属于一个班级”
-- =========================================================

-- 可选：先创建数据库
DROP DATABASE IF EXISTS autograder;
CREATE DATABASE autograder
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE autograder;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. 按依赖顺序删除旧表
-- =========================================================
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS assignment_questions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS class_students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 2. 用户主表
-- =========================================================
CREATE TABLE users (
    user_id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '系统内部ID',
    username         VARCHAR(20) NOT NULL COMMENT '登录用户名，唯一，注册后不可修改',
    password_hash    VARCHAR(255) NOT NULL COMMENT '密码哈希（如 bcrypt）',
    email            VARCHAR(255) NOT NULL COMMENT '邮箱，唯一',
    phone            VARCHAR(20) NULL COMMENT '手机号',
    real_name        VARCHAR(100) NOT NULL COMMENT '真实姓名',
    role             ENUM('student', 'teacher', 'admin') NOT NULL COMMENT '角色',
    avatar_url       VARCHAR(500) NULL COMMENT '头像地址',
    is_active        TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册/创建时间',
    last_login_at    DATETIME NULL COMMENT '最后登录时间',
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email),
    KEY idx_users_role (role),
    KEY idx_users_active (is_active)
) ENGINE=InnoDB COMMENT='用户主表';

-- =========================================================
-- 3. 学生扩展表
-- =========================================================
CREATE TABLE students (
    user_id                  BIGINT UNSIGNED NOT NULL COMMENT '对应 users.user_id',
    student_id               VARCHAR(50) NOT NULL COMMENT '学号，全局唯一',
    first_password_changed   TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已修改初始密码',
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_students_student_id (student_id),
    CONSTRAINT fk_students_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='学生扩展表';

-- =========================================================
-- 4. 教师扩展表
-- =========================================================
CREATE TABLE teachers (
    user_id        BIGINT UNSIGNED NOT NULL COMMENT '对应 users.user_id',
    teacher_id     VARCHAR(50) NOT NULL COMMENT '工号，全局唯一',
    department     VARCHAR(100) NULL COMMENT '院系',
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_teachers_teacher_id (teacher_id),
    CONSTRAINT fk_teachers_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='教师扩展表';

-- =========================================================
-- 5. 课程表
-- =========================================================
CREATE TABLE courses (
    course_id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    course_code      VARCHAR(50) NOT NULL COMMENT '课程编号，如 CS102',
    course_name      VARCHAR(200) NOT NULL COMMENT '课程名称',
    teacher_id       BIGINT UNSIGNED NOT NULL COMMENT '创建该课程的教师 users.user_id',
    semester         VARCHAR(50) NOT NULL COMMENT '学期，如 2025-2026-2',
    description      TEXT NULL COMMENT '课程简介',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id),
    UNIQUE KEY uk_courses_code_semester (course_code, semester),
    KEY idx_courses_teacher_id (teacher_id),
    KEY idx_courses_semester (semester),
    CONSTRAINT fk_courses_teacher
        FOREIGN KEY (teacher_id) REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='课程表';

-- =========================================================
-- 6. 班级表
-- =========================================================
CREATE TABLE classes (
    class_id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id        BIGINT UNSIGNED NOT NULL COMMENT '所属课程',
    class_name       VARCHAR(200) NOT NULL COMMENT '班级名称',
    class_code       VARCHAR(50) NOT NULL COMMENT '课序号，如 01',
    teacher_id       BIGINT UNSIGNED NOT NULL COMMENT '管理该班的教师 users.user_id',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id),
    UNIQUE KEY uk_classes_course_code (course_id, class_code),
    KEY idx_classes_teacher_id (teacher_id),
    CONSTRAINT fk_classes_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_classes_teacher
        FOREIGN KEY (teacher_id) REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='班级表';

-- =========================================================
-- 7. 学生-班级关联表
-- =========================================================
CREATE TABLE class_students (
    class_id             BIGINT UNSIGNED NOT NULL,
    student_user_id      BIGINT UNSIGNED NOT NULL,
    joined_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_user_id),
    KEY idx_class_students_student (student_user_id),
    CONSTRAINT fk_class_students_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_class_students_student
        FOREIGN KEY (student_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='学生-班级关联表';

-- =========================================================
-- 8. 作业表
-- =========================================================
CREATE TABLE assignments (
    assignment_id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title                VARCHAR(255) NOT NULL COMMENT '作业标题',
    description          TEXT NULL COMMENT '作业说明',
    class_id             BIGINT UNSIGNED NOT NULL COMMENT '发布给哪个班级',
    teacher_id           BIGINT UNSIGNED NOT NULL COMMENT '发布教师',
    due_date             DATETIME NOT NULL COMMENT '截止时间',
    is_published         TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已发布',
    allow_resubmit       TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否允许重复提交',
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at         DATETIME NULL COMMENT '发布时间',
    PRIMARY KEY (assignment_id),
    KEY idx_assignments_class_id (class_id),
    KEY idx_assignments_teacher_id (teacher_id),
    KEY idx_assignments_due_date (due_date),
    KEY idx_assignments_published (is_published),
    CONSTRAINT fk_assignments_class
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_teacher
        FOREIGN KEY (teacher_id) REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='作业表';

-- =========================================================
-- 9. 作业-题目关联表
-- =========================================================
CREATE TABLE assignment_questions (
    assignment_id        BIGINT UNSIGNED NOT NULL,
    question_id          VARCHAR(100) NOT NULL COMMENT 'B-3 题库中的题目ID',
    order_index          INT NOT NULL COMMENT '题目在作业中的排序',
    PRIMARY KEY (assignment_id, question_id),
    UNIQUE KEY uk_assignment_question_order (assignment_id, order_index),
    CONSTRAINT fk_assignment_questions_assignment
        FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='作业-题目关联表';

-- =========================================================
-- 10. 提交记录表
-- =========================================================
CREATE TABLE submissions (
    submission_id            CHAR(36) NOT NULL COMMENT 'UUID',
    student_user_id          BIGINT UNSIGNED NOT NULL COMMENT '提交学生',
    question_id              VARCHAR(100) NOT NULL COMMENT '题目ID（B-3来源）',
    assignment_id            BIGINT UNSIGNED NOT NULL COMMENT '所属作业',
    code                     MEDIUMTEXT NOT NULL COMMENT '提交代码原文',
    language                 VARCHAR(50) NOT NULL DEFAULT 'python' COMMENT '代码语言',
    submitted_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    status                   ENUM('PENDING', 'RUNNING', 'COMPLETED', 'ERROR') NOT NULL COMMENT '评测状态',
    overall_score            DECIMAL(5,2) NULL COMMENT '综合得分',
    passed_count             INT NULL COMMENT '通过用例数',
    total_count              INT NULL COMMENT '总用例数',
    overall_comment          TEXT NULL COMMENT '总体评价',
    static_issues            JSON NULL COMMENT '静态问题列表',
    case_results             JSON NULL COMMENT '各用例详细结果',
    teacher_score_override   DECIMAL(5,2) NULL COMMENT '教师手动覆盖得分',
    override_reason          TEXT NULL COMMENT '覆盖原因',
    PRIMARY KEY (submission_id),
    KEY idx_submissions_student (student_user_id),
    KEY idx_submissions_assignment (assignment_id),
    KEY idx_submissions_question (question_id),
    KEY idx_submissions_status (status),
    KEY idx_submissions_submitted_at (submitted_at),
    KEY idx_submissions_score (overall_score),
    CONSTRAINT fk_submissions_student
        FOREIGN KEY (student_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_submissions_assignment
        FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='提交记录表';

-- =========================================================
-- 11. 示例数据
-- =========================================================

-- 11.1 用户
INSERT INTO users
(username, password_hash, email, phone, real_name, role, avatar_url, is_active, created_at, last_login_at)
VALUES
('admin01',   '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',   'admin@autograder.com',   '13800000000', '系统管理员', 'admin',   NULL, 1, '2026-03-01 09:00:00', '2026-03-25 08:00:00'),
('zhangsan_t','$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'zhangsan@school.edu',    '13900000001', '张三',     'teacher', 'https://example.com/avatar/t1.png', 1, '2026-03-01 10:00:00', '2026-03-24 21:00:00'),
('lisi_t',    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'lisi@school.edu',        '13900000002', '李四',     'teacher', 'https://example.com/avatar/t2.png', 1, '2026-03-02 10:00:00', '2026-03-24 20:30:00'),
('stu001',    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '20250001@stu.edu',       '13700000001', '王小明',   'student', NULL, 1, '2026-03-03 11:00:00', '2026-03-25 07:30:00'),
('stu002',    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '20250002@stu.edu',       '13700000002', '李小红',   'student', NULL, 1, '2026-03-03 11:05:00', '2026-03-24 22:00:00'),
('stu003',    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '20250003@stu.edu',       NULL,          '赵小强',   'student', NULL, 1, '2026-03-03 11:10:00', NULL),
('stu004',    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '20250004@stu.edu',       NULL,          '陈小雨',   'student', NULL, 1, '2026-03-03 11:15:00', NULL);

-- 11.2 学生扩展
INSERT INTO students (user_id, student_id, first_password_changed)
VALUES
(4, '20250001', 1),
(5, '20250002', 1),
(6, '20250003', 0),
(7, '20250004', 0);

-- 11.3 教师扩展
INSERT INTO teachers (user_id, teacher_id, department)
VALUES
(2, 'T1001', '计算机学院'),
(3, 'T1002', '软件学院');

-- 11.4 课程
INSERT INTO courses
(course_code, course_name, teacher_id, semester, description, created_at)
VALUES
('CS102', 'Python 程序设计', 2, '2025-2026-2', '面向大一学生的 Python 程序设计课程。', '2026-03-05 09:00:00'),
('SE201', '数据结构',       3, '2025-2026-2', '软件工程专业核心课程：数据结构与算法基础。', '2026-03-05 09:30:00');

-- 11.5 班级
INSERT INTO classes
(course_id, class_name, class_code, teacher_id, created_at)
VALUES
(1, '软件工程2班', '01', 2, '2026-03-05 10:00:00'),
(1, '计算机科学1班', '02', 2, '2026-03-05 10:05:00'),
(2, '软件工程3班', '01', 3, '2026-03-05 10:10:00');

-- 11.6 学生-班级关联
INSERT INTO class_students (class_id, student_user_id, joined_at)
VALUES
(1, 4, '2026-03-06 08:00:00'),
(1, 5, '2026-03-06 08:05:00'),
(2, 6, '2026-03-06 08:10:00'),
(3, 7, '2026-03-06 08:15:00');

-- 11.7 作业
INSERT INTO assignments
(title, description, class_id, teacher_id, due_date, is_published, allow_resubmit, created_at, published_at)
VALUES
('第一次作业：输入输出与分支', '完成基础输入输出、条件判断题目。', 1, 2, '2026-04-01 23:59:59', 1, 1, '2026-03-10 09:00:00', '2026-03-10 09:30:00'),
('第二次作业：循环与函数',     '完成循环、函数定义与简单算法题。', 1, 2, '2026-04-10 23:59:59', 0, 1, '2026-03-20 10:00:00', NULL),
('第一次实验：链表基础',       '链表结点定义与遍历练习。',       3, 3, '2026-04-05 23:59:59', 1, 0, '2026-03-12 14:00:00', '2026-03-12 15:00:00');

-- 11.8 作业-题目关联（question_id 来自 B-3）
INSERT INTO assignment_questions (assignment_id, question_id, order_index)
VALUES
(1, 'Q001', 1),
(1, 'Q002', 2),
(2, 'Q003', 1),
(2, 'Q004', 2),
(3, 'Q101', 1);

-- 11.9 提交记录
INSERT INTO submissions
(
    submission_id, student_user_id, question_id, assignment_id, code, language,
    submitted_at, status, overall_score, passed_count, total_count, overall_comment,
    static_issues, case_results, teacher_score_override, override_reason
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    4,
    'Q001',
    1,
    'nums = list(map(int, input().split()))\nprint(sum(nums))\n',
    'python',
    '2026-03-15 20:00:00',
    'COMPLETED',
    100.00,
    4,
    4,
    '全部测试用例通过，代码逻辑正确。',
    JSON_ARRAY(),
    JSON_ARRAY(
        JSON_OBJECT(
            'case_id', 'case_01',
            'description', '基本正整数',
            'passed', TRUE,
            'actual_output', '15',
            'expected_output', '15',
            'error', NULL,
            'execution_time_ms', 12.5
        ),
        JSON_OBJECT(
            'case_id', 'case_02',
            'description', '包含负数',
            'passed', TRUE,
            'actual_output', '12',
            'expected_output', '12',
            'error', NULL,
            'execution_time_ms', 10.2
        )
    ),
    NULL,
    NULL
),
(
    '22222222-2222-2222-2222-222222222222',
    5,
    'Q001',
    1,
    'nums = list(map(int, input().split()))\nprint(nums)\n',
    'python',
    '2026-03-15 20:05:00',
    'COMPLETED',
    50.00,
    2,
    4,
    '通过 2/4 个测试用例，输出格式存在问题。',
    JSON_ARRAY(
        JSON_OBJECT('type', 'warning', 'message', '建议避免调试输出')
    ),
    JSON_ARRAY(
        JSON_OBJECT(
            'case_id', 'case_01',
            'description', '基本正整数',
            'passed', FALSE,
            'actual_output', '[1, 2, 3, 4, 5]',
            'expected_output', '15',
            'error', NULL,
            'execution_time_ms', 9.8
        ),
        JSON_OBJECT(
            'case_id', 'case_02',
            'description', '包含负数',
            'passed', FALSE,
            'actual_output', '[-1, 5, 8]',
            'expected_output', '12',
            'error', NULL,
            'execution_time_ms', 11.1
        )
    ),
    NULL,
    NULL
),
(
    '33333333-3333-3333-3333-333333333333',
    4,
    'Q002',
    1,
    'n = int(input())\nprint("even" if n % 2 == 0 else "odd")\n',
    'python',
    '2026-03-15 20:20:00',
    'RUNNING',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
),
(
    '44444444-4444-4444-4444-444444444444',
    7,
    'Q101',
    3,
    'class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n',
    'python',
    '2026-03-18 16:00:00',
    'COMPLETED',
    85.00,
    3,
    4,
    '通过 3/4 个测试用例，边界情况未覆盖。',
    JSON_ARRAY(),
    JSON_ARRAY(
        JSON_OBJECT(
            'case_id', 'case_01',
            'description', '空链表',
            'passed', TRUE,
            'actual_output', '[]',
            'expected_output', '[]',
            'error', NULL,
            'execution_time_ms', 8.6
        ),
        JSON_OBJECT(
            'case_id', 'case_02',
            'description', '单节点',
            'passed', TRUE,
            'actual_output', '[5]',
            'expected_output', '[5]',
            'error', NULL,
            'execution_time_ms', 8.9
        ),
        JSON_OBJECT(
            'case_id', 'case_03',
            'description', '多节点遍历',
            'passed', TRUE,
            'actual_output', '[1,2,3]',
            'expected_output', '[1,2,3]',
            'error', NULL,
            'execution_time_ms', 9.1
        ),
        JSON_OBJECT(
            'case_id', 'case_04',
            'description', '非法输入保护',
            'passed', FALSE,
            'actual_output', '',
            'expected_output', 'ValueError',
            'error', '运行时异常',
            'execution_time_ms', 7.7
        )
    ),
    90.00,
    '教师考虑思路正确，人工上调 5 分'
);

-- =========================================================
-- 12. 可选：常用查询示例
-- =========================================================

-- 12.1 查询某个学生所在课程
-- SELECT
--     u.real_name,
--     s.student_id,
--     c.course_name,
--     c.course_code,
--     cl.class_name,
--     c.semester
-- FROM class_students cs
-- JOIN users u ON u.user_id = cs.student_user_id
-- JOIN students s ON s.user_id = u.user_id
-- JOIN classes cl ON cl.class_id = cs.class_id
-- JOIN courses c ON c.course_id = cl.course_id
-- WHERE u.user_id = 4;

-- 12.2 查询某班级成绩概览
-- SELECT
--     cl.class_name,
--     u.real_name,
--     s.student_id,
--     a.title AS assignment_title,
--     COALESCE(sub.teacher_score_override, sub.overall_score) AS final_score
-- FROM assignments a
-- JOIN classes cl ON cl.class_id = a.class_id
-- JOIN class_students cs ON cs.class_id = cl.class_id
-- JOIN users u ON u.user_id = cs.student_user_id
-- JOIN students s ON s.user_id = u.user_id
-- LEFT JOIN submissions sub
--     ON sub.assignment_id = a.assignment_id
--    AND sub.student_user_id = u.user_id
-- WHERE cl.class_id = 1
-- ORDER BY s.student_id, a.assignment_id;

-- 12.3 查询某作业的题目列表
-- SELECT
--     a.assignment_id,
--     a.title AS assignment_title,
--     aq.order_index,
--     aq.question_id
-- FROM assignments a
-- JOIN assignment_questions aq ON aq.assignment_id = a.assignment_id
-- WHERE a.assignment_id = 1
-- ORDER BY aq.order_index;

-- 12.4 查询某学生的所有提交记录
-- SELECT
--     s.submission_id,
--     a.title AS assignment_title,
--     s.question_id,
--     s.language,
--     s.submitted_at,
--     s.status,
--     COALESCE(s.teacher_score_override, s.overall_score) AS final_score
-- FROM submissions s
-- JOIN assignments a ON a.assignment_id = s.assignment_id
-- WHERE s.student_user_id = 4
-- ORDER BY s.submitted_at DESC;
