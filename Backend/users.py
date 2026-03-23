from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
from schemas import Add_user
from database import SessionLocal
from auth import verify_session_token
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/users")
def get_users(db : Session = Depends(get_db), payload = Depends(verify_session_token)):
    users = db.query(models.Users).all()
    return users

@router.delete("/users/{email}")
def del_users(email : str, db : Session = Depends(get_db), payload = Depends(verify_session_token)):
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

@router.post("/users")
def add_user(user : Add_user,db : Session = Depends(get_db), payload = Depends(verify_session_token)):
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
