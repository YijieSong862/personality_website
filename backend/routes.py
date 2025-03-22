from flask import Blueprint, request, jsonify, current_app
from models import User, db, Post, PostVote, MBTIQuestion, UserTestResult, MBTIType, Comment
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token,  decode_token
from datetime import datetime, timedelta
import random
from collections import defaultdict
from dotenv import load_dotenv
import os
import openai
import re

# 加载环境变量
load_dotenv()

# 从环境变量中获取 OpenAI API 密钥
openai.api_key = os.getenv('OPENAI_API_KEY')

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

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=30))  # 有效期30天
    return jsonify({"token": access_token, "user":data['username']}), 200

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
def validate_token():
    auth_header = request.headers.get("Authorization")
    with current_app.app_context():
        print("jwt key===>", current_app.config["JWT_SECRET_KEY"])
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]  # 获取 Bearer 后面的 token
    else:
        token = None  # 处理无 token 的情况
    try:
        decoded = decode_token(token)
        print("decode token====>", decoded)
        return jsonify({"valid": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 论坛相关路由
@auth_bp.route('/posts', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = 10  # 每页10条
    posts = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page)
    print("====> posts:", posts)
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

@auth_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post_detail(post_id):
    """
    获取具体帖子的详情信息
    :param post_id: 帖子的 ID
    :return: JSON 格式的帖子详情
    """
    # 查询帖子
    post = Post.query.filter_by(id=post_id).first()
    if not post:
        return jsonify({'message': 'Post not found'}), 404  # 如果帖子不存在，返回 404 错误

    # 获取帖子详情
    post_detail = {
        'id': post.id,
        'title': post.title,
        'content': post.content,  # 添加帖子内容
        'username': post.user.username,
        'avatar': post.user.avatar,
        'votes': post.votes,
        'comment_count': len(post.comments),
        'created_at': post.created_at.isoformat(),
        'comments': [  # 添加帖子的评论信息
            {
                'id': comment.id,
                'content': comment.content,
                'username': comment.user.username,
                'created_at': comment.created_at.isoformat()
            } for comment in post.comments
        ]
    }

    return jsonify(post_detail), 200

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
    print("vote:====> ", post_id, user_id)
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


# 获取帖子下的所有评论
@auth_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.desc()).all()
    return jsonify([
        {
            'id': comment.id,
            'content': comment.content,
            'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'user_id': comment.user_id
        } for comment in comments
    ]), 200

# 创建评论
@auth_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'content' not in data or not data['content'].strip():
        return jsonify({'error': 'Content cannot be empty'}), 400
    
    comment = Comment(
        content=data['content'].strip(),
        post_id=post_id,
        user_id=user_id,
        created_at=datetime.utcnow()
    )
    
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        'id': comment.id,
        'content': comment.content,
        'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'user_id': comment.user_id
    }), 201

# 删除评论
@auth_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)

    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    if comment.user_id != user_id:
        return jsonify({'error': 'You can only delete your own comments'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({'message': 'Comment deleted'}), 200


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
    if any(v < 5 for v in question_count.values()):
        return jsonify(error="题库尚未初始化完成"), 503

    # 优化后的查询逻辑
    selected_questions = []
    for dim in dimensions:
        questions = MBTIQuestion.query.filter_by(
            dimension=dim
        ).order_by(func.random()).limit(5).all() 
        
        selected_questions.extend([
            {
                "id": q.id,
                "text": q.question_text,
                "dimension": q.dimension,
                "options": [
                    {"text": q.option_a, "trait": dim[0]},
                    {"text": q.option_b, "trait": dim[1]}
                ]
            } for q in questions
        ])
    
    # 打乱题目顺序但保持维度平衡
    random.shuffle(selected_questions)
    return jsonify(questions=selected_questions), 200


@auth_bp.route('/mbti-test/submit', methods=['POST'])
@jwt_required()
def submit_mbti_test():
    
    """处理MBTI测试提交，计算维度得分并生成测试结果"""
    user_id = get_jwt_identity()
    answers = request.get_json().get('answers', [])
    # 初始化得分跟踪器和已处理题目集合
    dimension_scores = defaultdict(int)
    processed_questions = set()
    
    try:
        # 开始数据库事务
        with db.session.begin():
            for answer in answers:
                # 数据格式验证
                if not isinstance(answer, dict):
                    raise ValueError("答案格式错误，应为字典列表")
                
                # 必须字段验证
                #required_fields = {'question_id', 'choice_index'}
                required_fields = {'question_id'}
                if not required_fields.issubset(answer.keys()):
                    missing = required_fields - answer.keys()
                    raise ValueError(f"缺少必要字段：{', '.join(missing)}")
                
                question_id = answer['question_id']
                if 'choice_index' == None:   # something wrong in frontend
                    choice_idx = answer['choice_index']
                else:
                    choice_idx = random.randint(0, 1)
               
                # 有效性校验
                if not (0 <= choice_idx <= 1):
                    raise ValueError("choice_index必须是0或1")
                
                # 获取题目记录
                question = MBTIQuestion.query.get(question_id)
                if not question:
                    raise ValueError(f"问题ID {question_id} 不存在")
                
                # 防止重复计分
                if question.id in processed_questions:
                    continue
                processed_questions.add(question.id)
                
                # 获取选项类型和权重
                if choice_idx == 0:
                    selected_type = question.option_a_type
                    #weight = question.weight
                    weight = 1
                else:
                    selected_type = question.option_b_type
                    #weight = question.weight
                    weight = 1
                
                # 类型有效性校验
                valid_types = {'E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'}
                if selected_type not in valid_types:
                    raise ValueError(f"无效的类型：{selected_type}（问题ID：{question_id}）")
                
                # 累加维度得分
                dimension_scores[selected_type] += weight
            
            # 计算MBTI类型
            ei_ratio = dimension_scores.get('E', 0) - dimension_scores.get('I', 0)
            sn_ratio = dimension_scores.get('S', 0) - dimension_scores.get('N', 0)
            tf_ratio = dimension_scores.get('T', 0) - dimension_scores.get('F', 0)
            jp_ratio = dimension_scores.get('J', 0) - dimension_scores.get('P', 0)
            
            mbti_type = "".join([
                'E' if ei_ratio >= 0 else 'I',
                'S' if sn_ratio >= 0 else 'N',
                'T' if tf_ratio >= 0 else 'F',
                'J' if jp_ratio >= 0 else 'P'
            ])

            birthday_str = request.get_json().get('birthday')
            birthday = None
            if birthday_str:
                try:
                    birthday = datetime.strptime(birthday_str, '%Y-%m-%d').date()  # 假设日期格式为YYYY-MM-DD
                except ValueError:
                    return jsonify({"error": "Invalid birthday format. Use YYYY-MM-DD."}), 400
            # 创建测试结果记录
            test_result = UserTestResult(
                user_id=user_id,
                e_score=dimension_scores.get('E', 0),
                i_score=dimension_scores.get('I', 0),
                s_score=dimension_scores.get('S', 0),
                n_score=dimension_scores.get('N', 0),
                t_score=dimension_scores.get('T', 0),
                f_score=dimension_scores.get('F', 0),
                j_score=dimension_scores.get('J', 0),
                p_score=dimension_scores.get('P', 0),
                mbti_type=mbti_type,
                birthday=birthday,
                first_word = request.get_json().get('first_word'),
                life_priority = request.get_json().get('life_priority')

            )
            db.session.add(test_result)
            # 返回成功响应
        return jsonify({
            "result_id": test_result.id,
               "mbti_type": mbti_type,
                "scores": {
                    "E": dimension_scores.get('E', 0),
                    "I": dimension_scores.get('I', 0),
                    "S": dimension_scores.get('S', 0),
                    "N": dimension_scores.get('N', 0),
                    "T": dimension_scores.get('T', 0),
                    "F": dimension_scores.get('F', 0),
                    "J": dimension_scores.get('J', 0),
                    "P": dimension_scores.get('P', 0)
                }
        }), 201
    
    except SQLAlchemyError as e:
        # 数据库错误处理
        db.session.rollback()
        error_msg = str(e.orig)
        return jsonify({"error": f"数据库错误：{error_msg}"}), 500
      
    except Exception as e:
        # 通用错误处理
        db.session.rollback()
        return jsonify({"error": f"提交失败：{str(e)}"}), 400
    

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
        "type_info": {
            "description": mbti_profile.profile,
            "development": mbti_profile.development,
            "books": mbti_profile.books,
            "career_recommendations": mbti_profile.career_recommendations
        },
        "test_metadata": {
            "test_date": result.created_at.isoformat()
        }
    }
    
    return jsonify(response_data), 200


@auth_bp.route('/mbti-test/bagua_results/<int:result_id>', methods=['GET'])
@jwt_required()
def get_ai_result(result_id):
    result = UserTestResult.query.get_or_404(result_id)


    if not result.bagua_suggestion:
        prompt = f"""
        请根据以下信息提供一个结合 MBTI 类型和易经八卦的英语的测字建议：
        
        用户的 MBTI 类型是: {result.mbti_type}.
        用户要测的字是：{result.first_word}.
        用户关心的问题是: {result.life_priority}. （例如：健康、婚姻、事业等）
        
        结合这两者，提供个性化的建议，帮助用户更好地理解自己在某一方面的运势或挑战，并提出实用的建议。
        
        结果应简洁、明了，并且具有深刻的文化和心理意义。
        单词数请在1000字以内。
        输出结构化的响应，包括以下字段：
        - summary
        - Word Analysis
        - I Ching Interpretation
        - Key Messages
        - Final Advice
        """
        prompt = prompt.encode("utf-8").decode("utf-8")


        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "你是一个基于MBTI和八卦提供建议的专家。"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )

            suggestion = response.choices[0].message.content.strip()
            result.bagua_suggestion = suggestion.encode("utf-8").decode("utf-8")
            db.session.commit()

            print("===>bagua:", prompt)
            print("===>bagua lai le:", suggestion)
            summary = re.search(r"Summary:\s*(.*?)\s*Word Analysis:", suggestion, re.DOTALL)
            word_analysis = re.search(r"Word Analysis:\s*(.*?)\s*I Ching Interpretation:", suggestion, re.DOTALL)
            iching_interpretation = re.search(r"I Ching Interpretation:\s*(.*?)\s*Key Messages:", suggestion, re.DOTALL)
            key_messages = re.search(r"Key Messages:\s*(.*?)\s*Final Advice:", suggestion, re.DOTALL)
            final_advice = re.search(r"Final Advice:\s*(.*)", suggestion, re.DOTALL)
    
            # Return the structured response as a dictionary
            response_data = {
                "summary": summary.group(1).strip() if summary else None,
                "word_analysis": word_analysis.group(1).strip() if word_analysis else None,
                "i_ching_interpretation": iching_interpretation.group(1).strip() if iching_interpretation else None,
                "key_messages": [msg.strip() for msg in key_messages.group(1).strip().split('\n')] if key_messages else [],
                "final_advice": final_advice.group(1).strip() if final_advice else None
            }
            return jsonify(response_data), 200
        except Exception as e:
            print(f"无法生成八卦建议，发生错误: {e}")
            return jsonify(error="ai suangua error"), 500
    else:
        return jsonify({"bagua_suggestion": result.bagua_suggestion}), 200




@auth_bp.route('/mbti-test/test_results', methods=['GET'])
@jwt_required()  # 确保请求包含有效的JWT token
def get_test_results():
    # 获取当前用户的ID
    user_id = get_jwt_identity()

    # 从数据库中查询该用户的所有测试结果
    test_results = UserTestResult.query.filter_by(user_id=user_id).all()

    # 如果没有找到测试结果，返回空列表
    if not test_results:
        return jsonify([])

    # 格式化查询结果
    results = []
    for result in test_results:
        results.append({
            'id': result.id,
            'test_time': result.created_at.strftime('%Y-%m-%d %H:%M:%S'), 
            'mbti_type': result.mbti_type
        })
    
    # 返回测试结果
    return jsonify(results)