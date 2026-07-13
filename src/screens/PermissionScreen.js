import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  AppState,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Check } from 'lucide-react-native';
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

export default function PermissionScreen({ onPermissionsGranted }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [permissions, setPermissions] = useState({
    camera: null,
    media: null,
    notifications: null,
    microphone: null,
  });

  const appState = useRef(AppState.currentState);

  // Passive check that does NOT request permissions
  const checkPermissionStatus = async () => {
    try {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      const mediaStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      const notificationsStatus = await Notifications.getPermissionsAsync();
      const microphoneStatus = await ExpoSpeechRecognitionModule.getPermissionsAsync();

      return {
        camera: cameraStatus,
        media: mediaStatus,
        notifications: notificationsStatus,
        microphone: microphoneStatus,
      };
    } catch (error) {
      console.error('Error checking permission status:', error);
      return {
        camera: null,
        media: null,
        notifications: null,
        microphone: null,
      };
    }
  };

  const syncAndCheck = async (shouldNavigate = true) => {
    const status = await checkPermissionStatus();
    setPermissions(status);
    setLoading(false);

    const allGranted = Boolean(
      isGranted(status.camera) &&
      isGranted(status.media) &&
      isGranted(status.notifications) &&
      isGranted(status.microphone)
    );

    if (allGranted && shouldNavigate) {
      onPermissionsGranted();
    }
  };

  useEffect(() => {
    // Initial check on launch
    syncAndCheck(true);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Sync state when coming back from system settings
        syncAndCheck(true);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isGranted = (perm) => {
    return perm?.granted || perm?.status === 'granted';
  };

  const isPermanentlyDenied = (perm) => {
    if (!perm) return false;
    return (perm.status === 'denied' || perm.granted === false) && perm.canAskAgain === false;
  };

  const handleRequestCamera = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await Camera.requestCameraPermissionsAsync();
      setPermissions((prev) => ({ ...prev, camera: res }));
      return res;
    } catch (error) {
      console.error('Failed to request Camera permission:', error);
      Alert.alert('Permission Error', 'Failed to request camera permission.');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestMedia = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissions((prev) => ({ ...prev, media: res }));
      return res;
    } catch (error) {
      console.error('Failed to request Media/Storage permission:', error);
      Alert.alert('Permission Error', 'Failed to request photo library permission.');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestNotifications = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await Notifications.requestPermissionsAsync();
      setPermissions((prev) => ({ ...prev, notifications: res }));
      return res;
    } catch (error) {
      console.error('Failed to request Notifications permission:', error);
      Alert.alert('Permission Error', 'Failed to request notification permission.');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestMicrophone = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setPermissions((prev) => ({ ...prev, microphone: res }));
      return res;
    } catch (error) {
      console.error('Failed to request Microphone permission:', error);
      Alert.alert('Permission Error', 'Failed to request microphone permission.');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006BFF" />
      </View>
    );
  }

  // Sequential permission configuration
  const permissionFlow = [
    {
      key: 'media',
      title: 'Storage permission',
      status: permissions.media,
      request: handleRequestMedia,
      settingsLabel: 'STORAGE',
    },
    {
      key: 'camera',
      title: 'Camera permission',
      status: permissions.camera,
      request: handleRequestCamera,
      settingsLabel: 'CAMERA',
    },
    {
      key: 'notifications',
      title: 'Notification permission',
      status: permissions.notifications,
      request: handleRequestNotifications,
      settingsLabel: 'NOTIFICATIONS',
    },
    {
      key: 'microphone',
      title: 'Microphone permission',
      status: permissions.microphone,
      request: handleRequestMicrophone,
      settingsLabel: 'MICROPHONE',
    },
  ];

  const handlePermissionRequest = async (item) => {
    if (busy) return;
    
    // Always attempt to trigger the OS dialog directly
    await item.request();
    
    await syncAndCheck(true);
  };

  // Get the next permission in sequence that needs action
  const nextRequired = permissionFlow.find((item) => !isGranted(item.status));

  const handleActionButtonPress = async () => {
    if (!nextRequired) {
      onPermissionsGranted();
      return;
    }
    
    if (isPermanentlyDenied(nextRequired.status)) {
      Linking.openSettings();
    } else {
      await handlePermissionRequest(nextRequired);
    }
  };

  // Determine bottom button details
  let actionButtonText = 'PROCEED';
  if (nextRequired) {
    const isDenied = isPermanentlyDenied(nextRequired.status);
    if (isDenied) {
      actionButtonText = `OPEN SETTINGS FOR ${nextRequired.settingsLabel}`;
    } else {
      actionButtonText = `ALLOW ${nextRequired.settingsLabel} PERMISSION`;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Spacing from top */}
      <View style={styles.topSpacing} />

      {/* Permissions List */}
      <View style={styles.listContainer}>
        {permissionFlow.map((item) => {
          const granted = isGranted(item.status);
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.listItem,
                pressed && styles.listItemPressed
              ]}
              onPress={async () => {
                if (!granted) {
                  if (isPermanentlyDenied(item.status)) {
                    Linking.openSettings();
                  } else {
                    await handlePermissionRequest(item);
                  }
                }
              }}
            >
              <View style={[styles.checkCircle, granted ? styles.checkCircleGranted : styles.checkCircleDenied]}>
                <Check size={16} color={granted ? '#34A853' : '#EA4335'} strokeWidth={3.5} />
              </View>
              <Text style={styles.listItemText}>{item.title}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Button at the bottom */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleActionButtonPress}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.primaryButtonText}>{actionButtonText}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSpacing: {
    height: 80,
  },
  listContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginVertical: 4,
  },
  listItemPressed: {
    opacity: 0.7,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  checkCircleDenied: {
    borderColor: '#EA4335',
    backgroundColor: '#FFFFFF',
  },
  checkCircleGranted: {
    borderColor: '#34A853',
    backgroundColor: '#FFFFFF',
  },
  listItemText: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#006BFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
