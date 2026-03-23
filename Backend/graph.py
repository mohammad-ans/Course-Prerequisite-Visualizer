from fastapi import APIRouter, HTTPException, status, Depends
from database import SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import select
import models

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/graph/{degree}")
def get_graph(degree : str, db : Session = Depends(get_db)):
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
    try:
        courses_return = db.execute(select(models.Course).join(models.SemesterCourses, models.SemesterCourses.coursecode == models.Course.code).where(models.SemesterCourses.degreeId == degree)).scalars().all()
        courses = [element.code for element in courses_return]
        prereqs = db.execute(select(models.Prerequisite).where(models.Prerequisite.courseCode.in_(courses), models.Prerequisite.prereqCode.in_(courses))).scalars().all()
        return {
            "nodes": [{"id": c.code, "label": c.title} for c in courses_return],
            "links": [{"source": p.prereqCode, "target": p.courseCode} for p in prereqs]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Error occured while fetching graphh data"}])
