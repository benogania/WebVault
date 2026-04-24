import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SiteActionModal({ visible, site, onClose, onTogglePin, onEdit, onDelete }) {
  if (!site) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose} 
        className="flex-1 bg-black/60 justify-end"
      >
        {/* Modal Content */}
        <View className="bg-cardBg rounded-t-3xl p-6 border-t border-slate-700">
          
          {/* Header (Site Info) */}
          <View className="flex-row items-center mb-6 pb-6 border-b border-slate-700/50">
            <View className="w-12 h-12 rounded-xl bg-slate-800 justify-center items-center overflow-hidden mr-4 border border-slate-700">
              {site.iconUrl ? (
                <Image source={{ uri: site.iconUrl }} className="w-8 h-8 rounded-md" />
              ) : (
                <Ionicons name={site.icon} size={24} color={site.color} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">{site.name}</Text>
              <Text className="text-slate-400 text-sm" numberOfLines={1}>{site.url}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            onPress={() => { onEdit(site); onClose(); }}
            className="flex-row items-center mb-6"
          >
            <Ionicons name="pencil" size={22} color="#a855f7" className="mr-4" />
            <Text className="text-white text-lg ml-4">Edit Site Info</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => { onTogglePin(site.id); onClose(); }}
            className="flex-row items-center mb-6"
          >
            <Ionicons name={site.isPinned ? "pin-outline" : "pin"} size={22} color="#a855f7" className="mr-4" />
            <Text className="text-white text-lg ml-4">
              {site.isPinned ? "Unpin from Dashboard" : "Pin to Dashboard"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => { onDelete(site.id); onClose(); }}
            className="flex-row items-center mb-6"
          >
            <Ionicons name="trash" size={22} color="#ef4444" className="mr-4" />
            <Text className="text-red-500 text-lg ml-4 font-semibold">Remove from Vault</Text>
          </TouchableOpacity>

        </View>
      </TouchableOpacity>
    </Modal>
  );
}