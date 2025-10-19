import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAudio } from '../contexts/AudioContext';

export default function StatusIndicator() {
  const { status, isRecording } = useAudio();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return '#8b5cf6';
      case 'processing': return '#3b82f6';
      case 'speaking': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening locally';
      case 'processing': return 'Processing securely';
      case 'speaking': return 'Providing guidance';
      default: return 'Guardian ready';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, { backgroundColor: getStatusColor(), transform: [{ scale: pulseAnim }] }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  indicator: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  text: { color: '#e5e7eb', fontSize: 14, fontWeight: '500' },
});
