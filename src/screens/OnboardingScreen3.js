import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;
const scaleY = (SCREEN_HEIGHT - 100) / 2430;

const SmartScannerIllustration = () => (
  <View style={styles.graphicContainer}>
    <Image
      source={require('../components/3D Tool Space Visualization_margin.png')}
      style={styles.illustrationImage}
      resizeMode="contain"
    />
  </View>
);

export default function OnboardingScreen3({ onNext }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" translucent={false} />

      {/* Top spacing header */}
      <View style={styles.header} />

      <View style={styles.contentContainer}>
        {/* Render circular visual illustration */}
        <SmartScannerIllustration />

        {/* Text Info */}
        <View style={styles.textWrapper}>
          <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.slideTitle}>
            Smart Scanner
          </Text>
          <Text style={styles.slideDescription}>
            Quickly scan QR codes, barcode labels, and text to pull up search results, product details, and link information.
          </Text>
        </View>

        {/* Pagination dots indicators */}
        <View style={styles.paginationContainer}>
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotActive]} />
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
              GET STARTED
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
  illustrationImage: {
    width: '100%',
    height: '100%',
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
