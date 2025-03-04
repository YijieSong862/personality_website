from flask import Blueprint, request, jsonify
from models import User, db, Post, PostVote, MBTIQuestion, UserTestResult, MBTIType
from sqlalchemy import func
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import datetime, timedelta
import random
from collections import defaultdict

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=30))  # 有效期30天
    return jsonify({"token": access_token}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    user = User.query.filter_by(email=email).first()
    if user:
        reset_token = user.generate_reset_token()
        print(f"Password reset link: http://localhost:3000/reset-password?token={reset_token}")
    return jsonify({"message": "If email exists, a reset link was sent"}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    token = request.json.get('token')
    new_password = request.json.get('new_password')
    user = User.query.filter_by(reset_token=token).first()
    if not user or user.reset_token_expiry < datetime.utcnow():
        return jsonify({"error": "Invalid or expired token"}), 400
    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()
    return jsonify({"message": "Password updated"}), 200

@auth_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    return jsonify({"valid": True}), 200

# 论坛相关路由
@auth_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([{
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'username': post.user.username,
        'created_at': post.created_at.isoformat(),
        'comment_count': len(post.comments)
    } for post in posts]), 200

@auth_bp.route('/posts', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = 10  # 每页10条
    posts = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'posts': [{
            'id': post.id,
            'title': post.title,
            'username': post.user.username,
            'avatar': post.user.avatar,  # 头像
            'votes': post.votes,         # 点赞数
            'comment_count': len(post.comments),
            'created_at': post.created_at.isoformat()
        } for post in posts.items],
        'total_pages': posts.pages,
        'current_page': page
    }), 200

# 创建帖子
@auth_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    new_post = Post(
        title=data['title'],
        content=data['content'],
        user_id=get_jwt_identity()
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({'message': 'Post created'}), 201

# 点赞功能
@auth_bp.route('/posts/<int:post_id>/vote', methods=['POST'])
@jwt_required()
def vote_post(post_id):
    user_id = get_jwt_identity()
    vote = PostVote.query.filter_by(user_id=user_id, post_id=post_id).first()
    
    if vote:
        db.session.delete(vote)
        Post.query.get(post_id).votes -= 1
    else:
        new_vote = PostVote(user_id=user_id, post_id=post_id)
        db.session.add(new_vote)
        Post.query.get(post_id).votes += 1
    
    db.session.commit()
    return jsonify({'votes': Post.query.get(post_id).votes}), 200


@auth_bp.route('/mbti-test/questions', methods=['GET'])
@jwt_required()
def get_mbti_questions():
    # 验证题库完整性（可选）
    dimensions = ['EI', 'SN', 'TF', 'JP']
    question_count = {
        'EI': MBTIQuestion.query.filter_by(dimension='EI').count(),
        'SN': MBTIQuestion.query.filter_by(dimension='SN').count(),
        # ...其他维度
    }
    if any(v < 10 for v in question_count.values()):
        return jsonify(error="题库尚未初始化完成"), 503

    # 优化后的查询逻辑
    selected_questions = []
    for dim in dimensions:
        questions = MBTIQuestion.query.filter_by(
            dimension=dim,
            is_verified=True  # 新增审核状态过滤
        ).order_by(func.random()).limit(10).all()  # 每个维度取10题
        
        selected_questions.extend([
            {
                "id": q.id,
                "text": q.text,
                "dimension": q.dimension,
                "options": [
                    {"text": q.option_a, "trait": dim[0], "weight": q.weight},
                    {"text": q.option_b, "trait": dim[1], "weight": q.weight}
                ]
            } for q in questions
        ])
    
    # 打乱题目顺序但保持维度平衡
    random.shuffle(selected_questions)
    return jsonify(questions=selected_questions), 200


@auth_bp.route('/mbti-test/submit', methods=['POST'])
@jwt_required()
def submit_mbti_test():
    user_id = get_jwt_identity()
    answers = request.json.get('answers', [])

    # 初始化维度得分跟踪器
    dimension_scores = defaultdict(float)
    processed_questions = set()

    # 事务处理
    try:
        for answer in answers:
            # 验证数据格式
            if 'question_id' not in answer or 'choice_index' not in answer:
                raise ValueError("Invalid answer format")
            
            question = MBTIQuestion.query.get_or_404(answer['question_id'])
            
            # 防止重复计分
            if question.id in processed_questions:
                continue
            processed_questions.add(question.id)
            
            # 确定选择的特质和权重
            choice = answer['choice_index']
            if choice not in (0, 1):
                raise ValueError("Invalid choice index")
            
            selected_trait = question.dimension[choice]
            dimension_scores[selected_trait] += question.weight  # 应用题目权重

        # 计算MBTI类型
        ei_ratio = dimension_scores.get('E', 0) - dimension_scores.get('I', 0)
        sn_ratio = dimension_scores.get('S', 0) - dimension_scores.get('N', 0)
        tf_ratio = dimension_scores.get('T', 0) - dimension_scores.get('F', 0)
        jp_ratio = dimension_scores.get('J', 0) - dimension_scores.get('P', 0)
        
        mbti_type = ''.join([
            'E' if ei_ratio >= 0 else 'I',
            'S' if sn_ratio >= 0 else 'N',
            'T' if tf_ratio >= 0 else 'F',
            'J' if jp_ratio >= 0 else 'P'
        ])

        # 保存完整结果
        new_result = UserTestResult(
            user_id=user_id,
            e_score=dimension_scores.get('E', 0),
            i_score=dimension_scores.get('I', 0),
            s_score=dimension_scores.get('S', 0),
            n_score=dimension_scores.get('N', 0),
            t_score=dimension_scores.get('T', 0),
            f_score=dimension_scores.get('F', 0),
            j_score=dimension_scores.get('J', 0),
            p_score=dimension_scores.get('P', 0),
            ei_ratio=ei_ratio,
            sn_ratio=sn_ratio,
            tf_ratio=tf_ratio,
            jp_ratio=jp_ratio,
            mbti_type=mbti_type
        )
        db.session.add(new_result)
        db.session.commit()

        return jsonify({
            "result_id": new_result.id,
            "mbti_type": mbti_type,
            "dimension_ratios": {
                "EI": ei_ratio,
                "SN": sn_ratio,
                "TF": tf_ratio,
                "JP": jp_ratio
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    

@auth_bp.route('/mbti-test/results/<int:result_id>', methods=['GET'])
@jwt_required()
def get_test_result(result_id):
    result = UserTestResult.query.get_or_404(result_id)
    mbti_profile = MBTIType.query.get(result.mbti_type)
    
    if not mbti_profile:
        return jsonify(error="MBTI类型数据未找到"), 404

    # 构建详细报告
    response_data = {
        "mbti_type": result.mbti_type,
        "dimension_scores": {
            "E": result.e_score,
            "I": result.i_score,
            "S": result.s_score,
            "N": result.n_score,
            "T": result.t_score,
            "F": result.f_score,
            "J": result.j_score,
            "P": result.p_score
        },
        "dimension_ratios": {
            "EI": result.ei_ratio,
            "SN": result.sn_ratio,
            "TF": result.tf_ratio,
            "JP": result.jp_ratio
        },
        "type_info": {
            "description": mbti_profile.description,
            "strengths": mbti_profile.strengths.split(';') if mbti_profile.strengths else [],
            "weaknesses": mbti_profile.weaknesses.split(';') if mbti_profile.weaknesses else [],
            "career_recommendations": mbti_profile.career_recommendations.split(';') if mbti_profile.career_recommendations else [],
            "famous_examples": mbti_profile.famous_people.split(';') if mbti_profile.famous_people else []
        },
        "test_metadata": {
            "test_date": result.created_at.isoformat(),
            "questions_answered": len(result.processed_questions)
        }
    }
    
    return jsonify(response_data), 200

