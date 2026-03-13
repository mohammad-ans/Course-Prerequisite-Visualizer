from pydantic import BaseModel, EmailStr
from typing import List

class CourseCreate(BaseModel):
    code: str
    title: str
    preReqs : List[dict]
    cHours : int

class CourseReturn(BaseModel):
    code : str
    title : str 

class Message(BaseModel):
    msg : str

class CourseUpdate(BaseModel):
    code: str
    title: str
    preReqs : List[dict]
    cHours : int

class PrerequisiteCreate(BaseModel):
    courseCode: str
    prereqCode: str

class Email_signin(BaseModel):
    email: EmailStr

class Add_user(BaseModel):
    email : EmailStr
    username : str

class OTP_verification(Email_signin):
    otp : str

class Degree_Add(BaseModel):
    dname : str
    dtype : str
    d_maxchours : int
    max_chours : int
    years : int

class Course_Associate(BaseModel):
    semNo : int
    degreeId : int
    courseCode : str
    courseHours : int

class SemCourse_Del(BaseModel):
    degreeId : int
    courseCode : str
    option : bool