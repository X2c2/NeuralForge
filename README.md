# NeuralForge

AI-powered platform for content creation and automation with multiple integrations.

## Project Structure

```
neuralforge/
├── backend/          # FastAPI Python backend
├── frontend/         # Next.js React frontend  
├── browser-extension/# Chrome/Browser extension
├── mobile/          # Mobile app (future)
├── docs/            # Documentation
└── docker-compose.yml
```

## Quick Start

### 1. Start Databases
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv neuralforge_env

# Activate (Windows)
neuralforge_env\Scripts\activate
# Or activate (Mac/Linux)
source neuralforge_env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
copy .env.template .env
# Edit .env with your API keys

# Start backend
python run_dev.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment template
copy .env.local.template .env.local
# Edit .env.local with your settings

# Start frontend
npm run dev
```

## Development URLs

- Backend API: http://localhost:8000
- Frontend App: http://localhost:3000
- Database: localhost:5432
- Redis: localhost:6379

## Next Steps

1. Set up your AI API keys in backend/.env
2. Configure Stripe keys for payments
3. Start building your AI features!

🚀 Ready to forge the future with AI!