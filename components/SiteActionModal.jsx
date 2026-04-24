import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ToastAndroid, Platform, Animated } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function SiteActionModal({ visible, site, onClose, onTogglePin, onEdit, onDelete }) {
  // Setup the animation values
  const slideAnim = useRef(new Animated.Value(500)).current; // Starts pushed 500px down
  const fadeAnim = useRef(new Animated.Value(0)).current;    // Starts fully transparent

  // Run the "Open" animation when the modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset values before animating
      slideAnim.setValue(500);
      fadeAnim.setValue(0);
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10, // Creates a smooth, slight bounce effect
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  // Custom "Close" function that animates OUT before unmounting
  const handleClose = (actionCallback) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500, // Slide back down
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose(); // Hide the modal in state ONLY after animation finishes
      if (actionCallback) actionCallback(); // Run the passed action (edit, delete, etc.)
    });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(site.url);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Link copied to clipboard', ToastAndroid.SHORT);
    }
    handleClose(); // Close smoothly after copying
  };

  if (!site) return null;

  return (
    <Modal
      animationType="none" // Disabled default clunky animation so our custom one takes over
      transparent={true}
      visible={visible}
      onRequestClose={() => handleClose()}
    >
      {/* 1. Fading Background Overlay */}
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', opacity: fadeAnim }}>
        
        {/* Tapping the background triggers the smooth close */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => handleClose()} 
          className="flex-1 justify-end"
        >
          
          {/* 2. Sliding Bottom Sheet */}
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            
            {/* Inner content (tapping this does NOT close the modal) */}
            <TouchableOpacity 
              activeOpacity={1} 
              className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700 shadow-2xl"
            >
              
              {/* Site Info Header */}
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

              {/* Action: Copy Link */}
              <TouchableOpacity 
                onPress={copyToClipboard}
                className="flex-row items-center mb-6"
              >
                <Ionicons name="copy-outline" size={22} color="#a855f7" />
                <Text className="text-white text-lg ml-4">Copy Link</Text>
              </TouchableOpacity>

              {/* Action: Edit */}
              {/* Note how we pass the action inside handleClose so it animates first! */}
              <TouchableOpacity 
                onPress={() => handleClose(() => onEdit(site))}
                className="flex-row items-center mb-6"
              >
                <Ionicons name="pencil" size={22} color="#a855f7" />
                <Text className="text-white text-lg ml-4">Edit Site Info</Text>
              </TouchableOpacity>

              {/* Action: Pin/Unpin */}
              <TouchableOpacity 
                onPress={() => handleClose(() => onTogglePin(site.id))}
                className="flex-row items-center mb-6"
              >
                <View className="w-6 items-center">
                  <Entypo name="pin" size={20} color="#a855f7" />
                </View>
                <Text className="text-white text-lg ml-4">
                  {site.isPinned ? "Unpin from Dashboard" : "Pin to Dashboard"}
                </Text>
              </TouchableOpacity>

              {/* Action: Delete */}
              <TouchableOpacity 
                onPress={() => handleClose(() => onDelete(site.id))}
                className="flex-row items-center mb-6"
              >
                <Ionicons name="trash" size={22} color="#ef4444" />
                <Text className="text-red-500 text-lg ml-4 font-semibold">Remove from Vault</Text>
              </TouchableOpacity>

            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}