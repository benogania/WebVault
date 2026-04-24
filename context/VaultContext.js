import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const VaultContext = createContext();

// Default starter data
const DEFAULT_SITES = [
  // 3 Pinned Sites
  { id: 'def-1', name: 'GitHub', url: 'https://github.com', icon: 'logo-github', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=github.com', color: '#a855f7', isPinned: true },
  { id: 'def-2', name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'code-slash', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=stackoverflow.com', color: '#a855f7', isPinned: true },
  { id: 'def-3', name: 'YouTube', url: 'https://youtube.com', icon: 'logo-youtube', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=youtube.com', color: '#a855f7', isPinned: true },
  
  // 6 Vault Sites
  { id: 'def-4', name: 'React Native', url: 'https://reactnative.dev', icon: 'planet', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=reactnative.dev', color: '#a855f7', isPinned: false },
  { id: 'def-5', name: 'Tailwind CSS', url: 'https://tailwindcss.com', icon: 'color-palette', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=tailwindcss.com', color: '#a855f7', isPinned: false },
  { id: 'def-6', name: 'MongoDB', url: 'https://mongodb.com', icon: 'leaf', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=mongodb.com', color: '#a855f7', isPinned: false },
  { id: 'def-7', name: 'Dribbble', url: 'https://dribbble.com', icon: 'basketball', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=dribbble.com', color: '#a855f7', isPinned: false },
  { id: 'def-8', name: 'Dev.to', url: 'https://dev.to', icon: 'terminal', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=dev.to', color: '#a855f7', isPinned: false },
  { id: 'def-9', name: 'Figma', url: 'https://figma.com', icon: 'layers', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=figma.com', color: '#a855f7', isPinned: false },
];

export const VaultProvider = ({ children }) => {
  const [vaultSites, setVaultSites] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [discoverCache, setDiscoverCache] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load Vault Sites
      const storedSites = await AsyncStorage.getItem('@vault_sites');
      if (storedSites) {
        setVaultSites(JSON.parse(storedSites));
      } else {
        // First time opening the app!
        setVaultSites(DEFAULT_SITES);
        // Save defaults immediately so they persist until deleted
        await AsyncStorage.setItem('@vault_sites', JSON.stringify(DEFAULT_SITES));
      }

      // Load AI Preferences
      const storedPrefs = await AsyncStorage.getItem('@user_prefs');
      if (storedPrefs) setPreferences(JSON.parse(storedPrefs));

      // Load cached AI discoveries
      const storedCache = await AsyncStorage.getItem('@discover_cache');
      if (storedCache) setDiscoverCache(JSON.parse(storedCache));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const savePreferences = async (newPrefs) => {
    setPreferences(newPrefs);
    await AsyncStorage.setItem('@user_prefs', JSON.stringify(newPrefs));
  };

  const updateDiscoverCache = async (newCache) => {
    setDiscoverCache(newCache);
    if (newCache) {
      await AsyncStorage.setItem('@discover_cache', JSON.stringify(newCache));
    } else {
      await AsyncStorage.removeItem('@discover_cache');
    }
  };

  const addSite = async (name, url, iconUrl = null) => {
    const newSite = {
      id: Date.now().toString(),
      name,
      url,
      icon: 'planet', 
      iconUrl: iconUrl, 
      color: '#a855f7',
      isPinned: false
    };
    const updatedSites = [...vaultSites, newSite];
    setVaultSites(updatedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(updatedSites));
  };

  const togglePin = async (id) => {
    const updatedSites = vaultSites.map(site => 
      site.id === id ? { ...site, isPinned: !site.isPinned } : site
    );
    setVaultSites(updatedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(updatedSites));
  };

  const deleteSite = async (id) => {
    const updatedSites = vaultSites.filter(site => site.id !== id);
    setVaultSites(updatedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(updatedSites));
  };

  const editSite = async (id, updatedData) => {
    const updatedSites = vaultSites.map(site => 
      site.id === id ? { ...site, ...updatedData } : site
    );
    setVaultSites(updatedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(updatedSites));
  };

  // NEW: Import multiple sites from JSON
  const importSites = async (importedSites) => {
    // Combine existing sites and imported sites
    const combined = [...vaultSites, ...importedSites];
    
    // Remove exact duplicates by checking the URL
    const uniqueSites = Array.from(new Map(combined.map(item => [item.url, item])).values());
    
    // Ensure every imported site has a safe, unique ID
    const finalizedSites = uniqueSites.map((site, index) => ({
      ...site,
      id: site.id || (Date.now() + index).toString()
    }));

    setVaultSites(finalizedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(finalizedSites));
  };

  return (
    <VaultContext.Provider value={{ 
      vaultSites, 
      addSite, 
      togglePin, 
      deleteSite, 
      editSite,
      importSites, // <-- Exported here
      preferences, 
      savePreferences,
      discoverCache,
      updateDiscoverCache
    }}>
      {children}
    </VaultContext.Provider>
  );
};