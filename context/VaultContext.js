import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const VaultContext = createContext();

export const VaultProvider = ({ children }) => {
  const [vaultSites, setVaultSites] = useState([]);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const storedSites = await AsyncStorage.getItem('@vault_sites');
      if (storedSites) setVaultSites(JSON.parse(storedSites));
    } catch (e) {
      console.error("Failed to load sites", e);
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

  const pinnedSites = vaultSites.filter(site => site.isPinned);

  return (
    // CRITICAL: Make sure addSite is in this list below!
    <VaultContext.Provider value={{ vaultSites, pinnedSites, addSite, togglePin, deleteSite, editSite }}>
      {children}
    </VaultContext.Provider>
  );
};