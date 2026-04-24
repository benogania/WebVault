import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VaultContext } from '../context/VaultContext';

export default function AddSiteScreen({ route, navigation }) {
  const siteToEdit = route.params?.siteToEdit;
  const prefill = route.params?.prefill; 
  
  const [url, setUrl] = useState(siteToEdit ? siteToEdit.url : (prefill ? prefill.url : ''));
  const [name, setName] = useState(siteToEdit ? siteToEdit.name : (prefill ? prefill.name : ''));
  const [iconUrl, setIconUrl] = useState(siteToEdit ? siteToEdit.iconUrl : null);

  // THIS IS THE MISSING LINE:
  const { addSite, editSite } = useContext(VaultContext);

  // Auto-fetch icon and guess name when URL changes
  useEffect(() => {
    if (url.length > 4 && url.includes('.')) {
      let validUrl = url;
      if (!validUrl.startsWith('http')) {
        validUrl = 'https://' + validUrl;
      }
      
      try {
        const domain = new URL(validUrl).hostname;
        // Fetch high-res favicon using Google's service
        setIconUrl(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
        
        // Auto-fill name if it's currently empty
        if (!name) {
          const parts = domain.split('.');
          if (parts.length > 1) {
            let siteName = parts[parts.length - 2];
            setName(siteName.charAt(0).toUpperCase() + siteName.slice(1));
          }
        }
      } catch (e) {
        // Invalid URL, wait for user to type more
        if (!siteToEdit) setIconUrl(null);
      }
    } else {
      if (!siteToEdit) setIconUrl(null);
    }
  }, [url]);

  const handleSave = () => {
    if (name.trim() && url.trim()) {
      let finalUrl = url.startsWith('http') ? url : `https://${url}`;
      
      if (siteToEdit) {
        // If we are editing, call editSite
        editSite(siteToEdit.id, { name, url: finalUrl, iconUrl });
      } else {
        // If we are adding new, call addSite
        addSite(name, finalUrl, iconUrl);
      }
      
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-darkBg justify-center px-4"
    >
      <View className="bg-cardBg border border-slate-700/60 rounded-3xl p-6 shadow-2xl">
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-white text-2xl font-bold" style={{ letterSpacing: 1 }}>
            {siteToEdit ? 'Edit Site' : 'Add New Site'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* URL Input */}
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-bold mb-2 uppercase" style={{ letterSpacing: 2 }}>
            Site URL
          </Text>
          <View className="flex-row items-center border border-slate-700 rounded-xl bg-slate-800/50 px-4 py-1">
            <Ionicons name="link" size={20} color="#94a3b8" />
            <TextInput 
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              placeholderTextColor="#475569"
              autoCapitalize="none"
              keyboardType="url"
              className="flex-1 text-white text-base ml-3 py-3"
            />
          </View>
        </View>

        {/* Name Input */}
        <View className="mb-8">
          <Text className="text-slate-400 text-xs font-bold mb-2 uppercase" style={{ letterSpacing: 2 }}>
            Site Name
          </Text>
          <View className="flex-row items-center border border-slate-700 rounded-xl bg-slate-800/50 px-4 py-1">
            <Ionicons name="briefcase-outline" size={20} color="#94a3b8" />
            <TextInput 
              value={name}
              onChangeText={setName}
              placeholder="My Favorite Site"
              placeholderTextColor="#475569"
              className="flex-1 text-white text-base ml-3 py-3"
            />
          </View>
        </View>

        {/* Preview Box */}
        <View className="flex-row items-center border border-slate-700 rounded-xl bg-slate-800/30 p-4 mb-8">
          <View className="w-12 h-12 rounded-xl bg-slate-800 justify-center items-center border border-slate-700 overflow-hidden mr-4">
            {iconUrl ? (
              <Image source={{ uri: iconUrl }} className="w-8 h-8 rounded-md" />
            ) : (
              <Ionicons name="globe-outline" size={24} color="#d946ef" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-slate-500 text-[10px] font-bold mb-1 uppercase" style={{ letterSpacing: 2 }}>
              Preview
            </Text>
            <Text className="text-slate-300 italic text-sm" numberOfLines={1}>
              {url ? (name ? name : 'Fetching site metadata...') : 'Waiting for URL...'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity 
          onPress={handleSave}
          className="bg-accentPink rounded-xl py-4 items-center mb-4"
          style={{ shadowColor: '#d946ef', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
        >
          <Text className="text-white font-bold text-lg" style={{ letterSpacing: 1 }}>
            {siteToEdit ? 'Save Changes' : 'Add to Vault'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="py-4 items-center" 
          onPress={() => navigation.goBack()}
        >
          <Text className="text-slate-400 font-bold text-sm" style={{ letterSpacing: 1.5 }}>
            CANCEL
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}