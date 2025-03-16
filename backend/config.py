import os
from pathlib import Path

# 确保路径指向当前目录（backend）
BASE_DIR = Path(__file__).resolve().parent

class Config:
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{BASE_DIR}/app.db"  # 数据库文件生成在 backend 目录
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret") 