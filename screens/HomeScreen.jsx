import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, FlatList, Text, Linking, Alert } from 'react-native';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import VaultCard from '../components/VaultCard';
import SuggestionCard from '../components/SuggestionCard';
import FloatingButton from '../components/FloatingButton';
import SiteActionModal from '../components/SiteActionModal';
import { fetchAISuggestions } from '../utils/aiSuggestions';
import { VaultContext } from '../context/VaultContext';

export default function HomeScreen({ navigation }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search state
  const { vaultSites, pinnedSites, togglePin, deleteSite } = useContext(VaultContext);

  useEffect(() => {
    const loadSuggestions = async () => {
      const data = await fetchAISuggestions();
      setSuggestions(data);
    };
    loadSuggestions();
  }, []);

  // NEW: Filter sites based on search query
  const filteredPinned = pinnedSites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    site.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVault = vaultSites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    site.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // NEW: Open Website
  const openSite = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", "Could not open this website.");
    }
  };

  const handleLongPress = (site) => setSelectedSite(site);
  
  const handleEdit = (site) => navigation.navigate('AddSite', { siteToEdit: site });

  // NEW: Handle AI Suggestion Click
  const handleSuggestionPress = (suggestion) => {
    navigation.navigate('AddSite', { prefill: { name: suggestion.title, url: suggestion.url } });
  };

  return (
    <View className="flex-1 bg-darkBg">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Header />
        
        {/* NEW: Passed Search Props */}
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Pinned Section */}
        {filteredPinned.length > 0 && (
          <>
            <SectionHeader  className="bg-pink-500 text-pink-500"
              title="Pinned" 
              actionText="VIEW ALL" 
              onActionPress={() => navigation.navigate('Pinned')} 
            />
            <View className="flex-row flex-wrap px-3 mb-4 justify-start">
              {filteredPinned.slice(0, 6).map(item => (
                <VaultCard 
                  key={item.id} 
                  {...item} 
                  onPress={() => openSite(item.url)} 
                  onLongPress={() => handleLongPress(item)} 
                />
              ))}
            </View>
          </>
        )}

        {/* Your Vault Section */}
        <SectionHeader title={searchQuery ? "Search Results" : "Your Vault"} />
        <View className="flex-row flex-wrap px-3 mb-8 justify-start">
          {filteredVault.length === 0 ? (
            <Text className="text-slate-500 ml-4 mt-2">
              {searchQuery ? "No sites match your search." : "Your vault is empty. Add a site!"}
            </Text>
          ) : (
            filteredVault.map(item => (
              <VaultCard 
                key={item.id} 
                {...item} 
                onPress={() => openSite(item.url)} 
                onLongPress={() => handleLongPress(item)} 
              />
            ))
          )}
        </View>

        {/* Discover Suggestions */}
        {!searchQuery && (
          <>
            <SectionHeader title="✨ DISCOVER SUGGESTIONS" />
            <View className="px-4 mb-4">
              <FlatList
                horizontal
                data={suggestions}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <SuggestionCard {...item} onPress={() => handleSuggestionPress(item)} />
                )}
              />
            </View>
          </>
        )}
      </ScrollView>

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