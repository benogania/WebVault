import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function SectionHeader({ title, actionText, onActionPress }) {
  return (
    <View className="flex-row justify-between items-end mb-4 px-4 mt-4">
      <Text className="text-white text-2xl font-bold">{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress}>
          <Text 
            className="font-semibold text-xs" 
            // We added color: '#d946ef' here to force the primary pink color!
            style={{ letterSpacing: 1.5, color: '#d946ef' }}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}