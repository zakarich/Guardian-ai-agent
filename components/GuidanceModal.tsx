import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { GuidanceMessage } from '../types';

interface Props {
  visible: boolean;
  guidance: GuidanceMessage | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

export default function GuidanceModal({ visible, guidance, onConfirm, onDismiss }: Props) {
  if (!guidance) return null;

  const getTypeColor = () => {
    switch (guidance.type) {
      case 'warning': return '#ef4444';
      case 'suggestion': return '#8b5cf6';
      case 'clarification': return '#3b82f6';
      case 'summary': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.typeText}>{guidance.type.toUpperCase()}</Text>
          </View>
          
          <Text style={styles.content}>{guidance.content}</Text>
          
          {guidance.context && (
            <View style={styles.contextBox}>
              <Text style={styles.contextLabel}>Context:</Text>
              <Text style={styles.contextText}>{guidance.context}</Text>
            </View>
          )}

          <View style={styles.actions}>
            {guidance.requiresConfirmation && (
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <Text style={styles.confirmText}>Speak Aloud</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#2d2d44', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16 },
  typeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { color: '#e5e7eb', fontSize: 18, lineHeight: 26, marginBottom: 16 },
  contextBox: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, marginBottom: 20 },
  contextLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  contextText: { color: '#d1d5db', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12 },
  confirmButton: { flex: 1, backgroundColor: '#8b5cf6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dismissButton: { flex: 1, backgroundColor: '#3d3d5c', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  dismissText: { color: '#e5e7eb', fontSize: 16, fontWeight: '600' },
});
