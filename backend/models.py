from flask_sqlalchemy import SQLAlchemy
import bcrypt
from datetime import datetime, timedelta
import secrets

db = SQLAlchemy()  # 在此处初始化 db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    avatar = db.Column(db.String(200), default='https://ui-avatars.com/api/?name=User')
    posts = db.relationship('Post', backref='user', lazy=True)
    comments = db.relationship('Comment', backref='user', lazy=True)
    votes = db.relationship('PostVote', backref='user', lazy=True)
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def check_password(self, password):
        return bcrypt.checkpw(password.encode(), self.password_hash.encode())

    def generate_reset_token(self, expires_in=3600):
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expiry = datetime.utcnow() + timedelta(seconds=expires_in)
        db.session.commit()
        return self.reset_token

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    votes = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')
    voters = db.relationship('PostVote', backref='post', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)

class PostVote(db.Model):
    __tablename__ = 'post_vote'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MBTIQuestion(db.Model):
    __tablename__ = 'mbti_questions'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False, unique=True)  # 增加唯一约束
    dimension = db.Column(db.Enum('EI', 'SN', 'TF', 'JP', name='mbti_dimensions'), 
                         nullable=False, index=True)  # 添加索引
    weight = db.Column(db.Float, default=1.0)  # 新增权重系数
    is_verified = db.Column(db.Boolean, default=False)  # 题目审核状态

class UserTestResult(db.Model):
    __tablename__ = 'mbti_results'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    # 分解JSON为独立字段
    e_score = db.Column(db.Integer, default=0)
    i_score = db.Column(db.Integer, default=0)
    s_score = db.Column(db.Integer, default=0)
    n_score = db.Column(db.Integer, default=0)
    t_score = db.Column(db.Integer, default=0)
    f_score = db.Column(db.Integer, default=0)
    j_score = db.Column(db.Integer, default=0)
    p_score = db.Column(db.Integer, default=0)
    # 计算衍生字段
    ei_ratio = db.Column(db.Float)
    sn_ratio = db.Column(db.Float)
    # 保留原始结果
    mbti_type = db.Column(db.String(4), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
class MBTIType(db.Model):
    __tablename__ = 'mbti_types'
    type_code = db.Column(db.String(4), primary_key=True)
    # 新增元数据
    frequency = db.Column(db.Float)  # 在人口中的分布频率
    cognitive_function = db.Column(db.String(50))  # 认知功能（如Ni/Se）
    # 增强描述字段
    profile = db.Column(db.Text)  # 完整人格画像
    career_recommendations = db.Column(db.Text)
    famous_people = db.Column(db.Text)  # 知名人物案例        