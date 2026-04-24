import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SuggestionCard({ title, description, url, onPreview, onAdd }) {
  // Safely extract domain for the Google Favicon API
  const getDomain = (link) => {
    try {
      return link.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    } catch (e) {
      return '';
    }
  };

  const domain = getDomain(url);
  const iconUrl = domain ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}` : null;

  return (
    <View className="bg-cardBg rounded-2xl p-4 mb-4 border border-slate-700">
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 rounded-xl bg-slate-800 justify-center items-center overflow-hidden border border-slate-700 mr-4">
          {iconUrl ? (
             <Image source={{ uri: iconUrl }} className="w-8 h-8 rounded-md" />
          ) : (
             <Ionicons name="globe-outline" size={24} color="#d946ef" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-1">{title}</Text>
          <Text className="text-slate-400 text-xs leading-4" numberOfLines={2}>{description}</Text>
        </View>
      </View>

      <View className="flex-row justify-between space-x-3">
        <TouchableOpacity 
          onPress={onPreview}
          className="flex-1 bg-slate-800/80 py-3 rounded-xl items-center flex-row justify-center"
        >
          <Ionicons name="open-outline" size={18} color="#94a3b8" className="mr-2" />
          <Text className="text-slate-300 font-semibold ml-2">Preview</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onAdd}
          className="flex-1 bg-accentPink py-3 rounded-xl items-center flex-row justify-center"
        >
          <Ionicons name="add" size={20} color="#fff" className="mr-1" />
          <Text className="text-white font-bold ml-1">Add to Vault</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}