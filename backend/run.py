# backend/run.py
from flask import Flask
from config import Config
from models import db
from routes import auth_bp  # 确保路由已拆分到 routes.py

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# 注册蓝图
app.register_blueprint(auth_bp, url_prefix='/api')

# 初始化数据库（首次运行前执行）
@app.cli.command('create-db')
def create_db():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    app.run(debug=True)