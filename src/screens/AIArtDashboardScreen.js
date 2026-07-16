import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  BackHandler,
  Image,
  ScrollView,
} from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;

// Figma specs: W:960, H:640 — scale proportionally to screen width
const HERO_WIDTH = SCREEN_WIDTH;
const HERO_HEIGHT = (640 / 960) * SCREEN_WIDTH;

const menuXml = `<svg width="51" height="41" viewBox="0 0 51 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 4.5H46.5M4.5 20.5H46.5M4.5 36.5H22.875" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default function AIArtDashboardScreen({ navigation, isTab, onOpenDrawer }) {
  useEffect(() => {
    const onBackPress = () => {
      if (isTab) {
        // In tab mode — navigate to Home tab
        navigation?.navigate('Home');
        return true;
      }
      // In stack mode — go back to previous screen (e.g. AIArtDashboard → wherever)
      navigation?.goBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [navigation, isTab]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        {isTab ? (
          <TouchableOpacity style={styles.menuBtn} onPress={onOpenDrawer}>
            <SvgXml xml={menuXml} width={42 * scale} height={32 * scale} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Image Search</Text>
        <TouchableOpacity onPress={() => navigation?.navigate('PremiumVIP')} activeOpacity={0.8}>
          <Image
            source={require('../components/image 30.png')}
            style={styles.headerCrown}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Galaxy Image */}
        <View style={styles.heroContainer}>
          <Image
            source={require('../components/Mask group.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Gradient overlay at bottom so text blends nicely */}
          <View style={styles.heroOverlay} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroSubtitle}>Unleash your</Text>
            <Text style={styles.heroTitle}>Creativity</Text>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.content}>

          {/* Card 1: AI Prompt Studio */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation?.navigate('AIImageScreen')}
            activeOpacity={0.75}
          >
            {/* Icon placeholder — import your icon here */}
            <View style={[styles.iconBox, { backgroundColor: '#3B5BDB' }]} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>AI Prompt Studio</Text>
              <View style={styles.creditRow}>
                <View style={styles.greenDot} />
                <Text style={styles.cardSubtitle}>5/5 Credits Left</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#555" />
          </TouchableOpacity>

          {/* Card 2: Custom AI Models */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation?.navigate('AIRemix')}
            activeOpacity={0.75}
          >
            {/* Icon placeholder — import your icon here */}
            <View style={[styles.iconBox, { backgroundColor: '#7950F2' }]} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Custom AI Models</Text>
              <Text style={styles.cardSubtitle}>Train unique styles</Text>
            </View>
            <ChevronRight size={18} color="#555" />
          </TouchableOpacity>

          {/* Card 3: Saved Gallery */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation?.navigate('Downloads', { isAIOnly: true })}
            activeOpacity={0.75}
          >
            {/* Icon placeholder — import your icon here */}
            <View style={[styles.iconBox, { backgroundColor: '#2C2C38' }]} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Saved Gallery</Text>
              <Text style={styles.cardSubtitle}>Access your creations</Text>
            </View>
            <ChevronRight size={18} color="#555" />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  header: {
    height: Platform.OS === 'android' ? 56 + StatusBar.currentHeight : 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#131313',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 4,
  },
  menuBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCrown: {
    width: 94 * scale,
    height: 94 * scale,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'medium',
    letterSpacing: 0,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
  },
  scrollContent: {
    flexGrow: 1,
  },
  /* ── Hero Image ── */
  heroContainer: {
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.5,
    // Simulated gradient from transparent to #131313
    backgroundColor: 'transparent',
    backgroundImage: undefined, // not supported in RN — use LinearGradient if needed
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    lineHeight: 48,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  /* ── Cards ── */
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
    backgroundColor: '#1C1C26',
    borderRadius: 14,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  cardSubtitle: {
    color: '#6E6E80',
    fontSize: 13,
    marginTop: 3,
    fontFamily: 'Inter-Regular',
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 5,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
});
