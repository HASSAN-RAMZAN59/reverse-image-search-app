import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, Image as ImageIcon, ShieldCheck } from 'lucide-react-native';
import { Camera as CameraAPI } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function PermissionScreen({ onPermissionsGranted }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [permissions, setPermissions] = useState({ storage: false, camera: false });
  const [simulatedStorageGranted, setSimulatedStorageGranted] = useState(false);

  const hasAllPermissions = permissions.storage && simulatedStorageGranted && permissions.camera;

  const readDevicePermissions = async () => {
    const storage = await ImagePicker.getMediaLibraryPermissionsAsync();
    const camera = await CameraAPI.getCameraPermissionsAsync();
    const status = {
      storage: Boolean(storage?.granted || storage?.status === 'granted'),
      camera: Boolean(camera?.granted || camera?.status === 'granted'),
    };
    setPermissions(status);
    return status;
  };

  const syncPermissions = async () => {
    try {
      setLoading(true);
      const current = await readDevicePermissions();
      if (current.storage && current.camera) {
        setSimulatedStorageGranted(true);
        onPermissionsGranted();
      }
    } catch (err) {
      console.log('Sync failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncPermissions();
  }, []);

  const explainDenied = (label) => {
    Alert.alert(
      `${label} Permission Required`,
      `This app cannot continue without ${label.toLowerCase()} permission. Please allow it to proceed.`,
      [
        { text: 'Open Settings', onPress: () => Linking.openSettings().catch(console.log) },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const requestSequentialPermissions = async () => {
    if (busy) return;
    try {
      setBusy(true);
      setLoading(true);

      const before = await readDevicePermissions();
      if (!before.storage) {
        const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!res?.granted) return explainDenied('Storage');
      }
      setSimulatedStorageGranted(true);

      const after = await readDevicePermissions();
      if (!after.camera) {
        const res = await CameraAPI.requestCameraPermissionsAsync();
        if (!res?.granted) return explainDenied('Camera');
      }

      const final = await readDevicePermissions();
      if (final.storage && final.camera) onPermissionsGranted();
    } catch (error) {
      Alert.alert('Permission Error', error?.message || 'Permission request failed.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  const PermissionRow = ({ icon: Icon, label, granted }) => (
    <View style={styles.row}>
      <View style={styles.rowIcon}><Icon size={22} color="#1F2937" /></View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={[styles.statusBadge, granted ? styles.statusGranted : styles.statusDenied]}>
        <Text style={[styles.statusText, granted ? styles.statusGrantedText : styles.statusDeniedText]}>
          {granted ? '✓' : '✕'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <ShieldCheck size={42} color="#2563EB" strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>Permission Check</Text>
        <Text style={styles.subtitle}>
          Grant the permissions below in sequence so the app can work correctly.
        </Text>
      </View>

      <View style={styles.card}>
        <PermissionRow icon={ImageIcon} label="Storage permission" granted={permissions.storage && simulatedStorageGranted} />
        <PermissionRow icon={Camera} label="Camera permission" granted={permissions.camera} />
      </View>

      <Pressable
        onPress={hasAllPermissions ? onPermissionsGranted : requestSequentialPermissions}
        disabled={busy}
        style={({ pressed }) => [
          styles.button,
          busy && styles.buttonDisabled,
          pressed && !busy && styles.buttonPressed,
        ]}
      >
        {busy ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            {hasAllPermissions ? 'PROCEED TO HOME SCREEN' : 'GRANT ALL PERMISSIONS'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 28, justifyContent: 'space-between' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F9FC' },
  loadingText: { marginTop: 14, fontSize: 16, color: '#4B5563' },
  header: { alignItems: 'center', paddingHorizontal: 12 },
  headerIconWrap: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { marginTop: 10, fontSize: 14, lineHeight: 21, color: '#6B7280', textAlign: 'center', maxWidth: 320 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  rowIcon: { width: 34, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 17, color: '#111827', fontWeight: '500' },
  statusBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  statusGranted: { borderColor: '#22C55E', backgroundColor: '#ECFDF5' },
  statusDenied: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 16, fontWeight: '800' },
  statusGrantedText: { color: '#16A34A' },
  statusDeniedText: { color: '#DC2626' },
  button: { height: 62, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  buttonPressed: { transform: [{ scale: 0.99 }], opacity: 0.96 },
  buttonDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0, elevation: 0 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
});
