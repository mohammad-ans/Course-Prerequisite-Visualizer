from database import SessionLocal, engine
import models, schemas

db = SessionLocal()
# db.query(models.Course).delete()
# db.query(models.Prerequisite).delete()
models.Prerequisite.__table__.drop(engine)
models.Course.__table__.drop(engine)
models.Users.__table__.drop(engine)
db.commit()