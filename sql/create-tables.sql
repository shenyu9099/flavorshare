-- FlavorShare SQL Database Schema
-- 在 Azure SQL Database 中执行此脚本创建用户表

-- 用户表
CREATE TABLE Users (
    UserId NVARCHAR(50) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- 创建索引提高查询性能
CREATE INDEX IX_Users_Email ON Users(Email);

-- 插入测试用户（可选）
-- INSERT INTO Users (UserId, Email, Name, PasswordHash) 
-- VALUES ('user-test-001', 'test@test.com', 'Test User', '123456');

