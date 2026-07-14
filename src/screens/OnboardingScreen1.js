import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image
} from 'react-native';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;
const scaleY = (SCREEN_HEIGHT - 100) / 2430;

// Camera reticle target vector illustration matching the uploaded screenshot coordinates
const TargetScannerGraphic = () => (
  <View style={styles.graphicContainer}>
    {/* Concentric circles and camera target replaced by the image asset */}
    <Image
      source={require('../components/Hero Illustration Container.png')}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 788 * scale,
        height: 788 * scale,
      }}
      resizeMode="contain"
    />
  </View>
);

export default function OnboardingScreen1({ onNext, onSkip }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" translucent={false} />

      {/* Top spacing header */}
      <View style={styles.header} />

      <View style={styles.contentContainer}>
        {/* Render circular visual target with badges */}
        <TargetScannerGraphic />

        {/* Text Info */}
        <View style={styles.textWrapper}>
          <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.slideTitle}>
            See the Unseen
          </Text>
          <Text style={styles.slideDescription}>
            Our advanced AI visual search engine identifies objects and art styles in seconds.
          </Text>
        </View>

        {/* Pagination dots indicators */}
        <View style={styles.paginationContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        {/* Bottom Button matches button layout properties */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={onNext}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.primaryButtonText}>
              Next →
            </Text>
          </Pressable>
        </View>

        {/* Native Ad Placeholder Card at the bottom */}
        <View style={styles.adPlaceholderCard}>
          <Text style={styles.adPlaceholderText}>Show Native AD</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  header: {
    height: 0,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  graphicContainer: {
    width: 788 * scale,
    height: 788 * scale,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 151.97 * scaleY,
    marginBottom: 64.37 * scaleY,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 25, 25, 0.85)',
    borderWidth: 1.5 * scale,
    borderColor: 'rgba(173, 199, 255, 0.25)',
    borderRadius: 40 * scale,
    paddingHorizontal: 28 * scale,
    paddingVertical: 14 * scale,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeDot: {
    width: 14 * scale,
    height: 14 * scale,
    borderRadius: 7 * scale,
    marginRight: 16 * scale,
  },
  badgeText: {
    color: '#E0E6F9',
    fontSize: 30 * scale,
    fontWeight: '600',
  },
  colorDnaBadge: {
    top: 140 * scale,
    right: 10 * scale,
  },
  patternBadge: {
    bottom: 180 * scale,
    left: -10 * scale,
  },
  textWrapper: {
    width: 953 * scale,
    alignItems: 'center',
    paddingHorizontal: 20 * scale,
  },
  slideTitle: {
    color: '#E2E2E8',
    fontSize: 56.16 * scale,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 74.9 * scale,
    letterSpacing: -1.4 * scale,
    width: 765.04 * scale,
    height: 74.88 * scale,
    alignSelf: 'center',
    marginBottom: 37.44 * scaleY,
  },
  slideDescription: {
    color: '#C1C6D7',
    fontSize: 37.44 * scale,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 80.8 * scale,
    letterSpacing: 0,
    width: 786 * scale,
    height: 183 * scale,
    alignSelf: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: 158.67 * scale,
    height: 14 * scale,
    marginTop: 87.34 * scaleY,
    marginBottom: 60 * scaleY,
  },
  dot: {
    height: 14 * scale,
    borderRadius: 7 * scale,
    marginHorizontal: 14 * scale,
  },
  dotActive: {
    width: 62.67 * scale,
    backgroundColor: '#ADC7FF',
  },
  dotInactive: {
    width: 20 * scale,
    backgroundColor: '#333539',
  },
  buttonContainer: {
    alignSelf: 'center',
    marginTop: 62 * scaleY,
  },
  primaryButton: {
    width: 953 * scale,
    height: 139 * scale,
    borderRadius: 15 * scale,
    backgroundColor: '#ADC7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#002E68',
    fontWeight: 'bold',
    fontSize: 45 * scale,
    letterSpacing: 0.5,
  },
  adPlaceholderCard: {
    width: 988 * scale,
    height: 612 * scale,
    backgroundColor: '#EDEEEF',
    borderRadius: 21 * scale,
    marginTop: 117 * scaleY,
    marginBottom: 45 * scale,
    position: 'relative',
    alignSelf: 'center',
  },
  adPlaceholderText: {
    position: 'absolute',
    top: 247 * scale,
    width: 569 * scale,
    height: 88 * scale,
    alignSelf: 'center',
    color: '#000000',
    fontSize: 72.8 * scale,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
