import React, { useState, useEffect } from 'react';
import { StyleSheet, View, LogBox, BackHandler } from 'react-native';
import { Camera as CameraAPI } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import PermissionScreen from './src/screens/PermissionScreen';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { PremiumProvider } from './src/context/PremiumContext';

// Disable all warning popups/alerts on the mobile screen
LogBox.ignoreAllLogs();

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' or 'result'

  // Handle splash loading and initial permission check
  useEffect(() => {
    const checkPermissionsAndLoad = async () => {
      try {
        const camera = await CameraAPI.getCameraPermissionsAsync();
        const media = await ImagePicker.getMediaLibraryPermissionsAsync();
        const notifications = await Notifications.getPermissionsAsync();
        const granted = Boolean(
          (camera?.granted || camera?.status === 'granted') &&
          (media?.granted || media?.status === 'granted') &&
          (notifications?.granted || notifications?.status === 'granted')
        );
        setIsAuthorized(granted);
      } catch (err) {
        console.error('Error checking permissions on splash:', err);
      } finally {
        setTimeout(() => {
          setAppLoading(false);
        }, 2500); // Show splash for 2.5s
      }
    };

    checkPermissionsAndLoad();
  }, []);

  // Handle native Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'result') {
        setCurrentScreen('home');
        return true; // Prevents the app from exiting
      }
      return false; // Default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen]);

  // Render Splash Screen during initial load
  if (appLoading) {
    return (
      <View style={styles.container}>
        <SplashScreen />
      </View>
    );
  }

  return (
    <PremiumProvider>
      <View style={styles.container}>
        {!isAuthorized ? (
          <PermissionScreen onPermissionsGranted={() => setIsAuthorized(true)} />
        ) : (
          <AppNavigator />
        )}
      </View>
    </PremiumProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});