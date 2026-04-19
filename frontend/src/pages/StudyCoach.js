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

const StudyCoach = () => {
  const { studentData, riskAnalysis, updateStudyPlan } = useStudent();
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);

  // Generate AI Study Plan based on student data and risk analysis
  const generateStudyPlan = async () => {
    setLoading(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate personalized plan based on actual student data
      const diagnosis = generateDiagnosis();
      const weeklyPlan = generateWeeklyPlan();
      const resources = generateResources();
      const milestones = generateMilestones();
      const recommendations = generateRecommendations();

      const mockPlan = {
        diagnosis,
        studyPlan: {
          overview: `A comprehensive ${weeklyPlan.length}-week study plan designed to improve academic performance through structured learning, targeted practice, and skill development based on your current ${riskAnalysis.risk_level} status.`,
          weeks: weeklyPlan
        },
        resources,
        milestones,
        recommendations
      };

      setStudyPlan(mockPlan);
      updateStudyPlan(mockPlan);
    } catch (error) {
      console.error('Error generating study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate diagnosis based on student data
  const generateDiagnosis = () => {
    const strengths = [];
    const weaknesses = [];
    const riskFactors = [];

    if (studentData) {
      // Analyze strengths
      if (studentData.absences < 5) strengths.push('Excellent attendance record');
      if (studentData.studytime >= 3) strengths.push('Good study time allocation');
      if (studentData.famsup === 'yes') strengths.push('Strong family support system');
      if (studentData.higher === 'yes') strengths.push('High motivation for higher education');
      if (studentData.failures === 0) strengths.push('No past academic failures');
      if (studentData.G1 >= 15 && studentData.G2 >= 15) strengths.push('Consistent good grades');

      // Analyze weaknesses
      if (studentData.studytime < 2) weaknesses.push('Limited study time - needs improvement');
      if (studentData.absences > 10) weaknesses.push('High absence rate affecting performance');
      if (studentData.failures > 0) weaknesses.push(`${studentData.failures} past failure(s) - needs focused attention`);
      if (studentData.G1 < 10 || studentData.G2 < 10) weaknesses.push('Below average grades in recent periods');
      if (studentData.activities === 'no') weaknesses.push('Limited extra-curricular engagement');
      if (studentData.paid === 'no' && studentData.schoolsup === 'no') weaknesses.push('Could benefit from additional tutoring');

      // Risk factors
      if (riskAnalysis.risk_level === 'At-risk') {
        riskFactors.push('Currently identified as at-risk student - immediate intervention needed');
      } else if (riskAnalysis.risk_level === 'Average') {
        riskFactors.push('Moderate performance - preventive measures recommended');
      }
      
      if (studentData.G2 < studentData.G1) riskFactors.push('Grade trend shows decline - needs attention');
      if (studentData.goout >= 4) riskFactors.push('High social activity may impact study time');
      if (studentData.Dalc > 2 || studentData.Walc > 2) riskFactors.push('Lifestyle factors may affect academic performance');
    }

    // Ensure we have at least some default values
    if (strengths.length === 0) strengths.push('Enrolled in education program', 'Seeking improvement');
    if (weaknesses.length === 0) weaknesses.push('Room for optimization in study methods');
    if (riskFactors.length === 0) riskFactors.push('Regular monitoring recommended');

    return { strengths, weaknesses, riskFactors };
  };

  // Generate weekly study plan
  const generateWeeklyPlan = () => {
    const isAtRisk = riskAnalysis?.risk_level === 'At-risk';

    const plans = [
      {
        week: 1,
        focus: 'Foundation Building & Assessment',
        goals: [
          'Complete diagnostic assessment in weak subjects',
          'Establish daily study routine (2-3 hours minimum)',
          'Organize study materials and create subject notebooks'
        ],
        activities: [
          'Take practice tests to identify knowledge gaps',
          'Create a dedicated study space',
          'Set up study schedule with breaks'
        ]
      },
      {
        week: 2,
        focus: 'Core Concept Mastery - Mathematics',
        goals: [
          'Master fundamental concepts in Mathematics',
          'Improve problem-solving skills',
          'Build strong foundation in weak topics'
        ],
        activities: [
          'Complete 5 math problem sets daily',
          'Watch Khan Academy tutorials',
          'Practice with past exam papers'
        ]
      },
      {
        week: 3,
        focus: 'Reading & Comprehension Skills',
        goals: [
          'Improve reading comprehension',
          'Enhance vocabulary',
          'Develop critical thinking'
        ],
        activities: [
          'Read 2 academic articles daily',
          'Learn 20 new vocabulary words',
          'Summarize key concepts in own words'
        ]
      },
      {
        week: 4,
        focus: 'Mid-Point Review & Adjustment',
        goals: [
          'Assess progress and adjust strategies',
          'Strengthen weak areas identified',
          'Build confidence through small wins'
        ],
        activities: [
          'Take mid-term assessment',
          'Review and revise difficult topics',
          'Celebrate achievements and set new targets'
        ]
      },
      {
        week: 5,
        focus: 'Advanced Practice & Application',
        goals: [
          'Apply learned concepts to real problems',
          'Improve problem-solving speed',
          'Master time management in exams'
        ],
        activities: [
          'Solve 10 practice problems daily',
          'Join study group sessions',
          'Complete timed practice tests'
        ]
      },
      {
        week: 6,
        focus: 'Final Preparation & Consolidation',
        goals: [
          'Consolidate all learned material',
          'Practice exam techniques',
          'Build exam confidence'
        ],
        activities: [
          'Complete full-length practice exams',
          'Review all notes and summaries',
          'Focus on high-yield topics'
        ]
      }
    ];

    if (isAtRisk) {
      plans.push(
        {
          week: 7,
          focus: 'Intensive Revision & Support',
          goals: [
            'Intensive revision of all topics',
            'Seek additional help for difficult areas',
            'Practice stress management'
          ],
          activities: [
            'Daily tutoring or study group sessions',
            'Complete additional practice sets',
            'Use relaxation techniques'
          ]
        },
        {
          week: 8,
          focus: 'Final Assessment & Future Planning',
          goals: [
            'Complete final assessment',
            'Evaluate overall improvement',
            'Plan for continued success'
          ],
          activities: [
            'Take comprehensive final test',
            'Review progress with mentor',
            'Set long-term academic goals'
          ]
        }
      );
    }

    return plans;
  };

  // Generate personalized resources
  const generateResources = () => {
    const resources = [
      {
        title: 'Khan Academy - Mathematics',
        url: 'https://www.khanacademy.org/math',
        type: 'Video Tutorials',
        description: 'Comprehensive math lessons from basic to advanced topics'
      },
      {
        title: 'Coursera - Learning How to Learn',
        url: 'https://www.coursera.org/learn/learning-how-to-learn',
        type: 'Online Course',
        description: 'Powerful mental tools to help you master tough subjects'
      },
      {
        title: 'Quizlet - Study Sets',
        url: 'https://quizlet.com/',
        type: 'Practice Platform',
        description: 'Flashcards and study games for all subjects'
      }
    ];

    // Add specific resources based on student needs
    if (studentData?.failures > 0 || studentData?.G1 < 12) {
      resources.push({
        title: 'MIT OpenCourseWare',
        url: 'https://ocw.mit.edu/',
        type: 'Free Courses',
        description: 'Free lecture notes, exams, and videos from MIT'
      });
    }

    resources.push({
      title: 'Pomodoro Timer',
      url: 'https://pomofocus.io/',
      type: 'Productivity Tool',
      description: 'Time management technique for focused study sessions'
    });

    return resources;
  };

  // Generate milestones
  const generateMilestones = () => {
    const isAtRisk = riskAnalysis?.risk_level === 'At-risk';
    
    return [
      {
        week: 2,
        milestone: 'Complete foundation assessment',
        target: 'Score 70% or higher on diagnostic tests'
      },
      {
        week: 4,
        milestone: 'Mid-term progress check',
        target: isAtRisk ? 'Show 20% improvement in weak subjects' : 'Show 15% improvement'
      },
      {
        week: 6,
        milestone: 'Advanced concept mastery',
        target: 'Complete all advanced practice sets with 80%+ accuracy'
      },
      ...(isAtRisk ? [{
        week: 8,
        milestone: 'Final assessment',
        target: 'Achieve minimum 25% grade improvement'
      }] : [])
    ];
  };

  // Generate recommendations
  const generateRecommendations = () => {
    const recs = [
      'Study in 25-minute focused sessions with 5-minute breaks (Pomodoro Technique)',
      'Practice active recall instead of passive reading',
      'Get adequate sleep (7-8 hours) for better retention',
      'Exercise regularly to improve focus and reduce stress'
    ];

    if (studentData) {
      if (studentData.studytime < 2) {
        recs.unshift('Increase daily study time to at least 2-3 hours');
      }
      if (studentData.famsup === 'no') {
        recs.push('Seek family support or find a study mentor');
      }
      if (studentData.schoolsup === 'no' && studentData.paid === 'no') {
        recs.push('Consider joining school support programs or study groups');
      }
      if (studentData.internet === 'yes') {
        recs.push('Utilize online learning platforms like Khan Academy and Coursera');
      }
    }

    return recs;
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
