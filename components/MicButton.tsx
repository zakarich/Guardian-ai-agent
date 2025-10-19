import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View } from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import * as Haptics from 'expo-haptics';

export default function MicButton() {
  const { isRecording, startListening, stopListening } = useAudio();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isRecording) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isRecording && styles.buttonActive]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.innerCircle, isRecording && styles.innerCircleActive]}>
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68e9aa591dcd0ce4524ad2e7_1760144018899_eb34d436.webp' }}
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2d2d44',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonActive: { backgroundColor: '#8b5cf6' },
  innerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3d3d5c', justifyContent: 'center', alignItems: 'center' },
  innerCircleActive: { backgroundColor: '#a78bfa' },
  icon: { width: 32, height: 32, tintColor: '#fff' },
});
