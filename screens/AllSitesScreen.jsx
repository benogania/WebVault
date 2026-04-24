import React, { useContext, useState } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser'; // NEW: In-app browser
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import VaultCard from '../components/VaultCard';
import SiteActionModal from '../components/SiteActionModal';
import { VaultContext } from '../context/VaultContext';

export default function AllSitesScreen({ navigation }) {
  const { vaultSites, togglePin, deleteSite } = useContext(VaultContext);
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleEdit = (site) => navigation.navigate('AddSite', { siteToEdit: site });

  const filteredPinned = vaultSites.filter(site =>
    site.isPinned &&
    (site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     site.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUnpinned = vaultSites.filter(site =>
    !site.isPinned &&
    (site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     site.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['rgba(217, 70, 239, 0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 10 }}
        pointerEvents="none"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Header />
        
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <View className="px-4 mb-2">
          <Text className="text-white text-2xl font-bold">All Sites</Text>
          <Text className="text-slate-400 mt-2">Everything you've saved in one place.</Text>
        </View>

        {filteredPinned.length === 0 && filteredUnpinned.length === 0 ? (
           <View className="w-full py-10 items-center">
             <Text className="text-slate-500 text-center px-10">
               {searchQuery ? "No sites match your search." : "Your vault is empty."}
             </Text>
           </View>
        ) : (
          <>
            {filteredPinned.length > 0 && (
              <>
                <SectionHeader title="Pinned Sites" />
                <View className="flex-row flex-wrap px-3 mb-4 justify-start">
                  {filteredPinned.map(item => (
                    <VaultCard key={item.id} {...item} onPress={() => openSite(item.url)} onLongPress={() => setSelectedSite(item)} />
                  ))}
                </View>
              </>
            )}

            {filteredUnpinned.length > 0 && (
              <>
                {filteredPinned.length > 0 && <SectionHeader title="Other Sites" />}
                <View className="flex-row flex-wrap px-3 mb-8 justify-start mt-2">
                  {filteredUnpinned.map(item => (
                    <VaultCard key={item.id} {...item} onPress={() => openSite(item.url)} onLongPress={() => setSelectedSite(item)} />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <LinearGradient
        colors={['transparent', 'rgba(168, 85, 247, 0.15)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, zIndex: 10 }}
        pointerEvents="none"
      />

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