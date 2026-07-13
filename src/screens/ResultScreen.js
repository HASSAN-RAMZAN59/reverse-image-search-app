import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Download, X } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { addSavedDownload } from '../utils/downloadManager';

const googleXml = `
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
`;

const GoogleIcon = () => (
  <View style={styles.logoBadge}>
    <SvgXml xml={googleXml} width={16} height={16} />
  </View>
);

const bingXml = `
  <svg width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <linearGradient id="bingStem" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#30B2FF" />
        <stop offset="100%" stop-color="#005BFF" />
      </linearGradient>
      <linearGradient id="bingLoop" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#005BFF" />
        <stop offset="70%" stop-color="#00D2FF" />
        <stop offset="100%" stop-color="#30B2FF" />
      </linearGradient>
      <linearGradient id="bingHook" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#30B2FF" />
        <stop offset="100%" stop-color="#005BFF" />
      </linearGradient>
    </defs>
    <path
      fill="url(#bingHook)"
      d="M8.35 5.046a.615.615 0 0 0-.54.575c-.009.13-.006.14.289.899.67 1.727.833 2.142.86 2.2q.101.215.277.395c.089.092.148.141.247.208.176.117.262.15.944.351.664.197 1.026.327 1.338.482.405.201.688.43.866.7.128.195.242.544.291.896.02.137.02.44 0 .564-.041.27-.124.495-.252.684-.067.1-.044.084.055-.039.278-.346.562-.938.707-1.475a4.42 4.42 0 0 0-2.14-5.028 70 70 0 0 0-.888-.465l-.53-.277-.353-.184c-.16-.082-.266-.138-.345-.18-.368-.192-.523-.27-.568-.283a1 1 0 0 0-.194-.03z"
    />
    <path
      fill="url(#bingLoop)"
      d="M9.152 11.493a3 3 0 0 0-.135.083 320 320 0 0 0-1.513.934l-.8.496c-.012.01-.587.367-.876.543a1.9 1.9 0 0 1-.732.257c-.12.017-.349.017-.47 0a1.9 1.9 0 0 1-.884-.358 2.5 2.5 0 0 1-.365-.364 1.9 1.9 0 0 1-.34-.76 1 1 0 0 0-.027-.121c-.005-.006.004.092.022.22.018.132.057.324.098.489a4.1 4.1 0 0 0 2.487 2.796c.359.142.72.23 1.114.275.147.016.566.023.72.011a4.1 4.1 0 0 0 1.956-.661l.235-.149.394-.248.258-.163 1.164-.736c.51-.32.663-.433.9-.665.099-.097.248-.262.255-.283.002-.005.028-.046.059-.091a1.64 1.64 0 0 0 .25-.682c.02-.124.02-.427 0-.565a3 3 0 0 0-.213-.758c-.15-.314-.47-.6-.928-.83a2 2 0 0 0-.273-.12c-.006 0-.433.26-.948.58l-1.113.687z"
    />
    <path
      fill="url(#bingStem)"
      d="m3.004 12.184.03.129c.089.402.245.693.515.963a1.82 1.82 0 0 0 1.312.543c.361 0 .673-.09.994-.287l.472-.29.373-.23V5.334c0-1.537-.003-2.45-.008-2.521a1.82 1.82 0 0 0-.535-1.177c-.097-.096-.18-.16-.427-.33L4.183.24c-.239-.163-.258-.175-.33-.2a.63.63 0 0 0-.842.464c-.009.042-.01.603-.01 3.646l.003 8.035Z"
    />
  </svg>
`;

const BingIcon = () => (
  <View style={styles.logoBadge}>
    <SvgXml xml={bingXml} width={16} height={16} />
  </View>
);

const yandexXml = `
  <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="64" fill="white"/>
    <rect x="1" y="1" width="126" height="126" rx="63" stroke="black" stroke-opacity="0.1" stroke-width="2"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M105.787 38.8484C105.6 38.36 105.275 37.7658 104.851 37.1228C104.005 35.8286 102.727 34.2414 101.311 32.7438V32.7357C99.7969 31.2136 98.2504 29.895 96.9969 29.0241C96.3702 28.5927 95.8004 28.2508 95.3283 28.0636C95.0923 27.966 94.8563 27.9008 94.6284 27.8846C94.4086 27.8683 94.1319 27.909 93.9202 28.1206L64.5698 56.7063C64.2442 57.0237 63.7151 57.0237 63.3895 56.7063L34.0391 28.1206C33.8274 27.9171 33.5507 27.8764 33.3309 27.8846C33.1112 27.9008 32.867 27.966 32.6309 28.0636C32.1589 28.2508 31.581 28.5927 30.9624 29.0241C29.7089 29.895 28.1624 31.2217 26.6485 32.7357V32.7438C25.2323 34.2414 23.9544 35.8286 23.1079 37.1228C22.6847 37.7658 22.3509 38.36 22.1719 38.8484C22.0823 39.0925 22.0172 39.3367 22.001 39.5565C21.9928 39.7763 22.0335 40.0611 22.2533 40.2728L55.0467 72.1874C55.3397 72.4723 55.5025 72.863 55.5025 73.27L55.47 112.307C55.47 112.6 55.6409 112.819 55.7874 112.958C55.942 113.104 56.1455 113.226 56.3734 113.332C56.8292 113.552 57.456 113.755 58.1966 113.926C59.6943 114.268 61.7373 114.512 64 114.512C66.2627 114.512 68.3057 114.268 69.8034 113.926C70.544 113.755 71.1708 113.552 71.6266 113.332C71.8545 113.226 72.058 113.096 72.2126 112.958C72.3591 112.819 72.53 112.6 72.53 112.307L72.4975 73.27C72.4975 72.863 72.6603 72.4723 72.9533 72.1874L105.747 40.2728C105.966 40.0611 106.007 39.7763 105.999 39.5565C105.991 39.3286 105.918 39.0844 105.828 38.8484H105.787Z" fill="url(#paint0_linear_14620_7509)"/>
    <defs>
      <linearGradient id="paint0_linear_14620_7509" x1="22" y1="72.834" x2="105.21" y2="65.6414" gradientUnits="userSpaceOnUse">
        <stop offset="0.3" stop-color="#FF6A16"/>
        <stop offset="0.542948" stop-color="#FF3227"/>
        <stop offset="0.89" stop-color="#FF66DD"/>
      </linearGradient>
    </defs>
  </svg>
`;

const YandexIcon = () => (
  <View style={styles.logoBadge}>
    <SvgXml xml={yandexXml} width={16} height={16} />
  </View>
);

export default function ResultScreen({ searchQuery: propSearchQuery, imageUri: propImageUri, onBack, route, navigation }) {
  const searchQuery = route?.params?.searchQuery ?? propSearchQuery;
  const imageUri = route?.params?.imageUri ?? propImageUri;

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else if (onBack) {
      onBack();
    }
  };

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastVisible(false);
    });
  };

  const saveImageToGallery = async (targetUrl) => {
    if (!targetUrl) {
      Alert.alert("Error", "No image available to download.");
      return;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Permission Denied",
        "Media Library permission is required to save images to your gallery."
      );
      return;
    }

    try {
      let targetUrlClean = targetUrl.trim();
      
      // Handle protocol-relative URL (e.g. //domain.com/image.jpg)
      if (targetUrlClean.startsWith('//')) {
        targetUrlClean = 'https:' + targetUrlClean;
      }
      
      // Handle relative paths (e.g. /images/logo.png)
      if (targetUrlClean.startsWith('/') && !targetUrlClean.startsWith('//')) {
        let base = 'https://www.google.com';
        if (activeBrowser === 'bing') base = 'https://www.bing.com';
        else if (activeBrowser === 'yandex') base = 'https://yandex.com';
        targetUrlClean = base + targetUrlClean;
      }

      let localUri = targetUrlClean;
      
      if (targetUrlClean.startsWith('http://') || targetUrlClean.startsWith('https://')) {
        let filename = targetUrlClean.split('/').pop().split('?')[0];
        // Ensure filename has a valid extension
        if (!filename || !/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename)) {
          filename = `search_image_${Date.now()}.jpg`;
        }
        const tempUri = `${FileSystem.documentDirectory}${filename}`;
        const result = await FileSystem.downloadAsync(targetUrlClean, tempUri);
        localUri = result.uri;
      } else if (targetUrlClean.startsWith('data:')) {
        // Extract base64 payload and extension
        const parts = targetUrlClean.split(';base64,');
        if (parts.length === 2) {
          const mimePart = parts[0];
          const base64Data = parts[1];
          let ext = 'jpg';
          const match = mimePart.match(/data:image\/(\w+)/);
          if (match && match[1]) {
            ext = match[1];
          }
          const filename = `search_img_${Date.now()}.${ext}`;
          const tempUri = `${FileSystem.documentDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(tempUri, base64Data, {
            encoding: 'base64',
          });
          localUri = tempUri;
        } else {
          throw new Error('Unsupported data URL base64 format');
        }
      } else {
        throw new Error('Unsupported URL protocol');
      }
      
      let assetCreated = false;
      let galleryAssetId = null;
      try {
        const asset = await MediaLibrary.createAssetAsync(localUri);
        assetCreated = true;
        galleryAssetId = asset.id;
        const albumName = 'Reverse Image Search';
        const album = await MediaLibrary.getAlbumAsync(albumName);
        if (album === null) {
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (saveErr) {
        console.warn("Album saving failed:", saveErr);
        if (!assetCreated) {
          await MediaLibrary.saveToLibraryAsync(localUri);
        }
      }

      // Save to custom downloads metadata to display on saved downloads screen
      await addSavedDownload(localUri, galleryAssetId);

      showToast("Image saved successfully!");
    } catch (err) {
      console.error("Image download error:", err);
      Alert.alert(
        "Download Failed",
        `An error occurred while saving the image: ${err.message || err}`
      );
    }
  };

  const handleDownload = () => {
    saveImageToGallery(uploadedImageUrl || imageUri);
  };

  const [detectedImageUrl, setDetectedImageUrl] = useState(null);

  const handleImageSaveOption = (url) => {
    setDetectedImageUrl(url);
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'imageLongPress' && data.url) {
        handleImageSaveOption(data.url);
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  const [activeBrowser, setActiveBrowser] = useState('google'); // 'google', 'bing', 'yandex'
  const [activeSubTab, setActiveSubTab] = useState('images'); // 'images' is active by default
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  // QR Scanner & URL direct browse handling
  const fromQR = route?.params?.fromQR ?? false;
  const trimmedQuery = searchQuery ? searchQuery.trim() : '';
  const isUrl = /^https?:\/\//i.test(trimmedQuery) || 
                /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}(\/.*)?$/i.test(trimmedQuery);
  
  let formattedUrl = trimmedQuery;
  if (isUrl && !/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  // If navigated from QR scanner with a URL, open it directly by default.
  const [directBrowse, setDirectBrowse] = useState(fromQR && isUrl);

  useEffect(() => {
    if (imageUri) {
      uploadImage(imageUri);
    }
  }, [imageUri]);

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      let filename = uri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('reqtype', 'fileupload');
      formData.append('time', '1h');
      formData.append('fileToUpload', {
        uri: uri,
        name: filename || 'search_image.jpg',
        type: type,
      });

      const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const directUrl = await response.text();
      if (directUrl && directUrl.trim().startsWith('http')) {
        setUploadedImageUrl(directUrl.trim());
      } else {
        throw new Error(directUrl || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      Alert.alert(
        'Upload Failed',
        'Could not upload the image for reverse search. Please try again.',
        [{ text: 'OK', onPress: handleBack }]
      );
    } finally {
      setUploading(false);
    }
  };

  const getSearchUrl = () => {
    if (directBrowse && isUrl) {
      return formattedUrl;
    }

    if (uploadedImageUrl) {
      if (activeBrowser === 'google') {
        return `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(uploadedImageUrl)}`;
      } else if (activeBrowser === 'bing') {
        return `https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:${encodeURIComponent(uploadedImageUrl)}`;
      } else if (activeBrowser === 'yandex') {
        return `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(uploadedImageUrl)}`;
      }
    }

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

  const getHeaderTitle = () => {
    if (imageUri) {
      return "Image Search";
    }
    if (directBrowse && isUrl) {
      try {
        const domain = formattedUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        return domain || "Website";
      } catch (e) {
        return "Website";
      }
    }
    return searchQuery ? searchQuery : "Search Results";
  };

  const browsers = [
    { id: 'google', name: 'Google', activeColor: '#34A853', activeBg: '#E6F4EA' },
    { id: 'bing', name: 'Bing', activeColor: '#005BFF', activeBg: '#E6F0FF' },
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

  // JavaScript injected to hide extra content, logos, search forms, and navigation panels, and detect image long presses
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

      // Long press / hold image handler to save image
      var lastTriggeredTime = 0;
      function triggerImageLongPress(url) {
        var now = Date.now();
        if (now - lastTriggeredTime < 1000) return;
        lastTriggeredTime = now;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'imageLongPress',
          url: url
        }));
      }

      window.addEventListener('contextmenu', function(e) {
        var target = e.target;
        while (target && target.tagName !== 'IMG') {
          target = target.parentNode;
        }
        if (target && target.tagName === 'IMG') {
          var imageUrl = target.src || target.getAttribute('data-src') || target.getAttribute('data-actualsrc');
          if (imageUrl) {
            e.preventDefault();
            triggerImageLongPress(imageUrl);
          }
        }
      });

      var touchTimer = null;
      document.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        var target = e.target;
        while (target && target.tagName !== 'IMG') {
          target = target.parentNode;
        }
        if (target && target.tagName === 'IMG') {
          clearTimeout(touchTimer);
          touchTimer = setTimeout(function() {
            var imageUrl = target.src || target.getAttribute('data-src') || target.getAttribute('data-actualsrc');
            if (imageUrl) {
              triggerImageLongPress(imageUrl);
            }
          }, 800); // 800ms hold time
        }
      }, { passive: true });

      document.addEventListener('touchmove', function() {
        clearTimeout(touchTimer);
      }, { passive: true });

      document.addEventListener('touchend', function() {
        clearTimeout(touchTimer);
      }, { passive: true });

      document.addEventListener('touchcancel', function() {
        clearTimeout(touchTimer);
      }, { passive: true });
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{getHeaderTitle()}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {!imageUri && !directBrowse && (
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
      )}

      <View style={styles.webViewContainer}>
        {isUrl && (
          <View style={styles.urlBanner}>
            <Text style={styles.urlBannerText} numberOfLines={1}>
              {directBrowse ? `Direct Link: ${formattedUrl}` : `Search Query: ${formattedUrl}`}
            </Text>
            <TouchableOpacity 
              style={[
                styles.urlBannerButton, 
                directBrowse && { backgroundColor: '#FF3B30' }
              ]}
              onPress={() => setDirectBrowse(!directBrowse)}
            >
              <Text style={styles.urlBannerButtonText}>
                {directBrowse ? "Back to Search" : "Open Website"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {imageUri && !uploadedImageUrl ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1A73E8" />
            <Text style={styles.loadingText}>Uploading image for visual search...</Text>
          </View>
        ) : (
          <WebView
            key={`${activeBrowser}-${uploadedImageUrl ? 'image' : (directBrowse ? 'direct' : activeSubTab)}`}
            source={{ uri: getSearchUrl() }}
            style={styles.webView}
            startInLoadingState={true}
            injectedJavaScript={injectedJS}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            onMessage={handleMessage}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#1A73E8" />
                <Text style={styles.loadingText}>
                  {directBrowse ? "Loading Website..." : `Loading ${activeBrowser.toUpperCase()} Results...`}
                </Text>
              </View>
            )}
          />
        )}

        {detectedImageUrl && (
          <View style={styles.saveOverlayContainer}>
            <Text style={styles.saveOverlayTitle} numberOfLines={1}>Image detected</Text>
            <View style={styles.saveOverlayActions}>
              <TouchableOpacity
                style={styles.saveOverlayButton}
                onPress={() => {
                  saveImageToGallery(detectedImageUrl);
                  setDetectedImageUrl(null);
                }}
              >
                <Download size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveOverlayText}>Save Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveOverlayClose}
                onPress={() => setDetectedImageUrl(null)}
              >
                <X size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.bottomTabBar}>
        {browsers.map((browser) => {
          const isActive = activeBrowser === browser.id && !directBrowse;
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
              onPress={() => {
                setDirectBrowse(false);
                setActiveBrowser(browser.id);
              }}
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

      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
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
    height: Platform.OS === 'android' ? 56 + StatusBar.currentHeight : 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#1A73E8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  backBtn: { padding: 4, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', flex: 1 },

  // URL Banner
  urlBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  urlBannerText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  urlBannerButton: {
    backgroundColor: '#1A73E8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  urlBannerButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

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
  saveOverlayContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DADCE0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  saveOverlayTitle: {
    fontSize: 14,
    color: '#3C4043',
    fontWeight: '500',
    maxWidth: '45%',
  },
  saveOverlayActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveOverlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A73E8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  saveOverlayText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  saveOverlayClose: {
    padding: 8,
    backgroundColor: '#F1F3F4',
    borderRadius: 20,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    left: '10%',
    right: '10%',
    backgroundColor: '#323232',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
