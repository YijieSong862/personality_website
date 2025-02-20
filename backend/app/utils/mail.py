from flask_mail import Message
from threading import Thread
from flask import current_app, render_template
from app import mail

def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

def send_password_reset_email(user, token):
    app = current_app._get_current_object()
    reset_url = f"{app.config['FRONTEND_URL']}/reset-password?token={token}"
    
    msg = Message(
        "Password Reset Request",
        recipients=[user.email],
        html=f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset</h2>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_url}" 
               style="display: inline-block; padding: 12px 24px; 
                      background-color: #2563eb; color: white; 
                      text-decoration: none; border-radius: 4px;
                      margin: 20px 0;">
                Reset Password
            </a>
            <p>This link will expire in 1 hour.</p>
            <hr style="border-color: #e5e7eb;">
            <p style="color: #6b7280;">
                If you didn't request this, please ignore this email.
            </p>
        </div>
        '''
    )
    Thread(target=send_async_email, args=(app, msg)).start()