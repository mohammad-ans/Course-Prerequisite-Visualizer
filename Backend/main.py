from fastapi import FastAPI
from database import SessionLocal, engine
import models
from dotenv import load_dotenv
import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import auth, degrees, graph, users, courses, chatbot
load_dotenv()

origins = [
    "https://yappyyap.xyz",
    "https://www.yappyyap.xyz",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(graph.router)
app.include_router(degrees.router)
app.include_router(users.router)
app.include_router(chatbot.router)

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__=="__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

