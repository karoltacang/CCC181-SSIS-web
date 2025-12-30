# Student Information System (SSIS)

A full-stack web application built with a Flask backend and a React frontend.

## Project Structure

- `backend/`: Flask API and server logic.
- `frontend/`: React user interface.

## Prerequisites

- Python 3.12
- Node.js & npm
- PostgreSQL

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies and activate the virtual environment using Pipenv:
```bash
pipenv install
pipenv shell
```

Set up environment variables:
Create a `.env` file in the `backend` directory with the following content:

```ini
DB_HOST="host"
DB_PORT="port"
DB_NAME="name"
DB_USERNAME="username"
DB_PASSWORD="password"
DB_SSLMODE="require"

SECRET_KEY="your_secret_key"
JWT_SECRET_KEY="your_jwt_secret_key"

BOOTSTRAP_SERVE_LOCAL=True
PIPENV_VENV_IN_PROJECT=1

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_key"
```

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend/app
```

Install dependencies:
```bash
npm install
```

### Building

To integrate with the Flask backend:

1. Run the build command:
   ```bash
   npm run build
   ```
2. Copy the contents of the `dist` folder to the backend's static folder (`backend/app/static`).

## Running the Application

After building the frontend and copying the static files, run the backend normally:
```bash
cd backend
pipenv shell
flask run
```
