import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import PermissionScreen from './src/screens/PermissionScreen';
import HomeScreen from './src/screens/HomeScreen';
import * as WebBrowser from 'expo-web-browser';

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleSearch = async (query, imageUri) => {
    if (query) {
      try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        await WebBrowser.openBrowserAsync(url);
      } catch (error) {
        console.error("Error opening browser:", error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {!isAuthorized ? (
        <PermissionScreen onPermissionsGranted={() => setIsAuthorized(true)} />
      ) : (
        <HomeScreen onSearch={handleSearch} />
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