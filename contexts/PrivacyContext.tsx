import React, { createContext, useContext, useState } from 'react';

type ConsentMode = 'one-party' | 'all-party';

interface PrivacySettings {
  ttl: number;
  consentMode: ConsentMode;
  showIndicators: boolean;
  autoDelete: boolean;
}

interface PrivacyContextType {
  settings: PrivacySettings;
  updateSettings: (settings: Partial<PrivacySettings>) => void;
  transmissionLog: TransmissionLog[];
  addTransmission: (log: TransmissionLog) => void;
}

interface TransmissionLog {
  id: string;
  timestamp: Date;
  type: 'text' | 'audio';
  size: number;
  purpose: string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrivacySettings>({
    ttl: 24,
    consentMode: 'one-party',
    showIndicators: true,
    autoDelete: true,
  });
  const [transmissionLog, setTransmissionLog] = useState<TransmissionLog[]>([]);

  const updateSettings = (newSettings: Partial<PrivacySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addTransmission = (log: TransmissionLog) => {
    setTransmissionLog(prev => [log, ...prev].slice(0, 50));
  };

  return (
    <PrivacyContext.Provider value={{ settings, updateSettings, transmissionLog, addTransmission }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) throw new Error('usePrivacy must be used within PrivacyProvider');
  return context;
};
