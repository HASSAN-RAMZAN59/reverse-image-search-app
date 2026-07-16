import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Image,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Plus, X } from 'lucide-react-native';

const STYLES_LIST = [
  {
    id: 'cinematic',
    name: 'cinematic',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'anime',
    name: 'anime',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'comic-book',
    name: 'comic-book',
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: '3d-model',
    name: '3d-model',
    image: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'analog-film',
    name: 'analog-film',
    image: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'line-art',
    name: 'line-art',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'digital-art',
    name: 'digital-art',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'isometric',
    name: 'isometric',
    image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'fantasy-art',
    name: 'fantasy-art',
    image: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'enhance',
    name: 'enhance',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'neon-punk',
    name: 'neon-punk',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'modeling-compound',
    name: 'modeling-compound',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'origami',
    name: 'origami',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'low-poly',
    name: 'low-poly',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'photographic',
    name: 'photographic',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'pixel-art',
    name: 'pixel-art',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=60'
  }
];

export default function AIImageScreen({ navigation }) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photographic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [imageCount, setImageCount] = useState(1);

  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');

  const [isStyleModalVisible, setIsStyleModalVisible] = useState(false);

  // ── Hardware back → always return to Generate AI dashboard ──
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AIArtDashboard');
        return true; // prevent default (Home) navigation
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const handleCreate = () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt describing the image you want to generate.');
      return;
    }

    navigation.navigate('AIImageResult', {
      prompt: prompt.trim(),
      style: selectedStyle,
      aspectRatio: selectedRatio,
      imageCount: imageCount,
      negativePrompt: negativePrompt.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={24} color="#005BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Al Art</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Enter Prompt Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Enter Prompt:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Bear On the Mountains"
              placeholderTextColor="#AAA"
              multiline={true}
              numberOfLines={4}
              value={prompt}
              onChangeText={setPrompt}
              textAlignVertical="top"
            />
          </View>

          {/* Model and Styles Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Model and Styles:</Text>
            <TouchableOpacity
              style={styles.styleSelectorBtn}
              onPress={() => setIsStyleModalVisible(true)}
            >
              <View style={styles.styleSelectorTextContainer}>
                <Text style={styles.styleSelectorLabel}>Styles</Text>
                <Text style={styles.styleSelectorValue}>
                  {selectedStyle}
                </Text>
              </View>
              <View style={styles.plusIconContainer}>
                <Plus size={20} color="#333" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Aspect Ratio Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Aspect Ratio:</Text>
            <View style={styles.pillsRow}>
              {['1:1', '4:3', '3:2', '2:3'].map((ratio) => {
                const isSelected = selectedRatio === ratio;
                return (
                  <TouchableOpacity
                    key={ratio}
                    style={[styles.pillBtn, isSelected && styles.pillBtnSelected]}
                    onPress={() => setSelectedRatio(ratio)}
                  >
                    <View style={[styles.ratioIconSquare, isSelected && styles.ratioIconSquareSelected]} />
                    <Text style={[styles.pillBtnText, isSelected && styles.pillBtnTextSelected]}>
                      {ratio}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Image Generate Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Image Generate:</Text>
            <View style={styles.pillsRow}>
              {[1, 2, 3, 4].map((count) => {
                const isSelected = imageCount === count;
                return (
                  <TouchableOpacity
                    key={count}
                    style={[styles.pillBtn, isSelected && styles.pillBtnSelected, styles.countPillBtn]}
                    onPress={() => setImageCount(count)}
                  >
                    <Text style={[styles.pillBtnText, isSelected && styles.pillBtnTextSelected]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Advanced Setting Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Advanced Setting:</Text>
            <TouchableOpacity
              style={styles.advancedToggleBtn}
              onPress={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            >
              <Text style={styles.advancedToggleText}>Choose Settings</Text>
              {isAdvancedExpanded ? (
                <ChevronUp size={20} color="#333" />
              ) : (
                <ChevronDown size={20} color="#333" />
              )}
            </TouchableOpacity>

            {isAdvancedExpanded && (
              <View style={styles.advancedExpandContainer}>
                <Text style={styles.negPromptLabel}>Negative Prompt:</Text>
                <TextInput
                  style={styles.negTextInput}
                  placeholder="e.g. blurry, low quality, watermark, text"
                  placeholderTextColor="#AAA"
                  multiline={true}
                  numberOfLines={3}
                  value={negativePrompt}
                  onChangeText={setNegativePrompt}
                  textAlignVertical="top"
                />
                <Text style={styles.negPromptHint}>
                  Write the exact keywords you want to avoid.
                </Text>
              </View>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create</Text>
            <ArrowRight size={20} color="#FFF" style={styles.createBtnIcon} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Styles Modal Selector */}
      <Modal visible={isStyleModalVisible} transparent={false} animationType="slide">
        <SafeAreaView style={styles.modalOverlay}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />

          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsStyleModalVisible(false)}
            >
              <X size={18} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>AI Styles</Text>
            <View style={{ width: 32 }} />
          </View>

          <FlatList
            data={STYLES_LIST}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.stylesGrid}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => {
              const isSelected = selectedStyle === item.id;
              return (
                <TouchableOpacity
                  style={[styles.styleCard, isSelected && styles.styleCardSelected]}
                  onPress={() => {
                    setSelectedStyle(item.id);
                    setIsStyleModalVisible(false);
                  }}
                >
                  <Image source={{ uri: item.image }} style={styles.styleCardImage} />
                  <View style={styles.styleCardOverlay}>
                    <Text style={styles.styleCardText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#60A5FA',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
  },
  styleSelectorBtn: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '55%',
  },
  styleSelectorTextContainer: {
    flexDirection: 'column',
  },
  styleSelectorLabel: {
    fontSize: 11,
    color: '#888',
  },
  styleSelectorValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 2,
    textTransform: 'lowercase',
  },
  plusIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillBtnSelected: {
    backgroundColor: '#2D3748',
    borderColor: '#2D3748',
  },
  pillBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  pillBtnTextSelected: {
    color: '#FFF',
  },
  ratioIconSquare: {
    width: 14,
    height: 14,
    backgroundColor: '#AAA',
    borderRadius: 2,
    marginRight: 8,
  },
  ratioIconSquareSelected: {
    backgroundColor: '#FFF',
  },
  countPillBtn: {
    minWidth: 56,
    justifyContent: 'center',
  },
  advancedToggleBtn: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advancedToggleText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  advancedExpandContainer: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  negPromptLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
  },
  negTextInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
  },
  negPromptHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  createButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#3B82F6',
    borderRadius: 27,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createBtnIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#005BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  stylesGrid: {
    padding: 12,
  },
  styleCard: {
    width: '48%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  styleCardSelected: {
    borderColor: '#005BFF',
  },
  styleCardImage: {
    width: '100%',
    height: '100%',
  },
  styleCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleCardText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
});
