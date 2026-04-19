import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      throw new Error('Network error. Please check if the backend server is running.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// Student Risk Prediction - Matches backend /api/predict endpoint
export const predictStudentRisk = async (studentData) => {
  const response = await api.post('/api/predict', studentData);
  return response.data;
};

// Health Check - Matches backend /api/health endpoint
export const healthCheck = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

// RAG Query Endpoint - For math questions and general queries
export const queryRAG = async (question) => {
  const response = await api.post('/api/rag/query', {
    question,
  });
  return response.data;
};

// Resources Endpoints
export const getRecommendedResources = async (studentProfile) => {
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

export const checkRAGStatus = async () => {
  const response = await api.get('/api/rag/status');
  return response.data;
};

// Agentic Coach Endpoints
export const executeCoachWorkflow = async (coachRequest) => {
  const response = await api.post('/api/coach/workflow', coachRequest);
  return response.data;
};

export const checkCoachStatus = async () => {
  const response = await api.get('/api/coach/status');
  return response.data;
};

// Quiz Generator Endpoints
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

export const adjustQuizDifficulty = async (currentDifficulty, scorePercent, attempted, timeTaken, weakAreas = []) => {
  const response = await api.post('/api/quiz/adjust-difficulty', {
    current_difficulty: currentDifficulty,
    score_percent: scorePercent,
    attempted,
    time_taken: timeTaken,
    weak_areas: weakAreas,
  });
  return response.data;
};

export const checkQuizStatus = async () => {
  const response = await api.get('/api/quiz/status');
  return response.data;
};

export default api;
