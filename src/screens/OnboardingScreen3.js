import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;

const QRIllustration = () => (
  <Svg width={534 * scale} height={534 * scale} viewBox="0 0 200 200" fill="none">
    <Defs>
      <LinearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#86FF29" />
        <Stop offset="100%" stopColor="#00E5FF" />
      </LinearGradient>
    </Defs>
    <Path d="M45 60V45H60" stroke="url(#greenGrad)" strokeWidth="4" strokeLinecap="round" />
    <Path d="M155 60V45H140" stroke="url(#greenGrad)" strokeWidth="4" strokeLinecap="round" />
    <Path d="M45 140V155H60" stroke="url(#greenGrad)" strokeWidth="4" strokeLinecap="round" />
    <Path d="M155 140V155H140" stroke="url(#greenGrad)" strokeWidth="4" strokeLinecap="round" />
    <G transform="translate(60, 60)" stroke="#FFFFFF" strokeWidth="3">
      <Rect x="0" y="0" width="24" height="24" rx="4" fill="transparent" />
      <Rect x="6" y="6" width="12" height="12" rx="2" fill="#FFFFFF" />
      <Rect x="56" y="0" width="24" height="24" rx="4" fill="transparent" />
      <Rect x="62" y="6" width="12" height="12" rx="2" fill="#FFFFFF" />
      <Rect x="0" y="56" width="24" height="24" rx="4" fill="transparent" />
      <Rect x="6" y="62" width="12" height="12" rx="2" fill="#FFFFFF" />
      <Rect x="36" y="10" width="8" height="8" rx="1" fill="#86FF29" stroke="none" />
      <Rect x="36" y="36" width="14" height="14" rx="2" fill="#FFFFFF" stroke="none" />
      <Rect x="56" y="56" width="8" height="8" rx="1" fill="#86FF29" stroke="none" />
      <Rect x="68" y="68" width="12" height="12" rx="2" fill="#FFFFFF" stroke="none" />
      <Rect x="10" y="36" width="12" height="8" rx="1.5" fill="#FFFFFF" stroke="none" />
    </G>
    <Path d="M35 100H165" stroke="#FF2929" strokeWidth="3" strokeLinecap="round" />
    <Rect x="35" y="97" width="130" height="6" fill="#FF2929" opacity="0.15" />
  </Svg>
);

export default function OnboardingScreen3({ onNext }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" translucent={false} />
      
      {/* Top empty header for vertical alignment parity */}
      <View style={styles.header} />

      <View style={styles.slideContainer}>
        {/* Illustration */}
        <View style={styles.illustrationWrapper}>
          <QRIllustration />
        </View>
        
        {/* Text Info */}
        <View style={styles.textWrapper}>
          <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.slideTitle}>
            Smart Scanner
          </Text>
          <Text style={styles.slideDescription}>
            Quickly scan QR codes, barcode labels, and text to pull up search results, product details, and link information.
          </Text>
        </View>
      </View>

      {/* Pagination dots indicators */}
      <View style={styles.paginationContainer}>
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      {/* Bottom Button */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
    justifyContent: 'space-between',
  },
  header: {
    height: 60 * scale,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 63 * scale,
    marginTop: 20 * scale,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 100 * scale,
  },
  illustrationWrapper: {
    width: 534 * scale,
    height: 534 * scale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 120 * scale,
  },
  textWrapper: {
    width: 953 * scale,
    alignItems: 'center',
    paddingHorizontal: 20 * scale,
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 70 * scale,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40 * scale,
    width: '100%',
  },
  slideDescription: {
    color: '#A0A3BD',
    fontSize: 42 * scale,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 64 * scale,
    letterSpacing: 0.2,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 60 * scale,
  },
  dot: {
    height: 24 * scale,
    borderRadius: 12 * scale,
    marginHorizontal: 12 * scale,
  },
  dotActive: {
    width: 60 * scale,
    backgroundColor: '#ADC7FF',
  },
  dotInactive: {
    width: 24 * scale,
    backgroundColor: '#3A3A3C',
  },
  buttonContainer: {
    alignSelf: 'center',
    marginBottom: 119 * scale,
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
    color: '#131313',
    fontWeight: 'bold',
    fontSize: 45 * scale,
    letterSpacing: 0.5,
  },
});
