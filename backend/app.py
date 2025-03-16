from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import auth_bp
from flask_jwt_extended import JWTManager

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


jwt = JWTManager(app)

# 初始化数据库
db.init_app(app)

# 注册蓝图
app.register_blueprint(auth_bp, url_prefix='/api')

# 创建数据库命令
@app.cli.command('create-db')
def create_db():
    """运行命令: flask create-db"""
    from db_init import init_db  
    with app.app_context():
        init_db()

if __name__ == '__main__':
    print(app.url_map)
    app.run(debug=True)
