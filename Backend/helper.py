from database import SessionLocal, engine
import models, schemas
from models import Prerequisite, Course
from sqlalchemy.orm import declarative_base
from sqlalchemy import MetaData

# meta = MetaData()
# meta.reflect(bind=engine)
# meta.drop_all(bind=engine)
db = SessionLocal()
# db.query(models.Course).delete()
# db.query(models.Prerequisite).delete()
# Base.metadata.drop_all(engine)
# models.Prerequisite.__table__.drop(engine)
# models.Course.__table__.drop(engine)
# models.Users.__table__.drop(engine)
# models.SemesterCourses.__table__.drop(engine)
models.Degree.__table__.drop(engine)
# models.Semesters.__table__.drop(engine)
db.commit()