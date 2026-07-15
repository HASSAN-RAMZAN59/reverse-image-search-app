import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Image,
  Pressable,
} from 'react-native';
import { usePremium } from '../context/PremiumContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Original design dimensions of Remove Add.png
const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 2430;
const IMAGE_ASPECT_RATIO = DESIGN_WIDTH / DESIGN_HEIGHT;

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

  // Calculate layout dimensions to fit the screen while preserving aspect ratio exactly
  let containerWidth = SCREEN_WIDTH;
  let containerHeight = SCREEN_WIDTH / IMAGE_ASPECT_RATIO;

  // Scale down if the calculated height exceeds the available screen height
  if (containerHeight > SCREEN_HEIGHT) {
    containerHeight = SCREEN_HEIGHT;
    containerWidth = SCREEN_HEIGHT * IMAGE_ASPECT_RATIO;
  }

  // Scale factors for positioning hit targets relative to the aspect-ratio-locked container
  const scaleX = containerWidth / DESIGN_WIDTH;
  const scaleY = containerHeight / DESIGN_HEIGHT;

  return (
    <View style={styles.container}>
      {/* Set status bar to not merge with the design */}
      <StatusBar barStyle="light-content" backgroundColor="#131313" translucent={false} />

      {/* Aspect Ratio Locked Container to prevent distortion or low-resolution scaling */}
      <View style={{ width: containerWidth, height: containerHeight, position: 'relative', transform: [{ translateY: 50 * scaleY }] }}>
        <Image
          source={require('../components/Remove Add.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />

        {/* Close/Skip button hit target (top right area) */}
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [
            {
              position: 'absolute',
              top: 50 * scaleY,
              right: 50 * scaleX,
              width: 140 * scaleX,
              height: 140 * scaleY,
              borderRadius: 70 * scaleX,
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
            },
            pressed && styles.overlayPressed
          ]}
        />

        {/* CTA Button hit target (bottom button area) */}
        <Pressable
          onPress={handleStartTrial}
          style={({ pressed }) => [
            {
              position: 'absolute',
              bottom: 172 * scaleY,
              alignSelf: 'center',
              width: 953 * scaleX,
              height: 112 * scaleY,
              borderRadius: 25 * scaleX,
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
            },
            pressed && styles.overlayPressed
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313', // Seamless dark background to match the mockup
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlayPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
