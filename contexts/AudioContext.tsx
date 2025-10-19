import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

type AudioStatus = 'idle' | 'listening' | 'processing' | 'speaking';

interface AudioContextType {
  status: AudioStatus;
  isRecording: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  nukeData: () => Promise<void>;
  bufferDuration: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [bufferDuration, setBufferDuration] = useState(0);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  const startListening = async () => {
    try {
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setStatus('listening');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopListening = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setIsRecording(false);
    setStatus('idle');
  };

  const nukeData = async () => {
    await stopListening();
    setBufferDuration(0);
  };

  return (
    <AudioContext.Provider value={{ status, isRecording, startListening, stopListening, nukeData, bufferDuration }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
