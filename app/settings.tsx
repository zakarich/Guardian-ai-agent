import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { usePrivacy } from '../contexts/PrivacyContext';
import { useAudio } from '../contexts/AudioContext';
import Slider from '@react-native-community/slider';

export default function SettingsScreen() {
  const { settings, updateSettings, transmissionLog } = usePrivacy();
  const { nukeData, bufferDuration } = useAudio();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.banner}>
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68e9aa591dcd0ce4524ad2e7_1760144018195_513bbf8a.webp' }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Privacy & Control</Text>
          <Text style={styles.bannerSubtitle}>Your data, your rules</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Retention</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Buffer TTL: {settings.ttl} hours</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={24}
            step={1}
            value={settings.ttl}
            onValueChange={(val) => updateSettings({ ttl: val })}
            minimumTrackTintColor="#8b5cf6"
            maximumTrackTintColor="#3d3d5c"
            thumbTintColor="#8b5cf6"
          />
          <Text style={styles.hint}>Audio older than {settings.ttl}h auto-deleted</Text>
        </View>

        <TouchableOpacity style={styles.nukeButton} onPress={nukeData}>
          <Text style={styles.nukeText}>🗑️ Nuke All Data Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consent & Legal</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Consent Mode</Text>
            <TouchableOpacity 
              style={styles.modeButton}
              onPress={() => updateSettings({ 
                consentMode: settings.consentMode === 'one-party' ? 'all-party' : 'one-party' 
              })}
            >
              <Text style={styles.modeText}>{settings.consentMode}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            {settings.consentMode === 'one-party' 
              ? 'Recording allowed with your consent only' 
              : 'All parties must consent to recording'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Status Indicators</Text>
            <Switch
              value={settings.showIndicators}
              onValueChange={(val) => updateSettings({ showIndicators: val })}
              trackColor={{ false: '#3d3d5c', true: '#8b5cf6' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Auto-delete Old Data</Text>
            <Switch
              value={settings.autoDelete}
              onValueChange={(val) => updateSettings({ autoDelete: val })}
              trackColor={{ false: '#3d3d5c', true: '#8b5cf6' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transmission Log</Text>
        {transmissionLog.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No transmissions yet</Text>
          </View>
        ) : (
          transmissionLog.slice(0, 5).map(log => (
            <View key={log.id} style={styles.logCard}>
              <Text style={styles.logType}>{log.type.toUpperCase()}</Text>
              <Text style={styles.logPurpose}>{log.purpose}</Text>
              <Text style={styles.logTime}>{log.timestamp.toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  banner: { height: 200, position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 20, left: 20 },
  bannerTitle: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 4 },
  bannerSubtitle: { color: '#d1d5db', fontSize: 16 },
  section: { padding: 20 },
  sectionTitle: { color: '#e5e7eb', fontSize: 20, fontWeight: '600', marginBottom: 16 },
  card: { backgroundColor: '#2d2d44', borderRadius: 16, padding: 16, marginBottom: 12 },
  label: { color: '#e5e7eb', fontSize: 16, fontWeight: '500' },
  slider: { width: '100%', height: 40 },
  hint: { color: '#9ca3af', fontSize: 13, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modeButton: { backgroundColor: '#8b5cf6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  modeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  nukeButton: { backgroundColor: '#ef4444', borderRadius: 16, padding: 16, alignItems: 'center' },
  nukeText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logCard: { backgroundColor: '#2d2d44', borderRadius: 12, padding: 12, marginBottom: 8 },
  logType: { color: '#8b5cf6', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  logPurpose: { color: '#e5e7eb', fontSize: 14, marginBottom: 4 },
  logTime: { color: '#6b7280', fontSize: 12 },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
});
