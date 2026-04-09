import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSession } from '../security/SessionProvider';
import { useLogger } from '../security/Logger';

const LABS = [
  {
    name: 'Hemoglobin',
    value: '14.2 g/dL',
    range: '13.0–17.0',
    status: 'Normal',
  },
  { name: 'WBC', value: '11.3 x10^9/L', range: '4.0–10.0', status: 'High' },
  {
    name: 'Fasting Glucose',
    value: '132 mg/dL',
    range: '70–99',
    status: 'High',
  },
  {
    name: 'Creatinine',
    value: '0.9 mg/dL',
    range: '0.7–1.3',
    status: 'Normal',
  },
];

export default function BiometricVaultScreen() {
  const { isVaultUnlocked, unlockVault, lockVault } = useSession();
  const { log } = useLogger();
  const [showReauth, setShowReauth] = useState(false);

  const attemptUnlock = async () => {
    const ok = await unlockVault();
    if (ok) {
      setShowReauth(false);
    } else {
      setShowReauth(true);
      log('WARN', 'Vault unlock not completed. User can retry.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biometric Vault</Text>
      <Text style={styles.subtitle}>
        Simulates sensitive medical records protected by biometrics.
      </Text>

      {!isVaultUnlocked ? (
        <TouchableOpacity style={styles.btnPrimary} onPress={attemptUnlock}>
          <Text style={styles.btnText}>
            Unlock Medical Records (FaceID/TouchID)
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.row}>
            <Text style={styles.unlocked}>Access Granted ✅</Text>
            <TouchableOpacity onPress={lockVault}>
              <Text style={styles.lock}>🔒 Lock</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.section}>Lab Results (Mock)</Text>

          {LABS.map((l, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{l.name}</Text>
                <Text
                  style={[
                    styles.badge,
                    l.status === 'High' ? styles.badgeHigh : styles.badgeOk,
                  ]}
                >
                  {l.status}
                </Text>
              </View>
              <Text style={styles.value}>{l.value}</Text>
              <Text style={styles.range}>Reference: {l.range}</Text>
            </View>
          ))}
        </>
      )}

      <Modal
        visible={showReauth}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReauth(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Re‑authentication Required</Text>
            <Text style={styles.modalText}>
              Authenticate to view medical records.
            </Text>

            <TouchableOpacity style={styles.btnPrimary} onPress={attemptUnlock}>
              <Text style={styles.btnText}>Authenticate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => setShowReauth(false)}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.modalHint}>
              Tip: On simulator, enroll FaceID from Hardware → Face ID → Enroll.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0A0F1F' },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#9DB6FF', marginTop: 8, marginBottom: 12 },

  btnPrimary: {
    backgroundColor: '#1C7ED6',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  btnSecondary: {
    backgroundColor: '#1F2D55',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: { color: 'white', fontWeight: '900', textAlign: 'center' },

  unlocked: { color: '#7ee787', fontWeight: '900' },
  lock: { color: '#D0D6E8', fontWeight: '900' },

  section: {
    color: '#9DB6FF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 18,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1F2D55',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { color: 'white', fontWeight: '900' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
  },
  badgeHigh: { backgroundColor: '#E53935' },
  badgeOk: { backgroundColor: '#43A047' },
  value: { color: 'white', fontSize: 18, fontWeight: '900', marginTop: 6 },
  range: { color: '#6F7C92', marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#0A0F1F',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2D55',
  },
  modalTitle: { color: 'white', fontWeight: '900', fontSize: 16 },
  modalText: { color: '#9DB6FF', marginTop: 8 },
  modalHint: { color: '#6F7C92', marginTop: 12, fontSize: 12 },
});
``;
