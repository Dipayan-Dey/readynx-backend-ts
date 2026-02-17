# API Testing Guide - Enhanced Profile System

This guide will walk you through testing all APIs in the correct order: Resume → Resume Analysis → Profile → Interview → Quiz

## Prerequisites

### 1. Start the Server

```bash
npm run dev
```

The server should be running on `http://localhost:3000` (or your configured port)

### 2. Get Authentication Token

You need to be authenticated first. Use one of these endpoints:

**Login:**

```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Or Sign Up:**

```bash
POST http://localhost:3000/api/v1/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response will include a token:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

**Save this token** - you'll need it for all subsequent requests!

---

## Part 1: Resume Management APIs

### 1.1 Upload Resume

**Endpoint:** `POST /api/v1/profile/resume/upload`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/profile/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "resume=@/path/to/your/resume.pdf"
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:3000/api/v1/profile/resume/upload`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
4. Body:
   - Select "form-data"
   - Key: `resume` (change type to "File")
   - Value: Select your PDF or DOCX file

**Expected Response:**

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resumeUrl": "https://res.cloudinary.com/...",
    "resumeText": "Extracted text from your resume...",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Test Cases:**

- ✅ Valid PDF file (< 10MB)
- ✅ Valid DOCX file (< 10MB)
- ❌ File > 10MB (should fail with 400)
- ❌ Invalid file type like .jpg (should fail with 400)
- ❌ No file uploaded (should fail with 400)

---

### 1.2 Get Resume Details

**Endpoint:** `GET /api/v1/profile/resume`

**Using cURL:**

```bash
curl -X GET http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using Postman:**

1. Method: GET
2. URL: `http://localhost:3000/api/v1/profile/resume`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "resumeUrl": "https://res.cloudinary.com/...",
    "hasResumeText": true,
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 1.3 Delete Resume

**Endpoint:** `DELETE /api/v1/profile/resume`

**Using cURL:**

```bash
curl -X DELETE http://localhost:3000/api/v1/profile/resume \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using Postman:**

1. Method: DELETE
2. URL: `http://localhost:3000/api/v1/profile/resume`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected Response:**

```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

---

## Part 2: Resume Analysis APIs

**⚠️ Important:** You must have a resume uploaded before testing these endpoints!

### 2.1 Analyze Resume

**Endpoint:** `POST /api/v1/profile/resume/analyze`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/profile/resume/analyze \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:3000/api/v1/profile/resume/analyze`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`

**Expected Response:**

```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "data": {
    "atsScore": 85,
    "suggestions": [
      "Add more quantifiable achievements",
      "Include relevant keywords for your target role"
    ],
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "experienceSummary": "5 years of full-stack development experience...",
    "strengths": ["Strong technical skills", "Good project diversity"],
    "weaknesses": ["Could add more metrics", "Missing some modern frameworks"],
    "analyzedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

**Note:** This uses AI (Groq API) and may take 5-10 seconds to complete.

---

### 2.2 Get Analysis Results

**Endpoint:** `GET /api/v1/profile/resume/analysis`

**Using cURL:**

```bash
curl -X GET http://localhost:3000/api/v1/profile/resume/analysis \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using Postman:**

1. Method: GET
2. URL: `http://localhost:3000/api/v1/profile/resume/analysis`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "atsScore": 85,
    "suggestions": [...],
    "skills": [...],
    "experienceSummary": "...",
    "strengths": [...],
    "weaknesses": [...],
    "analyzedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

## Part 3: Profile Management APIs

### 3.1 Get Complete Profile

**Endpoint:** `GET /api/v1/profile`

**Using cURL:**

```bash
curl -X GET http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using Postman:**

1. Method: GET
2. URL: `http://localhost:3000/api/v1/profile`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "profile": {
      "bio": "Full-stack developer...",
      "location": "San Francisco, CA",
      "targetRole": "Senior Full-Stack Developer",
      "experienceLevel": "intermediate",
      "skills": ["JavaScript", "React", "Node.js"]
    },
    "resume": {
      "resumeUrl": "https://res.cloudinary.com/...",
      "hasResumeText": true,
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    },
    "resumeAnalysis": {
      "atsScore": 85,
      "analyzedAt": "2024-01-15T10:35:00.000Z"
    },
    "connections": {
      "linkedinConnected": false,
      "githubConnected": true
    },
    "stats": {
      "interviewCount": 0,
      "quizCount": 0,
      "averageInterviewScore": 0,
      "averageQuizScore": 0
    }
  }
}
```

---

### 3.2 Update Personal Information

**Endpoint:** `PUT /api/v1/profile/personal`

**Using cURL:**

```bash
curl -X PUT http://localhost:3000/api/v1/profile/personal \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "newemail@example.com"
  }'
```

**Using Postman:**

1. Method: PUT
2. URL: `http://localhost:3000/api/v1/profile/personal`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Personal information updated successfully",
  "data": {
    "name": "Updated Name",
    "email": "newemail@example.com"
  }
}
```

---

### 3.3 Update Profile Fields

**Endpoint:** `PUT /api/v1/profile`

**Using cURL:**

```bash
curl -X PUT http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Passionate full-stack developer with 5 years of experience",
    "location": "New York, NY",
    "targetRole": "Senior Full-Stack Developer",
    "experienceLevel": "intermediate",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB"]
  }'
```

**Using Postman:**

1. Method: PUT
2. URL: `http://localhost:3000/api/v1/profile`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "bio": "Passionate full-stack developer with 5 years of experience",
  "location": "New York, NY",
  "targetRole": "Senior Full-Stack Developer",
  "experienceLevel": "intermediate",
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB"]
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "bio": "Passionate full-stack developer with 5 years of experience",
    "location": "New York, NY",
    "targetRole": "Senior Full-Stack Developer",
    "experienceLevel": "intermediate",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB"]
  }
}
```

---

### 3.4 Update Settings

**Endpoint:** `PUT /api/v1/profile/settings`

**Using cURL:**

```bash
curl -X PUT http://localhost:3000/api/v1/profile/settings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Senior Full-Stack Developer",
    "experienceLevel": "advanced",
    "privacySettings": {
      "showEmail": false,
      "showPhone": false,
      "showResume": true,
      "showProjects": true
    },
    "notificationPreferences": {
      "emailNotifications": true,
      "quizReminders": true,
      "interviewReminders": true
    }
  }'
```

**Using Postman:**

1. Method: PUT
2. URL: `http://localhost:3000/api/v1/profile/settings`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "targetRole": "Senior Full-Stack Developer",
  "experienceLevel": "advanced",
  "privacySettings": {
    "showEmail": false,
    "showPhone": false,
    "showResume": true,
    "showProjects": true
  },
  "notificationPreferences": {
    "emailNotifications": true,
    "quizReminders": true,
    "interviewReminders": true
  }
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "targetRole": "Senior Full-Stack Developer",
    "experienceLevel": "advanced",
    "privacySettings": { ... },
    "notificationPreferences": { ... }
  }
}
```

---

## Part 4: Interview APIs

**⚠️ Important:** Having a resume uploaded improves interview question quality!

### 4.1 Start Interview Session

**Endpoint:** `POST /api/v1/interviews/start`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/interviews/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Full-Stack Developer",
    "experienceLevel": "intermediate"
  }'
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:3000/api/v1/interviews/start`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. Body (raw JSON) - Optional:

```json
{
  "targetRole": "Full-Stack Developer",
  "experienceLevel": "intermediate"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Interview session started successfully",
  "data": {
    "sessionId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "questions": [
      {
        "question": "Explain the difference between REST and GraphQL APIs.",
        "index": 0
      },
      {
        "question": "How do you handle error handling in Node.js applications?",
        "index": 1
      },
      {
        "question": "Describe your experience with React hooks.",
        "index": 2
      }
      // ... more questions
    ],
    "status": "in_progress",
    "startedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Save the sessionId** - you'll need it for the next steps!

**Note:** This uses AI and may take 10-15 seconds to generate questions.

---

### 4.2 Submit Answer to Interview Question

**Endpoint:** `POST /api/v1/interviews/:sessionId/answer`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/interviews/65a1b2c3d4e5f6g7h8i9j0k1/answer \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "questionIndex": 0,
    "answer": "REST APIs use HTTP methods and endpoints for CRUD operations, while GraphQL uses a single endpoint with a query language. GraphQL allows clients to request exactly the data they need, reducing over-fetching and under-fetching issues common in REST APIs."
  }'
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:3000/api/v1/interviews/YOUR_SESSION_ID/answer`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "questionIndex": 0,
  "answer": "REST APIs use HTTP methods and endpoints for CRUD operations, while GraphQL uses a single endpoint with a query language. GraphQL allows clients to request exactly the data they need, reducing over-fetching and under-fetching issues common in REST APIs."
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "questionIndex": 0,
    "feedback": "Great answer! You correctly identified the key differences. Consider also mentioning caching strategies and tooling differences.",
    "score": 8.5
  }
}
```

**Repeat this for each question** (change questionIndex: 0, 1, 2, etc.)

**Note:** Each answer evaluation uses AI and takes 5-10 seconds.

---

### 4.3 Complete Interview Session

**Endpoint:** `POST /api/v1/interviews/:sessionId/complete`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/interviews/65a1b2c3d4e5f6g7h8i9j0k1/complete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:3000/api/v1/interviews/YOUR_SESSION_ID/complete`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`

**Expected Response:**

```json
{
  "success": true,
  "message": "Interview session completed successfully",
  "data": {
    "sessionId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "status": "completed",
    "averageScore": 8.2,
    "totalQuestions": 5,
    "answeredQuestions": 5,
    "completedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

---

### 4.4 Get Interview History

**Endpoint:** `GET /api/v1/interviews/history`

**Using cURL:**

```bash
curl -X GET "http://localhost:3000/api/v1/interviews/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using Postman:**

1. Method: GET
2. URL: `http://localhost:3000/api/v1/interviews/history`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
4. Query Params:
   - `page`: 1
   - `limit`: 10

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "status": "completed",
      "averageScore": 8.2,
      "totalQuestions": 5,
      "answeredQuestions": 5,
      "startedAt": "2024-01-15T11:00:00.000Z",
      "completedAt": "2024-01-15T11:30:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10
}
```

---

### 4.5 Delete Interview Session

**Endpoint:** `DELETE /api/v1/interviews/:sessionId`

**Using cURL:**

```bash
curl -X DELETE http://localhost:3000/api/v1/interviews/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using Postman:**

1. Method: DELETE
2. URL: `http://localhost:3000/api/v1/interviews/65a1b2c3d4e5f6g7h8i9j0k1`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected Response:**

```json
{
  "success": true,
  "message": "Interview session deleted successfully"
}
```

**Error Responses:**

- 404 Not Found: Interview session not found
- 500 Internal Server Error: Failed to delete interview session

---

## Part 5: Quiz APIs (Bonus)

### 5.1 Start Quiz Session

**Endpoint:** `POST /api/v1/quizzes/start`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/quizzes/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Full-Stack Developer",
    "questionCount": 5
  }'
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:3000/api/v1/quizzes/start`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. Body (raw JSON) - Optional:

```json
{
  "targetRole": "Full-Stack Developer",
  "questionCount": 5
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Quiz session started successfully",
  "data": {
    "sessionId": "65b2c3d4e5f6g7h8i9j0k1l2",
    "questions": [
      {
        "question": "What is the purpose of useEffect in React?",
        "options": ["A", "B", "C", "D"],
        "index": 0
      }
      // ... more questions
    ],
    "status": "in_progress",
    "startedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### 5.2 Submit Quiz Answers

**Endpoint:** `POST /api/v1/quizzes/:sessionId/submit`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/quizzes/65b2c3d4e5f6g7h8i9j0k1l2/submit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      { "questionIndex": 0, "answer": "A" },
      { "questionIndex": 1, "answer": "C" },
      { "questionIndex": 2, "answer": "B" },
      { "questionIndex": 3, "answer": "D" },
      { "questionIndex": 4, "answer": "A" }
    ]
  }'
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:3000/api/v1/quizzes/YOUR_SESSION_ID/submit`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "answers": [
    { "questionIndex": 0, "answer": "A" },
    { "questionIndex": 1, "answer": "C" },
    { "questionIndex": 2, "answer": "B" },
    { "questionIndex": 3, "answer": "D" },
    { "questionIndex": 4, "answer": "A" }
  ]
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "sessionId": "65b2c3d4e5f6g7h8i9j0k1l2",
    "score": 80,
    "correctAnswers": 4,
    "totalQuestions": 5,
    "status": "completed",
    "completedAt": "2024-01-15T12:15:00.000Z",
    "questions": [
      {
        "question": "What is the purpose of useEffect in React?",
        "options": ["A", "B", "C", "D"],
        "userAnswer": "A",
        "correctAnswer": "A",
        "isCorrect": true
      }
      // ... more questions with results
    ]
  }
}
```

---

## Part 6: AI Chatbot

### 6.1 Send Message to Chatbot

**Endpoint:** `POST /api/v1/chatbot/message`

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/chatbot/message \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are my strongest skills based on my profile?"
  }'
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:3000/api/v1/chatbot/message`
3. Headers:
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "message": "What are my strongest skills based on my profile?"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "message": "Based on your profile, your strongest skills are JavaScript, React, and Node.js. Your GitHub projects demonstrate solid experience with full-stack development, particularly in building RESTful APIs and modern web applications...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Example Questions to Try:**

- "What are my strongest skills?"
- "How can I improve my resume?"
- "Tell me about my GitHub projects"
- "What career path should I pursue?"
- "Help me prepare for a technical interview"
- "Review my profile and suggest improvements"

**Important Notes:**

- No chat history is stored
- Each message is independent
- Page refresh clears conversation
- Responses are personalized based on your profile, resume, and GitHub data
- Maximum message length: 2000 characters

---

## Testing Checklist

### ✅ Resume APIs

- [ ] Upload PDF resume
- [ ] Upload DOCX resume
- [ ] Get resume details
- [ ] Delete resume
- [ ] Try uploading file > 10MB (should fail)
- [ ] Try uploading invalid file type (should fail)

### ✅ Resume Analysis APIs

- [ ] Analyze resume (after uploading)
- [ ] Get analysis results
- [ ] Try analyzing without resume (should fail)

### ✅ Profile APIs

- [ ] Get complete profile
- [ ] Update personal information
- [ ] Update profile fields
- [ ] Update settings
- [ ] Test validation errors (invalid email, etc.)

### ✅ Interview APIs

- [ ] Start interview session
- [ ] Submit answers to questions
- [ ] Complete interview session
- [ ] Get interview history
- [ ] Test pagination (page=2, limit=5)

### ✅ Quiz APIs

- [ ] Start quiz session
- [ ] Submit quiz answers
- [ ] Get quiz history

### ✅ Chatbot

- [ ] Send message to chatbot
- [ ] Test with different questions
- [ ] Verify personalized responses based on profile data

---

## Common Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Solution:** Check your token is valid and included in the Authorization header

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Email must be a valid email address"]
}
```

**Solution:** Check your request body matches the required format

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Solution:** Check the resource exists (e.g., resume uploaded, session exists)

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

**Solution:** Check server logs for details

---

## Tips for Testing

1. **Use Postman Collections**: Save all requests in a Postman collection for easy re-testing
2. **Environment Variables**: Store your token and sessionIds as Postman environment variables
3. **Test in Order**: Follow the order in this guide (Resume → Analysis → Profile → Interview)
4. **Check Logs**: Monitor server console for detailed error messages
5. **Database**: Use MongoDB Compass to verify data is being saved correctly
6. **AI Delays**: Be patient with AI-powered endpoints (analysis, interviews, quizzes) - they take 5-15 seconds

---

## Need Help?

If you encounter issues:

1. Check server is running (`npm run dev`)
2. Verify MongoDB is connected
3. Ensure environment variables are set (`.env` file)
4. Check Cloudinary credentials for file uploads
5. Check Groq API key for AI features
6. Review server console logs for detailed errors
