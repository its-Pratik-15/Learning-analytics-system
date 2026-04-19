import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# ============================================================================
# GLOBAL VARIABLES
# ============================================================================
VECTOR_STORE = None
EMBEDDINGS = None
LLM = None
INITIALIZED = False
FAISS_INDEX_PATH = "./faiss_index"


# ============================================================================
# STUDY MATERIALS DATA
# ============================================================================
DEFAULT_STUDY_MATERIALS = {
    "study_techniques": """
    # Effective Study Techniques
    
    ## Active Recall
    Active recall is the practice of retrieving information from memory without looking at the source material.
    Instead of re-reading notes, test yourself on the material. This strengthens memory pathways.
    
    ## Spaced Repetition
    Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks, 1 month).
    This technique leverages how our brain consolidates long-term memory.
    
    ## Pomodoro Technique
    Study for 25 minutes with full focus, then take a 5-minute break.
    After 4 cycles, take a longer 15-30 minute break.
    """,
    
    "time_management": """
    # Time Management for Students
    
    ## Creating a Study Schedule
    1. List all subjects and topics to cover
    2. Estimate time needed for each
    3. Distribute across available days
    4. Include buffer time for difficult topics
    
    ## Avoiding Procrastination
    1. Break tasks into smaller chunks
    2. Start with the most difficult task
    3. Remove distractions
    4. Reward yourself after completing tasks
    """,
    
    "exam_preparation": """
    # Exam Preparation Guide
    
    ## 2 Weeks Before Exam
    - Complete all practice problems
    - Review past exams
    - Create summary sheets
    
    ## 1 Week Before Exam
    - Focus on weak areas
    - Do full-length practice tests
    - Get adequate sleep
    
    ## Exam Day
    - Eat a healthy breakfast
    - Arrive early
    - Manage time wisely
    """,
    
    "mathematics": """
    # Mathematics Study Guide
    
    ## Problem-Solving Strategy
    1. Understand the problem
    2. Plan your approach
    3. Execute step by step
    4. Check your answer
    
    ## Tips for Success
    - Practice regularly
    - Understand formulas, don't just memorize
    - Check your work for errors
    """
}


# ============================================================================
# RAG PIPELINE FUNCTIONS
# ============================================================================

def initialize_rag_components():
    """Initialize RAG components globally with FAISS"""
    global VECTOR_STORE, EMBEDDINGS, LLM, INITIALIZED
    
    if INITIALIZED:
        print("✓ RAG already initialized")
        return True
    
    try:
        print("Initializing RAG components...")
        
        from langchain_groq import ChatGroq
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain_community.vectorstores import FAISS
        
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            print("✗ GROQ_API_KEY not set")
            return False
        
        # Initialize embeddings
        print("  → Loading embeddings model...")
        EMBEDDINGS = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Initialize Groq LLM
        print("  → Connecting to Groq...")
        LLM = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            groq_api_key=groq_api_key,
            max_tokens=1024
        )
        
        # Initialize FAISS
        print("  → Setting up FAISS vector store...")
        os.makedirs(FAISS_INDEX_PATH, exist_ok=True)
        
        try:
            VECTOR_STORE = FAISS.load_local(
                FAISS_INDEX_PATH,
                EMBEDDINGS,
                allow_dangerous_deserialization=True
            )
            print("  → Loaded existing FAISS index")
        except:
            print("  → No existing index, will create on first document add")
            VECTOR_STORE = None
        
        INITIALIZED = True
        print("✓ RAG components initialized successfully!\n")
        return True
        
    except Exception as e:
        print(f"✗ Error initializing RAG: {e}")
        return False


def add_documents_to_vector_db(documents: List[Dict[str, str]]) -> bool:
    """Add documents to FAISS vector database"""
    global VECTOR_STORE, EMBEDDINGS
    
    if not INITIALIZED or EMBEDDINGS is None:
        print("✗ RAG not initialized")
        return False
    
    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_core.documents import Document
        from langchain_community.vectorstores import FAISS
        
        print(f"Adding {len(documents)} documents to vector DB...")
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        
        docs = []
        for doc in documents:
            content = doc.get('content', '')
            metadata = doc.get('metadata', {})
            chunks = text_splitter.split_text(content)
            
            for chunk in chunks:
                docs.append(Document(page_content=chunk, metadata=metadata))
        
        if not docs:
            return False
        
        # Add to FAISS
        if VECTOR_STORE is None:
            VECTOR_STORE = FAISS.from_documents(docs, EMBEDDINGS)
        else:
            new_store = FAISS.from_documents(docs, EMBEDDINGS)
            VECTOR_STORE.merge_from(new_store)
        
        # Save to disk
        VECTOR_STORE.save_local(FAISS_INDEX_PATH)
        
        print(f"✓ Added {len(docs)} chunks to FAISS\n")
        return True
        
    except Exception as e:
        print(f"✗ Error adding documents: {e}")
        return False


def query_rag_pipeline(question: str, top_k: int = 3) -> Dict[str, Any]:
    """
    Query RAG pipeline with FAISS similarity search
    
    Flow:
    1. Embed query → 2. FAISS similarity search → 3. Retrieve top-k → 4. LLM generation
    """
    global VECTOR_STORE, LLM
    
    if not INITIALIZED or VECTOR_STORE is None or LLM is None:
        return {
            "answer": "RAG pipeline not ready. Please initialize and add documents.",
            "sources": [],
            "success": False
        }
    
    try:
        from langchain_core.prompts import ChatPromptTemplate
        
        print(f"\nQuery: {question[:100]}...")
        print(f"Searching FAISS for top {top_k} chunks...")
        
        # FAISS similarity search
        retrieved_docs_with_scores = VECTOR_STORE.similarity_search_with_score(question, k=top_k)
        
        if not retrieved_docs_with_scores:
            return {
                "answer": "No relevant information found.",
                "sources": [],
                "success": False
            }
        
        # Build context from top-k chunks
        context_parts = []
        sources = []
        
        for i, (doc, score) in enumerate(retrieved_docs_with_scores):
            similarity = 1 / (1 + score)
            context_parts.append(f"[Source {i+1}]: {doc.page_content}")
            sources.append({
                "content": doc.page_content[:150] + "...",
                "metadata": doc.metadata,
                "rank": i + 1,
                "similarity_score": round(similarity, 3)
            })
            print(f"  → Chunk {i+1}: similarity={similarity:.3f}")
        
        context = "\n\n".join(context_parts)
        
        # Send to Groq LLM
        print("Generating response with Groq...")
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert study coach helping students improve their academic performance.

Use the following context from study materials:

{context}

Provide a helpful, encouraging, and actionable response that:
1. Directly addresses the student's question
2. References relevant study materials
3. Includes specific study techniques
4. Is motivating and supportive"""),
            ("human", "{question}")
        ])
        
        chain = prompt | LLM
        response = chain.invoke({"context": context, "question": question})
        
        print("✓ Response generated\n")
        
        return {
            "answer": response.content,
            "sources": sources,
            "success": True,
            "retrieved_chunks": len(retrieved_docs_with_scores),
            "vector_db": "FAISS"
        }
        
    except Exception as e:
        print(f"✗ Error querying: {e}")
        return {
            "answer": f"Error: {str(e)}",
            "sources": [],
            "success": False
        }


def load_default_materials() -> List[Dict[str, str]]:
    """Load default study materials"""
    documents = []
    for title, content in DEFAULT_STUDY_MATERIALS.items():
        documents.append({
            "content": content,
            "metadata": {
                "source": "default_materials",
                "title": title,
                "type": "study_guide"
            }
        })
    return documents


def get_vector_db_stats() -> Dict[str, Any]:
    """Get FAISS vector database statistics"""
    global VECTOR_STORE
    
    if not INITIALIZED or VECTOR_STORE is None:
        return {
            "initialized": False,
            "total_vectors": 0
        }
    
    try:
        index = VECTOR_STORE.index
        return {
            "initialized": True,
            "total_vectors": index.ntotal,
            "vector_db": "FAISS",
            "dimension": index.d
        }
    except Exception as e:
        return {
            "initialized": True,
            "error": str(e)
        }


# ============================================================================
# TEST FUNCTIONS
# ============================================================================

def test_rag_pipeline():
    """Test the complete RAG pipeline"""
    print("=" * 70)
    print("RAG PIPELINE TEST")
    print("=" * 70)
    
    # Step 1: Initialize
    print("\n[1] Initializing RAG components...")
    if not initialize_rag_components():
        print("Failed to initialize. Check GROQ_API_KEY.")
        return
    
    # Step 2: Load documents
    print("[2] Loading default study materials...")
    docs = load_default_materials()
    print(f"  → Loaded {len(docs)} documents")
    
    # Step 3: Add to vector DB
    print("\n[3] Adding documents to FAISS vector database...")
    if not add_documents_to_vector_db(docs):
        print("Failed to add documents.")
        return
    
    # Step 4: Check stats
    print("[4] Vector DB Statistics:")
    stats = get_vector_db_stats()
    for key, value in stats.items():
        print(f"  → {key}: {value}")
    
    # Step 5: Test queries
    print("\n[5] Testing RAG queries...")
    print("-" * 70)
    
    test_questions = [
        "How can I improve my study habits?",
        "What is the Pomodoro technique?",
        "How should I prepare for an exam?"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\nTest Query {i}:")
        result = query_rag_pipeline(question, top_k=2)
        
        if result["success"]:
            print(f"Answer: {result['answer'][:200]}...")
            print(f"Sources: {len(result['sources'])} chunks retrieved")
        else:
            print(f"Failed: {result['answer']}")
        
        print("-" * 70)
    
    print("\n✓ RAG Pipeline Test Complete!")
    print("=" * 70)


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    test_rag_pipeline()
