# Jarvis AI 🤖

This is a simple AI chat assistant I built using FastAPI and basic frontend (HTML, CSS, JS).
I made this project to understand how frontend connects with backend APIs and how AI responses can be integrated.

## Features

* Chat with AI
* Stores previous chats
* Simple and clean UI
* Sidebar with recent chats
* Basic file/image attachment UI

## Tech Stack

* Python (FastAPI)
* HTML, CSS, JavaScript
* Google Gemini API

## How to run

1. Go to the project folder

2. Install dependencies:
   pip install fastapi uvicorn python-dotenv google-generativeai

3. Create a `.env` file and add:
   GEMINI_API_KEY=your_api_key

4. Run the server:
   python3 -m uvicorn main:app --reload

5. Open in browser:
   http://127.0.0.1:8000

## Project Structure

* main.py → backend
* db.py → database
* view_chats.py → view stored chats
* static/ → CSS & JS
* index.html → frontend

## Notes

* chat.db is not uploaded (local database)
* .env is not uploaded for security

## About

This is a practice project to learn full-stack development and API integration.
