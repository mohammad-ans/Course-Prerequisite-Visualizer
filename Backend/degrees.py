from fastapi import APIRouter,  HTTPException, status, Depends
from database import SessionLocal
from sqlalchemy import select, delete, update, func, and_
from sqlalchemy.orm import Session
import models, schemas
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/degrees",
            summary="Return all degrees",
            description="Returns all degrees' data")
def get_degrees(db : Session = Depends(get_db)):
    try:
        degreeData = db.query(models.Degree).all()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Error occured while getting degrees"}])
    return degreeData

@router.get("/tdegrees/{dtype}",
            summary="Degrees's by type",
            description="Returns all degrees' data of the required parameter")
def get_tdegrees(dtype : str, db : Session = Depends(get_db)):
    try:
        degreeData = db.query(models.Degree).where(models.Degree.dtype == dtype).all()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Error occured while getting degrees"}])
    return degreeData

@router.post("/degree",
             summary="Add a degree",
             description="Add a new degree ensuring no duplicates on the basis of name.")
def add_degree(degree : schemas.Degree_Add, db : Session = Depends(get_db)):
    degree.dname = degree.dname.upper()
    already_exists = db.query(models.Degree).where(models.Degree.dname == degree.dname).one_or_none()
    if already_exists:
        raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "A degree with same name already exists"}])
    try:
        degreeAdd = models.Degree(
            dname = degree.dname,
            dtype = degree.dtype,
            d_maxchours = degree.d_maxchours,
            d_chours = 0,
            max_chours = degree.max_chours,
            years = degree.years
        )
        db.add(degreeAdd)
        db.commit()
        for i in range(degree.years * 2):
            semesterData = models.Semesters(
                dId = degreeAdd.id, 
                semNo = i + 1,
                currHours = 0
            )
            db.add(semesterData)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Degree could not be added."}])
    return {"msg" : "Success"}



@router.get("/cdegrees/{course}",
            summary="Course in degrees",
            description="Returns all the degrees and the semester no of that degree in which the parameteric course exists.")
def course_in_degrees(course : str, db : Session = Depends(get_db)):
    try:
        degrees = db.execute(select(models.SemesterCourses.degreeId, models.SemesterCourses.semNo, models.Degree.dname, models.Degree.dtype).join(models.Degree, models.Degree.id == models.SemesterCourses.degreeId).where(models.SemesterCourses.coursecode == course)).mappings().all()
        if not degrees:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=[{"msg" : "Course is not included in any degree program."}])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Error occured while fetching the degrees."}])
    return degrees

@router.post("/delsemester/courses",
             summary="Delete course from degree",
             description="Deletes course from degree as specified or deletes course from all the degrees depending on option(parameter)")
def del_courseSem(data : schemas.SemCourse_Del, db : Session = Depends(get_db)):
    try:
        if data.option:
            crs = db.query(models.Course).where(models.Course.code == data.courseCode).one_or_none()
            if not crs:
                raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "Course doesn't exist"}])
            result = db.execute(update(models.Degree).where(models.Degree.id.in_(
                select(models.SemesterCourses.degreeId).where(models.SemesterCourses.coursecode == data.courseCode)
                )).values(d_chours = models.Degree.d_chours - crs.cHours))
            if result.rowcount == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=[{"msg" : "No degree found"}])
            db.execute(delete(models.SemesterCourses).where(models.SemesterCourses.coursecode == data.courseCode))
        else:
            course = db.query(models.SemesterCourses).where(models.SemesterCourses.degreeId == data.degreeId, models.SemesterCourses.coursecode == data.courseCode).one_or_none()
            if not course:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=[{"msg" : "Course doesn't exist in this course for this semester."}])
            degree = db.query(models.Degree).where(models.Degree.id == data.degreeId).one_or_none()
            crs = db.query(models.Course).where(models.Course.code == data.courseCode).one_or_none()
            if not (degree and crs):
                raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "Degree or course doesn't exist"}])
            degree.d_chours -= crs.cHours
            db.delete(course)
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        # print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Course could not be deleted."}])

@router.post("/semester/courses",
             summary="Add course to a degree",
             description="Add course to degree in a specific valid semester ensuring addition doesn't exceeds max credit hours per semester or degree.")
def associate_courseSem(data : schemas.Course_Associate, db : Session = Depends(get_db)):
    try:
        
        semData = db.query(models.Semesters).where(models.Semesters.semNo == data.semNo, models.Semesters.dId == data.degreeId).one_or_none()
        degreeData = db.query(models.Degree).where(models.Degree.id == data.degreeId).one_or_none()

        if (semData.currHours + data.courseHours) > degreeData.max_chours:
            raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "Adding this course exceed max credit hours for the semester"}])
        
        elif (degreeData.d_chours + data.courseHours) > degreeData.d_maxchours:
            raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "Adding this course exceeds max credit hours of the degree"}])
        
        already_exists = db.query(models.SemesterCourses).where(models.SemesterCourses.degreeId == data.degreeId, models.SemesterCourses.coursecode == data.courseCode).one_or_none()
        if already_exists:
            raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : f"Course is already in the degree in semester {already_exists.semNo}"}])
        
        preReqsCheck = db.execute(select(models.SemesterCourses.coursecode).join(models.Prerequisite, (models.Prerequisite.courseCode == data.courseCode) & (models.Prerequisite.prereqCode == models.SemesterCourses.coursecode)).where(models.SemesterCourses.degreeId == data.degreeId, models.SemesterCourses.semNo >= data.semNo)).mappings().all()
        print(len(preReqsCheck))
        if preReqsCheck:
            raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "A pre requisite of this course is taught in this semester or after it."}])
        preReqsCheck = db.execute(select(models.SemesterCourses.coursecode).join(models.Prerequisite, (models.Prerequisite.prereqCode == data.courseCode) & (models.Prerequisite.courseCode == models.SemesterCourses.coursecode)).where(models.SemesterCourses.degreeId == data.degreeId, models.SemesterCourses.semNo <= data.semNo)).mappings().all()
        if preReqsCheck:
            raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=[{"msg" : "A follow up of this course exists in this semester or before it."}])

        dbData = models.SemesterCourses(
            semNo = data.semNo,
            degreeId = data.degreeId,
            coursecode = data.courseCode
        )

        semData.currHours += data.courseHours
        degreeData.d_chours += data.courseHours

        db.add(dbData)
        db.commit()
        # raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg": "Ccourse could not be added"}])

    except HTTPException:
        raise

    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg": "Course could not be added"}])
    
    return {"msg" : "Success"}

@router.get("/degree/{degreeId}",
            summary="Get Degree Data",
            description="Returns all details about the specified degree, all it's semesters and the courses within them.")
def degree_data(degreeId : str, db : Session = Depends(get_db)):
    return_data = {}
    try:
        degreeData = db.query(models.Degree).where(models.Degree.id == degreeId).one_or_none()
        return_data = {"dname" : degreeData.dname, "dtype" : degreeData.dtype, "dhours" : degreeData.d_chours, "max_chours" : degreeData.max_chours, "semesters" : degreeData.years * 2}
        semData = db.execute(select(models.SemesterCourses.semNo, func.array_agg(
            func.json_build_object(
                "code", models.SemesterCourses.coursecode,
                "title", models.Course.title
            )
            ).label("courses")
            ).join(models.Course, models.Course.code == models.SemesterCourses.coursecode)
                             .where(models.SemesterCourses.degreeId == degreeData.id)
                             .group_by(models.SemesterCourses.semNo)
                            .order_by(models.SemesterCourses.semNo)
                             ).mappings().all()
        return_data["semData"] = semData
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "Could not get degree data"}])
    return return_data
