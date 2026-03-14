from fastapi import APIRouter, Session, HTTPException, status, Depends
from database import SessionLocal
import models

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/graph")
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
