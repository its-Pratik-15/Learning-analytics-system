from typing import List, Dict, Any
import os
from pathlib import Path


class DocumentLoader:
    """Load and prepare documents for RAG pipeline"""
    
    # Default study materials
    DEFAULT_MATERIALS = {
        "study_techniques": """
        # Effective Study Techniques
        
        ## Active Recall
        Active recall is the practice of retrieving information from memory without looking at the source material.
        Instead of re-reading notes, test yourself on the material. This strengthens memory pathways.
        
        ## Spaced Repetition
        Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks, 1 month).
        This technique leverages how our brain consolidates long-term memory.
        
        ## Interleaving
        Mix different topics or problem types during study sessions instead of blocking.
        This improves your ability to distinguish between concepts and apply them flexibly.
        
        ## Elaboration
        Connect new information to existing knowledge. Ask yourself "why" and "how" questions.
        Explain concepts in your own words to deepen understanding.
        
        ## Feynman Technique
        1. Choose a concept
        2. Explain it simply as if teaching a child
        3. Identify gaps in your explanation
        4. Review source material and simplify further
        
        ## Pomodoro Technique
        Study for 25 minutes with full focus, then take a 5-minute break.
        After 4 cycles, take a longer 15-30 minute break.
        This maintains focus and prevents burnout.
        """,
        
        "time_management": """
        # Time Management for Students
        
        ## Creating a Study Schedule
        1. List all subjects and topics to cover
        2. Estimate time needed for each
        3. Distribute across available days
        4. Include buffer time for difficult topics
        5. Schedule breaks and leisure time
        
        ## Priority Matrix
        - Urgent & Important: Do first
        - Important but Not Urgent: Schedule
        - Urgent but Not Important: Delegate if possible
        - Neither: Eliminate or minimize
        
        ## Daily Routine
        - Morning: Review previous day's material (15 min)
        - Main Study: Focus on new concepts (2-3 hours)
        - Practice: Problem-solving and exercises (1-2 hours)
        - Evening: Review and plan next day (15 min)
        
        ## Avoiding Procrastination
        1. Break tasks into smaller chunks
        2. Start with the most difficult task
        3. Use the 2-minute rule: if it takes less than 2 min, do it now
        4. Remove distractions
        5. Reward yourself after completing tasks
        """,
        
        "exam_preparation": """
        # Exam Preparation Guide
        
        ## 4 Weeks Before Exam
        - Review syllabus and exam format
        - Create study schedule
        - Organize notes and materials
        - Identify weak areas
        
        ## 2 Weeks Before Exam
        - Complete all practice problems
        - Review past exams
        - Form study groups
        - Create summary sheets
        
        ## 1 Week Before Exam
        - Focus on weak areas
        - Do full-length practice tests
        - Review formulas and key concepts
        - Get adequate sleep
        
        ## Day Before Exam
        - Light review only
        - Prepare materials needed
        - Get 8 hours of sleep
        - Avoid cramming
        
        ## Exam Day
        - Eat a healthy breakfast
        - Arrive early
        - Read all questions before starting
        - Manage time: allocate time per question
        - Review answers if time permits
        """,
        
        "mathematics": """
        # Mathematics Study Guide
        
        ## Problem-Solving Strategy
        1. Understand the problem: Read carefully, identify what's given and what to find
        2. Plan: Choose a strategy (draw diagram, work backwards, simplify)
        3. Execute: Follow your plan step by step
        4. Check: Verify your answer makes sense
        
        ## Common Topics
        
        ### Algebra
        - Master basic operations and order of operations
        - Understand variables and equations
        - Practice factoring and expanding
        - Learn to solve linear and quadratic equations
        
        ### Geometry
        - Memorize key formulas for area, perimeter, volume
        - Understand properties of shapes
        - Practice coordinate geometry
        - Visualize problems with diagrams
        
        ### Calculus
        - Understand limits and continuity
        - Master derivatives and their applications
        - Learn integration techniques
        - Practice optimization problems
        
        ## Tips for Success
        - Practice regularly, not just before exams
        - Work through examples step by step
        - Don't just memorize formulas, understand them
        - Check your work for calculation errors
        - Seek help when stuck
        """,
        
        "reading_comprehension": """
        # Reading Comprehension Skills
        
        ## Active Reading Techniques
        1. Preview: Scan headings, summaries, questions
        2. Question: Ask yourself what you expect to learn
        3. Read: Focus on main ideas and supporting details
        4. Recite: Summarize in your own words
        5. Review: Go back and check understanding
        
        ## Identifying Main Ideas
        - Look for topic sentences (usually first or last sentence)
        - Notice repeated concepts
        - Distinguish between main ideas and supporting details
        - Summarize each paragraph in one sentence
        
        ## Vocabulary Building
        - Learn words in context
        - Use flashcards for difficult words
        - Read widely across different subjects
        - Practice using new words in sentences
        
        ## Critical Thinking
        - Question the author's purpose and bias
        - Distinguish between facts and opinions
        - Evaluate evidence and arguments
        - Make connections to prior knowledge
        """,
        
        "stress_management": """
        # Stress Management for Students
        
        ## Recognizing Stress
        - Physical: headaches, fatigue, sleep problems
        - Emotional: anxiety, irritability, overwhelm
        - Behavioral: procrastination, poor eating, isolation
        
        ## Stress Reduction Techniques
        
        ### Breathing Exercises
        - Box breathing: Inhale 4, hold 4, exhale 4, hold 4
        - Deep breathing: Slow, deep breaths from diaphragm
        - Practice 5-10 minutes daily
        
        ### Physical Activity
        - Exercise releases endorphins
        - 30 minutes of moderate activity daily
        - Walking, running, yoga, sports all help
        
        ### Mindfulness and Meditation
        - Focus on present moment
        - Observe thoughts without judgment
        - Start with 5-10 minutes daily
        
        ### Sleep Hygiene
        - Maintain consistent sleep schedule
        - Avoid screens 1 hour before bed
        - Keep bedroom cool and dark
        - Aim for 7-9 hours nightly
        
        ### Social Support
        - Talk to friends and family
        - Join study groups
        - Seek help from teachers/counselors
        - Don't isolate yourself
        """,
        
        "learning_styles": """
        # Understanding Your Learning Style
        
        ## Visual Learners
        - Prefer diagrams, charts, and visual representations
        - Study tips: Use mind maps, color-code notes, watch videos
        - Create visual summaries and flowcharts
        
        ## Auditory Learners
        - Learn best through listening and discussion
        - Study tips: Record lectures, discuss with others, read aloud
        - Join study groups and participate in discussions
        
        ## Reading/Writing Learners
        - Prefer reading and writing information
        - Study tips: Take detailed notes, rewrite notes, read textbooks
        - Create written summaries and outlines
        
        ## Kinesthetic Learners
        - Learn through hands-on experience and movement
        - Study tips: Use manipulatives, practice problems, teach others
        - Take breaks to move around while studying
        
        ## Multimodal Learners
        - Use combination of learning styles
        - Study tips: Mix different techniques, adapt to content type
        - Experiment to find what works best
        
        ## Adapting to Your Style
        1. Identify your primary learning style
        2. Use techniques that match your style
        3. Don't ignore other styles completely
        4. Adapt techniques to different subjects
        5. Be flexible and experiment
        """
    }
    
    @staticmethod
    def load_default_materials() -> List[Dict[str, str]]:
        """Load default study materials"""
        documents = []
        for title, content in DocumentLoader.DEFAULT_MATERIALS.items():
            documents.append({
                "content": content,
                "metadata": {
                    "source": "default_materials",
                    "title": title,
                    "type": "study_guide"
                }
            })
        return documents
    
    @staticmethod
    def load_from_file(file_path: str) -> Dict[str, str]:
        """Load document from file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                "content": content,
                "metadata": {
                    "source": "file",
                    "file_path": file_path,
                    "file_name": os.path.basename(file_path)
                }
            }
        except Exception as e:
            print(f"Error loading file {file_path}: {e}")
            return None
    
    @staticmethod
    def load_from_directory(directory_path: str) -> List[Dict[str, str]]:
        """Load all text files from directory"""
        documents = []
        try:
            for file_path in Path(directory_path).glob("**/*.txt"):
                doc = DocumentLoader.load_from_file(str(file_path))
                if doc:
                    documents.append(doc)
        except Exception as e:
            print(f"Error loading directory {directory_path}: {e}")
        
        return documents
    
    @staticmethod
    def load_csv_as_documents(csv_path: str, text_column: str = "content") -> List[Dict[str, str]]:
        """Load documents from CSV file"""
        try:
            import pandas as pd
            df = pd.read_csv(csv_path)
            
            documents = []
            for idx, row in df.iterrows():
                if text_column in row:
                    documents.append({
                        "content": str(row[text_column]),
                        "metadata": {
                            "source": "csv",
                            "file": csv_path,
                            "row_index": idx
                        }
                    })
            return documents
        except Exception as e:
            print(f"Error loading CSV {csv_path}: {e}")
            return []
