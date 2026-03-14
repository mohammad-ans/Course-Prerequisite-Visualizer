from fastapi import FastAPI, Depends, HTTPException, Cookie, Response, status
from emailsend import send_otp
import random
import jwt
from sqlalchemy import select, delete
from datetime import datetime, timezone
import time
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, schemas
from models import Users, OTP_entry, Admins
from schemas import  OTP_verification, Email_signin
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Union, List
import auth, degrees, graph, users, courses
load_dotenv()

origins = [
    "http://localhost:5173",
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

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

