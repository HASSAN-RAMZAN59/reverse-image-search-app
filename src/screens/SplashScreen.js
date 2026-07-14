import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import Logo from '../components/Logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SplashScreen() {
  // 1. Logo proportion calculation (Design: W 401, H 365.37)
  const maxLogoWidth = 401;
  const logoWidth = Math.min(maxLogoWidth, SCREEN_WIDTH * 0.45); // Keep it around ~45% of viewport width for mobile
  const logoHeight = logoWidth * (365.37 / 401);

  // 2. App Name proportion calculation (Design: W 600, H 84)
  const appNameWidth = logoWidth * (600 / 401);
  const appNameHeight = logoWidth * (84 / 401);

  // Calculate dynamic font size based on design height
  const fontSize = Math.max(18, appNameHeight * 0.45);

  // 3. Proportional vertical gap between bottom of logo and top of app name (Design: Gap is 138.63px for W 401 logo)
  const gapBetweenLogoAndText = logoWidth * (138.63 / 401);

  return (
    <View style={styles.container}>
      {/* Spacer to push content to middle */}
      <View style={{ flex: 1.5 }} />

      {/* Main Logo */}
      <View style={styles.logoContainer}>
        <Logo width={logoWidth} height={logoHeight} />
      </View>

      {/* Spinner & Spacer Area */}
      <View style={[styles.gapContainer, { height: gapBetweenLogoAndText }]}>
        <ActivityIndicator size="small" color="#29BD4F" />
      </View>

      {/* App Name Container with W 600, H 84 Aspect Ratio */}
      <View style={[styles.appNameContainer, { width: appNameWidth, height: appNameHeight }]}>
        <Text style={[styles.appName, { fontSize }]}>
          Reverse Image Search
        </Text>
      </View>

      {/* Spacer at bottom */}
      <View style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gapContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appNameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

