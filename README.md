# AI Study Coach - Learning Analytics System

An enterprise-grade machine learning platform that combines predictive analytics, personalized AI coaching, and adaptive learning to transform student performance data into actionable insights. Built for educational institutions, teachers, and students seeking data-driven academic improvement.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Performance](#performance)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

The AI Study Coach is a comprehensive learning analytics system that leverages machine learning algorithms to analyze student data and predict academic outcomes. The platform enables early intervention through risk assessment, provides personalized study recommendations via RAG-based AI coaching, and offers adaptive quiz generation for targeted practice.

### Problem Statement

Educational institutions face challenges in identifying at-risk students before academic failure occurs. Traditional assessment methods often miss early warning signs, leading to missed intervention opportunities. This system addresses these challenges through:

- Multi-dimensional student data analysis (demographic, academic, behavioral)
- Early risk detection using predictive modeling
- Personalized recommendations through AI-powered conversational interface
- Adaptive learning paths based on individual performance
- Data-driven decision support for educators and administrators

### Solution Approach

The platform employs a multi-faceted approach:

1. **Predictive Analytics**: Machine learning models trained on historical student data
2. **Risk Stratification**: Three-tier classification (At-risk, Average, High-performing)
3. **Conversational AI**: RAG-based chatbot for natural language queries
4. **Adaptive Learning**: Dynamic quiz generation with difficulty adjustment
5. **RESTful API**: Scalable backend for seamless integration

## Key Features

### Student Risk Prediction

- Analysis of 32+ student attributes across multiple dimensions
- Three-tier risk classification with confidence scoring
- Real-time prediction with sub-second latency
- Historical performance tracking and trend analysis
- Batch processing support for institutional-scale analysis

### AI Study Coach

- Personalized study plan generation based on risk assessment
- Learning diagnosis identifying strengths and weaknesses
- Weekly milestone tracking with progress monitoring
- Adaptive recommendations tailored to learning style
- PDF export for study plans and progress reports
- Integration with educational best practices

### RAG Pipeline

- Semantic search across educational resources
- Context-aware response generation
- Subject-specific learning recommendations
- Exam preparation guidance
- Multi-document synthesis
- Source citation for transparency

### Adaptive Quiz Generator

- AI-powered question generation across subjects
- Dynamic difficulty adjustment based on performance
- Real-time feedback with detailed explanations
- Performance analytics and progress tracking
- Spaced repetition algorithm integration
- Multi-format question support

### Analytics Dashboard

- Comprehensive performance metrics
- Visual trend analysis with charts and graphs
- Resource utilization tracking
- Intervention effectiveness measurement
- Exportable reports for stakeholders

## System Architecture

The platform follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   React Frontend │              │   Web Browser    │        │
│  │   - Dashboard    │              │   - Static UI    │        │
│  │   - Analytics    │              │                  │        │
│  │   - Study Coach  │              │                  │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
└───────────┼──────────────────────────────────┼──────────────────┘
            │                                  │
            │ HTTP/JSON (REST API)             │ HTTP
            │                                  │
┌───────────▼──────────────────────────────────▼──────────────────┐
│                      APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    FastAPI Backend                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │  │
│  │  │  Routing   │  │   CORS     │  │  Static Files    │  │  │
│  │  │  /predict  │  │ Middleware │  │  Serving         │  │  │
│  │  │  /rag      │  │            │  │                  │  │  │
│  │  │  /coach    │  │            │  │                  │  │  │
│  │  │  /quiz     │  │            │  │                  │  │  │
│  │  └─────┬──────┘  └────────────┘  └──────────────────┘  │  │
│  └────────┼─────────────────────────────────────────────────┘  │
│           │                                                     │
│  ┌────────▼─────────────────────────────────────────────────┐  │
│  │                   Services Layer                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Predict    │  │ RAG Pipeline │  │ Agentic Coach│  │  │
│  │  │   Service    │  │   Service    │  │   Service    │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐                    │  │
│  │  │     Quiz     │  │   Document   │                    │  │
│  │  │  Generator   │  │   Loader     │                    │  │
│  │  └──────┬───────┘  └──────┬───────┘                    │  │
│  └─────────┼──────────────────┼──────────────────┼──────────┘  │
└────────────┼──────────────────┼──────────────────┼─────────────┘
             │                  │                  │
┌────────────▼──────────────────▼──────────────────▼─────────────┐
│                        DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  ML Models   │  │ FAISS Vector │  │   CSV Datasets       │ │
│  │  (Pickled)   │  │   Database   │  │   - Raw Data         │ │
│  │  - Encoder   │  │  - Embeddings│  │   - Processed Data   │ │
│  │  - Scaler    │  │  - Index     │  │                      │ │
│  │  - Classifier│  │              │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Prediction Flow**: Client → API → Predict Service → ML Model → Response
2. **RAG Flow**: Client → API → RAG Pipeline → FAISS → LLM → Response
3. **Coach Flow**: Client → API → Agentic Coach → Workflow Execution → Response
4. **Quiz Flow**: Client → API → Quiz Generator → Question Generation → Response

## Technology Stack

### Backend Technologies

**Core Framework**
- Python 3.10+
- FastAPI - Modern async web framework
- Uvicorn - ASGI server
- Pydantic - Data validation

**Machine Learning**
- scikit-learn 1.6.1 - ML algorithms
- NumPy - Numerical computing
- pandas - Data manipulation
- joblib - Model serialization

**AI & NLP**
- LangChain - LLM application framework
- FAISS - Vector similarity search
- Sentence Transformers - Text embeddings
- Groq API - Fast LLM inference

**Data Processing**
- pandas - DataFrame operations
- NumPy - Array processing
- scikit-learn - Preprocessing pipelines

### Frontend Technologies

**Core Framework**
- React 18 - UI library
- JavaScript (ES6+)
- HTML5 & CSS3

**UI Components**
- Material-UI - Component library
- Custom components
- Responsive layouts

**State Management**
- React Context API
- React Hooks
- Local storage persistence

**HTTP Client**
- Fetch API
- Axios (optional)

### Development Tools

**Testing**
- pytest - Python testing
- unittest - Built-in testing
- Jest - JavaScript testing

**Documentation**
- Swagger UI - Interactive API docs
- ReDoc - Alternative API docs
- Jupyter Notebooks - Analysis

**Version Control**
- Git
- GitHub

### Deployment Infrastructure

**Containerization**
- Docker
- Docker Compose

**Cloud Platforms**
- AWS EC2
- Heroku
- Railway
- Vercel

**Process Management**
- PM2
- Gunicorn
- systemd

## Getting Started

### Prerequisites

**Required Software**
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn package manager
- GROQ API Key (obtain at https://console.groq.com)

**System Requirements**
- Operating System: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- RAM: 4GB minimum, 8GB recommended
- Disk Space: 2GB for dependencies and models
- Internet connection for initial setup and API calls

### Quick Start

**Backend Setup**

```bash
# Clone repository
git clone https://github.com/its-Pratik-15/Learning-analytics-system.git
cd Learning-analytics-system

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r app/requirements.txt

# Configure environment
cp app/.env.example app/.env
# Edit app/.env and add your GROQ_API_KEY

# Start server
python app/main.py
# Server runs on http://localhost:8000
```

**Frontend Setup**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# App runs on http://localhost:3000
```

**Verify Installation**

```bash
# Run integration tests
source venv/bin/activate
python test_full_integration.py
```

## Installation

### Detailed Installation Steps

#### Step 1: Clone Repository

```bash
# Using HTTPS
git clone https://github.com/its-Pratik-15/Learning-analytics-system.git

# Or using SSH
git clone git@github.com:its-Pratik-15/Learning-analytics-system.git

# Navigate to directory
cd Learning-analytics-system
```

#### Step 2: Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r app/requirements.txt

# Verify installation
pip list
```

#### Step 3: Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0

# Return to root
cd ..
```

#### Step 4: Configuration

```bash
# Copy environment template
cp app/.env.example app/.env

# Edit configuration
nano app/.env  # or use your preferred editor
```

Add your GROQ API key:

```env
GROQ_API_KEY=your_api_key_here
FLASK_ENV=development
DEBUG=True
```

#### Step 5: Verification

```bash
# Test backend
python app/test_production_rag.py

# Test agentic features
python app/test_agentic_features.py

# Run full integration test
python test_full_integration.py
```

### Docker Installation

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -f Dockerfile.backend -t learning-analytics-backend .
docker build -f frontend/Dockerfile -t learning-analytics-frontend ./frontend

# Run containers
docker run -p 8000:8000 learning-analytics-backend
docker run -p 3000:3000 learning-analytics-frontend
```

## Configuration

### Backend Environment Variables

Create `app/.env` file:

```env
# API Configuration
GROQ_API_KEY=your_groq_api_key_here
FLASK_ENV=production
DEBUG=False

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Model Configuration
MODEL_PATH=models/student_risk_models.pkl

# FAISS Configuration
FAISS_INDEX_PATH=faiss_index/index.faiss
FAISS_DIMENSION=384

# Logging
LOG_LEVEL=INFO
LOG_FILE=app.log

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_NAME=AI Study Coach
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_QUIZ=true
REACT_APP_ENABLE_COACH=true
```

### Configuration Best Practices

**Development**
- Use `.env.example` as template
- Never commit `.env` files
- Use localhost URLs
- Enable debug mode

**Production**
- Use secure secret management
- Set DEBUG=False
- Use HTTPS URLs only
- Implement CORS restrictions
- Enable comprehensive logging

## API Documentation

### Core Endpoints

**Health Check**
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-20T10:30:00Z",
  "version": "1.0.0"
}
```

**Student Risk Prediction**
```
POST /api/predict
```

Request Body:
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

Response:
```json
{
  "risk_level": "High-performing",
  "confidence": 95.5,
  "message": "Prediction successful"
}
```

### RAG Pipeline Endpoints

**Query Learning Resources**
```
POST /api/rag/query
```

Request:
```json
{
  "query": "What are effective study strategies?",
  "context": {
    "student_risk_level": "At-risk",
    "subject": "Mathematics"
  }
}
```

**Get Personalized Recommendations**
```
POST /api/rag/recommendations
```

**Subject-Specific Help**
```
POST /api/rag/subject-help
```

**Exam Preparation Guidance**
```
POST /api/rag/exam-prep
```

**Add Custom Documents**
```
POST /api/rag/add-documents
```

**RAG Status**
```
GET /api/rag/status
```

### Agentic Coach Endpoints

**Execute Coaching Workflow**
```
POST /api/coach/workflow
```

Request:
```json
{
  "student_data": { ... },
  "risk_level": "At-risk",
  "preferences": {
    "learning_style": "visual",
    "study_hours_per_week": 10
  }
}
```

**Coach Status**
```
GET /api/coach/status
```

### Quiz Generator Endpoints

**Generate Practice Quiz**
```
POST /api/quiz/generate
```

Request:
```json
{
  "subject": "Mathematics",
  "difficulty": "medium",
  "num_questions": 10,
  "topics": ["algebra", "geometry"]
}
```

**Generate Adaptive Quiz**
```
POST /api/quiz/adaptive
```

**Adjust Difficulty**
```
POST /api/quiz/adjust-difficulty
```

**Quiz Status**
```
GET /api/quiz/status
```

### Interactive Documentation

**Swagger UI**: http://localhost:8000/docs
- Interactive API testing
- Request/response examples
- Schema validation
- Try-it-out functionality

**ReDoc**: http://localhost:8000/redoc
- Clean documentation
- Detailed schemas
- Code samples
- Downloadable OpenAPI spec

### Error Handling

Standard HTTP status codes:

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Endpoint not found |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service down |

Error Response Format:
```json
{
  "detail": "Error message",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2026-04-20T10:30:00Z"
}
```

## Deployment

### Local Development

**Backend**
```bash
source venv/bin/activate
python app/main.py
```

**Frontend**
```bash
cd frontend
npm start
```

### Docker Deployment

**Using Docker Compose**
```bash
# Build and run
docker-compose up --build

# Detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Manual Docker Build**
```bash
# Backend
docker build -f Dockerfile.backend -t learning-analytics-backend .
docker run -p 8000:8000 --env-file app/.env learning-analytics-backend

# Frontend
docker build -f frontend/Dockerfile -t learning-analytics-frontend ./frontend
docker run -p 3000:3000 learning-analytics-frontend
```

### Heroku Deployment

```bash
# Install Heroku CLI
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set GROQ_API_KEY=your_key
heroku config:set FLASK_ENV=production
heroku config:set DEBUG=False

# Deploy
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail
```

### AWS EC2 Deployment

```bash
# Launch EC2 instance (Ubuntu 22.04, t2.medium)
# Configure security groups: ports 22, 80, 443, 8000, 3000

# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip python3-venv nodejs npm nginx

# Clone repository
git clone https://github.com/its-Pratik-15/Learning-analytics-system.git
cd Learning-analytics-system

# Setup backend
python3 -m venv venv
source venv/bin/activate
pip install -r app/requirements.txt

# Configure environment
cp app/.env.example app/.env
nano app/.env  # Add GROQ_API_KEY

# Setup frontend
cd frontend
npm install
npm run build
cd ..

# Install PM2
sudo npm install -g pm2

# Start services
pm2 start "python app/main.py" --name backend
pm2 start "npm start" --name frontend --cwd frontend
pm2 save
pm2 startup
```

**Nginx Configuration**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set GROQ_API_KEY=your_key

# Deploy
railway up
```

### Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Set environment variable in dashboard
# REACT_APP_API_URL=https://your-backend-url
```

### Production Checklist

**Security**
- [ ] Set GROQ_API_KEY securely
- [ ] Configure CORS for specific domains
- [ ] Enable HTTPS with SSL/TLS
- [ ] Implement rate limiting
- [ ] Set up firewall rules
- [ ] Disable debug mode
- [ ] Use environment variables for secrets

**Monitoring**
- [ ] Configure application logging
- [ ] Set up error tracking (Sentry)
- [ ] Implement performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up alerting

**Testing**
- [ ] Test all API endpoints
- [ ] Verify frontend-backend connectivity
- [ ] Test with production data
- [ ] Validate SSL certificates
- [ ] Check CORS configuration

**Performance**
- [ ] Enable response caching
- [ ] Configure CDN for static assets
- [ ] Optimize database queries
- [ ] Implement connection pooling
- [ ] Enable gzip compression

## Testing

### Integration Tests

```bash
# Activate environment
source venv/bin/activate

# Run full integration test
python test_full_integration.py
```

### Backend Tests

**Production RAG Tests**
```bash
python app/test_production_rag.py
```

**Agentic Features Tests**
```bash
python app/test_agentic_features.py
```

**API Endpoint Tests**
```bash
# Start server
python app/main.py

# In another terminal
curl -X GET http://localhost:8000/api/health

curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d @sample_student_data.json
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Build verification
npm run build
```

### Manual End-to-End Testing

1. Start backend: `python app/main.py`
2. Start frontend: `cd frontend && npm start`
3. Navigate to http://localhost:3000
4. Test Student Analysis with sample data
5. Test Study Coach with study plan generation
6. Test Quiz Generator
7. Test PDF export functionality

## Performance

### Backend Optimization

**FAISS Vector Indexing**
- Sub-linear time complexity for similarity search
- Optimized index structures
- Memory-mapped indices
- Batch processing support

**Model Caching**
- Singleton pattern for model instances
- Lazy loading
- Pickle serialization
- In-memory caching

**API Performance**
- Asynchronous request handling
- Connection pooling
- Response compression (gzip)
- Rate limiting

**LLM Inference**
- Groq API for fast inference
- Streaming responses
- Batch processing
- Query caching

### Frontend Optimization

**Code Splitting**
- React.lazy() for components
- Dynamic imports
- Route-based splitting
- Reduced bundle size

**Asset Optimization**
- Image compression
- SVG icons
- Minification
- CDN delivery

**State Management**
- Context API
- Local storage persistence
- Optimistic UI updates
- Debouncing

### Performance Metrics

| Metric | Target | Typical |
|--------|--------|---------|
| API Response Time | <200ms | 50-100ms |
| Model Inference | <100ms | 30-50ms |
| RAG Query | <2s | 500ms-1s |
| Page Load Time | <3s | 1-2s |
| Time to Interactive | <5s | 2-3s |

## Security

### API Security

- CORS configuration for allowed origins
- Input validation with Pydantic
- Rate limiting per IP/user
- HTTPS in production
- Environment variable protection

### Data Security

- No sensitive data in logs
- Encrypted data transmission
- Secure API key storage
- Regular security audits
- Compliance with data protection regulations

### Best Practices

- Use HTTPS only in production
- Implement authentication for sensitive endpoints
- Regular dependency updates
- Security headers (HSTS, CSP)
- Input sanitization

## Troubleshooting

### Backend Issues

**"GROQ_API_KEY not set" warning**

Solution:
```bash
cp app/.env.example app/.env
nano app/.env
# Add: GROQ_API_KEY=your_key
```

**"RAG pipeline initialization failed"**

Solutions:
- Verify GROQ_API_KEY is set
- Check internet connectivity
- Validate API key at https://console.groq.com
- Check status: `curl http://localhost:8000/api/rag/status`

**"Port 8000 already in use"**

Solutions:
```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
python app/main.py --port 8080
```

**"Module not found" errors**

Solutions:
```bash
# Reinstall dependencies
pip install -r app/requirements.txt --force-reinstall

# Or recreate environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r app/requirements.txt
```

### Frontend Issues

**"Cannot find module" errors**

Solutions:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Or clear cache
npm cache clean --force
npm install
```

**"API connection refused"**

Solutions:
- Verify backend is running: `curl http://localhost:8000/api/health`
- Check REACT_APP_API_URL in frontend/.env
- Verify CORS configuration
- Check browser console for errors

**CORS errors**

Solutions:
- Backend CORS configured for all origins by default
- For production, update ALLOWED_ORIGINS in backend .env
- Clear browser cache
- Check browser console for specific error

### System Reset

```bash
# Complete reset
rm -rf venv node_modules

# Backend
python -m venv venv
source venv/bin/activate
pip install -r app/requirements.txt

# Frontend
cd frontend
npm install

# Verify
python app/test_production_rag.py
cd frontend && npm run build
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Coding Standards

**Python**
- Follow PEP 8 style guide
- Add type hints
- Write docstrings
- Include unit tests

**JavaScript**
- Follow ESLint configuration
- Use functional components
- Add PropTypes
- Write component tests

### Pull Request Guidelines

- Provide clear description
- Include test coverage
- Update documentation
- Ensure all tests pass
- Follow commit message conventions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Documentation

- API Documentation: http://localhost:8000/docs
- GitHub Wiki: [Project Wiki](https://github.com/its-Pratik-15/Learning-analytics-system/wiki)
- Issue Tracker: [GitHub Issues](https://github.com/its-Pratik-15/Learning-analytics-system/issues)

### Getting Help

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/its-Pratik-15/Learning-analytics-system/issues)
- Discussions: [GitHub Discussions](https://github.com/its-Pratik-15/Learning-analytics-system/discussions)

### Acknowledgments

- Dataset: [UCI Machine Learning Repository - Student Performance Dataset](https://archive.ics.uci.edu/ml/datasets/Student+Performance)
- Original Research: P. Cortez and A. Silva (2008)
- Built with FastAPI, React, scikit-learn, LangChain, and FAISS

---

Copyright 2026 AI Study Coach. All rights reserved.
