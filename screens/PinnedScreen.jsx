import React, { useContext, useState } from 'react';
import { View, ScrollView, Text, Linking, Alert } from 'react-native';
import Header from '../components/Header';
import VaultCard from '../components/VaultCard';
import SiteActionModal from '../components/SiteActionModal';
import { VaultContext } from '../context/VaultContext';

export default function PinnedScreen({ navigation }) {
  const { pinnedSites, togglePin, deleteSite } = useContext(VaultContext);
  const [selectedSite, setSelectedSite] = useState(null);

  const openSite = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", "Could not open this website.");
    }
  };

  const handleEdit = (site) => navigation.navigate('AddSite', { siteToEdit: site });

  return (
    <View className="flex-1 bg-darkBg">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Header />
        
        <View className="px-4 mb-6">
          <Text className="text-white text-2xl font-bold">All Pinned Sites</Text>
          <Text className="text-slate-400 mt-2">Your quick access dashboard.</Text>
        </View>

        <View className="flex-row flex-wrap px-3 justify-start">
          {pinnedSites.length === 0 ? (
            <Text className="text-slate-500 ml-4 mt-2">You haven't pinned any sites yet.</Text>
          ) : (
            pinnedSites.map(item => (
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