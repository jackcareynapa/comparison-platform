from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
_key = os.getenv("OPENAI_API_KEY")
if _key:
    print("OPENAI_API_KEY loaded: {}***".format(_key[:6]))
else:
    print("OPENAI_API_KEY is NOT set (None)")
    
from routes import router

app = FastAPI(titile="Comparison Platform API")

app.add_middleware(CORSMiddleware, 
                   allow_origins=["http://localhost:3000"], 
                   allow_credentials=True, 
                   allow_methods=["*"], 
                   allow_headers=["*"])

app.include_router(router, prefix="/api")