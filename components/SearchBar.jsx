import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value, onChangeText }) {
  return (
    <View className="flex-row items-center bg-cardBg rounded-xl px-4 py-1.5 mx-4 mb-6 border border-slate-700 shadow-sm">
      <Ionicons name="search" size={20} color="#94a3b8" />
      <TextInput 
        value={value}
        onChangeText={onChangeText}
        placeholder="Search your vault..." 
        placeholderTextColor="#94a3b8"
        className="flex-1 text-white ml-3 text-base"
      />
    </View>
  );
}