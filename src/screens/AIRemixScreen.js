import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { ArrowLeft, Sparkles, Download, Image as ImageIcon, RefreshCw, X, Maximize2 } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { generateImageToImage } from '../services/aiService';
import { addSavedDownload } from '../utils/downloadManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AI_MODELS = [
  {
    index: 1,
    name: 'Anime V2',
    prompt: 'anime style, vibrant cel-shading, colorful cartoon aesthetic',
    imageSource: { uri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400' },
  },
  {
    index: 2,
    name: 'Watercolor',
    prompt: 'watercolor painting style, bleeding ink textures, artistic wash textures',
    imageSource: { uri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400' },
  },
  {
    index: 3,
    name: 'Sketch',
    prompt: 'graphite pencil sketch style, cross-hatching textures, monochrome hand-drawn details',
    imageSource: { uri: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400' },
  },
  {
    index: 4,
    name: 'Cyberpunk',
    prompt: 'cyberpunk style, futuristic neon glow lights, glowing synthwave colors',
    imageSource: { uri: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400' },
  },
  {
    index: 5,
    name: 'Oil Painting',
    prompt: 'oil painting style, thick impasto brushstrokes, rich oil canvas texture',
    imageSource: { uri: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=400' },
  },
  {
    index: 6,
    name: 'Steampunk',
    prompt: 'steampunk theme style, Victorian brass and copper metallic textures, industrial gear accents',
    imageSource: { uri: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400' },
  },
  {
    index: 7,
    name: '3D Render',
    prompt: '3d octane render style, smooth volumetric rendering, digital 3d lighting',
    imageSource: { uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
  },
  {
    index: 8,
    name: 'Origami',
    prompt: 'folded paper origami style, papercraft design, geometric paper shadows',
    imageSource: { uri: 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=400' },
  },
  {
    index: 9,
    name: 'Cinematic',
    prompt: 'cinematic look style, movie lighting, warm rim light, anamorphic lens colors',
    imageSource: { uri: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400' },
  },
  {
    index: 10,
    name: 'Vintage Pencil',
    prompt: 'vintage pencil drawing style, aged sepia paper texture, vintage sketch details',
    imageSource: { uri: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400' },
  },
  {
    index: 11,
    name: 'Comic Book',
    prompt: 'retro comic book style, pop art ink outlines, half-tone dot shader pattern',
    imageSource: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400' },
  },
  {
    index: 12,
    name: 'Pixel Art',
    prompt: '8-bit retro arcade pixel art style, blocky pixel grids, limited retro color palette',
    imageSource: { uri: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=400' },
  },
  {
    index: 13,
    name: 'Neon Glow',
    prompt: 'neon glow style, glowing luminescent outlines, vibrant neon light highlights',
    imageSource: { uri: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400' },
  },
  {
    index: 14,
    name: 'Gothic',
    prompt: 'dark gothic style, spooky shadows, moody architecture textures',
    imageSource: { uri: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400' },
  },
  {
    index: 15,
    name: 'Pop Art',
    prompt: 'pop art style, high-contrast saturated colors, retro screenprint texture',
    imageSource: { uri: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400' },
  },
  {
    index: 16,
    name: 'Vaporwave',
    prompt: 'vaporwave style, pastel pink and purple gradients, retro 80s glitch aesthetics',
    imageSource: { uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400' },
  },
  {
    index: 17,
    name: 'Abstract',
    prompt: 'fluid abstract expressionism style, artistic splatters, modern gallery texture',
    imageSource: { uri: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400' },
  },
  {
    index: 18,
    name: 'Renaissance',
    prompt: 'renaissance fresco style, dramatic chiaroscuro lighting, classical painting texture',
    imageSource: { uri: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400' },
  },
  {
    index: 19,
    name: 'Charcoal',
    prompt: 'charcoal drawing style, smudged black carbon textures, raw paper gradients',
    imageSource: { uri: 'https://images.unsplash.com/photo-1576016770956-debb63d900fe?w=400' },
  },
  {
    index: 20,
    name: 'Ink Wash',
    prompt: 'ink wash painting style, traditional zen brush calligraphy textures, flowing monochrome tones',
    imageSource: { uri: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400' },
  },
];

export default function AIRemixScreen({ route, navigation }) {
  const [currentPhase, setCurrentPhase] = useState(1); // 1: Select Style, 2: Model Preview & Gallery, 3: Tune Parameters, 4: Result View
  const [selectedModel, setSelectedModel] = useState(null);
  const [sourceImageUri, setSourceImageUri] = useState(null);
  const [generationLimit, setGenerationLimit] = useState(1);
  const [remixStrength, setRemixStrength] = useState(0.55);
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
        showToast('Local image selected successfully!');
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
    setSelectedModelPrompt(model.prompt);
    setCurrentPhase(2);
  };

  const handleCreateRemix = async () => {
    if (!sourceImageUri) {
      Alert.alert('No Image Selected', 'Please go back and select a photo from your gallery.');
      return;
    }

    setLoading(true);

    try {
      console.log(`[Remix] Starting style transfer using model "${selectedModel.name}" with prompt: "${selectedModelPrompt}" and strength ${remixStrength}`);
      const base64Result = await generateImageToImage(sourceImageUri, selectedModelPrompt, remixStrength);
      setRemixedResult(base64Result);
      setCurrentPhase(4);
      showToast(`Successfully created ${selectedModel.name} remix!`);
    } catch (err) {
      console.error('[Remix] Style generation error:', err);
      Alert.alert(
        'Generation Failed',
        'An error occurred while generating style transfer. Please verify your internet connection and Stability API Key configuration.'
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
      const parts = remixedResult.split(';base64,');
      const base64Data = parts.length === 2 ? parts[1] : remixedResult;

      const filename = `ai_remix_${Date.now()}.jpg`;
      const tempUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(tempUri, base64Data, {
        encoding: 'base64',
      });

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
      await addSavedDownload(tempUri, galleryAssetId, true);

      showToast('Image saved');
    } catch (err) {
      console.error('[Remix] Persistence error:', err);
      Alert.alert('Download Failed', `Could not save image: ${err.message || err}`);
    }
  };

  const handleHeaderBack = () => {
    if (currentPhase === 1) {
      navigation?.goBack();
    } else if (currentPhase === 2) {
      setSelectedModel(null);
      setCurrentPhase(1);
    } else if (currentPhase === 3) {
      // Go back to static preview
      setSourceImageUri(null);
      setCurrentPhase(2);
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
    setRemixStrength(0.55);
    setCurrentPhase(1);
  };

  const getHeaderTitle = () => {
    if (currentPhase === 1) return 'AI Style Remix';
    if (currentPhase === 2) return selectedModel?.name || 'Preview Model';
    if (currentPhase === 3) return 'Tune Settings';
    return 'Remix Result';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Dynamic Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleHeaderBack}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{getHeaderTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* SCREEN 1: Pure Model Selection Grid */}
      {currentPhase === 1 && (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.mainTitle}>Choose a Base Style</Text>
            <Text style={styles.mainSubtitle}>Select one of the 20 stylized AI models to begin.</Text>
          </View>

          <View style={styles.gridContainer}>
            {AI_MODELS.map((style, idx) => (
              <TouchableOpacity
                key={style.index}
                style={styles.styleCard}
                activeOpacity={0.85}
                onPress={() => handleSelectModel(style)}
              >
                <Image source={style.imageSource} style={styles.cardImage} />

                <View style={styles.cardIndexBadge}>
                  <Text style={styles.cardIndexText}>#{String(style.index).padStart(2, '0')}</Text>
                </View>

                <View style={styles.textOverlayBar}>
                  <Text style={styles.styleNameText} numberOfLines={1}>{style.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* SCREEN 2: Model Static Preview & Isolated Gallery Trigger */}
      {currentPhase === 2 && selectedModel && (
        <View style={styles.phase2Container}>
          <View style={styles.phase2ImageContainer}>
            <Image source={selectedModel.imageSource} style={styles.phase2Image} />
            <View style={styles.phase2ModelBadge}>
              <Text style={styles.phase2ModelBadgeText}>{selectedModel.name}</Text>
            </View>
          </View>

          <View style={styles.phase2Footer}>
            <TouchableOpacity style={styles.gallerySelectLargeBtn} onPress={selectImageFromLibrary}>
              <ImageIcon size={20} color="#FFF" style={styles.btnIconSpacing} />
              <Text style={styles.gallerySelectLargeBtnText}>📸 Select from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SCREEN 3: Multi-Parameter Tuning Configuration (Limit & Strength) */}
      {currentPhase === 3 && selectedModel && sourceImageUri && (
        <View style={styles.phase3Container}>
          {/* Top View Section: Exactly 50% height */}
          <View style={styles.phase3TopSection}>
            <Image source={{ uri: sourceImageUri }} style={styles.phase3Image} />
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>📸 Selected Photo</Text>
            </View>
          </View>

          {/* Bottom View Section */}
          <View style={styles.phase3BottomSection}>

            {/* ROW 1: Image Limit Selection */}
            <View style={styles.controlRowSection}>
              <View style={styles.controlRowHeader}>
                <Text style={styles.controlRowTitle}>Image Limit Selection</Text>
                <Text style={styles.controlRowValue}>Count: {generationLimit}</Text>
              </View>
              <View style={styles.limitRow}>
                {[1, 2, 3, 4].map((num) => {
                  const isActive = generationLimit === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[styles.limitNumBtn, isActive && styles.limitNumBtnActive]}
                      onPress={() => setGenerationLimit(num)}
                    >
                      <Text style={[styles.limitNumText, isActive && styles.limitNumTextActive]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

          </View>

          {/* Absolute bottom-aligned execute button */}
          <SafeAreaView style={styles.executeFooter}>
            <TouchableOpacity style={styles.executeBtn} onPress={handleCreateRemix}>
              <Text style={styles.executeBtnText}>Create AI Remix</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      {/* SCREEN 4: Result Presentation, Full View Modal, & Scoped Saving */}
      {currentPhase === 4 && remixedResult && (
        <ScrollView contentContainerStyle={styles.resultScrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={styles.resultImageContainer}>
              <Image source={{ uri: remixedResult }} style={styles.resultImage} />
              <View style={styles.imageActionsOverlay}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => setIsFullScreen(true)}
                >
                  <Maximize2 size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={handleDownloadRemix}
                >
                  <Download size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: '#F8F9FA',
  },
  flexOne: {
    flex: 1,
  },
  header: {
    height: Platform.OS === 'android' ? 56 + StatusBar.currentHeight : 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#007AFF',
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
    width: '48%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: '#ECEFF1',
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
  textOverlayBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleNameText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Phase 2 Container
  phase2Container: {
    flex: 1,
    backgroundColor: '#000',
  },
  phase2ImageContainer: {
    flex: 0.8,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1C1C1E',
  },
  phase2Image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  phase2ModelBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  phase2ModelBadgeText: {
    color: '#FF9500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phase2Footer: {
    flex: 0.2,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  gallerySelectLargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gallerySelectLargeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Phase 3 styling
  configContainer: {
    backgroundColor: '#FFF',
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
    borderColor: '#ECEFF1',
    backgroundColor: '#FAFAFA',
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
  phase3Container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  phase3TopSection: {
    height: SCREEN_HEIGHT * 0.5,
    width: '100%',
    position: 'relative',
    backgroundColor: '#ECEFF1',
  },
  phase3Image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  phase3BottomSection: {
    padding: 16,
    flex: 1,
    justifyContent: 'flex-start',
  },
  controlRowSection: {
    marginBottom: 20,
  },
  controlRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlRowTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
  },
  controlRowValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  executeFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  executeBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 3,
  },
  executeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnIconSpacing: {
    marginRight: 6,
  },
  // Phase 4 styling
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    alignItems: 'center',
  },
  resultImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultControls: {
    width: '100%',
    marginBottom: 16,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#FFF',
  },
  downloadBtn: {
    backgroundColor: '#FF2D55',
    borderColor: '#FF2D55',
  },
  controlBtnTextBlue: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  controlBtnTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginTop: 4,
  },
  restartBtnText: {
    color: '#5F6368',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styling
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
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
