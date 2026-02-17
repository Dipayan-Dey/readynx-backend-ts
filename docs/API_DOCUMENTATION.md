# Enhanced Profile System - Complete API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Resume Management](#resume-management)
6. [Resume Analysis](#resume-analysis)
7. [Mock Interviews](#mock-interviews)
8. [Technical Quizzes](#technical-quizzes)
9. [Profile Management](#profile-management)

---

## Overview

The Enhanced Profile System API provides comprehensive endpoints for managing user profiles, resumes, AI-powered analysis, mock interviews, and technical quizzes. All endpoints follow RESTful conventions and return JSON responses.

**Base URL**: `/api/v1`

**API Version**: 1.0

---

## Authentication

All endpoints require authentication via JWT token. The token can be provided in three ways:

1. **Cookie** (Recommended):
   ```
   Cookie: token=<jwt_token>
   ```

2. **Authorization Header**:
   ```
   Authorization: Bearer <jwt_token>
   ```

3. **Query Parameter**:
   ```
   ?token=<jwt_token>
   ```

### Authentication Errors

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 401
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "Access denied",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 403
}
```

---

## Response Format

All API responses follow a consistent structure with ISO 8601 timestamps and camelCase field naming.

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 400
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Codes

| Status Code | Description | Common Causes |
|------------|-------------|---------------|
| 400 | Bad Request | Invalid input data, validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server-side errors |
| 502 | Bad Gateway | External API failure (Groq, Cloudinary) |

### Common Error Messages

- `"Validation failed"` - Input validation errors
- `"Authentication required"` - Missing JWT token
- `"Access denied"` - User doesn't own the resource
- `"Resource not found"` - Requested item doesn't exist
- `"File upload failed"` - File processing error
- `"Groq API error: ..."` - AI service failure
- `"Cloudinary API error: ..."` - File storage failure

---

## Resume Management

### Upload Resume

Upload a resume file in PDF or DOCX format.

**Endpoint**: `POST /api/v1/profile/resume/upload`

**Requirements**: 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 11.5

**Content-Type**: `multipart/form-data`

**Request**:
```
Field: resume
Type: File (PDF or DOCX)
Max Size: 10MB
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resumeUrl": "https://res.cloudinary.com/...",
    "textExtracted": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:

*400 - No file uploaded*:
```json
{
  "success": false,
  "message": "No file uploaded. Please provide a PDF or DOCX file.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 400
}
```

*400 - Invalid file type*:
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF and DOCX files are allowed.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 400
}
```

*400 - File too large*:
```json
{
  "success": false,
  "message": "File size exceeds 10MB limit",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 400
}
```

---

### Get Resume

Retrieve resume details for the authenticated user.

**Endpoint**: `GET /api/v1/profile/resume`

**Requirements**: 1.3, 11.1, 11.5

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "resumeUrl": "https://res.cloudinary.com/...",
    "hasText": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "No resume found for this user",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 404
}
```

---

### Delete Resume

Delete the resume for the authenticated user.

**Endpoint**: `DELETE /api/v1/profile/resume`

**Requirements**: 1.5, 11.1, 11.5

**Success Response** (200):
```json
{
  "success": true,
  "message": "Resume deleted successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "No resume found to delete",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 404
}
```

---

## Resume Analysis

### Analyze Resume

Trigger AI-powered resume analysis using Groq API with LLaMA model.

**Endpoint**: `POST /api/v1/profile/resume/analyze`

**Requirements**: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 11.1, 11.5

**Success Response** (200):
```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "data": {
    "atsScore": 85,
    "suggestions": [
      "Add more quantifiable achievements",
      "Include relevant keywords for your target role",
      "Expand on leadership experience"
    ],
    "skills": [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "MongoDB"
    ],
    "experienceSummary": "5+ years of full-stack development experience with focus on modern web technologies",
    "strengths": [
      "Strong technical skills in modern frameworks",
      "Clear project descriptions",
      "Good formatting and structure"
    ],
    "weaknesses": [
      "Limited quantifiable metrics",
      "Missing soft skills",
      "Could benefit from more industry keywords"
    ],
    "analyzedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:

*404 - No resume found*:
```json
{
  "success": false,
  "message": "No resume found. Please upload a resume first.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 404
}
```

*502 - Groq API error*:
```json
{
  "success": false,
  "message": "Groq API error: Failed to analyze resume",
  "service": "Groq",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 502
}
```

---

### Get Analysis Results

Retrieve previously stored resume analysis results.

**Endpoint**: `GET /api/v1/profile/resume/analysis`

**Requirements**: 3.7, 11.1, 11.5

**Success