from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from database import Base
from datetime import datetime, timedelta, timezone

class Course(Base):
    __tablename__ = "courses"
    code = Column(String, primary_key=True)
    title = Column(String)

class Prerequisite(Base):
    __tablename__ = "prerequisites"
    id = Column(Integer, primary_key=True, autoincrement=True)
    courseCode = Column(String, ForeignKey("courses.code"))
    prereqCode = Column(String, ForeignKey("courses.code"))

class Degree(Base):
    __tablename__ = "degree"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dname = Column(String)
    dtype = Column(String)
    d_chours = Column(Integer)
    max_chours = Column(Integer)
    years = Column(Integer)

class SemesterCourses(Base):
    __tablename__ =  "degreecourses"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    semNo = Column(Integer)
    degreeId = Column(Integer, ForeignKey("degree.id"))
    coursecode = Column(String, ForeignKey("courses.code"))

class Admins(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String)
    email = Column(String)


class OTP_entry(Base):
    __tablename__ = "otps"

    @staticmethod
    def get_expiry_time():
        return datetime.now(timezone.utc) + timedelta(minutes=4)
    @staticmethod
    def get_current_time():
        return datetime.now(timezone.utc)
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, primary_key=True)
    email = Column(String, index=True)
    otp = Column(String)
    creation_time = Column(DateTime(timezone=True), default=get_current_time)
    expiry_time = Column(DateTime(timezone=True), default=get_expiry_time)


class Users(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    username = Column(String, index=True)
