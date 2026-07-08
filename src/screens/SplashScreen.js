import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Spacer to push content to middle */}
      <View style={{ flex: 1 }} />

      {/* Logo Placeholder */}
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>Logo</Text>
        </View>
      </View>

      {/* Spinner */}
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="small" color="#000" />
      </View>

      {/* App Name */}
      <Text style={styles.appName}>Search Image</Text>

      {/* Spacer at bottom */}
      <View style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 80,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#EAEAEA',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  logoText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  spinnerContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
