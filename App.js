import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import PermissionScreen from './src/screens/PermissionScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {!isAuthorized ? (
        <PermissionScreen onPermissionsGranted={() => setIsAuthorized(true)} />
      ) : (
        <HomeScreen />
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