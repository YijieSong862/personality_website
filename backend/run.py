# app.py
from flask import Flask
from config import Config
from models import db

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# 初始化数据库（首次运行前执行）
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)