from openai import OpenAI
from fastapi import APIRouter, Depends, HTTPException, status
from database import SessionLocal
import models, schemas
from sqlalchemy.orm import Session
from sqlalchemy import select, func
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
API_KEY = os.getenv("chat_api")
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

    
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key= API_KEY,
)
@router.post("/ai")
def answer_request(query : schemas.AI_question, db : Session = Depends(get_db)):
    result = {}
    try:
        preReqsList = db.execute(select(models.Prerequisite.courseCode, models.Prerequisite.prereqCode).join(models.SemesterCourses, (models.Prerequisite.courseCode == models.SemesterCourses.coursecode)
        & 
        (models.Prerequisite.prereqCode.in_(
            select(models.SemesterCourses.coursecode).where(models.SemesterCourses.degreeId == query.degreeId)
        )))
        .where
        (models.SemesterCourses.degreeId == query.degreeId)
            ).mappings().all()
        
        result["preReqsList"] = preReqsList 
        degreeData = db.execute(select(models.Degree).where(models.Degree.id == query.degreeId)).scalar_one_or_none()
        if not degreeData:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=[{"msg" : "Invalid degree"}])
        
        result["degreeData"] = degreeData.to_dict()
        semData = db.execute(select(models.SemesterCourses.semNo, func.array_agg(
            func.json_build_object(
                "code", models.SemesterCourses.coursecode,
                "title", models.Course.title
            )
            ).label("courses")
            ).join(models.Course, models.Course.code == models.SemesterCourses.coursecode)
                                .where(models.SemesterCourses.degreeId == query.degreeId)
                                .group_by(models.SemesterCourses.semNo)
                            .order_by(models.SemesterCourses.semNo)
                                ).mappings().all()

        result["semData"] = semData
        response = client.chat.completions.create(
            model="openrouter/free",
            messages=[
                {
                    "role" : "user",
                    "content": "Given the complete data of the degree in question, answer this query by remaining strictly in that knowledge domain. If the query is about anything else that is irrelevant to the degree, just answer 'Please ask, relevant questions'. If the query is about a degree that is not the degree name in data, just answer 'Please select the respective degree first from list'. Note degrees and courses are separate so the user might ask about a course in a degree too by its name, code or any abbrievation. Relevant queries include questions or chat about degree's structure, its courses, its pre requisites, and any information question or chat related to degree. Note the degree here means a degree program in a university. If you are not clear about the query you can ask user to ask query by resolving the conflicts you are facing. Consider yourself as help desk for students that answers their queries. So answer in simple and understanding manner that the student can understand. The data of the degree is: " + str(result) + "\nUser's query is:-\n" + query.question  
                }
            ],
            extra_body={"reasoning" : {"enabled" : True}}
        )
        return response.choices[0].message.content
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=[{"msg" : "An error occured while processing your request"}])