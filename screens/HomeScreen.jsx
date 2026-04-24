import React, { useState, useContext } from 'react';
import { View, ScrollView, Text, Alert, TouchableOpacity, Image, Modal, Platform, ToastAndroid } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import VaultCard from '../components/VaultCard';
import FloatingButton from '../components/FloatingButton';
import SiteActionModal from '../components/SiteActionModal';
import { VaultContext } from '../context/VaultContext';

// --- UPDATED: Folder sizes and border radius matched to Vault Cards ---
const FolderCard = ({ folder, sites, onPress }) => {
  const folderSites = sites.filter(s => s.folderId === folder.id);
  const previewSites = folderSites.slice(0, 4); // Get first 4 to build 2x2 grid

  return (
    <TouchableOpacity onPress={onPress} className="w-[30%] items-center mb-6">
      {/* CHANGED: w-[86px] h-[86px] rounded-[28px] p-3
        This creates the perfect modern "Squircle" shape identical to standard vault cards 
      */}
      <View className="w-[86px] h-[86px] rounded-[28px] bg-slate-800 border border-slate-700 p-3 justify-center items-center shadow-lg mb-2">
        {previewSites.length > 0 ? (
          <View className="flex-row flex-wrap justify-between content-between w-full h-full">
            {previewSites.map((site) => (
              <View key={site.id} className="w-[47%] h-[47%]">
                {site.iconUrl ? (
                  <Image source={{ uri: site.iconUrl }} className="w-full h-full rounded-md" />
                ) : (
                  <View className="w-full h-full bg-slate-700 rounded-md items-center justify-center">
                    <Ionicons name={site.icon} size={12} color={site.color} />
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Ionicons name="folder-open" size={32} color="#475569" />
        )}
      </View>
      <Text className="text-slate-300 text-xs font-semibold text-center" numberOfLines={1}>{folder.name}</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation }) {
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [openedFolder, setOpenedFolder] = useState(null);
  
  const { vaultSites = [], folders = [], deleteFolder, togglePin, deleteSite } = useContext(VaultContext);

  const mainSites = vaultSites.filter(site => !site.folderId);

  const filteredPinned = mainSites.filter(site => site.isPinned && site.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredVault = mainSites.filter(site => !site.isPinned && site.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFolders = folders.filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const currentFolderSites = openedFolder ? vaultSites.filter(s => s.folderId === openedFolder.id) : [];

  const openSite = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: '#0f172a',
        controlsColor: '#d946ef',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
    } catch (e) {
      Alert.alert("Cannot Open", "We couldn't open this link in the browser.");
    }
  };

  const handleEdit = (site) => navigation.navigate('AddSite', { siteToEdit: site });

  const confirmDeleteFolder = () => {
    Alert.alert("Delete Folder", "Are you sure? Sites inside will be moved back to the main dashboard.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          deleteFolder(openedFolder.id);
          setOpenedFolder(null);
          if (Platform.OS === 'android') ToastAndroid.show('Folder deleted', ToastAndroid.SHORT);
        }
      }
    ]);
  };

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient colors={['rgba(217, 70, 239, 0.15)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 10 }} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Header />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* --- Pinned Section --- */}
        {filteredPinned.length > 0 && (
          <>
            <SectionHeader title="Pinned" actionText="VIEW ALL" onActionPress={() => navigation.navigate('AllSites')} />
            <View className="flex-row flex-wrap px-3 mb-4 justify-start">
              {filteredPinned.slice(0, 6).map(item => (
                <VaultCard key={item.id} {...item} onPress={() => openSite(item.url)} onLongPress={() => setSelectedSite(item)} />
              ))}
            </View>
          </>
        )}

        {/* --- FOLDERS & VAULT SECTION --- */}
        <SectionHeader title={searchQuery ? "Search Results" : "Your Vault"} />
        <View className="flex-row flex-wrap px-3 mb-8 justify-start">
          
          {/* Render Folders First */}
          {filteredFolders.map(folder => (
            <FolderCard key={folder.id} folder={folder} sites={vaultSites} onPress={() => setOpenedFolder(folder)} />
          ))}

          {/* Render Main Sites */}
          {filteredVault.map(item => (
             <VaultCard key={item.id} {...item} onPress={() => openSite(item.url)} onLongPress={() => setSelectedSite(item)} />
          ))}

          {filteredVault.length === 0 && filteredFolders.length === 0 && (
            <View className="w-full py-10 items-center">
               <Text className="text-slate-500 text-center px-10">
                {searchQuery ? "No sites or folders match your search." : "Your vault is empty."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* --- FOLDER VIEW MODAL --- */}
      <Modal animationType="slide" transparent={true} visible={!!openedFolder} onRequestClose={() => setOpenedFolder(null)}>
         <View className="flex-1 bg-slate-900 pt-12">
            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-slate-800">
              <View>
                <Text className="text-white text-2xl font-bold">{openedFolder?.name}</Text>
                <Text className="text-slate-500 text-sm">{currentFolderSites.length} items</Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity onPress={confirmDeleteFolder} className="bg-red-500/10 p-2 rounded-full mr-3 border border-red-500/30">
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOpenedFolder(null)} className="bg-slate-800 p-2 rounded-full border border-slate-700">
                  <Ionicons name="close" size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 12, paddingTop: 24 }}>
              <View className="flex-row flex-wrap justify-start">
                {currentFolderSites.length === 0 ? (
                  <View className="w-full py-20 items-center">
                    <Ionicons name="folder-open-outline" size={64} color="#334155" />
                    <Text className="text-slate-500 mt-4">This folder is empty.</Text>
                  </View>
                ) : (
                  currentFolderSites.map(item => (
                    <VaultCard 
                      key={item.id} {...item} 
                      onPress={() => openSite(item.url)} 
                      onLongPress={() => {
                        setOpenedFolder(null); // Close folder view to show action modal smoothly
                        setTimeout(() => setSelectedSite(item), 300);
                      }} 
                    />
                  ))
                )}
              </View>
            </ScrollView>
         </View>
      </Modal>

      <LinearGradient colors={['transparent', 'rgba(168, 85, 247, 0.15)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, zIndex: 10 }} pointerEvents="none" />

      <FloatingButton onPress={() => navigation.navigate('AddSite')} />

      <SiteActionModal 
        visible={!!selectedSite}
        site={selectedSite}
        onClose={() => setSelectedSite(null)}
        onTogglePin={togglePin}
        onDelete={deleteSite}
        onEdit={handleEdit}
      />
    </View>
  );
}