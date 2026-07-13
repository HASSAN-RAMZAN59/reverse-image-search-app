import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Alert,
  Share,
  Platform,
  BackHandler,
} from 'react-native';
import { ArrowLeft, Trash2, Share2, X, Download, Check } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import { getSavedDownloads, deleteSavedDownload, deleteMultipleSavedDownloads } from '../utils/downloadManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 48) / 3;

export default function DownloadsScreen({ route, navigation }) {
  const isAIOnly = route?.params?.isAIOnly ?? false;
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Multiple selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const fetchDownloads = async () => {
    try {
      const list = await getSavedDownloads();
      if (isAIOnly) {
        setImages(list.filter((item) => item.isAI === true));
      } else {
        setImages(list.filter((item) => item.isAI !== true));
      }
    } catch (err) {
      console.error('Error fetching downloads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  // Back handler for Android to exit selection mode first
  useEffect(() => {
    const backAction = () => {
      if (isSelectionMode) {
        setSelectedIds([]);
        setIsSelectionMode(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isSelectionMode]);

  const handleShare = async (asset) => {
    try {
      await Share.share({
        url: asset.uri,
        message: 'Check out this saved image from Reverse Image Search App!',
      });
    } catch (err) {
      Alert.alert('Share Failed', 'Unable to share the selected image.');
    }
  };

  const handleDelete = async (asset) => {
    try {
      await deleteSavedDownload(asset.id, asset.uri, asset.galleryAssetId);
      setImages((prev) => prev.filter((img) => img.id !== asset.id));
      setPreviewImage(null);
      setSelectedAsset(null);
    } catch (err) {
      console.log('Delete canceled or failed:', err);
    }
  };

  // Bulk Delete implementation
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      const assetsToDelete = images.filter((img) => selectedIds.includes(img.id));
      await deleteMultipleSavedDownloads(assetsToDelete);
      setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)));
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.log('Bulk delete canceled or failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (item) => {
    if (isSelectionMode) {
      toggleSelect(item.id);
    } else {
      setPreviewImage(item.uri);
      setSelectedAsset(item);
    }
  };

  const handleLongPress = (item) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([item.id]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        if (next.length === 0) {
          setIsSelectionMode(false);
        }
        return next;
      } else {
        return [...prev, id];
      }
    });
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.gridItem, isSelected && styles.gridItemSelected]}
        activeOpacity={0.8}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
      >
        <Image source={{ uri: item.uri }} style={[styles.gridImage, isSelected && styles.gridImageSelected]} />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkboxContainer}>
              <Check size={14} color="#FFF" strokeWidth={3} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={[styles.header, isSelectionMode && styles.headerSelection]}>
        {isSelectionMode ? (
          <>
            <TouchableOpacity style={styles.backBtn} onPress={() => { setSelectedIds([]); setIsSelectionMode(false); }}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedIds.length} Selected</Text>
            <TouchableOpacity style={styles.backBtn} onPress={handleBulkDelete}>
              <Trash2 size={24} color="#FFF" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isAIOnly ? 'AI Art Gallery' : 'Saved Downloads'}</Text>
            <View style={{ width: 24 }} />
          </>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A73E8" />
          <Text style={styles.loadingText}>Loading saved images...</Text>
        </View>
      ) : images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Download size={48} color="#9AA0A6" />
          </View>
          <Text style={styles.emptyTitle}>{isAIOnly ? 'No Saved AI Art' : 'No Saved Images'}</Text>
          <Text style={styles.emptySubtitle}>
            {isAIOnly
              ? 'Generate AI Art and download it to see your creations saved here.'
              : 'Long press on any image in the browser search results to save it here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Close button top right */}
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setPreviewImage(null); setSelectedAsset(null); }}>
            <X size={30} color="#FFF" />
          </TouchableOpacity>

          {previewImage && (
            <Image source={{ uri: previewImage }} style={styles.modalPreviewImage} resizeMode="contain" />
          )}

          {/* Action Row at Bottom */}
          {selectedAsset && (
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleShare(selectedAsset)}>
                <Share2 size={22} color="#FFF" />
                <Text style={styles.modalActionText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.modalActionBtn, styles.deleteBtn]} onPress={() => handleDelete(selectedAsset)}>
                <Trash2 size={22} color="#FF4444" />
                <Text style={[styles.modalActionText, { color: '#FF4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
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
    height: Platform.OS === 'android' ? 56 + StatusBar.currentHeight : 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#1A73E8',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#5F6368',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F3F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C4043',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    padding: 12,
  },
  headerSelection: {
    backgroundColor: '#1C1C1E',
  },
  gridItem: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  gridItemSelected: {
    borderColor: '#1A73E8',
    borderWidth: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridImageSelected: {
    opacity: 0.8,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 115, 232, 0.15)',
  },
  checkboxContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 6,
    right: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    height: SCREEN_WIDTH * 1.5,
    maxHeight: '70%',
  },
  modalActionRow: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  modalActionText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  deleteBtn: {
    // Styling for visual separation if needed
  },
});
