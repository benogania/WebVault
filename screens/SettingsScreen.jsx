import React from 'react';
import { View, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-darkBg justify-center items-center">
      <Text className="text-white text-2xl font-bold">Settings</Text>
      <Text className="text-slate-400 mt-2">App configuration coming soon.</Text>
    </View>
  );
}