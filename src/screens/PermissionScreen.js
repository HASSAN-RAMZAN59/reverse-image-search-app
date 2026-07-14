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
  SafeAreaView,
  Dimensions
} from 'react-native';
import PermissionLogo from '../components/PermissionLogo';
import { Check, X } from 'lucide-react-native';
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
      const microphoneStatus = { granted: true, status: 'granted' }; // Automatically granted

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
        <ActivityIndicator size="large" color="#29BD4F" />
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

  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  // Proportional scaling from Figma canvas width (1080px)
  const scale = SCREEN_WIDTH / 1080;
  const logoWidth = 534 * scale;
  const logoHeight = 534 * scale;
  const logoTop = 489 * scale;

  // Figma list container size & spacing (W 685, total H 819, Gap Y 150 from logo bottom)
  const listWidth = 685 * scale;
  const listGap = 150 * scale;

  // Figma title properties (W 685, H 84, Y 1173)
  const titleWidth = 685 * scale;
  const titleHeight = 84 * scale;
  const titleFontSize = 71.31 * scale;
  const titleGap = 63 * scale; // gap between title bottom and first item top (1320 - 1257 = 63)

  // Remaining height of the 819px container for the checklist items (819 - 84 - 63 = 672)
  const checklistHeight = (819 - 84 - 63) * scale;

  // Exact Figma text properties
  const textWidth = 380 * scale;
  const textHeight = 51 * scale;
  const fontSize = 43.64 * scale;

  // Figma check circle layout (starts at X 171.31, text starts at X 238, icon at X 178)
  const circleSize = 32 * scale;
  const iconSize = 18.62 * scale;
  const circleLeftOffset = -26.19 * scale; // Align circle exactly to X 171.31 when container starts at X 197.5
  const circleMarginRight = 34.69 * scale; // Gap to make text start exactly at X 238

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" translucent={true} />

      {/* Spacing from top matching Figma Y 489 */}
      <View style={{ height: logoTop }} />

      {/* Security Logo matching Figma W 534 H 534 */}
      <View style={styles.logoContainer}>
        <PermissionLogo width={logoWidth} height={logoHeight} />
      </View>

      {/* Spacing between logo and list matching Figma Y 150 */}
      <View style={{ height: listGap }} />

      {/* Title Header: Permission Required! */}
      <View style={{ width: titleWidth, minHeight: titleHeight, justifyContent: 'center', alignSelf: 'center' }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.7}
          style={[styles.headerText, { fontSize: titleFontSize }]}
        >
          Permission Required!
        </Text>
      </View>

      {/* Spacing between title and list matching Figma Y 63 */}
      <View style={{ height: titleGap }} />

      {/* Permissions List matching Figma W 685, H 672 */}
      <View style={[styles.listContainer, { width: listWidth, height: checklistHeight }]}>
        {permissionFlow.map((item, index) => {
          const granted = isGranted(item.status);
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.listItem,
                {
                  height: 120 * scale,
                  alignItems: 'flex-start',
                },
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
              <View
                style={[
                  styles.checkCircle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    marginLeft: circleLeftOffset,
                    marginRight: circleMarginRight,
                    borderWidth: 2.5 * scale,
                    marginTop: ((51 - 32) / 2) * scale, // Vertically center the circle relative to the 51px text height
                  },
                  granted ? styles.checkCircleGranted : styles.checkCircleDenied
                ]}
              >
                {granted ? (
                  <Check
                    size={iconSize}
                    color="#86FF29"
                    strokeWidth={6.0}
                  />
                ) : (
                  <X
                    size={iconSize}
                    color="#FF2929"
                    strokeWidth={6.0}
                  />
                )}
              </View>
              <View style={{ width: textWidth, height: textHeight, justifyContent: 'center' }}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.8}
                  style={[
                    styles.listItemText,
                    {
                      color: granted ? '#86FF29' : '#FF2929',
                      fontSize,
                    }
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Button at the bottom matching Figma coordinates X 63, Y 2142, W 953, H 139, Radius 15, Fill #ADC7FF */}
      <View style={[styles.buttonContainer, { marginBottom: 119 * scale }]}>
        <Pressable
          onPress={handleActionButtonPress}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              width: 953 * scale,
              height: 139 * scale,
              borderRadius: 15 * scale,
            },
            pressed && styles.buttonPressed
          ]}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            style={[styles.primaryButtonText, { fontSize: 45 * scale }]}
          >
            {actionButtonText}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#131313',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  listContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  listItemPressed: {
    opacity: 0.7,
  },
  checkCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDenied: {
    borderColor: '#FF2929',
    backgroundColor: 'transparent',
  },
  checkCircleGranted: {
    borderColor: '#86FF29',
    backgroundColor: 'transparent',
  },
  listItemText: {
    fontWeight: '500',
  },
  buttonContainer: {
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: '#ADC7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#131313',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
