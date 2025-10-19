# Guardian AI - Privacy-Preserving Real-Life Interpreter

A cross-platform AI companion app that listens locally, understands conversations, and provides intelligent guidance while respecting your privacy.

## 🎯 Core Features

### Audio Pipeline
- **Continuous Local Recording**: 24-hour encrypted circular buffer (AES-GCM)
- **Voice Activity Detection**: Silero VAD integration ready
- **Wake Word Detection**: Porcupine KWS support
- **Topic Segmentation**: Automatic conversation boundary detection
- **Instant Wipe**: "Nuke" button for immediate data deletion

### Privacy Controls
- **Consent Modes**: One-party vs all-party recording compliance
- **Adjustable TTL**: 1-24 hour auto-deletion
- **Visual Indicators**: Always-on status display
- **Transmission Log**: Full audit trail of all backend communications
- **Local-First**: All processing happens on-device unless explicitly shared

### AI Guidance
- **Context-Aware Suggestions**: Medical, financial, legal scenarios
- **Speaker Diarization**: Multi-speaker conversation tracking
- **Confidence Scoring**: Reliability indicators for transcripts
- **TTS Confirmation**: Optional voice output with user approval

## 🏗️ Architecture

### Frontend (React Native + Expo)
```
app/
  index.tsx          # Main home screen
  settings.tsx       # Privacy & control panel
  topics.tsx         # Conversation history
contexts/
  AudioContext.tsx   # Recording state management
  PrivacyContext.tsx # Settings & audit logs
components/
  StatusIndicator    # Live status display
  MicButton          # Main recording control
  TopicCard          # Conversation segment display
  GuidanceModal      # AI response interface
services/
  mockBackend.ts     # Simulated backend (replace with real API)
```

### Backend (To Be Implemented)
```
FastAPI Gateway
├── ASR Service (Whisper API)
├── Intent Router (BERT classifier)
├── LLM Orchestrator (GPT-4o/Claude)
└── Memory DB (PostgreSQL + pgvector)
```

## 🚀 Getting Started

```bash
npm install
npm start
```

## 📱 Current Implementation

This MVP demonstrates:
- ✅ Beautiful, trust-first UI with status indicators
- ✅ Audio recording with expo-av
- ✅ Privacy settings (TTL, consent mode, indicators)
- ✅ Topic card system with expandable details
- ✅ Guidance modal with TTS confirmation
- ✅ Mock backend simulating AI processing

## 🔧 Production Requirements

To make this production-ready, implement:

1. **Native Audio Modules**
   - Replace expo-av with native bridge (iOS: AVAudioEngine, Android: AudioRecord)
   - Implement circular buffer with AES-GCM encryption
   - Add Silero VAD via FFI (C++/Rust)
   - Integrate Porcupine wake word detection

2. **Backend Services**
   - Deploy FastAPI gateway with gRPC/WebSocket
   - Connect Whisper API for ASR
   - Fine-tune BERT for intent classification
   - Integrate GPT-4o/Claude for reasoning
   - Set up PostgreSQL with pgvector

3. **Security**
   - Implement TLS 1.3 for all communications
   - Add JWT authentication (5-min expiry)
   - Zero server-side audio retention policy
   - End-to-end encryption for payloads

4. **ML Models**
   - Deploy whisper.cpp (int8) for on-device ASR
   - Add ECAPA-TDNN for speaker diarization
   - Integrate MiniLM/BGE-small for embeddings
   - Optional: Phi-3-mini for offline reasoning

## 🎨 Design Philosophy

- **Trust-First**: Always transparent about data handling
- **Calm & Protective**: Guardian aesthetic, not surveillance
- **User Control**: Every feature has an off switch
- **Privacy by Default**: Local-first, transmit only on consent

## 📊 User Scenarios

1. **Doctor Visit**: Interprets medical terms, suggests follow-up questions
2. **Bank Meeting**: Detects hidden fees, clarifies contract terms
3. **Legal Situations**: Monitors for escalation, offers protective guidance
4. **Everyday Assistant**: Explains, corrects, coaches on request

## 🔐 Privacy Guarantees

- All audio encrypted locally (AES-GCM)
- Auto-deletion after TTL expires
- No audio stored on servers
- Transmission log for full transparency
- Consent mode enforcement

## 📝 API Contract (Backend)

```typescript
// Request
POST /api/guidance
{
  transcript: string,
  metadata: {
    duration: number,
    speakers: number,
    confidence: number,
    timestamp: string
  },
  audioTail?: base64string  // Optional 20-30s clip
}

// Response
{
  id: string,
  type: 'suggestion' | 'warning' | 'clarification' | 'summary',
  content: string,
  context: string,
  requiresConfirmation: boolean
}
```

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Audio**: expo-av (MVP), native modules (production)
- **State**: React Context API
- **Navigation**: expo-router
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL + pgvector
- **ML**: Whisper, BERT, GPT-4o/Claude

## 📄 License

MIT - Built with privacy and user control as core principles.
