import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Send,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useStudent } from '../context/StudentContext';
import { motion } from 'framer-motion';

const steps = ['Personal Info', 'Family Background', 'Academic Details', 'Social Factors'];

const StudentAnalysis = () => {
  const { updateStudentData, updateRiskAnalysis } = useStudent();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    school: 'GP',
    sex: 'F',
    age: 17,
    address: 'U',
    famsize: 'GT3',
    Pstatus: 'T',
    Medu: 2,
    Fedu: 2,
    Mjob: 'other',
    Fjob: 'other',
    reason: 'course',
    guardian: 'mother',
    traveltime: 2,
    studytime: 2,
    failures: 0,
    schoolsup: 'no',
    famsup: 'yes',
    paid: 'no',
    activities: 'no',
    nursery: 'yes',
    higher: 'yes',
    internet: 'yes',
    romantic: 'no',
    famrel: 4,
    freetime: 3,
    goout: 3,
    Dalc: 1,
    Walc: 1,
    health: 5,
    absences: 0,
    G1: 10,
    G2: 10,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['age', 'Medu', 'Fedu', 'traveltime', 'studytime', 'failures', 'famrel', 'freetime', 'goout', 'Dalc', 'Walc', 'health', 'absences', 'G1', 'G2'].includes(name)
        ? parseInt(value)
        : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/predict', formData);
      
      if (response.data.success) {
        setResult(response.data);
        updateStudentData(formData);
        updateRiskAnalysis(response.data);
        
        // Show success message
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(
        err.detail || 
        err.message || 
        'Failed to analyze student data. Please check if the backend server is running on http://localhost:8000'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'At-risk':
        return 'error';
      case 'Average':
        return 'warning';
      case 'High-performing':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'At-risk':
        return <ErrorIcon />;
      case 'Average':
        return <Warning />;
      case 'High-performing':
        return <CheckCircle />;
      default:
        return null;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="School"
                name="school"
                value={formData.school}
                onChange={handleChange}
              >
                <MenuItem value="GP">Gabriel Pereira</MenuItem>
                <MenuItem value="MS">Mousinho da Silveira</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
              >
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="M">Male</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 15, max: 22 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Address Type"
                name="address"
                value={formData.address}
                onChange={handleChange}
              >
                <MenuItem value="U">Urban</MenuItem>
                <MenuItem value="R">Rural</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Family Size"
                name="famsize"
                value={formData.famsize}
                onChange={handleChange}
              >
                <MenuItem value="LE3">≤ 3 members</MenuItem>
                <MenuItem value="GT3">&gt; 3 members</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Parent's Status"
                name="Pstatus"
                value={formData.Pstatus}
                onChange={handleChange}
              >
                <MenuItem value="T">Living Together</MenuItem>
                <MenuItem value="A">Apart</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Mother's Education"
                name="Medu"
                value={formData.Medu}
                onChange={handleChange}
              >
                <MenuItem value={0}>None</MenuItem>
                <MenuItem value={1}>Primary (4th grade)</MenuItem>
                <MenuItem value={2}>5th to 9th grade</MenuItem>
                <MenuItem value={3}>Secondary</MenuItem>
                <MenuItem value={4}>Higher</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Father's Education"
                name="Fedu"
                value={formData.Fedu}
                onChange={handleChange}
              >
                <MenuItem value={0}>None</MenuItem>
                <MenuItem value={1}>Primary (4th grade)</MenuItem>
                <MenuItem value={2}>5th to 9th grade</MenuItem>
                <MenuItem value={3}>Secondary</MenuItem>
                <MenuItem value={4}>Higher</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Mother's Job"
                name="Mjob"
                value={formData.Mjob}
                onChange={handleChange}
              >
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="services">Services</MenuItem>
                <MenuItem value="at_home">At Home</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Father's Job"
                name="Fjob"
                value={formData.Fjob}
                onChange={handleChange}
              >
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="services">Services</MenuItem>
                <MenuItem value="at_home">At Home</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Guardian"
                name="guardian"
                value={formData.guardian}
                onChange={handleChange}
              >
                <MenuItem value="mother">Mother</MenuItem>
                <MenuItem value="father">Father</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Family Support"
                name="famsup"
                value={formData.famsup}
                onChange={handleChange}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Reason for School Choice"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
              >
                <MenuItem value="course">Course Preference</MenuItem>
                <MenuItem value="home">Close to Home</MenuItem>
                <MenuItem value="reputation">School Reputation</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Travel Time"
                name="traveltime"
                value={formData.traveltime}
                onChange={handleChange}
              >
                <MenuItem value={1}>&lt; 15 min</MenuItem>
                <MenuItem value={2}>15-30 min</MenuItem>
                <MenuItem value={3}>30-60 min</MenuItem>
                <MenuItem value={4}>&gt; 60 min</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Weekly Study Time"
                name="studytime"
                value={formData.studytime}
                onChange={handleChange}
              >
                <MenuItem value={1}>&lt; 2 hours</MenuItem>
                <MenuItem value={2}>2-5 hours</MenuItem>
                <MenuItem value={3}>5-10 hours</MenuItem>
                <MenuItem value={4}>&gt; 10 hours</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Past Failures"
                name="failures"
                value={formData.failures}
                onChange={handleChange}
                inputProps={{ min: 0, max: 4 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="School Support"
                name="schoolsup"
                value={formData.schoolsup}
                onChange={handleChange}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Extra Paid Classes"
                name="paid"
                value={formData.paid}
                onChange={handleChange}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Extra-curricular Activities"
                name="activities"
                value={formData.activities}
                onChange={handleChange}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Wants Higher Education"
                name="higher"
                value={formData.higher}
                onChange={handleChange}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="First Period Grade (G1)"
                name="G1"
                value={formData.G1}
                onChange={handleChange}
                inputProps={{ min: 0, max: 20 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Second Period Grade (G2)"
                name="G2"
                value={formData.G2}
                onChange={handleChange}
                inputProps={{ min: 0, max: 20 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Absences"
                name="absences"
                value={formData.absences}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Internet Access"
                name="internet"
                value={formData.internet}
                onChange={handleChange}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Romantic Relationship"
                name="romantic"
                value={formData.romantic}
                onChange={handleChange}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Family Relationships (1-5)"
                name="famrel"
                value={formData.famrel}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <MenuItem key={val} value={val}>
                    {val} - {val === 1 ? 'Very Bad' : val === 5 ? 'Excellent' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Free Time (1-5)"
                name="freetime"
                value={formData.freetime}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <MenuItem key={val} value={val}>
                    {val} - {val === 1 ? 'Very Low' : val === 5 ? 'Very High' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Going Out (1-5)"
                name="goout"
                value={formData.goout}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <MenuItem key={val} value={val}>
                    {val} - {val === 1 ? 'Very Low' : val === 5 ? 'Very High' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Workday Alcohol (1-5)"
                name="Dalc"
                value={formData.Dalc}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <MenuItem key={val} value={val}>
                    {val} - {val === 1 ? 'Very Low' : val === 5 ? 'Very High' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Weekend Alcohol (1-5)"
                name="Walc"
                value={formData.Walc}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <MenuItem key={val} value={val}>
                    {val} - {val === 1 ? 'Very Low' : val === 5 ? 'Very High' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Health Status (1-5)"
                name="health"
                value={formData.health}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <MenuItem key={val} value={val}>
                    {val} - {val === 1 ? 'Very Bad' : val === 5 ? 'Very Good' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Attended Nursery"
                name="nursery"
                value={formData.nursery}
                onChange={handleChange}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Student Performance Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete the form below to get a comprehensive risk assessment
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Performance'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 4,
              background: `linear-gradient(135deg, ${
                result.risk_level === 'At-risk'
                  ? '#fee2e2'
                  : result.risk_level === 'Average'
                  ? '#fef3c7'
                  : '#d1fae5'
              } 0%, white 100%)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {getRiskIcon(result.risk_level)}
              <Typography variant="h5" fontWeight={700} sx={{ ml: 2 }}>
                Analysis Complete
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Risk Level
                </Typography>
                <Chip
                  label={result.risk_level}
                  color={getRiskColor(result.risk_level)}
                  size="large"
                  sx={{ fontSize: '1.1rem', fontWeight: 600, px: 2, py: 3 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Confidence
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {result.confidence}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  {result.message}
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default StudentAnalysis;
