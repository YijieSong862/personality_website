from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_cors import CORS
from dotenv import load_dotenv

db = SQLAlchemy()
mail = Mail()

def create_app():
    app = Flask(__name__)
    load_dotenv()
    
    # 配置
    app.config.from_object('app.config.Config')
    
    # 初始化扩展
    db.init_app(app)
    mail.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # 注册蓝图
    from app.routes import bp
    app.register_blueprint(bp)
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    return app