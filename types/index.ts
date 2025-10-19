export interface TopicSegment {
  id: string;
  startTime: Date;
  endTime: Date;
  speakers: Speaker[];
  transcript: string;
  summary: string;
  confidence: number;
  tags: string[];
}

export interface Speaker {
  id: string;
  label: string;
  segments: { start: number; end: number; text: string }[];
}

export interface GuidanceMessage {
  id: string;
  timestamp: Date;
  type: 'suggestion' | 'warning' | 'clarification' | 'summary';
  content: string;
  context: string;
  requiresConfirmation: boolean;
  spoken: boolean;
}

export interface AudioPayload {
  transcript: string;
  metadata: {
    duration: number;
    speakers: number;
    confidence: number;
    timestamp: string;
  };
  audioTail?: string;
}
