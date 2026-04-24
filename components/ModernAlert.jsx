import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ModernAlert({ visible, title, message, onClose, type = 'error' }) {
  const isError = type === 'error';
  const iconName = isError ? 'warning-outline' : 'checkmark-circle-outline';
  const iconColor = isError ? '#ef4444' : '#d946ef'; // Red for error, Pink for success
  const buttonBg = isError ? 'bg-red-500' : 'bg-accentPink';

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      {/* Dimmed Background Overlay */}
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        
        {/* Popup Container */}
        <View className="bg-cardBg w-full max-w-sm rounded-3xl p-6 border border-slate-700 items-center overflow-hidden shadow-2xl shadow-black">
          
          {/* Subtle Top Glow */}
          <LinearGradient
            colors={[isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(217, 70, 239, 0.15)', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100 }}
            pointerEvents="none"
          />

          <View className="bg-slate-800 p-4 rounded-full mb-4 border border-slate-700/50">
            <Ionicons name={iconName} size={48} color={iconColor} />
          </View>

          <Text className="text-white text-2xl font-bold mb-2 text-center">{title}</Text>
          <Text className="text-slate-400 text-center mb-8 leading-5 px-2">{message}</Text>

          <TouchableOpacity
            onPress={onClose}
            className={`w-full py-4 rounded-xl items-center ${buttonBg}`}
          >
            <Text className="text-white font-bold text-lg">Okay</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}