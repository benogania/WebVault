import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SuggestionCard({ title, description, icon }) {
  return (
    <TouchableOpacity className="bg-cardBg rounded-2xl p-4 mr-4 w-64 border border-slate-700">
      <View className="flex-row items-center mb-3">
        <View className="bg-slate-700 p-2 rounded-lg mr-3">
          <Ionicons name={icon} size={20} color="#a855f7" />
        </View>
        <Text className="text-white font-bold text-lg">{title}</Text>
      </View>
      <Text className="text-slate-400 text-sm leading-5">{description}</Text>
    </TouchableOpacity>
  );
}