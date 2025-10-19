# Guardian AI - System Architecture

## Overview

Guardian AI is a privacy-preserving real-time interpreter built on a hybrid architecture: local-first processing with optional cloud reasoning.

## Audio Pipeline

### 1. Capture Layer
```
Microphone → Native Audio Bridge → Circular Buffer (24h)
                                    ↓
                              AES-GCM Encryption
```

**Components**:
- iOS: AVAudioEngine (44.1kHz, mono, 16-bit PCM)
- Android: AudioRecord (same specs)
- Buffer: Ring buffer with automatic overwrite
- Encryption: AES-256-GCM with device-specific key

### 2. Detection Layer
```
Audio Stream → VAD → Speaker Diarization → Topic Segmentation
                ↓
           Wake Word Detection
```

**Models**:
- **VAD**: Silero VAD (8ms chunks, 95% accuracy)
- **Diarization**: ECAPA-TDNN quantized (int8)
- **Wake Words**: Porcupine ("Hey Guardian", "Help me")
- **Embeddings**: MiniLM-L6 for topic boundary detection

### 3. Processing Layer
```
Topic Segment (90s) → On-Device ASR → Transcript + Metadata
                                       ↓
                              Backend Transmission (optional)
```

**Payload Structure**:
```json
{
  "transcript": "speaker-tagged text",
  "metadata": {
    "duration": 90,
    "speakers": 2,
    "confidence": 0.92,
    "timestamp": "2025-10-11T00:52:00Z"
  },
  "audioTail": "base64_20s_clip"  // Only if confidence < 0.8
}
```

## Backend Architecture

### Microservices

```
Mobile App → API Gateway (FastAPI)
              ↓
         ┌────┴────┬────────┬──────────┐
         ↓         ↓        ↓          ↓
      ASR      Intent   LLM Orch   Memory
    Service   Router   Service      DB
```

### 1. ASR Service
- **Input**: Audio tail (base64)
- **Model**: OpenAI Whisper API (large-v3)
- **Output**: Transcript with timestamps
- **Latency**: ~500ms

### 2. Intent Router
- **Input**: Transcript + metadata
- **Model**: Fine-tuned BERT (medical/financial/legal/general)
- **Output**: Intent class + confidence
- **Latency**: ~100ms

### 3. LLM Orchestrator
- **Providers**: GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro
- **Routing**: Based on intent (medical→Claude, legal→GPT-4o)
- **Prompt Template**:
```
You are a protective AI guardian. The user is in a {context} situation.
Transcript: {transcript}
Provide ONE brief, actionable suggestion (max 30 words).
```
- **Latency**: ~1-2s

### 4. Memory DB
- **Database**: PostgreSQL 16 + pgvector
- **Schema**:
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID,
  transcript TEXT,
  embedding vector(384),
  intent VARCHAR(50),
  timestamp TIMESTAMPTZ,
  metadata JSONB
);
```
- **Retention**: 7 days (configurable)
- **No Audio Storage**: Text only

## Security Architecture

### Transport Layer
```
Mobile App ←→ TLS 1.3 ←→ API Gateway
              (mTLS)
```

### Authentication
- **JWT**: Short-lived tokens (5-min expiry)
- **Refresh**: Secure refresh token (7-day expiry)
- **Device Binding**: Token tied to device ID

### Encryption
- **At Rest**: AES-256-GCM (device keychain)
- **In Transit**: TLS 1.3
- **Payload**: Additional layer of E2EE for audio tails

## Privacy Guarantees

1. **Local-First**: All audio stays on device unless user approves transmission
2. **Ephemeral Processing**: Backend deletes audio immediately after ASR
3. **Minimal Data**: Only text + metadata stored (no audio)
4. **User Control**: TTL, consent mode, instant wipe
5. **Transparency**: Full transmission audit log

## Scalability

### Current Limits
- 10K concurrent users
- 100 req/s per service
- 50ms p95 latency

### Scaling Strategy
- Horizontal: Kubernetes autoscaling
- Database: Read replicas + connection pooling
- Caching: Redis for frequent intents
- CDN: Static assets + model artifacts

## Deployment

```
Production Stack:
├── Frontend: Expo EAS Build
├── Backend: AWS ECS Fargate
├── Database: AWS RDS PostgreSQL
├── Cache: AWS ElastiCache Redis
├── Storage: AWS S3 (temp audio processing)
└── Monitoring: DataDog + Sentry
```

## Future Enhancements

1. **Offline Mode**: On-device Phi-3-mini for reasoning
2. **Wearables**: Apple Watch / Android Wear integration
3. **Multi-Language**: Whisper multilingual support
4. **Planner Modules**: Gym, nutrition, schedule assistants
5. **Voice Cloning**: Personalized TTS output
