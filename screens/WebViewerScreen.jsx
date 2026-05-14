import React, { useState, useContext } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Platform, ToastAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VaultContext } from '../context/VaultContext';

export default function WebViewerScreen({ route, navigation }) {
  const { site } = route.params || {};
  const { downloadManualUrl } = useContext(VaultContext);
  
  const [isLoading, setIsLoading] = useState(true);

  if (!site) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <Ionicons name="warning" size={48} color="#ef4444" />
        <Text className="text-white mt-4 font-bold">Invalid Site</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-8 px-6 py-3 bg-slate-800 rounded-xl">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSaveOffline = () => {
    // Triggers the download process we built earlier
    downloadManualUrl(site.name, site.url);
    
    if (Platform.OS === 'android') {
      ToastAndroid.show("Added to Offline Download Queue", ToastAndroid.SHORT);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-800 justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-slate-800 rounded-full">
            <Ionicons name="close" size={20} color="#a855f7" />
          </TouchableOpacity>
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>{site.name}</Text>
            <Text className="text-slate-500 text-xs" numberOfLines={1}>{site.url}</Text>
          </View>
        </View>

        {/* Save Offline Button */}
        <TouchableOpacity 
          onPress={handleSaveOffline} 
          className="flex-row items-center bg-sky-500/20 px-3 py-1.5 rounded-lg border border-sky-500/30"
        >
          <Ionicons name="cloud-download-outline" size={16} color="#38bdf8" />
          <Text className="text-sky-400 font-bold text-xs ml-1.5">Save Offline</Text>
        </TouchableOpacity>
      </View>

      {/* Web Content */}
      <View className="flex-1 bg-white relative">
        {isLoading && (
          <View className="absolute top-0 left-0 right-0 z-10 bg-slate-900/50 p-2 items-center">
            <ActivityIndicator size="small" color="#a855f7" />
          </View>
        )}
        
        <WebView 
          source={{ uri: site.url }} 
          style={{ flex: 1 }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>
    </SafeAreaView>
  );
}