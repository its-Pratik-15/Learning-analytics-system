from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uvicorn
import logging
from pathlib import Path

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.predict import predict_student_risk
from app.services.rag_pipeline import initialize_rag_pipeline
from app.services.document_loader import DocumentLoader

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Student Risk Analytics", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
static_path = Path(__file__).parent / "static"
static_path.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Initialize RAG Pipeline
try:
    from app.services.rag_pipeline import initialize_rag_pipeline, RetrievalConfig
    from app.services.document_loader import DocumentLoader
    
    # Initialize with production config
    config = RetrievalConfig(
        initial_top_k=10,  # Retrieve 10 for reranking
        final_top_k=3,     # Final 3 after reranking
        chunk_size=500,
        chunk_overlap=100
    )
    
    rag_pipeline = initialize_rag_pipeline(config=config)
    
    # Load default study materials
    default_docs = DocumentLoader.load_default_materials()
    rag_pipeline.add_documents(default_docs)
    rag_enabled = True
    
    logger.info("✓ Production RAG pipeline initialized with reranking")
except Exception as e:
    print(f"Warning: RAG pipeline initialization failed: {e}")
    rag_pipeline = None
    rag_enabled = False

class StudentData(BaseModel):
    school: str = Field(..., description="Student's school (GP or MS)")
    sex: str = Field(..., description="Student's sex (F or M)")
    age: int = Field(..., ge=15, le=22, description="Student's age")
    address: str = Field(..., description="Home address type (U=urban or R=rural)")
    famsize: str = Field(..., description="Family size (LE3=<=3 or GT3=>3)")
    Pstatus: str = Field(..., description="Parent's cohabitation status (T=together or A=apart)")
    Medu: int = Field(..., ge=0, le=4, description="Mother's education")
    Fedu: int = Field(..., ge=0, le=4, description="Father's education")
    Mjob: str = Field(..., description="Mother's job")
    Fjob: str = Field(..., description="Father's job")
    reason: str = Field(..., description="Reason to choose this school")
    guardian: str = Field(..., description="Student's guardian")
    traveltime: int = Field(..., ge=1, le=4, description="Home to school travel time")
    studytime: int = Field(..., ge=1, le=4, description="Weekly study time")
    failures: int = Field(..., ge=0, le=4, description="Number of past class failures")
    schoolsup: str = Field(..., description="Extra educational support")
    famsup: str = Field(..., description="Family educational support")
    paid: str = Field(..., description="Extra paid classes")
    activities: str = Field(..., description="Extra-curricular activities")
    nursery: str = Field(..., description="Attended nursery school")
    higher: str = Field(..., description="Wants to take higher education")
    internet: str = Field(..., description="Internet access at home")
    romantic: str = Field(..., description="In a romantic relationship")
    famrel: int = Field(..., ge=1, le=5, description="Quality of family relationships")
    freetime: int = Field(..., ge=1, le=5, description="Free time after school")
    goout: int = Field(..., ge=1, le=5, description="Going out with friends")
    Dalc: int = Field(..., ge=1, le=5, description="Workday alcohol consumption")
    Walc: int = Field(..., ge=1, le=5, description="Weekend alcohol consumption")
    health: int = Field(..., ge=1, le=5, description="Current health status")
    absences: int = Field(..., ge=0, description="Number of school absences")
    G1: int = Field(..., ge=0, le=20, description="First period grade")
    G2: int = Field(..., ge=0, le=20, description="Second period grade")

@app.get("/")
async def read_root():
    return FileResponse(str(static_path / "index.html"))

@app.post("/api/predict")
async def predict(student: StudentData):
    try:
        input_dict = student.dict()
        risk_level, confidence = predict_student_risk(input_dict)
        
        return {
            "success": True,
            "risk_level": risk_level,
            "confidence": confidence,
            "message": f"Student is predicted to be {risk_level} with {confidence}% confidence"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}


# RAG Pipeline Models
class RAGQuery(BaseModel):
    question: str = Field(..., description="Student's question or query")


class StudentProfile(BaseModel):
    risk_level: str = Field(..., description="Student's risk level")
    current_grade: Optional[float] = Field(None, description="Current grade")
    study_time: Optional[float] = Field(None, description="Study time per week")
    weak_areas: List[str] = Field(default_factory=list, description="Weak subject areas")
    strengths: List[str] = Field(default_factory=list, description="Strong subject areas")


class SubjectHelpRequest(BaseModel):
    subject: str = Field(..., description="Subject name")
    topic: str = Field(..., description="Specific topic")
    difficulty: str = Field(default="intermediate", description="Difficulty level")


class ExamPrepRequest(BaseModel):
    subject: str = Field(..., description="Subject to prepare for")
    exam_type: str = Field(..., description="Type of exam")
    days_until_exam: int = Field(..., ge=1, description="Days until exam")


# RAG Endpoints
@app.post("/api/rag/query")
async def rag_query(query: RAGQuery):
    """Query the RAG pipeline for study help"""
    if not rag_enabled or rag_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="RAG pipeline is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        result = rag_pipeline.query(query.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rag/recommendations")
async def get_recommendations(profile: StudentProfile):
    """Get personalized study recommendations based on student profile"""
    if not rag_enabled or rag_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="RAG pipeline is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        result = rag_pipeline.get_study_recommendations(profile.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rag/subject-help")
async def get_subject_help(request: SubjectHelpRequest):
    """Get help for a specific subject and topic"""
    if not rag_enabled or rag_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="RAG pipeline is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        result = rag_pipeline.get_subject_help(
            request.subject,
            request.topic,
            request.difficulty
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rag/exam-prep")
async def get_exam_prep(request: ExamPrepRequest):
    """Get exam preparation guidance"""
    if not rag_enabled or rag_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="RAG pipeline is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        result = rag_pipeline.get_exam_prep(
            request.subject,
            request.exam_type,
            request.days_until_exam
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rag/add-documents")
async def add_documents(documents: List[Dict[str, Any]]):
    """Add custom documents to the RAG pipeline"""
    if not rag_enabled or rag_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="RAG pipeline is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        success = rag_pipeline.add_documents(documents)
        return {
            "success": success,
            "message": "Documents added successfully" if success else "Failed to add documents"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/rag/status")
async def rag_status():
    """Check RAG pipeline status"""
    return {
        "enabled": rag_enabled,
        "status": "ready" if rag_enabled else "unavailable",
        "message": "RAG pipeline is ready" if rag_enabled else "GROQ_API_KEY not configured"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
