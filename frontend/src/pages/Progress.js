import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Add,
  TrendingUp,
  EmojiEvents,
  CheckCircle,
  Delete,
  Edit,
} from '@mui/icons-material';
import { useStudent } from '../context/StudentContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { motion } from 'framer-motion';

const Progress = () => {
  const { learningGoals, addLearningGoal, updateGoalProgress } = useStudent();
  const [openDialog, setOpenDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    progress: 0,
  });

  // Mock progress data
  const progressData = [
    { week: 'Week 1', score: 65, studyHours: 10 },
    { week: 'Week 2', score: 70, studyHours: 12 },
    { week: 'Week 3', score: 75, studyHours: 15 },
    { week: 'Week 4', score: 78, studyHours: 14 },
    { week: 'Week 5', score: 82, studyHours: 16 },
    { week: 'Week 6', score: 85, studyHours: 18 },
  ];

  const subjectProgress = [
    { subject: 'Mathematics', score: 85 },
    { subject: 'Science', score: 78 },
    { subject: 'English', score: 92 },
    { subject: 'History', score: 75 },
    { subject: 'Geography', score: 80 },
  ];

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      addLearningGoal(newGoal);
      setNewGoal({ title: '', description: '', targetDate: '', progress: 0 });
      setOpenDialog(false);
    }
  };

  const handleProgressUpdate = (goalId, newProgress) => {
    updateGoalProgress(goalId, Math.min(100, Math.max(0, newProgress)));
  };

  const completedGoals = learningGoals.filter((g) => g.progress === 100).length;
  const totalGoals = learningGoals.length || 1;
  const overallProgress = Math.round(
    learningGoals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Progress Tracking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your learning journey and achievements
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Goal
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEvents sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h3" fontWeight={700}>
                  {completedGoals}
                </Typography>
              </Box>
              <Typography variant="body2">Goals Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h3" fontWeight={700}>
                  {overallProgress}%
                </Typography>
              </Box>
              <Typography variant="body2">Overall Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h3" fontWeight={700}>
                  {totalGoals}
                </Typography>
              </Box>
              <Typography variant="body2">Active Goals</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Performance Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    name="Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="studyHours"
                    stroke="#ec4899"
                    strokeWidth={3}
                    name="Study Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Subject Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Learning Goals */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Learning Goals
          </Typography>
          {learningGoals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography variant="body1" color="text.secondary">
                No goals yet. Click "Add Goal" to create your first learning goal!
              </Typography>
            </Paper>
          ) : (
            <List>
              {learningGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <ListItem
                    sx={{
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {goal.title}
                        </Typography>
                        {goal.description && (
                          <Typography variant="body2" color="text.secondary">
                            {goal.description}
                          </Typography>
                        )}
                        {goal.targetDate && (
                          <Chip
                            label={`Target: ${goal.targetDate}`}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleProgressUpdate(goal.id, goal.progress + 10)}
                        >
                          <Add />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleProgressUpdate(goal.id, goal.progress - 10)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {goal.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={goal.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Learning Goal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Goal Title"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Target Date"
            type="date"
            value={newGoal.targetDate}
            onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddGoal} variant="contained">
            Add Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Progress;
