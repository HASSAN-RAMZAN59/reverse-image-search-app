import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  TextInput,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, Sparkles, Download, Image as ImageIcon, RefreshCw, X, Maximize2 } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { generateImageToImage, uploadImageToTempCloud } from '../services/aiService';
import { addSavedDownload } from '../utils/downloadManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;

const CHARACTER_TEMPLATES = [
  {
    id: 'viking',

    templateUrl: 'https://images.unsplash.com/photo-1603840830260-331b76a4a3d9?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Premium pre-set Viking body asset
    previewUrl: 'https://images.unsplash.com/photo-1603840830260-331b76a4a3d9?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'samurai',

    templateUrl: 'https://images.unsplash.com/photo-1616005639387-9d59e4b1bdb9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Premium pre-set Samurai armor asset
    previewUrl: 'https://images.unsplash.com/photo-1616005639387-9d59e4b1bdb9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];


export default function AIRemixScreen({ route, navigation }) {
  const [currentPhase, setCurrentPhase] = useState(1); // 1: Select Style, 2: Model Preview & Gallery, 3: Tune Parameters, 4: Result View
  const [selectedModel, setSelectedModel] = useState(null);
  const [sourceImageUri, setSourceImageUri] = useState(null);
  const [generationLimit, setGenerationLimit] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [remixStrength, setRemixStrength] = useState(0.38);
  const [selectedModelPrompt, setSelectedModelPrompt] = useState('');
  const [remixedResult, setRemixedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toast notifications state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;



  useEffect(() => {
    const passedUri = route?.params?.imageUri || route?.params?.sourceImageUri;
    if (passedUri) {
      setSourceImageUri(passedUri);
    }
  }, [route?.params]);

  // ── Hardware back: only active while this screen is focused ──
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isFullScreen) {
          setIsFullScreen(false);
          return true;
        }
        if (currentPhase > 1) {
          // Navigate back a phase within the remix flow
          handleHeaderBack();
          return true;
        }
        // Phase 1: go back to Generate AI dashboard
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('AIArtDashboard');
        }
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isFullScreen, currentPhase, navigation, handleHeaderBack])
  );

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastVisible(false);
    });
  };

  const selectImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Gallery permission is required to choose images for style transfer.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSourceImageUri(result.assets[0].uri);
        // Transition straight to step 3
        setCurrentPhase(3);
      }
    } catch (err) {
      console.error('Gallery launch failed:', err);
      Alert.alert('Error', 'Could not open your photo library.');
    }
  };

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    if (sourceImageUri) {
      setCurrentPhase(3);
    } else {
      setCurrentPhase(2);
    }
  };

  const handleCreateRemix = async () => {
    if (!sourceImageUri) {
      Alert.alert('No Image Selected', 'Please go back and select a photo from your gallery.');
      return;
    }

    setLoading(true);

    try {
      console.log(`[Remix] Starting Magic Hour Face-Swap using template "${selectedModel.name}"`);

      // Step 1: Upload the local face image to temp cloud storage
      const userUploadedImagePublicUrl = await uploadImageToTempCloud(sourceImageUri);

      // Step 2: Call the Magic Hour Face Swap API
      const resultUrl = await generateImageToImage(
        userUploadedImagePublicUrl,
        selectedModel.templateUrl
      );

      setRemixedResult(resultUrl);
      setCurrentPhase(4);
      showToast(`Successfully created ${selectedModel.name} remix!`);
    } catch (err) {
      console.error('[Remix] Generation error:', err);
      Alert.alert(
        'Generation Failed',
        'An error occurred while generating. Please verify your internet connection and Magic Hour API Key configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRemix = async () => {
    if (!remixedResult) {
      Alert.alert('Error', 'No remixed image available to download.');
      return;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Media Library permission is required to save photos directly to your device.'
      );
      return;
    }

    try {
      let tempUri = '';
      if (remixedResult.startsWith('http://') || remixedResult.startsWith('https://')) {
        const filename = `ai_remix_${Date.now()}.jpg`;
        const localDest = `${FileSystem.documentDirectory}${filename}`;
        const downloadResult = await FileSystem.downloadAsync(remixedResult, localDest);
        tempUri = downloadResult.uri;
      } else {
        const parts = remixedResult.split(';base64,');
        const base64Data = parts.length === 2 ? parts[1] : remixedResult;
        const filename = `ai_remix_${Date.now()}.jpg`;
        tempUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(tempUri, base64Data, {
          encoding: 'base64',
        });
      }

      let assetCreated = false;
      let galleryAssetId = null;
      const albumName = 'AI Image Downloaded';

      try {
        const asset = await MediaLibrary.createAssetAsync(tempUri);
        assetCreated = true;
        galleryAssetId = asset.id;
        const album = await MediaLibrary.getAlbumAsync(albumName);

        if (album === null) {
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (albumErr) {
        console.warn('[Remix] Album saving failed, using direct library save fallback:', albumErr);
        if (!assetCreated) {
          await MediaLibrary.saveToLibraryAsync(tempUri);
        }
      }

      // Add to internal saved downloads registry
      const remixOriginalName = `ai_remix_${Date.now()}.jpg`;
      await addSavedDownload(tempUri, galleryAssetId, true, remixOriginalName);

      showToast('Image saved');
    } catch (err) {
      console.error('[Remix] Persistence error:', err);
      Alert.alert('Download Failed', `Could not save image: ${err.message || err}`);
    }
  };

  const handleHeaderBack = () => {
    if (loading) return; // Strict UI Lock
    if (currentPhase === 1) {
      navigation?.goBack();
    } else if (currentPhase === 2) {
      setSelectedModel(null);
      setCurrentPhase(1);
    } else if (currentPhase === 3) {
      // Go back to model selection grid (Phase 1) keeping the source image intact
      setCurrentPhase(1);
    } else if (currentPhase === 4) {
      setCurrentPhase(3);
    }
  };

  const resetFlow = () => {
    setSelectedModel(null);
    setSelectedModelPrompt('');
    setSourceImageUri(null);
    setRemixedResult(null);
    setGenerationLimit(1);
    setRemixStrength(0.38);
    setCurrentPhase(1);
  };

  const getHeaderTitle = () => {
    if (currentPhase === 1) return 'Custom AI Models';
    if (currentPhase === 2) return selectedModel?.name || 'Create AI Images';
    if (currentPhase === 3) return 'Chat With AI';
    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Dynamic Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, loading && { opacity: 0.5 }]}
          onPress={loading ? null : handleHeaderBack}
          disabled={loading}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{getHeaderTitle()}</Text>
        {currentPhase === 4 ? (
          <TouchableOpacity style={styles.headerSaveBtn} onPress={handleDownloadRemix}>
            <Download size={14} color="#00285B" style={{ marginRight: 4 }} />
            <Text style={styles.headerSaveText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* SCREEN 1: Pure Model Selection Grid */}
      {currentPhase === 1 && (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>


          <View style={styles.gridContainer}>
            {CHARACTER_TEMPLATES.map((style, idx) => (
              <TouchableOpacity
                key={style.id}
                style={styles.styleCard}
                activeOpacity={0.85}
                onPress={() => handleSelectModel(style)}
              >
                <Image source={{ uri: style.templateUrl }} style={styles.cardImage} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* SCREEN 2: Model Static Preview & Isolated Gallery Trigger */}
      {currentPhase === 2 && selectedModel && (
        <View style={styles.phase2Container}>
          <View style={styles.phase2ImageContainer}>
            <Image source={{ uri: selectedModel.templateUrl }} style={styles.phase2Image} />
          </View>

          <View style={styles.phase2Footer}>
            <TouchableOpacity
              style={[styles.gallerySelectLargeBtn, loading && { opacity: 0.6 }]}
              onPress={loading ? null : selectImageFromLibrary}
              disabled={loading}
            >
              <View style={styles.gallerySelectContent}>
                <Text style={styles.gallerySelectTitle}>Gallery</Text>
                <Text style={styles.gallerySelectSub}>Select One Photo To Convert AI Images</Text>
              </View>
              <ArrowRight size={24} color="#00285B" style={styles.gallerySelectArrow} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SCREEN 3: Multi-Parameter Tuning Configuration (Limit & Strength) */}
      {currentPhase === 3 && selectedModel && sourceImageUri && (
        <View style={styles.phase3Container}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Top View Section: Image Preview with Grid */}
            <View style={styles.phase3TopSection}>
              <Image source={{ uri: sourceImageUri }} style={styles.phase3Image} />
              {/* Grid Overlay */}
              <View style={styles.gridOverlay}>
                <View style={[styles.gridLineH, { top: '33.33%' }]} />
                <View style={[styles.gridLineH, { top: '66.66%' }]} />
                <View style={[styles.gridLineV, { left: '33.33%' }]} />
                <View style={[styles.gridLineV, { left: '66.66%' }]} />
              </View>
            </View>

            {/* Bottom View Section */}
            <View style={styles.phase3BottomSection}>

              {/* ASPECT RATIO */}
              <Text style={styles.sectionTitle}>ASPECT RATIO</Text>
              <View style={styles.ratioContainer}>
                <View style={styles.ratioRow}>
                  {['1:1', '4:3', '3:2'].map(ratio => {
                    const isActive = aspectRatio === ratio;
                    return (
                      <TouchableOpacity
                        key={ratio}
                        style={[styles.ratioBtn, isActive && styles.ratioBtnActive]}
                        onPress={() => setAspectRatio(ratio)}
                      >
                        <View style={isActive ? styles.ratioPlaceholderActive : styles.ratioPlaceholder} />
                        <Text style={[styles.ratioText, isActive && styles.ratioTextActive]}>{ratio}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.ratioRow}>
                  {['2:3'].map(ratio => {
                    const isActive = aspectRatio === ratio;
                    return (
                      <TouchableOpacity
                        key={ratio}
                        style={[styles.ratioBtn, isActive && styles.ratioBtnActive]}
                        onPress={() => setAspectRatio(ratio)}
                      >
                        <View style={isActive ? styles.ratioPlaceholderActive : styles.ratioPlaceholder} />
                        <Text style={[styles.ratioText, isActive && styles.ratioTextActive]}>{ratio}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* QUANTITY */}
              <Text style={styles.sectionTitle}>QUANTITY</Text>
              <View style={styles.limitRow}>
                {[1, 2, 3, 4].map(num => {
                  const isActive = generationLimit === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[styles.quantityBtn, isActive && styles.quantityBtnActive]}
                      onPress={() => setGenerationLimit(num)}
                    >
                      <Text style={[styles.quantityText, isActive && styles.quantityTextActive]}>{num}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Absolute bottom-aligned execute button */}
          <SafeAreaView style={styles.executeFooter}>
            <TouchableOpacity style={styles.createBtn} onPress={loading ? null : handleCreateRemix} disabled={loading}>
              <Text style={styles.createBtnText}>Create</Text>
              <ArrowRight size={20} color="#00285B" style={styles.createBtnArrow} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      {/* SCREEN 4: Result Presentation, Full View Modal, & Scoped Saving */}
      {currentPhase === 4 && remixedResult && (
        <View style={styles.phase4Container}>
          <ScrollView contentContainerStyle={styles.phase4ScrollContainer} showsVerticalScrollIndicator={false}>
            {/* Main Result Image */}
            <View style={styles.resultImageContainer}>
              <Image source={{ uri: remixedResult }} style={styles.resultImage} />
            </View>

            {/* Variations Section */}
            {generationLimit > 1 && (
              <>
                <View style={styles.variationsHeaderRow}>
                  <Text style={styles.variationsTitle}>MORE VARIATIONS</Text>
                  <Text style={styles.variationsCount}>{generationLimit} Iterations</Text>
                </View>

                <View style={styles.variationsGrid}>
                  {Array.from({ length: generationLimit - 1 }).map((_, idx) => (
                    <View key={idx} style={styles.variationBox}>
                      <Image source={{ uri: remixedResult }} style={styles.variationImage} />
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Button */}
          <SafeAreaView style={styles.executeFooter}>
            <TouchableOpacity style={styles.createBtn} onPress={handleHeaderBack}>
              <Text style={styles.createBtnText}>Generate More</Text>
              <ArrowRight size={20} color="#00285B" style={styles.createBtnArrow} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      {/* Full Screen View Modal */}
      <Modal visible={isFullScreen} transparent={false} animationType="fade">
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsFullScreen(false)}>
            <X size={30} color="#FFF" />
          </TouchableOpacity>
          <Image source={{ uri: remixedResult }} style={styles.modalImage} resizeMode="contain" />
        </SafeAreaView>
      </Modal>

      {/* Spinner Loading Overlay Block */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={styles.loadingOverlayText}>Generating...</Text>
          </View>
        </View>
      )}



      {/* Floating custom premium Toast component */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  flexOne: {
    flex: 1,
  },
  header: {
    height: Platform.OS === 'android' ? 56 + StatusBar.currentHeight : 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#131313',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ADC7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  headerSaveText: {
    color: '#00285B',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Geist',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  resultScrollContainer: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  sectionHeaderContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  styleCard: {
    width: 463 * scale,
    height: 808 * scale,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#1C1C26',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardIndexBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardIndexText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Phase 2 Container
  phase2Container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  phase2ImageContainer: {
    width: 991 * scale,
    height: 1730 * scale,
    borderRadius: 53 * scale,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 20,
    position: 'relative',
    backgroundColor: '#131313',
  },
  phase2Image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  phase2Footer: {
    flex: 1,
    backgroundColor: '#131313',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  gallerySelectLargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ADC7FF',
    width: 956 * scale,
    height: 188 * scale,
    borderRadius: 94 * scale,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gallerySelectContent: {
    alignItems: 'center',
  },
  gallerySelectTitle: {
    color: '#00285B',
    fontSize: 20,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gallerySelectSub: {
    color: '#00285B',
    fontSize: 10,
    fontFamily: 'Geist',
  },
  gallerySelectArrow: {
    position: 'absolute',
    right: 20,
  },
  // Phase 3 styling
  configContainer: {
    backgroundColor: '#131313',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  previewImageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#131313',
    marginBottom: 20,
  },
  configPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  previewBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  limitSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    paddingTop: 20,
    marginBottom: 20,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  limitSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
    marginBottom: 12,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limitNumBtn: {
    width: 60,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F3F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  limitNumBtnActive: {
    backgroundColor: '#FFF2E6',
    borderColor: '#FF9500',
  },
  limitNumText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5F6368',
  },
  limitNumTextActive: {
    color: '#FF9500',
  },
  // Custom Slider Styling
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  sliderTrackWrapper: {
    height: 40,
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginVertical: 4,
  },
  sliderTrackBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    width: '100%',
    position: 'absolute',
  },
  sliderTrackActive: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9500',
    position: 'absolute',
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2.5,
    borderColor: '#FF9500',
    position: 'absolute',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderMinMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sliderMinMaxText: {
    fontSize: 11,
    color: '#757575',
  },
  // Phase 3 styling
  phase3Container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  phase3TopSection: {
    width: SCREEN_WIDTH - 32,
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#131313',
    marginHorizontal: 16,
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  phase3Image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  phase3BottomSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#8B90A0',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
    fontFamily: 'Geist',
  },
  ratioContainer: {
    marginBottom: 32,
    gap: 31.06 * scale,
  },
  ratioRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 31.06 * scale,
  },
  ratioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C26',
    borderRadius: 60 * scale,
    height: 119.3 * scale,
    paddingHorizontal: 51.77 * scale,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  ratioBtnActive: {
    backgroundColor: '#ADC7FF',
    borderColor: '#ADC7FF',
  },
  ratioPlaceholder: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#FFF',
    marginRight: 6,
    borderRadius: 2,
  },
  ratioPlaceholderActive: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: '#00285B',
    backgroundColor: 'transparent',
    marginRight: 8,
    borderRadius: 2,
  },
  ratioText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Geist',
  },
  ratioTextActive: {
    color: '#00285B',
    fontWeight: 'bold',
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityBtn: {
    width: (SCREEN_WIDTH - 32 - 36) / 4,
    height: 50,
    backgroundColor: '#1C1C26',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quantityBtnActive: {
    backgroundColor: '#282A2E',
  },
  quantityText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Geist',
  },
  quantityTextActive: {
    color: '#FFF',
  },
  quantityStarBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#00E5FF',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  executeFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#131313',
    paddingTop: 16,
    paddingBottom: 30,
    alignItems: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    backgroundColor: '#ADC7FF',
    width: 956 * scale,
    height: 188 * scale,
    borderRadius: 94 * scale,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createBtnText: {
    color: '#00285B',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Geist',
  },
  createBtnArrow: {
    position: 'absolute',
    right: 20,
  },
  // Phase 4 styling
  phase4Container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  phase4ScrollContainer: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  resultImageContainer: {
    width: SCREEN_WIDTH - 32,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 24,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  variationsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  variationsTitle: {
    color: '#8B90A0',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Geist',
  },
  variationsCount: {
    color: '#ADC7FF',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Geist',
  },
  variationsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    gap: 12,
  },
  variationBox: {
    width: (SCREEN_WIDTH - 32 - 36) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  variationImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  similarBox: {
    width: (SCREEN_WIDTH - 32 - 36) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#2A2A35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarText: {
    color: '#A1A1A6',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'Geist',
  },
  // Modal styling
  modalContainer: {
    flex: 1,
    backgroundColor: '#131313',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  // Spinner loading layout
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFF',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  loadingOverlayText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  loadingSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#757575',
  },
  // Toast overlay styling
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: '10%',
    right: '10%',
    backgroundColor: '#323232',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 9999,
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageActionsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 10,
  },
});
