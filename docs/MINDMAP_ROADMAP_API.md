# Mind Map & Roadmap API Documentation

## Overview

This API provides two features:

1. **CV-Based Mind Map**: Generates a learning mind map based on user's resume analysis
2. **Technology Roadmap**: Generates a learning roadmap for any technology

## Endpoints

### 1. Generate CV-Based Mind Map

**Endpoint:** `GET /api/v1/mindmap/cv-mindmap`

**Description:** Generates a personalized learning mind map based on the user's CV analysis. Identifies skill gaps, areas for improvement, and suggests topics to practice.

**Authentication:** Required (Bearer Token)

**Request:**

```http
GET /api/v1/mindmap/cv-mindmap
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Mind map generated successfully",
  "data": {
    "title": "Learning Path for Full Stack Developer",
    "nodes": [
      {
        "id": "1",
        "label": "Technical Skills to Improve",
        "children": [
          {
            "id": "1.1",
            "label": "Backend Development",
            "children": [
              {
                "id": "1.1.1",
                "label": "Database Optimization"
              },
              {
                "id": "1.1.2",
                "label": "API Security"
              }
            ]
          }
        ]
      },
      {
        "id": "2",
        "label": "Soft Skills Development",
        "children": [
          {
            "id": "2.1",
            "label": "Communication",
            "children": [
              {
                "id": "2.1.1",
                "label": "Technical Writing"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**

404 - Profile Not Found:

```json
{
  "success": false,
  "message": "Profile not found"
}
```

400 - Resume Analysis Not Found:

```json
{
  "success": false,
  "message": "Resume analysis not found. Please analyze your resume first."
}
```

**Prerequisites:**

- User must have uploaded a resume
- Resume must be analyzed (call `/api/v1/profile/resume/analyze` first)

---

### 2. Generate Technology Roadmap

**Endpoint:** `POST /api/v1/mindmap/tech-roadmap`

**Description:** Generates a comprehensive learning roadmap for any technology. Does not require CV data - works based on user's chosen technology and experience level.

**Authentication:** Required (Bearer Token)

**Request:**

```http
POST /api/v1/mindmap/tech-roadmap
Authorization: Bearer <token>
Content-Type: application/json

{
  "technology": "React",
  "experienceLevel": "beginner"
}
```

**Request Body Parameters:**

- `technology` (required): Name of the technology (e.g., "React", "Node.js", "Python", "Docker")
- `experienceLevel` (optional): User's experience level - "beginner", "intermediate", or "advanced" (default: "beginner")

**Response:**

```json
{
  "success": true,
  "message": "Technology roadmap generated successfully",
  "data": {
    "technology": "React",
    "phases": [
      {
        "phase": "Phase 1: Fundamentals",
        "duration": "2-4 weeks",
        "topics": [
          "JSX and Components",
          "Props and State",
          "Event Handling",
          "Conditional Rendering",
          "Lists and Keys"
        ],
        "resources": [
          "Official React Documentation - Getting Started",
          "React Tutorial for Beginners by freeCodeCamp",
          "Build a Todo App project"
        ]
      },
      {
        "phase": "Phase 2: Intermediate Concepts",
        "duration": "3-5 weeks",
        "topics": [
          "Hooks (useState, useEffect, useContext)",
          "Component Lifecycle",
          "Forms and Controlled Components",
          "React Router",
          "API Integration"
        ],
        "resources": [
          "React Hooks Documentation",
          "Build a Weather App with API integration",
          "React Router Tutorial"
        ]
      },
      {
        "phase": "Phase 3: Advanced Patterns",
        "duration": "4-6 weeks",
        "topics": [
          "Custom Hooks",
          "Context API and State Management",
          "Performance Optimization",
          "Code Splitting and Lazy Loading",
          "Testing with Jest and React Testing Library"
        ],
        "resources": [
          "Advanced React Patterns course",
          "Build an E-commerce application",
          "React Performance Optimization Guide"
        ]
      },
      {
        "phase": "Phase 4: Expert Level",
        "duration": "6-8 weeks",
        "topics": [
          "Server-Side Rendering (Next.js)",
          "State Management Libraries (Redux, Zustand)",
          "TypeScript with React",
          "Advanced Testing Strategies",
          "Production Deployment and CI/CD"
        ],
        "resources": [
          "Next.js Documentation",
          "Build a full-stack application with Next.js",
          "TypeScript + React Best Practices"
        ]
      }
    ]
  }
}
```

**Error Responses:**

400 - Missing Technology:

```json
{
  "success": false,
  "message": "Technology name is required"
}
```

500 - Generation Failed:

```json
{
  "success": false,
  "message": "Failed to generate technology roadmap",
  "error": "Error details"
}
```

---

## Usage Examples

### Example 1: Get CV-Based Mind Map

```javascript
// First, ensure resume is analyzed
const analyzeResponse = await fetch("/api/v1/profile/resume/analyze", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Then generate mind map
const mindMapResponse = await fetch("/api/v1/mindmap/cv-mindmap", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const mindMapData = await mindMapResponse.json();
console.log(mindMapData.data.nodes);
```

### Example 2: Get Technology Roadmap

```javascript
const roadmapResponse = await fetch("/api/v1/mindmap/tech-roadmap", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    technology: "Docker",
    experienceLevel: "intermediate",
  }),
});

const roadmapData = await roadmapResponse.json();
console.log(roadmapData.data.phases);
```

---

## Features

### CV-Based Mind Map

- Analyzes user's resume data (skills, strengths, weaknesses)
- Identifies skill gaps and improvement areas
- Suggests complementary skills to learn
- Organizes learning topics hierarchically
- Personalized to user's career profile

### Technology Roadmap

- Works independently without CV data
- Supports any technology/framework
- Adjusts difficulty based on experience level
- Provides structured learning phases
- Includes practical resources and project ideas
- Realistic time estimates for each phase

---

## Notes

1. Both endpoints use Groq AI service for generation
2. Mind maps are generated on-demand and not stored in the database
3. Roadmaps are also generated fresh each time (no caching)
4. Generation typically takes 3-10 seconds depending on complexity
5. The CV-based mind map requires prior resume analysis
6. Technology roadmaps can be generated for any valid technology name

---

## Integration with Frontend

### Visualizing Mind Maps

The mind map data structure is hierarchical and can be visualized using libraries like:

- D3.js
- React Flow
- vis.js
- Cytoscape.js

### Displaying Roadmaps

Roadmap phases can be displayed as:

- Timeline view
- Accordion/expandable sections
- Step-by-step wizard
- Kanban board

---

## Error Handling

Always check the `success` field in the response:

```javascript
const response = await fetch("/api/v1/mindmap/cv-mindmap", {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await response.json();

if (!data.success) {
  console.error(data.message);
  // Handle error appropriately
}
```
