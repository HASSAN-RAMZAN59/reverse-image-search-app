import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// Official Brand Icons styled via Svg
const GoogleIcon = () => (
  <View style={styles.logoBadge}>
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </Svg>
  </View>
);

const BingIcon = () => (
  <View style={styles.logoBadge}>
    <Image 
      source={{ uri: 'data:image/jpeg;base64,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' }} 
      style={{ width: 16, height: 16, borderRadius: 2 }}
    />
  </View>
);

const YandexIcon = () => (
  <View style={styles.logoBadge}>
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11" fill="#E01F25" />
      <Path fill="#FFFFFF" d="M15.5 6.5h-2.5c-1.5 0-2.5.8-2.5 2.5 0 1.2.6 2 1.5 2.5l-1.8 4.5c-.1.3.1.5.4.5h2c.3 0 .5-.1.6-.4l1.6-4.1v4c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5V7c0-.3-.2-.5-.5-.5zm-2 4c-.7 0-1-.4-1-1.1s.3-1.1 1-1.1h1v2.2h-1z" />
    </Svg>
  </View>
);

export default function ResultScreen({ searchQuery, onBack }) {
  const [activeBrowser, setActiveBrowser] = useState('google'); // 'google', 'bing', 'yandex'
  const [activeSubTab, setActiveSubTab] = useState('images'); // 'images' is active by default

  const getSearchUrl = () => {
    const encodedQuery = encodeURIComponent(searchQuery);
    
    const isImage = activeSubTab === 'images';
    const isVideo = activeSubTab === 'videos';
    const isNews = activeSubTab === 'news';

    if (activeBrowser === 'google') {
      let tbm = '';
      if (isImage) tbm = '&tbm=isch';
      else if (isVideo) tbm = '&tbm=vid';
      else if (isNews) tbm = '&tbm=nws';
      return `https://www.google.com/search?q=${encodedQuery}${tbm}`;
    } else if (activeBrowser === 'bing') {
      let path = 'search';
      if (isImage) path = 'images/search';
      else if (isVideo) path = 'videos/search';
      else if (isNews) path = 'news/search';
      return `https://www.bing.com/${path}?q=${encodedQuery}`;
    } else if (activeBrowser === 'yandex') {
      let path = 'search';
      if (isImage) path = 'images/search';
      else if (isVideo) path = 'video/search';
      return `https://yandex.com/${path}?text=${encodedQuery}`;
    }
    
    return `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;
  };

  const browsers = [
    { id: 'google', name: 'Google', activeColor: '#4285F4', activeBg: '#E8F0FE' },
    { id: 'bing', name: 'Bing', activeColor: '#008080', activeBg: '#E0F2F1' },
    { id: 'yandex', name: 'Yandex', activeColor: '#FF3333', activeBg: '#FFE5E5' },
  ];

  const subTabs = [
    { id: 'ai_mode', name: 'AI Mode' },
    { id: 'all', name: 'All' },
    { id: 'images', name: 'Images' },
    { id: 'videos', name: 'Videos' },
    { id: 'news', name: 'News' },
    { id: 'books', name: 'Books' },
  ];

  // Helper to render browser logo SVG
  const getBrowserLogo = (browserId) => {
    switch (browserId) {
      case 'google':
        return <GoogleIcon />;
      case 'bing':
        return <BingIcon />;
      case 'yandex':
        return <YandexIcon />;
      default:
        return null;
    }
  };

  // JavaScript injected to hide extra content, logos, search forms, and navigation panels
  const injectedJS = `
    (function() {
      const css = \`
        /* Google Image Search Header Elements */
        header, #header, #navigation, .M67Ar, .tsf, .header-wrapper, #search-form-header, .q7vebd, .F7Urfe, #sbtc { display: none !important; }
        /* Bing Image Search Header Elements */
        #b_header, .header, #hdr, #hp_header, #rfPane { display: none !important; }
        /* Yandex Image Search Header Elements */
        .header2, .header, .serp-header, .mini-suggest__button, .c-image-search-bar { display: none !important; }
        /* General layout fixes */
        body { margin-top: 0 !important; padding-top: 0 !important; }
      \`;
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Image Search</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.subTabsContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabsScroll}>
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.subTabButton, isActive && styles.subTabButtonActive]}
                onPress={() => setActiveSubTab(tab.id)}
              >
                <Text style={[styles.subTabText, isActive && styles.subTabTextActive]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          key={`${activeBrowser}-${activeSubTab}`}
          source={{ uri: getSearchUrl() }}
          style={styles.webView}
          startInLoadingState={true}
          injectedJavaScript={injectedJS}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1A73E8" />
              <Text style={styles.loadingText}>Loading {activeBrowser.toUpperCase()} Results...</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.bottomTabBar}>
        {browsers.map((browser) => {
          const isActive = activeBrowser === browser.id;
          return (
            <TouchableOpacity
              key={browser.id}
              style={[
                styles.bottomTab,
                isActive && {
                  backgroundColor: browser.activeBg,
                  borderColor: browser.activeColor,
                },
              ]}
              onPress={() => setActiveBrowser(browser.id)}
            >
              <View style={styles.tabContent}>
                {getBrowserLogo(browser.id)}
                <Text
                  style={[
                    styles.bottomTabText,
                    isActive
                      ? { color: browser.activeColor, fontWeight: '700' }
                      : { color: '#666', fontWeight: '500' },
                  ]}
                >
                  {browser.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  // Blue Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#1A73E8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { padding: 4, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },

  // Scrollable tabs
  subTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  subTabsScroll: {
    paddingHorizontal: 8,
  },
  subTabButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  subTabButtonActive: {
    borderBottomColor: '#000000', // Black indicator bar
  },
  subTabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  subTabTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },

  // WebView container
  webViewContainer: { flex: 1 },
  webView: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, fontSize: 14, color: '#666' },

  // Bottom selector tabs
  bottomTabBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#F8F9FA',
    justifyContent: 'space-between',
  },
  bottomTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: 4,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabText: { fontSize: 14 },
  logoBadge: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
