import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View, AppState, StatusBar, Platform } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { SvgXml } from 'react-native-svg';

const logoXml = `
<svg width="100" height="100" viewBox="0 0 100 100" fill="none">
  <!-- Red (Top-Left to Bottom-Left) -->
  <path d="M 50 10 A 40 40 0 0 0 10 50" stroke="#EA4335" stroke-width="8" stroke-linecap="round" />
  <!-- Green (Bottom-Left to Bottom-Right) -->
  <path d="M 10 50 A 40 40 0 0 0 50 90" stroke="#34A853" stroke-width="8" stroke-linecap="round" />
  <!-- Yellow (Top-Right to Bottom-Right) -->
  <path d="M 50 10 A 40 40 0 0 1 90 50" stroke="#FBBC05" stroke-width="8" stroke-linecap="round" />
  <!-- Blue (Bottom-Right to Top-Right) -->
  <path d="M 90 50 A 40 40 0 0 1 50 90" stroke="#4285F4" stroke-width="8" stroke-linecap="round" />
  
  <!-- Handle -->
  <path d="M 78 78 L 95 95" stroke="#4285F4" stroke-width="9" stroke-linecap="round" />

  <!-- Landscape inside -->
  <path d="M 28 65 L 45 42 L 58 57 L 66 48 L 74 65 Z" fill="#1A73E8" />
  <circle cx="60" cy="36" r="6" fill="#1A73E8" />
</svg>
`;

export default function PermissionScreen({ onPermissionsGranted }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [permissions, setPermissions] = useState({
    media: 'undetermined',
    camera: 'undetermined',
    notifications: 'undetermined',
  });

  const appState = useRef(AppState.currentState);

  const checkPermissionStatus = async () => {
    try {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      const mediaStatus = await MediaLibrary.getPermissionsAsync();
      const notificationsStatus = await Notifications.getPermissionsAsync();

      return {
        camera: cameraStatus.status,
        media: mediaStatus.status,
        notifications: notificationsStatus.status,
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { media: 'undetermined', camera: 'undetermined', notifications: 'undetermined' };
    }
  };

  const syncAndCheck = async (shouldNavigate = true) => {
    const status = await checkPermissionStatus();
    setPermissions(status);
    setLoading(false);

    if (status.camera === 'granted' && status.media === 'granted' && status.notifications === 'granted') {
      if (shouldNavigate) {
        onPermissionsGranted();
      }
    }
  };

  useEffect(() => {
    syncAndCheck(true);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        syncAndCheck(true);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleRequestPermission = async () => {
    if (busy) return;
    setBusy(true);

    try {
      // Request Storage Permission
      if (permissions.media !== 'granted') {
        const res = await MediaLibrary.requestPermissionsAsync();
        setPermissions(prev => {
          const next = { ...prev, media: res.status };
          checkFinalTransition(next);
          return next;
        });
        setBusy(false);
        return;
      }

      // Request Camera Permission
      if (permissions.camera !== 'granted') {
        const res = await Camera.requestCameraPermissionsAsync();
        setPermissions(prev => {
          const next = { ...prev, camera: res.status };
          checkFinalTransition(next);
          return next;
        });
        setBusy(false);
        return;
      }

      // Request Notification Permission
      if (permissions.notifications !== 'granted') {
        const res = await Notifications.requestPermissionsAsync();
        setPermissions(prev => {
          const next = { ...prev, notifications: res.status };
          checkFinalTransition(next);
          return next;
        });
        setBusy(false);
        return;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      Alert.alert('Permission Error', 'Failed to request permission.');
    } finally {
      setBusy(false);
    }
  };

  const checkFinalTransition = (updatedPermissions) => {
    if (
      updatedPermissions.media === 'granted' &&
      updatedPermissions.camera === 'granted' &&
      updatedPermissions.notifications === 'granted'
    ) {
      setTimeout(() => {
        onPermissionsGranted();
      }, 150);
    }
  };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert('Error', 'Unable to open settings.');
    }
  };

  const getButtonTextAndAction = () => {
    if (permissions.media !== 'granted') {
      return { text: 'ALLOW STORAGE PERMISSION', action: handleRequestPermission };
    }
    if (permissions.camera !== 'granted') {
      return { text: 'ALLOW CAMERA PERMISSION', action: handleRequestPermission };
    }
    if (permissions.notifications !== 'granted') {
      return { text: 'ALLOW NOTIFICATION PERMISSION', action: handleRequestPermission };
    }
    return { text: 'PROCEED TO HOMESCREEN', action: onPermissionsGranted };
  };

  const isAnyDenied =
    permissions.media === 'denied' ||
    permissions.camera === 'denied' ||
    permissions.notifications === 'denied';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const btnConfig = getButtonTextAndAction();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      {/* Logo in the center top */}
      <View style={styles.logoContainer}>
        <SvgXml xml={logoXml} width={120} height={120} />
      </View>

      {/* Permission Rows */}
      <View style={styles.listContainer}>
        <View style={styles.row}>
          <CheckCircle2
            size={26}
            color={permissions.media === 'granted' ? '#4CAF50' : '#FF4B42'}
            style={styles.icon}
          />
          <Text style={styles.rowLabel}>Storage permission</Text>
        </View>

        <View style={styles.row}>
          <CheckCircle2
            size={26}
            color={permissions.camera === 'granted' ? '#4CAF50' : '#FF4B42'}
            style={styles.icon}
          />
          <Text style={styles.rowLabel}>Camera permission</Text>
        </View>

        <View style={styles.row}>
          <CheckCircle2
            size={26}
            color={permissions.notifications === 'granted' ? '#4CAF50' : '#FF4B42'}
            style={styles.icon}
          />
          <Text style={styles.rowLabel}>Notification permission</Text>
        </View>
      </View>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        {isAnyDenied && (
          <Text style={styles.fallbackHint}>
            Please enable any denied permissions in settings to use the app features.
          </Text>
        )}
        
        <Pressable
          onPress={btnConfig.action}
          style={({ pressed }) => [
            styles.blueButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>{btnConfig.text}</Text>
        </Pressable>

        {isAnyDenied && (
          <Pressable
            onPress={handleOpenSettings}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.settingsButtonText}>OPEN DEVICE SETTINGS</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 80 + StatusBar.currentHeight : 80,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  icon: {
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 19,
    color: '#212121',
    fontWeight: '400',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  fallbackHint: {
    fontSize: 13,
    color: '#FF4B42',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  blueButton: {
    width: '100%',
    height: 54,
    borderRadius: 12,
    backgroundColor: '#006BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  settingsButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
