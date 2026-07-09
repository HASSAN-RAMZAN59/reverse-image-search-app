import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Share,
  Alert,
  Modal,
} from 'react-native';
import { ArrowLeft, RefreshCw, Share2, ZoomIn, X } from 'lucide-react-native';
import { generateAIImage } from '../services/aiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AIImageResultScreen({ route, navigation }) {
  const {
    prompt = '',
    style = 'none',
    aspectRatio = '1:1',
    imageCount = 1,
    negativePrompt = '',
  } = route?.params || {};

  const getAspectRatioNumber = (ratioStr) => {
    if (!ratioStr || typeof ratioStr !== 'string' || !ratioStr.includes(':')) {
      return 1;
    }
    let actualRatioStr = ratioStr;
    if (ratioStr === '4:3') {
      actualRatioStr = '4:5'; // Map 4:3 to 4:5 as per Stable Image Core API
    }
    const [widthStr, heightStr] = actualRatioStr.split(':');
    const w = parseFloat(widthStr);
    const h = parseFloat(heightStr);
    if (!isNaN(w) && !isNaN(h) && h !== 0) {
      return w / h;
    }
    return 1;
  };

  const ratioNumber = getAspectRatioNumber(aspectRatio);

  const [images, setImages] = useState(
    Array.from({ length: imageCount }, (_, idx) => ({
      id: idx,
      loading: true,
      uri: null,
      error: null,
    }))
  );

  const [previewImage, setPreviewImage] = useState(null);

  const runGenerations = () => {
    // Reset states
    setImages(
      Array.from({ length: imageCount }, (_, idx) => ({
        id: idx,
        loading: true,
        uri: null,
        error: null,
      }))
    );

    // Run parallel calls
    images.forEach(async (img) => {
      try {
        const base64Uri = await generateAIImage(prompt, {
          aspectRatio,
          negativePrompt,
          style,
        });
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id ? { ...item, loading: false, uri: base64Uri } : item
          )
        );
      } catch (err) {
        console.error(`Generation error for slot ${img.id}:`, err);
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? { ...item, loading: false, error: err.message || 'Generation failed' }
              : item
          )
        );
      }
    });
  };

  useEffect(() => {
    runGenerations();
  }, [prompt, style, aspectRatio, imageCount, negativePrompt]);

  const handleShare = async (uri) => {
    try {
      if (!uri) return;
      await Share.share({
        url: uri,
        message: `Check out this AI Art generated using Reverse Image Search App: ${prompt}`,
      });
    } catch (error) {
      Alert.alert('Share Failed', 'Unable to share the image.');
    }
  };

  // Determine grid item styles based on the total images count
  const renderGrid = () => {
    const isSingle = imageCount === 1;
    const isDouble = imageCount === 2;

    return (
      <View style={styles.gridContainer}>
        {images.map((item) => {
          let itemStyle = styles.gridItemQuarter;
          if (isSingle) {
            itemStyle = styles.gridItemSingle;
          } else if (isDouble) {
            itemStyle = styles.gridItemDouble;
          }

          return (
            <View key={item.id} style={[styles.gridItem, itemStyle, { aspectRatio: ratioNumber }]}>
              {item.loading ? (
                <View style={styles.stateContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.stateText}>Generating...</Text>
                </View>
              ) : item.error ? (
                <View style={styles.stateContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>Failed</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={runGenerations}>
                    <RefreshCw size={14} color="#007AFF" />
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.uri }} style={styles.gridImage} />
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => setPreviewImage(item.uri)}
                    >
                      <ZoomIn size={18} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleShare(item.uri)}
                    >
                      <Share2 size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Art Results</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Grid */}
        {renderGrid()}

        {/* Regenerate Action */}
        <TouchableOpacity style={styles.regenerateBtn} onPress={runGenerations}>
          <RefreshCw size={20} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.regenerateBtnText}>Regenerate Art</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setPreviewImage(null)}>
            <X size={30} color="#FFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image source={{ uri: previewImage }} style={[styles.modalPreviewImage, { aspectRatio: ratioNumber }]} />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 56,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  promptCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  promptLabel: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  promptText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  negativeContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  negLabel: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  negText: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#E6F0FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  tagText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  gridItemSingle: {
    width: '100%',
  },
  gridItemDouble: {
    width: '48%',
  },
  gridItemQuarter: {
    width: '48%',
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  stateText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  errorIcon: {
    fontSize: 24,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginBottom: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 6,
  },
  regenerateBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnIcon: {
    marginRight: 10,
  },
  regenerateBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalPreviewImage: {
    width: SCREEN_WIDTH - 20,
    resizeMode: 'contain',
  },
});
