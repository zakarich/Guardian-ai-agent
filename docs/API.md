# Guardian AI - API Documentation

## Base URL
```
Production: https://api.guardian.ai/v1
Staging: https://staging-api.guardian.ai/v1
```

## Authentication

All requests require JWT bearer token:
```http
Authorization: Bearer <jwt_token>
```

### Obtain Token
```http
POST /auth/token
Content-Type: application/json

{
  "device_id": "uuid",
  "device_type": "ios|android",
  "app_version": "1.0.0"
}

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 300
}
```

## Endpoints

### 1. Process Audio Segment

Submit transcript for AI guidance.

```http
POST /guidance/process
Content-Type: application/json

{
  "transcript": "The doctor mentioned taking 500mg twice daily...",
  "metadata": {
    "duration": 90,
    "speakers": 2,
    "confidence": 0.92,
    "timestamp": "2025-10-11T00:52:00Z",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "audioTail": "base64_encoded_audio"  // Optional, only if confidence < 0.8
}

Response:
{
  "id": "guid_abc123",
  "type": "suggestion",
  "content": "Ask about potential side effects and drug interactions.",
  "context": "Medical consultation detected",
  "confidence": 0.95,
  "requiresConfirmation": true,
  "ttsUrl": "https://cdn.guardian.ai/tts/abc123.mp3"
}
```

### 2. Get Conversation History

Retrieve past conversations.

```http
GET /conversations?limit=10&offset=0&filter=medical

Response:
{
  "conversations": [
    {
      "id": "uuid",
      "startTime": "2025-10-11T00:30:00Z",
      "endTime": "2025-10-11T00:32:00Z",
      "summary": "Medical consultation about prescription",
      "speakers": 2,
      "tags": ["medical", "prescription"],
      "confidence": 0.92
    }
  ],
  "total": 45,
  "hasMore": true
}
```

### 3. Delete User Data

GDPR/CCPA compliance endpoint.

```http
DELETE /user/data
Authorization: Bearer <jwt_token>

Response:
{
  "status": "deleted",
  "deletedAt": "2025-10-11T00:52:00Z",
  "itemsDeleted": {
    "conversations": 45,
    "transmissions": 120,
    "embeddings": 45
  }
}
```

### 4. Update Privacy Settings

```http
PATCH /user/settings
Content-Type: application/json

{
  "ttl": 24,
  "consentMode": "one-party",
  "autoDelete": true,
  "showIndicators": true
}

Response:
{
  "settings": { /* updated settings */ },
  "updatedAt": "2025-10-11T00:52:00Z"
}
```

### 5. Get Transmission Log

```http
GET /user/transmissions?limit=50

Response:
{
  "transmissions": [
    {
      "id": "tx_abc123",
      "timestamp": "2025-10-11T00:52:00Z",
      "type": "text",
      "size": 1024,
      "purpose": "Intent classification",
      "endpoint": "/guidance/process",
      "status": "success"
    }
  ],
  "total": 120
}
```

## WebSocket API

Real-time streaming for continuous guidance.

### Connection
```javascript
const ws = new WebSocket('wss://api.guardian.ai/v1/stream');
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token'
}));
```

### Send Audio Chunk
```javascript
ws.send(JSON.stringify({
  type: 'audio',
  data: base64_audio_chunk,
  metadata: {
    timestamp: Date.now(),
    chunkIndex: 42
  }
}));
```

### Receive Guidance
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.type: 'guidance' | 'transcript' | 'error'
  // data.content: guidance text
};
```

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid payload |
| 401 | Unauthorized - Invalid/expired token |
| 403 | Forbidden - Insufficient permissions |
| 429 | Rate Limited - Too many requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Maintenance |

## Rate Limits

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1000 requests/hour
- **Enterprise**: Unlimited

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1728614400
```

## Data Formats

### Audio Tail Format
- **Encoding**: Base64
- **Format**: WAV, 16-bit PCM
- **Sample Rate**: 16kHz
- **Channels**: Mono
- **Duration**: 20-30 seconds

### Timestamp Format
ISO 8601: `2025-10-11T00:52:00Z`

## SDKs

### JavaScript/TypeScript
```bash
npm install @guardian-ai/sdk
```

```typescript
import { GuardianClient } from '@guardian-ai/sdk';

const client = new GuardianClient({
  apiKey: 'your_api_key'
});

const guidance = await client.processTranscript({
  transcript: '...',
  metadata: { /* ... */ }
});
```

### Python
```bash
pip install guardian-ai
```

```python
from guardian_ai import GuardianClient

client = GuardianClient(api_key='your_api_key')
guidance = client.process_transcript(
  transcript='...',
  metadata={}
)
```

## Webhooks

Subscribe to events:

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["guidance.created", "conversation.ended"]
}
```

Event payload:
```json
{
  "event": "guidance.created",
  "timestamp": "2025-10-11T00:52:00Z",
  "data": {
    "guidanceId": "uuid",
    "type": "suggestion",
    "content": "..."
  }
}
```
