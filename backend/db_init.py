# backend/db_init.py
from datetime import datetime
from models import db, MBTIQuestion, MBTIType
from sqlalchemy.exc import IntegrityError
from app import app, db
from init_data import mbti_questions, mbti_types


# 插入MBTI问题数据到数据库
def insert_mbti_questions():
    with app.app_context():  # 确保在应用上下文中执行数据库操作
        for dimension, questions in mbti_questions.items():
            for question_text, option_a, option_b in questions:
                question = MBTIQuestion(
                    dimension=dimension,
                    question_text=question_text,
                    option_a=option_a,
                    option_b=option_b,
                    option_a_type=dimension[0],  
                    option_b_type=dimension[1],  
                    created_at=datetime.utcnow()
                )
                db.session.add(question)  # 添加到会话中

        db.session.commit()  # 提交数据库操作

 
# 初始化数据库中的MBTI类型数据
def insert_mbti_types():
    for mbti, data in mbti_types.items():
        try:
            mbti_type = MBTIType(
                mbti_type=mbti,
                frequency=data['frequency'],
                profile=data['description'],
                career_recommendations=data['career'],
                development=data['The direction of development'],
                books=data['Recommended films and books'],
            )
            db.session.add(mbti_type)
        except IntegrityError:
            db.session.rollback()  # 若遇到重复数据，回滚事务
            print(f"MBTI类型 {mbti} 已存在，跳过插入。")
    
    try:
        db.session.commit()
        print("MBTI类型数据初始化成功！")
    except Exception as e:
        db.session.rollback()
        print(f"初始化MBTI类型数据时发生错误: {e}")

def init_db():
    with app.app_context():  # 确保在应用上下文中运行
        db.create_all()  # 创建所有表
        insert_mbti_questions()  # 插入MBTI问题数据
        insert_mbti_types()  # 插入MBTI类型数据
        print("数据库和数据表已创建，数据已插入。")

if __name__ == '__main__':
    init_db()