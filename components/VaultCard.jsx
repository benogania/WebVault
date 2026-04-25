import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';

export default function VaultCard({ name, icon, iconUrl, color, isPinned, onPress, onLongPress }) {
  return (
    // FIXED: Enforced exactly 30% width to allow 3 cards per row perfectly
    <TouchableOpacity 
      onPress={onPress} 
      onLongPress={onLongPress} 
      className="w-[30%] items-center mb-6"
    >
      {/* Matches FolderCard: h-28 and rounded-[24px] */}
      <View className="w-full h-28 bg-slate-800 rounded-xl border border-slate-700/60 p-3 justify-between items-center shadow-lg relative">
        
        {/* Pinned Indicator - Tucked neatly in the corner */}
        {isPinned && (
          <View className="absolute top-2 right-2 z-10">
            <Entypo name="pin" size={14} color="#d946ef" />
          </View>
        )}
        
        {/* Inner Icon Container */}
        <View className="flex-1 w-full justify-center items-center pt-1">
          <View className="w-10 h-10 bg-slate-900 rounded-2xl overflow-hidden justify-center items-center border border-slate-700/50">
            {iconUrl ? (
              <Image source={{ uri: iconUrl }} className="w-full h-full" />
            ) : (
              <Ionicons name={icon || 'planet'} size={28} color={color || '#a855f7'} />
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