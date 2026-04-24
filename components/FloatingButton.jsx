import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FloatingButton({ onPress }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="absolute bottom-6 right-6 bg-accentPink w-16 h-16 rounded-2xl justify-center items-center shadow-lg"
      style={{ shadowColor: '#d946ef', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 }}
    >
      <Ionicons name="add" size={32} color="white" />
    </TouchableOpacity>
  );
}