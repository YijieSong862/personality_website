curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tech_guru", 
    "email": "user@domain.com",
    "password": "SecureP@ssw0rd2023"
  }'

  curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@domain.com", "password": "SecureP@ssw0rd2023"}'

  # 步骤1：请求重置链接
curl -X POST http://localhost:5000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@domain.com"}'

# 步骤2：使用邮件中的令牌提交新密码
curl -X POST http://localhost:5000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "7b8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    "new_password": "NewSecureP@ss123"
  }'