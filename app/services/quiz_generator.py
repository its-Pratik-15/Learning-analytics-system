import os
import json
import logging
from typing import List, Dict, Any, Optional
from enum import Enum

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



class QuestionType(Enum):
    """Question types"""
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    TRUE_FALSE = "true_false"
    CODE = "code"


class Difficulty(Enum):
    """Difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"



class QuizGenerator:
    """
    Generates practice questions and quizzes
    Supports multiple question types and difficulty levels
    """
    
    def __init__(self, groq_api_key: Optional[str] = None):
        """Initialize quiz generator"""
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
            temperature=0.8,
            groq_api_key=self.groq_api_key,
            max_tokens=2048
        )
        logger.info("✓ Quiz generator LLM initialized")
    
    def _get_generation_prompt(self) -> str:
        """Get quiz generation prompt"""
        return """Based on the following topic and difficulty level, generate practice questions for a student.

Topic: {topic}
Difficulty: {difficulty} (beginner | intermediate | advanced)
Question Types: {types} (mcq | short_answer | true_false | code)
Count: {count}

Respond ONLY in this JSON format, no preamble:
{{
  "questions": [
    {{
      "id": 1,
      "type": "mcq",
      "question": "",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A",
      "explanation": "",
      "difficulty": "beginner"
    }}
  ]
}}

Guidelines:
- Make questions clear and unambiguous
- Ensure correct answers are accurate
- Provide detailed explanations
- For MCQ: include 4 options with one correct answer
- For true_false: make statements clear
- For short_answer: provide sample correct answers in explanation
- For code: include proper syntax and test cases in explanation
- Match difficulty level appropriately

Generate {count} questions now:"""
    
    def generate_quiz(
        self,
        topic: str,
        difficulty: str = "intermediate",
        question_types: List[str] = None,
        count: int = 5
    ) -> Dict[str, Any]:
        """
        Generate a quiz with practice questions
        
        Args:
            topic: Topic for questions
            difficulty: Difficulty level (beginner/intermediate/advanced)
            question_types: List of question types to include
            count: Number of questions to generate
        
        Returns:
            Dict with questions array
        """
        if not self.llm:
            return {
                "questions": [],
                "success": False,
                "error": "LLM not initialized"
            }
        
        if question_types is None:
            question_types = ["mcq"]
        
        try:
            logger.info(f"Generating {count} questions for topic: {topic}")
            
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", "You are an expert educator creating high-quality practice questions."),
                ("human", self._get_generation_prompt())
            ])
            
            chain = prompt_template | self.llm
            response = chain.invoke({
                "topic": topic,
                "difficulty": difficulty,
                "types": ", ".join(question_types),
                "count": count
            })
            
            result_text = response.content.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result_data = json.loads(result_text)
            
            logger.info(f"✓ Generated {len(result_data.get('questions', []))} questions")
            
            return {
                **result_data,
                "success": True,
                "topic": topic,
                "difficulty": difficulty
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            return {
                "questions": [],
                "success": False,
                "error": f"JSON parsing error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}")
            return {
                "questions": [],
                "success": False,
                "error": str(e)
            }
    
    def generate_adaptive_quiz(
        self,
        topic: str,
        student_level: str,
        weak_areas: List[str],
        count: int = 5
    ) -> Dict[str, Any]:
        """
        Generate adaptive quiz based on student's weak areas
        
        Args:
            topic: Main topic
            student_level: Student's current level
            weak_areas: List of weak subtopics
            count: Number of questions
        
        Returns:
            Dict with adaptive questions
        """
        enhanced_topic = f"{topic} (focus on: {', '.join(weak_areas)})"
        
        return self.generate_quiz(
            topic=enhanced_topic,
            difficulty=student_level,
            question_types=["mcq", "short_answer"],
            count=count
        )



class AdaptiveDifficultyEngine:
    """
    Adjusts difficulty based on student performance
    Implements adaptive learning logic
    """
    
    def __init__(self, groq_api_key: Optional[str] = None):
        """Initialize adaptive engine"""
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
            temperature=0.3,
            groq_api_key=self.groq_api_key,
            max_tokens=1024
        )
        logger.info("✓ Adaptive difficulty engine initialized")
    
    def _get_adaptation_prompt(self) -> str:
        """Get adaptive difficulty prompt"""
        return """You are an adaptive learning engine. A student just completed a quiz/exercise.

Previous difficulty: {current_difficulty}
Score: {score_percent}%
Questions attempted: {attempted}
Time taken: {time_taken} minutes
Weak areas identified: {weak_areas}

Apply these rules:
- Score > 80%: increase difficulty, introduce new subtopics
- Score 50-80%: maintain difficulty, reinforce weak areas
- Score < 50%: decrease difficulty, revisit prerequisites

Respond ONLY in JSON:
{{
  "new_difficulty": "beginner|intermediate|advanced",
  "reasoning": "",
  "next_topics": [],
  "remediation_topics": [],
  "encouragement": ""
}}"""
    
    def adjust_difficulty(
        self,
        current_difficulty: str,
        score_percent: float,
        attempted: int,
        time_taken: float,
        weak_areas: List[str]
    ) -> Dict[str, Any]:
        """
        Adjust difficulty based on performance
        
        Args:
            current_difficulty: Current difficulty level
            score_percent: Score percentage (0-100)
            attempted: Number of questions attempted
            time_taken: Time taken in minutes
            weak_areas: List of weak areas identified
        
        Returns:
            Dict with new difficulty and recommendations
        """
        if not self.llm:
            return self._rule_based_adjustment(
                current_difficulty, score_percent, weak_areas
            )
        
        try:
            logger.info(f"Adjusting difficulty from {current_difficulty} (score: {score_percent}%)")
            
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", "You are an adaptive learning system that adjusts difficulty intelligently."),
                ("human", self._get_adaptation_prompt())
            ])
            
            chain = prompt_template | self.llm
            response = chain.invoke({
                "current_difficulty": current_difficulty,
                "score_percent": score_percent,
                "attempted": attempted,
                "time_taken": time_taken,
                "weak_areas": ", ".join(weak_areas) if weak_areas else "None identified"
            })
            
            result_text = response.content.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result_data = json.loads(result_text)
            
            logger.info(f"✓ Adjusted to {result_data.get('new_difficulty')}")
            
            return {
                **result_data,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Adaptive adjustment failed: {e}")
            return self._rule_based_adjustment(
                current_difficulty, score_percent, weak_areas
            )
    
    def _rule_based_adjustment(
        self,
        current_difficulty: str,
        score_percent: float,
        weak_areas: List[str]
    ) -> Dict[str, Any]:
        """Fallback rule-based difficulty adjustment"""
        difficulty_levels = ["beginner", "intermediate", "advanced"]
        current_idx = difficulty_levels.index(current_difficulty) if current_difficulty in difficulty_levels else 1
        
        if score_percent > 80:
            new_idx = min(current_idx + 1, len(difficulty_levels) - 1)
            reasoning = "Great performance! Moving to next difficulty level."
            encouragement = "Excellent work! You're ready for more challenging material."
        elif score_percent >= 50:
            new_idx = current_idx
            reasoning = "Good progress. Maintaining current difficulty to reinforce concepts."
            encouragement = "Keep it up! You're making steady progress."
        else:
            new_idx = max(current_idx - 1, 0)
            reasoning = "Need more practice. Reducing difficulty to build foundation."
            encouragement = "Don't worry! Let's review the basics and build up from there."
        
        return {
            "new_difficulty": difficulty_levels[new_idx],
            "reasoning": reasoning,
            "next_topics": [],
            "remediation_topics": weak_areas,
            "encouragement": encouragement,
            "success": True
        }



_global_quiz_generator: Optional[QuizGenerator] = None
_global_adaptive_engine: Optional[AdaptiveDifficultyEngine] = None


def get_quiz_generator() -> QuizGenerator:
    """Get or create global quiz generator instance"""
    global _global_quiz_generator
    if _global_quiz_generator is None:
        _global_quiz_generator = QuizGenerator()
    return _global_quiz_generator


def get_adaptive_engine() -> AdaptiveDifficultyEngine:
    """Get or create global adaptive engine instance"""
    global _global_adaptive_engine
    if _global_adaptive_engine is None:
        _global_adaptive_engine = AdaptiveDifficultyEngine()
    return _global_adaptive_engine
