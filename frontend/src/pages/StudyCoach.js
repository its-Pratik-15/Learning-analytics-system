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
  const [quizSubject, setQuizSubject] = useState('Mathematics');

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
        // Map backend response directly - all data from AI model
        const studyPlanData = result.study_plan || {};
        
        // Extract subject from goal or weak areas
        let subject = 'General';
        if (goal.toLowerCase().includes('math')) subject = 'Mathematics';
        else if (goal.toLowerCase().includes('science')) subject = 'Science';
        else if (goal.toLowerCase().includes('english')) subject = 'English';
        else if (goal.toLowerCase().includes('history')) subject = 'History';
        else if (goal.toLowerCase().includes('language')) subject = 'Language';
        else if (studyPlanData.goal) {
          const goalLower = studyPlanData.goal.toLowerCase();
          if (goalLower.includes('math')) subject = 'Mathematics';
          else if (goalLower.includes('science')) subject = 'Science';
          else if (goalLower.includes('english')) subject = 'English';
          else if (goalLower.includes('history')) subject = 'History';
          else if (goalLower.includes('language')) subject = 'Language';
        }
        
        setQuizSubject(subject);
        
        // Convert milestones to weeks format for display
        const weeks = (studyPlanData.milestones || []).map((milestone) => ({
          week: milestone.week,
          focus: milestone.focus,
          goals: milestone.goals || [],
          activities: [] // Backend doesn't provide activities, but we can derive from goals
        }));

        const studyPlan = {
          diagnosis: result.diagnosis || {
            strong_topics: [],
            weak_topics: [],
            learning_gaps: [],
            overall_level: 'average'
          },
          studyPlan: {
            overview: `${studyPlanData.duration_weeks || 8}-week personalized study plan to ${studyPlanData.goal || 'improve academic performance'}`,
            weeks: weeks
          },
          resources: result.resources || [],
          milestones: (studyPlanData.milestones || []).map((m) => ({
            week: m.week,
            milestone: m.focus,
            target: m.goals?.[0] || 'Complete week goals'
          })),
          recommendations: result.feedback?.next_steps || result.feedback?.motivational_note ? 
            [result.feedback.motivational_note, ...result.feedback.next_steps] : []
        };

        setStudyPlan(studyPlan);
        updateStudyPlan(studyPlan);
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
                    Learning Diagnosis (AI Analysis)
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: '#d1fae5', height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom color="success.dark">
                          Strong Topics
                        </Typography>
                        <List dense>
                          {(studyPlan.diagnosis.strong_topics || []).map((topic, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckCircle color="success" />
                              </ListItemIcon>
                              <ListItemText primary={topic} />
                            </ListItem>
                          ))}
                          {(!studyPlan.diagnosis.strong_topics || studyPlan.diagnosis.strong_topics.length === 0) && (
                            <ListItem>
                              <ListItemText primary="No strong topics identified yet" secondary="Complete more assessments" />
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: '#fef3c7', height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom color="warning.dark">
                          Weak Topics (Focus Areas)
                        </Typography>
                        <List dense>
                          {(studyPlan.diagnosis.weak_topics || []).map((topic, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <TrendingUp color="warning" />
                              </ListItemIcon>
                              <ListItemText primary={topic} />
                            </ListItem>
                          ))}
                          {(!studyPlan.diagnosis.weak_topics || studyPlan.diagnosis.weak_topics.length === 0) && (
                            <ListItem>
                              <ListItemText primary="No weak topics identified" secondary="Great job!" />
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, bgcolor: '#ede9fe' }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary.dark">
                          Learning Gaps & Recommendations
                        </Typography>
                        <List dense>
                          {(studyPlan.diagnosis.learning_gaps || []).map((gap, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <School color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={gap} />
                            </ListItem>
                          ))}
                        </List>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            Overall Level: <Chip label={studyPlan.diagnosis.overall_level} color="primary" size="small" />
                          </Typography>
                        </Box>
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
                    AI-Recommended Learning Resources
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    These resources are personalized based on your learning profile and weak areas
                  </Typography>
                  <Grid container spacing={3}>
                    {(studyPlan.resources || []).map((resource, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined" sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { boxShadow: 3 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <MenuBook sx={{ color: 'primary.main', mr: 1 }} />
                              <Chip label={resource.type || 'Resource'} size="small" color="primary" />
                              {resource.topic && <Chip label={resource.topic} size="small" sx={{ ml: 1 }} />}
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {resource.title}
                            </Typography>
                            {resource.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {resource.description}
                              </Typography>
                            )}
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
                    {(!studyPlan.resources || studyPlan.resources.length === 0) && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                          <Typography color="text.secondary">
                            No resources available yet. Try generating a new study plan.
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
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
      <QuizGenerator open={quizOpen} onClose={() => setQuizOpen(false)} subject={quizSubject} />
    </Box>
  );
};

export default StudyCoach;
