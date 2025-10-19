# Privacy & Compliance Guide

## Core Principles

Guardian AI is built on **Privacy by Design**:
1. **Local-First**: All audio processing happens on your device
2. **User Control**: You decide what gets transmitted
3. **Transparency**: Full visibility into data handling
4. **Minimal Collection**: Only essential data leaves your device
5. **Zero Retention**: No audio stored on servers

## Data Lifecycle

### Phase 1: Capture (100% Local)
```
Microphone → Encrypted Buffer → Auto-Delete after TTL
```
- **Storage**: Device only (AES-256-GCM)
- **Duration**: User-configurable (1-24 hours)
- **Access**: App only (iOS Keychain / Android Keystore)

### Phase 2: Processing (Optional)
```
User Trigger → Extract Segment → Transcribe → Transmit Text
```
- **Trigger**: Wake word OR manual activation
- **Payload**: Text transcript + metadata (no audio unless confidence < 80%)
- **Encryption**: TLS 1.3 + E2EE for audio tails
- **Server Processing**: Ephemeral (deleted immediately after ASR)

### Phase 3: Storage (Backend)
```
Transcript → Intent Classification → Memory DB
```
- **Stored**: Text only (no audio)
- **Retention**: 7 days (configurable)
- **Purpose**: Context for follow-up queries
- **Deletion**: Automatic after TTL OR user request

## Consent Modes

### One-Party Consent (Default)
- **Legal**: Compliant in most U.S. states
- **Behavior**: Recording allowed with your consent only
- **Indicator**: Purple status light
- **Use Case**: Personal assistant, memory aid

### All-Party Consent
- **Legal**: Required in CA, FL, IL, MA, WA, etc.
- **Behavior**: Must notify all participants
- **Indicator**: Red status light + audible tone
- **Use Case**: Formal meetings, legal consultations

### Location-Based Auto-Switching
- **Feature**: GPS-based consent mode selection
- **Database**: State/country recording laws
- **Notification**: Alert when entering two-party state

## User Controls

### Instant Actions
- **Nuke Button**: Immediate deletion of all local data
- **Pause Recording**: Stop capture without deleting buffer
- **Disable Transmission**: Local-only mode

### Configuration
- **TTL Slider**: 1-24 hour retention
- **Auto-Delete**: Automatic cleanup on TTL expiry
- **Status Indicators**: Toggle visual/haptic feedback
- **Transmission Approval**: Manual vs automatic

## Transmission Log

Every backend communication is logged:
```json
{
  "id": "tx_abc123",
  "timestamp": "2025-10-11T00:52:00Z",
  "type": "text",
  "size": 1024,
  "purpose": "Intent classification",
  "endpoint": "api.guardian.ai/classify",
  "status": "success"
}
```

**Access**: Settings → Transmission Log
**Retention**: 30 days locally
**Export**: CSV download available

## Compliance

### GDPR (EU)
- ✅ Right to Access: Export all data
- ✅ Right to Deletion: Instant wipe + backend deletion
- ✅ Right to Portability: JSON export
- ✅ Consent: Explicit opt-in for transmission
- ✅ Data Minimization: Text-only backend storage

### CCPA (California)
- ✅ Right to Know: Full transparency dashboard
- ✅ Right to Delete: Nuke button + backend API
- ✅ Right to Opt-Out: Local-only mode
- ✅ Non-Discrimination: Full functionality in local mode

### HIPAA (Healthcare)
- ⚠️ **Not HIPAA-compliant by default**
- ✅ Can be made compliant with:
  - Business Associate Agreement (BAA)
  - Encrypted backend storage
  - Access controls + audit logs
  - 6-year retention for medical records

### Wiretapping Laws (U.S.)
- ✅ One-Party States: Compliant with default mode
- ✅ Two-Party States: All-party consent mode required
- ✅ Federal: Complies with 18 U.S.C. § 2511

## Security Measures

### Device-Level
- AES-256-GCM encryption
- Secure enclave storage (iOS) / Keystore (Android)
- Biometric authentication for sensitive actions
- Certificate pinning

### Network-Level
- TLS 1.3 with perfect forward secrecy
- mTLS for backend services
- Rate limiting + DDoS protection
- Geo-fencing for compliance

### Application-Level
- JWT with short expiry (5 min)
- Device binding
- Anomaly detection
- Automatic logout on suspicious activity

## Incident Response

### Data Breach Protocol
1. Immediate notification (< 72 hours)
2. Affected user identification
3. Mitigation steps (forced password reset, token revocation)
4. Post-mortem + security audit

### User Reporting
- In-app "Report Privacy Concern" button
- Direct email: privacy@guardian.ai
- Response SLA: 48 hours

## Third-Party Services

### Current Integrations
- **OpenAI Whisper API**: ASR (text output only)
- **Anthropic Claude API**: LLM reasoning (text only)
- **Google Cloud**: Hosting (encrypted at rest)

### Data Sharing
- **Zero Sharing**: No data sold or shared with third parties
- **Subprocessors**: Listed at guardian.ai/subprocessors
- **DPAs**: Data Processing Agreements with all vendors

## Audit & Certification

### Planned Certifications
- SOC 2 Type II (Q2 2026)
- ISO 27001 (Q3 2026)
- HIPAA BAA (Q4 2026)

### Current Status
- Internal security audits (quarterly)
- Penetration testing (annual)
- Bug bounty program (HackerOne)

## Contact

Privacy Officer: privacy@guardian.ai
Security Team: security@guardian.ai
DPO (EU): dpo@guardian.ai
