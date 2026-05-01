# Mackron AI - Web Application Testing Agent

AI-powered web application testing agent that automatically generates and executes comprehensive test scenarios for any web feature.

## Features

- **Smart Test Generation**: Automatically creates positive, negative, boundary, and edge-case test scenarios
- **Browser Automation**: Uses Playwright for reliable, cross-browser test execution
- **Live Streaming**: Watch tests execute in real-time via SSE (Server-Sent Events)
- **Detailed Reports**: HTML reports with screenshots, timing, pass/fail status for every step
- **Hybrid AI**: Rule-based test patterns with optional LLM enhancement (OpenAI/Claude)
- **Feature Coverage**: Login, Forms, CRUD, Navigation, Validation, Search

## Architecture

| Component | Technology |
|-----------|-----------|
| Frontend | Angular 19 (Zoneless, Signals, Standalone) |
| Backend | Spring Boot 3.x, Java 17 |
| Browser Engine | Playwright (Java) |
| Deployment | Vercel (frontend) + Render (backend) |

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- npm 9+

### Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npx ng serve
```

The UI starts at `http://localhost:4200`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tests/execute` | Submit a test request |
| GET | `/api/tests/{id}/stream` | SSE stream of test progress |
| GET | `/api/tests/{id}/report` | JSON test report |
| GET | `/api/tests/{id}/report/html` | HTML test report |
| GET | `/api/tests/history` | Recent test runs |
| GET | `/api/health` | Health check |

## Test Pattern Library

- **Login**: Valid/invalid credentials, SQL injection, XSS, boundary inputs, double-click, back button
- **Form/Registration**: Required fields, email/phone validation, max length, special characters
- **CRUD**: Create/read/update/delete with valid and invalid data, empty states
- **Navigation**: Broken links, 404 handling, back/forward, page load performance
- **Validation**: Inline errors, blur validation, min/max boundaries, paste handling
- **Search**: Valid queries, empty search, no results, special characters

## Deployment

### Backend (Render)

1. Push to GitHub
2. Connect repository to Render
3. Select Docker runtime
4. Set environment variables
5. Deploy

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Set `API_URL` environment variable
5. Deploy
