import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, LogBox, Platform, BackHandler } from 'react-native';
import PermissionScreen from './src/screens/PermissionScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';

// Disable all warning popups/alerts on the mobile screen
LogBox.ignoreAllLogs();

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' or 'result'
  const [searchQuery, setSearchQuery] = useState('');

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
    if (query) {
      setSearchQuery(query);
      setCurrentScreen('result');
    }
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />
      
      {!isAuthorized ? (
        <PermissionScreen onPermissionsGranted={() => setIsAuthorized(true)} />
      ) : currentScreen === 'home' ? (
        <HomeScreen onSearch={handleSearch} />
      ) : (
        <ResultScreen searchQuery={searchQuery} onBack={handleBack} />
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