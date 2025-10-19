# Testing Guide

## Mobile App Testing

### Unit Tests
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### Example Test: AudioContext
```typescript
// contexts/__tests__/AudioContext.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { AudioProvider, useAudio } from '../AudioContext';

describe('AudioContext', () => {
  it('should start and stop recording', async () => {
    const { result } = renderHook(() => useAudio(), {
      wrapper: AudioProvider,
    });

    expect(result.current.isRecording).toBe(false);

    await act(async () => {
      await result.current.startListening();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.status).toBe('listening');

    await act(async () => {
      await result.current.stopListening();
    });

    expect(result.current.isRecording).toBe(false);
  });

  it('should nuke data', async () => {
    const { result } = renderHook(() => useAudio(), {
      wrapper: AudioProvider,
    });

    await act(async () => {
      await result.current.nukeData();
    });

    expect(result.current.bufferDuration).toBe(0);
  });
});
```

### E2E Tests (Detox)
```bash
# Install Detox
npm install --save-dev detox

# Configure
detox init

# Run E2E tests
detox test --configuration ios.sim.debug
```

### Example E2E Test
```typescript
// e2e/guidance.test.ts
describe('Guidance Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show guidance modal when asking question', async () => {
    await element(by.id('ask-input')).typeText('What did the doctor say?');
    await element(by.id('ask-button')).tap();
    
    await waitFor(element(by.id('guidance-modal')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.id('guidance-content'))).toBeVisible();
  });
});
```

## Backend Testing

### Unit Tests (pytest)
```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

### Example Test: Intent Classification
```python
# backend/tests/test_intent.py
import pytest
from main import classify_intent

def test_medical_intent():
    transcript = "The doctor prescribed 500mg twice daily"
    intent = classify_intent(transcript)
    assert intent == "medical"

def test_financial_intent():
    transcript = "The bank charges a monthly fee"
    intent = classify_intent(transcript)
    assert intent == "financial"

def test_legal_intent():
    transcript = "The police officer asked for my license"
    intent = classify_intent(transcript)
    assert intent == "legal"
```

### API Tests
```python
# backend/tests/test_api.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_process_guidance():
    response = client.post(
        "/v1/guidance/process",
        json={
            "transcript": "The doctor mentioned side effects",
            "metadata": {
                "duration": 30,
                "speakers": 2,
                "confidence": 0.92,
                "timestamp": "2025-10-11T00:52:00Z"
            }
        },
        headers={"Authorization": "Bearer test_token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "suggestion"
    assert "side effects" in data["content"].lower()

def test_health_check():
    response = client.get("/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

## Integration Tests

### Database Tests
```python
# backend/tests/test_database.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def db_session():
    engine = create_engine("postgresql://test:test@localhost/test_db")
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_create_conversation(db_session):
    conversation = Conversation(
        user_id="test_user",
        transcript="Test conversation",
        intent="general",
        confidence=0.95
    )
    db_session.add(conversation)
    db_session.commit()
    
    assert conversation.id is not None
```

### WebSocket Tests
```python
# backend/tests/test_websocket.py
from fastapi.testclient import TestClient
from main import app

def test_websocket_stream():
    client = TestClient(app)
    with client.websocket_connect("/v1/stream") as websocket:
        # Send auth
        websocket.send_json({"type": "auth", "token": "test_token"})
        
        # Send audio chunk
        websocket.send_json({
            "type": "audio",
            "data": "base64_audio",
            "metadata": {"timestamp": 1728614400}
        })
        
        # Receive guidance
        data = websocket.receive_json()
        assert data["type"] == "guidance"
```

## Performance Tests

### Load Testing (Locust)
```python
# backend/tests/locustfile.py
from locust import HttpUser, task, between

class GuardianUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def process_guidance(self):
        self.client.post(
            "/v1/guidance/process",
            json={
                "transcript": "Test conversation",
                "metadata": {
                    "duration": 30,
                    "speakers": 1,
                    "confidence": 0.95,
                    "timestamp": "2025-10-11T00:52:00Z"
                }
            },
            headers={"Authorization": "Bearer test_token"}
        )
```

Run load test:
```bash
locust -f backend/tests/locustfile.py --host=http://localhost:8000
```

## Security Tests

### Penetration Testing
```bash
# OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.guardian.ai

# SQL Injection Test
sqlmap -u "https://api.guardian.ai/v1/conversations?id=1" \
  --cookie="session=..." --batch
```

### Dependency Scanning
```bash
# Python
pip install safety
safety check

# Node.js
npm audit
npm audit fix
```

## Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user flows (record → guidance → dismiss)
- **Load Tests**: 100 req/s sustained, p95 < 200ms
- **Security Tests**: OWASP Top 10 vulnerabilities checked

## Continuous Testing

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Run tests
        run: pytest --cov=backend
```
