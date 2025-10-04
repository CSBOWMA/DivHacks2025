from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

def add_middleware(app):


    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        secret_key = "your-secret-key-change-in-production"

    # adds the session middleware
    app.add_middleware(SessionMiddleware, secret_key=secret_key)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:8000"],  
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )
