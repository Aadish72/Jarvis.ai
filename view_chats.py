# view_chats.py

from db import SessionLocal, Chat

# Create a session
db = SessionLocal()

# Query all chat records
chats = db.query(Chat).all()

# Display each record
for chat in chats:
    print("ðŸ†” ID:", chat.id)
    print("ðŸ‘¤ User Message:", chat.user_message)
    print("ðŸ¤– AI Response:", chat.ai_response)
    print("â° Timestamp:", chat.timestamp)
    print("-" * 50)

# Close session
db.close()