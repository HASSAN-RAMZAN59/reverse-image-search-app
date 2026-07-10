import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import AIArtDashboardScreen from '../screens/AIArtDashboardScreen';
import AIImageScreen from '../screens/AIImageScreen';
import AIImageResultScreen from '../screens/AIImageResultScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="AIArtDashboard" component={AIArtDashboardScreen} />
        <Stack.Screen name="AIImageScreen" component={AIImageScreen} />
        <Stack.Screen name="AIImageResult" component={AIImageResultScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
