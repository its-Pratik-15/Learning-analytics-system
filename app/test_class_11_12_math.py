"""
Test script for Class 11-12 Mathematics
Tests RAG queries, quiz generation, and agentic study plan
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.rag_pipeline import ProductionRAGPipeline, RetrievalConfig
from services.agentic_coach import AgenticStudyCoach, StudentProfile
from services.quiz_generator import QuizGenerator, AdaptiveDifficultyEngine


def print_header(title):
    print("\n" + "=" * 90)
    print(title.center(90))
    print("=" * 90)


def print_subheader(title):
    print("\n" + "-" * 90)
    print(title)
    print("-" * 90)


def test_class_11_12_math_rag():
    """Test RAG with class 11-12 math questions"""
    print_header("CLASS 11-12 MATHEMATICS RAG QUERIES TEST")
    
    print("\n[1] Initializing RAG Pipeline...")
    config = RetrievalConfig(initial_top_k=10, final_top_k=3)
    pipeline = ProductionRAGPipeline(config=config)
    
    if not pipeline.llm:
        print("✗ GROQ_API_KEY not set")
        return False
    
    print("✓ RAG Pipeline initialized with FAISS index")
    
    stats = pipeline.get_stats()
    print(f"\n  Vector DB Stats:")
    print(f"    Total vectors: {stats.get('total_vectors')}")
    print(f"    Embedding model: {stats.get('embedding_model')}")
    print(f"    Reranker: {stats.get('reranker_model')}")
    
    print("\n[2] Testing Class 11-12 Math Questions...")
    print_subheader("RAG Query Tests")
    
    math_questions = [
        {
            "question": "What is the definition of a conic section and what are the different types?",
            "topic": "Conic Sections"
        },
        {
            "question": "How do I find the equation of a circle given center and radius?",
            "topic": "Circle Equations"
        },
        {
            "question": "Explain the concept of limits and continuity in calculus",
            "topic": "Limits and Continuity"
        },
        {
            "question": "What is the derivative and how is it used to find maxima and minima?",
            "topic": "Derivatives"
        },
        {
            "question": "How do I solve problems involving permutations and combinations?",
            "topic": "Permutations and Combinations"
        },
        {
            "question": "Explain the binomial theorem and its applications",
            "topic": "Binomial Theorem"
        },
        {
            "question": "What are the properties of matrices and how do I perform matrix operations?",
            "topic": "Matrices"
        },
        {
            "question": "How do I solve systems of linear equations using matrices?",
            "topic": "Linear Equations"
        }
    ]
    
    successful_queries = 0
    
    for i, item in enumerate(math_questions, 1):
        question = item["question"]
        topic = item["topic"]
        
        print(f"\n📝 Query {i}: {topic}")
        print(f"   Q: {question}")
        
        result = pipeline.query(question)
        
        if result.success:
            print(f"   ✓ Retrieved {result.retrieved_chunks} chunks → Reranked to {result.reranked_chunks}")
            print(f"   Top rerank score: {result.sources[0]['rerank_score']:.4f}")
            print(f"   Answer preview: {result.answer[:150]}...")
            successful_queries += 1
        else:
            print(f"   ✗ Failed: {result.answer}")
    
    print(f"\n✓ Completed {successful_queries}/{len(math_questions)} queries successfully")
    return successful_queries == len(math_questions)


def test_class_11_12_math_quiz():
    """Test quiz generation for class 11-12 math"""
    print_header("CLASS 11-12 MATHEMATICS QUIZ GENERATION TEST")
    
    print("\n[1] Initializing Quiz Generator...")
    generator = QuizGenerator()
    
    if not generator.llm:
        print("✗ GROQ_API_KEY not set")
        return False
    
    print("✓ Quiz Generator initialized")
    
    print("\n[2] Generating Class 11-12 Math Quizzes...")
    print_subheader("Quiz Generation Tests")
    
    quiz_configs = [
        {
            "topic": "Conic Sections - Circles",
            "difficulty": "intermediate",
            "types": ["mcq", "short_answer"],
            "count": 3
        },
        {
            "topic": "Calculus - Derivatives",
            "difficulty": "intermediate",
            "types": ["mcq", "short_answer"],
            "count": 3
        },
        {
            "topic": "Permutations and Combinations",
            "difficulty": "beginner",
            "types": ["mcq", "true_false"],
            "count": 3
        },
        {
            "topic": "Matrices and Determinants",
            "difficulty": "advanced",
            "types": ["mcq", "short_answer"],
            "count": 3
        }
    ]
    
    total_questions = 0
    
    for i, config in enumerate(quiz_configs, 1):
        print(f"\n[Quiz {i}] {config['topic']}")
        print(f"  Difficulty: {config['difficulty']}")
        print(f"  Types: {', '.join(config['types'])}")
        print(f"  Count: {config['count']}")
        
        result = generator.generate_quiz(
            topic=config['topic'],
            difficulty=config['difficulty'],
            question_types=config['types'],
            count=config['count']
        )
        
        if not result.get("success"):
            print(f"  ✗ Failed: {result.get('error')}")
            continue
        
        questions = result.get('questions', [])
        print(f"  ✓ Generated {len(questions)} questions")
        total_questions += len(questions)
        
        for j, q in enumerate(questions[:2], 1):
            print(f"\n    Question {j}:")
            print(f"      Type: {q.get('type')}")
            print(f"      Q: {q.get('question', 'N/A')[:100]}...")
            if q.get('options'):
                for opt in q['options'][:3]:
                    print(f"         {opt}")
                if len(q['options']) > 3:
                    print(f"         ...")
            print(f"      Correct: {q.get('correct_answer', 'N/A')}")
    
    print(f"\n✓ Generated {total_questions} total questions across {len(quiz_configs)} quizzes")
    return True


def test_class_11_12_study_plan():
    """Test agentic study plan for class 11-12 student"""
    print_header("CLASS 11-12 STUDENT AGENTIC STUDY PLAN TEST")
    
    print("\n[1] Initializing Agentic Coach...")
    coach = AgenticStudyCoach()
    
    if not coach.llm:
        print("✗ GROQ_API_KEY not set")
        return False
    
    print("✓ Agentic Coach initialized")
    
    print("\n[2] Creating Class 11-12 Student Profiles...")
    print_subheader("Student Profiles")
    
    student_profiles = [
        {
            "name": "Arjun (Class 12 - High Risk)",
            "profile": StudentProfile(
                student_id="CLASS12_ARJUN",
                risk_level="high",
                current_grade=12.0,
                study_time=2.0,
                weak_areas=["Calculus", "Conic Sections", "Matrices"],
                strengths=["Algebra", "Trigonometry"],
                goal="Pass board exams with 60+ marks",
                performance_data={
                    "math_scores": [45, 48, 50],
                    "physics_scores": [40, 42, 45],
                    "chemistry_scores": [50, 52, 55],
                    "attendance": 75
                }
            )
        },
        {
            "name": "Priya (Class 11 - Medium Risk)",
            "profile": StudentProfile(
                student_id="CLASS11_PRIYA",
                risk_level="medium",
                current_grade=11.0,
                study_time=3.5,
                weak_areas=["Limits and Continuity", "Permutations"],
                strengths=["Algebra", "Geometry", "Trigonometry"],
                goal="Score 75+ in class 11 exams",
                performance_data={
                    "math_scores": [65, 68, 70],
                    "physics_scores": [60, 62, 65],
                    "chemistry_scores": [70, 72, 75],
                    "attendance": 90
                }
            )
        },
        {
            "name": "Rohan (Class 12 - Low Risk)",
            "profile": StudentProfile(
                student_id="CLASS12_ROHAN",
                risk_level="low",
                current_grade=12.0,
                study_time=4.5,
                weak_areas=["Advanced Calculus"],
                strengths=["Algebra", "Geometry", "Trigonometry", "Matrices"],
                goal="Score 90+ in board exams",
                performance_data={
                    "math_scores": [85, 87, 90],
                    "physics_scores": [80, 82, 85],
                    "chemistry_scores": [85, 87, 90],
                    "attendance": 98
                }
            )
        }
    ]
    
    for student_data in student_profiles:
        print(f"\n[Student] {student_data['name']}")
        print(f"  Risk Level: {student_data['profile'].risk_level}")
        print(f"  Current Grade: {student_data['profile'].current_grade}")
        print(f"  Study Time: {student_data['profile'].study_time}h/day")
        print(f"  Goal: {student_data['profile'].goal}")
        
        print(f"\n  Executing Agentic Workflow...")
        result = coach.execute_workflow_sync(student_data['profile'])
        
        if not result.success:
            print(f"  ✗ Failed: {result.error}")
            continue
        
        print(f"  ✓ Workflow completed successfully")
        
        print(f"\n  📊 DIAGNOSIS:")
        diagnosis = result.diagnosis
        print(f"    Overall Level: {diagnosis.get('overall_level')}")
        print(f"    Strong Topics: {', '.join(diagnosis.get('strong_topics', [])[:3])}")
        print(f"    Weak Topics: {', '.join(diagnosis.get('weak_topics', [])[:3])}")
        print(f"    Learning Gaps: {', '.join(diagnosis.get('learning_gaps', [])[:3])}")
        
        print(f"\n  📅 STUDY PLAN:")
        plan = result.study_plan
        print(f"    Goal: {plan.get('goal')}")
        print(f"    Duration: {plan.get('duration_weeks')} weeks")
        print(f"    Total Milestones: {len(plan.get('milestones', []))}")
        
        milestones = plan.get('milestones', [])
        print(f"\n    First 4 Weeks:")
        for milestone in milestones[:4]:
            week = milestone.get('week')
            focus = milestone.get('focus')
            hours = milestone.get('hours')
            goals = milestone.get('goals', [])
            print(f"      Week {week}: {focus} ({hours}h)")
            for goal in goals[:2]:
                print(f"        • {goal}")
        
        print(f"\n  📚 RESOURCES ({len(result.resources)} total):")
        for i, resource in enumerate(result.resources[:5], 1):
            title = resource.get('title')
            res_type = resource.get('type')
            topic = resource.get('topic')
            url = resource.get('url', 'N/A')
            print(f"    {i}. {title} ({res_type})")
            print(f"       Topic: {topic}")
            print(f"       URL: {url}")
        
        print(f"\n  💬 FEEDBACK:")
        feedback = result.feedback
        print(f"    Progress: {feedback.get('progress_summary', 'N/A')[:120]}...")
        print(f"    Next Steps: {len(feedback.get('next_steps', []))} actions")
        for step in feedback.get('next_steps', [])[:3]:
            print(f"      • {step}")
        print(f"    Motivation: {feedback.get('motivational_note', 'N/A')[:100]}...")
        
        print("\n" + "-" * 90)
    
    return True


def test_adaptive_difficulty_for_math():
    """Test adaptive difficulty adjustment for math quizzes"""
    print_header("ADAPTIVE DIFFICULTY FOR CLASS 11-12 MATH TEST")
    
    print("\n[1] Initializing Adaptive Difficulty Engine...")
    engine = AdaptiveDifficultyEngine()
    
    if not engine.llm:
        print("✗ GROQ_API_KEY not set")
        return False
    
    print("✓ Adaptive Difficulty Engine initialized")
    
    print("\n[2] Testing Difficulty Adjustments for Math Topics...")
    print_subheader("Adaptive Difficulty Scenarios")
    
    scenarios = [
        {
            "name": "Calculus - High Performance",
            "difficulty": "beginner",
            "score": 90,
            "attempted": 10,
            "time": 12,
            "weak": []
        },
        {
            "name": "Conic Sections - Medium Performance",
            "difficulty": "intermediate",
            "score": 65,
            "attempted": 10,
            "time": 20,
            "weak": ["Circle equations", "Parabola properties"]
        },
        {
            "name": "Matrices - Low Performance",
            "difficulty": "advanced",
            "score": 35,
            "attempted": 10,
            "time": 25,
            "weak": ["Matrix multiplication", "Determinants", "Inverse matrices"]
        },
        {
            "name": "Permutations - Excellent Performance",
            "difficulty": "intermediate",
            "score": 95,
            "attempted": 10,
            "time": 10,
            "weak": []
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n[Scenario {i}] {scenario['name']}")
        print(f"  Current Difficulty: {scenario['difficulty']}")
        print(f"  Score: {scenario['score']}%")
        print(f"  Time: {scenario['time']} minutes")
        if scenario['weak']:
            print(f"  Weak Areas: {', '.join(scenario['weak'])}")
        
        result = engine.adjust_difficulty(
            current_difficulty=scenario['difficulty'],
            score_percent=scenario['score'],
            attempted=scenario['attempted'],
            time_taken=scenario['time'],
            weak_areas=scenario['weak']
        )
        
        if not result.get("success"):
            print(f"  ✗ Failed")
            continue
        
        print(f"\n  ✓ Adjustment Result:")
        print(f"    New Difficulty: {result.get('new_difficulty')}")
        print(f"    Reasoning: {result.get('reasoning', 'N/A')[:120]}...")
        
        if result.get('next_topics'):
            print(f"    Next Topics: {', '.join(result.get('next_topics', [])[:3])}")
        
        if result.get('remediation_topics'):
            print(f"    Remediation: {', '.join(result.get('remediation_topics', [])[:3])}")
        
        print(f"    Encouragement: {result.get('encouragement', 'N/A')[:100]}...")
    
    return True


def main():
    """Run all class 11-12 math tests"""
    print("\n")
    print("╔" + "=" * 88 + "╗")
    print("║" + " " * 20 + "CLASS 11-12 MATHEMATICS COMPREHENSIVE TEST" + " " * 26 + "║")
    print("╚" + "=" * 88 + "╝")
    
    results = []
    
    try:
        print("\n\n🔍 Starting RAG Query Tests...")
        results.append(("RAG Queries (Math)", test_class_11_12_math_rag()))
    except Exception as e:
        print(f"\n✗ RAG Query Test Failed: {e}")
        import traceback
        traceback.print_exc()
        results.append(("RAG Queries (Math)", False))
    
    try:
        print("\n\n🔍 Starting Quiz Generation Tests...")
        results.append(("Quiz Generation", test_class_11_12_math_quiz()))
    except Exception as e:
        print(f"\n✗ Quiz Generation Test Failed: {e}")
        import traceback
        traceback.print_exc()
        results.append(("Quiz Generation", False))
    
    try:
        print("\n\n🔍 Starting Study Plan Tests...")
        results.append(("Study Plans", test_class_11_12_study_plan()))
    except Exception as e:
        print(f"\n✗ Study Plan Test Failed: {e}")
        import traceback
        traceback.print_exc()
        results.append(("Study Plans", False))
    
    try:
        print("\n\n🔍 Starting Adaptive Difficulty Tests...")
        results.append(("Adaptive Difficulty", test_adaptive_difficulty_for_math()))
    except Exception as e:
        print(f"\n✗ Adaptive Difficulty Test Failed: {e}")
        import traceback
        traceback.print_exc()
        results.append(("Adaptive Difficulty", False))
    
    print("\n\n")
    print("╔" + "=" * 88 + "╗")
    print("║" + " " * 38 + "TEST SUMMARY" + " " * 38 + "║")
    print("╚" + "=" * 88 + "╝")
    
    for name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"  {name:.<60} {status}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\n  Total: {passed}/{total} test suites passed")
    
    if passed == total:
        print("\n  🎉 All class 11-12 math tests passed!")
    else:
        print(f"\n  ⚠️  {total - passed} test suite(s) failed")
    
    print("\n")


if __name__ == "__main__":
    main()
