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
  Dimensions,
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

];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;

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
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('AIArtDashboard');
        }
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
      <StatusBar barStyle="light-content" backgroundColor="#FFF" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat With AI</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Enter Prompt Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} >Enter Prompt:</Text>
            <View style={styles.promptInputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Bear On the Mountains"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                multiline={true}
                numberOfLines={4}
                value={prompt}
                onChangeText={setPrompt}
                textAlignVertical="top"
              />
              <Image
                source={require('../components/Container.png')}
                style={styles.promptAiIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Styles Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Select Style:</Text>
            <TouchableOpacity
              style={styles.styleSelectorBtn}
              onPress={() => setIsStyleModalVisible(true)}
            >
              <View style={styles.styleSelectorTextContainer}>
                <Text style={styles.styleSelectorLabel}>Style</Text>
                <Text style={styles.styleSelectorValue}>
                  {selectedStyle}
                </Text>
              </View>
              <View style={styles.plusIconContainer}>
                <Image source={require('../components/Icon.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
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
            <Text style={styles.sectionTitle}>Quantity</Text>
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
                <ChevronUp size={20} color="#FFF" />
              ) : (
                <ChevronDown size={20} color="#FFF" />
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

              </View>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create</Text>
            <ArrowRight size={20} color="#131313" style={styles.createBtnIcon} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Styles Modal Selector */}
      <Modal visible={isStyleModalVisible} transparent={false} animationType="slide">
        <SafeAreaView style={styles.modalOverlay}>
          <StatusBar barStyle="light-content" backgroundColor="#131313" translucent={true} />

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
    backgroundColor: '#131313',
  },
  header: {
    height: Platform.OS === 'android' ? 56 + StatusBar.currentHeight : 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  promptInputWrapper: {
    position: 'relative',
    width: 948 * scale,
    height: 520 * scale,
  },
  promptAiIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 65.42 * scale,
    height: 80.01 * scale,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,

    letterSpacing: -0.5,
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
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1C1C26',
    borderWidth: 1,
    borderColor: '#2A2A35',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Geist',
    color: '#FFF',
    flex: 1,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C26',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  pillBtnSelected: {
    backgroundColor: '#ADC7FF',
    borderColor: '#ADC7FF',
  },
  pillBtnText: {
    fontSize: 15,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: '#8B90A0',
  },
  pillBtnTextSelected: {
    color: '#131313',
  },
  ratioIconSquare: {
    width: 14,
    height: 14,
    backgroundColor: '#8B90A0',
    borderRadius: 2,
    marginRight: 8,
  },
  ratioIconSquareSelected: {
    backgroundColor: '#131313',
  },
  countPillBtn: {
    minWidth: 56,
    justifyContent: 'center',
  },
  advancedToggleBtn: {
    flexDirection: 'row',
    backgroundColor: '#1C1C26',
    borderWidth: 1,
    borderColor: '#2A2A35',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advancedToggleText: {
    fontSize: 15,
    fontFamily: 'Geist',
    color: '#FFF',
    fontWeight: '500',
  },
  advancedExpandContainer: {
    marginTop: 12,
    backgroundColor: '#1C1C26',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  negPromptLabel: {
    fontSize: 14,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  negTextInput: {
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: '#2A2A35',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Geist',
    color: '#FFF',
    minHeight: 80,
  },
  negPromptHint: {
    fontSize: 12,
    fontFamily: 'Geist',
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  createButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#ADC7FF',
    borderRadius: 27,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#ADC7FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#131313',
    fontSize: 18,
    fontFamily: 'Geist',
    fontWeight: 'bold',
  },
  createBtnIcon: {
    marginLeft: 8,
  },
  styleSelectorBtn: {
    flexDirection: 'row',
    backgroundColor: '#1C1C26',
    borderWidth: 1,
    borderColor: '#2A2A35',
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
    fontFamily: 'Geist',
    color: '#8B90A0',
  },
  styleSelectorValue: {
    fontSize: 15,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 2,
    textTransform: 'lowercase',
  },
  plusIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#131313',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#2A2A35',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontFamily: 'Geist',
    fontWeight: 'bold',
    color: '#FFF',
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
    borderColor: '#3B82F6',
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
    fontFamily: 'Geist',
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
});
