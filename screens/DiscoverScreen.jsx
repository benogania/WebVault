import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Header from '../components/Header';
import SuggestionCard from '../components/SuggestionCard';
import ModernAlert from '../components/ModernAlert';
import { fetchDiscoverSites } from '../utils/geminiApi';
import { VaultContext } from '../context/VaultContext';

const AVAILABLE_CATEGORIES = [
  "React Native", "MERN Stack", "DevTools", "Generative Art", 
  "LLMs", "Machine Learning", "Cybersecurity", "Cloud Computing",
  "UI/UX Design", "Productivity", "Open Source", "Tech News", 
  "Indie Hacking", "Startups", "FinTech", "Web3", "Data Science", "No-Code Tools"
];

export default function DiscoverScreen({ navigation }) {
  // NEW: Destructured apiKeys AND markKeyExhausted from context
  const { 
    preferences, savePreferences, addSite, 
    discoverCache, updateDiscoverCache, apiKeys, markKeyExhausted 
  } = useContext(VaultContext);
  
  const [activeTab, setActiveTab] = useState('All');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tempPrefs, setTempPrefs] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });

  const tabs = ['All', ...preferences];

  const showAlert = (title, message, type = 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (preferences.length > 0 && !discoverCache && !isFetching) {
      handleFetchBatch(preferences, []);
    }
  }, [preferences]);

  const handleFetchBatch = async (catsToFetch, existingSitesToAvoid = []) => {
    if (catsToFetch.length === 0) {
      updateDiscoverCache(null);
      return;
    }
    
    setIsFetching(true);
    // NEW: Pass both apiKeys and markKeyExhausted to the fetch function!
    const newCacheData = await fetchDiscoverSites(catsToFetch, existingSitesToAvoid, apiKeys, markKeyExhausted);
    
    if (newCacheData) {
      updateDiscoverCache(newCacheData);
    } else {
      showAlert("Fetch Failed", "Failed to fetch suggestions from AI. Try adding a custom API key in Settings.", "error");
    }
    setIsFetching(false);
  };

  const handleRefresh = () => {
    const existingTitles = discoverCache 
      ? Object.values(discoverCache).flat().map(site => site.title) 
      : [];
    setActiveTab('All'); 
    handleFetchBatch(preferences, existingTitles);
  };

  const handlePreview = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: '#0f172a',
        controlsColor: '#d946ef',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
    } catch (e) {
      showAlert("Cannot Open", "We couldn't open this link in the browser.", "error");
    }
  };

  const openEditModal = () => {
    setTempPrefs([...preferences]);
    setIsEditModalVisible(true);
  };

  const toggleTempPref = (cat) => {
    if (tempPrefs.includes(cat)) {
      setTempPrefs(tempPrefs.filter(p => p !== cat));
    } else {
      if (tempPrefs.length < 3) {
        setTempPrefs([...tempPrefs, cat]);
      } else {
        showAlert("Limit Reached", "Please select a maximum of 3 categories for the best AI results.", "error");
      }
    }
  };

  const saveEditedPrefs = async () => {
    setIsEditModalVisible(false);
    savePreferences(tempPrefs);
    
    if (tempPrefs.join(',') !== preferences.join(',')) {
       setActiveTab('All');
       updateDiscoverCache(null); 
       handleFetchBatch(tempPrefs, []);
    }
  };

  const getDisplayData = () => {
    if (!discoverCache) return [];
    if (activeTab === 'All') return Object.values(discoverCache).flat();
    return discoverCache[activeTab] || [];
  };

  const displayData = getDisplayData();

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient colors={['rgba(217, 70, 239, 0.15)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 10 }} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Header />
        
        <View className="flex-row justify-between items-end px-4 mb-6">
          <View className="flex-1">
            <Text className="text-white text-3xl font-bold">Discover</Text>
            <Text className="text-slate-400 mt-1">AI curated tools for you.</Text>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity onPress={handleRefresh} disabled={isFetching || preferences.length === 0} className={`p-3 rounded-full border mr-3 ${isFetching ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-800 border-slate-700'}`}>
              <Ionicons name="refresh" size={22} color={isFetching ? '#475569' : '#38bdf8'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openEditModal} className="bg-slate-800 p-3 rounded-full border border-slate-700">
              <Ionicons name="options" size={22} color="#d946ef" />
            </TouchableOpacity>
          </View>
        </View>

        {preferences.length > 0 ? (
          <View className="mb-6 pl-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`flex-row items-center px-5 py-2.5 rounded-2xl border mr-3 ${isActive ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-700 bg-slate-800/40'}`}>
                    {isActive && <View className="w-1.5 h-3.5 bg-fuchsia-500 rounded-full mr-2" />}
                    <Text className={`font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
              <View className="w-4" /> 
            </ScrollView>
          </View>
        ) : (
          <View className="px-4 mb-6">
             <TouchableOpacity onPress={openEditModal} className="bg-fuchsia-500/20 border border-fuchsia-500 p-4 rounded-xl items-center">
                <Text className="text-fuchsia-500 font-bold text-center">Tap the options icon above to select your interests!</Text>
             </TouchableOpacity>
          </View>
        )}

        <View className="px-4">
          {isFetching ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#d946ef" />
              <Text className="text-slate-400 mt-4 font-medium">Curating 60+ personalized sites...</Text>
            </View>
          ) : (
            displayData.map((item, index) => (
              <SuggestionCard 
                key={`${item.id}-${index}`} 
                {...item} 
                onPreview={() => handlePreview(item.url)} 
                onAdd={() => {
                  const domain = item.url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
                  addSite(item.title, item.url, `https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
                  showAlert("Added to Vault", `${item.title} has been successfully saved!`, "success");
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setIsEditModalVisible(false)} className="flex-1 bg-black/80 justify-end">
          
          <TouchableOpacity activeOpacity={1} className="bg-[#0f172a] rounded-t-3xl p-6 border-t border-slate-700 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">Your Interests</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-start">
                {AVAILABLE_CATEGORIES.map(cat => {
                  const isSelected = tempPrefs.includes(cat);
                  return (
                    <TouchableOpacity key={cat} onPress={() => toggleTempPref(cat)} className={`px-4 py-3 rounded-xl m-1 border ${isSelected ? 'bg-fuchsia-500 border-fuchsia-500' : 'bg-slate-800/50 border-slate-700'}`}>
                      <Text className={isSelected ? 'text-white font-bold' : 'text-slate-400'}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity onPress={saveEditedPrefs} className="bg-fuchsia-500 rounded-xl py-4 items-center mt-4 shadow-lg shadow-fuchsia-500/40">
              <Text className="text-white font-bold text-lg">Save Preferences</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          
        </TouchableOpacity>
      </Modal>

      <ModernAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />

    </View>
  );
}

