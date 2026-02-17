# Enhanced Profile System - Setup Guide

## Overview

This document provides setup instructions for the enhanced profile system that adds resume management, AI-powered analysis, mock interviews, and technical quizzes to the backend.

## Dependencies Installed

The following npm packages have been installed:

### Production Dependencies

- `multer` (^2.0.2) - Middleware for handling multipart/form-data (file uploads)
- `pdf-parse` (^2.4.5) - Library for extracting text from PDF files
- `mammoth` (^1.11.0) - Library for extracting text from DOCX files
- `groq-sdk` (^0.37.0) - SDK for integrating with Groq API (LLaMA model)

### Development Dependencies

- `@types/multer` (^2.0.0) - TypeScript type definitions for multer
- `@types/pdf-parse` (^1.1.5) - TypeScript type definitions for pdf-parse

## Environment Variables

The following environment variables are required and have been configured in `.env`:

### Cloudinary Configuration

```env
CLOUD_NAME=dlsuycdfj
CLOUD_API_KEY=433334597632452
CLOUD_API_SECRET=AiPcrumE-_TBS2MP0ppDOGXIlyE
```

**Note:** The Cloudinary variable names have been corrected from `COULD_*` to `CLOUD_*`.

### Groq API Configuration

```env
GROQ_API_KEY=
```

## TypeScript Types Created

The following TypeScript interfaces have been created in `src/@types/interfaces/`:

### 1. Resume Analysis Interface (`resumeAnalysis.interface.ts`)

- `IResumeAnalysis` - Structure for AI-generated resume analysis results
- `IProfileWithAnalysis` - Extension for profile with analysis timestamps

### 2. Interview Session Interface (`interviewSession.interface.ts`)

- `IInterviewQuestion` - Structure for interview questions and answers
- `IPerformanceMetrics` - Structure for interview performance metrics
- `IInterviewSession` - Complete interview session document

### 3. Quiz Session Interface (`quizSession.interface.ts`)

- `IQuizQuestion` - Structure for quiz questions with multiple choice options
- `IQuizSession` - Complete quiz session document

### 4. Services Interface (`services.interface.ts`)

- Cloudinary service types
- Resume service types
- Groq API service types
- Interview service types
- Quiz service types
- Profile service types

### 5. Updated Profile Interface

The existing `profile.interfaces.ts` has been extended with:

- `resumeUploadedAt` - Timestamp for resume upload
- `resumeAnalysis` - Embedded resume analysis results
- `resumeAnalyzedAt` - Timestamp for analysis completion
- `privacySettings` - User privacy preferences
- `notificationPreferences` - User notification preferences

## Configuration Files Created

### 1. Groq API Configuration (`src/config/groq.ts`)

Initializes the Groq SDK client with the API key from environment variables.

```typescript
import Groq from "groq-sdk";

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groqClient;
```

### 2. Cloudinary Configuration (Already Exists)

Located at `src/config/cloudinary.ts` - already properly configured with environment variables.

## Project Structure

```
src/
├── @types/
│   └── interfaces/
│       ├── index.ts (exports all interfaces)
│       ├── resumeAnalysis.interface.ts
│       ├── interviewSession.interface.ts
│       ├── quizSession.interface.ts
│       ├── services.interface.ts
│       └── profile.interfaces.ts (updated)
├── config/
│   ├── cloudinary.ts (existing)
│   ├── groq.ts (new)
│   └── db.ts (existing)
└── ...
```

## Next Steps

With the dependencies and configuration complete, the next tasks are:

1. **Task 2**: Create database models and schemas
   - Extend Profile model with resume fields
   - Create ResumeAnalysis subdocument schema
   - Create InterviewSession model
   - Create QuizSession model
   - Update User and Profile models for settings

2. **Task 3**: Implement file upload and validation middleware
3. **Task 4**: Implement resume text extraction utilities
4. **Task 5**: Implement Cloudinary integration service
5. **Task 6**: Implement Groq API integration service

## Verification

To verify the setup is complete:

1. Check that all packages are installed:

   ```bash
   npm list multer pdf-parse mammoth groq-sdk
   ```

2. Verify environment variables are set:

   ```bash
   # Check .env file contains:
   # - CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET
   # - GROQ_API_KEY
   ```

3. Verify TypeScript types compile without errors:
   ```bash
   npm run build
   ```

## Security Notes

- All API keys and credentials are stored in `.env` file (not committed to version control)
- Cloudinary credentials provide secure file storage
- Groq API key enables AI-powered features
- File upload validation will be implemented in Task 3 to ensure security

## Support

For issues or questions about the setup, refer to:

- Groq SDK Documentation: https://github.com/groq/groq-sdk-js
- Cloudinary Documentation: https://cloudinary.com/documentation
- Multer Documentation: https://github.com/expressjs/multer
