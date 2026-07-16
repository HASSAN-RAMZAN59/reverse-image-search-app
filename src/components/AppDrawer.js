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
} from 'react-native';
import {
  Headphones,
  Star,
  Share2,
  Shield,
  FileText,
  ArrowLeft,
  Send,
  X,
} from 'lucide-react-native';
import Logo from './Logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 1080;

export default function AppDrawer({ isOpen, onClose, navigation }) {
  const [visible, setVisible] = useState(isOpen);
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);
  const [isSupportVisible, setIsSupportVisible] = useState(false);
  const [supportText, setSupportText] = useState('');
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH * 0.75,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onClose();
    });
  };

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

  if (!visible) return null;

  return (
    <View style={styles.drawerOverlay}>
      <TouchableOpacity
        style={styles.drawerBackdrop}
        activeOpacity={1}
        onPress={handleClose}
      />
      <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Drawer Header with Logo */}
        <View style={styles.drawerHeader}>
          <Logo width={90} height={82} />
        </View>

        {/* Drawer Menu Items */}
        <ScrollView style={styles.drawerMenuScroll}>
          <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { handleClose(); setSupportText(''); setIsSupportVisible(true); }}>
            <Headphones size={22} color="#555" style={styles.drawerMenuIcon} />
            <Text style={styles.drawerMenuText}>Customer Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { handleClose(); setSelectedRating(0); setIsRateModalVisible(true); }}>
            <Star size={22} color="#555" style={styles.drawerMenuIcon} />
            <Text style={styles.drawerMenuText}>Rate Us</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerMenuItem} onPress={handleShare}>
            <Share2 size={22} color="#555" style={styles.drawerMenuIcon} />
            <Text style={styles.drawerMenuText}>Share</Text>
          </TouchableOpacity>

          {/* Horizontal Divider Line */}
          <View style={styles.drawerMenuDivider} />

          <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { handleClose(); setIsPrivacyVisible(true); }}>
            <Shield size={22} color="#555" style={styles.drawerMenuIcon} />
            <Text style={styles.drawerMenuText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { handleClose(); setIsTermsVisible(true); }}>
            <FileText size={22} color="#555" style={styles.drawerMenuIcon} />
            <Text style={styles.drawerMenuText}>Terms of Service</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Drawer Footer */}
        <View style={styles.drawerMenuFooter}>
          <Text style={styles.drawerMenuFooterText}>Reverse Image Search App</Text>
          <Text style={styles.drawerMenuVersion}>v1.0.0</Text>
        </View>
      </Animated.View>

      {/* Terms of Service Modal */}
      <Modal
        visible={isTermsVisible}
        animationType="slide"
        onRequestClose={() => setIsTermsVisible(false)}
      >
        <SafeAreaView style={styles.termsContainer}>
          {/* Header */}
          <View style={styles.termsHeader}>
            <TouchableOpacity style={styles.termsBackBtn} onPress={() => setIsTermsVisible(false)}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.termsHeaderTitle}>Terms of Service</Text>
            <View style={{ width: 24 }} />
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
            <TouchableOpacity style={styles.termsBackBtn} onPress={() => setIsPrivacyVisible(false)}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.termsHeaderTitle}>Privacy Policy</Text>
            <View style={{ width: 24 }} />
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
            <View style={styles.supportHeaderLeft}>
              <TouchableOpacity style={styles.supportBackBtn} onPress={() => setIsSupportVisible(false)}>
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
            <TouchableOpacity style={styles.rateCloseBtn} onPress={() => setIsRateModalVisible(false)}>
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
    </View>
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
    backgroundColor: '#FFF',
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
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  drawerMenuDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  drawerMenuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  drawerMenuFooterText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  drawerMenuVersion: {
    fontSize: 10,
    color: '#CCC',
    marginTop: 4,
  },

  // Terms of Service Styles
  termsContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  termsHeader: {
    height: 56,
    backgroundColor: '#007AFF',
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

  // Customer Support Styles
  supportContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  supportHeader: {
    height: 56,
    backgroundColor: '#FFF',
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
