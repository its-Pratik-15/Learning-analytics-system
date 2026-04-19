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
from app.services.agentic_coach import get_agentic_coach, StudentProfile
from app.services.quiz_generator import get_quiz_generator, get_adaptive_engine

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

# Initialize Agentic Coach
try:
    agentic_coach = get_agentic_coach()
    coach_enabled = agentic_coach.llm is not None
    logger.info("✓ Agentic study coach initialized")
except Exception as e:
    print(f"Warning: Agentic coach initialization failed: {e}")
    agentic_coach = None
    coach_enabled = False

# Initialize Quiz Generator
try:
    quiz_generator = get_quiz_generator()
    adaptive_engine = get_adaptive_engine()
    quiz_enabled = quiz_generator.llm is not None
    logger.info("✓ Quiz generator and adaptive engine initialized")
except Exception as e:
    print(f"Warning: Quiz generator initialization failed: {e}")
    quiz_generator = None
    adaptive_engine = None
    quiz_enabled = False

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


class AgenticCoachRequest(BaseModel):
    student_id: str = Field(..., description="Student ID")
    risk_level: str = Field(..., description="Risk level (low/medium/high)")
    current_grade: float = Field(..., description="Current grade")
    study_time: float = Field(..., description="Study time per week")
    weak_areas: List[str] = Field(..., description="Weak subject areas")
    strengths: List[str] = Field(..., description="Strong subject areas")
    goal: str = Field(..., description="Student's learning goal")
    performance_data: Optional[Dict[str, Any]] = Field(None, description="Historical performance data")


# ============================================================================
# QUIZ GENERATOR MODELS
# ============================================================================

class QuizGenerationRequest(BaseModel):
    topic: str = Field(..., description="Topic for quiz")
    difficulty: str = Field(default="intermediate", description="Difficulty level")
    question_types: List[str] = Field(default=["mcq"], description="Question types")
    count: int = Field(default=5, ge=1, le=20, description="Number of questions")


class AdaptiveDifficultyRequest(BaseModel):
    current_difficulty: str = Field(..., description="Current difficulty level")
    score_percent: float = Field(..., ge=0, le=100, description="Score percentage")
    attempted: int = Field(..., ge=1, description="Questions attempted")
    time_taken: float = Field(..., ge=0, description="Time taken in minutes")
    weak_areas: List[str] = Field(default=[], description="Weak areas identified")


@app.post("/api/coach/workflow")
async def execute_agentic_workflow(request: AgenticCoachRequest):
    """Execute full agentic workflow: DIAGNOSE → PLAN → RESOURCES → FEEDBACK"""
    if not coach_enabled or agentic_coach is None:
        raise HTTPException(
            status_code=503,
            detail="Agentic coach is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        # Create student profile
        profile = StudentProfile(
            student_id=request.student_id,
            risk_level=request.risk_level,
            current_grade=request.current_grade,
            study_time=request.study_time,
            weak_areas=request.weak_areas,
            strengths=request.strengths,
            goal=request.goal,
            performance_data=request.performance_data
        )
        
        # Execute workflow
        result = agentic_coach.execute_workflow_sync(profile)
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.error)
        
        return {
            "success": True,
            "diagnosis": result.diagnosis,
            "study_plan": result.study_plan,
            "resources": result.resources,
            "feedback": result.feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/coach/status")
async def coach_status():
    """Check agentic coach status"""
    return {
        "enabled": coach_enabled,
        "status": "ready" if coach_enabled else "unavailable",
        "message": "Agentic coach is ready" if coach_enabled else "GROQ_API_KEY not configured"
    }


@app.post("/api/quiz/generate")
async def generate_quiz(request: QuizGenerationRequest):
    """Generate practice quiz questions"""
    if not quiz_enabled or quiz_generator is None:
        raise HTTPException(
            status_code=503,
            detail="Quiz generator is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        result = quiz_generator.generate_quiz(
            topic=request.topic,
            difficulty=request.difficulty,
            question_types=request.question_types,
            count=request.count
        )
        
        if not result.get("success", False):
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quiz/adaptive")
async def generate_adaptive_quiz(
    topic: str,
    student_level: str,
    weak_areas: List[str] = [],
    count: int = 5
):
    """Generate adaptive quiz based on student's weak areas"""
    if not quiz_enabled or quiz_generator is None:
        raise HTTPException(
            status_code=503,
            detail="Quiz generator is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        result = quiz_generator.generate_adaptive_quiz(
            topic=topic,
            student_level=student_level,
            weak_areas=weak_areas,
            count=count
        )
        
        if not result.get("success", False):
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quiz/adjust-difficulty")
async def adjust_difficulty(request: AdaptiveDifficultyRequest):
    """Adjust difficulty based on quiz performance"""
    if not quiz_enabled or adaptive_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Adaptive engine is not available. Please set GROQ_API_KEY environment variable."
        )
    
    try:
        result = adaptive_engine.adjust_difficulty(
            current_difficulty=request.current_difficulty,
            score_percent=request.score_percent,
            attempted=request.attempted,
            time_taken=request.time_taken,
            weak_areas=request.weak_areas
        )
        
        if not result.get("success", False):
            raise HTTPException(status_code=500, detail="Difficulty adjustment failed")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quiz/status")
async def quiz_status():
    """Check quiz generator status"""
    return {
        "enabled": quiz_enabled,
        "status": "ready" if quiz_enabled else "unavailable",
        "message": "Quiz generator is ready" if quiz_enabled else "GROQ_API_KEY not configured"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
