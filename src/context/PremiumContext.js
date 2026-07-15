import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const PremiumContext = createContext(null);

const ONBOARDING_FILE_PATH = FileSystem.documentDirectory + 'onboarding_complete.json';

export function PremiumProvider({ children }) {
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        // Check premium status
        const premiumStatus = await AsyncStorage.getItem('isPremiumStatus');
        if (premiumStatus === 'true') {
          setIsPremiumUser(true);
        }

        // Check onboarding completion status (both from AsyncStorage and legacy FileSystem)
        const onboardingStatus = await AsyncStorage.getItem('isOnboardingComplete');
        let fileExists = false;
        try {
          const fileInfo = await FileSystem.getInfoAsync(ONBOARDING_FILE_PATH);
          fileExists = fileInfo.exists;
        } catch (e) {
          // ignore file read error
        }

        if (onboardingStatus === 'true' || fileExists) {
          setIsOnboardingComplete(true);
        }
      } catch (error) {
        console.error('Error loading premium or onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const flagOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('isOnboardingComplete', 'true');
      await FileSystem.writeAsStringAsync(ONBOARDING_FILE_PATH, JSON.stringify({ completed: true }));
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error flagging onboarding as complete:', error);
      // Fallback in memory
      setIsOnboardingComplete(true);
    }
  };

  const unlockPremium = async () => {
    try {
      await AsyncStorage.setItem('isPremiumStatus', 'true');
      setIsPremiumUser(true);
      await flagOnboardingComplete();
    } catch (error) {
      console.error('Error unlocking premium:', error);
      setIsPremiumUser(true);
      setIsOnboardingComplete(true);
    }
  };

  const bypassPremium = async () => {
    await flagOnboardingComplete();
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremiumUser,
        isOnboardingComplete,
        isLoading,
        unlockPremium,
        bypassPremium,
        setIsOnboardingComplete,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
