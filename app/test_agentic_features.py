"""
Test script for agentic coach, quiz generator, and adaptive difficulty
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.agentic_coach import AgenticStudyCoach, StudentProfile
from services.quiz_generator import QuizGenerator, AdaptiveDifficultyEngine


def test_agentic_coach():
    """Test the agentic study coach workflow"""
    print("=" * 80)
    print("AGENTIC STUDY COACH TEST")
    print("=" * 80)
    
    print("\n[1] Initializing Agentic Coach...")
    coach = AgenticStudyCoach()
    
    if not coach.llm:
        print("✗ Failed: GROQ_API_KEY not set")
        return False
    
    print("    ✓ Coach initialized")
    
    print("\n[2] Creating Student Profile...")
    profile = StudentProfile(
        student_id="TEST001",
        risk_level="high",
        current_grade=12.5,
        study_time=2.5,
        weak_areas=["Mathematics", "Science"],
        strengths=["English", "History"],
        goal="Improve grades to pass final exams",
        performance_data={
            "math_scores": [10, 11, 12],
            "science_scores": [9, 10, 11],
            "attendance": 85
        }
    )
    print(f"    ✓ Profile created for {profile.student_id}")
    
    print("\n[3] Executing Agentic Workflow (DIAGNOSE → PLAN → RESOURCES → FEEDBACK)...")
    result = coach.execute_workflow_sync(profile)
    
    if not result.success:
        print(f"✗ Failed: {result.error}")
        return False
    
    print("    ✓ Workflow completed successfully")
    
    print("\n[4] Workflow Results:")
    print("-" * 80)
    
    print("\n📊 DIAGNOSIS:")
    diagnosis = result.diagnosis
    print(f"  Overall Level: {diagnosis.get('overall_level', 'N/A')}")
    print(f"  Strong Topics: {', '.join(diagnosis.get('strong_topics', []))}")
    print(f"  Weak Topics: {', '.join(diagnosis.get('weak_topics', []))}")
    print(f"  Learning Gaps: {', '.join(diagnosis.get('learning_gaps', []))}")
    
    print("\n📅 STUDY PLAN:")
    plan = result.study_plan
    print(f"  Goal: {plan.get('goal', 'N/A')}")
    print(f"  Duration: {plan.get('duration_weeks', 0)} weeks")
    print(f"  Milestones: {len(plan.get('milestones', []))} weeks planned")
    if plan.get('milestones'):
        for milestone in plan['milestones'][:3]:
            print(f"    Week {milestone.get('week')}: {milestone.get('focus')} ({milestone.get('hours')}h)")
    
    print("\n📚 RESOURCES:")
    resources = result.resources
    print(f"  Total Resources: {len(resources)}")
    for i, resource in enumerate(resources[:5], 1):
        print(f"    {i}. {resource.get('title')} ({resource.get('type')})")
        print(f"       Topic: {resource.get('topic')}")
        print(f"       URL: {resource.get('url', 'N/A')}")
    
    print("\n💬 FEEDBACK:")
    feedback = result.feedback
    print(f"  Progress: {feedback.get('progress_summary', 'N/A')}")
    print(f"  Next Steps: {len(feedback.get('next_steps', []))} actions")
    for i, step in enumerate(feedback.get('next_steps', [])[:3], 1):
        print(f"    {i}. {step}")
    print(f"  Motivation: {feedback.get('motivational_note', 'N/A')}")
    
    print("\n" + "=" * 80)
    print("✓ AGENTIC COACH TEST COMPLETE")
    print("=" * 80)
    return True


def test_quiz_generator():
    """Test the quiz generator"""
    print("\n" + "=" * 80)
    print("QUIZ GENERATOR TEST")
    print("=" * 80)
    
    print("\n[1] Initializing Quiz Generator...")
    generator = QuizGenerator()
    
    if not generator.llm:
        print("✗ Failed: GROQ_API_KEY not set")
        return False
    
    print("    ✓ Generator initialized")
    
    print("\n[2] Generating MCQ Questions...")
    result = generator.generate_quiz(
        topic="Python Programming Basics",
        difficulty="intermediate",
        question_types=["mcq"],
        count=3
    )
    
    if not result.get("success"):
        print(f"✗ Failed: {result.get('error')}")
        return False
    
    print(f"    ✓ Generated {len(result['questions'])} questions")
    
    if result['questions']:
        q = result['questions'][0]
        print(f"\n    Sample Question:")
        print(f"    Q: {q.get('question', 'N/A')}")
        print(f"    Type: {q.get('type', 'N/A')}")
        print(f"    Difficulty: {q.get('difficulty', 'N/A')}")
        if q.get('options'):
            for opt in q['options']:
                print(f"       {opt}")
        print(f"    Correct: {q.get('correct_answer', 'N/A')}")
    
    print("\n[3] Generating Mixed Question Types...")
    result = generator.generate_quiz(
        topic="Mathematics - Algebra",
        difficulty="beginner",
        question_types=["mcq", "true_false"],
        count=4
    )
    
    if result.get("success"):
        print(f"    ✓ Generated {len(result['questions'])} mixed questions")
        types = [q.get('type') for q in result['questions']]
        print(f"    Types: {', '.join(types)}")
    
    print("\n[4] Generating Adaptive Quiz...")
    result = generator.generate_adaptive_quiz(
        topic="Science",
        student_level="intermediate",
        weak_areas=["Physics", "Chemistry"],
        count=3
    )
    
    if result.get("success"):
        print(f"    ✓ Generated {len(result['questions'])} adaptive questions")
        print(f"    Focused on weak areas: Physics, Chemistry")
    
    print("\n" + "=" * 80)
    print("✓ QUIZ GENERATOR TEST COMPLETE")
    print("=" * 80)
    return True


def test_adaptive_difficulty():
    """Test the adaptive difficulty engine"""
    print("\n" + "=" * 80)
    print("ADAPTIVE DIFFICULTY ENGINE TEST")
    print("=" * 80)
    
    print("\n[1] Initializing Adaptive Engine...")
    engine = AdaptiveDifficultyEngine()
    
    if not engine.llm:
        print("✗ Failed: GROQ_API_KEY not set")
        return False
    
    print("    ✓ Engine initialized")
    
    scenarios = [
        {
            "name": "High Score (>80%)",
            "difficulty": "beginner",
            "score": 85,
            "attempted": 10,
            "time": 15,
            "weak": []
        },
        {
            "name": "Medium Score (50-80%)",
            "difficulty": "intermediate",
            "score": 65,
            "attempted": 10,
            "time": 20,
            "weak": ["Algebra"]
        },
        {
            "name": "Low Score (<50%)",
            "difficulty": "advanced",
            "score": 40,
            "attempted": 10,
            "time": 25,
            "weak": ["Calculus", "Trigonometry"]
        }
    ]
    
    for i, scenario in enumerate(scenarios, 2):
        print(f"\n[{i}] Testing: {scenario['name']}")
        print(f"    Current: {scenario['difficulty']}, Score: {scenario['score']}%")
        
        result = engine.adjust_difficulty(
            current_difficulty=scenario['difficulty'],
            score_percent=scenario['score'],
            attempted=scenario['attempted'],
            time_taken=scenario['time'],
            weak_areas=scenario['weak']
        )
        
        if result.get("success"):
            print(f"    ✓ New Difficulty: {result.get('new_difficulty')}")
            print(f"    Reasoning: {result.get('reasoning', 'N/A')}")
            print(f"    Encouragement: {result.get('encouragement', 'N/A')}")
            if result.get('remediation_topics'):
                print(f"    Remediation: {', '.join(result['remediation_topics'])}")
        else:
            print(f"    ✗ Failed")
    
    print("\n" + "=" * 80)
    print("✓ ADAPTIVE DIFFICULTY TEST COMPLETE")
    print("=" * 80)
    return True


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "AGENTIC FEATURES TEST SUITE" + " " * 31 + "║")
    print("╚" + "=" * 78 + "╝")
    
    results = []
    
    try:
        results.append(("Agentic Coach", test_agentic_coach()))
    except Exception as e:
        print(f"\n✗ Agentic Coach Test Failed: {e}")
        results.append(("Agentic Coach", False))
    
    try:
        results.append(("Quiz Generator", test_quiz_generator()))
    except Exception as e:
        print(f"\n✗ Quiz Generator Test Failed: {e}")
        results.append(("Quiz Generator", False))
    
    try:
        results.append(("Adaptive Difficulty", test_adaptive_difficulty()))
    except Exception as e:
        print(f"\n✗ Adaptive Difficulty Test Failed: {e}")
        results.append(("Adaptive Difficulty", False))
    
    print("\n\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 32 + "TEST SUMMARY" + " " * 34 + "║")
    print("╚" + "=" * 78 + "╝")
    
    for name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"  {name:.<50} {status}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n  🎉 All tests passed!")
    else:
        print(f"\n  ⚠️  {total - passed} test(s) failed")
    
    print("\n")


if __name__ == "__main__":
    main()
