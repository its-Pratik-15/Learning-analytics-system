import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for AI operations
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      console.error('Network Error:', error.message);
      throw new Error('Network error. Please check if the backend server is running.');
    } else {
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// ============================================================================
// PREDICTION ENDPOINTS
// ============================================================================

export const predictStudentRisk = async (studentData) => {
  const response = await api.post('/api/predict', studentData);
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

// ============================================================================
// RAG PIPELINE ENDPOINTS
// ============================================================================

export const ragQuery = async (question) => {
  const response = await api.post('/api/rag/query', { question });
  return response.data;
};

export const getRecommendations = async (studentProfile) => {
  const response = await api.post('/api/rag/recommendations', studentProfile);
  return response.data;
};

export const getSubjectHelp = async (subject, topic, difficulty = 'intermediate') => {
  const response = await api.post('/api/rag/subject-help', {
    subject,
    topic,
    difficulty,
  });
  return response.data;
};

export const getExamPrep = async (subject, examType, daysUntilExam) => {
  const response = await api.post('/api/rag/exam-prep', {
    subject,
    exam_type: examType,
    days_until_exam: daysUntilExam,
  });
  return response.data;
};

export const addDocuments = async (documents) => {
  const response = await api.post('/api/rag/add-documents', documents);
  return response.data;
};

export const ragStatus = async () => {
  const response = await api.get('/api/rag/status');
  return response.data;
};

// ============================================================================
// AGENTIC COACH ENDPOINTS
// ============================================================================

export const executeAgenticWorkflow = async (coachRequest) => {
  const response = await api.post('/api/coach/workflow', coachRequest);
  return response.data;
};

export const coachStatus = async () => {
  const response = await api.get('/api/coach/status');
  return response.data;
};

// ============================================================================
// QUIZ GENERATOR ENDPOINTS
// ============================================================================

export const generateQuiz = async (topic, difficulty = 'intermediate', questionTypes = ['mcq'], count = 5) => {
  const response = await api.post('/api/quiz/generate', {
    topic,
    difficulty,
    question_types: questionTypes,
    count,
  });
  return response.data;
};

export const generateAdaptiveQuiz = async (topic, studentLevel, weakAreas = [], count = 5) => {
  const response = await api.post('/api/quiz/adaptive', null, {
    params: {
      topic,
      student_level: studentLevel,
      weak_areas: weakAreas,
      count,
    },
  });
  return response.data;
};

export const adjustDifficulty = async (currentDifficulty, scorePercent, attempted, timeTaken, weakAreas = []) => {
  const response = await api.post('/api/quiz/adjust-difficulty', {
    current_difficulty: currentDifficulty,
    score_percent: scorePercent,
    attempted,
    time_taken: timeTaken,
    weak_areas: weakAreas,
  });
  return response.data;
};

export const quizStatus = async () => {
  const response = await api.get('/api/quiz/status');
  return response.data;
};

export default api;
