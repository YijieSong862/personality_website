from flask import Blueprint, request, jsonify
from app.models import User, db
from app.utils.mail import send_password_reset_email
import re
import datetime

bp = Blueprint('main', __name__, url_prefix='/api')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # 验证数据
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    new_user = User(
        username=data.get('username', data['email'].split('@')[0]),
        email=data['email']
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created'}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user.last_login = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    user = User.query.filter_by(email=email).first()
    
    if user:
        token = user.generate_reset_token()
        send_password_reset_email(user, token)
        return jsonify({'message': 'Reset instructions sent'}), 200
    
    return jsonify({'error': 'Email not found'}), 404

@bp.route('/reset-password', methods=['POST'])
def reset_password():
    token = request.json.get('token')
    user = User.verify_reset_token(token)
    
    if not user:
        return jsonify({'error': 'Invalid or expired token'}), 400
    
    password = request.json.get('new_password')
    if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$', password):
        return jsonify({'error': 'Password must be 8+ chars with letters and numbers'}), 400
    
    user.set_password(password)
    db.session.commit()
    return jsonify({'message': 'Password updated'}), 200