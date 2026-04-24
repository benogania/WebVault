import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VaultCard({ id, name, icon, iconUrl, color, isPinned, onPress, onLongPress }) {
  return (
    <TouchableOpacity 
      onPress={() => onPress(id)}
      onLongPress={() => onLongPress(id)}
      className="bg-cardBg rounded-2xl w-[31%] mx-[1%] mb-2 h-28 justify-center items-center relative border border-slate-700/50"
    >
      {isPinned && (
        <View className="absolute top-2 right-2 z-10">
          <Ionicons name="pin" size={16} color="#d946ef" />
        </View>
      )}
      
      <View className="w-12 h-12 rounded-xl justify-center items-center mb-3 overflow-hidden" style={{ backgroundColor: `${color}20` }}>
        {iconUrl ? (
          <Image source={{ uri: iconUrl }} className="w-8 h-8 rounded-md" />
        ) : (
          <Ionicons name={icon} size={24} color={color} />
        )}
      </View>
      
      <Text className="text-slate-300 text-xs font-medium truncate w-full px-2 text-center" numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}