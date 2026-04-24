import React, { useState, useContext } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser'; // NEW: In-app browser
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import VaultCard from '../components/VaultCard';
import FloatingButton from '../components/FloatingButton';
import SiteActionModal from '../components/SiteActionModal';
import { VaultContext } from '../context/VaultContext';

export default function HomeScreen({ navigation }) {
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { vaultSites = [], togglePin, deleteSite } = useContext(VaultContext);

  const filteredPinned = vaultSites.filter(site => 
    site.isPinned && 
    site.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVault = vaultSites.filter(site => 
    !site.isPinned && 
    site.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // UPDATED: Now uses the in-app browser instead of kicking users out to Chrome/Safari
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

  const handleEdit = (site) => {
    navigation.navigate('AddSite', { siteToEdit: site });
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Top Glow */}
      <LinearGradient
        colors={['rgba(217, 70, 239, 0.1)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 10 }}
        pointerEvents="none"
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Header />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Pinned Section */}
        {filteredPinned.length > 0 && (
          <>
            <SectionHeader 
              title="Pinned" 
              actionText="VIEW ALL" 
              onActionPress={() => navigation.navigate('AllSites')} 
            />
            
            <View className="flex-row flex-wrap px-3 mb-4 justify-start">
              {filteredPinned.slice(0, 6).map(item => (
                <VaultCard 
                  key={item.id} 
                  {...item} 
                  onPress={() => openSite(item.url)} 
                  onLongPress={() => setSelectedSite(item)} 
                />
              ))}
            </View>
          </>
        )}

        {/* Your Vault Section */}
        <SectionHeader title={searchQuery ? "Search Results" : "Your Vault"} />
        <View className="flex-row flex-wrap px-3 mb-8 justify-start">
          {filteredVault.length === 0 ? (
            <View className="w-full py-10 items-center">
               <Text className="text-slate-500 text-center px-10">
                {searchQuery 
                  ? "No unpinned sites match your search." 
                  : "All your sites are pinned or the vault is empty."}
              </Text>
            </View>
          ) : (
            filteredVault.map(item => (
              <VaultCard 
                key={item.id} 
                {...item} 
                onPress={() => openSite(item.url)} 
                onLongPress={() => setSelectedSite(item)} 
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Glow */}
      <LinearGradient
        colors={['transparent', 'rgba(168, 85, 247, 0.1)']}
        style={{ position: 'absolute', bottom: -10, left: 0, right: 0, height: 140, zIndex: 10 }}
        pointerEvents="none"
      />

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