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
} from 'lucide-react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen({ onSearch }) {
  const [searchText, setSearchText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isListeningModalVisible, setIsListeningModalVisible] = useState(false);
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);
  const [isSupportVisible, setIsSupportVisible] = useState(false);
  const [supportText, setSupportText] = useState('');
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;

  const handleSendEmail = () => {
    const email = 'reverseimagesearch64@gmail.com';
    const subject = encodeURIComponent('I have an issue with Search Image');
    const body = encodeURIComponent(supportText);
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.openURL(url)
      .then(() => {
        setIsSupportVisible(false);
      })
      .catch((err) => {
        Alert.alert(
          'Error',
          'Could not open your mail client automatically. Please email your issue directly to reverseimagesearch64@gmail.com'
        );
      });
  };

  const getFormattedDate = () => {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleShare = async () => {
    closeDrawer();
    try {
      await Share.share({
        message: 'Check out this awesome Reverse Image Search App! Easily search Google, Bing, and Yandex using images, camera capture, or voice transcription. Download now!',
      });
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH * 0.75,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsDrawerOpen(false));
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
        {/* Header */}
        <View style={styles.editorHeader}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setEditorUri(null)} disabled={busy}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.editorHeaderTitle}>Edit Image</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={() => { setImageUri(editorUri); setEditorUri(null); }} disabled={busy}>
            <Check size={24} color="#34C759" />
          </TouchableOpacity>
        </View>

        {/* Workspace */}
        <View style={styles.editorWorkspace}>
          {busy && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}

          <View style={[styles.imageContainer, { width: container.width, height: container.height }]}>
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

        {/* Toolbar */}
        <View style={styles.editorToolbar}>
          <TouchableOpacity style={[styles.toolBtn, cropMode && styles.toolBtnActive]} onPress={() => setCropMode(!cropMode)} disabled={busy}>
            <Crop size={24} color={cropMode ? '#007AFF' : '#FFF'} />
            <Text style={[styles.toolText, cropMode && styles.toolTextActive]}>Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolBtn} onPress={handleRotate} disabled={busy}>
            <RotateCw size={24} color="#FFF" />
            <Text style={styles.toolText}>Rotate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolBtn} onPress={() => manipulateImage([{ flip: ImageManipulator.FlipType.Horizontal }])} disabled={busy}>
            <FlipHorizontal size={24} color="#FFF" />
            <Text style={styles.toolText}>Invert L/R</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolBtn} onPress={() => manipulateImage([{ flip: ImageManipulator.FlipType.Vertical }])} disabled={busy}>
            <FlipVertical size={24} color="#FFF" />
            <Text style={styles.toolText}>Invert U/D</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // RENDER HOME VIEW
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Menu size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Search</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, isInputInvalid && styles.inputInvalid]}
            placeholder={isListening ? "Listening..." : "Enter your text..."}
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (text.trim()) {
                setIsInputInvalid(false);
              }
            }}
          />
          <TouchableOpacity
            style={[styles.iconButton, isListening && styles.iconButtonActive]}
            onPress={handleMicPress}
          >
            <Mic size={20} color={isListening ? '#EF4444' : '#FFF'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              if (searchText.trim()) {
                onSearch(searchText, null);
              } else {
                setIsInputInvalid(true);
              }
            }}
          >
            <Search size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Selected Image Preview */}
        {imageUri && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.imageSearchBtn}
                onPress={() => {
                  if (imageUri) {
                    onSearch('', imageUri);
                  }
                }}
              >
                <Text style={styles.imageSearchBtnText}>Search Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.trashBtn} onPress={() => setImageUri(null)}>
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity style={styles.actionButton} onPress={() => acquireImage('gallery')}>
          <ImageIcon size={24} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.actionButtonText}>Upload Image from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => acquireImage('camera')}>
          <Camera size={24} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.actionButtonText}>Open Camera & Capture</Text>
        </TouchableOpacity>

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
      </View>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={closeDrawer}
          />
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
            {/* Drawer Header with Logo Placeholder */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerLogoPlaceholder}>
                <Text style={styles.drawerLogoText}>Logo Placeholder</Text>
              </View>
            </View>

            {/* Drawer Menu Items */}
            <ScrollView style={styles.drawerMenuScroll}>
              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { closeDrawer(); setSupportText(''); setIsSupportVisible(true); }}>
                <Headphones size={22} color="#555" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Customer Support</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => {}}>
                <Star size={22} color="#555" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Rate Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={handleShare}>
                <Share2 size={22} color="#555" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Share</Text>
              </TouchableOpacity>

              {/* Horizontal Divider Line */}
              <View style={styles.drawerMenuDivider} />

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { closeDrawer(); setIsPrivacyVisible(true); }}>
                <Shield size={22} color="#555" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Privacy Policy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { closeDrawer(); setIsTermsVisible(true); }}>
                <FileText size={22} color="#555" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Terms of Service</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Drawer Footer */}
            <View style={styles.drawerMenuFooter}>
              <Text style={styles.drawerMenuFooterText}>Reverse Image Search App</Text>
              <Text style={styles.drawerMenuVersion}>v1.0.0</Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Terms of Service Modal */}
      <Modal
        visible={isTermsVisible}
        animationType="slide"
        onRequestClose={() => setIsTermsVisible(false)}
      >
        <SafeAreaView style={styles.termsContainer}>
          {/* Header */}
          <View style={styles.termsHeader}>
            <TouchableOpacity style={styles.termsBackBtn} onPress={() => setIsTermsVisible(false)}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.termsHeaderTitle}>Terms of Service</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Scrollable Terms Content */}
          <ScrollView contentContainerStyle={styles.termsContentScroll}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsLastUpdated}>Last Updated: {getFormattedDate()}</Text>

            <Text style={styles.termsSectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.termsText}>
              By accessing and using this application, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </Text>

            <Text style={styles.termsSectionTitle}>2. Use License</Text>
            <Text style={styles.termsText}>
              Permission is granted to temporarily download one copy of the application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not modify, copy, or use the materials for commercial purposes.
            </Text>

            <Text style={styles.termsSectionTitle}>3. Image Queries & Privacy</Text>
            <Text style={styles.termsText}>
              This application functions as a reverse image search engine utility. When you query by uploading or selecting an image, the image is transmitted directly to third-party search engines (Google, Bing, and Yandex). We do not store, catalog, or keep any copies of your uploaded images.
            </Text>

            <Text style={styles.termsSectionTitle}>4. Limitations & Liability</Text>
            <Text style={styles.termsText}>
              In no event shall Viberay or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this application.
            </Text>

            <Text style={styles.termsSectionTitle}>5. Accuracy of Materials</Text>
            <Text style={styles.termsText}>
              The search result content and metadata returned by this app are sourced directly from public search engines. We make no warranties, expressed or implied, regarding the accuracy, completeness, or reliability of these results.
            </Text>

            <Text style={styles.termsSectionTitle}>6. Governing Law</Text>
            <Text style={styles.termsText}>
              These terms and conditions are governed by and construed in accordance with local regulations, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </Text>

            <Text style={styles.termsSectionTitle}>7. Contacting Us</Text>
            <Text style={styles.termsText}>
              If you have any questions about these Terms of Service, please reach out to customer support at support@viberay.com.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={isPrivacyVisible}
        animationType="slide"
        onRequestClose={() => setIsPrivacyVisible(false)}
      >
        <SafeAreaView style={styles.termsContainer}>
          {/* Header */}
          <View style={styles.termsHeader}>
            <TouchableOpacity style={styles.termsBackBtn} onPress={() => setIsPrivacyVisible(false)}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.termsHeaderTitle}>Privacy Policy</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Scrollable Privacy Content */}
          <ScrollView contentContainerStyle={styles.termsContentScroll}>
            <Text style={styles.termsTitle}>Privacy Policy</Text>
            <Text style={styles.termsLastUpdated}>Last Updated: {getFormattedDate()}</Text>

            <Text style={styles.termsSectionTitle}>1. Our Commitment to Privacy</Text>
            <Text style={styles.termsText}>
              We value your trust and are committed to protecting your privacy. This Privacy Policy describes how we handle information when you use our Reverse Image Search application.
            </Text>

            <Text style={styles.termsSectionTitle}>2. Uploaded Images & Audio Data</Text>
            <Text style={styles.termsText}>
              When you perform a reverse image search, you may select an image from your gallery, capture one with your camera, or use voice-to-text features.
              {"\n\n"}
              • Images and audio are processed strictly to complete your search request.
              {"\n"}
              • We do not store, archive, or collect your uploaded images or voice transcriptions on our servers.
            </Text>

            <Text style={styles.termsSectionTitle}>3. Third-Party Search Engines</Text>
            <Text style={styles.termsText}>
              To perform the search, the application forwards the selected image/text queries directly to third-party search providers (Google, Bing, Yandex). These external services operate under their own independent privacy policies. We do not control and are not responsible for their data collection practices.
            </Text>

            <Text style={styles.termsSectionTitle}>4. Device Permissions</Text>
            <Text style={styles.termsText}>
              To provide the key functionalities, our application requires permissions to access:
              {"\n\n"}
              • Camera: To take new photos for image search.
              {"\n"}
              • Storage/Photos: To select existing images from your device gallery.
              {"\n"}
              • Microphone: For voice-activated speech recognition.
              {"\n\n"}
              These permissions are used locally on your device and are never sold or shared with any third parties.
            </Text>

            <Text style={styles.termsSectionTitle}>5. Contact Us</Text>
            <Text style={styles.termsText}>
              If you have any questions or feedback regarding our privacy practices, please contact us at support@viberay.com.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Customer Support Modal */}
      <Modal
        visible={isSupportVisible}
        animationType="slide"
        onRequestClose={() => setIsSupportVisible(false)}
      >
        <SafeAreaView style={styles.supportContainer}>
          {/* Header */}
          <View style={styles.supportHeader}>
            <View style={styles.supportHeaderLeft}>
              <TouchableOpacity style={styles.supportBackBtn} onPress={() => setIsSupportVisible(false)}>
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.supportHeaderTitle}>Customer Support</Text>
            </View>
            <TouchableOpacity
              disabled={supportText.trim().length < 20}
              onPress={handleSendEmail}
              style={[styles.supportSendBtn, supportText.trim().length < 20 && styles.supportSendBtnDisabled]}
            >
              <Send size={24} color={supportText.trim().length < 20 ? "#CCC" : "#007AFF"} />
            </TouchableOpacity>
          </View>

          {/* Text Input area */}
          <View style={styles.supportInputContainer}>
            <TextInput
              style={styles.supportInput}
              placeholder="Describe the issue (at least 20 characters)"
              placeholderTextColor="#999"
              multiline={true}
              autoFocus={true}
              textAlignVertical="top"
              value={supportText}
              onChangeText={setSupportText}
            />
            {supportText.trim().length < 20 && (
              <Text style={styles.charCountText}>
                {20 - supportText.trim().length} characters remaining to enable send
              </Text>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Home Styles
  container: { flex: 1, backgroundColor: '#007AFF' },
  header: { height: 56, backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  menuButton: { marginRight: 16, padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  content: { flex: 1, backgroundColor: '#FFF', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 30 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, height: 48, borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#000' },
  inputInvalid: { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#FFF5F5' },
  iconButton: { width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8, backgroundColor: '#007AFF' },
  iconButtonActive: { backgroundColor: '#FFE5E5', borderWidth: 1, borderColor: '#EF4444' },
  searchButton: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  actionButton: { flexDirection: 'row', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15, backgroundColor: '#007AFF' },
  btnIcon: { marginRight: 10 },
  actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  previewContainer: { alignItems: 'center', marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#EEE', borderRadius: 8 },
  previewImage: { width: 150, height: 150, borderRadius: 8, resizeMode: 'cover', marginBottom: 10 },
  previewActions: { flexDirection: 'row', alignItems: 'center' },
  imageSearchBtn: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginRight: 10 },
  imageSearchBtnText: { color: '#FFF', fontWeight: '600' },
  trashBtn: { padding: 8, borderWidth: 1, borderColor: '#FEE2E2', borderRadius: 6, backgroundColor: '#FEF2F2' },

  // Editor Styles
  editorContainer: { flex: 1, backgroundColor: '#000' },
  editorHeader: { flexDirection: 'row', height: 56, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#222' },
  headerBtn: { padding: 8 },
  editorHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  editorWorkspace: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { position: 'relative', overflow: 'hidden', backgroundColor: '#111' },
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
  editorToolbar: { flexDirection: 'row', height: 80, backgroundColor: '#111', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#222' },
  toolBtn: { alignItems: 'center', justifyContent: 'center', padding: 10, minWidth: 70 },
  toolBtnActive: { backgroundColor: '#222', borderRadius: 8 },
  toolText: { fontSize: 11, color: '#AAA', marginTop: 4 },
  toolTextActive: { color: '#007AFF', fontWeight: 'bold' },

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
    padding: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#0066D6',
  },
  drawerLogoPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  drawerLogoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
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
});
