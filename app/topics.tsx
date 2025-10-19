import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import TopicCard from '../components/TopicCard';
import { backendService } from '../services/mockBackend';
import { TopicSegment } from '../types';

export default function TopicsScreen() {
  const [topics, setTopics] = useState<TopicSegment[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setTopics(backendService.generateMockTopics());
  }, []);

  const filteredTopics = filter === 'all' 
    ? topics 
    : topics.filter(t => t.tags.includes(filter));

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {['all', 'medical', 'financial', 'legal'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredTopics.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptyHint}>Start listening to capture topics</Text>
          </View>
        ) : (
          filteredTopics.map(topic => (
            <TopicCard key={topic.id} topic={topic} onExpand={() => {}} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  filterBar: { flexDirection: 'row', padding: 16, gap: 8 },
  filterButton: { backgroundColor: '#2d2d44', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  filterButtonActive: { backgroundColor: '#8b5cf6' },
  filterText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  content: { flex: 1, paddingHorizontal: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#e5e7eb', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyHint: { color: '#6b7280', fontSize: 14 },
});
