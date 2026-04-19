# Learning Analytics System

A machine learning-powered system for predicting student academic performance and identifying at-risk students using educational data analytics. Features a FastAPI backend and interactive web interface.

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6.1-orange.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Dataset](#dataset)
- [Model Performance](#model-performance)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Learning Analytics System uses machine learning algorithms to analyze student data and predict academic outcomes. It helps educational institutions identify students who may need additional support, enabling early intervention and personalized learning strategies.

### Key Capabilities

- **Risk Prediction**: Classify students into three categories:
  - At-risk
  - Average
  - High-performing

- **Multi-Model Approach**: Utilizes multiple ML algorithms for robust predictions
- **RESTful API**: FastAPI-based backend for easy integration
- **Web Interface**: Interactive frontend for real-time predictions
- **Feature Engineering**: Processes 32 student attributes including demographics, social factors, and academic history
- **High Accuracy**: Achieves strong predictive performance on student outcome data

## Features

### Backend
- **FastAPI Framework**: High-performance async API
- **Machine Learning Models**: Logistic Regression, Decision Trees, and ensemble methods
- **Automated Pipeline**: Preprocessing, encoding, scaling, and prediction in one workflow
- **Model Caching**: Efficient model loading with singleton pattern
- **CORS Support**: Cross-origin resource sharing enabled
- **Agentic Coach**: AI-powered study plan generation using LLM
- **Quiz Generator**: Dynamic quiz question generation with adaptive difficulty
- **RAG Pipeline**: Retrieval-Augmented Generation for personalized learning resources

### Frontend
- **React 18**: Modern UI framework with hooks
- **Material-UI**: Professional component library
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Interactive data visualization
- **Backend-Driven Data**: All data flows from backend APIs, no hardcoded values
- **Real-time Integration**: Live connection to backend services

### Frontend
- **Interactive UI**: User-friendly web interface
- **Real-time Predictions**: Instant risk assessment
- **Form Validation**: Client-side input validation
- **Responsive Design**: Works on desktop and mobile devices

### Development
- **Comprehensive Testing**: Unit tests and API tests
- **Jupyter Notebooks**: Interactive model training and analysis
- **Type Hints**: Full type annotation support
- **Documentation**: Detailed API documentation with Swagger UI

## Architecture

```
┌─────────────┐      HTTP/JSON      ┌──────────────┐
│   Web UI    │ ◄─────────────────► │  FastAPI     │
│  (HTML/JS)  │                     │   Backend    │
└─────────────┘                     └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │   Services   │
                                    │   Module     │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │  ML Models   │
                                    │   (Cached)   │
                                    └──────────────┘
```

## Dataset

The system uses the **Student Performance Dataset** from the UCI Machine Learning Repository, focusing on Mathematics course performance.

### Features Include:

**Demographic Information:**
- Age, gender, address type
- Family size, parent's education and occupation

**Academic Factors:**
- Study time, failures, extra educational support
- Past grades (G1, G2)

**Social Factors:**
- Family relationships, free time, going out habits
- Alcohol consumption, health status

**School-Related:**
- Travel time, absences
- Extra-curricular activities, internet access

## Model Performance

| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| Logistic Regression | 85%+ | High | High | High |
| Decision Tree | 82%+ | Good | Good | Good |

*Note: Detailed performance metrics available in the training notebook*

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/its-Pratik-15/Learning-analytics-system.git
cd Learning-analytics-system
```

2. **Create a virtual environment** (recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Verify installation**
```bash
python tests/test_prediction.py
```

## Usage

### Starting the API Server

```bash
# Start the FastAPI server
python app/main.py
```

The server will start at `http://localhost:8000`

- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

### Using the Web Interface

1. Open your browser and navigate to `http://localhost:8000`
2. Fill in the student information form
3. Click "Predict Risk Level"
4. View the prediction results with confidence score

### Using the API Programmatically

```python
import requests

# API endpoint
url = "http://localhost:8000/predict"

# Student data
student_data = {
    "school": "GP",
    "sex": "F",
    "age": 17,
    "address": "U",
    "famsize": "GT3",
    "Pstatus": "T",
    "Medu": 4,
    "Fedu": 4,
    "Mjob": "teacher",
    "Fjob": "services",
    "reason": "course",
    "guardian": "mother",
    "traveltime": 2,
    "studytime": 3,
    "failures": 0,
    "schoolsup": "yes",
    "famsup": "no",
    "paid": "no",
    "activities": "yes",
    "nursery": "yes",
    "higher": "yes",
    "internet": "yes",
    "romantic": "no",
    "famrel": 4,
    "freetime": 3,
    "goout": 2,
    "Dalc": 1,
    "Walc": 1,
    "health": 5,
    "absences": 2,
    "G1": 15,
    "G2": 16
}

# Make prediction
response = requests.post(url, json=student_data)
result = response.json()

print(f"Risk Level: {result['risk_level']}")
print(f"Confidence: {result['confidence']}%")
```

### Using the Python Module Directly

```python
from app.services import predict_student_risk

# Student data dictionary
student_data = {
    # ... (same as above)
}

# Make prediction
risk_level, confidence = predict_student_risk(student_data)
print(f"Risk Level: {risk_level}")
print(f"Confidence: {confidence}%")
```

## API Documentation

### Data Flow Architecture

The system follows a **backend-driven data flow** where all data is fetched from backend APIs:

```
Frontend Components
    ↓
API Service Layer (frontend/src/services/api.js)
    ↓
Backend Endpoints
    ↓
ML Models & Services
    ↓
Response Data
    ↓
Frontend Display
```

**Key Principles:**
- ✅ All data comes from backend APIs
- ✅ No hardcoded values in frontend
- ✅ Dynamic content generation based on model responses
- ✅ Fallback mechanisms for graceful degradation
- ✅ Real-time integration with AI services

**Frontend Integration Points:**
- **StudyCoach.js**: Calls `/api/coach/workflow` for personalized study plans
- **QuizGenerator.js**: Calls `/api/quiz/generate` for dynamic quiz questions
- **Resources.js**: Calls `/api/rag/recommendations` for personalized resources
- **Dashboard.js**: Displays data from `/api/predict` risk analysis
- **Progress.js**: Tracks learning goals and progress metrics

### Endpoints

#### `POST /predict`

Predict student risk level based on input features.

**Request Body:**
```json
{
  "school": "GP",
  "sex": "F",
  "age": 17,
  "address": "U",
  "famsize": "GT3",
  "Pstatus": "T",
  "Medu": 4,
  "Fedu": 4,
  "Mjob": "teacher",
  "Fjob": "services",
  "reason": "course",
  "guardian": "mother",
  "traveltime": 2,
  "studytime": 3,
  "failures": 0,
  "schoolsup": "yes",
  "famsup": "no",
  "paid": "no",
  "activities": "yes",
  "nursery": "yes",
  "higher": "yes",
  "internet": "yes",
  "romantic": "no",
  "famrel": 4,
  "freetime": 3,
  "goout": 2,
  "Dalc": 1,
  "Walc": 1,
  "health": 5,
  "absences": 2,
  "G1": 15,
  "G2": 16
}
```

**Response:**
```json
{
  "risk_level": "High-performing",
  "confidence": 95.5,
  "message": "Prediction successful"
}
```

#### `GET /health`

Check API health status.

**Response:**
```json
{
  "status": "healthy"
}
```

#### `POST /api/coach/workflow`

Generate personalized study plan using agentic coach.

**Request Body:**
```json
{
  "student_id": "student_001",
  "risk_level": "average",
  "current_grade": 15,
  "study_time": 2,
  "weak_areas": ["algebra"],
  "strengths": ["geometry"],
  "goal": "Improve math grades",
  "performance_data": {"absences": 5, "failures": 0, "G1": 14, "G2": 15}
}
```

**Response:**
```json
{
  "success": true,
  "diagnosis": {
    "strong_topics": ["geometry"],
    "weak_topics": ["algebra"],
    "learning_gaps": ["algebra fundamentals"],
    "overall_level": "intermediate"
  },
  "study_plan": {
    "goal": "improve algebra skills",
    "duration_weeks": 8,
    "milestones": [...]
  },
  "resources": [...],
  "feedback": {...}
}
```

#### `POST /api/quiz/generate`

Generate practice quiz questions.

**Request Body:**
```json
{
  "topic": "Mathematics",
  "difficulty": "intermediate",
  "question_types": ["mcq"],
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "What is the derivative of x²?",
      "options": ["x", "2x", "x²", "2"],
      "correct_answer": "B",
      "explanation": "...",
      "difficulty": "intermediate"
    }
  ],
  "topic": "Mathematics",
  "difficulty": "intermediate"
}
```

#### `POST /api/rag/recommendations`

Get personalized learning recommendations.

**Request Body:**
```json
{
  "risk_level": "average",
  "current_grade": 15,
  "study_time": 2,
  "weak_areas": ["algebra"],
  "strengths": ["geometry"]
}
```

**Response:**
```json
{
  "success": true,
  "resources": [
    {
      "title": "Khan Academy - Algebra",
      "url": "https://www.khanacademy.org/math/algebra",
      "type": "course",
      "description": "..."
    }
  ]
}
```

## Project Structure

```
Learning-Analytics-System/
│
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI application
│   ├── services/
│   │   ├── __init__.py
│   │   ├── model_loader.py       # Model loading and caching
│   │   └── predict.py            # Prediction functions
│   └── static/
│       ├── index.html            # Web interface
│       ├── script.js             # Frontend logic
│       └── styles.css            # Styling
│
├── data/
│   ├── student-mat_raw.csv       # Raw dataset
│   └── student_mat_processed.csv # Processed dataset
│
├── models/
│   └── student_risk_models.pkl   # Trained models bundle
│
├── notebooks/
│   └── kaglle-model-training-performance.ipynb
│
├── tests/
│   ├── __init__.py
│   └── test_prediction.py        # Test suite
│
├── test_api.py                   # API testing script
├── .gitignore
├── requirements.txt              # Python dependencies
└── README.md
```

## Testing

### Run Unit Tests

```bash
# Test prediction functionality
python tests/test_prediction.py
```

### Test API Endpoints

```bash
# Start the server first
python app/main.py

# In another terminal, run API tests
python test_api.py
```

### Interactive API Testing

Visit `http://localhost:8000/docs` for Swagger UI to test endpoints interactively.

## Core Functions Reference

### `predict_student_risk(input_data: dict)`
Predicts student risk level based on input features.

**Parameters:**
- `input_data` (dict): Dictionary containing all required student features

**Returns:**
- `risk_level` (str): One of "At-risk", "Average", or "High-performing"
- `confidence` (float): Prediction confidence percentage

### `load_model_bundle()`
Loads the trained model bundle (cached after first call).

**Returns:**
- `bundle` (dict): Contains model, encoder, scaler, and feature columns

### Helper Functions

- `get_model()`: Returns the trained model
- `get_encoder()`: Returns the categorical encoder
- `get_scaler()`: Returns the numerical scaler
- `get_categorical_cols()`: Returns list of categorical feature names
- `get_numerical_cols()`: Returns list of numerical feature names

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guidelines
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Dataset: [UCI Machine Learning Repository - Student Performance Dataset](https://archive.ics.uci.edu/ml/datasets/Student+Performance)
- Original Research: P. Cortez and A. Silva (2008)
- Built with FastAPI, scikit-learn, pandas, and NumPy

## Contact

Pratik Kumar Pan - [@its-Pratik-15](https://github.com/its-Pratik-15)

Project Link: [https://github.com/its-Pratik-15/Learning-analytics-system](https://github.com/its-Pratik-15/Learning-analytics-system)

---

If you find this project useful, please consider giving it a star!
