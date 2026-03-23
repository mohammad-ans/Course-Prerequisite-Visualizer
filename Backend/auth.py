from fastapi import APIRouter, Depends, HTTPException, Response, status, Cookie
import jwt
from database import SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session
import os
from models import Users, OTP_entry, Admins
from schemas import OTP_verification, Email_signin
from emailsend import send_otp
import random
from datetime import datetime, timezone
from sqlalchemy import select
import time

router = APIRouter()

ALGORITHM = "HS256"
PRIVATE_KEY = os.getenv("PRIVATE_KEY")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def create_session_token(data:dict):
    token = jwt.encode(data, PRIVATE_KEY, algorithm=ALGORITHM)
    return token

async def verify_session_token(session_token: Annotated[str | None, Cookie()] = None):
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=[{"msg" : "No session found."}])
    try:
        payload = jwt.decode(session_token, PRIVATE_KEY, ALGORITHM)
        if not payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=[{"msg": "Payload not found"}])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=[{"msg": "Invalid Token"}])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=[{"msg" : "Expired Token"}])
    return payload


@router.post("/signin") 
async def signin(data : Email_signin, db : Session = Depends(get_db)):
    # user = db.query(Users).filter_by(email = data.email).first()
    user = db.execute(select(Users).where(Users.email == data.email)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail=[{"msg":"User Not Found"}])
    # already_exists = db.query(OTP_entry).filter_by(email = data.email).update({"otp":random_otp})
    random_otp = str(random.randint(10, 99)) + chr(65 + random.randint(0, 26)) + str(random.randint(10, 99)) + chr(65 + random.randint(0, 26))
    already_exists = db.execute(select(OTP_entry).where(OTP_entry.email == data.email)).scalar_one_or_none()
    try:
        email_response = await send_otp(data.email, random_otp)
    except:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=[{"msg" : "Service not available. Try Later."}])
    if already_exists:
        already_exists.otp = random_otp
        already_exists.expiry_time=OTP_entry.get_expiry_time()
        already_exists.creation_time = datetime.now(timezone.utc)
    else:
        data_for_dbadd = OTP_entry(
            email = data.email,
            username = user.username,
            otp = random_otp
        )
        db.add(data_for_dbadd)
    db.commit()
        
    return {"msg" : "Success"}

@router.post("/acc-verify")
async def verify(verification_data : OTP_verification, response: Response, db : Session = Depends(get_db)):
    # otp_entry = db.query(OTP_entry).filter_by(email=verification_data.email, otp=verification_data.otp).first()   #.order_by(OTP_entry.creation_time.desc())
    otp_entry = db.execute(select(OTP_entry).where((OTP_entry.email == verification_data.email) & (OTP_entry.otp == verification_data.otp))).scalar_one_or_none()
    if not otp_entry:
        raise HTTPException(status_code=401, detail=[{"msg":"Invalid OTP"}])
    if otp_entry.expiry_time < (datetime.now(timezone.utc)):
        raise HTTPException(status_code=401, detail=[{"msg":"OTP expired"}])
    
    # user = db.query(Users).filter_by(email = verification_data.email).first()
    user = db.execute(select(Users).where(Users.email == verification_data.email)).scalar_one()
    # admin_check = db.query(Admins).filter(email=verification_data.email).first()
    admin_check = db.execute(select(Admins).where(Admins.email == verification_data.email)).scalar_one_or_none()
    type_ = "Permanent"
    if admin_check:
        type_="admin"
    payload = {"username" : user.username, "type" : type_, "exp" : int(time.time()) + 21600}
    token = await create_session_token(payload)
    response.set_cookie(
        key="session_token",
        value = token,
        httponly = True,
        secure = True,
        samesite = "none",
        max_age=21600,
        path="/",
        domain=".yappyyap.xyz"
        )
    db.delete(otp_entry)
    db.commit()
    return {"msg":"Success", "username" : user.username, "type" : type_}



@router.get("/logincheck")
async def logincheck(message = Depends(verify_session_token), db : Session = Depends(get_db)):
    username = message["username"]
    type_ = message["type"]
    return {
        "msg" : "Success",
        "username" : username,
        "type" : type_
    }

@router.get("/logout")
async def logout(response : Response, message = Depends(verify_session_token)):
    response.delete_cookie(key="session_token")
    return {"msg" : "Success"}