from models import db, MBTIQuestion, MBTIOption, MBTIType


def create_test_data():
    # 示例MBTI问题（每个维度7题）
    # 示例EI维度问题
    ei_questions = [
    {
        "text": "当你需要充电时，你更倾向于",
        "options": [
            {"text": "与朋友聚会", "trait_letter": "E"},
            {"text": "独自阅读", "trait_letter": "I"}
        ]
    },
    {
        "text": "在小组讨论中你通常",
        "options": [
            {"text": "率先发言", "trait_letter": "E"},
            {"text": "先听他人意见", "trait_letter": "I"}
        ]
    },
    # 其他5道EI问题...
    ]

# 类似结构创建SN、TF、JP各7题
    questions = [
        # EI维度问题
        {"text": "在聚会中你通常", "dimension": "EI",
         "options": [
             {"text": "主动与陌生人交谈", "trait_letter": "E"},
             {"text": "只和熟人聊天", "trait_letter": "I"}
         ]},
        # SN维度问题
        {"text": "你更倾向于相信", "dimension": "SN",
         "options": [
             {"text": "具体的现实经验", "trait_letter": "S"},
             {"text": "创新的可能性", "trait_letter": "N"}
         ]},
        # 其他问题类似...
    ]

    # 插入测试数据
    if not MBTIQuestion.query.first():
        for q_data in questions:
            question = MBTIQuestion(
                text=q_data["text"],
                dimension=q_data["dimension"]
            )
            db.session.add(question)
            db.session.flush()  # 获取question.id
            
            for o_data in q_data["options"]:
                option = MBTIOption(
                    question_id=question.id,
                    text=o_data["text"],
                    trait_letter=o_data["trait_letter"]
                )
                db.session.add(option)
        
        # 插入MBTI类型描述
        mbti_types = [
            {"type_code": "ENTJ", "description": "天生的领导者...", 
             "strengths": "决策力强...", "weaknesses": "过于强势..."},
            # 其他15种类型...
        ]
        for t_data in mbti_types:
            mbti_type = MBTIType(**t_data)
            db.session.add(mbti_type)
        
        db.session.commit()
