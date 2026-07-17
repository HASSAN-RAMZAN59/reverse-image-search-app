import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  PanResponder,
  Modal,
  Animated,
  ScrollView,
  Platform,
  StatusBar,
  Share,
  Linking,
  BackHandler,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  Search,
  Mic,
  Image as ImageIcon,
  Camera,
  Trash2,
  X,
  Check,
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Menu,
  Headphones,
  Star,
  Share2,
  Shield,
  FileText,
  ArrowLeft,
  Send,
  Sparkles,
  QrCode,
  Download,
  Compass,
  History,
} from 'lucide-react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import Logo from '../components/Logo';
import { usePremium } from '../context/PremiumContext';
import { addHistoryEntry } from '../utils/historyManager';
import AppDrawer from '../components/AppDrawer';
import AIArtDashboardScreen from './AIArtDashboardScreen';
import HistoryScreen from './HistoryScreen';
import DownloadsScreen from './DownloadsScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;
const HERO_IMAGE_HEIGHT = 250;

export default function HomeScreen({ route, onSearch, navigation }) {
  const { isPremiumUser } = usePremium();
  const [activeTab, setActiveTab] = useState('explore');
  const [downloadsIsAIOnly, setDownloadsIsAIOnly] = useState(false);

  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
      if (route.params.tab === 'downloads') {
        setDownloadsIsAIOnly(route.params.isAIOnly ?? false);
      }
      navigation.setParams({ tab: undefined, isAIOnly: undefined });
    }
  }, [route?.params?.tab, route?.params?.isAIOnly]);

  const handleFeaturePress = (feature) => {
    // Commented out premium gating logic for now
    /*
    if (feature.isPremiumRequired && !isPremiumUser) {
      navigation.navigate('PremiumVIP');
    } else {
      navigation.navigate(feature.targetScreen);
    }
    */
    navigation.navigate(feature.targetScreen);
  };

  const [searchText, setSearchText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isListeningModalVisible, setIsListeningModalVisible] = useState(false);
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (route?.params?.triggerAction) {
      const action = route.params.triggerAction;
      navigation.setParams({ triggerAction: undefined });
      setTimeout(() => {
        acquireImage(action);
      }, 300);
    }
  }, [route?.params?.triggerAction, route?.params?.timestamp]);

  // Intercept hardware back button — close editor/crop if open, stay on Home otherwise
  useEffect(() => {
    let isFocused = true;

    const focusSub = navigation?.addListener('focus', () => {
      isFocused = true;
    });

    const blurSub = navigation?.addListener('blur', () => {
      isFocused = false;
    });

    const onBackPress = () => {
      if (!isFocused) return false;

      if (cropMode) {
        setCropMode(false);
        return true;
      }

      if (editorUri) {
        setEditorUri(null);
        setImageUri(null);
        return true;
      }

      if (activeTab !== 'explore') {
        setActiveTab('explore');
        return true;
      }
      return true; // stay on Home
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      focusSub?.();
      blurSub?.();
      sub.remove();
    };
  }, [editorUri, cropMode, activeTab, navigation]);

  const handleOpenSavedDownloads = () => {
    setDownloadsIsAIOnly(false);
    setActiveTab('downloads');
  };



  // Speech Recognition Event Listeners
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setIsListeningModalVisible(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    setIsListeningModalVisible(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results.map((r) => r.transcript).join(' ');
      setSearchText(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    setIsListeningModalVisible(false);
  });

  const handleMicPress = async () => {
    if (isListening) {
      try {
        await ExpoSpeechRecognitionModule.stop();
      } catch (err) {
        console.error('Failed to stop speech recognition:', err);
      }
    } else {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Denied',
          'Microphone and speech recognition permissions are required for voice search.'
        );
        return;
      }

      try {
        setSearchText(''); // Clear search text for new voice input
        await ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          continuous: false, // Set to false to automatically end on silence!
        });
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Editor States
  const [editorUri, setEditorUri] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [container, setContainer] = useState({ width: 300, height: 300 });
  const [cropBox, setCropBox] = useState({ left: 50, top: 50, width: 200, height: 200 });

  const cropBoxRef = useRef(cropBox);
  const containerSizeRef = useRef({ width: 300, height: 300 });
  const activeActionRef = useRef(null);
  const startBoxRef = useRef({ left: 50, top: 50, width: 200, height: 200 });

  useEffect(() => { cropBoxRef.current = cropBox; }, [cropBox]);
  useEffect(() => { containerSizeRef.current = container; }, [container]);

  const updateContainerSize = (w, h) => {
    const maxW = SCREEN_WIDTH - 40, maxH = SCREEN_HEIGHT - 280;
    let displayW = maxW, displayH = (h / w) * displayW;
    if (displayH > maxH) { displayH = maxH; displayW = (w / h) * displayH; }
    setContainer({ width: displayW, height: displayH });
    const boxSize = Math.min(displayW, displayH) * 0.8;
    setCropBox({ left: (displayW - boxSize) / 2, top: (displayH - boxSize) / 2, width: boxSize, height: boxSize });
  };

  const startEditing = (uri, width, height) => {
    setEditorUri(uri);
    setCropMode(false);
    setImageSize({ width, height });
    updateContainerSize(width, height);
  };

  const acquireImage = async (source) => {
    const isCamera = source === 'camera';
    const { status } = isCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', `Please grant ${isCamera ? 'camera' : 'library'} permissions.`);
      return;
    }

    const result = isCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images', allowsEditing: false, quality: 1 });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const asset = result.assets[0];
      startEditing(asset.uri, asset.width, asset.height);
    }
  };

  const cropPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { startBoxRef.current = { ...cropBoxRef.current }; },
      onPanResponderMove: (evt, gestureState) => {
        const action = activeActionRef.current;
        const start = startBoxRef.current;
        const { width: cW, height: cH } = containerSizeRef.current;
        const dx = gestureState.dx, dy = gestureState.dy;

        let left = start.left, top = start.top, width = start.width, height = start.height;

        if (action === 'drag') {
          left = Math.max(0, Math.min(start.left + dx, cW - start.width));
          top = Math.max(0, Math.min(start.top + dy, cH - start.height));
        } else {
          if (action.includes('l')) { left = Math.max(0, Math.min(start.left + dx, start.left + start.width - 10)); width = start.left + start.width - left; }
          if (action.includes('r')) { width = Math.max(10, Math.min(start.width + dx, cW - start.left)); }
          if (action.includes('t')) { top = Math.max(0, Math.min(start.top + dy, start.top + start.height - 10)); height = start.top + start.height - top; }
          if (action.includes('b')) { height = Math.max(10, Math.min(start.height + dy, cH - start.top)); }
        }
        setCropBox({ left, top, width, height });
      },
    })
  ).current;

  const manipulateImage = async (actions) => {
    if (busy) return;
    try {
      setBusy(true);
      const result = await ImageManipulator.manipulateAsync(editorUri, actions, { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
      setEditorUri(result.uri);
      return result;
    } catch (err) {
      Alert.alert('Error', 'Failed to edit image.');
    } finally {
      setBusy(false);
    }
  };

  const applyCrop = async () => {
    const sX = imageSize.width / container.width, sY = imageSize.height / container.height;
    const w = Math.round(cropBox.width * sX), h = Math.round(cropBox.height * sY);
    const result = await manipulateImage([{ crop: { originX: Math.round(cropBox.left * sX), originY: Math.round(cropBox.top * sY), width: w, height: h } }]);
    if (result) {
      setImageSize({ width: result.width, height: result.height });
      updateContainerSize(result.width, result.height);
      setCropMode(false);
    }
  };

  const handleRotate = async () => {
    const result = await manipulateImage([{ rotate: 90 }]);
    if (result) {
      setImageSize({ width: result.width, height: result.height });
      updateContainerSize(result.width, result.height);
    }
  };

  // RENDER EDITOR VIEW OVERLAY
  if (editorUri) {
    return (
      <SafeAreaView style={styles.editorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        {/* Header */}
        <View style={styles.editorHeader}>
          <Text style={styles.editorHeaderTitle}>Image Search</Text>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              const finalUri = editorUri;
              setEditorUri(null);
              setImageUri(null);
              addHistoryEntry('image', finalUri);
              if (navigation) {
                navigation.navigate('Result', { searchQuery: '', imageUri: finalUri });
              } else {
                onSearch?.('', finalUri);
              }
            }}
            disabled={busy}
          >
            <Text style={styles.editorHeaderTick}>✓</Text>
          </TouchableOpacity>
        </View>

        {/* Workspace */}
        <View style={styles.editorWorkspace}>
          {busy && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}

          <View style={styles.imageContainer}>
            <Image source={{ uri: editorUri }} style={styles.editorImage} resizeMode="contain" />

            {cropMode && (
              <View style={styles.cropOverlayContainer}>
                <View
                  {...cropPanResponder.panHandlers}
                  onTouchStart={() => { activeActionRef.current = 'drag'; }}
                  style={[styles.cropBox, { left: cropBox.left, top: cropBox.top, width: cropBox.width, height: cropBox.height }]}
                >
                  {/* Grid Guidelines */}
                  {[{ top: 0, bottom: 0, left: '33.33%', width: 1 }, { top: 0, bottom: 0, left: '66.66%', width: 1 }, { left: 0, right: 0, top: '33.33%', height: 1 }, { left: 0, right: 0, top: '66.66%', height: 1 }].map((s, i) => (
                    <View key={i} style={[styles.gridLine, s]} />
                  ))}

                  {/* Corner Styling */}
                  {[{ top: -3, left: -3, borderLeftWidth: 4, borderTopWidth: 4 }, { top: -3, right: -3, borderRightWidth: 4, borderTopWidth: 4 }, { bottom: -3, left: -3, borderLeftWidth: 4, borderBottomWidth: 4 }, { bottom: -3, right: -3, borderRightWidth: 4, borderBottomWidth: 4 }].map((s, i) => (
                    <View key={i} style={[styles.cornerBorder, s]} />
                  ))}

                  {/* Touch Targets */}
                  {[{ a: 'tl', t: -18, l: -18 }, { a: 'tr', t: -18, r: -18 }, { a: 'bl', b: -18, l: -18 }, { a: 'br', b: -18, r: -18 }].map(c => (
                    <View key={c.a} onTouchStart={e => { e.stopPropagation(); activeActionRef.current = c.a; }} style={[styles.touchHandle, { top: c.t, bottom: c.b, left: c.l, right: c.r }]} />
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>


        {/* Image Editor Tab Bar */}
        <View style={styles.editorTabBar}>
          {/* Active indicator - slides under active tab */}
          <View style={[
            styles.editorTabIndicator,
            cropMode
              ? { left: 0 }
              : { left: SCREEN_WIDTH / 4 }
          ]} />

          {/* Tab 1: Crop */}
          <TouchableOpacity
            style={styles.editorTab}
            onPress={() => setCropMode(!cropMode)}
            disabled={busy}
          >
            <Image
              source={require('../components/Group 46.png')}
              style={[
                styles.editorTabIcon,
                cropMode && { tintColor: '#007AFF' },
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Tab 2: Rotate */}
          <TouchableOpacity
            style={styles.editorTab}
            onPress={handleRotate}
            disabled={busy}
          >
            <Image
              source={require('../components/Vector (1).png')}
              style={styles.editorTabIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Tab 3: Flip Left/Right */}
          <TouchableOpacity
            style={styles.editorTab}
            onPress={() => manipulateImage([{ flip: ImageManipulator.FlipType.Horizontal }])}
            disabled={busy}
          >
            <Image
              source={require('../components/Vector (2).png')}
              style={styles.editorTabIconFlip}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Tab 4: Flip Up/Down */}
          <TouchableOpacity
            style={styles.editorTab}
            onPress={() => manipulateImage([{ flip: ImageManipulator.FlipType.Vertical }])}
            disabled={busy}
          >
            <Image
              source={require('../components/Vector (3).png')}
              style={styles.editorTabIconFlipV}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Crop Apply/Cancel Overlay when crop mode active */}
        {cropMode && (
          <View style={styles.cropActionContainer}>
            <TouchableOpacity style={styles.cropActionBtnCancel} onPress={() => setCropMode(false)}>
              <Text style={styles.cropActionTextCancel}>Cancel Crop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cropActionBtnApply} onPress={applyCrop}>
              <Text style={styles.cropActionTextApply}>Apply Crop</Text>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>
    );
  }

  // Helper to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate_ai':
        return (
          <AIArtDashboardScreen
            navigation={navigation}
            isTab={true}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            navigation={navigation}
            isTab={true}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      case 'downloads':
        return (
          <DownloadsScreen
            route={{ params: { isAIOnly: downloadsIsAIOnly } }}
            navigation={navigation}
            isTab={true}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      case 'explore':
      default:
        return (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#0E0E10' }}>

            {/* ── Dark Header Bar (normal flow, like AI Art Dashboard) ── */}
            <View style={styles.exploreHeader}>
              <View style={styles.exploreHeaderLeft}>
                <TouchableOpacity style={styles.exploreMenuBtn} onPress={() => setIsDrawerOpen(true)}>
                  <View style={styles.customMenuLine} />
                  <View style={styles.customMenuLine} />
                  <View style={[styles.customMenuLine, styles.customMenuLineShort]} />
                </TouchableOpacity>
                <Text style={styles.exploreHeaderTitle}>Image Search</Text>
              </View>
              <TouchableOpacity style={styles.explorePremiumBtn} onPress={() => navigation?.navigate('PremiumVIP')}>
                <Image
                  source={require('../components/image 30.png')}
                  style={styles.explorePremiumIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* ── Hero Image — directly below header ── */}
            <Image
              source={require('../components/lucid-origin_Abstract_cinematic_scene_of_a_glowing_human_hand_palm-up_with_countless_intercon-0.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* ── Scrollable Content — search bar + action buttons ── */}
            <ScrollView
              style={{ flex: 1, backgroundColor: '#0E0E10' }}
              contentContainerStyle={styles.exploreScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Image
                  source={require('../components/Group 1000007000.png')}
                  style={styles.searchBackground}
                  resizeMode="stretch"
                />
                <TouchableOpacity
                  style={styles.searchIconOverlay}
                  onPress={() => {
                    if (searchText.trim()) {
                      addHistoryEntry('text', searchText.trim());
                      if (navigation) {
                        navigation.navigate('Result', { searchQuery: searchText, imageUri: null });
                      } else {
                        onSearch?.(searchText, null);
                      }
                    } else {
                      setIsInputInvalid(true);
                    }
                  }}
                />
                <TextInput
                  style={[styles.inputOverlay, isInputInvalid && styles.inputInvalidOverlay]}
                  placeholder={isListening ? "Listening..." : "Upload and Search"}
                  placeholderTextColor="#9AA0A6"
                  value={searchText}
                  onChangeText={(text) => {
                    setSearchText(text);
                    if (text.trim()) setIsInputInvalid(false);
                  }}
                  onSubmitEditing={() => {
                    if (searchText.trim()) {
                      addHistoryEntry('text', searchText.trim());
                      if (navigation) {
                        navigation.navigate('Result', { searchQuery: searchText, imageUri: null });
                      } else {
                        onSearch?.(searchText, null);
                      }
                    }
                  }}
                />
                <TouchableOpacity style={styles.micButtonOverlay} onPress={handleMicPress} />
                <TouchableOpacity
                  style={styles.cameraButtonOverlay}
                  onPress={() => navigation?.navigate('LensCamera')}
                />
              </View>

              {/* Visual Search (Gallery) Button */}
              <TouchableOpacity
                style={styles.visualSearchBtn}
                onPress={() => acquireImage('gallery')}
              >
                <Image
                  source={require('../components/Group 1000006996.png')}
                  style={styles.actionBtnImage}
                  resizeMode="stretch"
                />
              </TouchableOpacity>

              {/* Row for Camera and AI Art Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.squareBtn} onPress={() => acquireImage('camera')}>
                  <Image
                    source={require('../components/Group 1000006997.png')}
                    style={styles.actionBtnImage}
                    resizeMode="stretch"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.squareBtn} onPress={() => setActiveTab('generate_ai')}>
                  <Image
                    source={require('../components/Group 1000006998.png')}
                    style={styles.actionBtnImage}
                    resizeMode="stretch"
                  />
                </TouchableOpacity>
              </View>

              {/* Scan QR Code Button */}
              <TouchableOpacity
                style={styles.qrCodeBtn}
                onPress={() => navigation?.navigate('QRScanner')}
              >
                <Image
                  source={require('../components/Group 1000007001.png')}
                  style={styles.actionBtnImage}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            </ScrollView>

          </SafeAreaView>
        );
    }
  };

  // RENDER HOME VIEW
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Render the active tab content */}
      <View style={{ flex: 1 }}>
        {renderTabContent()}
      </View>

      {/* Voice Search Overlay Modal */}
      <Modal
        visible={isListeningModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleMicPress}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={handleMicPress}
          />
          <View style={styles.modalContent}>
            {/* Logo space placeholder / Microphone circles */}
            <TouchableOpacity
              style={styles.micRippleOuter}
              activeOpacity={0.8}
              onPress={handleMicPress}
            >
              <View style={styles.micRippleInner}>
                <Mic size={40} color="#2A303D" />
              </View>
            </TouchableOpacity>

            {/* Speaking / Listening Text */}
            <Text style={styles.listeningTitle}>
              {searchText ? searchText : "Search By Text"}
            </Text>

            {/* Language Text at bottom */}
            <Text style={styles.languageText}>English (Pakistan)</Text>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomTab} onPress={() => setActiveTab('explore')}>
          <Image
            source={require('../components/si_ai-search-fill.png')}
            style={[styles.exploreIcon, { tintColor: activeTab === 'explore' ? '#007AFF' : '#A0A3BD' }]}
          />
          <Text style={[styles.bottomTabText, activeTab === 'explore' && styles.bottomTabActiveText]}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomTab} onPress={() => setActiveTab('generate_ai')}>
          <Image
            source={require('../components/mingcute_ai-fill.png')}
            style={[styles.generateAiIcon, { tintColor: activeTab === 'generate_ai' ? '#007AFF' : '#A0A3BD' }]}
          />
          <Text style={[styles.bottomTabText, activeTab === 'generate_ai' && styles.bottomTabActiveText]}>Generate AI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomTab} onPress={() => setActiveTab('history')}>
          <Image
            source={require('../components/material-symbols_history-rounded.png')}
            style={[styles.historyIcon, { tintColor: activeTab === 'history' ? '#007AFF' : '#A0A3BD' }]}
          />
          <Text style={[styles.bottomTabText, activeTab === 'history' && styles.bottomTabActiveText]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomTab} onPress={handleOpenSavedDownloads}>
          <Image
            source={require('../components/material-symbols_download-rounded.png')}
            style={[styles.downloadIcon, { tintColor: activeTab === 'downloads' ? '#007AFF' : '#A0A3BD' }]}
          />
          <Text style={[styles.bottomTabText, activeTab === 'downloads' && styles.bottomTabActiveText]}>Downloads</Text>
        </TouchableOpacity>
      </View>

      {/* AppDrawer Overlay */}
      <AppDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Home Styles
  container: { flex: 1, backgroundColor: '#0E0E10' },
  heroImage: {
    width: 960 * scale,
    height: 640 * scale,
    alignSelf: 'center',
    borderRadius: 48 * scale,
    overflow: 'hidden',
  },

  // ── Explore Tab Header (AI Art Dashboard style) ──
  exploreHeader: {
    height: Platform.OS === 'android' ? 56 + StatusBar.currentHeight : 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#0E0E10',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  exploreHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  exploreMenuBtn: {
    justifyContent: 'space-between',
    height: 32 * scale,
    width: 42 * scale,
  },
  exploreHeaderTitle: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 48.68 * scale,
    fontWeight: 'bold',
  },
  explorePremiumBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  explorePremiumIcon: {
    width: 94 * scale,
    height: 94 * scale,
  },
  exploreScrollContent: {
    paddingTop: 6 * scale,
    paddingBottom: 20 * scale,
    alignItems: 'center',
  },

  functionalContentWrapper: {
    position: 'absolute',
    top: HERO_IMAGE_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    height: Platform.OS === 'android' ? 56 + StatusBar.currentHeight : 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#0E0E10',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  menuButton: {
    position: 'absolute',
    left: 61 * scale,
    top: 212 * scale,
    width: 42 * scale,
    height: 32 * scale,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  customMenuLine: {
    width: 42 * scale,
    height: 9 * scale,
    backgroundColor: '#FFF',
    borderRadius: 4.5 * scale,
  },
  customMenuLineShort: {
    width: 21 * scale,
  },
  headerTitle: {
    position: 'absolute',
    left: 171 * scale,
    top: 195 * scale,
    width: 318 * scale,
    height: 58 * scale,
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 48.68 * scale,
    fontWeight: 'bold',
    zIndex: 10,
  },
  savedDownloadsBtn: { padding: 4 },
  content: {
    position: 'absolute',
    left: 46 * scale,
    top: 177 * scale,
    right: 46 * scale,
    bottom: 181 * scale,
    backgroundColor: '#0E0E10',
  },
  contentContainer: {
    paddingBottom: 40 * scale,
  },
  searchContainer: {
    alignSelf: 'center',
    width: 923 * scale,
    height: 147.57 * scale,
    marginBottom: 10 * scale,
  },
  searchBackground: {
    width: '100%',
    height: '100%',
  },
  searchIconOverlay: {
    position: 'absolute',
    left: 40 * scale,
    top: 0,
    width: 80 * scale,
    height: 147.57 * scale,
    zIndex: 20,
  },
  inputOverlay: {
    position: 'absolute',
    left: 130 * scale,
    top: 8 * scale,
    width: 570 * scale,
    height: (147.57 - 16) * scale,
    color: '#FFF',
    fontSize: 40 * scale,
    backgroundColor: '#282a2e',
    paddingHorizontal: 10 * scale,
    fontFamily: 'Inter',
    zIndex: 20,
  },
  inputInvalidOverlay: {
    borderColor: '#EF4444',
    borderWidth: 1.5 * scale,
    borderRadius: 10 * scale,
  },
  micButtonOverlay: {
    position: 'absolute',
    left: 710 * scale,
    top: 0,
    width: 80 * scale,
    height: 147.57 * scale,
    zIndex: 20,
  },
  cameraButtonOverlay: {
    position: 'absolute',
    left: 800 * scale,
    top: 0,
    width: 100 * scale,
    height: 147.57 * scale,
    zIndex: 20,
  },
  visualSearchBtn: {
    width: 923 * scale,
    height: 352 * scale,
    marginTop: 4 * scale,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 923 * scale,
    alignSelf: 'center',
    marginTop: 18 * scale,
  },
  squareBtn: {
    width: 440 * scale,
    height: 440 * scale,
  },
  qrCodeBtn: {
    width: 923 * scale,
    height: 200 * scale,
    marginTop: 18 * scale,
    alignSelf: 'center',
  },
  actionBtnImage: {
    width: '100%',
    height: '100%',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 30 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, height: 48, borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#FFF', backgroundColor: '#1C1C1E' },
  inputInvalid: { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#2C1414' },
  iconButton: { width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8, backgroundColor: '#007AFF' },
  iconButtonActive: { backgroundColor: '#3A1010', borderWidth: 1, borderColor: '#EF4444' },
  searchButton: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  actionButton: { flexDirection: 'row', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15, backgroundColor: '#007AFF' },
  btnIcon: { marginRight: 10 },
  actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  previewContainer: { alignItems: 'center', marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#333', borderRadius: 8 },
  previewImage: { width: 150, height: 150, borderRadius: 8, resizeMode: 'cover', marginBottom: 10 },
  previewActions: { flexDirection: 'row', alignItems: 'center' },
  imageSearchBtn: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginRight: 10 },
  imageSearchBtnText: { color: '#FFF', fontWeight: '600' },
  trashBtn: { padding: 8, borderWidth: 1, borderColor: '#3A1010', borderRadius: 6, backgroundColor: '#200808' },
  exploreIcon: {
    width: 50 * scale,
    height: 50 * scale,
    tintColor: '#007AFF',
  },
  generateAiIcon: {
    width: 50 * scale,
    height: 50 * scale,
    tintColor: '#A0A3BD',
  },
  historyIcon: {
    width: 50 * scale,
    height: 50 * scale,
    tintColor: '#A0A3BD',
  },
  downloadIcon: {
    width: 50 * scale,
    height: 50 * scale,
    tintColor: '#A0A3BD',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 181 * scale,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 30 * scale : 10 * scale,
    zIndex: 30,
  },
  bottomTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  bottomTabText: {
    fontFamily: 'Geist',
    fontSize: 35 * scale,
    color: '#A0A3BD',
    marginTop: 10 * scale,
  },
  bottomTabActiveText: {
    color: '#007AFF',
  },
  premiumHeaderBtn: {
    position: 'absolute',
    left: 938 * scale,
    top: 177 * scale,
    width: 94 * scale,
    height: 94 * scale,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  premiumHeaderIcon: {
    width: '100%',
    height: '100%',
  },

  // Editor Styles
  editorContainer: { flex: 1, backgroundColor: '#000' },
  editorHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 312 * scale,
    backgroundColor: '#000',
    zIndex: 30,
    justifyContent: 'flex-end',
    paddingBottom: 20 * scale,
  },
  headerBtn: { position: 'absolute', right: 16, bottom: 20 * scale, padding: 8 },
  editorHeaderTitle: {
    position: 'absolute',
    left: 46 * scale,
    bottom: 20 * scale,
    width: 318 * scale,
    height: 58 * scale,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 48.68 * scale,
    lineHeight: 48.68 * scale * 1.2,
    letterSpacing: 0,
  },
  editorHeaderTick: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 48.68 * scale,
    lineHeight: 48.68 * scale * 1.2,
  },
  editorWorkspace: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10, justifyContent: 'center', alignItems: 'center' },
  imageContainer: {
    position: 'absolute',
    left: 0,
    top: 312 * scale,
    width: '100%',
    height: (2130 - 312) * scale,
    overflow: 'hidden',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorImage: { width: '100%', height: '100%' },
  cropOverlayContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  cropBox: { position: 'absolute', borderWidth: 2, borderColor: '#FFF', backgroundColor: 'transparent' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  cornerBorder: { position: 'absolute', width: 20, height: 20, borderColor: '#FFF' },
  touchHandle: { position: 'absolute', width: 36, height: 36, backgroundColor: 'rgba(255, 255, 255, 0.35)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.6)', zIndex: 100 },
  cropActionContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: '#000' },
  cropActionBtnCancel: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  cropActionTextCancel: { color: '#FFF', fontSize: 14 },
  cropActionBtnApply: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#007AFF' },
  cropActionTextApply: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  editorTabBar: {
    position: 'absolute',
    left: 0,
    top: 2130 * scale,
    width: 1080 * scale,
    height: 166 * scale,
    backgroundColor: '#ADC7FF',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  editorTab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 106 * scale,
    height: 7 * scale,
    backgroundColor: '#131313',
    borderRadius: 3.5 * scale,
  },
  editorTabIcon: {
    width: 83.33 * scale,
    height: 83.33 * scale,
    tintColor: '#131313',
  },
  editorTabIconFlip: {
    width: 73.5 * scale,
    height: 81.66 * scale,
    tintColor: '#131313',
  },
  editorTabIconFlipV: {
    width: 80 * scale,
    height: 70.01 * scale,
    tintColor: '#131313',
  },
  adBannerContainer: {
    position: 'absolute',
    left: 0,
    top: 324 * scale,
    width: 1080 * scale,
    height: 258 * scale,
    backgroundColor: '#EDEEEF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  adBannerBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEEEF',
  },
  adBannerLabel: {
    position: 'absolute',
    left: 350 * scale,
    top: 85 * scale,
    width: 379 * scale,
    height: 88 * scale,
    color: '#9AA0A6',
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 72.8 * scale,
    letterSpacing: 0,
  },

  // Voice Search Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 22, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
  },
  micRippleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#303134',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  micRippleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8AB4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 100,
    paddingHorizontal: 30,
    lineHeight: 32,
  },
  languageText: {
    fontSize: 14,
    color: '#9AA0A6',
    textAlign: 'center',
  },

  // Drawer Overlay Styles
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: SCREEN_WIDTH * 0.75,
    height: '100%',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerHeader: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#131313',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  drawerMenuScroll: {
    flex: 1,
    paddingTop: 16,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  drawerMenuIcon: {
    marginRight: 16,
  },
  drawerMenuText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  drawerMenuDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  drawerMenuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  drawerMenuFooterText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  drawerMenuVersion: {
    fontSize: 10,
    color: '#CCC',
    marginTop: 4,
  },

  // Terms of Service Styles
  termsContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  termsHeader: {
    height: 56,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  termsBackBtn: {
    padding: 4,
  },
  termsHeaderTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  termsContentScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  termsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  termsLastUpdated: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 12,
  },
  termsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 18,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },

  // Customer Support Styles
  supportContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  supportHeader: {
    height: 56,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  supportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportBackBtn: {
    padding: 4,
    marginRight: 16,
  },
  supportHeaderTitle: {
    color: '#111',
    fontSize: 20,
    fontWeight: 'bold',
  },
  supportSendBtn: {
    padding: 8,
  },
  supportSendBtnDisabled: {
    opacity: 0.5,
  },
  supportInputContainer: {
    flex: 1,
    padding: 20,
  },
  supportInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  charCountText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 8,
  },

  // Rate Us Styles
  rateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  rateDialog: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  rateCloseBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 4,
  },
  rateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 28,
  },
  rateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 18,
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  starTouch: {
    paddingHorizontal: 6,
  },
  rateLabel: {
    fontSize: 13,
    color: '#555',
    marginTop: 8,
    marginBottom: 20,
    height: 18,
    fontWeight: '500',
  },
  rateSubmitBtn: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateSubmitBtnDisabled: {
    backgroundColor: '#B0B0B0',
  },
  rateSubmitBtnEnabled: {
    backgroundColor: '#007AFF',
  },
  rateSubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
