import React, { useContext } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, Platform, ToastAndroid } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import Header from '../components/Header';
import { VaultContext } from '../context/VaultContext';

export default function SettingsScreen() {
  const { vaultSites, importSites, updateDiscoverCache } = useContext(VaultContext);

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
      
      // Basic validation to ensure it's an array of vault objects
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
      "This will remove your currently generated batch of AI suggestions. You can generate a new batch in the Discover tab.",
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

  const openDeveloperLink = async () => {
    // You can replace this URL with your actual GitHub or Portfolio link!
    await WebBrowser.openBrowserAsync('https://github.com', {
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

        {/* --- DATA SECTION --- */}
        <View className="px-4 mb-8">
          <Text className="text-slate-500 text-xs font-bold mb-3 uppercase tracking-widest pl-2">Data & Storage</Text>
          
          <SettingItem 
            icon="push-outline" 
            title="Export Vault" 
            description="Copy your entire vault as a JSON string to back it up anywhere."
            onPress={handleExport} 
          />
          
          <SettingItem 
            icon="download-outline" 
            title="Import Vault" 
            description="Paste a previously exported JSON backup to merge it into your vault."
            onPress={handleImport} 
          />

          <SettingItem 
            icon="sparkles" 
            title="Clear AI Cache" 
            description="Wipe local Discover data to force a fresh batch of suggestions."
            onPress={handleClearCache} 
          />
        </View>

        {/* --- ABOUT SECTION --- */}
        <View className="px-4 mb-8">
          <Text className="text-slate-500 text-xs font-bold mb-3 uppercase tracking-widest pl-2">About</Text>
          
          <TouchableOpacity 
            onPress={openDeveloperLink}
            className="flex-row items-center bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-700/50"
          >
            <View className="w-12 h-12 rounded-xl justify-center items-center bg-slate-700 border border-slate-600 mr-4">
              <Ionicons name="code-slash" size={24} color="#38bdf8" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold mb-1">Developer</Text>
              <Text className="text-slate-400 text-xs leading-4">Built with React Native & Gemini AI</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#475569" />
          </TouchableOpacity>

          {/* Static Version Badge */}
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