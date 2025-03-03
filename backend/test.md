# utils.py
def send_reset_email(email, token):
    # 本地测试时直接在控制台显示链接
    print(f"Password reset link for {email}: http://localhost:3000/reset-password?token={token}")