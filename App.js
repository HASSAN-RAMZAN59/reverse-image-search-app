import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, LogBox } from 'react-native';
import PermissionScreen from './src/screens/PermissionScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';

// Disable all warning popups/alerts on the mobile screen
LogBox.ignoreAllLogs();

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' or 'result'
  const [searchQuery, setSearchQuery] = useState('');

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
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
  },
});