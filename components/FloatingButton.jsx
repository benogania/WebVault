import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FloatingButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      // FIXED: Hardcoded background color to ensure it renders
      className="absolute bottom-6 right-6 w-14 h-14 rounded-xl bg-[#d946ef] justify-center items-center shadow-lg shadow-purple-500/50 z-50"
    >
      <Ionicons name="add" size={32} color="#ffffff" />
    </TouchableOpacity>
  );
}