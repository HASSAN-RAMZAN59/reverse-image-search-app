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
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [imageUri, setImageUri] = useState(null);

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

  const startEditing = (uri) => {
    setEditorUri(uri);
    setCropMode(false);
    Image.getSize(uri, (w, h) => {
      setImageSize({ width: w, height: h });
      updateContainerSize(w, h);
    });
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

    if (!result.canceled && result.assets?.[0]?.uri) startEditing(result.assets[0].uri);
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
      return result.uri;
    } catch (err) {
      Alert.alert('Error', 'Failed to edit image.');
    } finally {
      setBusy(false);
    }
  };

  const applyCrop = async () => {
    const sX = imageSize.width / container.width, sY = imageSize.height / container.height;
    const w = Math.round(cropBox.width * sX), h = Math.round(cropBox.height * sY);
    const uri = await manipulateImage([{ crop: { originX: Math.round(cropBox.left * sX), originY: Math.round(cropBox.top * sY), width: w, height: h } }]);
    if (uri) { setImageSize({ width: w, height: h }); updateContainerSize(w, h); setCropMode(false); }
  };

  const handleRotate = async () => {
    const uri = await manipulateImage([{ rotate: 90 }]);
    if (uri) { setImageSize({ width: imageSize.height, height: imageSize.width }); updateContainerSize(imageSize.height, imageSize.width); }
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
    <View style={styles.container}>
      <Text style={styles.title}>Image Search</Text>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search text..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.iconButton} onPress={() => { setSearchText('Voice Search Term'); Alert.alert('Voice Search', 'Voice input simulated.'); }}>
          <Mic size={20} color="#554545" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} onPress={() => Alert.alert('Search', searchText.trim() ? `Searching for: "${searchText}"` : 'Please enter some text to search.')}>
          <Search size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Selected Image Preview */}
      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.imageSearchBtn} onPress={() => Alert.alert('Image Search', 'Searching using the selected image...')}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  // Home Styles
  container: { flex: 1, padding: 20, backgroundColor: '#FFF', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 30 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, height: 48, borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#000' },
  iconButton: { width: 48, height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', marginLeft: 8, backgroundColor: '#F5F5F5' },
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
});
