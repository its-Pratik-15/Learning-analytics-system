import os
import json
import logging
from typing import Dict, Any, List, Optional
from enum import Enum

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkflowState(Enum):
    """Workflow states for agentic orchestration"""
    DIAGNOSE = "diagnose"
    PLAN = "plan"
    RESOURCES = "resources"
    FEEDBACK = "feedback"
    COMPLETE = "complete"


class StudentProfile:
    """Student profile data"""
    def __init__(
        self,
        student_id: str,
        risk_level: str,
        current_grade: float,
        study_time: float,
        weak_areas: List[str],
        strengths: List[str],
        goal: str,
        performance_data: Optional[Dict[str, Any]] = None
    ):
        self.student_id = student_id
        self.risk_level = risk_level
        self.current_grade = current_grade
        self.study_time = study_time
        self.weak_areas = weak_areas or []
        self.strengths = strengths or []
        self.goal = goal
        self.performance_data = performance_data


class WorkflowResult:
    """Result from agentic workflow"""
    def __init__(
        self,
        diagnosis: Dict[str, Any],
        study_plan: Dict[str, Any],
        resources: List[Dict[str, Any]],
        feedback: Dict[str, Any],
        success: bool,
        error: Optional[str] = None
    ):
        self.diagnosis = diagnosis
        self.study_plan = study_plan
        self.resources = resources
        self.feedback = feedback
        self.success = success
        self.error = error



class AgenticStudyCoach:
    """
    Autonomous AI Study Coach with multi-step reasoning workflow
    Implements: DIAGNOSE → PLAN → RESOURCES → FEEDBACK
    """
    
    def __init__(self, groq_api_key: Optional[str] = None):
        """Initialize agentic coach"""
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
        self.llm = None
        self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize Groq LLM"""
        if not self.groq_api_key:
            logger.warning("GROQ_API_KEY not set")
            return
        
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            groq_api_key=self.groq_api_key,
            max_tokens=2048
        )
        logger.info("✓ Agentic coach LLM initialized")
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for reliable recommendations"""
        return """You are a professional AI Study Coach. Follow these constraints strictly:

- Only recommend resources that actually exist (no hallucinated URLs)
- Prefer well-known platforms: Khan Academy, Coursera, MIT OpenCourseWare, YouTube edu channels, official documentation
- If unsure about a URL, describe the resource by name and platform instead
- Always tailor recommendations to the student's stated goal and level
- Be concise, specific, and actionable — avoid generic advice
- Provide structured, data-driven insights"""
    
    def _get_workflow_prompt(self) -> str:
        """Get main agentic workflow prompt"""
        return """You are an autonomous AI Study Coach agent. You receive a student profile and must reason step-by-step through the following workflow:

STEP 1 - DIAGNOSE: Analyze the student's performance data, identify weak topics, strong topics, and learning gaps. Output a structured diagnosis.

STEP 2 - PLAN: Generate a multi-step personalized study plan. Include weekly milestones with specific goals, estimated hours per topic, and sequencing rationale.

STEP 3 - RESOURCES: For each weak topic, recommend 2-3 specific learning resources with actual URLs (YouTube, Khan Academy, Coursera, docs, etc.).

STEP 4 - FEEDBACK: Provide actionable next steps and progress feedback based on current performance trends.

Always respond in this EXACT JSON format:
{{
  "diagnosis": {{
    "strong_topics": [],
    "weak_topics": [],
    "learning_gaps": [],
    "overall_level": ""
  }},
  "study_plan": {{
    "goal": "",
    "duration_weeks": 0,
    "milestones": [
      {{ "week": 1, "focus": "", "goals": [], "hours": 0 }}
    ]
  }},
  "resources": [
    {{ "topic": "", "title": "", "url": "", "type": "video|article|course|docs" }}
  ],
  "feedback": {{
    "progress_summary": "",
    "next_steps": [],
    "motivational_note": ""
  }}
}}

Student Profile:
- Risk Level: {risk_level}
- Current Grade: {current_grade}
- Study Time: {study_time} hours/week
- Weak Areas: {weak_areas}
- Strengths: {strengths}
- Goal: {goal}

Performance Data: {performance_data}

Generate the complete workflow response now:"""
    
    async def execute_workflow(self, profile: StudentProfile) -> WorkflowResult:
        """
        Execute the full agentic workflow
        
        Args:
            profile: Student profile data
        
        Returns:
            WorkflowResult with diagnosis, plan, resources, and feedback
        """
        if not self.llm:
            return WorkflowResult(
                diagnosis={},
                study_plan={},
                resources=[],
                feedback={},
                success=False,
                error="LLM not initialized"
            )
        
        try:
            student_id = getattr(profile, 'student_id', 'UNKNOWN')
            logger.info(f"Starting agentic workflow for student: {student_id}")
            
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", self._get_system_prompt()),
                ("human", self._get_workflow_prompt())
            ])
            
            perf_data = json.dumps(getattr(profile, 'performance_data', None)) if getattr(profile, 'performance_data', None) else "No historical data"
            
            chain = prompt_template | self.llm
            response = await chain.ainvoke({
                "risk_level": getattr(profile, 'risk_level', 'unknown'),
                "current_grade": getattr(profile, 'current_grade', 0),
                "study_time": getattr(profile, 'study_time', 0),
                "weak_areas": ", ".join(getattr(profile, 'weak_areas', [])),
                "strengths": ", ".join(getattr(profile, 'strengths', [])),
                "goal": getattr(profile, 'goal', 'No goal specified'),
                "performance_data": perf_data
            })
            
            result_text = response.content.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result_data = json.loads(result_text)
            
            logger.info("✓ Agentic workflow completed successfully")
            
            return WorkflowResult(
                diagnosis=result_data.get("diagnosis", {}),
                study_plan=result_data.get("study_plan", {}),
                resources=result_data.get("resources", []),
                feedback=result_data.get("feedback", {}),
                success=True
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            return WorkflowResult(
                diagnosis={},
                study_plan={},
                resources=[],
                feedback={},
                success=False,
                error=f"JSON parsing error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return WorkflowResult(
                diagnosis={},
                study_plan={},
                resources=[],
                feedback={},
                success=False,
                error=str(e)
            )
    
    def execute_workflow_sync(self, profile: StudentProfile) -> WorkflowResult:
        """Synchronous version of execute_workflow"""
        if not self.llm:
            return WorkflowResult(
                diagnosis={},
                study_plan={},
                resources=[],
                feedback={},
                success=False,
                error="LLM not initialized"
            )
        
        try:
            student_id = getattr(profile, 'student_id', 'UNKNOWN')
            logger.info(f"Starting agentic workflow for student: {student_id}")
            
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", self._get_system_prompt()),
                ("human", self._get_workflow_prompt())
            ])
            
            perf_data = json.dumps(getattr(profile, 'performance_data', None)) if getattr(profile, 'performance_data', None) else "No historical data"
            
            chain = prompt_template | self.llm
            response = chain.invoke({
                "risk_level": getattr(profile, 'risk_level', 'unknown'),
                "current_grade": getattr(profile, 'current_grade', 0),
                "study_time": getattr(profile, 'study_time', 0),
                "weak_areas": ", ".join(getattr(profile, 'weak_areas', [])),
                "strengths": ", ".join(getattr(profile, 'strengths', [])),
                "goal": getattr(profile, 'goal', 'No goal specified'),
                "performance_data": perf_data
            })
            
            result_text = response.content.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result_data = json.loads(result_text)
            
            logger.info("✓ Agentic workflow completed successfully")
            
            return WorkflowResult(
                diagnosis=result_data.get("diagnosis", {}),
                study_plan=result_data.get("study_plan", {}),
                resources=result_data.get("resources", []),
                feedback=result_data.get("feedback", {}),
                success=True
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            return WorkflowResult(
                diagnosis={},
                study_plan={},
                resources=[],
                feedback={},
                success=False,
                error=f"JSON parsing error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return WorkflowResult(
                diagnosis={},
                study_plan={},
                resources=[],
                feedback={},
                success=False,
                error=str(e)
            )



_global_coach: Optional[AgenticStudyCoach] = None


def get_agentic_coach() -> AgenticStudyCoach:
    """Get or create global agentic coach instance"""
    global _global_coach
    if _global_coach is None:
        _global_coach = AgenticStudyCoach()
    return _global_coach
