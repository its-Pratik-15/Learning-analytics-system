import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from functools import lru_cache
import logging

from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class RetrievalConfig:
    """Configuration for retrieval parameters"""
    initial_top_k: int = 10  # Retrieve more for reranking
    final_top_k: int = 3     # Final chunks after reranking
    chunk_size: int = 500
    chunk_overlap: int = 100
    embedding_model: str = "BAAI/bge-base-en-v1.5"
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    llm_model: str = "llama-3.3-70b-versatile"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 1024


@dataclass
class RetrievalResult:
    """Result from retrieval and reranking"""
    answer: str
    sources: List[Dict[str, Any]]
    success: bool
    retrieved_chunks: int
    reranked_chunks: int
    vector_db: str = "FAISS"


# ============================================================================
# RAG PIPELINE CLASS
# ============================================================================

class ProductionRAGPipeline:
    """
    Production-ready RAG pipeline with:
    - Better embeddings (BGE with normalization)
    - Optimized chunking
    - Cross-encoder reranking
    - Proper similarity scoring
    - Structured prompts
    """
    
    def __init__(
        self,
        groq_api_key: Optional[str] = None,
        persist_dir: str = "./faiss_index",
        config: Optional[RetrievalConfig] = None
    ):
        """
        Initialize RAG pipeline
        
        Args:
            groq_api_key: Groq API key (or from env)
            persist_dir: Directory to persist FAISS index
            config: Retrieval configuration
        """
        self.config = config or RetrievalConfig()
        self.persist_dir = persist_dir
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
        
        # Initialize components
        self.embeddings = None
        self.llm = None
        self.vector_store = None
        self.reranker = None
        self.text_splitter = None
        
        # Initialize pipeline
        self._initialize_components()
    
    def _initialize_components(self) -> bool:
        """Initialize all RAG components"""
        try:
            logger.info("Initializing RAG components...")
            
            if not self.groq_api_key:
                logger.warning("GROQ_API_KEY not set. LLM will not be functional.")
                return False
            
            # 1. Initialize improved embeddings with normalization
            self._initialize_embeddings()
            
            # 2. Initialize LLM
            self._initialize_llm()
            
            # 3. Initialize reranker
            self._initialize_reranker()
            
            # 4. Initialize text splitter with optimized parameters
            self._initialize_text_splitter()
            
            # 5. Load or create FAISS index
            self._load_vector_store()
            
            logger.info("✓ RAG components initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG components: {e}")
            return False
    
    def _initialize_embeddings(self):
        """Initialize BGE embeddings with normalization"""
        from langchain_community.embeddings import HuggingFaceEmbeddings
        
        logger.info(f"Loading embeddings: {self.config.embedding_model}")
        
        # BGE embeddings with normalization for better similarity
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.config.embedding_model,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={
                'normalize_embeddings': True,  # Normalize for cosine similarity
                'batch_size': 32
            }
        )
        logger.info("✓ Embeddings loaded with normalization")
    
    def _initialize_llm(self):
        """Initialize Groq LLM"""
        from langchain_groq import ChatGroq
        
        logger.info(f"Connecting to Groq LLM: {self.config.llm_model}")
        
        self.llm = ChatGroq(
            model=self.config.llm_model,
            temperature=self.config.llm_temperature,
            groq_api_key=self.groq_api_key,
            max_tokens=self.config.llm_max_tokens
        )
        logger.info("✓ Groq LLM connected")
    
    def _initialize_reranker(self):
        """Initialize cross-encoder reranker"""
        from sentence_transformers import CrossEncoder
        
        logger.info(f"Loading reranker: {self.config.reranker_model}")
        
        self.reranker = CrossEncoder(self.config.reranker_model)
        logger.info("✓ Reranker loaded")
    
    def _initialize_text_splitter(self):
        """Initialize text splitter with optimized parameters"""
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config.chunk_size,
            chunk_overlap=self.config.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],  # Clean splitting
            length_function=len,
        )
        logger.info(f"✓ Text splitter initialized (size={self.config.chunk_size}, overlap={self.config.chunk_overlap})")
    
    def _load_vector_store(self):
        """Load existing FAISS index or prepare for new one"""
        from langchain_community.vectorstores import FAISS
        
        os.makedirs(self.persist_dir, exist_ok=True)
        
        try:
            self.vector_store = FAISS.load_local(
                self.persist_dir,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            logger.info("✓ Loaded existing FAISS index")
        except Exception as e:
            logger.info("No existing FAISS index found, will create on first document add")
            self.vector_store = None
    
    def add_documents(self, documents: List[Dict[str, str]]) -> bool:
        """
        Add documents to FAISS vector store with improved chunking
        
        Args:
            documents: List of dicts with 'content' and optional 'metadata'
        
        Returns:
            Success status
        """
        try:
            from langchain_core.documents import Document
            from langchain_community.vectorstores import FAISS
            
            logger.info(f"Processing {len(documents)} documents...")
            
            # Split documents into optimized chunks
            docs = []
            for doc in documents:
                content = doc.get('content', '')
                metadata = doc.get('metadata', {})
                
                # Use optimized chunking
                chunks = self.text_splitter.split_text(content)
                
                for i, chunk in enumerate(chunks):
                    # Add chunk index to metadata
                    chunk_metadata = {**metadata, 'chunk_index': i}
                    docs.append(Document(page_content=chunk, metadata=chunk_metadata))
            
            if not docs:
                logger.warning("No documents to add")
                return False
            
            # Add to FAISS with normalized embeddings
            if self.vector_store is None:
                self.vector_store = FAISS.from_documents(docs, self.embeddings)
            else:
                new_store = FAISS.from_documents(docs, self.embeddings)
                self.vector_store.merge_from(new_store)
            
            # Persist to disk
            self.vector_store.save_local(self.persist_dir)
            
            logger.info(f"✓ Added {len(docs)} chunks to FAISS")
            return True
            
        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            return False
    
    def _rerank_documents(
        self,
        query: str,
        documents: List[tuple],
        top_k: int
    ) -> List[tuple]:
        """
        Rerank documents using cross-encoder
        
        Args:
            query: Search query
            documents: List of (Document, score) tuples
            top_k: Number of top documents to return
        
        Returns:
            Reranked list of (Document, rerank_score) tuples
        """
        if not documents:
            return []
        
        # Prepare query-document pairs for reranking
        pairs = [[query, doc.page_content] for doc, _ in documents]
        
        # Get reranking scores (higher is better)
        rerank_scores = self.reranker.predict(pairs)
        
        # Combine documents with rerank scores
        reranked = [
            (doc, float(score))
            for (doc, _), score in zip(documents, rerank_scores)
        ]
        
        # Sort by rerank score (descending) and take top_k
        reranked.sort(key=lambda x: x[1], reverse=True)
        
        return reranked[:top_k]
    
    def _build_structured_prompt(self) -> str:
        """Build structured prompt for study coach"""
        return """You are an expert AI Study Coach helping students improve their academic performance.

Use ONLY the information from the provided context to answer the question. Do not add information that is not in the context.

Context from study materials:
{context}

Student Question: {question}

Provide a structured response with:

1. **Explanation**: Clear explanation addressing the question directly
2. **Action Steps**: Specific, actionable steps the student can take
3. **Tips**: Practical tips for implementation
4. **Sources**: Reference which sources you used (e.g., "Based on Source 1...")

Guidelines:
- Be encouraging and supportive
- Use simple, clear language
- Provide specific, actionable advice
- Stay strictly within the provided context
- If the context doesn't contain relevant information, say so honestly

Response:"""
    
    def query(
        self,
        question: str,
        metadata_filter: Optional[Dict[str, Any]] = None
    ) -> RetrievalResult:
        """
        Query RAG pipeline with reranking
        
        Flow:
        1. Embed query with BGE
        2. Retrieve top-10 from FAISS (cosine similarity)
        3. Rerank with cross-encoder
        4. Select top-3 after reranking
        5. Generate response with structured prompt
        
        Args:
            question: User's question
            metadata_filter: Optional metadata filter
        
        Returns:
            RetrievalResult with answer and sources
        """
        if not self.vector_store or not self.llm:
            return RetrievalResult(
                answer="RAG pipeline not ready. Please initialize and add documents.",
                sources=[],
                success=False,
                retrieved_chunks=0,
                reranked_chunks=0
            )
        
        try:
            logger.info(f"Query: {question[:100]}...")
            
            # Step 1 & 2: Retrieve top-10 from FAISS
            # Note: With normalized embeddings, FAISS returns proper cosine similarity
            logger.info(f"Retrieving top {self.config.initial_top_k} chunks from FAISS...")
            
            retrieved_docs = self.vector_store.similarity_search_with_score(
                question,
                k=self.config.initial_top_k,
                filter=metadata_filter
            )
            
            if not retrieved_docs:
                return RetrievalResult(
                    answer="No relevant information found in the knowledge base.",
                    sources=[],
                    success=False,
                    retrieved_chunks=0,
                    reranked_chunks=0
                )
            
            logger.info(f"Retrieved {len(retrieved_docs)} chunks")
            
            # Step 3: Rerank with cross-encoder
            logger.info(f"Reranking to top {self.config.final_top_k}...")
            reranked_docs = self._rerank_documents(
                question,
                retrieved_docs,
                self.config.final_top_k
            )
            
            logger.info(f"Reranked to {len(reranked_docs)} chunks")
            
            # Step 4: Build context from reranked documents
            context_parts = []
            sources = []
            
            for i, (doc, rerank_score) in enumerate(reranked_docs):
                context_parts.append(f"[Source {i+1}]: {doc.page_content}")
                sources.append({
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata,
                    "rank": i + 1,
                    "rerank_score": round(rerank_score, 4)
                })
                logger.info(f"  → Chunk {i+1}: rerank_score={rerank_score:.4f}")
            
            context = "\n\n".join(context_parts)
            
            # Step 5: Generate response with structured prompt
            logger.info("Generating response with Groq...")
            
            from langchain_core.prompts import ChatPromptTemplate
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", self._build_structured_prompt()),
            ])
            
            chain = prompt | self.llm
            response = chain.invoke({"context": context, "question": question})
            
            logger.info("✓ Response generated")
            
            return RetrievalResult(
                answer=response.content,
                sources=sources,
                success=True,
                retrieved_chunks=len(retrieved_docs),
                reranked_chunks=len(reranked_docs)
            )
            
        except Exception as e:
            logger.error(f"Error querying RAG pipeline: {e}")
            return RetrievalResult(
                answer=f"Error processing query: {str(e)}",
                sources=[],
                success=False,
                retrieved_chunks=0,
                reranked_chunks=0
            )
    
    def get_study_recommendations(
        self,
        student_profile: Dict[str, Any]
    ) -> RetrievalResult:
        """Get personalized study recommendations"""
        profile_text = f"""
        Student Profile:
        - Risk Level: {student_profile.get('risk_level', 'Unknown')}
        - Current Grade: {student_profile.get('current_grade', 'N/A')}
        - Study Time: {student_profile.get('study_time', 'N/A')} hours/week
        - Weak Areas: {', '.join(student_profile.get('weak_areas', []))}
        - Strengths: {', '.join(student_profile.get('strengths', []))}
        """
        
        question = f"""Based on this student profile:
        {profile_text}
        
        Provide personalized study recommendations including:
        1. Top 3 study strategies
        2. Recommended study schedule
        3. Key resources to focus on
        4. Motivational tips"""
        
        return self.query(question)
    
    def get_subject_help(
        self,
        subject: str,
        topic: str,
        difficulty: str = "intermediate"
    ) -> RetrievalResult:
        """Get help for specific subject and topic"""
        question = f"""I need help with {subject} - specifically {topic} at {difficulty} level.
        
        Please provide:
        1. Clear explanation of the concept
        2. Step-by-step examples
        3. Common mistakes to avoid
        4. Practice tips"""
        
        return self.query(question)
    
    def get_exam_prep(
        self,
        subject: str,
        exam_type: str,
        days_until_exam: int
    ) -> RetrievalResult:
        """Get exam preparation guidance"""
        question = f"""I have {days_until_exam} days to prepare for a {exam_type} exam in {subject}.
        
        Create a study plan including:
        1. Daily study schedule
        2. Topics to prioritize
        3. Practice test recommendations
        4. Stress management techniques"""
        
        return self.query(question)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get vector database statistics"""
        if not self.vector_store:
            return {
                "initialized": False,
                "total_vectors": 0
            }
        
        try:
            index = self.vector_store.index
            return {
                "initialized": True,
                "total_vectors": index.ntotal,
                "vector_db": "FAISS",
                "dimension": index.d,
                "embedding_model": self.config.embedding_model,
                "reranker_model": self.config.reranker_model,
                "chunk_size": self.config.chunk_size,
                "chunk_overlap": self.config.chunk_overlap
            }
        except Exception as e:
            return {
                "initialized": True,
                "error": str(e)
            }


# ============================================================================
# GLOBAL INSTANCE (for backward compatibility)
# ============================================================================

_global_pipeline: Optional[ProductionRAGPipeline] = None


def initialize_rag_pipeline(
    groq_api_key: Optional[str] = None,
    config: Optional[RetrievalConfig] = None
) -> ProductionRAGPipeline:
    """
    Initialize global RAG pipeline instance
    
    Args:
        groq_api_key: Groq API key
        config: Retrieval configuration
    
    Returns:
        ProductionRAGPipeline instance
    """
    global _global_pipeline
    
    if _global_pipeline is None:
        _global_pipeline = ProductionRAGPipeline(
            groq_api_key=groq_api_key,
            config=config
        )
    
    return _global_pipeline


def get_pipeline() -> Optional[ProductionRAGPipeline]:
    """Get global pipeline instance"""
    return _global_pipeline


# ============================================================================
# CONVENIENCE FUNCTIONS (for backward compatibility)
# ============================================================================

def add_documents_to_vector_db(documents: List[Dict[str, str]]) -> bool:
    """Add documents to global pipeline"""
    pipeline = get_pipeline()
    if pipeline:
        return pipeline.add_documents(documents)
    return False


def query_rag_pipeline(question: str, top_k: int = 3) -> Dict[str, Any]:
    """Query global pipeline"""
    pipeline = get_pipeline()
    if pipeline:
        result = pipeline.query(question)
        return result.__dict__
    return {
        "answer": "Pipeline not initialized",
        "sources": [],
        "success": False
    }


def get_vector_db_stats() -> Dict[str, Any]:
    """Get stats from global pipeline"""
    pipeline = get_pipeline()
    if pipeline:
        return pipeline.get_stats()
    return {"initialized": False}


# Backward compatibility wrapper class
class RAGPipeline:
    """Wrapper for backward compatibility"""
    
    def __init__(self, groq_api_key: str = None, persist_dir: str = "./faiss_index"):
        self.pipeline = ProductionRAGPipeline(groq_api_key, persist_dir)
        self.enabled = self.pipeline.llm is not None
    
    def add_documents(self, documents: List[Dict[str, str]]) -> bool:
        return self.pipeline.add_documents(documents)
    
    def query(self, question: str) -> Dict[str, Any]:
        result = self.pipeline.query(question)
        return result.__dict__
    
    def get_study_recommendations(self, student_profile: Dict[str, Any]) -> Dict[str, Any]:
        result = self.pipeline.get_study_recommendations(student_profile)
        return result.__dict__
    
    def get_subject_help(self, subject: str, topic: str, difficulty: str = "intermediate") -> Dict[str, Any]:
        result = self.pipeline.get_subject_help(subject, topic, difficulty)
        return result.__dict__
    
    def get_exam_prep(self, subject: str, exam_type: str, days_until_exam: int) -> Dict[str, Any]:
        result = self.pipeline.get_exam_prep(subject, exam_type, days_until_exam)
        return result.__dict__
