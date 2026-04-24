import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header() {
  return (
    <View className="flex-row items-center mt-12 mb-6 px-4">
      <TouchableOpacity>
        <Ionicons name="menu" size={28} color="#d946ef" />
      </TouchableOpacity>
      <Text className="text-white text-xl font-bold ml-4" style={{ letterSpacing: 2 }}>
        WEBVAULT
      </Text>
    </View>
  );
}