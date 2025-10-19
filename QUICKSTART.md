# Guardian AI - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose (optional, for backend)
- iOS: Xcode 15+ and CocoaPods
- Android: Android Studio and JDK 17+

## Option 1: Mobile App Only (Demo Mode)

The mobile app works standalone with mock backend responses.

```bash
# Clone repository
git clone https://github.com/your-org/guardian-ai.git
cd guardian-ai

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

**What you get:**
- ✅ Full UI with status indicators
- ✅ Audio recording (expo-av)
- ✅ Privacy settings and controls
- ✅ Mock AI guidance responses
- ✅ Topic cards and conversation history

**Limitations:**
- No real ASR (transcription is simulated)
- No real LLM reasoning (responses are templated)
- No 24-hour circular buffer (basic recording only)
- No wake word detection

## Option 2: Full Stack (Backend + Mobile)

### Step 1: Start Backend Services

```bash
cd backend

# Copy environment template
cp ../.env.example .env

# Edit .env and add your API keys:
# - OPENAI_API_KEY (for Whisper ASR)
# - ANTHROPIC_API_KEY (for Claude reasoning)

# Start all services with Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f backend
```

**Services started:**
- PostgreSQL (port 5432) with pgvector
- Redis (port 6379)
- FastAPI backend (port 8000)
- pgAdmin (port 5050) - optional database UI

### Step 2: Initialize Database

```bash
# Database schema is auto-applied on first start
# Verify it worked:
docker-compose exec postgres psql -U guardian -d guardian_ai -c "\dt"

# You should see tables: users, conversations, guidance, transmissions
```

### Step 3: Test Backend

```bash
# Health check
curl http://localhost:8000/v1/health

# Test guidance endpoint
curl -X POST http://localhost:8000/v1/guidance/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo_token" \
  -d '{
    "transcript": "The doctor prescribed 500mg twice daily",
    "metadata": {
      "duration": 30,
      "speakers": 2,
      "confidence": 0.92,
      "timestamp": "2025-10-11T00:52:00Z"
    }
  }'
```

### Step 4: Connect Mobile App to Backend

```bash
# In mobile app root directory
# Edit services/mockBackend.ts and replace with real API calls:

# Change this:
export const API_BASE_URL = 'http://localhost:8000/v1'; // iOS simulator
# or
export const API_BASE_URL = 'http://10.0.2.2:8000/v1'; // Android emulator

# Restart mobile app
npm start
```

## Option 3: Production Build

### Backend Deployment

```bash
# Build Docker image
docker build -t guardian-ai-backend ./backend

# Push to registry
docker tag guardian-ai-backend your-registry/guardian-ai-backend
docker push your-registry/guardian-ai-backend

# Deploy to cloud (AWS ECS example)
aws ecs update-service \
  --cluster guardian-cluster \
  --service guardian-backend \
  --force-new-deployment
```

### Mobile App Deployment

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Troubleshooting

### Mobile App

**Issue: "Audio recording failed"**
```bash
# iOS: Check microphone permissions in Settings > Privacy
# Android: Check app permissions in Settings > Apps > Guardian AI
```

**Issue: "Cannot connect to backend"**
```bash
# iOS Simulator: Use http://localhost:8000
# Android Emulator: Use http://10.0.2.2:8000
# Physical Device: Use your computer's local IP (e.g., http://192.168.1.100:8000)
```

### Backend

**Issue: "Database connection failed"**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart service
docker-compose restart postgres
```

**Issue: "OpenAI API error"**
```bash
# Verify API key is set
docker-compose exec backend env | grep OPENAI_API_KEY

# Check API key is valid
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## Next Steps

1. **Customize Privacy Settings**
   - Open app → Settings → Adjust TTL and consent mode
   - Test "Nuke Data" button

2. **Test Guidance Flow**
   - Tap microphone button to start listening
   - Speak: "The doctor prescribed medication"
   - Wait for AI guidance modal

3. **Explore API**
   - Visit http://localhost:8000/docs for Swagger UI
   - Test endpoints interactively

4. **View Database**
   - Open http://localhost:5050 (pgAdmin)
   - Login: admin@guardian.ai / admin
   - Connect to PostgreSQL: guardian / guardian_dev

5. **Read Documentation**
   - [Architecture](docs/ARCHITECTURE.md) - System design
   - [Privacy](docs/PRIVACY.md) - Data handling and compliance
   - [API](docs/API.md) - Endpoint reference
   - [Testing](docs/TESTING.md) - Test suite guide
   - [Deployment](docs/DEPLOYMENT.md) - Production deployment

## Demo Scenarios

### Medical Consultation
```
You: "The doctor said to take 500mg twice daily"
AI: "Ask about potential side effects and drug interactions."
```

### Bank Meeting
```
You: "The account has a monthly maintenance fee"
AI: "Request a detailed breakdown of all fees and charges."
```

### Legal Situation
```
You: "The officer asked for my license and registration"
AI: "You have the right to remain silent. Consider requesting legal counsel."
```

## Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@guardian.ai
- **Discord**: discord.gg/guardian-ai

## License

MIT - See LICENSE file for details
