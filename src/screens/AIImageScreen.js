import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react-native';
import { generateAIImage } from '../services/aiService';

export default function AIImageScreen({ navigation }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Empty Prompt', 'Please enter a prompt describing the image you want to generate.');
      return;
    }

    setLoading(true);
    try {
      const base64Image = await generateAIImage(prompt.trim());
      setGeneratedImage(base64Image);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Generation Failed',
        error.message || 'An error occurred while generating the image. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Image Generator</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Preview Frame */}
          <View style={styles.previewFrame}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Generating your art...</Text>
              </View>
            ) : generatedImage ? (
              <Image source={{ uri: generatedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <ImageIcon size={48} color="#CCC" />
                <Text style={styles.placeholderText}>Your generated image will appear here</Text>
              </View>
            )}
          </View>

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter Image Prompt</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., A futuristic city with flying cars, neon lights, highly detailed, photorealistic..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              value={prompt}
              onChangeText={setPrompt}
              editable={!loading}
              textAlignVertical="top"
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.generateButton, (loading || !prompt.trim()) && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={loading}
          >
            <Text style={styles.generateButtonText}>
              {loading ? 'Generating...' : 'Generate Image'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 20,
    alignItems: 'center',
  },
  previewFrame: {
    width: 300,
    height: 300,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  previewImage: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  generateButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#B0D0FF',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
