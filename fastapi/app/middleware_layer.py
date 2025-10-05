from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

def add_middleware(app):
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        secret_key = "your-secret-key-change-in-production"

    # Add CORS first (order matters!)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:8000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],  # Add this
        max_age=3600,  # Add this - cache preflight for 1 hour
    )
