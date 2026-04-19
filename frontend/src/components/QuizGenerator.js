import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  CheckCircle,
  Cancel,
  EmojiEvents,
} from '@mui/icons-material';
import { generateQuiz, adjustQuizDifficulty } from '../services/api';

const QuizGenerator = ({ open, onClose, subject = 'Mathematics' }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficulty] = useState('intermediate');

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      // Fetch quiz questions from backend
      const result = await generateQuiz(subject, difficulty, ['mcq'], 5);
      
      if (result.success && result.questions) {
        setQuizQuestions(result.questions);
        setQuizStarted(true);
        setCurrentQuestion(0);
        setAnswers({});
        setShowResults(false);
        setScore(0);
      } else {
        console.error('Failed to generate quiz:', result.error);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    // Store the selected answer option (A, B, C, D) not the index
    const currentQ = quizQuestions.find(q => q.id === questionId);
    if (currentQ) {
      const answerLetter = ['A', 'B', 'C', 'D'][answerIndex];
      setAnswers({
        ...answers,
        [questionId]: answerLetter
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = async () => {
    let correctAnswers = 0;
    quizQuestions.forEach((q) => {
      // Compare user's answer with correct answer from backend
      if (answers[q.id] === q.correct_answer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    
    // Call backend to adjust difficulty based on performance
    try {
      const scorePercent = (correctAnswers / quizQuestions.length) * 100;
      await adjustQuizDifficulty(difficulty, scorePercent, quizQuestions.length, 0, []);
    } catch (error) {
      console.error('Error adjusting difficulty:', error);
    }
    
    setShowResults(true);
  };

  const handleClose = () => {
    setQuizStarted(false);
    setShowResults(false);
    onClose();
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const currentQ = quizQuestions[currentQuestion];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuizIcon color="primary" />
          <Box>
            <Typography variant="h6">Practice Quiz - {subject}</Typography>
            <Typography variant="caption" color="text.secondary">
              Test your knowledge with AI-generated questions
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {!quizStarted && !showResults && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <QuizIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Ready to Test Your Knowledge?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This quiz will test your knowledge in {subject}.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartQuiz}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <QuizIcon />}
            >
              {loading ? 'Loading Quiz...' : 'Start Quiz'}
            </Button>
          </Box>
        )}

        {quizStarted && !showResults && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </Typography>
                <Chip
                  label={currentQ?.difficulty || 'Medium'}
                  size="small"
                  color={
                    currentQ?.difficulty === 'beginner' || currentQ?.difficulty === 'Easy'
                      ? 'success'
                      : currentQ?.difficulty === 'intermediate' || currentQ?.difficulty === 'Medium'
                      ? 'warning'
                      : 'error'
                  }
                />
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">{currentQ?.question}</Typography>
              </CardContent>
            </Card>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQ?.id] ?? ''}
                onChange={(e) => handleAnswerSelect(currentQ?.id, ['A', 'B', 'C', 'D'].indexOf(e.target.value))}
              >
                {(currentQ?.options || []).map((option, index) => {
                  const answerLetter = ['A', 'B', 'C', 'D'][index];
                  return (
                    <Card
                      key={index}
                      sx={{
                        mb: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: answers[currentQ?.id] === answerLetter ? 'primary.main' : 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => handleAnswerSelect(currentQ?.id, index)}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <FormControlLabel
                          value={answerLetter}
                          control={<Radio />}
                          label={option}
                          sx={{ width: '100%', m: 0 }}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {showResults && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <EmojiEvents
              sx={{
                fontSize: 100,
                color: score >= quizQuestions.length * 0.7 ? 'success.main' : 'warning.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" gutterBottom>
              Quiz Complete!
            </Typography>
            <Typography variant="h5" color="primary" sx={{ mb: 3 }}>
              Your Score: {score} / {quizQuestions.length}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {score >= quizQuestions.length * 0.8
                ? 'Excellent work! You have a strong understanding of the material.'
                : score >= quizQuestions.length * 0.6
                ? 'Good job! Keep practicing to improve further.'
                : 'Keep studying! Review the topics and try again.'}
            </Typography>

            <Alert
              severity={score >= quizQuestions.length * 0.7 ? 'success' : 'info'}
              sx={{ mb: 3 }}
            >
              {score >= quizQuestions.length * 0.7
                ? 'You passed! Continue with more advanced topics.'
                : 'Review the material and try again to improve your score.'}
            </Alert>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Answer Review (with AI Explanations)
              </Typography>
              {quizQuestions.map((q, index) => (
                <Card key={q.id} sx={{ mb: 2, textAlign: 'left' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {answers[q.id] === q.correct_answer ? (
                        <CheckCircle color="success" sx={{ mr: 1 }} />
                      ) : (
                        <Cancel color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="subtitle2">
                        Question {index + 1}: {q.question}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Your answer: {answers[q.id] || 'Not answered'}
                    </Typography>
                    {answers[q.id] !== q.correct_answer && (
                      <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                        Correct answer: {q.correct_answer}
                      </Typography>
                    )}
                    {q.explanation && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Explanation:</strong> {q.explanation}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {quizStarted && !showResults && (
          <>
            <Button onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={answers[currentQ.id] === undefined}
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </>
        )}
        {(showResults || !quizStarted) && (
          <>
            {showResults && (
              <Button onClick={handleStartQuiz} variant="outlined">
                Retake Quiz
              </Button>
            )}
            <Button onClick={handleClose}>Close</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuizGenerator;
