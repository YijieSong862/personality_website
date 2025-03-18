from flask_sqlalchemy import SQLAlchemy
import bcrypt
from datetime import datetime, timedelta
import secrets

db = SQLAlchemy()  # 初始化 SQLAlchemy

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(200), default='https://ui-avatars.com/api/?name=User')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    posts = db.relationship('Post', backref='user', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='user', lazy=True, cascade='all, delete-orphan')
    votes = db.relationship('PostVote', backref='user', lazy=True, cascade='all, delete-orphan')
    test_results = db.relationship('UserTestResult', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = password #bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def check_password(self, password):
        return password == self.password_hash #bcrypt.checkpw(password.encode(), self.password_hash.encode())

    def generate_reset_token(self, expires_in=3600):
        return {
            'token': secrets.token_urlsafe(32),
            'expiry': datetime.utcnow() + timedelta(seconds=expires_in)
        }


class Post(db.Model):
    __tablename__ = 'post'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    
    votes = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')
    voters = db.relationship('PostVote', backref='post', lazy=True, cascade='all, delete-orphan')


class Comment(db.Model):
    __tablename__ = 'comment'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False, index=True)


class PostVote(db.Model):
    __tablename__ = 'post_vote'
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)


class MBTIQuestion(db.Model):
    __tablename__ = 'mbti_questions'

    id = db.Column(db.Integer, primary_key=True)
    dimension = db.Column(db.String(100), nullable=False)
    question_text = db.Column(db.String(255), nullable=False)
    option_a = db.Column(db.String(255), nullable=False)
    option_b = db.Column(db.String(255), nullable=False)
    option_a_type = db.Column(db.String(1), nullable=False)  # 新增字段，存储选项A的类型，如 J、P 等
    option_b_type = db.Column(db.String(1), nullable=False)  # 新增字段，存储选项B的类型，如 J、P 等
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, dimension, question_text, option_a, option_b, option_a_type, option_b_type, created_at):
        self.dimension = dimension
        self.question_text = question_text
        self.option_a = option_a
        self.option_b = option_b
        self.option_a_type = option_a_type  
        self.option_b_type = option_b_type  
        self.created_at = created_at



class UserTestResult(db.Model):
    __tablename__ = 'mbti_result'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    
    e_score = db.Column(db.Integer, default=0)
    i_score = db.Column(db.Integer, default=0)
    s_score = db.Column(db.Integer, default=0)
    n_score = db.Column(db.Integer, default=0)
    t_score = db.Column(db.Integer, default=0)
    f_score = db.Column(db.Integer, default=0)
    j_score = db.Column(db.Integer, default=0)
    p_score = db.Column(db.Integer, default=0)
    birthday = db.Column(db.Date, nullable=True)

    mbti_type = db.Column(db.String(4), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)


class MBTIType(db.Model):
    __tablename__ = 'mbti_type'
    
    mbti_type = db.Column(db.String(4), primary_key=True)
    frequency = db.Column(db.Float)  # 人口统计数据
    cognitive_function = db.Column(db.String(50))  # 认知功能（如Ni/Se）
    profile = db.Column(db.Text)  # 人格画像
    career_recommendations = db.Column(db.Text)  # 推荐职业
    famous_people = db.Column(db.Text)  # 相关知名人物
    examples = db.Column(db.Text)  # 额外案例或补充资料
