import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
  TextInput,
  Linking,
  Alert,
  Platform,
  Share,
  Dimensions,
  BackHandler,
  Image,
} from 'react-native';
import {
  Camera,
  Image as ImageIcon,
  QrCode,
  Download,
  Share2,
  Star,
  Shield,
  ArrowLeft,
  Send,
  X,
} from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;

const logoXml = `<svg width="215" height="196" viewBox="0 0 215 196" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.00390625" y="4.24536" width="4.24536" height="42.7568" transform="rotate(-90 0.00390625 4.24536)" fill="white"/>
<rect x="0.00390625" y="0.00012207" width="4.24536" height="42.7568" fill="white"/>
<rect x="4.24902" y="195.895" width="4.24536" height="42.7568" transform="rotate(-180 4.24902 195.895)" fill="white"/>
<rect x="0.00390625" y="195.895" width="4.24536" height="42.7568" transform="rotate(-90 0.00390625 195.895)" fill="white"/>
<rect x="208.025" y="191.65" width="4.24536" height="42.7568" transform="rotate(90 208.025 191.65)" fill="white"/>
<rect x="208.025" y="195.895" width="4.24536" height="42.7568" transform="rotate(-180 208.025 195.895)" fill="white"/>
<rect x="203.781" y="0.00012207" width="4.24536" height="42.7568" fill="white"/>
<rect x="208.026" y="0.00012207" width="4.24536" height="42.7568" transform="rotate(90 208.026 0.00012207)" fill="white"/>
<path d="M101.206 88.3106C115.239 67.7957 122.255 57.5382 132.124 57.413C132.285 57.4109 132.446 57.4109 132.606 57.413C142.475 57.5382 149.492 67.7957 163.525 88.3106C181.148 114.074 189.959 126.956 184.84 137.002C184.759 137.162 184.675 137.321 184.589 137.479C179.187 147.376 163.579 147.376 132.365 147.376C101.151 147.376 85.5441 147.376 80.1421 137.479C80.056 137.321 79.9722 137.162 79.8906 137.002C74.7715 126.956 83.583 114.074 101.206 88.3106Z" fill="url(#paint0_linear_1_88)"/>
<path d="M38.0007 105.202C47.4978 91.7921 52.2463 85.0874 58.7677 84.563C59.5146 84.5029 60.2652 84.5029 61.0121 84.563C67.5335 85.0874 72.282 91.7921 81.7792 105.202C94.2856 122.86 100.539 131.689 97.6584 138.79C97.3357 139.586 96.9405 140.35 96.4777 141.073C92.3478 147.528 81.5285 147.528 59.8899 147.528C38.2513 147.528 27.432 147.528 23.3021 141.073C22.8393 140.35 22.4441 139.586 22.1214 138.79C19.2411 131.689 25.4943 122.86 38.0007 105.202Z" fill="#1DA723"/>
<path d="M76.4169 58.527C85.1256 58.527 92.1854 51.4673 92.1854 42.7586C92.1854 34.0499 85.1256 26.9901 76.4169 26.9901C67.7082 26.9901 60.6484 34.0499 60.6484 42.7586C60.6484 51.4673 67.7082 58.527 76.4169 58.527Z" fill="#FBC313"/>
<path d="M67.1012 65.197L72.7719 59.3643C70.7466 58.9593 68.8834 58.1492 67.1822 57.015L67.1012 65.197ZM85.7334 20.3175L80.0627 26.1502C82.088 26.5553 83.9512 27.3654 85.6524 28.4995L85.7334 20.3175ZM53.9775 52.0734L62.1595 51.9924C61.0254 50.2912 60.2153 48.428 59.8103 46.4027L53.9775 52.0734ZM98.8571 33.4411L90.6751 33.5221C91.7282 35.2233 92.5383 37.0866 93.0243 39.1118L98.8571 33.4411ZM53.9775 33.4411L59.8103 39.1118C60.2153 37.0866 61.0254 35.2233 62.1595 33.5221L53.9775 33.4411ZM98.8571 52.0734L93.0243 46.4027C92.6193 48.428 91.8092 50.2912 90.6751 51.9924L98.8571 52.0734ZM67.1012 20.3175L67.1822 28.4995C68.8834 27.4464 70.7466 26.6363 72.7719 26.1502L67.1012 20.3175ZM85.7334 65.197L85.6524 57.015C83.9512 58.1492 82.088 58.9593 80.0627 59.3643L85.7334 65.197Z" fill="#FFE62E"/>
<defs>
<linearGradient id="paint0_linear_1_88" x1="159.354" y1="86.1217" x2="94.4603" y2="127.211" gradientUnits="userSpaceOnUse">
<stop offset="0.455277" stop-color="#47BD4C"/>
<stop offset="0.839763" stop-color="#1DA723"/>
</linearGradient>
</defs>
</svg>`;

export default function AppDrawer({ isOpen, onClose, navigation }) {
  const [panelVisible, setPanelVisible] = useState(isOpen);
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);
  const [isSupportVisible, setIsSupportVisible] = useState(false);
  const [supportText, setSupportText] = useState('');
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;

  useEffect(() => {
    if (isOpen) {
      setPanelVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setPanelVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH * 0.75,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setPanelVisible(false);
      onClose();
    });
  };

  useEffect(() => {
    const onBackPress = () => {
      if (panelVisible) {
        handleClose();
        return true;
      }
      if (isTermsVisible) {
        setIsTermsVisible(false);
        handleClose();
        return true;
      }
      if (isPrivacyVisible) {
        setIsPrivacyVisible(false);
        handleClose();
        return true;
      }
      if (isSupportVisible) {
        setIsSupportVisible(false);
        handleClose();
        return true;
      }
      if (isRateModalVisible) {
        setIsRateModalVisible(false);
        handleClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [panelVisible, isTermsVisible, isPrivacyVisible, isSupportVisible, isRateModalVisible]);

  const handleShare = async () => {
    handleClose();
    try {
      await Share.share({
        message: 'Check out this awesome Reverse Image Search App! Easily search Google, Bing, and Yandex using images, camera capture, or voice transcription. Download now!',
      });
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  const handleSendEmail = () => {
    const email = 'reverseimagesearch64@gmail.com';
    const subject = encodeURIComponent('I have an issue with Search Image');
    const body = encodeURIComponent(supportText);
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.openURL(url)
      .then(() => {
        setIsSupportVisible(false);
        handleClose();
      })
      .catch((err) => {
        Alert.alert(
          'Error',
          'Could not open your mail client automatically. Please email your issue directly to reverseimagesearch64@gmail.com'
        );
      });
  };

  const handleRateApp = () => {
    setIsRateModalVisible(false);
    handleClose();
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/id64a14811'
      : 'https://play.google.com/store/apps/details?id=com.reverseimagesearch.app';

    Linking.openURL(storeUrl).catch(() => {
      Alert.alert('Error', 'Could not open Google Play Store automatically.');
    });
  };

  const getFormattedDate = () => {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <>
      {panelVisible && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
            {/* Drawer Header with Logo */}
            <View style={styles.drawerHeader}>
              <SvgXml xml={logoXml} width={215 * scale} height={195.9 * scale} />
            </View>

            {/* Drawer Menu Items */}
            <ScrollView style={styles.drawerMenuScroll}>
              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { handleClose(); navigation.navigate('Home', { triggerAction: 'camera', timestamp: Date.now() }); }}>
                <Camera size={22} color="#FFF" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { handleClose(); navigation.navigate('Home', { triggerAction: 'gallery', timestamp: Date.now() }); }}>
                <ImageIcon size={22} color="#FFF" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { handleClose(); navigation.navigate('QRScanner'); }}>
                <QrCode size={22} color="#FFF" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>QR Code Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { handleClose(); navigation.navigate('Downloads'); }}>
                <Download size={22} color="#FFF" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Download Image</Text>
              </TouchableOpacity>

              {/* Horizontal Divider Line */}
              <View style={styles.drawerMenuDivider} />

              <TouchableOpacity style={styles.drawerMenuItem} onPress={handleShare}>
                <Share2 size={22} color="#FFF" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Share App</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setSelectedRating(0); setIsRateModalVisible(true); }}>
                <Star size={22} color="#FFF" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Rateus</Text>
              </TouchableOpacity>

              {/* Horizontal Divider Line */}
              <View style={styles.drawerMenuDivider} />

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setIsPrivacyVisible(true); }}>
                <Shield size={22} color="#FFF" style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Privacy Policy</Text>
              </TouchableOpacity>
            </ScrollView>


            {/* Absolute Positioned Close Button */}
            <TouchableOpacity
              style={styles.absoluteCloseBtn}
              onPress={handleClose}
            >
              <Image
                source={require('./Ellipse 6483.png')}
                style={styles.ellipseImage}
              />
              <Image
                source={require('./Icon.png')}
                style={styles.absoluteIconImage}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Terms of Service Modal */}
      <Modal
        visible={isTermsVisible}
        animationType="slide"
        onRequestClose={() => setIsTermsVisible(false)}
      >
        <SafeAreaView style={styles.termsContainer}>
          {/* Header */}
          <View style={styles.termsHeader}>
            <View style={styles.headerSafeAreaSpacer} />
            <View style={styles.headerContentRow}>
              <TouchableOpacity style={styles.termsBackBtn} onPress={() => { setIsTermsVisible(false); handleClose(); }}>
                <ArrowLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.termsHeaderTitle}>Terms of Service</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          {/* Scrollable Terms Content */}
          <ScrollView contentContainerStyle={styles.termsContentScroll}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsLastUpdated}>Last Updated: {getFormattedDate()}</Text>

            <Text style={styles.termsSectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.termsText}>
              By accessing and using this application, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </Text>

            <Text style={styles.termsSectionTitle}>2. Use License</Text>
            <Text style={styles.termsText}>
              Permission is granted to temporarily download one copy of the application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not modify, copy, or use the materials for commercial purposes.
            </Text>

            <Text style={styles.termsSectionTitle}>3. Image Queries & Privacy</Text>
            <Text style={styles.termsText}>
              This application functions as a reverse image search engine utility. When you query by uploading or selecting an image, the image is transmitted directly to third-party search engines (Google, Bing, and Yandex). We do not store, catalog, or keep any copies of your uploaded images.
            </Text>

            <Text style={styles.termsSectionTitle}>4. Limitations & Liability</Text>
            <Text style={styles.termsText}>
              In no event shall Viberay or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this application.
            </Text>

            <Text style={styles.termsSectionTitle}>5. Accuracy of Materials</Text>
            <Text style={styles.termsText}>
              The search result content and metadata returned by this app are sourced directly from public search engines. We make no warranties, expressed or implied, regarding the accuracy, completeness, or reliability of these results.
            </Text>

            <Text style={styles.termsSectionTitle}>6. Governing Law</Text>
            <Text style={styles.termsText}>
              These terms and conditions are governed by and construed in accordance with local regulations, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </Text>

            <Text style={styles.termsSectionTitle}>7. Contacting Us</Text>
            <Text style={styles.termsText}>
              If you have any questions about these Terms of Service, please reach out to customer support at support@viberay.com.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={isPrivacyVisible}
        animationType="slide"
        onRequestClose={() => setIsPrivacyVisible(false)}
      >
        <SafeAreaView style={styles.termsContainer}>
          {/* Header */}
          <View style={styles.termsHeader}>
            <View style={styles.headerSafeAreaSpacer} />
            <View style={styles.headerContentRow}>
              <TouchableOpacity style={styles.termsBackBtn} onPress={() => { setIsPrivacyVisible(false); handleClose(); }}>
                <ArrowLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.termsHeaderTitle}>Privacy Policy</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          {/* Scrollable Privacy Content */}
          <ScrollView contentContainerStyle={styles.termsContentScroll}>
            <Text style={styles.termsTitle}>Privacy Policy</Text>
            <Text style={styles.termsLastUpdated}>Last Updated: {getFormattedDate()}</Text>

            <Text style={styles.termsSectionTitle}>1. Our Commitment to Privacy</Text>
            <Text style={styles.termsText}>
              We value your trust and are committed to protecting your privacy. This Privacy Policy describes how we handle information when you use our Reverse Image Search application.
            </Text>

            <Text style={styles.termsSectionTitle}>2. Uploaded Images & Audio Data</Text>
            <Text style={styles.termsText}>
              When you perform a reverse image search, you may select an image from your gallery, capture one with your camera, or use voice-to-text features.
              {"\n\n"}
              • Images and audio are processed strictly to complete your search request.
              {"\n"}
              • We do not store, archive, or collect your uploaded images or voice transcriptions on our servers.
            </Text>

            <Text style={styles.termsSectionTitle}>3. Third-Party Search Engines</Text>
            <Text style={styles.termsText}>
              To perform the search, the application forwards the selected image/text queries directly to third-party search providers (Google, Bing, Yandex). These external services operate under their own independent privacy policies. We do not control and are not responsible for their data collection practices.
            </Text>

            <Text style={styles.termsSectionTitle}>4. Device Permissions</Text>
            <Text style={styles.termsText}>
              To provide the key functionalities, our application requires permissions to access:
              {"\n\n"}
              • Camera: To take new photos for image search.
              {"\n"}
              • Storage/Photos: To select existing images from your device gallery.
              {"\n"}
              • Microphone: For voice-activated speech recognition.
              {"\n\n"}
              These permissions are used locally on your device and are never sold or shared with any third parties.
            </Text>

            <Text style={styles.termsSectionTitle}>5. Contact Us</Text>
            <Text style={styles.termsText}>
              If you have any questions or feedback regarding our privacy practices, please contact us at support@viberay.com.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Customer Support Modal */}
      <Modal
        visible={isSupportVisible}
        animationType="slide"
        onRequestClose={() => setIsSupportVisible(false)}
      >
        <SafeAreaView style={styles.supportContainer}>
          {/* Header */}
          <View style={styles.supportHeader}>
            <View style={styles.headerSafeAreaSpacer} />
            <View style={styles.supportHeaderContentRow}>
              <View style={styles.supportHeaderLeft}>
                <TouchableOpacity style={styles.supportBackBtn} onPress={() => { setIsSupportVisible(false); handleClose(); }}>
                  <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.supportHeaderTitle}>Customer Support</Text>
              </View>
              <TouchableOpacity
                disabled={supportText.trim().length < 20}
                onPress={handleSendEmail}
                style={[styles.supportSendBtn, supportText.trim().length < 20 && styles.supportSendBtnDisabled]}
              >
                <Send size={24} color={supportText.trim().length < 20 ? "#CCC" : "#007AFF"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Text Input area */}
          <View style={styles.supportInputContainer}>
            <TextInput
              style={styles.supportInput}
              placeholder="Describe the issue (at least 20 characters)"
              placeholderTextColor="#999"
              multiline={true}
              autoFocus={true}
              textAlignVertical="top"
              value={supportText}
              onChangeText={setSupportText}
            />
            {supportText.trim().length < 20 && (
              <Text style={styles.charCountText}>
                {20 - supportText.trim().length} characters remaining to enable send
              </Text>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Rate Us Modal */}
      <Modal
        visible={isRateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRateModalVisible(false)}
      >
        <View style={styles.rateModalOverlay}>
          <View style={styles.rateDialog}>
            {/* Close Button */}
            <TouchableOpacity style={styles.rateCloseBtn} onPress={() => { setIsRateModalVisible(false); handleClose(); }}>
              <X size={24} color="#333" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.rateTitle}>Do you like{"\n"}Search Image ?</Text>

            {/* Subtitle */}
            <Text style={styles.rateSubtitle}>
              We are working hard for a better user experience.{"\n"}We'd greatly appreciate if you can rate us
            </Text>

            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((starValue) => (
                <TouchableOpacity
                  key={starValue}
                  onPress={() => setSelectedRating(starValue)}
                  style={styles.starTouch}
                  activeOpacity={0.7}
                >
                  <Star
                    size={38}
                    color={starValue <= selectedRating ? "#FFC107" : "#CCC"}
                    fill={starValue <= selectedRating ? "#FFC107" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Dynamic Rating Label / "The best we can get" */}
            <Text style={styles.rateLabel}>
              {selectedRating === 5 ? "The best we can get" : " "}
            </Text>

            {/* Rate Button */}
            <TouchableOpacity
              disabled={selectedRating === 0}
              onPress={handleRateApp}
              style={[
                styles.rateSubmitBtn,
                selectedRating === 0 ? styles.rateSubmitBtnDisabled : styles.rateSubmitBtnEnabled
              ]}
            >
              <Text style={styles.rateSubmitText}>Rate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: SCREEN_WIDTH * 0.75,
    height: '100%',
    backgroundColor: '#000000ff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerHeader: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#131313',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  drawerMenuScroll: {
    flex: 1,
    paddingTop: 16,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  drawerMenuIcon: {
    marginRight: 16,
  },
  drawerMenuText: {
    fontSize: 38.98 * scale,
    color: '#FFF',
    fontWeight: '500',
  },
  drawerMenuDivider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  absoluteCloseBtn: {
    position: 'absolute',
    left: 399 * scale,
    top: 2044 * scale,
    width: 112 * scale,
    height: 112 * scale,
  },
  ellipseImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  absoluteIconImage: {
    position: 'absolute',
    left: 33 * scale,
    top: 34 * scale,
    width: 45 * scale,
    height: 45 * scale,
  },


  termsContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 0,
  },
  termsHeader: {
    backgroundColor: '#007AFF',
  },
  headerSafeAreaSpacer: {
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  headerContentRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  termsBackBtn: {
    padding: 4,
  },
  termsHeaderTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  termsContentScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  termsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  termsLastUpdated: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 12,
  },
  termsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 18,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },

  supportContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 0,
  },
  supportHeader: {
    backgroundColor: '#FFF',
  },
  supportHeaderContentRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  supportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportBackBtn: {
    padding: 4,
    marginRight: 16,
  },
  supportHeaderTitle: {
    color: '#111',
    fontSize: 20,
    fontWeight: 'bold',
  },
  supportSendBtn: {
    padding: 8,
  },
  supportSendBtnDisabled: {
    opacity: 0.5,
  },
  supportInputContainer: {
    flex: 1,
    padding: 20,
  },
  supportInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  charCountText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 8,
    textAlign: 'right',
  },

  // Rate Us Modal Styles
  rateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateDialog: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  rateCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  rateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
    lineHeight: 28,
  },
  rateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starTouch: {
    padding: 6,
  },
  rateLabel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 24,
    height: 20,
  },
  rateSubmitBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateSubmitBtnDisabled: {
    backgroundColor: '#E5E5EA',
  },
  rateSubmitBtnEnabled: {
    backgroundColor: '#007AFF',
  },
  rateSubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
