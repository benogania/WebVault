import React, { useEffect, useRef } from 'react';
import { Platform, StatusBar, AppState } from 'react-native'; // NEW: Added AppState
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as NavigationBar from 'expo-navigation-bar';

import TabNavigator from './navigation/TabNavigator';
import AddSiteScreen from './screens/AddSiteScreen';
import { VaultProvider } from './context/VaultContext';
import DiscoverScreen from './screens/DiscoverScreen';
import OfflineViewerScreen from './screens/OfflineViewerScreen';
import AllSitesScreen from './screens/AllSitesScreen';
import WebViewerScreen from './screens/WebViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  
  const appState = useRef(AppState.currentState);

  useEffect(() => {

    const enforceImmersiveMode = async () => {
      if (Platform.OS === 'android') {
        // Hide the bottom navigation bar
        await NavigationBar.setVisibilityAsync("hidden");

        // Force icons to white and ensure background is transparent
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
    };

    // 1. Run it immediately when the app first opens
    enforceImmersiveMode();

    // 2. Setup the AppState listener to watch for the app returning from the background
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        enforceImmersiveMode();
      }
      appState.current = nextAppState;
    });

    // Cleanup the listener if the app is destroyed
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <VaultProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right', 
            contentStyle: { backgroundColor: '#0f172a' } 
          }}
        >
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          
          <Stack.Screen 
            name="AddSite" 
            component={AddSiteScreen} 
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal', 
            }}
          />
          
          <Stack.Screen name="Discover" component={DiscoverScreen} />
          <Stack.Screen name="OfflineViewerScreen" component={OfflineViewerScreen} />
          <Stack.Screen name="AllSites" component={AllSitesScreen} />
          <Stack.Screen name="WebViewerScreen" component={WebViewerScreen} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </VaultProvider>
  );
}