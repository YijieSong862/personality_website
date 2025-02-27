-- 创建数据库
CREATE DATABASE IF NOT EXISTS user_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE user_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    reset_token VARCHAR(100) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    
    PRIMARY KEY (id),
    UNIQUE INDEX uq_username (username),
    UNIQUE INDEX uq_email (email),
    INDEX idx_reset_token (reset_token)
) 
ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='用户基本信息表';

-- 审计表（可选扩展）
CREATE TABLE IF NOT EXISTS auth_attempts (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    attempt_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL,
    success TINYINT(1) NOT NULL,
    
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_attempt_time (attempt_time),
    
    CONSTRAINT fk_auth_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='登录尝试记录表';