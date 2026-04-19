import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  School,
  EmojiEvents,
  Assessment,
  Psychology,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const QuickActionCard = ({ title, description, icon, color, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 6,
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Avatar sx={{ bgcolor: color, mb: 2, width: 56, height: 56 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button
          endIcon={<ArrowForward />}
          sx={{ color: color }}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { riskAnalysis, learningGoals, progressHistory } = useStudent();

  const completedGoals = learningGoals.filter(g => g.progress === 100).length;
  const totalGoals = learningGoals.length || 1;
  const goalCompletionRate = Math.round((completedGoals / totalGoals) * 100);

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Welcome Back! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your learning progress and get personalized recommendations
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Risk Level"
            value={riskAnalysis?.risk_level || 'N/A'}
            icon={<Assessment />}
            color="#6366f1"
            subtitle={riskAnalysis ? `${riskAnalysis.confidence}% confidence` : 'Complete analysis first'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Learning Goals"
            value={`${completedGoals}/${totalGoals}`}
            icon={<EmojiEvents />}
            color="#10b981"
            subtitle={`${goalCompletionRate}% completion rate`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Study Sessions"
            value={progressHistory.length}
            icon={<School />}
            color="#f59e0b"
            subtitle="Total sessions tracked"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Improvement"
            value="+15%"
            icon={<TrendingUp />}
            color="#ec4899"
            subtitle="vs last month"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            title="Analyze Performance"
            description="Get detailed insights about your academic performance and risk factors"
            icon={<Assessment />}
            color="#6366f1"
            onClick={() => navigate('/analysis')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            title="AI Study Coach"
            description="Get personalized study plans and recommendations from our AI coach"
            icon={<Psychology />}
            color="#ec4899"
            onClick={() => navigate('/coach')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            title="Track Progress"
            description="Monitor your learning journey and celebrate your achievements"
            icon={<TrendingUp />}
            color="#10b981"
            onClick={() => navigate('/progress')}
          />
        </Grid>
      </Grid>

      {/* Current Goals */}
      {learningGoals.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Active Learning Goals
            </Typography>
            <Box sx={{ mt: 2 }}>
              {learningGoals.slice(0, 3).map((goal) => (
                <Box key={goal.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {goal.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {goal.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={goal.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/progress')}
              sx={{ mt: 2 }}
            >
              View All Goals
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircle sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Pro Tip
          </Typography>
        </Box>
        <Typography variant="body2">
          Regular study sessions of 25-30 minutes with short breaks are more effective than long, 
          uninterrupted study marathons. Try the Pomodoro Technique!
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
