# Enhanced Profile System API Routes

This document provides an overview of all API routes for the enhanced profile system.

## Authentication

All routes require authentication via JWT token. The token can be provided in:
- Cookie: `token`
- Authorization header: `Bearer <token>`
- Query parameter: `token`

## Resume Management Routes

Base path: `/api/v1/profile/resume`

### Upload Resume
- **POST** `/api/v1/profile/resume/upload`
- **Description**: Upload a resume file (PDF or DOCX)
- **Middleware**: Authentication, Multer upload, File validation
- **Requirements**: 1.1, 11.1, 11.5
- **Request**: Multipart form data with `resume` field
- **Response**: Resume URL and text extraction status

### Get Resume
- **GET** `/api/v1/profile/resume`
- **Description**: Get resume details for authenticated user
- **Middleware**: Authentication
- **Requirements**: 1.3, 11.1, 11.5
- **Response**: Resume URL and text availability status

### Delete Resume
- **DELETE** `/api/v1/profile/resume`
- **Description**: Delete resume for authenticated user
- **Middleware**: Authentication
- **Requirements**: 1.5, 11.1, 11.5
- **Response**: Success confirmation

## Resume Analysis Routes

Base path: `/api/v1/profile/resume`

### Analyze Resume
- **POST** `/api/v1/profile/resume/analyze`
- **Description**: Trigger AI-powered resume analysis
- **Middleware**: Authentication
- **Requirements**: 3.1, 11.1, 11.5
- **Response**: Complete analysis results (ATS score, suggestions, skills, etc.)

### Get Analysis Results
- **GET** `/api/v1/profile/resume/analysis`
- **Description**: Get stored resume analysis results
- **Middleware**: Authentication
- **Requirements**: 3.7, 11.1, 11.5
- **Response**: Previously stored analysis results

## Interview Routes

Base path: `/api/v1/interviews`

### Start Interview
- **POST** `/api/v1/interviews/start`
- **Description**: Start a new mock interview session
- **Middleware**: Authentication
- **Requirements**: 5.1, 11.1, 11.5
- **Request Body** (optional):
  - `targetRole`: string
  - `experienceLevel`: string
- **Response**: Session ID, questions, status, start time

### Submit Answer
- **POST** `/api/v1/interviews/:sessionId/answer`
- **Description**: Submit an answer to an interview question
- **Middleware**: Authentication
- **Requirements**: 5.5, 11.1, 11.5
- **Request Body**:
  - `questionIndex`: number (required)
  - `answer`: string (required)
- **Response**: AI feedback and score for the answer

### Complete Interview
- **POST** `/api/v1/interviews/:sessionId/complete`
- **Description**: Complete an interview session
- **Middleware**: Authentication
- **Requirements**: 5.7, 11.1, 11.5
- **Response**: Session status, performance metrics, completion time

### Get Interview History
- **GET** `/api/v1/interviews/history`
- **Description**: Get interview history for authenticated user
- **Middleware**: Authentication
- **Requirements**: 5.7, 5.8, 11.1, 11.5
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
- **Response**: Paginated list of interview sessions

## Quiz Routes

Base path: `/api/v1/quizzes`

### Generate Quiz
- **POST** `/api/v1/quizzes/generate`
- **Description**: Generate a technical quiz
- **Middleware**: Authentication
- **Requirements**: 6.1, 11.1, 11.5
- **Request Body** (optional):
  - `targetRole`: string
  - `questionCount`: number (default: 10)
- **Response**: Generated quiz questions (without correct answers)

### Start Quiz
- **POST** `/api/v1/quizzes/start`
- **Description**: Start a new quiz session
- **Middleware**: Authentication
- **Requirements**: 7.1, 11.1, 11.5
- **Request Body** (optional):
  - `targetRole`: string
  - `questionCount`: number (default: 10)
- **Response**: Session ID, questions, status, start time

### Submit Quiz Answers
- **POST** `/api/v1/quizzes/:sessionId/submit`
- **Description**: Submit answers for a quiz session
- **Middleware**: Authentication
- **Requirements**: 7.2, 11.1, 11.5
- **Request Body**:
  - `answers`: Array<{ questionIndex: number, answer: string }> (required)
- **Response**: Score, correct answers count, detailed results

### Get Quiz History
- **GET** `/api/v1/quizzes/history`
- **Description**: Get quiz history for authenticated user
- **Middleware**: Authentication
- **Requirements**: 7.4, 7.5, 11.1, 11.5
- **Query Parameters**:
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 10)
- **Response**: Paginated list of quiz sessions

## Profile Routes

Base path: `/api/v1/profile`

### Get Profile
- **GET** `/api/v1/profile`
- **Description**: Get complete profile data
- **Middleware**: Authentication
- **Requirements**: 8.1, 11.1, 11.5
- **Response**: Complete profile including personal info, resume, analysis, connections, skills, history

### Update Personal Info
- **PUT** `/api/v1/profile/personal`
- **Description**: Update user's personal information
- **Middleware**: Authentication
- **Requirements**: 9.1, 11.1, 11.5
- **Request Body** (at least one required):
  - `name`: string
  - `email`: string
- **Response**: Updated user information

### Update Profile
- **PUT** `/api/v1/profile`
- **Description**: Update profile fields
- **Middleware**: Authentication
- **Requirements**: 9.1, 11.1, 11.5
- **Request Body** (at least one required):
  - `targetRole`: string
  - `experienceLevel`: string (beginner, intermediate, advanced)
- **Response**: Updated profile

### Update Settings
- **PUT** `/api/v1/profile/settings`
- **Description**: Update user settings and preferences
- **Middleware**: Authentication
- **Requirements**: 10.1, 11.1, 11.5
- **Request Body** (at least one required):
  - `targetRole`: string
  - `experienceLevel`: string
  - `privacySettings`: object
  - `notificationPreferences`: object
- **Response**: Updated profile with settings

### Disconnect LinkedIn
- **POST** `/api/v1/profile/disconnect/linkedin`
- **Description**: Disconnect LinkedIn account
- **Middleware**: Authentication
- **Requirements**: 10.4, 11.1, 11.5
- **Response**: Success confirmation

### Disconnect GitHub
- **POST** `/api/v1/profile/disconnect/github`
- **Description**: Disconnect GitHub account
- **Middleware**: Authentication
- **Requirements**: 10.5, 11.1, 11.5
- **Response**: Success confirmation

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## HTTP Status Codes

- **200 OK**: Successful GET, PUT, DELETE operations
- **201 Created**: Successful POST operations that create resources
- **400 Bad Request**: Invalid request data or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have permission for the operation
- **404 Not Found**: Requested resource doesn't exist
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **500 Internal Server Error**: Server-side errors

## File Upload Specifications

### Resume Upload
- **Maximum file size**: 10MB
- **Allowed formats**: PDF (.pdf), DOCX (.docx)
- **Field name**: `resume`
- **Content-Type**: `multipart/form-data`

## Pagination

History endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Paginated responses include:
```json
{
  "success": true,
  "data": [ /* items */ ],
  "page": 1,
  "limit": 10
}
```
