# HEXASHIELD - Installation & Setup Guide

Follow these steps to deploy the AI-Assisted Ethical Penetration Testing Platform for local development and demonstration.

## 1. Prerequisites
- **Python**: 3.9 or higher
- **Node.js**: 18.0 or higher
- **NPM**: 9.0 or higher

## 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy passlib[bcrypt] python-jose[cryptography] python-dotenv pydantic requests
   ```
4. Initialize and seed the database:
   ```bash
   python -m database.db
   python -m database.seed
   ```
5. Start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`

## 4. Default Credentials
| Username | Password | Role |
|----------|----------|------|
| `admin`  | `admin123`  | Administrator |
| `analyst`| `analyst123`| Security Analyst |

## 5. Troubleshooting
- **CORS Errors**: Ensure the backend is running on `http://localhost:8000`.
- **Database Locked**: Close any external SQLite viewers before running scans.
- **Port Conflict**: If port 8000 is busy, use `--port <new_port>` and update `apiClient.js`.
