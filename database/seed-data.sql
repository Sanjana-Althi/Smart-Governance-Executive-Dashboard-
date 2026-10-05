CREATE DATABASE IF NOT EXISTS governance_db;
USE governance_db;

CREATE TABLE IF NOT EXISTS department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT,
    service_name VARCHAR(100),
    status VARCHAR(20),
    request_date DATE,
    completion_date DATE,
    sla_compliant BOOLEAN,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS grievance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT,
    category VARCHAR(100),
    status VARCHAR(20),
    created_date DATE,
    resolved_date DATE,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS revenue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT,
    service_name VARCHAR(100),
    amount DOUBLE,
    collection_date DATE,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS budget (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT,
    allocated_amount DOUBLE,
    spent_amount DOUBLE,
    financial_year VARCHAR(20),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS citizen_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT,
    service_name VARCHAR(100),
    rating INT,
    feedback_date DATE,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

INSERT INTO department (name) VALUES
('Health'),
('Education'),
('Transport'),
('Revenue'),
('Public Works'),
('Municipal Services');

INSERT INTO services
(department_id, service_name, status, request_date, completion_date, sla_compliant)
SELECT
    MOD(i, 6) + 1,
    ELT(
        MOD(i, 6) + 1,
        'Health Card',
        'School Certificate',
        'Bus Pass',
        'Land Record Extract',
        'Building Permit',
        'Trade License'
    ),
    CASE
        WHEN i <= 80 THEN 'COMPLETED'
        WHEN i <= 92 THEN 'IN_PROGRESS'
        ELSE 'PENDING'
    END,
    DATE_ADD('2026-01-01', INTERVAL i * 2 DAY),
    CASE
        WHEN i <= 80
        THEN DATE_ADD('2026-01-01', INTERVAL (i * 2 + 3 + MOD(i, 7)) DAY)
        ELSE NULL
    END,
    CASE
        WHEN i IN (10,25,40,55,70,85) THEN FALSE
        ELSE TRUE
    END
FROM (
    SELECT @row := @row + 1 AS i
    FROM
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
        (SELECT @row := 0) r
    LIMIT 100
) numbers;

INSERT INTO grievance
(department_id, category, status, created_date, resolved_date)
SELECT
    MOD(i, 6) + 1,
    ELT(
        MOD(i, 5) + 1,
        'Delay in Service',
        'Staff Behaviour',
        'Billing Issue',
        'Infrastructure',
        'Corruption Complaint'
    ),
    CASE
        WHEN i <= 40 THEN 'RESOLVED'
        WHEN i <= 50 THEN 'IN_PROGRESS'
        ELSE 'PENDING'
    END,
    DATE_ADD('2026-01-01', INTERVAL i * 3 DAY),
    CASE
        WHEN i <= 40
        THEN DATE_ADD('2026-01-01', INTERVAL (i * 3 + 2 + MOD(i, 9)) DAY)
        ELSE NULL
    END
FROM (
    SELECT @g := @g + 1 AS i
    FROM
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
        (SELECT @g := 0) r
    LIMIT 60
) numbers;

INSERT INTO revenue
(department_id, service_name, amount, collection_date)
SELECT
    MOD(i, 6) + 1,
    ELT(
        MOD(i, 6) + 1,
        'Health Card',
        'School Certificate',
        'Bus Pass',
        'Land Record Extract',
        'Building Permit',
        'Trade License'
    ),
    200000,
    DATE_ADD('2025-10-01', INTERVAL MOD(i - 1, 12) MONTH)
FROM (
    SELECT @r := @r + 1 AS i
    FROM
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
        (SELECT @r := 0) r
    LIMIT 62
) numbers;

INSERT INTO budget
(department_id, allocated_amount, spent_amount, financial_year)
VALUES
(1, 5000000, 4200000, '2025-26'),
(2, 5000000, 3900000, '2025-26'),
(3, 5000000, 3600000, '2025-26'),
(4, 5000000, 4100000, '2025-26'),
(5, 5000000, 3800000, '2025-26'),
(6, 5000000, 3800000, '2025-26');

INSERT INTO citizen_feedback
(department_id, service_name, rating, feedback_date)
SELECT
    MOD(i, 6) + 1,
    ELT(
        MOD(i, 6) + 1,
        'Health Card',
        'School Certificate',
        'Bus Pass',
        'Land Record Extract',
        'Building Permit',
        'Trade License'
    ),
    CASE
        WHEN i <= 76 THEN 5
        WHEN i <= 94 THEN 4
        WHEN i <= 98 THEN 3
        WHEN i = 99 THEN 2
        ELSE 1
    END,
    DATE_ADD('2026-01-01', INTERVAL i * 2 DAY)
FROM (
    SELECT @f := @f + 1 AS i
    FROM
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
        (SELECT @f := 0) r
    LIMIT 100
) numbers;