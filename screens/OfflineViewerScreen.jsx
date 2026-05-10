import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OfflineViewerScreen({ route, navigation }) {
  // 1. SAFE EXTRACTION
  const { site } = route.params || {};
  
  const [isLoading, setIsLoading] = useState(true);

  // 2. FALLBACK UI
  if (!site) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <Ionicons name="warning" size={48} color="#ef4444" />
        <Text className="text-white text-lg mt-4 font-bold">Failed to load offline site</Text>
        <Text className="text-slate-400 mt-2">The site data is missing.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-8 px-6 py-3 bg-slate-800 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-slate-800 rounded-full">
          <Ionicons name="arrow-back" size={20} color="#38bdf8" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg" numberOfLines={1}>{site.name}</Text>
          <Text className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Viewing Offline Copy</Text>
        </View>
      </View>

      {/* Web Content Area */}
      <View className="flex-1 bg-white">
        
        {/* Loading Overlay */}
        {isLoading && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-slate-900">
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text className="text-slate-400 mt-4 font-bold">Unpacking offline page...</Text>
          </View>
        )}

        {/* WebView rendering the local file URI */}
        <WebView 
          source={{ uri: site.localUri }} 
          originWhitelist={['*']} 
          style={{ flex: 1, backgroundColor: '#ffffff' }}
          
          // CRITICAL PROPS FOR LOCAL FILES
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          
          // Track loading state
          onLoadEnd={() => setIsLoading(false)}
          
          // Fallback if the local HTML file is broken or missing
          renderError={(errorDomain, errorCode, errorDesc) => (
            <View className="flex-1 bg-slate-900 justify-center items-center p-6">
              <Ionicons name="document-text-outline" size={48} color="#ef4444" />
              <Text className="text-white font-bold mt-4 text-center">Cannot read file</Text>
              <Text className="text-slate-500 mt-2 text-center text-xs">{errorDesc}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}