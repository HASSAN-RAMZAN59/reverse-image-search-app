import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
  Pressable,
} from 'react-native';
import { usePremium } from '../context/PremiumContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;
const scaleY = (SCREEN_HEIGHT - 100) / 2430;

export default function PremiumVIPScreen({ navigation }) {
  const { unlockPremium, bypassPremium } = usePremium();

  const handleStartTrial = async () => {
    await unlockPremium();
    navigation.replace('Home');
  };

  const handleSkip = async () => {
    await bypassPremium();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" translucent={false} />

      {/* Main Full-Screen Mockup Image */}
      <Image
        source={require('../components/Remove Add.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />

      {/* Close/Skip button hit target (top right area) */}
      <Pressable
        onPress={handleSkip}
        style={({ pressed }) => [
          styles.closeButtonOverlay,
          pressed && styles.overlayPressed
        ]}
      />

      {/* CTA Button hit target (bottom button area) */}
      <Pressable
        onPress={handleStartTrial}
        style={({ pressed }) => [
          styles.ctaButtonOverlay,
          pressed && styles.overlayPressed
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  closeButtonOverlay: {
    position: 'absolute',
    top: 60 * scale,
    right: 60 * scale,
    width: 120 * scale,
    height: 120 * scale,
    borderRadius: 60 * scale,
    backgroundColor: 'rgba(255, 255, 255, 0.01)', // nearly transparent
  },
  ctaButtonOverlay: {
    position: 'absolute',
    bottom: 220 * scaleY,
    width: 953 * scale,
    height: 139 * scale,
    borderRadius: 15 * scale,
    backgroundColor: 'rgba(255, 255, 255, 0.01)', // nearly transparent
  },
  overlayPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
