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

  const { addSite, editSite } = useContext(VaultContext);

  useEffect(() => {
    if (url.length > 4 && url.includes('.')) {
      let validUrl = url;
      if (!validUrl.startsWith('http')) {
        validUrl = 'https://' + validUrl;
      }
      
      try {
        const domain = new URL(validUrl).hostname;
        setIconUrl(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
        
        if (!name) {
          const parts = domain.split('.');
          if (parts.length > 1) {
            let siteName = parts[parts.length - 2];
            setName(siteName.charAt(0).toUpperCase() + siteName.slice(1));
          }
        }
      } catch (e) {
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
        editSite(siteToEdit.id, { name, url: finalUrl, iconUrl });
      } else {
        addSite(name, finalUrl, iconUrl);
      }
      
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // FIXED: Using slate-900 instead of darkBg
      className="flex-1 bg-slate-900 justify-center px-4"
    >
      {/* FIXED: Using slate-800 instead of cardBg */}
      <View className="bg-slate-800 border border-slate-700/60 rounded-3xl p-6 shadow-2xl">
        
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-white text-2xl font-bold" style={{ letterSpacing: 1 }}>
            {siteToEdit ? 'Edit Site' : 'Add New Site'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#94a3b8" />
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity 
          onPress={handleSave}
          // FIXED: Using fuchsia-500 instead of accentPink
          className="bg-fuchsia-500 rounded-xl py-4 items-center mb-4"
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