from sqlalchemy import create_engine, Column, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import json
import os

Base = declarative_base()

class Session(Base):
    __tablename__ = 'sessions'
    session_id = Column(String, primary_key=True)
    customer_id = Column(String)
    channel = Column(String)
    state = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)

class SessionManager:
    def __init__(self):
        # Check for DATABASE_URL env var (Render provides this for Postgres)
        db_url = os.getenv('DATABASE_URL')
        
        if db_url:
            # Fix for Render's postgres:// which SQLAlchemy deprecated in favor of postgresql://
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
            self.engine = create_engine(db_url)
        else:
            # Fallback to local SQLite
            db_path = os.path.join(os.path.dirname(__file__), "sessions.db")
            self.engine = create_engine(f"sqlite:///{db_path}")
        
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)

    def save_session(self, session_id, customer_id, channel, state):
        session = self.Session()
        try:
            state_json = json.dumps(state)
            # Check if exists
            existing = session.query(Session).filter_by(session_id=session_id).first()
            if existing:
                existing.state = state_json
                existing.updated_at = datetime.now()
            else:
                new_session = Session(
                    session_id=session_id,
                    customer_id=customer_id,
                    channel=channel,
                    state=state_json,
                    updated_at=datetime.now()
                )
                session.add(new_session)
            session.commit()
        except Exception as e:
            print(f"Error saving session: {e}")
            session.rollback()
        finally:
            session.close()

    def load_session(self, session_id):
        session = self.Session()
        try:
            result = session.query(Session).filter_by(session_id=session_id).first()
            if result:
                return json.loads(result.state)
            return None
        finally:
            session.close()
