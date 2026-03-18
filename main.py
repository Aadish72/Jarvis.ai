import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import traceback

# Try to import database components
try:
    from db import SessionLocal, Chat
    DB_AVAILABLE = True
    print("✅ Database connection available")
except ImportError as e:
    print(f"⚠️  Database not available: {e}")
    DB_AVAILABLE = False

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    print("WARNING: GEMINI_API_KEY environment variable not set. Please ensure it's in your .env file.")
    print("For testing, you can create a .env file with: GEMINI_API_KEY=your_actual_api_key_here")
else:
    print("✅ Gemini API key loaded successfully")

# Configure the genai library with your API key
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

app = FastAPI(title="Jarvis AI", description="AI Chat Assistant")

# Fixed CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000", "*"],  # Fixed: was empty string
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Fixed: was empty string
    allow_headers=["*"],
)

# Mount static files (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic model for incoming chat messages
class ChatMessage(BaseModel):
    message: str

# Root route to serve the main HTML file
@app.get("/", response_class=HTMLResponse)
async def serve_index():
    try:
        # Try to serve from root first, then static folder
        if os.path.exists("index.html"):
            return FileResponse("index.html")
        elif os.path.exists("static/index.html"):
            return FileResponse("static/index.html")
        else:
            raise HTTPException(status_code=404, detail="index.html not found")
    except Exception as e:
        print(f"❌ Error serving index: {e}")
        raise HTTPException(status_code=500, detail="Could not serve index page")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(gemini_api_key),
        "database_available": DB_AVAILABLE
    }

# API endpoint for chat messages
@app.post("/api/chat")
async def handle_chat_message(chat_message: ChatMessage):
    try:
        user_input = chat_message.message
        print(f"🔥 Received from frontend: {user_input}")

        # Check if Gemini API key is available
        if not gemini_api_key:
            raise HTTPException(
                status_code=500, 
                detail="AI service not configured. Please check server configuration."
            )

        # Generate AI response
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(user_input)
            print("✅ Gemini response object received.")

            ai_reply = response.text
            print(f"🧠 Gemini reply text: {ai_reply}")

        except Exception as gemini_error:
            print(f"❌ Gemini API Error: {gemini_error}")
            ai_reply = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."

        # Save to database if available
        if DB_AVAILABLE:
            try:
                db = SessionLocal()
                chat_entry = Chat(user_message=user_input, ai_response=ai_reply)
                db.add(chat_entry)
                db.commit()
                db.close()
                print("✅ Chat saved to database")
            except Exception as db_error:
                print(f"⚠️ Database save failed: {db_error}")
                # Don't fail the request if database save fails
        else:
            print("ℹ️ Database not available, skipping save")

        # Return the AI's reply
        return {"reply": ai_reply}

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the full error for debugging
        error_traceback = traceback.format_exc()
        print(f"❌ Unexpected error in chat endpoint:")
        print(error_traceback)
        
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "detail": "Sorry, I couldn't process your request. Please try again later.",
                "debug_info": str(e) if os.getenv("DEBUG") == "true" else None
            }
        )

# Get all chats endpoint (for loading chat history)
@app.get("/api/chats")
async def get_all_chats():
    if not DB_AVAILABLE:
        return []
    
    try:
        db = SessionLocal()
        chats = db.query(Chat).all()
        db.close()
        
        return [
            {
                "user_message": chat.user_message,
                "ai_response": chat.ai_response,
                "timestamp": chat.timestamp if hasattr(chat, 'timestamp') else None
            }
            for chat in chats
        ]
    except Exception as e:
        print(f"❌ Error fetching chats: {e}")
        return []

# Run the application
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Jarvis AI server...")
    print("📁 Make sure your files are in the correct structure:")
    print("   - index.html (in root or static folder)")
    print("   - static/style.css")
    print("   - static/script.js")
    print("   - .env file with GEMINI_API_KEY")
    
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)