from flask import Blueprint, request, jsonify
from models import User, db, Post, PostVote, MBTIQuestion, MBTIOption, UserTestResult
from sqlalchemy import func
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import datetime, timedelta

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

@auth_bp.route('/api/posts', methods=['GET'])
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
@auth_bp.route('/api/posts', methods=['POST'])
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
@auth_bp.route('/api/posts/<int:post_id>/vote', methods=['POST'])
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


# 获取MBTI测试题目
@auth_bp.route('/api/mbti-test/questions', methods=['GET'])
@jwt_required()
def get_mbti_questions():
    # 每个维度随机选7题
    dimensions = ['EI', 'SN', 'TF', 'JP']
    selected_questions = []
    
    for dim in dimensions:
        questions = MBTIQuestion.query.filter_by(dimension=dim)\
            .order_by(func.random()).limit(7).all()
        selected_questions.extend(questions)
    
    return jsonify([{
        'id': q.id,
        'text': q.text,
        'dimension': q.dimension,
        'options': [{
            'id': o.id,
            'text': o.text
        } for o in q.options]
    } for q in selected_questions]), 200

# 提交测试结果
@auth_bp.route('/api/mbti-test/submit', methods=['POST'])
@jwt_required()
def submit_mbti_test():
    user_id = get_jwt_identity()
    answers = request.json['answers']  # [{question_id:1, option_id:3}, ...]
    
    # 初始化维度得分
    dimension_scores = {
        'E':0, 'I':0,
        'S':0, 'N':0,
        'T':0, 'F':0,
        'J':0, 'P':0
    }
    
    # 计算得分
    for answer in answers:
        option = MBTIOption.query.get(answer['option_id'])
        dimension_scores[option.trait_letter] += 1
    
    # 确定MBTI类型
    mbti_type = ''
    mbti_type += 'E' if dimension_scores['E'] > dimension_scores['I'] else 'I'
    mbti_type += 'S' if dimension_scores['S'] > dimension_scores['N'] else 'N'
    mbti_type += 'T' if dimension_scores['T'] > dimension_scores['F'] else 'F'
    mbti_type += 'J' if dimension_scores['J'] > dimension_scores['P'] else 'P'
    
    # 保存结果
    new_result = UserTestResult(
        user_id=user_id,
        scores=dimension_scores,
        mbti_type=mbti_type
    )
    db.session.add(new_result)
    db.session.commit()
    
    return jsonify({
        'result_id': new_result.id,
        'mbti_type': mbti_type
    }), 201

# 获取测试结果
@auth_bp.route('/api/personality-test/results/<int:result_id>', methods=['GET'])
@jwt_required()
def get_test_result(result_id):
    result = UserTestResult.query.get_or_404(result_id)
    personality = PersonalityType.query.get(result.dominant_trait)
    return jsonify({
        'trait': result.dominant_trait,
        'scores': result.trait_scores,
        'description': personality.description,
        'strengths': personality.strengths,
        'weaknesses': personality.weaknesses
    }), 200