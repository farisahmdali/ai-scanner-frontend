# AI Resume Scanner - Frontend

A  React-based frontend application for scanning and analyzing resumes using AI technology.

## 🚀 Technologies Used

### Core Framework
- **React** (v19.2.0) - UI library for building user interfaces
- **TypeScript** (v5.9.3) - Type-safe JavaScript for better code quality
- **Vite** (v7.2.4) - Fast build tool and development server

### UI Framework & Styling
- **Ant Design** (v6.1.4) - Enterprise-class UI design language and React UI library
- **Tailwind CSS** (v4.1.18) - Utility-first CSS framework

### Routing & Navigation
- **React Router DOM** (v7.12.0) - Declarative routing for React applications

### HTTP Client
- **Axios** (v1.13.2) - Promise-based HTTP client for making API requests

### Data Visualization
- **Chart.js** (v4.4.0) - Simple yet flexible JavaScript charting library
- **react-chartjs-2** (v5.3.1) - React wrapper for Chart.js

### Development Tools
- **ESLint** (v9.39.1) - Code linting and quality checking
- **TypeScript ESLint** (v8.46.4) - TypeScript-specific linting rules

## 📦 Installation

```bash
npm install
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Starts the development server (usually at `http://localhost:5173`)

### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `dist` directory

### Preview Production Build
```bash
npm run preview
```
Preview the production build locally

### Linting
```bash
npm run lint
```
Run ESLint to check code quality

## 🔧 Environment Variables

Create a `.env` file in the root of the frontend directory to configure environment-specific variables.

### Available Environment Variables

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `VITE_API_BASE_URL` | Base URL for the backend API | `http://localhost:3000/api/v1` | No |

### Example `.env` file

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Production Example

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

> **Note:** In Vite, environment variables must be prefixed with `VITE_` to be exposed to the client-side code. This is a security feature to prevent accidentally exposing sensitive server-side variables.

## 📁 Project Structure

```
src/
├── layout/          # Layout components (sidebar, header)
├── pages/           # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ResumeScanner.tsx
│   ├── JobRoles.tsx
│   ├── ScanHistory.tsx
│   └── NotFound.tsx
├── utils/           # Utility functions
│   └── axios.ts     # Axios instance configuration
├── App.tsx          # Main app component with routing
└── main.tsx         # Application entry point
```

## 📊 Features

- User registration and login
- Resume upload and AI-powered skill extraction
- Job role management with required skills
- Skill matching and comparison with visual charts
- Scan history with pagination and search
- Responsive design with Ant Design components
