import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../contexts/AudioContext';
import StatusIndicator from '../components/StatusIndicator';
import MicButton from '../components/MicButton';
import TopicCard from '../components/TopicCard';
import GuidanceModal from '../components/GuidanceModal';
import { backendService } from '../services/mockBackend';
import { TopicSegment, GuidanceMessage } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const { isRecording } = useAudio();
  const [topics, setTopics] = useState<TopicSegment[]>([]);
  const [currentGuidance, setCurrentGuidance] = useState<GuidanceMessage | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setTopics(backendService.generateMockTopics());
  }, []);

  const handleAskQuestion = async () => {
    if (!query.trim()) return;
    
    const guidance = await backendService.processAudioSegment({
      transcript: query,
      metadata: {
        duration: 30,
        speakers: 1,
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      },
    });
    
    setCurrentGuidance(guidance);
    setShowGuidance(true);
    setQuery('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68e9aa591dcd0ce4524ad2e7_1760144017455_79cbf320.webp' }}
          style={styles.logo}
        />
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <StatusIndicator />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your Guardian AI</Text>
          <Text style={styles.heroSubtitle}>Privacy-first real-time interpreter</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          {topics.map(topic => (
            <TopicCard key={topic.id} topic={topic} onExpand={() => {}} />
          ))}
        </View>

        <View style={styles.askSection}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor="#6b7280"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleAskQuestion}
          />
          <TouchableOpacity style={styles.askButton} onPress={handleAskQuestion}>
            <Text style={styles.askButtonText}>Ask</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.micContainer}>
        <MicButton />
      </View>

      <GuidanceModal
        visible={showGuidance}
        guidance={currentGuidance}
        onConfirm={() => setShowGuidance(false)}
        onDismiss={() => setShowGuidance(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  logo: { width: 40, height: 40 },
  settingsIcon: { fontSize: 28 },
  content: { flex: 1, paddingHorizontal: 20 },
  hero: { paddingVertical: 30, alignItems: 'center' },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 8 },
  heroSubtitle: { color: '#9ca3af', fontSize: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#e5e7eb', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  askSection: { flexDirection: 'row', marginBottom: 100, gap: 12 },
  input: { flex: 1, backgroundColor: '#2d2d44', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 15 },
  askButton: { backgroundColor: '#8b5cf6', borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center' },
  askButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  micContainer: { position: 'absolute', bottom: 30, alignSelf: 'center' },
});
