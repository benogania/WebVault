import React, { useContext, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, Platform, ToastAndroid, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import Header from '../components/Header';
import { VaultContext } from '../context/VaultContext';

export default function SettingsScreen() {
  // NEW: Destructure exhaustedKeys
  const { vaultSites, importSites, updateDiscoverCache, apiKeys = [], addApiKey, removeApiKey, exhaustedKeys = [] } = useContext(VaultContext);
  const [newKey, setNewKey] = useState('');

  // --- LOGIC ---
  const handleExport = async () => {
    if (vaultSites.length === 0) {
      Alert.alert("Vault Empty", "There are no sites to export yet.");
      return;
    }
    const jsonString = JSON.stringify(vaultSites);
    await Clipboard.setStringAsync(jsonString);
    
    if (Platform.OS === 'android') {
      ToastAndroid.show('Vault exported to clipboard!', ToastAndroid.SHORT);
    } else {
      Alert.alert("Export Successful", "Your Vault data has been copied to your clipboard.");
    }
  };

  const handleImport = async () => {
    const clipboardContent = await Clipboard.getStringAsync();
    
    if (!clipboardContent) {
      Alert.alert("Nothing to Import", "Your clipboard is empty.");
      return;
    }

    try {
      const parsedData = JSON.parse(clipboardContent);
      
      if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].url) {
        await importSites(parsedData);
        Alert.alert("Import Successful", `Successfully merged ${parsedData.length} sites into your vault.`);
      } else {
        throw new Error("Invalid format");
      }
    } catch (error) {
      Alert.alert("Import Failed", "The data on your clipboard is not a valid WebVault JSON backup.");
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear AI Cache", 
      "This will remove your currently generated batch of AI suggestions.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear Data", 
          style: "destructive",
          onPress: () => {
            updateDiscoverCache(null);
            if (Platform.OS === 'android') {
              ToastAndroid.show('AI Cache cleared', ToastAndroid.SHORT);
            }
          }
        }
      ]
    );
  };

  const handleAddKey = () => {
    if (newKey.trim().length > 10) {
      addApiKey(newKey.trim());
      setNewKey('');
      if (Platform.OS === 'android') {
        ToastAndroid.show('API Key Added', ToastAndroid.SHORT);
      }
    } else {
      Alert.alert("Invalid Key", "Please enter a valid API Key.");
    }
  };

  const openDeveloperLink = async () => {
    await WebBrowser.openBrowserAsync('https://github.com/benogania', {
      toolbarColor: '#0f172a',
      controlsColor: '#d946ef',
    });
  };

  // --- UI COMPONENTS ---
  const SettingItem = ({ icon, title, description, onPress, danger }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-700/50"
    >
      <View className={`w-12 h-12 rounded-xl justify-center items-center border mr-4 ${danger ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-700 border-slate-600'}`}>
        <Ionicons name={icon} size={24} color={danger ? "#ef4444" : "#a855f7"} />
      </View>
      <View className="flex-1">
        <Text className={`text-lg font-bold mb-1 ${danger ? 'text-red-500' : 'text-white'}`}>{title}</Text>
        <Text className="text-slate-400 text-xs leading-4">{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#475569" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient colors={['rgba(217, 70, 239, 0.15)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 10 }} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Header />
        
        <View className="px-4 mb-6">
          <Text className="text-white text-3xl font-bold">Settings</Text>
          <Text className="text-slate-400 mt-1">Manage your vault and data.</Text>
        </View>

        {/* --- API KEYS SECTION --- */}
        <View className="px-4 mb-8">
          <Text className="text-slate-500 text-xs font-bold mb-3 uppercase tracking-widest pl-2">AI API Keys (Fallbacks)</Text>
          
          <View className="flex-row mb-4">
            <View className="flex-1 flex-row items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 mr-2">
              <Ionicons name="key-outline" size={20} color="#94a3b8" />
              <TextInput 
                value={newKey}
                onChangeText={setNewKey}
                placeholder="Paste API Key here..."
                placeholderTextColor="#475569"
                className="flex-1 text-white ml-2 py-2"
                secureTextEntry
              />
            </View>
            <TouchableOpacity onPress={handleAddKey} className="bg-fuchsia-500 px-4 rounded-xl justify-center items-center shadow-lg shadow-fuchsia-500/30">
              <Text className="text-white font-bold">Add</Text>
            </TouchableOpacity>
          </View>

          {/* NEW: Map through keys and style them if they are exhausted */}
          {apiKeys.map((key, index) => {
            const isExhausted = exhaustedKeys.includes(key);
            
            return (
              <View 
                key={index} 
                className={`flex-row items-center justify-between p-3 rounded-xl mb-2 border ${
                  isExhausted ? 'bg-orange-500/10 border-orange-500/50' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className={`tracking-widest ${isExhausted ? 'text-orange-400 font-semibold' : 'text-slate-300'}`}>
                    {key.substring(0, 8)}...{key.substring(key.length - 4)}
                  </Text>
                  {isExhausted && (
                    <Text className="text-[10px] text-orange-500 font-bold ml-3 uppercase tracking-wider">
                      Limit Reached
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => removeApiKey(key)} className="p-2">
                  <Ionicons name="trash" size={18} color={isExhausted ? '#f97316' : '#ef4444'} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* --- DATA SECTION --- */}
        <View className="px-4 mb-8">
          <Text className="text-slate-500 text-xs font-bold mb-3 uppercase tracking-widest pl-2">Data & Storage</Text>
          <SettingItem icon="push-outline" title="Export Vault" description="Copy your entire vault as a JSON string to back it up anywhere." onPress={handleExport} />
          <SettingItem icon="download-outline" title="Import Vault" description="Paste a previously exported JSON backup to merge it into your vault." onPress={handleImport} />
          <SettingItem icon="sparkles" title="Clear AI Cache" description="Wipe local Discover data to force a fresh batch of suggestions." onPress={handleClearCache} />
        </View>

        {/* --- ABOUT SECTION --- */}
        <View className="px-4 mb-8">
          <Text className="text-slate-500 text-xs font-bold mb-3 uppercase tracking-widest pl-2">About</Text>
          <TouchableOpacity onPress={openDeveloperLink} className="flex-row items-center bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-700/50">
            <View className="w-12 h-12 rounded-xl justify-center items-center bg-slate-700 border border-slate-600 mr-4">
              <Ionicons name="code-slash" size={24} color="#38bdf8" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold mb-1">Developed By</Text>
              <Text className="text-slate-400 text-xs leading-4">Benjun Ogania</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#475569" />
          </TouchableOpacity>

          <View className="flex-row items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30">
            <View className="w-12 h-12 rounded-xl justify-center items-center mr-4">
              <Ionicons name="information-circle-outline" size={26} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-300 text-lg font-bold mb-1">App Version</Text>
              <Text className="text-slate-500 text-xs">v1.0.0 (Production)</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}