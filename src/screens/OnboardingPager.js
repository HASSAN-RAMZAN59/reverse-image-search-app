import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import OnboardingScreen1 from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';
import OnboardingScreen3 from './OnboardingScreen3';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingPager({ navigation }) {
  const scrollViewRef = useRef(null);

  const handleNextToPage2 = () => {
    scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
  };

  const handleNextToPage3 = () => {
    scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * 2, animated: true });
  };

  const handleGoToPaywall = () => {
    navigation.navigate('PremiumVIP');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: '#131313' }}
      >
        <View style={{ width: SCREEN_WIDTH }}>
          <OnboardingScreen1
            onNext={handleNextToPage2}
            onSkip={handleGoToPaywall}
          />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <OnboardingScreen2
            onNext={handleNextToPage3}
            onSkip={handleGoToPaywall}
          />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <OnboardingScreen3
            onNext={handleGoToPaywall}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
});
