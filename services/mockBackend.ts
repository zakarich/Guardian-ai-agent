import { AudioPayload, GuidanceMessage, TopicSegment, Speaker } from '../types';

// Mock backend service simulating real AI processing
export class MockBackendService {
  private ws: WebSocket | null = null;

  async processAudioSegment(payload: AudioPayload): Promise<GuidanceMessage> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock guidance based on keywords
    const transcript = payload.transcript.toLowerCase();
    
    if (transcript.includes('doctor') || transcript.includes('medical')) {
      return {
        id: Math.random().toString(),
        timestamp: new Date(),
        type: 'suggestion',
        content: 'Ask about potential side effects and alternative treatment options.',
        context: 'Medical consultation detected',
        requiresConfirmation: true,
        spoken: false,
      };
    }

    if (transcript.includes('bank') || transcript.includes('fee')) {
      return {
        id: Math.random().toString(),
        timestamp: new Date(),
        type: 'warning',
        content: 'That clause mentions a recurring monthly fee. Request a detailed breakdown.',
        context: 'Financial discussion detected',
        requiresConfirmation: true,
        spoken: false,
      };
    }

    return {
      id: Math.random().toString(),
      timestamp: new Date(),
      type: 'clarification',
      content: 'I can help clarify that conversation. Would you like a summary?',
      context: 'General conversation',
      requiresConfirmation: false,
      spoken: false,
    };
  }

  generateMockTopics(): TopicSegment[] {
    const now = new Date();
    return [
      {
        id: '1',
        startTime: new Date(now.getTime() - 300000),
        endTime: new Date(now.getTime() - 240000),
        speakers: [
          { id: 's1', label: 'You', segments: [] },
          { id: 's2', label: 'Doctor', segments: [] }
        ],
        transcript: 'Discussion about medication dosage and potential interactions with existing prescriptions.',
        summary: 'Medical consultation about new prescription',
        confidence: 0.92,
        tags: ['medical', 'prescription'],
      },
      {
        id: '2',
        startTime: new Date(now.getTime() - 180000),
        endTime: new Date(now.getTime() - 120000),
        speakers: [
          { id: 's1', label: 'You', segments: [] },
          { id: 's3', label: 'Bank Agent', segments: [] }
        ],
        transcript: 'Reviewing account terms, monthly fees, and overdraft protection options.',
        summary: 'Bank account review and fee discussion',
        confidence: 0.88,
        tags: ['financial', 'banking'],
      },
    ];
  }
}

export const backendService = new MockBackendService();
