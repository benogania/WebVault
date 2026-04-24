import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native'; // Use standard react-native StatusBar
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as NavigationBar from 'expo-navigation-bar';

import TabNavigator from './navigation/TabNavigator';
import AddSiteScreen from './screens/AddSiteScreen';
import { VaultProvider } from './context/VaultContext';

const Stack = createNativeStackNavigator();

export default function App() {
  
  useEffect(() => {
    const setupSystemUI = async () => {
      if (Platform.OS === 'android') {
        // 1. Hide the bottom navigation bar
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");

        // 2. Imperative Status Bar calls (No component needed)
        // This forces icons to white and ensures the background is transparent
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
    };

    setupSystemUI();
  }, []);

  return (
    <VaultProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="AddSite" component={AddSiteScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </VaultProvider>
  );
}