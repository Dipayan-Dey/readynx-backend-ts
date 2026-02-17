# Readynx Backend API

A comprehensive career development platform backend built with Node.js, TypeScript, Express, and MongoDB. Features AI-powered resume analysis, interview preparation, technical quizzes, and an intelligent chatbot assistant powered by Google Gemini AI.

## 🚀 Features

### Core Features

- **User Authentication** - JWT-based authentication with Google OAuth integration
- **Profile Management** - Complete user profile with skills, experience, and career goals
- **Resume Management** - Upload, analyze, and get AI-powered feedback on resumes
- **GitHub Integration** - Automatic project analysis and skill extraction
- **LinkedIn Integration** - Profile sync and post sharing

### AI-Powered Features

- **Resume Analysis** - ATS score, suggestions, strengths, and weaknesses analysis
- **Interview Preparation** - AI-generated interview questions based on profile and projects
- **Answer Evaluation** - Real-time feedback and scoring on interview answers
- **Technical Quizzes** - Personalized quiz generation based on skills and target role
- **AI Chatbot** - Intelligent career assistant with personalized advice

### Additional Features

- **Project Analytics** - GitHub repository analysis and insights
- **Skill Tracking** - Automatic skill extraction from projects and resume
- **Performance Metrics** - Interview and quiz performance tracking
- **History Management** - Complete history of interviews, quizzes, and analyses

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini 2.5 Flash
- **Authentication**: JWT, Google OAuth
- **File Storage**: Cloudinary
- **File Processing**: Multer, PDF-Parse, Mammoth
- **Testing**: Jest

---

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Gemini API Key
- Cloudinary Account
- Google OAuth Credentials (optional)
- GitHub OAuth Credentials (optional)
- LinkedIn OAuth Credentials (optional)

---

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ts-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Server
PORT=5000

# JWT
JWT_SECRET=your_jwt_secret_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/api/oauth/github/callback

# LinkedIn OAuth (optional)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5000/api/oauth/linkedin/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

### 4. Build the project

```bash
npm run build
```

### 5. Start the server

**Development mode:**

```bash
npm run start:dev
```

**Production mode:**

```bash
npm start
```

The server will start at `http://localhost:5000`

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Main Endpoints

#### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/google` - Google OAuth login

#### Profile

- `GET /profile` - Get complete profile
- `PUT /profile` - Update profile
- `GET /profile/stats` - Get profile statistics

#### Resume

- `POST /profile/resume/upload` - Upload resume (PDF/DOCX)
- `GET /profile/resume` - Get resume details
- `DELETE /profile/resume` - Delete resume
- `POST /profile/resume/analyze` - Analyze resume with AI

#### Interview

- `POST /interviews/start` - Start interview session
- `POST /interviews/:sessionId/answer` - Submit answer
- `POST /interviews/:sessionId/complete` - Complete interview
- `GET /interviews/history` - Get interview history
- `DELETE /interviews/:sessionId` - Delete interview session

#### Quiz

- `POST /quizzes/start` - Start quiz session
- `POST /quizzes/:sessionId/submit` - Submit quiz answers
- `GET /quizzes/history` - Get quiz history

#### Chatbot

- `POST /chatbot/message` - Send message to AI chatbot

#### GitHub Integration

- `GET /integrations/github/projects` - Get GitHub projects
- `POST /integrations/github/analyze` - Analyze GitHub profile

---

## 🧪 Testing

### Import Postman Collection

Import `Enhanced_Profile_System.postman_collection.json` into Postman for easy API testing.

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

---

## 📁 Project Structure

```
ts-backend/
├── src/
│   ├── @types/                      # TypeScript type definitions
│   │   ├── express/
│   │   │   └── index.d.ts
│   │   └── interfaces/
│   │       ├── index.ts
│   │       ├── interviewSession.interface.ts
│   │       ├── jwt.interfaces.ts
│   │       ├── profile.interfaces.ts
│   │       ├── project.interface.ts
│   │       ├── quizSession.interface.ts
│   │       ├── resumeAnalysis.interface.ts
│   │       ├── services.interface.ts
│   │       ├── user.interface.ts
│   │       └── userSkill.interface.ts
│
│   ├── api/
│   │   └── v1/
│   │       ├── controllers/
│   │       │   ├── auth/
│   │       │   │   ├── googleAuth.controller.ts
│   │       │   │   ├── login.controller.ts
│   │       │   │   ├── signup.controller.ts
│   │       │   │   └── users.controller.ts
│   │       │   │
│   │       │   ├── profile/
│   │       │   │   ├── profile.controller.ts
│   │       │   │   ├── interview.controller.ts
│   │       │   │   ├── quiz.controller.ts
│   │       │   │   ├── resume.controller.ts
│   │       │   │   └── resumeAnalysis.controller.ts
│   │       │   │
│   │       │   ├── integrations/
│   │       │   │   ├── github.controller.ts
│   │       │   │   ├── linkedin.controller.ts
│   │       │   │   └── linkedin-post.controller.ts
│   │       │   │
│   │       │   ├── github/
│   │       │   │   ├── githubAnalysis.controller.ts
│   │       │   │   ├── githubSkill.controller.ts
│   │       │   │   └── getUserProjects.ts
│   │       │   │
│   │       │   ├── chatbot/
│   │       │   │   └── chatbot.controller.ts
│   │       │   │
│   │       │   └── user/
│   │       │       └── userData.controller.ts
│   │       │
│   │       ├── middleware/
│   │       │   ├── auth.middleware.ts
│   │       │   ├── fileValidation.middleware.ts
│   │       │   └── __tests__/
│   │       │
│   │       ├── routes/
│   │       │   ├── auth.routes.ts
│   │       │   ├── profile.routes.ts
│   │       │   ├── interview.routes.ts
│   │       │   ├── quiz.routes.ts
│   │       │   ├── resume.routes.ts
│   │       │   ├── resumeAnalysis.routes.ts
│   │       │   ├── github.routes.ts
│   │       │   ├── integrations.routes.ts
│   │       │   ├── chatbot.routes.ts
│   │       │   └── user.routes.ts
│   │       │
│   │       └── index.ts
│
│   ├── config/                       # Configuration files
│   │   ├── db.ts
│   │   ├── cloudinary.ts
│   │   ├── gemini.ts
│   │   ├── groq.ts
│   │   └── multer.ts
│
│   ├── constants/
│   │   ├── github/
│   │   │   └── githubUrl.ts
│   │   └── model/
│   │       ├── model.constant.ts
│   │       └── schemaOption.ts
│
│   ├── models/                       # Mongoose models
│   │   ├── schemaDefinitions/
│   │   │   ├── interviewSession.schema.ts
│   │   │   ├── profile.schema.ts
│   │   │   ├── project.schema.ts
│   │   │   ├── quizSession.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   └── userskill.schema.ts
│   │   │
│   │   ├── interviewSession.model.ts
│   │   ├── profile.model.ts
│   │   ├── project.model.ts
│   │   ├── quizSession.model.ts
│   │   ├── user.model.ts
│   │   └── userskill.model.ts
│
│   ├── services/                     # Business logic
│   │   ├── auth/
│   │   ├── github/
│   │   │   ├── githubAnalytics.service.ts
│   │   │   ├── githubapi.service.ts
│   │   │   └── githubSkill.service.ts
│   │   │
│   │   ├── integrations/
│   │   │   ├── cloudinary.service.ts
│   │   │   ├── gemini.service.ts
│   │   │   ├── github.service.ts
│   │   │   ├── groq.service.ts
│   │   │   └── linkedin.service.ts
│   │   │
│   │   ├── chatbot.service.ts
│   │   ├── googleAuth.service.ts
│   │   ├── interview.service.ts
│   │   ├── profile.service.ts
│   │   ├── quiz.service.ts
│   │   ├── resume.service.ts
│   │   ├── resumeAnalysis.service.ts
│   │   └── user.services.ts
│
│   ├── utils/
│   │   ├── errors.ts
│   │   ├── password.ts
│   │   ├── responseFormatter.ts
│   │   ├── textExtraction.ts
│   │   ├── token.utils.ts
│   │   └── validation.ts
│
│   ├── app.ts
│   ├── index.ts
│   └── local.ts
│
├── dist/
├── docs/
├── .env
├── package.json
├── tsconfig.json
└── README.md

```

---

## 🤖 AI Features

### Gemini AI Integration

The project uses **Google Gemini 2.5 Flash** for all AI features:

#### Resume Analysis

- ATS score calculation (0-100)
- Skill extraction
- Strength and weakness identification
- Actionable improvement suggestions

#### Interview Preparation

- Personalized question generation based on:
  - Resume content
  - GitHub projects
  - Target role
  - Experience level
- Real-time answer evaluation
- Constructive feedback
- Performance scoring (0-10)

#### Technical Quizzes

- Dynamic quiz generation
- Multiple-choice questions
- Difficulty-based questions
- Automatic scoring

#### AI Chatbot

- Personalized career advice
- Resume improvement suggestions
- Interview preparation help
- Project discussions
- Skill assessment
- No chat history stored (stateless)

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Environment variable protection
- Input validation and sanitization
- File type validation
- Rate limiting ready
- CORS configuration

---

## 🚀 Deployment

### Build for production

```bash
npm run build
```

### Deploy to serverless (AWS Lambda)

```bash
npm run deploy
```

### Environment Variables

Ensure all required environment variables are set in your deployment platform.

---

---

## 🐛 Troubleshooting

### Common Issues

#### 1. GEMINI_API_KEY not found

**Solution**: Ensure `.env` file has `GEMINI_API_KEY=your_key` without extra spaces or blank lines.

#### 2. MongoDB connection failed

**Solution**: Check `MONGO_URI` in `.env` and ensure MongoDB is running.

#### 3. File upload fails

**Solution**: Verify Cloudinary credentials in `.env`.

---

## 📊 Performance

- **Response Times**:
  - Resume Analysis: 2-4 seconds
  - Interview Questions: 2-3 seconds
  - Answer Evaluation: 2-3 seconds
  - Quiz Generation: 3-5 seconds
  - Chatbot: 2-4 seconds

- **API Limits**:
  - Gemini Free Tier: 15 requests/minute
  - File Upload: Max 10MB
  - Resume: PDF/DOCX only

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **Dipayan Dey** - Initial work

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful AI capabilities
- MongoDB for database
- Cloudinary for file storage
- All open-source contributors

---

## 📞 Support

For issues and questions:

1. Check the [documentation](./docs/)
2. Review [API Testing Guide](./API_TESTING_GUIDE.md)
3. Check [Troubleshooting](#-troubleshooting) section
4. Open an issue on GitHub

---

## 🎯 Roadmap

### Upcoming Features

- [ ] Real-time interview practice
- [ ] Video interview analysis
- [ ] Career path recommendations
- [ ] Skill gap analysis
- [ ] Job matching algorithm
- [ ] Resume templates
- [ ] Cover letter generation
- [ ] Mock interview scheduling

---

**Built with ❤️ using TypeScript, Express, MongoDB, and Google Gemini AI**
