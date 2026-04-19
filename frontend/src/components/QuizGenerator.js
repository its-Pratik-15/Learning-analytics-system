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
} from '@mui/material';
import {
  Quiz as QuizIcon,
  CheckCircle,
  Cancel,
  EmojiEvents,
} from '@mui/icons-material';

const QuizGenerator = ({ open, onClose, subject = 'Mathematics' }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([
    {
      id: 1,
      question: 'What is the derivative of x²?',
      options: ['x', '2x', 'x²', '2'],
      correct: 1,
      difficulty: 'Easy'
    },
    {
      id: 2,
      question: 'Solve for x: 2x + 5 = 15',
      options: ['5', '10', '7.5', '20'],
      correct: 0,
      difficulty: 'Easy'
    },
    {
      id: 3,
      question: 'What is the value of π (pi) approximately?',
      options: ['3.14', '2.71', '1.41', '1.73'],
      correct: 0,
      difficulty: 'Easy'
    },
    {
      id: 4,
      question: 'What is the Pythagorean theorem?',
      options: ['a + b = c', 'a² + b² = c²', 'a × b = c', 'a/b = c'],
      correct: 1,
      difficulty: 'Medium'
    },
    {
      id: 5,
      question: 'What is the integral of 2x?',
      options: ['x²', 'x² + C', '2', '2x²'],
      correct: 1,
      difficulty: 'Medium'
    }
  ]);

  const handleStartQuiz = async () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);

    try {
      // Fetch quiz from backend
      const { generateQuiz } = await import('../services/api');
      const result = await generateQuiz(subject, 'intermediate', ['mcq'], 5);
      
      if (result.success && result.questions) {
        setQuizQuestions(result.questions);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      // Use mock questions as fallback
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
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

  const calculateScore = () => {
    let correctAnswers = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
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
              This quiz contains {quizQuestions.length} questions covering various topics in {subject}.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartQuiz}
              startIcon={<QuizIcon />}
            >
              Start Quiz
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
                  label={currentQ.difficulty}
                  size="small"
                  color={
                    currentQ.difficulty === 'Easy'
                      ? 'success'
                      : currentQ.difficulty === 'Medium'
                      ? 'warning'
                      : 'error'
                  }
                />
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">{currentQ.question}</Typography>
              </CardContent>
            </Card>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQ.id] ?? ''}
                onChange={(e) => handleAnswerSelect(currentQ.id, parseInt(e.target.value))}
              >
                {currentQ.options.map((option, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: answers[currentQ.id] === index ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.light',
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => handleAnswerSelect(currentQ.id, index)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <FormControlLabel
                        value={index}
                        control={<Radio />}
                        label={option}
                        sx={{ width: '100%', m: 0 }}
                      />
                    </CardContent>
                  </Card>
                ))}
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
                Answer Review
              </Typography>
              {quizQuestions.map((q, index) => (
                <Card key={q.id} sx={{ mb: 2, textAlign: 'left' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {answers[q.id] === q.correct ? (
                        <CheckCircle color="success" sx={{ mr: 1 }} />
                      ) : (
                        <Cancel color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="subtitle2">
                        Question {index + 1}: {q.question}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Your answer: {q.options[answers[q.id]] || 'Not answered'}
                    </Typography>
                    {answers[q.id] !== q.correct && (
                      <Typography variant="body2" color="success.main">
                        Correct answer: {q.options[q.correct]}
                      </Typography>
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
