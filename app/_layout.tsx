import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from '../contexts/AudioContext';
import { PrivacyProvider } from '../contexts/PrivacyContext';

export default function RootLayout() {
  return (
    <AudioProvider>
      <PrivacyProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'Guardian AI',
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ title: 'Privacy & Settings' }} 
          />
          <Stack.Screen 
            name="topics" 
            options={{ title: 'Conversation History' }} 
          />
        </Stack>
      </PrivacyProvider>
    </AudioProvider>
  );
}
