import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { usePremium } from '../context/PremiumContext';
import { DynamicImageCollageSvgXml } from '../components/DynamicImageCollageSvgXml';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;

// Modify the original SVG viewBox and size to show the full masked/offset collage area (890 x 1195.79)
const modifiedXml = DynamicImageCollageSvgXml
  .replace('viewBox="0 0 528 978"', 'viewBox="-362 -218 890 1195.79"')
  .replace('width="528"', 'width="890"')
  .replace('height="978"', 'height="1195.79"');

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E10" translucent={false} />

      {/* Collage Image 1 container positioned absolutely with Figma coordinates */}
      <View style={styles.imageContainerLeft}>
        <SvgXml
          xml={modifiedXml}
          width={890 * scale}
          height={1195.75 * scale}
        />
      </View>

      {/* Collage Image 2 container positioned absolutely with Figma coordinates */}
      <View style={styles.imageContainerRight}>
        <SvgXml
          xml={modifiedXml}
          width={890 * scale}
          height={1195.79 * scale}
        />
      </View>

      {/* Basic Functional Buttons positioned at the bottom */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleStartTrial}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: false }}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.buttonText}>Start Free Trial</Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', borderless: false }}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.skipButtonText}>Skip / Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10', // Dark background color from Figma specs
    position: 'relative',
  },
  imageContainerLeft: {
    position: 'absolute',
    left: -362 * scale,
    top: -218 * scale,
    width: 890 * scale,
    height: 1195.75 * scale,
  },
  imageContainerRight: {
    position: 'absolute',
    left: 552 * scale,
    top: -218 * scale,
    width: 890 * scale,
    height: 1195.79 * scale,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80 * scale,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40 * scale,
  },
  button: {
    width: 890 * scale,
    height: 110 * scale,
    backgroundColor: '#ADC7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15 * scale,
    marginBottom: 20 * scale,
    overflow: 'hidden', // Prevents click/ripple overlay showing outside the rounded container
  },
  buttonText: {
    color: '#002E68',
    fontWeight: 'bold',
    fontSize: 38 * scale,
  },
  skipButton: {
    width: 890 * scale,
    height: 110 * scale,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15 * scale,
    overflow: 'hidden', // Prevents ripple overflow
  },
  skipButtonText: {
    color: '#A0A3BD',
    fontSize: 34 * scale,
    textDecorationLine: 'underline',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
