import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft } from 'lucide-react-native';

export default function ResultScreen({ searchQuery, onBack }) {
  const [activeTab, setActiveTab] = useState('google'); // 'google', 'bing', 'yandex'

  const getSearchUrl = () => {
    const encodedQuery = encodeURIComponent(searchQuery);
    switch (activeTab) {
      case 'google':
        return `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;
      case 'bing':
        return `https://www.bing.com/images/search?q=${encodedQuery}`;
      case 'yandex':
        return `https://yandex.com/images/search?text=${encodedQuery}`;
      default:
        return `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;
    }
  };

  const tabs = [
    { id: 'google', name: 'Google', activeColor: '#4285F4', activeBg: '#E8F0FE' },
    { id: 'bing', name: 'Bing', activeColor: '#008080', activeBg: '#E0F2F1' },
    { id: 'yandex', name: 'Yandex', activeColor: '#FF3333', activeBg: '#FFE5E5' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Results: "{searchQuery}"
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs Selector */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && {
                  backgroundColor: tab.activeBg,
                  borderColor: tab.activeColor,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive
                    ? { color: tab.activeColor, fontWeight: '700' }
                    : { color: '#666', fontWeight: '500' },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* WebView Container */}
      <View style={styles.webViewContainer}>
        <WebView
          key={activeTab} // Forces webview reload when switching tabs
          source={{ uri: getSearchUrl() }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading {activeTab.toUpperCase()} Images...</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFF',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  tabBar: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#F8F9FA',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: 4,
  },
  tabText: { fontSize: 14 },
  webViewContainer: { flex: 1 },
  webView: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, fontSize: 14, color: '#666' },
});
