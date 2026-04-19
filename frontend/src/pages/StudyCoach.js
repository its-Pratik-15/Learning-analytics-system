import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  CheckCircle,
  ExpandMore,
  School,
  MenuBook,
  Assignment,
  Link as LinkIcon,
  CalendarToday,
  Quiz as QuizIcon,
  Download,
} from '@mui/icons-material';
import { useStudent } from '../context/StudentContext';
import { motion } from 'framer-motion';
import QuizGenerator from '../components/QuizGenerator';
import { exportStudyPlanToPDF } from '../utils/pdfExport';
import { executeCoachWorkflow } from '../services/api';

const StudyCoach = () => {
  const { studentData, riskAnalysis, updateStudyPlan } = useStudent();
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);

  // Generate AI Study Plan from backend
  const generateStudyPlan = async () => {
    setLoading(true);
    
    try {
      // Prepare request for agentic coach workflow
      const coachRequest = {
        student_id: studentData?.school || 'student_001',
        risk_level: riskAnalysis?.risk_level?.toLowerCase() || 'average',
        current_grade: studentData?.G2 || 0,
        study_time: studentData?.studytime || 2,
        weak_areas: [],
        strengths: [],
        goal: goal || 'Improve academic performance',
        performance_data: {
          absences: studentData?.absences || 0,
          failures: studentData?.failures || 0,
          G1: studentData?.G1 || 0,
          G2: studentData?.G2 || 0,
        }
      };

      // Call backend agentic coach workflow
      const result = await executeCoachWorkflow(coachRequest);

      if (result.success) {
        const mockPlan = {
          diagnosis: result.diagnosis || {},
          studyPlan: result.study_plan || { overview: '', weeks: [] },
          resources: result.resources || [],
          milestones: result.feedback?.milestones || [],
          recommendations: result.feedback?.recommendations || []
        };

        setStudyPlan(mockPlan);
        updateStudyPlan(mockPlan);
      } else {
        throw new Error(result.error || 'Failed to generate study plan');
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      Alert.error('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    generateStudyPlan();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!riskAnalysis) {
    return (
      <Box>
        <Alert severity="info">
          Please complete the Student Analysis first to get personalized study recommendations.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          AI Study Coach
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get personalized study plans and recommendations powered by AI
        </Typography>
      </Box>

      {/* Goal Input */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Psychology sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Set Your Learning Goal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tell us what you want to achieve
              </Typography>
            </Box>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="E.g., I want to improve my math grade from 10 to 15, prepare for final exams, or master algebra concepts..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !goal.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
              sx={{ mr: 2 }}
            >
              {loading ? 'Generating Plan...' : 'Generate Study Plan'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<QuizIcon />}
              onClick={() => setQuizOpen(true)}
              disabled={!riskAnalysis}
            >
              Practice Quiz
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Study Plan Results */}
      {studyPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Diagnosis" />
                  <Tab label="Study Plan" />
                  <Tab label="Resources" />
                  <Tab label="Milestones" />
                </Tabs>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => exportStudyPlanToPDF(studyPlan, studentData, riskAnalysis)}
                >
                  Export PDF
                </Button>
              </Box>

              {/* Diagnosis Tab */}
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Learning Diagnosis
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: '#d1fae5', height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom color="success.dark">
                          Strengths
                        </Typography>
                        <List dense>
                          {studyPlan.diagnosis.strengths.map((strength, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckCircle color="success" />
                              </ListItemIcon>
                              <ListItemText primary={strength} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: '#fef3c7', height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom color="warning.dark">
                          Areas for Improvement
                        </Typography>
                        <List dense>
                          {studyPlan.diagnosis.weaknesses.map((weakness, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <TrendingUp color="warning" />
                              </ListItemIcon>
                              <ListItemText primary={weakness} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Study Plan Tab */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Personalized Study Plan
                  </Typography>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {studyPlan.studyPlan.overview}
                  </Alert>
                  {studyPlan.studyPlan.weeks.map((week, index) => (
                    <Accordion key={index} defaultExpanded={index === 0}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              Week {week.week}: {week.focus}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Goals
                            </Typography>
                            <List dense>
                              {week.goals.map((goal, idx) => (
                                <ListItem key={idx}>
                                  <ListItemIcon>
                                    <CheckCircle color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={goal} />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Activities
                            </Typography>
                            <List dense>
                              {week.activities.map((activity, idx) => (
                                <ListItem key={idx}>
                                  <ListItemIcon>
                                    <Assignment color="secondary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={activity} />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                  <Paper sx={{ p: 3, mt: 3, bgcolor: '#f0f9ff' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Study Tips & Recommendations
                    </Typography>
                    <List dense>
                      {studyPlan.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <School color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}

              {/* Resources Tab */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Recommended Learning Resources
                  </Typography>
                  <Grid container spacing={3}>
                    {studyPlan.resources.map((resource, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <MenuBook sx={{ color: 'primary.main', mr: 1 }} />
                              <Chip label={resource.type} size="small" color="primary" />
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {resource.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {resource.description}
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<LinkIcon />}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit Resource
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Milestones Tab */}
              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Progress Milestones
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Track your progress with these key milestones
                  </Typography>
                  {studyPlan.milestones.map((milestone, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 3,
                        mb: 2,
                        border: '2px solid',
                        borderColor: 'primary.light',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Chip
                          label={`Week ${milestone.week}`}
                          color="primary"
                          sx={{ mr: 2 }}
                        />
                        <Typography variant="h6" fontWeight={600}>
                          {milestone.milestone}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Target: {milestone.target}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quiz Generator Dialog */}
      <QuizGenerator open={quizOpen} onClose={() => setQuizOpen(false)} subject="Mathematics" />
    </Box>
  );
};

export default StudyCoach;
