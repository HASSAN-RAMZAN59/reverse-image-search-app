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
} from 'react-native';
import { ArrowLeft, Sparkles, Download, Image as ImageIcon, Camera, RefreshCw, X } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { generateImageToImage } from '../services/aiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AI_MODELS = [
  {
    index: 1,
    name: 'Anime V2',
    prompt: 'Highly detailed anime illustration, vibrant cel-shading, studio masterpiece',
    imageSource: { uri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400' },
  },
  {
    index: 2,
    name: 'Watercolor',
    prompt: 'Fluid watercolor wash painting, elegant bleeding canvas textures, artistic brushstrokes',
    imageSource: { uri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400' },
  },
  {
    index: 3,
    name: 'Sketch',
    prompt: 'Hand-drawn graphite pencil sketch, fine cross-hatching detail, monochrome classic art',
    imageSource: { uri: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400' },
  },
  {
    index: 4,
    name: 'Cyberpunk',
    prompt: 'Gritty cyberpunk aesthetic, futuristic neon glow, high-fidelity synthwave portrait',
    imageSource: { uri: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400' },
  },
  {
    index: 5,
    name: 'Oil Painting',
    prompt: 'Thick impasto oil painting, rich textured canvas strokes, classical fine art finish',
    imageSource: { uri: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=400' },
  },
  {
    index: 6,
    name: 'Steampunk',
    prompt: 'Retro-futuristic steampunk machinery, brass gears, copper pipes, Victorian industrial lighting',
    imageSource: { uri: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400' },
  },
  {
    index: 7,
    name: '3D Render',
    prompt: 'Hyper-realistic 3D octane render, smooth volumetric lighting, digital art masterpiece',
    imageSource: { uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
  },
  {
    index: 8,
    name: 'Origami',
    prompt: 'Intricate folded paper origami craft art, soft paper shadow geometry, minimalist clean style',
    imageSource: { uri: 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=400' },
  },
  {
    index: 9,
    name: 'Cinematic',
    prompt: 'Epic cinematic movie still composition, dramatic studio rim lighting, 8k resolution anamorphic lens',
    imageSource: { uri: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400' },
  },
  {
    index: 10,
    name: 'Vintage Pencil',
    prompt: 'Old 19th-century vintage pencil drawing, sepia aged paper texture, fine historical lines',
    imageSource: { uri: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400' },
  },
  {
    index: 11,
    name: 'Comic Book',
    prompt: 'Retro vintage comic book illustration, dynamic pop ink outlines, classic half-tone dot shading',
    imageSource: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400' },
  },
  {
    index: 12,
    name: 'Pixel Art',
    prompt: '8-bit nostalgic retro arcade pixel art, crisp square pixel grids, limited colorful palette',
    imageSource: { uri: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=400' },
  },
  {
    index: 13,
    name: 'Neon Glow',
    prompt: 'Dazzling futuristic neon glow, vibrant luminescent outline strokes, high-contrast dark backdrop',
    imageSource: { uri: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400' },
  },
  {
    index: 14,
    name: 'Gothic',
    prompt: 'Dark moody gothic architecture design, eerie ethereal shadow textures, haunting surreal oil art',
    imageSource: { uri: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400' },
  },
  {
    index: 15,
    name: 'Pop Art',
    prompt: 'Bold retro pop art aesthetic, high-contrast saturated colors, Andy Warhol silk-screen print style',
    imageSource: { uri: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400' },
  },
  {
    index: 16,
    name: 'Vaporwave',
    prompt: 'Surreal 80s vaporwave aesthetic, pastel pink and purple gradients, nostalgic glitch art style',
    imageSource: { uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400' },
  },
  {
    index: 17,
    name: 'Abstract',
    prompt: 'Dynamic fluid abstract expressionism, violent splatters, striking color harmonies, modern gallery texture',
    imageSource: { uri: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400' },
  },
  {
    index: 18,
    name: 'Renaissance',
    prompt: 'Classical Italian renaissance fresco painting, dramatic chiaroscuro shading, fine museum masterwork',
    imageSource: { uri: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400' },
  },
  {
    index: 19,
    name: 'Charcoal',
    prompt: 'Smudged realistic charcoal stick portrait sketch, deep moody black gradients, raw canvas paper grains',
    imageSource: { uri: 'https://images.unsplash.com/photo-1576016770956-debb63d900fe?w=400' },
  },
  {
    index: 20,
    name: 'Ink Wash',
    prompt: 'Traditional East Asian ink wash painting, zen calligraphic brush strokes, flowing monochrome tones',
    imageSource: { uri: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400' },
  },
];

export default function AIRemixScreen({ route, navigation }) {
  const [sourceImageUri, setSourceImageUri] = useState(null);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remixedResult, setRemixedResult] = useState(null);
  const [remixStrength, setRemixStrength] = useState(0.55);

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
      Animated.delay(2200),
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
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSourceImageUri(result.assets[0].uri);
        setRemixedResult(null);
        setSelectedStyleIndex(null);
      }
    } catch (err) {
      console.error('Gallery launch failed:', err);
      Alert.alert('Error', 'Could not open your photo library.');
    }
  };

  const captureImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to capture photos for style transfer.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSourceImageUri(result.assets[0].uri);
        setRemixedResult(null);
        setSelectedStyleIndex(null);
      }
    } catch (err) {
      console.error('Camera launch failed:', err);
      Alert.alert('Error', 'Could not access device camera.');
    }
  };

  const handleGenerateRemix = async (style, index) => {
    if (!sourceImageUri) {
      Alert.alert('No Image Selected', 'Please capture or select an image at the top before choosing a style.');
      return;
    }

    setSelectedStyleIndex(index);
    setLoading(true);

    try {
      console.log(`[Remix] Starting style transfer using model "${style.name}" with strength ${remixStrength}`);
      const base64Result = await generateImageToImage(sourceImageUri, style.prompt, remixStrength);
      setRemixedResult(base64Result);
      showToast(`Successfully remixed image using ${style.name}!`);
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
      // Clean up base64 header if present
      const parts = remixedResult.split(';base64,');
      const base64Data = parts.length === 2 ? parts[1] : remixedResult;

      // Stream to local temporary storage cache
      const filename = `ai_remix_${Date.now()}.jpg`;
      const tempUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(tempUri, base64Data, {
        encoding: 'base64',
      });

      // Commit permanently to explicit album: "AI Image Downloaded"
      const asset = await MediaLibrary.createAssetAsync(tempUri);
      const albumName = 'AI Image Downloaded';
      const album = await MediaLibrary.getAlbumAsync(albumName);

      if (album === null) {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert(
        'Download Complete',
        `Successfully saved permanent file to gallery album: "${albumName}"`
      );
    } catch (err) {
      console.error('[Remix] Persistence error:', err);
      Alert.alert('Download Failed', `Could not save image: ${err.message || err}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Image Remix</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Source Image Picker/Preview Utility */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>1. Source Image Selection</Text>
          
          {!sourceImageUri ? (
            <View style={styles.pickerPlaceholder}>
              <ImageIcon size={48} color="#B0BEC5" style={styles.pickerIcon} />
              <Text style={styles.pickerText}>Select or capture a starting image to remix</Text>
              
              <View style={styles.pickerButtonsRow}>
                <TouchableOpacity style={styles.pickerBtn} onPress={selectImageFromLibrary}>
                  <ImageIcon size={20} color="#FFF" style={styles.btnIconSpacing} />
                  <Text style={styles.pickerBtnText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.pickerBtn, styles.cameraBtn]} onPress={captureImageFromCamera}>
                  <Camera size={20} color="#FFF" style={styles.btnIconSpacing} />
                  <Text style={styles.pickerBtnText}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.previewContainer}>
              <View style={styles.imageComparisonRow}>
                <View style={styles.imagePreviewWrapper}>
                  <Text style={styles.imageLabel}>Source Image</Text>
                  <Image source={{ uri: sourceImageUri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.changeImageBadge} 
                    onPress={() => {
                      setSourceImageUri(null);
                      setRemixedResult(null);
                      setSelectedStyleIndex(null);
                    }}
                  >
                    <X size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>

                {remixedResult && (
                  <View style={styles.imagePreviewWrapper}>
                    <Text style={styles.imageLabel}>Remixed Result</Text>
                    <Image source={{ uri: remixedResult }} style={styles.previewImage} />
                  </View>
                )}
              </View>

              {/* Download Action Button */}
              {remixedResult && (
                <TouchableOpacity style={styles.downloadActionBtn} onPress={handleDownloadRemix}>
                  <Download size={22} color="#FFF" style={styles.btnIconSpacing} />
                  <Text style={styles.downloadActionBtnText}>⬇️ Download Remixed Image</Text>
                </TouchableOpacity>
              )}

              {/* Change Image Button Helper */}
              {!remixedResult && (
                <TouchableOpacity 
                  style={styles.changeImageTextButton}
                  onPress={selectImageFromLibrary}
                >
                  <Text style={styles.changeImageText}>Choose Different Image</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Strength Config Selector */}
        {sourceImageUri && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>2. Style Remix Strength</Text>
            <Text style={styles.sectionDesc}>
              Controls the adherence variance: lower values keep more details from the original image, higher values give the AI more creative freedom.
            </Text>
            
            <View style={styles.strengthRow}>
              {[
                { label: 'Mild (0.35)', val: 0.35 },
                { label: 'Balanced (0.55)', val: 0.55 },
                { label: 'Strong (0.75)', val: 0.75 },
              ].map((item) => {
                const isActive = remixStrength === item.val;
                return (
                  <TouchableOpacity
                    key={item.val}
                    style={[styles.strengthBtn, isActive && styles.strengthBtnActive]}
                    onPress={() => setRemixStrength(item.val)}
                  >
                    <Text style={[styles.strengthBtnText, isActive && styles.strengthBtnTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 20 Models Matrix Grid Layer */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {sourceImageUri ? '3. Choose an AI Remix Style' : '2. Preview Available AI Styles'}
          </Text>
          <Text style={styles.sectionDesc}>
            Tap any of the 20 stylized masterwork models below to initiate Stability AI processing immediately.
          </Text>

          <View style={styles.gridContainer}>
            {AI_MODELS.map((style, idx) => {
              const isSelected = selectedStyleIndex === idx;
              return (
                <TouchableOpacity
                  key={style.index}
                  style={[
                    styles.styleCard, 
                    isSelected && styles.styleCardSelected
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleGenerateRemix(style, idx)}
                >
                  <Image source={style.imageSource} style={styles.cardImage} />
                  
                  {/* Subtle index badge top left */}
                  <View style={styles.cardIndexBadge}>
                    <Text style={styles.cardIndexText}>#{String(style.index).padStart(2, '0')}</Text>
                  </View>

                  {/* Active selection indicator top right */}
                  {isSelected && (
                    <View style={styles.activeCheckBadge}>
                      <Sparkles size={12} color="#FFF" />
                    </View>
                  )}

                  {/* Elegant bottom-aligned text overlay bar */}
                  <View style={styles.textOverlayBar}>
                    <Text style={styles.styleNameText} numberOfLines={1}>{style.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Spinner Loading Overlay Block */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={styles.loadingOverlayText}>Generating AI Remix...</Text>
            <Text style={styles.loadingSubText}>Consulting Stability Diffusion neural network</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  pickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    borderWidth: 2,
    borderColor: '#ECEFF1',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  pickerIcon: {
    marginBottom: 10,
  },
  pickerText: {
    fontSize: 14,
    color: '#78909C',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  pickerButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  cameraBtn: {
    backgroundColor: '#34C759',
  },
  pickerBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnIconSpacing: {
    marginRight: 6,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  imageComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  imagePreviewWrapper: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  imageLabel: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    zIndex: 2,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  downloadActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF2D55',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  downloadActionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeImageTextButton: {
    marginTop: 10,
    padding: 8,
  },
  changeImageText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  strengthBtn: {
    flex: 1,
    backgroundColor: '#F1F3F4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  strengthBtnActive: {
    backgroundColor: '#FFF2E6',
    borderColor: '#FF9500',
  },
  strengthBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
  },
  strengthBtnTextActive: {
    color: '#FF9500',
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
    borderWidth: 3,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  styleCardSelected: {
    borderColor: '#FF9500',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
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
  activeCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  toastContainer: {
    position: 'absolute',
    bottom: 40,
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
});
