from fastapi import FastAPI, Depends, HTTPException, Cookie, Response, status
from emailsend import send_otp
import random
import jwt
from sqlalchemy import select
from datetime import datetime, timezone
import time
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, schemas
from models import Users, OTP_entry, Admins
from schemas import  OTP_verification, Email_signin
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
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

models.Base.metadata.create_all(bind=engine)

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
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=[{"msg": "Payload not found"}])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=[{"msg": "Invalid Token"}])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=[{"msg" : "Expired Token"}])
    return payload



@app.get("/courses")
def list_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@app.get("/preReqs/{code}")
def return_preReqs(code : str, db : Session = Depends(get_db)):
    try:
        temp = db.query(models.Prerequisite).where(models.Prerequisite.courseCode == code).all()
    except Exception as e:
        print("Error occured while fetching pre-requisites from the database")
        print(e)
        return []

    try:
        result = list()
        for element in temp:
            tmp = db.query(models.Course).where(models.Course.code == element.prereqCode).one_or_none()
            result.append(tmp)
    except Exception as e:
        print("Error occured while getting pre-requisites full detail")
    return result

@app.get("/searchCourses")
def search_courses(searchQuery : str, searchBy : str, db : Session = Depends(get_db)):
    if searchBy == "code":
        courses = db.query(models.Course).where(models.Course.code.ilike(f"%{searchQuery}%") ).all()
    else:
        courses = db.query(models.Course).where(models.Course.title.ilike(f"%{searchQuery}%") ).all()
    return courses[0:6]

@app.get("/courses/{searchQuery}")
def get_course(searchQuery: str, searchby : str, db: Session = Depends(get_db)):
    try:
        if searchby == "code":
            course = db.query(models.Course).where(models.Course.code == searchQuery.upper()).first()
        else:
            course = db.query(models.Course).where(models.Course.title == searchQuery.upper() ).first()
        if course:
            follow_ups = []
            try:
                follow_ups_names = db.query(models.Prerequisite).where(models.Prerequisite.prereqCode == course.code).all()
                for element in follow_ups_names:
                    follow_ups.append(db.query(models.Course).where(models.Course.code == element.courseCode).one())
            except Exception as E:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Error occured while fetching course post options"}])
            prereqs_list = return_preReqs(course.code, db)
            return {"courseDetails" : course, "preReqs" : prereqs_list, "followUps" : follow_ups}
        
        if searchby == "code":
            suggestedCourses = db.query(models.Course).where(models.Course.code.ilike(f"%{searchQuery}%")).all()
        else:
            suggestedCourses = db.query(models.Course).where(models.Course.title.ilike(f"%{searchQuery}%") ).all()
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Error occured while searching the course. Try Again"}])
    if not suggestedCourses:
        return {"msg" : "Not Found"}
    return {"suggested" : suggestedCourses}


@app.put("/courses/{code}")
def update_course(code: str, course: schemas.CourseUpdate, db: Session = Depends(get_db)):
    try:
        db_data = db.query(models.Course).where(models.Course.code == code).one_or_none()
    except Exception as e:
        print("Error occured while fetching course with the id")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=[{"msg" : "Wrong course code"}])
    
    db_data.title = course.title

    try:
        db.query(models.Prerequisite).where(models.Prerequisite.courseCode == code).delete()
        for preReq in course.preReqs:
            preReq_data_add = models.Prerequisite(
                courseCode = code,
                prereqCode = preReq["code"]
            )
            db.add(preReq_data_add)
    except Exception as e:
        print("Error Occured while updating preRequistes for the course", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Server in maintainenace"}])
    db.commit()
    return {"msg" : "Successfully updated Course"}


@app.delete("/courses/{code}")
def delete_course(code: str, db: Session = Depends(get_db)):
    course = db.query(models.Course).where(models.Course.code == code).one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail=[{"msg": "Course not found"}])  
    try:
        db.query(models.Prerequisite).where( models.Prerequisite.courseCode == code).delete()
        db.query(models.Prerequisite).where(models.Prerequisite.prereqCode == code).delete()
        db.delete(course)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "An error occured on the server side while deleting the course. Contact server office."}])
    db.commit()
    return {"detail": "Course deleted"}


@app.post("/courses")
def add_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    already_exists = db.query(models.Course).where(models.Course.code == course.code).one_or_none()
    if already_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=[{"msg" : "Course Already Exists"}])
    
    try:
        courseAdd = models.Course(
            code = course.code,
            title = course.title
        )
        db.add(courseAdd)
        db.commit()
    except Exception as e:
        print("Error occured while adding course to the database. Post request at /courses")
    
    # for element in course.preReqs:
    #     b = filter(lambda x : x != element)
    #     while b
    
    try:
        for element in course.preReqs:
            preReqAdd = models.Prerequisite(
                courseCode = course.code,
                prereqCode = element["code"]
            )
            db.add(preReqAdd)
        db.commit()
    except Exception as e:
        print("Error occured while adding preRequisites for the course. Post request at /course")
        print(e)
    return course.code

@app.get("/users")
def get_users(db : Session = Depends(get_db)):
    users = db.query(models.Users).all()
    return users

@app.delete("/users/{email}")
def del_users(email : str, db : Session = Depends(get_db)):
    try:
        user = db.query(models.Users).where(models.Users.email == email).one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=[{"msg" : "User Not Found"}])
        db.delete(user)
        db.commit()
    except Exception as e:
        print("Error occured while deleting user")
        raise HTTPException(status_code=status.WS_1011_INTERNAL_ERROR, detail=[{"msg" : "Could not delete user"}])
    return {"msg" : f"Successfully deleted user with {email}"}

@app.post("/users")
def add_user(user : schemas.Add_user,db : Session = Depends(get_db)):
    try:
        user_data = models.Users(
            email = user.email,
            username = user.username
        )
        db.add(user_data)
        db.commit()
    except Exception as e:
        print("Error occured while adding user to the database")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "User Not Added"}])
    return {"msg" : f"{user.username}"}

@app.get("/graph")
def get_graph(db : Session = Depends(get_db)):
#     return{
#   "nodes": [
#     { "id": 'CS101', "label": 'Intro to CS' },
#     { "id": 'CS102', "label": 'Data Structures' },
#     { "id": 'CS103', "label": 'Algorithms' },
#     { "id": 'CS104', "label": 'Databases' },
#     { "id": 'CS105', "label": 'Operating Systems' }
#   ],
#   "links": [
#     { "source": 'CS101', "target": 'CS102' },
#     { "source": 'CS101', "target": 'CS103' },
#     { "source": 'CS102', "target": 'CS104' },
#     { "source": 'CS103', "target": 'CS105' }
#   ]
# }

    courses = db.query(models.Course).all()
    prereqs = db.query(models.Prerequisite).all()

    return {
        "nodes": [{"id": c.code, "label": c.title} for c in courses],
        "links": [{"source": p.prereqCode, "target": p.courseCode} for p in prereqs]
    }


@app.post("/signin") 
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

@app.post("/acc-verify")
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
    payload = {"username" : user.username, "type" : type_, "exp" : int(time.time()) + 1800}
    token = await create_session_token(payload)
    response.set_cookie(
        key="session_token",
        value = token,
        httponly = True,
        secure = True,
        samesite = "none",
        max_age=1800,
        path="/",
        domain=".yappyyap.xyz"
        )
    db.delete(otp_entry)
    db.commit()
    return {"msg":"Success", "username" : user.username, "type" : type_}



@app.get("/logincheck")
async def logincheck(message = Depends(verify_session_token), db : Session = Depends(get_db)):
    username = message["username"]
    type_ = message["type"]
    return {
        "msg" : "Success",
        "username" : username,
        "type" : type_
    }

@app.get("/logout")
async def logout(response : Response, message = Depends(verify_session_token)):
    response.delete_cookie(key="session_token")
    return {"msg" : "Success"}