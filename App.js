import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, LogBox, Platform, BackHandler } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera as CameraAPI } from 'expo-camera';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import PermissionScreen from './src/screens/PermissionScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/navigation/AppNavigator';

// Disable all warning popups/alerts on the mobile screen
LogBox.ignoreAllLogs();

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' or 'result'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchImageUri, setSearchImageUri] = useState(null);

  // Handle splash loading and initial permission check
  useEffect(() => {
    const checkPermissionsAndLoad = async () => {
      try {
        const storage = await ImagePicker.getMediaLibraryPermissionsAsync();
        const camera = await CameraAPI.getCameraPermissionsAsync();
        const microphone = await ExpoSpeechRecognitionModule.getPermissionsAsync();
        const granted = Boolean(
          (storage?.granted || storage?.status === 'granted') &&
          (camera?.granted || camera?.status === 'granted') &&
          (microphone?.granted || microphone?.status === 'granted')
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

  const handleSearch = (query, imageUri) => {
    setSearchQuery(query || '');
    setSearchImageUri(imageUri || null);
    setCurrentScreen('result');
  };

  const handleBack = () => {
    setSearchQuery('');
    setSearchImageUri(null);
    setCurrentScreen('home');
  };

  // Render Splash Screen during initial load
  if (appLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />
        <SplashScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />
      
      {!isAuthorized ? (
        <PermissionScreen onPermissionsGranted={() => setIsAuthorized(true)} />
      ) : (
        <AppNavigator />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});