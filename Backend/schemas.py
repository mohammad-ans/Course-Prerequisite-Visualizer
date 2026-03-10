from pydantic import BaseModel, EmailStr
from typing import List

class CourseCreate(BaseModel):
    code: str
    title: str
    preReqs : List[dict]

class CourseUpdate(BaseModel):
    code: str
    title: str
    preReqs : List[dict]

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
    d_chours : int
    max_chours : int
    years : int

class Course_Associate(BaseModel):
    semNo : int
    degreeId : int
    courseCode : str 