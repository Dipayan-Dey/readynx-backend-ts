# Live Interview Frontend Integration Guide

## Overview

This guide provides complete frontend integration for the Live Interview feature using your existing axios client setup. The system generates personalized interview questions based on resume analysis, evaluates answers in real-time using AI, and provides a comprehensive final report.

## Important Note

This guide uses your existing axios client with automatic JWT token attachment. All API calls use the axios instance you've already configured, so no additional authentication setup is needed.

## Features

- AI-generated interview questions based on resume analysis
- Real-time answer evaluation with feedback
- Progress tracking throughout the interview
- Comprehensive final report with scores and recommendations
- Session management with resume capability

## API Endpoints

### Base URL

```
http://localhost:5000/api/v1/live-interview
```

### Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Start Interview

**Endpoint:** `POST /start`

**Description:** Starts a new live interview session. Requires resume analysis to be completed first.

**Request:**

```javascript
// Headers
{
  "Authorization": "Bearer <token>"
}

// No body required
```

**Response:**

```javascript
{
  "success": true,
  "data": {
    "sessionId": "uuid-v4-string",
    "questions": [
      {
        "id": "q1",
        "question": "Can you explain your experience with React.js?",
        "category": "Technical",
        "difficulty": "Medium"
      },
      // ... more questions
    ],
    "firstQuestion": {
      "id": "q1",
      "question": "Can you explain your experience with React.js?",
      "category": "Technical",
      "difficulty": "Medium"
    }
  }
}
```

**Error Responses:**

```javascript
// Resume not analyzed
{
  "success": false,
  "message": "Please analyze resume first"
}

// Failed to generate questions
{
  "success": false,
  "message": "Failed to generate interview questions"
}
```

---

## 2. Submit Answer

**Endpoint:** `POST /answer`

**Description:** Submits an answer for the current question and receives evaluation feedback.

**Request:**

```javascript
{
  "sessionId": "uuid-v4-string",
  "answer": "I have 3 years of experience with React.js..."
}
```

**Response:**

```javascript
{
  "success": true,
  "data": {
    "score": 8,
    "feedback": "Good answer! You demonstrated solid understanding...",
    "strengths": ["Clear explanation", "Practical examples"],
    "improvements": ["Could mention more advanced concepts"]
  },
  "nextQuestion": {
    "id": "q2",
    "question": "How do you handle state management in large applications?",
    "category": "Technical",
    "difficulty": "Hard"
  }
}
```

**Error Responses:**

```javascript
// Session not found
{
  "success": false,
  "message": "Session not found"
}
```

---

## 3. Finish Interview

**Endpoint:** `POST /finish`

**Description:** Completes the interview and generates a comprehensive final report.

**Request:**

```javascript
{
  "sessionId": "uuid-v4-string"
}
```

**Response:**

```javascript
{
  "success": true,
  "data": {
    "overallScore": 7.5,
    "totalQuestions": 10,
    "answeredQuestions": 10,
    "categoryScores": {
      "Technical": 8.0,
      "Behavioral": 7.0,
      "Problem Solving": 7.5
    },
    "strengths": [
      "Strong technical knowledge",
      "Good communication skills"
    ],
    "areasForImprovement": [
      "Could provide more specific examples",
      "Practice behavioral questions"
    ],
    "recommendations": [
      "Review advanced React patterns",
      "Practice STAR method for behavioral questions"
    ],
    "summary": "Overall strong performance with good technical understanding..."
  }
}
```

---

## 4. Get Session Details

**Endpoint:** `GET /session/:id`

**Description:** Retrieves current session details including progress and transcript.

**Request:**

```javascript
// URL parameter
GET /session/uuid-v4-string

// Headers
{
  "Authorization": "Bearer <token>"
}
```

**Response:**

```javascript
{
  "success": true,
  "data": {
    "sessionId": "uuid-v4-string",
    "totalQuestions": 10,
    "currentQuestionIndex": 3,
    "currentQuestion": {
      "id": "q4",
      "question": "Describe a challenging project you worked on",
      "category": "Behavioral",
      "difficulty": "Medium"
    },
    "transcript": [
      {
        "question": "Can you explain your experience with React.js?",
        "answer": "I have 3 years of experience...",
        "evaluation": {
          "score": 8,
          "feedback": "Good answer!"
        }
      }
      // ... more transcript entries
    ],
    "isCompleted": false
  }
}
```

**Error Responses:**

```javascript
// Invalid session ID
{
  "success": false,
  "message": "Invalid session ID"
}

// Session not found
{
  "success": false,
  "message": "Interview session not found"
}

// Unauthorized access
{
  "success": false,
  "message": "Unauthorized access to session"
}
```

---

## React Integration

### API Service Functions

You already have the axios client setup with automatic token attachment. Here are the API functions you need:

```javascript
// api/axiosClient.js (Already exists in your project)

import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// Auto attach token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
```

```javascript
// api/liveInterviewApi.js (Add these to your existing API file)

import axiosClient from "./axiosClient";

// ==========================================
// LIVE INTERVIEW SYSTEM APIs
// ==========================================

export const startLiveInterview = () => {
  return axiosClient.post("/live-interview/start");
};

export const submitLiveInterviewAnswer = (sessionId, answer) => {
  return axiosClient.post("/live-interview/answer", { sessionId, answer });
};

export const finishLiveInterview = (sessionId) => {
  return axiosClient.post("/live-interview/finish", { sessionId });
};

export const getLiveInterviewSession = (sessionId) => {
  return axiosClient.get(`/live-interview/session/${sessionId}`);
};
```

// Get session details
export const getSessionDetails = async (sessionId) => {
try {
const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
method: "GET",
headers: {
Authorization: `Bearer ${getAuthToken()}`,
"Content-Type": "application/json",
},
});

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get session details");
    }

    return data;

} catch (error) {
console.error("Get session error:", error);
throw error;
}
};

````

---

### Main Interview Component

```javascript
// components/LiveInterview.js

import React, { useState, useEffect } from "react";
import {
  startLiveInterview,
  submitLiveInterviewAnswer,
  finishLiveInterview,
  getLiveInterviewSession,
} from "../api/liveInterviewApi";
import QuestionDisplay from "./QuestionDisplay";
import AnswerInput from "./AnswerInput";
import EvaluationFeedback from "./EvaluationFeedback";
import FinalReport from "./FinalReport";
import ProgressBar from "./ProgressBar";

const LiveInterview = () => {
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // Start interview
  const handleStartInterview = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await startLiveInterview();

      setSessionId(response.data.data.sessionId);
      setQuestions(response.data.data.questions);
      setCurrentQuestion(response.data.data.firstQuestion);
      setCurrentQuestionIndex(0);
      setInterviewStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await submitLiveInterviewAnswer(sessionId, answer);

      setEvaluation(response.data.data);

      // Move to next question after showing feedback
      setTimeout(() => {
        if (response.data.nextQuestion) {
          setCurrentQuestion(response.data.nextQuestion);
          setCurrentQuestionIndex((prev) => prev + 1);
          setAnswer("");
          setEvaluation(null);
        } else {
          // No more questions, finish interview
          handleFinishInterview();
        }
      }, 3000); // Show feedback for 3 seconds
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Finish interview
  const handleFinishInterview = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await finishLiveInterview(sessionId);

      setFinalReport(response.data.data);
      setInterviewCompleted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render different views based on state
  if (interviewCompleted && finalReport) {
    return <FinalReport report={finalReport} />;
  }

  if (!interviewStarted) {
    return (
      <div className="interview-start">
        <h1>Live Interview</h1>
        <p>Ready to start your personalized interview?</p>
        <p>Make sure you have analyzed your resume first.</p>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleStartInterview}
          disabled={loading}
          className="start-button"
        >
          {loading ? "Starting..." : "Start Interview"}
        </button>
      </div>
    );
  }

  return (
    <div className="live-interview">
      <h1>Live Interview</h1>

      <ProgressBar
        current={currentQuestionIndex + 1}
        total={questions.length}
      />

      {error && <div className="error-message">{error}</div>}

      {currentQuestion && (
        <>
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />

          {!evaluation ? (
            <AnswerInput
              answer={answer}
              setAnswer={setAnswer}
              onSubmit={handleSubmitAnswer}
              loading={loading}
            />
          ) : (
            <EvaluationFeedback evaluation={evaluation} />
          )}
        </>
      )}

      {currentQuestionIndex >= questions.length - 1 && !evaluation && (
        <button
          onClick={handleFinishInterview}
          className="finish-button"
          disabled={loading}
        >
          Finish Interview
        </button>
      )}
    </div>
  );
};

export default LiveInterview;
````

---

### Question Display Component

```javascript
// components/QuestionDisplay.js

import React from "react";

const QuestionDisplay = ({ question, questionNumber, totalQuestions }) => {
  return (
    <div className="question-display">
      <div className="question-header">
        <span className="question-number">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span
          className={`difficulty-badge ${question.difficulty?.toLowerCase()}`}
        >
          {question.difficulty}
        </span>
        <span className="category-badge">{question.category}</span>
      </div>

      <h2 className="question-text">{question.question}</h2>
    </div>
  );
};

export default QuestionDisplay;
```

---

### Answer Input Component

```javascript
// components/AnswerInput.js

import React from "react";

const AnswerInput = ({ answer, setAnswer, onSubmit, loading }) => {
  const handleKeyPress = (e) => {
    // Submit on Ctrl+Enter
    if (e.ctrlKey && e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="answer-input">
      <label htmlFor="answer">Your Answer:</label>
      <textarea
        id="answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your answer here... (Ctrl+Enter to submit)"
        rows={8}
        disabled={loading}
      />

      <div className="answer-actions">
        <span className="hint">
          Tip: Provide detailed answers with examples
        </span>
        <button
          onClick={onSubmit}
          disabled={loading || !answer.trim()}
          className="submit-button"
        >
          {loading ? "Submitting..." : "Submit Answer"}
        </button>
      </div>
    </div>
  );
};

export default AnswerInput;
```

---

### Evaluation Feedback Component

```javascript
// components/EvaluationFeedback.js

import React from "react";

const EvaluationFeedback = ({ evaluation }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return "excellent";
    if (score >= 6) return "good";
    if (score >= 4) return "average";
    return "needs-improvement";
  };

  return (
    <div className="evaluation-feedback">
      <div className="score-section">
        <h3>Score</h3>
        <div className={`score-display ${getScoreColor(evaluation.score)}`}>
          {evaluation.score}/10
        </div>
      </div>

      <div className="feedback-section">
        <h3>Feedback</h3>
        <p>{evaluation.feedback}</p>
      </div>

      {evaluation.strengths && evaluation.strengths.length > 0 && (
        <div className="strengths-section">
          <h3>Strengths</h3>
          <ul>
            {evaluation.strengths.map((strength, index) => (
              <li key={index} className="strength-item">
                ✓ {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.improvements && evaluation.improvements.length > 0 && (
        <div className="improvements-section">
          <h3>Areas for Improvement</h3>
          <ul>
            {evaluation.improvements.map((improvement, index) => (
              <li key={index} className="improvement-item">
                → {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="next-question-hint">Moving to next question...</p>
    </div>
  );
};

export default EvaluationFeedback;
```

---

### Progress Bar Component

```javascript
// components/ProgressBar.js

import React from "react";

const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-bar-container">
      <div className="progress-info">
        <span>
          Progress: {current} / {total}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
```

---

### Final Report Component

```javascript
// components/FinalReport.js

import React from "react";

const FinalReport = ({ report }) => {
  const getOverallRating = (score) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="final-report">
      <h1>Interview Complete!</h1>

      <div className="overall-score-section">
        <h2>Overall Performance</h2>
        <div className="overall-score">
          <div className="score-circle">{report.overallScore.toFixed(1)}</div>
          <div className="rating">{getOverallRating(report.overallScore)}</div>
        </div>
        <p className="questions-answered">
          Answered {report.answeredQuestions} out of {report.totalQuestions}{" "}
          questions
        </p>
      </div>

      {report.categoryScores && (
        <div className="category-scores-section">
          <h2>Category Breakdown</h2>
          <div className="category-scores">
            {Object.entries(report.categoryScores).map(([category, score]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category}</span>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{ width: `${(score / 10) * 100}%` }}
                  />
                </div>
                <span className="category-score">{score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.strengths && report.strengths.length > 0 && (
        <div className="strengths-section">
          <h2>Your Strengths</h2>
          <ul className="strengths-list">
            {report.strengths.map((strength, index) => (
              <li key={index} className="strength-item">
                <span className="icon">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.areasForImprovement && report.areasForImprovement.length > 0 && (
        <div className="improvements-section">
          <h2>Areas for Improvement</h2>
          <ul className="improvements-list">
            {report.areasForImprovement.map((area, index) => (
              <li key={index} className="improvement-item">
                <span className="icon">→</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.recommendations && report.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>Recommendations</h2>
          <ul className="recommendations-list">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="recommendation-item">
                <span className="icon">💡</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.summary && (
        <div className="summary-section">
          <h2>Summary</h2>
          <p className="summary-text">{report.summary}</p>
        </div>
      )}

      <div className="report-actions">
        <button className="download-button">Download Report</button>
        <button className="retake-button">Take Another Interview</button>
      </div>
    </div>
  );
};

export default FinalReport;
```

---

## CSS Styling

```css
/* styles/LiveInterview.css */

.live-interview {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.interview-start {
  text-align: center;
  padding: 60px 20px;
}

.interview-start h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
}

.interview-start p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 15px;
}

.start-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s;
}

.start-button:hover:not(:disabled) {
  background: #0056b3;
}

.start-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Progress Bar */
.progress-bar-container {
  margin: 30px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
}

.progress-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

/* Question Display */
.question-display {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.question-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.question-number {
  font-weight: 600;
  color: #333;
}

.difficulty-badge,
.category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.difficulty-badge.easy {
  background: #d4edda;
  color: #155724;
}

.difficulty-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.difficulty-badge.hard {
  background: #f8d7da;
  color: #721c24;
}

.category-badge {
  background: #e7f3ff;
  color: #004085;
}

.question-text {
  font-size: 1.5rem;
  color: #333;
  line-height: 1.6;
}

/* Answer Input */
.answer-input {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.answer-input label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.answer-input textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

.answer-input textarea:focus {
  outline: none;
  border-color: #007bff;
}

.answer-input textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.answer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.hint {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

.submit-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-button:hover:not(:disabled) {
  background: #218838;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Evaluation Feedback */
.evaluation-feedback {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.score-section {
  text-align: center;
  margin-bottom: 30px;
}

.score-display {
  font-size: 3rem;
  font-weight: bold;
  margin: 15px 0;
  padding: 20px;
  border-radius: 12px;
}

.score-display.excellent {
  background: #d4edda;
  color: #155724;
}

.score-display.good {
  background: #d1ecf1;
  color: #0c5460;
}

.score-display.average {
  background: #fff3cd;
  color: #856404;
}

.score-display.needs-improvement {
  background: #f8d7da;
  color: #721c24;
}

.feedback-section,
.strengths-section,
.improvements-section {
  margin-bottom: 25px;
}

.feedback-section h3,
.strengths-section h3,
.improvements-section h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.feedback-section p {
  color: #555;
  line-height: 1.6;
}

.strengths-section ul,
.improvements-section ul {
  list-style: none;
  padding: 0;
}

.strength-item,
.improvement-item {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
}

.strength-item {
  background: #d4edda;
  color: #155724;
}

.improvement-item {
  background: #fff3cd;
  color: #856404;
}

.next-question-hint {
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 20px;
}

/* Final Report */
.final-report {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.final-report h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  font-size: 2.5rem;
}

.overall-score-section {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 30px;
}

.overall-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.rating {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.questions-answered {
  color: #666;
  margin-top: 15px;
}

/* Category Scores */
.category-scores-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.category-scores-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.category-name {
  min-width: 150px;
  font-weight: 500;
  color: #333;
}

.category-bar {
  flex: 1;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.5s ease;
}

.category-score {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  color: #333;
}

/* Strengths, Improvements, Recommendations */
.strengths-section,
.improvements-section,
.recommendations-section,
.summary-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.strengths-section h2,
.improvements-section h2,
.recommendations-section h2,
.summary-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.strengths-list,
.improvements-list,
.recommendations-list {
  list-style: none;
  padding: 0;
}

.strength-item,
.improvement-item,
.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  line-height: 1.6;
}

.strength-item {
  background: #d4edda;
  color: #155724;
}

.improvement-item {
  background: #fff3cd;
  color: #856404;
}

.recommendation-item {
  background: #e7f3ff;
  color: #004085;
}

.icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.summary-text {
  color: #555;
  line-height: 1.8;
  font-size: 1.05rem;
}

/* Report Actions */
.report-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
}

.download-button,
.retake-button {
  padding: 15px 30px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.download-button {
  background: #007bff;
  color: white;
}

.download-button:hover {
  background: #0056b3;
}

.retake-button {
  background: white;
  color: #007bff;
  border: 2px solid #007bff;
}

.retake-button:hover {
  background: #007bff;
  color: white;
}

/* Error Message */
.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

/* Finish Button */
.finish-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  margin: 20px auto;
  transition: background 0.3s;
}

.finish-button:hover:not(:disabled) {
  background: #c82333;
}

.finish-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .live-interview,
  .final-report {
    padding: 10px;
  }

  .question-text {
    font-size: 1.2rem;
  }

  .score-circle {
    width: 120px;
    height: 120px;
    font-size: 2.5rem;
  }

  .category-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .category-name {
    min-width: auto;
  }

  .category-bar {
    width: 100%;
  }

  .report-actions {
    flex-direction: column;
  }

  .download-button,
  .retake-button {
    width: 100%;
  }
}
```

---

## Usage Flow

### Complete Integration Example

```javascript
// App.js or your routing file

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LiveInterview from "./components/LiveInterview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/live-interview" element={<LiveInterview />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### Step-by-Step User Flow

1. **Prerequisites**
   - User must be logged in (JWT token available)
   - User must have analyzed their resume first

2. **Start Interview**
   - User clicks "Start Interview" button
   - System generates personalized questions based on resume
   - First question is displayed

3. **Answer Questions**
   - User types answer in textarea
   - User submits answer
   - AI evaluates answer and provides feedback
   - System automatically moves to next question after 3 seconds

4. **Complete Interview**
   - After all questions are answered, user can click "Finish Interview"
   - Or system automatically finishes when last question is answered
   - Final report is generated and displayed

5. **View Report**
   - User sees overall score and rating
   - Category-wise breakdown
   - Strengths and areas for improvement
   - Personalized recommendations
   - Option to download report or retake interview

---

## Advanced Features

### Resume Session

If user refreshes the page during interview, you can resume the session:

```javascript
// Add to LiveInterview component

import { getLiveInterviewSession } from "../api/liveInterviewApi";

useEffect(() => {
  // Check if there's a session in progress
  const savedSessionId = localStorage.getItem("currentInterviewSession");

  if (savedSessionId) {
    resumeSession(savedSessionId);
  }
}, []);

const resumeSession = async (sessionId) => {
  try {
    const response = await getLiveInterviewSession(sessionId);

    setSessionId(sessionId);
    setQuestions(response.data.data.questions || []);
    setCurrentQuestion(response.data.data.currentQuestion);
    setCurrentQuestionIndex(response.data.data.currentQuestionIndex);
    setInterviewStarted(true);

    if (response.data.data.isCompleted) {
      // Fetch final report
      const reportResponse = await finishLiveInterview(sessionId);
      setFinalReport(reportResponse.data.data);
      setInterviewCompleted(true);
    }
  } catch (err) {
    console.error("Failed to resume session:", err);
    localStorage.removeItem("currentInterviewSession");
  }
};

// Save session ID when interview starts
const handleStartInterview = async () => {
  // ... existing code ...
  localStorage.setItem("currentInterviewSession", response.data.data.sessionId);
};

// Clear session when interview completes
const handleFinishInterview = async () => {
  // ... existing code ...
  localStorage.removeItem("currentInterviewSession");
};
```

---

### Timer for Each Question

Add a timer to track how long user takes per question:

```javascript
// Add to LiveInterview component

const [timeSpent, setTimeSpent] = useState(0);
const [timerInterval, setTimerInterval] = useState(null);

useEffect(() => {
  if (currentQuestion && !evaluation) {
    // Start timer
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    return () => clearInterval(interval);
  } else {
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  }
}, [currentQuestion, evaluation]);

// Reset timer when moving to next question
useEffect(() => {
  setTimeSpent(0);
}, [currentQuestionIndex]);

// Display timer in QuestionDisplay component
<div className="timer">
  Time: {Math.floor(timeSpent / 60)}:
  {(timeSpent % 60).toString().padStart(2, "0")}
</div>;
```

---

### Voice Input (Optional)

Add voice-to-text capability for answers:

```javascript
// Add to AnswerInput component

const [isRecording, setIsRecording] = useState(false);
const [recognition, setRecognition] = useState(null);

useEffect(() => {
  if ("webkitSpeechRecognition" in window) {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer((prev) => prev + " " + transcript);
    };

    setRecognition(recognition);
  }
}, []);

const toggleRecording = () => {
  if (isRecording) {
    recognition.stop();
    setIsRecording(false);
  } else {
    recognition.start();
    setIsRecording(true);
  }
};

// Add button in AnswerInput
<button onClick={toggleRecording} className="voice-button" type="button">
  {isRecording ? "🔴 Stop Recording" : "🎤 Voice Input"}
</button>;
```

---

## Error Handling

### Common Errors and Solutions

1. **"Please analyze resume first"**
   - Solution: Redirect user to resume analysis page

   ```javascript
   if (error === "Please analyze resume first") {
     navigate("/resume-analysis");
   }
   ```

2. **"Session not found"**
   - Solution: Clear local storage and restart interview

   ```javascript
   localStorage.removeItem("currentInterviewSession");
   setInterviewStarted(false);
   ```

3. **"Unauthorized access to session"**
   - Solution: User trying to access another user's session

   ```javascript
   alert("This session does not belong to you");
   navigate("/live-interview");
   ```

4. **Network errors**
   - Solution: Implement retry logic
   ```javascript
   const retryRequest = async (fn, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fn();
       } catch (err) {
         if (i === retries - 1) throw err;
         await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   };
   ```

---

## Testing

### Test Checklist

- [ ] Start interview without resume analysis (should show error)
- [ ] Start interview with resume analysis (should generate questions)
- [ ] Submit empty answer (should show validation error)
- [ ] Submit valid answer (should show evaluation)
- [ ] Navigate through all questions
- [ ] Finish interview (should show final report)
- [ ] Resume session after page refresh
- [ ] Test with different screen sizes (responsive)
- [ ] Test error scenarios (network failure, invalid session)

### Sample Test Data

```javascript
// Mock response for testing (matches axios response structure)
const mockStartResponse = {
  data: {
    success: true,
    data: {
      sessionId: "test-session-123",
      questions: [
        {
          id: "q1",
          question: "Tell me about your experience with React",
          category: "Technical",
          difficulty: "Medium",
        },
        {
          id: "q2",
          question: "Describe a challenging project",
          category: "Behavioral",
          difficulty: "Medium",
        },
      ],
      firstQuestion: {
        id: "q1",
        question: "Tell me about your experience with React",
        category: "Technical",
        difficulty: "Medium",
      },
    },
  },
};
```

---

## Performance Optimization

### Best Practices

1. **Lazy Loading**

   ```javascript
   const FinalReport = React.lazy(() => import("./components/FinalReport"));
   ```

2. **Memoization**

   ```javascript
   const QuestionDisplay = React.memo(
     ({ question, questionNumber, totalQuestions }) => {
       // component code
     },
   );
   ```

3. **Debounce Answer Input**

   ```javascript
   import { debounce } from "lodash";

   const debouncedSetAnswer = debounce((value) => {
     setAnswer(value);
   }, 300);
   ```

4. **Optimize Re-renders**
   ```javascript
   const handleSubmitAnswer = useCallback(async () => {
     // submit logic
   }, [sessionId, answer]);
   ```

---

## Security Considerations

1. **Token Management**
   - Store JWT token securely (httpOnly cookies preferred)
   - Refresh token before expiry
   - Clear token on logout

2. **Input Validation**
   - Validate answer length (min/max characters)
   - Sanitize user input before sending to API
   - Prevent XSS attacks

3. **Session Security**
   - Validate session ownership on backend
   - Implement session timeout
   - Clear sensitive data from localStorage on completion

---

## Deployment Notes

### Environment Variables

Create a `.env` file in your React project:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
REACT_APP_INTERVIEW_TIMEOUT=3600000
```

### Production Configuration

```javascript
// config.js
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://api.yourapp.com/api/v1";
export const INTERVIEW_TIMEOUT =
  process.env.REACT_APP_INTERVIEW_TIMEOUT || 3600000;
```

---

## Troubleshooting

### Issue: Questions not loading

**Solution:** Check if resume analysis is completed. Call resume analysis API first.

### Issue: Evaluation taking too long

**Solution:** AI evaluation can take 2-5 seconds. Show loading indicator to user.

### Issue: Session lost on refresh

**Solution:** Implement session persistence using localStorage and resume functionality.

### Issue: CORS errors

**Solution:** Ensure backend has proper CORS configuration:

```javascript
// Backend: src/app.ts
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
```

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Fetch API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [JWT Authentication](https://jwt.io/introduction)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## Support

For issues or questions:

- Check API documentation: `API_TESTING_GUIDE.md`
- Review backend code: `src/services/liveInterview/`
- Test endpoints using Postman collection

---

**Last Updated:** February 2026

**Version:** 1.0.0
