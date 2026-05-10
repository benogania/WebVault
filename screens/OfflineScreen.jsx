import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VaultContext } from '../context/VaultContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function OfflineScreen({ navigation }) {
  const { offlineSites, downloadManualUrl, deleteOfflineSite } = useContext(VaultContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');

  const handleDownload = async () => {
    if (!siteName || !siteUrl) return Alert.alert("Error", "Please fill in all fields");
    
    setLoading(true);
    const success = await downloadManualUrl(siteName, siteUrl);
    setLoading(false);

    if (success) {
      setModalVisible(false);
      setSiteName('');
      setSiteUrl('');
    } else {
      Alert.alert("Download Failed", "Make sure the URL is correct and you have internet.");
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient colors={['rgba(56, 189, 248, 0.15)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140 }} />
      
      <View className="px-6 pt-14 pb-4">
        <Text className="text-white text-3xl font-bold">Offline Vault</Text>
        <Text className="text-slate-400 text-sm">Access your saved pages without internet</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {offlineSites.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="cloud-offline-outline" size={80} color="#334155" />
            <Text className="text-slate-500 mt-4 text-center px-10">No offline pages yet. Click the + button to save your first site.</Text>
          </View>
        ) : (
          offlineSites.map(site => (
            <TouchableOpacity 
              key={site.id} 
              onPress={() => navigation.navigate('OfflineViewerScreen', { site })}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 mb-3 flex-row items-center"
            >
              <View className="w-12 h-12 bg-sky-500/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="document-text" size={24} color="#38bdf8" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg" numberOfLines={1}>{site.name}</Text>
                <Text className="text-slate-500 text-xs" numberOfLines={1}>{site.url}</Text>
                <Text className="text-sky-500 text-[10px] mt-1 font-bold">SAVED: {site.date}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteOfflineSite(site.id)} className="p-2">
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        className="absolute bottom-10 right-6 w-16 h-16 bg-sky-500 rounded-full items-center justify-center shadow-lg shadow-sky-500/50"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* --- DOWNLOAD MODAL --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <Text className="text-white text-xl font-bold mb-6">Download New Page</Text>
            
            <Text className="text-slate-400 mb-2 ml-1">Page Name</Text>
            <TextInput 
              value={siteName} 
              onChangeText={setSiteName}
              placeholder="e.g. React Documentation"
              placeholderTextColor="#475569"
              className="bg-slate-800 text-white p-4 rounded-xl mb-4 border border-slate-700"
            />

            <Text className="text-slate-400 mb-2 ml-1">Website URL</Text>
            <TextInput 
              value={siteUrl} 
              onChangeText={setSiteUrl}
              autoCapitalize="none"
              placeholder="https://..."
              placeholderTextColor="#475569"
              className="bg-slate-800 text-white p-4 rounded-xl mb-6 border border-slate-700"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-slate-800 p-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleDownload}
                disabled={loading}
                className={`flex-1 ${loading ? 'bg-sky-900' : 'bg-sky-500'} p-4 rounded-xl items-center flex-row justify-center`}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Download</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}