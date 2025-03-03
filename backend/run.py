from flask import Flask
from flask_cors import CORS
from config import Config  # 直接导入同级模块
from models import db
from routes import auth_bp  # 直接导入同级模

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# 初始化数据库
db.init_app(app)

# 注册蓝图
app.register_blueprint(auth_bp, url_prefix='/api')

# 创建数据库命令
@app.cli.command('create-db')
def create_db():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    print(app.url_map)
    app.run(debug=True)