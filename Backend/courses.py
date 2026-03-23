from fastapi import APIRouter, Depends, HTTPException, status
from database import SessionLocal
import models, schemas
from sqlalchemy.orm import Session
from typing import List
import sqlalchemy
from auth import verify_session_token
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/courses", 
             summary="Add a new course",
             description="Adds a new course, assigns it's pre-requisite courses and ensures course added is not duplicate.")
def add_course(course: schemas.CourseCreate, db: Session = Depends(get_db), payload = Depends(verify_session_token)):
    already_exists = db.query(models.Course).where(models.Course.code == course.code).one_or_none()
    if already_exists:
        raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "Course Already Exists"}])
    
    try:
        courseAdd = models.Course(
            code = course.code,
            title = course.title,
            cHours = course.cHours
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
            print(element)
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

@router.get("/courses", response_model=List[schemas.CourseReturn],
            summary="Returns all courses",
            description="Return all courses' codes and titles only")
def list_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@router.get("/courses/full",
            summary="Return all courses",
            description="Return all courses' full data(id, code, title, credit hours)")
def list_full_courses(db : Session = Depends(get_db)):
    return db.query(models.Course).all()


@router.get("/preReqs/{code}", response_model=List[schemas.CourseReturn],
            summary="Pre-requisites of a course",
            description="Returns a list of all the pre-requistes of a course(code, title)")
def return_preReqs(code : str, db : Session = Depends(get_db)):
    try:
        temp = db.query(models.Prerequisite).where(models.Prerequisite.courseCode == code).all()
    except Exception as e:
        print("Error occured while fetching pre-requisites from the database")
        return []

    try:
        result = list()
        for element in temp:
            tmp = db.query(models.Course).where(models.Course.code == element.prereqCode).one_or_none()
            result.append(tmp)
    except Exception as e:
        print("Error occured while getting pre-requisites full detail")
    return result

@router.get("/searchCourses",
            summary="Search a Course",
            description="Returns 6 courses whose code or title(whatever specified, exclusive or) matches with the provided code or title")
def search_courses(searchQuery : str, searchBy : str, db : Session = Depends(get_db)):
    if searchBy == "code":
        courses = db.query(models.Course).where(models.Course.code.ilike(f"%{searchQuery}%") ).all()
    else:
        courses = db.query(models.Course).where(models.Course.title.ilike(f"%{searchQuery}%") ).all()
    return courses[0:6]

@router.get("/courses/{searchQuery}",
            summary="Searh a course",
            description="Searches for exact match of the course on basis of search type(code or title). If found returns the course, its follow ups and pre-requisites; otherwise it returns a list of suggested courses that match with search query.")
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
            degrees = db.execute(sqlalchemy.select(models.Degree.dname).join(models.Course, models.Course.code == course.code).join(models.SemesterCourses, (models.SemesterCourses.degreeId == models.Degree.id) & (models.SemesterCourses.coursecode == course.code))).scalars().all()
            return {"courseDetails" : course, "preReqs" : prereqs_list, "followUps" : follow_ups, "degrees" : degrees}
        
        if searchby == "code":
            suggestedCourses = db.query(models.Course).where(models.Course.code.ilike(f"%{searchQuery}%")).all()
        else:
            suggestedCourses = db.query(models.Course).where(models.Course.title.ilike(f"%{searchQuery}%") ).all()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Error occured while searching the course. Try Again"}])
    if not suggestedCourses:
        return {"msg" : "Not Found"}
    return {"suggested" : suggestedCourses}


@router.put("/courses/{code}",
            summary="Update course details",
            description="Given the code of an existing course, updates its title, credit hours and pre-requisite courses, whatever was specified in the payload.")
def update_course(code: str, course: schemas.CourseUpdate, db: Session = Depends(get_db), payload = Depends(verify_session_token)):
    try:
        db_data = db.query(models.Course).where(models.Course.code == code).one_or_none()
    except Exception as e:
        print("Error occured while fetching course with the id")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=[{"msg" : "Wrong course code"}])
    
    db_data.title = course.title
    db_data.cHours = course.cHours
    try:
        db.query(models.Prerequisite).where(models.Prerequisite.courseCode == code).delete()
        for preReq in course.preReqs:
            preReq_data_add = models.Prerequisite(
                courseCode = code,
                prereqCode = preReq["code"]
            )
            db.add(preReq_data_add)
        db.commit()
    except Exception as e:
        print("Error Occured while updating preRequistes for the course", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Server in maintainenace"}])
    return {"msg" : "Successfully updated Course"}


@router.delete("/courses/{code}/{option}",
               summary="Delete a course",
               description="Given an existing course code, deletes the course and remove it's pre-requiste relationships with other courses.")
def delete_course(code: str, option : bool, db: Session = Depends(get_db), payload = Depends(verify_session_token)):
    course = db.query(models.Course).where(models.Course.code == code).one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail=[{"msg": "Course not found"}])  
    try:
        db.query(models.Prerequisite).where( models.Prerequisite.courseCode == code).delete()
        db.query(models.Prerequisite).where(models.Prerequisite.prereqCode == code).delete()
        if option:
            db.execute(sqlalchemy.delete(models.SemesterCourses).where(models.SemesterCourses.coursecode == code))
        db.delete(course)
        db.commit()
    except sqlalchemy.exc.IntegrityError:
        raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "Course is still associated with degrees. Disassociate it first."}])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "An error occured on the server side while deleting the course. Contact server office."}])
    return {"detail": "Course deleted"}
