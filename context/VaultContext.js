import React, { createContext, useState, useEffect } from "react";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initOfflineStorage,
  createResumable,
  deleteOfflinePage,
  downloadFullPage,
} from "../utils/offlineManager";

export const VaultContext = createContext();

const DEFAULT_SITES = [
  {
    id: "def-1",
    name: "GitHub",
    url: "https://github.com",
    icon: "logo-github",
    color: "#a855f7",
    isPinned: true,
  },
  {
    id: "def-2",
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    icon: "code-slash",
    color: "#a855f7",
    isPinned: true,
  },
];

export const VaultProvider = ({ children }) => {
  
  const [vaultSites, setVaultSites] = useState([]);
  const [folders, setFolders] = useState([]);
  const [offlineSites, setOfflineSites] = useState([]);
  const [activeDownloads, setActiveDownloads] = useState({}); // Stores resumable objects

  const [preferences, setPreferences] = useState([]);
  const [discoverCache, setDiscoverCache] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [exhaustedKeys, setExhaustedKeys] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const results = await Promise.all([
        AsyncStorage.getItem("@vault_sites"),
        AsyncStorage.getItem("@vault_folders"),
        AsyncStorage.getItem("@offline_sites"),
        AsyncStorage.getItem("@user_prefs"),
        AsyncStorage.getItem("@api_keys"),
        AsyncStorage.getItem("@exhausted_keys"),
        AsyncStorage.getItem("@discover_cache"),
      ]);

      const [sites, fldrs, off, prefs, keys, exh, cache] = results;

      if (sites) setVaultSites(JSON.parse(sites));
      else {
        setVaultSites(DEFAULT_SITES);
        await AsyncStorage.setItem(
          "@vault_sites",
          JSON.stringify(DEFAULT_SITES),
        );
      }

      if (fldrs) setFolders(JSON.parse(fldrs));
      if (off) setOfflineSites(JSON.parse(off));
      if (prefs) setPreferences(JSON.parse(prefs));
      if (keys) setApiKeys(JSON.parse(keys));
      if (exh) setExhaustedKeys(JSON.parse(exh));
      if (cache) setDiscoverCache(JSON.parse(cache));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  // --- OFFLINE DOWNLOAD ENGINE (Resumable) ---

  const updateOfflineStatus = (id, updates) => {
    setOfflineSites((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      AsyncStorage.setItem("@offline_sites", JSON.stringify(updated));
      return updated;
    });
  };

  const downloadManualUrl = async (name, url) => {
    const id = "off_" + Date.now();

    // 1. Create the object
    const newEntry = {
      id,
      name,
      url,
      progress: 0,
      status: "downloading",
      date: new Date().toLocaleDateString(),
    };

    // 2. Update state IMMEDIATELY (using functional update for speed)
    setOfflineSites((prev) => [newEntry, ...prev]);

    // 3. Kick off the background tasks
    try {
      await initOfflineStorage();
      startDownload(id, url);
    } catch (e) {
      console.error("Storage Init Failed", e);
      updateOfflineStatus(id, { status: "failed" });
    }
  };

  const startDownload = async (id, url) => {
    try {
      // A. Initialize the folder first
      await initOfflineStorage();

      // B. Get the bundled HTML (with CSS)
      const bundledHtml = await downloadFullPage(url);

      // C. Save the file
      const fileUri =
        FileSystem.documentDirectory + "offline_vault/" + `${id}.html`;
      await FileSystem.writeAsStringAsync(fileUri, bundledHtml);

     
      updateOfflineStatus(id, {
        status: "completed",
        progress: 1,
        localUri: fileUri,
      });
    } catch (e) {
      updateOfflineStatus(id, { status: "failed" });
      console.error("VaultContext Download Error:", e);
    }
  };

  const pauseDownload = async (id) => {
    const download = activeDownloads[id];
    if (download) {
      try {
        await download.pauseAsync();
        updateOfflineStatus(id, { status: "paused" });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const resumeDownload = async (id) => {
    const download = activeDownloads[id];
    if (download) {
      updateOfflineStatus(id, { status: "downloading" });
      try {
        const result = await download.resumeAsync();
        if (result) {
          updateOfflineStatus(id, {
            status: "completed",
            progress: 1,
            localUri: result.uri,
          });
        }
      } catch (e) {
        updateOfflineStatus(id, { status: "failed" });
      }
    }
  };

  const deleteOfflineSite = async (id) => {
    await deleteOfflinePage(id);
    const updated = offlineSites.filter((s) => s.id !== id);
    setOfflineSites(updated);
    await AsyncStorage.setItem("@offline_sites", JSON.stringify(updated));
    // Cleanup active download if it exists
    if (activeDownloads[id]) {
      const newActive = { ...activeDownloads };
      delete newActive[id];
      setActiveDownloads(newActive);
    }
  };

  const editOfflineSite = async (id, newName) => {
    setOfflineSites((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, name: newName } : s));
      AsyncStorage.setItem("@offline_sites", JSON.stringify(updated));
      return updated;
    });
  };
  
  // Logic for the long-press download in Main Vault
  const toggleOfflineDownload = async (site) => {
    if (site.isDownloaded) {
      await deleteOfflinePage(site.id);
      const updated = vaultSites.map((s) =>
        s.id === site.id ? { ...s, isDownloaded: false, localUri: null } : s,
      );
      setVaultSites(updated);
      await AsyncStorage.setItem("@vault_sites", JSON.stringify(updated));
    } else {
      // For main vault, we use simple download for now or redirect to offline logic
      const id = site.id;
      const resumable = createResumable(site.url, id, (progress) => {
        // Silently update main vault site progress if needed
      });
      try {
        const result = await resumable.downloadAsync();
        const updated = vaultSites.map((s) =>
          s.id === id ? { ...s, isDownloaded: true, localUri: result.uri } : s,
        );
        setVaultSites(updated);
        await AsyncStorage.setItem("@vault_sites", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // --- SITE & FOLDER MANAGEMENT ---

  const addSite = async (name, url, iconUrl = null) => {
    const newSite = {
      id: Date.now().toString(),
      name,
      url,
      icon: "planet",
      iconUrl,
      color: "#a855f7",
      isPinned: false,
      folderId: null,
    };
    const updated = [...vaultSites, newSite];
    setVaultSites(updated);
    await AsyncStorage.setItem("@vault_sites", JSON.stringify(updated));
  };

  const togglePin = async (id) => {
    const updated = vaultSites.map((s) =>
      s.id === id
        ? {
            ...s,
            isPinned: !s.isPinned,
            folderId: !s.isPinned ? null : s.folderId,
          }
        : s,
    );
    setVaultSites(updated);
    await AsyncStorage.setItem("@vault_sites", JSON.stringify(updated));
  };

  const deleteSite = async (id) => {
    const updated = vaultSites.filter((s) => s.id !== id);
    setVaultSites(updated);
    await AsyncStorage.setItem("@vault_sites", JSON.stringify(updated));
  };


  const moveSiteToFolder = async (siteId, folderId) => {
    const updated = vaultSites.map((s) =>
      s.id === siteId
        ? { ...s, folderId, isPinned: folderId !== null ? false : s.isPinned }
        : s,
    );
    setVaultSites(updated);
    await AsyncStorage.setItem("@vault_sites", JSON.stringify(updated));
  };

  const createFolder = async (name) => {
    const newFolder = { id: "folder_" + Date.now(), name };
    const updated = [...folders, newFolder];
    setFolders(updated);
    await AsyncStorage.setItem("@vault_folders", JSON.stringify(updated));
    return newFolder.id;
  };

  const deleteFolder = async (folderId) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    const updatedSites = vaultSites.map((s) =>
      s.folderId === folderId ? { ...s, folderId: null } : s,
    );
    setVaultSites(updatedSites);
    await AsyncStorage.setItem("@vault_sites", JSON.stringify(updatedSites));
  };

  // --- API & PREFS ---
  const addApiKey = async (key) => {
    if (!key || apiKeys.includes(key)) return;
    const updated = [...apiKeys, key];
    setApiKeys(updated);
    await AsyncStorage.setItem("@api_keys", JSON.stringify(updated));
  };

  return (
    <VaultContext.Provider
      value={{
        vaultSites,
        addSite,
        togglePin,
        deleteSite,
        moveSiteToFolder,
        folders,
        createFolder,
        deleteFolder,
        offlineSites,
        downloadManualUrl,
        pauseDownload,
        resumeDownload,
        deleteOfflineSite,
        editOfflineSite,
        startDownload,
        toggleOfflineDownload,
        preferences,
        setPreferences,
        apiKeys,
        addApiKey,
        exhaustedKeys,
        markKeyExhausted: (key) => setExhaustedKeys([...exhaustedKeys, key]),
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};
