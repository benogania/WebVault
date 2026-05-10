import React, { useState, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  ToastAndroid,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SectionHeader from "../components/SectionHeader";
import VaultCard from "../components/VaultCard";
import FloatingButton from "../components/FloatingButton";
import SiteActionModal from "../components/SiteActionModal";
import { VaultContext } from "../context/VaultContext";

// Added onLongPress prop to the FolderCard
const FolderCard = ({ folder, sites, onPress, onLongPress }) => {
  const folderSites = sites.filter((s) => s.folderId === folder.id);
  const previewSites = folderSites.slice(0, 4);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      className="w-[31%] items-center mb-4"
    >
      <View className="w-full h-28 bg-slate-800 rounded-xl border border-slate-700/60 p-3 justify-between items-center shadow-lg">
        <View className="flex-1 w-full justify-center items-center pt-1">
          {previewSites.length > 0 ? (
            <View className="w-12 h-12 flex-row flex-wrap justify-between content-between">
              {previewSites.map((site) => (
                <View
                  key={site.id}
                  className="w-[47%] h-[47%] bg-slate-900 rounded-md overflow-hidden justify-center items-center border border-slate-700/50"
                >
                  {site.iconUrl ? (
                    <Image
                      source={{ uri: site.iconUrl }}
                      className="w-full h-full"
                    />
                  ) : (
                    <Ionicons name={site.icon} size={12} color={site.color} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Ionicons name="folder-open" size={28} color="#475569" />
          )}
        </View>

        <Text
          className="text-white text-xs font-bold text-center mt-2 w-full"
          numberOfLines={1}
        >
          {folder.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation }) {
  const [selectedSite, setSelectedSite] = useState(null);

  // NEW: State for the Folder Options modal
  const [selectedFolderActions, setSelectedFolderActions] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [openedFolder, setOpenedFolder] = useState(null);

  // Destructured the new extractFolder function
  const {
    vaultSites = [],
    folders = [],
    deleteFolder,
    extractFolder,
    togglePin,
    deleteSite,
  } = useContext(VaultContext);

  const mainSites = vaultSites.filter((site) => !site.folderId);

  const filteredPinned = mainSites.filter(
    (site) =>
      site.isPinned &&
      site.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredVault = mainSites.filter(
    (site) =>
      !site.isPinned &&
      site.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentFolderSites = openedFolder
    ? vaultSites.filter((s) => s.folderId === openedFolder.id)
    : [];

  // 1. Change openSite to accept the whole 'item' object instead of just the URL
  const openSite = async (item) => {
    // If the site is marked as downloaded and has a local file path
    if (item.isDownloaded && item.localUri) {
      // Make sure the string matches your exact Stack Navigator screen name!
      navigation.navigate("OfflineViewerScreen", { site: item });
    } else {
      // Standard online opening
      try {
        await WebBrowser.openBrowserAsync(item.url, {
          toolbarColor: "#0f172a",
          controlsColor: "#d946ef",
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        });
      } catch (e) {
        Alert.alert(
          "Cannot Open",
          "We couldn't open this link in the browser.",
        );
      }
    }
  };

  const handleEdit = (site) =>
    navigation.navigate("AddSite", { siteToEdit: site });

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={["rgba(217, 70, 239, 0.15)", "transparent"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 140,
          zIndex: 10,
        }}
        pointerEvents="none"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Header />
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {filteredPinned.length > 0 && (
          <>
            <SectionHeader
              title="Pinned"
              actionText="VIEW ALL"
              onActionPress={() => navigation.navigate("AllSites")}
            />
            <View
              className="flex-row flex-wrap px-4 mb-2 justify-start"
              style={{ columnGap: "3.5%" }}
            >
              {filteredPinned.map((item) => (
                <VaultCard
                  key={item.id}
                  {...item}
                  hidePinIcon={true}
                  onPress={() => openSite(item.url)}
                  onLongPress={() => setSelectedSite(item)}
                />
              ))}
            </View>
          </>
        )}

        <SectionHeader title={searchQuery ? "Search Results" : "Your Vault"} />

        <View
          className="flex-row flex-wrap px-4 mb-2 justify-start"
          style={{ columnGap: "3.5%" }}
        >
          {filteredFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              sites={vaultSites}
              onPress={() => setOpenedFolder(folder)}
              onLongPress={() => setSelectedFolderActions(folder)} // Opens Folder Options
            />
          ))}

          {filteredVault.map((item) => (
            <VaultCard
              key={item.id}
              {...item}
              onPress={() => openSite(item.url)}
              onLongPress={() => setSelectedSite(item)}
            />
          ))}

          {filteredVault.length === 0 && filteredFolders.length === 0 && (
            <View className="w-full py-10 items-center">
              <Text className="text-slate-500 text-center px-10">
                {searchQuery
                  ? "No sites or folders match your search."
                  : "Your vault is empty."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* --- FOLDER VIEW MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!openedFolder}
        onRequestClose={() => setOpenedFolder(null)}
      >
        <View className="flex-1 bg-slate-900 pt-12">
          <View className="flex-row justify-between items-center px-6 pb-4 border-b border-slate-800">
            <View>
              <Text className="text-white text-2xl font-bold">
                {openedFolder?.name}
              </Text>
              <Text className="text-slate-500 text-sm">
                {currentFolderSites.length} items
              </Text>
            </View>
            {/* FIXED: Removed Trash Icon entirely from here! */}
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setOpenedFolder(null)}
                className="bg-slate-800 p-2 rounded-full border border-slate-700"
              >
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 12, paddingTop: 24 }}>
            <View
              className="flex-row flex-wrap px-4 justify-start"
              style={{ columnGap: "3.5%" }}
            >
              {currentFolderSites.length === 0 ? (
                <View className="w-full py-20 items-center">
                  <Ionicons
                    name="folder-open-outline"
                    size={64}
                    color="#334155"
                  />
                  <Text className="text-slate-500 mt-4">
                    This folder is empty.
                  </Text>
                </View>
              ) : (
                currentFolderSites.map((item) => (
                  <VaultCard
                    key={item.id}
                    {...item}
                    onPress={() => openSite(item.url)}
                    onLongPress={() => {
                      setOpenedFolder(null);
                      setTimeout(() => setSelectedSite(item), 300);
                    }}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* --- NEW: FOLDER ACTION MODAL (Long Press) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedFolderActions}
        onRequestClose={() => setSelectedFolderActions(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSelectedFolderActions(null)}
          className="flex-1 bg-black/80 justify-end"
        >
          <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700 shadow-2xl pb-10">
            <View className="flex-row items-center mb-6 pb-6 border-b border-slate-700/50">
              <View className="w-10 h-10 rounded-xl bg-slate-800 justify-center items-center mr-4 border border-slate-700">
                <Ionicons name="folder" size={20} color="#a855f7" />
              </View>
              <Text className="text-white text-xl font-bold">
                {selectedFolderActions?.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                extractFolder(selectedFolderActions.id);
                setSelectedFolderActions(null);
                if (Platform.OS === "android")
                  ToastAndroid.show(
                    "Sites extracted to dashboard",
                    ToastAndroid.SHORT,
                  );
              }}
              className="flex-row items-center mb-6 pl-2"
            >
              <Ionicons name="push-outline" size={24} color="#38bdf8" />
              <View className="ml-4">
                <Text className="text-white text-lg font-bold">
                  Extract Sites
                </Text>
                <Text className="text-slate-400 text-xs">
                  Move all contents to the main vault
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Delete Folder",
                  `Are you sure you want to delete ${selectedFolderActions?.name}?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        deleteFolder(selectedFolderActions.id);
                        setSelectedFolderActions(null);
                        if (Platform.OS === "android")
                          ToastAndroid.show(
                            "Folder deleted",
                            ToastAndroid.SHORT,
                          );
                      },
                    },
                  ],
                );
              }}
              className="flex-row items-center mb-2 pl-2"
            >
              <Ionicons name="trash" size={24} color="#ef4444" />
              <View className="ml-4">
                <Text className="text-red-500 text-lg font-bold">
                  Delete Folder
                </Text>
                <Text className="text-slate-400 text-xs">
                  Sites inside will also be extracted
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <LinearGradient
        colors={["transparent", "rgba(168, 85, 247, 0.15)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 140,
          zIndex: 10,
        }}
        pointerEvents="none"
      />

      <FloatingButton onPress={() => navigation.navigate("AddSite")} />

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
