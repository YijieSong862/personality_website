curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d '{"username": "test", "email": "test@example.com", "password": "123456"}'


#数据库初始化
python backend/db_init.py