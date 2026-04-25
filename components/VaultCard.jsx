import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';

export default function VaultCard({ name, icon, iconUrl, color, isPinned, hidePinIcon, onPress, onLongPress }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      onLongPress={onLongPress} 
      // FIXED: Using exactly 31% width to guarantee 3 items per row
      className="w-[31%] items-center mb-4"
    >
      {/* Restored rounded-xl and clean sizing */}
      <View className="w-full h-28 bg-slate-900 rounded-xl border border-slate-700/60 p-3 justify-between items-center shadow-lg relative">
        
        {/* Pinned Indicator */}
        {isPinned && !hidePinIcon && (
          <View className="absolute top-2 right-2 z-10">
            <Entypo name="pin" size={14} color="#d946ef" />
          </View>
        )}
        
        {/* Inner Icon Container */}
        <View className="flex-1 w-full justify-center items-center pt-1">
          <View className="w-10 h-10 bg-slate-900 rounded-[14px] overflow-hidden justify-center items-center border border-slate-700/50">
            {iconUrl ? (
              <Image source={{ uri: iconUrl }} className="w-full h-full" />
            ) : (
              <Ionicons name={icon || 'planet'} size={24} color={color || '#a855f7'} />
            )}
          </View>
        </View>
        
        {/* Title */}
        <Text className="text-white text-xs font-bold text-center mt-2 w-full" numberOfLines={1}>
          {name}
        </Text>
        
      </View>
    </TouchableOpacity>
  );
}