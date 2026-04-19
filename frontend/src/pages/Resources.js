import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  VideoLibrary,
  MenuBook,
  Quiz,
  Code,
  Science,
  Calculate,
  Language,
  Link as LinkIcon,
  School,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getRecommendedResources } from '../services/api';
import { useStudent } from '../context/StudentContext';

// Curated default resources (fallback if backend unavailable)
const defaultResources = [
  {
    id: 1,
    title: 'Khan Academy',
    description: 'Free online courses, lessons and practice in math, science, and more',
    url: 'https://www.khanacademy.org/',
    category: 'Math',
    type: 'Video',
    icon: <Calculate />,
    color: '#14b8a6',
  },
  {
    id: 2,
    title: 'Coursera',
    description: 'Online courses from top universities and companies',
    url: 'https://www.coursera.org/',
    category: 'General',
    type: 'Course',
    icon: <MenuBook />,
    color: '#0056d2',
  },
  {
    id: 3,
    title: 'edX',
    description: 'High-quality courses from the world\'s best universities',
    url: 'https://www.edx.org/',
    category: 'General',
    type: 'Course',
    icon: <School />,
    color: '#02262b',
  },
  {
    id: 4,
    title: 'Codecademy',
    description: 'Learn to code interactively, for free',
    url: 'https://www.codecademy.com/',
    category: 'Programming',
    type: 'Interactive',
    icon: <Code />,
    color: '#1f4287',
  },
  {
    id: 5,
    title: 'Quizlet',
    description: 'Study tools and flashcards for any subject',
    url: 'https://quizlet.com/',
    category: 'General',
    type: 'Practice',
    icon: <Quiz />,
    color: '#4255ff',
  },
  {
    id: 6,
    title: 'MIT OpenCourseWare',
    description: 'Free lecture notes, exams, and videos from MIT',
    url: 'https://ocw.mit.edu/',
    category: 'Science',
    type: 'Course',
    icon: <Science />,
    color: '#a31f34',
  },
  {
    id: 7,
    title: 'Duolingo',
    description: 'Learn languages for free, forever',
    url: 'https://www.duolingo.com/',
    category: 'Language',
    type: 'Interactive',
    icon: <Language />,
    color: '#58cc02',
  },
  {
    id: 8,
    title: 'YouTube EDU',
    description: 'Educational videos on every subject',
    url: 'https://www.youtube.com/edu',
    category: 'General',
    type: 'Video',
    icon: <VideoLibrary />,
    color: '#ff0000',
  },
  {
    id: 9,
    title: 'Brilliant',
    description: 'Build quantitative skills in math, science, and computer science',
    url: 'https://brilliant.org/',
    category: 'Math',
    type: 'Interactive',
    icon: <Calculate />,
    color: '#1a9c8f',
  },
  {
    id: 10,
    title: 'Crash Course',
    description: 'Fast-paced, entertaining educational videos',
    url: 'https://www.youtube.com/user/crashcourse',
    category: 'General',
    type: 'Video',
    icon: <VideoLibrary />,
    color: '#00a69c',
  },
];

const defaultStudyTools = [
  {
    name: 'Pomodoro Timer',
    description: 'Time management technique for focused study',
    url: 'https://pomofocus.io/',
  },
  {
    name: 'Forest App',
    description: 'Stay focused and build healthy habits',
    url: 'https://www.forestapp.cc/',
  },
  {
    name: 'Notion',
    description: 'All-in-one workspace for notes and organization',
    url: 'https://www.notion.so/',
  },
  {
    name: 'Anki',
    description: 'Powerful, intelligent flashcard system',
    url: 'https://apps.ankiweb.net/',
  },
];

const Resources = () => {
  const { riskAnalysis } = useStudent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tabValue, setTabValue] = useState(0);
  const [resources, setResources] = useState(defaultResources);
  const [loading, setLoading] = useState(false);

  // Fetch personalized resources from backend
  useEffect(() => {
    const fetchResources = async () => {
      if (!riskAnalysis) return;
      
      setLoading(true);
      try {
        const profile = {
          risk_level: riskAnalysis.risk_level || 'Average',
          current_grade: 0,
          study_time: 2,
          weak_areas: [],
          strengths: []
        };
        
        const result = await getRecommendedResources(profile);
        
        if (result.success && result.resources) {
          // Merge backend resources with default ones
          const backendResources = result.resources.map((r, idx) => ({
            id: idx + 100,
            title: r.title || r.name || 'Resource',
            description: r.description || '',
            url: r.url || '#',
            category: r.category || 'General',
            type: r.type || 'Resource',
            icon: <MenuBook />,
            color: '#6366f1',
          }));
          
          setResources([...backendResources, ...defaultResources]);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        // Use default resources on error
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [riskAnalysis]);

  const categories = ['All', 'Math', 'Science', 'Programming', 'Language', 'General'];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Learning Resources
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Curated collection of the best learning platforms and tools
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Learning Platforms" />
        <Tab label="Study Tools" />
      </Tabs>

      {tabValue === 0 && (
        <>
          {/* Search and Filter */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {categories.map((category) => (
                      <Chip
                        key={category}
                        label={category}
                        onClick={() => setSelectedCategory(category)}
                        color={selectedCategory === category ? 'primary' : 'default'}
                        variant={selectedCategory === category ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <Grid container spacing={3}>
            {filteredResources.map((resource, index) => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: resource.color,
                            width: 56,
                            height: 56,
                            mr: 2,
                          }}
                        >
                          {resource.icon}
                        </Avatar>
                        <Box>
                          <Chip label={resource.type} size="small" color="primary" />
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {resource.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {resource.description}
                      </Typography>
                      <Chip label={resource.category} size="small" variant="outlined" />
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<LinkIcon />}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ bgcolor: resource.color }}
                      >
                        Visit Platform
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {defaultStudyTools.map((tool, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {tool.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tool.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<LinkIcon />}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Try It Out
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Resources;
