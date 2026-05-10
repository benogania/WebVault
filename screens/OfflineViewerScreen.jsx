import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OfflineViewerScreen({ route, navigation }) {
  // 1. SAFE EXTRACTION: Default to an empty object if route.params is undefined
  const { site } = route.params || {};

  // 2. FALLBACK UI: If site is still undefined, show an error screen instead of crashing
  if (!site) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <Ionicons name="warning" size={48} color="#ef4444" />
        <Text className="text-white text-lg mt-4 font-bold">Failed to load offline site</Text>
        <Text className="text-slate-400 mt-2">The site data is missing.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-8 px-6 py-3 bg-slate-800 rounded-xl">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-slate-800 rounded-full">
          <Ionicons name="arrow-back" size={20} color="#a855f7" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg" numberOfLines={1}>{site.name}</Text>
          <Text className="text-emerald-500 text-xs">Viewing Offline Copy</Text>
        </View>
      </View>

      {/* WebView rendering the local file URI */}
      <WebView 
        source={{ uri: site.localUri }} 
        originWhitelist={['*']} 
        style={{ flex: 1, backgroundColor: '#0f172a' }}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}