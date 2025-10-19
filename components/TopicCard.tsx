import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TopicSegment } from '../types';

interface Props {
  topic: TopicSegment;
  onExpand: () => void;
}

export default function TopicCard({ topic, onExpand }: Props) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const duration = Math.round((topic.endTime.getTime() - topic.startTime.getTime()) / 1000);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(topic.startTime)}</Text>
          <Text style={styles.duration}>{duration}s</Text>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{Math.round(topic.confidence * 100)}%</Text>
        </View>
      </View>
      
      <Text style={styles.summary} numberOfLines={expanded ? undefined : 2}>
        {topic.summary}
      </Text>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.transcript}>{topic.transcript}</Text>
          <View style={styles.speakers}>
            {topic.speakers.map(speaker => (
              <View key={speaker.id} style={styles.speakerBadge}>
                <Text style={styles.speakerText}>{speaker.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#2d2d44', borderRadius: 16, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  time: { color: '#e5e7eb', fontSize: 14, fontWeight: '600', marginRight: 8 },
  duration: { color: '#9ca3af', fontSize: 12 },
  confidenceBadge: { backgroundColor: '#3b82f6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  confidenceText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  summary: { color: '#d1d5db', fontSize: 15, lineHeight: 22 },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#3d3d5c' },
  transcript: { color: '#9ca3af', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  speakers: { flexDirection: 'row', flexWrap: 'wrap' },
  speakerBadge: { backgroundColor: '#8b5cf6', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  speakerText: { color: '#fff', fontSize: 11, fontWeight: '500' },
});
