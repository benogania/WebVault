import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const VaultContext = createContext();

const DEFAULT_SITES = [
  { id: 'def-1', name: 'GitHub', url: 'https://github.com', icon: 'logo-github', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=github.com', color: '#a855f7', isPinned: true },
  { id: 'def-2', name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'code-slash', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=stackoverflow.com', color: '#a855f7', isPinned: true },
  { id: 'def-3', name: 'YouTube', url: 'https://youtube.com', icon: 'logo-youtube', iconUrl: 'https://www.google.com/s2/favicons?sz=128&domain=youtube.com', color: '#a855f7', isPinned: true },
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
  const [apiKeys, setApiKeys] = useState([]);
  
  // NEW: State to track which keys hit the rate limit
  const [exhaustedKeys, setExhaustedKeys] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedSites = await AsyncStorage.getItem('@vault_sites');
      if (storedSites) {
        setVaultSites(JSON.parse(storedSites));
      } else {
        setVaultSites(DEFAULT_SITES);
        await AsyncStorage.setItem('@vault_sites', JSON.stringify(DEFAULT_SITES));
      }

      const storedPrefs = await AsyncStorage.getItem('@user_prefs');
      if (storedPrefs) setPreferences(JSON.parse(storedPrefs));

      const storedCache = await AsyncStorage.getItem('@discover_cache');
      if (storedCache) setDiscoverCache(JSON.parse(storedCache));

      const storedKeys = await AsyncStorage.getItem('@api_keys');
      if (storedKeys) setApiKeys(JSON.parse(storedKeys));

      // Load exhausted keys
      const storedExhausted = await AsyncStorage.getItem('@exhausted_keys');
      if (storedExhausted) setExhaustedKeys(JSON.parse(storedExhausted));

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

  // --- API KEY MANAGEMENT ---
  const addApiKey = async (key) => {
    if (!key || apiKeys.includes(key)) return;
    const newKeys = [...apiKeys, key];
    setApiKeys(newKeys);
    await AsyncStorage.setItem('@api_keys', JSON.stringify(newKeys));
    
    // If they re-add a key, clear it from exhausted list just in case
    if (exhaustedKeys.includes(key)) {
      const newExhausted = exhaustedKeys.filter(k => k !== key);
      setExhaustedKeys(newExhausted);
      await AsyncStorage.setItem('@exhausted_keys', JSON.stringify(newExhausted));
    }
  };

  const removeApiKey = async (keyToRemove) => {
    const newKeys = apiKeys.filter(key => key !== keyToRemove);
    setApiKeys(newKeys);
    await AsyncStorage.setItem('@api_keys', JSON.stringify(newKeys));

    // Cleanup exhausted list too
    const newExhausted = exhaustedKeys.filter(key => key !== keyToRemove);
    setExhaustedKeys(newExhausted);
    await AsyncStorage.setItem('@exhausted_keys', JSON.stringify(newExhausted));
  };

  // NEW: Function to mark a key as exhausted
  const markKeyExhausted = async (key) => {
    if (!exhaustedKeys.includes(key)) {
      const newExhausted = [...exhaustedKeys, key];
      setExhaustedKeys(newExhausted);
      await AsyncStorage.setItem('@exhausted_keys', JSON.stringify(newExhausted));
    }
  };

  const addSite = async (name, url, iconUrl = null) => {
    const newSite = { id: Date.now().toString(), name, url, icon: 'planet', iconUrl, color: '#a855f7', isPinned: false };
    const updatedSites = [...vaultSites, newSite];
    setVaultSites(updatedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(updatedSites));
  };

  const togglePin = async (id) => {
    const updatedSites = vaultSites.map(site => site.id === id ? { ...site, isPinned: !site.isPinned } : site);
    setVaultSites(updatedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(updatedSites));
  };

  const deleteSite = async (id) => {
    const updatedSites = vaultSites.filter(site => site.id !== id);
    setVaultSites(updatedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(updatedSites));
  };

  const editSite = async (id, updatedData) => {
    const updatedSites = vaultSites.map(site => site.id === id ? { ...site, ...updatedData } : site);
    setVaultSites(updatedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(updatedSites));
  };

  const importSites = async (importedSites) => {
    const combined = [...vaultSites, ...importedSites];
    const uniqueSites = Array.from(new Map(combined.map(item => [item.url, item])).values());
    const finalizedSites = uniqueSites.map((site, index) => ({ ...site, id: site.id || (Date.now() + index).toString() }));
    setVaultSites(finalizedSites);
    await AsyncStorage.setItem('@vault_sites', JSON.stringify(finalizedSites));
  };

  return (
    <VaultContext.Provider value={{ 
      vaultSites, addSite, togglePin, deleteSite, editSite, importSites,
      preferences, savePreferences, discoverCache, updateDiscoverCache,
      apiKeys, addApiKey, removeApiKey, 
      exhaustedKeys, markKeyExhausted // <-- Exported to use in Discover & Settings
    }}>
      {children}
    </VaultContext.Provider>
  );
};