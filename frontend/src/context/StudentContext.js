import React, { createContext, useContext, useState } from 'react';

const StudentContext = createContext();

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [learningGoals, setLearningGoals] = useState([]);
  const [progressHistory, setProgressHistory] = useState([]);

  const updateStudentData = (data) => {
    setStudentData(data);
  };

  const updateRiskAnalysis = (analysis) => {
    setRiskAnalysis(analysis);
  };

  const updateStudyPlan = (plan) => {
    setStudyPlan(plan);
  };

  const addLearningGoal = (goal) => {
    setLearningGoals([...learningGoals, { ...goal, id: Date.now() }]);
  };

  const updateGoalProgress = (goalId, progress) => {
    setLearningGoals(
      learningGoals.map((goal) =>
        goal.id === goalId ? { ...goal, progress } : goal
      )
    );
  };

  const addProgressEntry = (entry) => {
    setProgressHistory([...progressHistory, { ...entry, timestamp: new Date() }]);
  };

  const value = {
    studentData,
    riskAnalysis,
    studyPlan,
    learningGoals,
    progressHistory,
    updateStudentData,
    updateRiskAnalysis,
    updateStudyPlan,
    addLearningGoal,
    updateGoalProgress,
    addProgressEntry,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};
