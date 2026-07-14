import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, LogBox, Platform, BackHandler, ScrollView, Dimensions } from 'react-native';
import { Camera as CameraAPI } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import PermissionScreen from './src/screens/PermissionScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen1 from './src/screens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreen2';
import OnboardingScreen3 from './src/screens/OnboardingScreen3';
import * as FileSystem from 'expo-file-system/legacy';

// Disable all warning popups/alerts on the mobile screen
LogBox.ignoreAllLogs();

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const scrollViewRef = useRef(null);
  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  const handleScroll = (event) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH) + 1;
    if (pageIndex !== onboardingStep && pageIndex >= 1 && pageIndex <= 3) {
      setOnboardingStep(pageIndex);
    }
  };
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' or 'result'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchImageUri, setSearchImageUri] = useState(null);

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

        // Always show onboarding on fresh app launch
        setIsOnboardingComplete(false);
      } catch (err) {
        console.error('Error checking permissions on splash:', err);
        setIsOnboardingComplete(false);
      } finally {
        setTimeout(() => {
          setAppLoading(false);
        }, 2500); // Show splash for 2.5s
      }
    };

    checkPermissionsAndLoad();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      const onboardingPath = FileSystem.documentDirectory + 'onboarding_complete.json';
      await FileSystem.writeAsStringAsync(onboardingPath, JSON.stringify({ completed: true }));
      setIsOnboardingComplete(true);
    } catch (err) {
      console.error('Error saving onboarding state:', err);
      setIsOnboardingComplete(true); // Proceed anyway on write error
    }
  };

  // Handle native Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'result') {
        setSearchQuery('');
        setSearchImageUri(null);
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
      <View style={styles.container}>
        <SplashScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isAuthorized ? (
        <PermissionScreen onPermissionsGranted={() => setIsAuthorized(true)} />
      ) : !isOnboardingComplete ? (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1, backgroundColor: '#131313' }}
        >
          <View style={{ width: SCREEN_WIDTH }}>
            <OnboardingScreen1
              onNext={() => scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true })}
              onSkip={handleOnboardingComplete}
            />
          </View>
          <View style={{ width: SCREEN_WIDTH }}>
            <OnboardingScreen2
              onNext={() => scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * 2, animated: true })}
              onSkip={handleOnboardingComplete}
            />
          </View>
          <View style={{ width: SCREEN_WIDTH }}>
            <OnboardingScreen3
              onNext={handleOnboardingComplete}
            />
          </View>
        </ScrollView>
      ) : (
        <AppNavigator />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});