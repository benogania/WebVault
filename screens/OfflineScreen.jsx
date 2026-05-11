import React, { useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VaultContext } from "../context/VaultContext";
import { LinearGradient } from "expo-linear-gradient";

export default function OfflineScreen({ navigation }) {
  const {
    offlineSites = [],
    downloadManualUrl,
    deleteOfflineSite,
    editOfflineSite,
    pauseDownload,
    resumeDownload,
    startDownload,
  } = useContext(VaultContext);

  // Modals State
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Form State
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  // Action State
  const [selectedSite, setSelectedSite] = useState(null);
  const [editNameInput, setEditNameInput] = useState("");

  const handleDownload = () => {
    if (!siteName || !siteUrl)
      return Alert.alert("Error", "Please fill in all fields");

    downloadManualUrl(siteName, siteUrl);
    setDownloadModalVisible(false);
    setSiteName("");
    setSiteUrl("");
  };

  const handleSaveEdit = () => {
    if (!editNameInput.trim()) return;
    if (editOfflineSite) {
      editOfflineSite(selectedSite.id, editNameInput);
    }
    setEditModalVisible(false);
    setSelectedSite(null);
  };

  const handleDelete = () => {
    deleteOfflineSite(selectedSite.id);
    setActionModalVisible(false);
    setSelectedSite(null);
  };

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={["rgba(56, 189, 248, 0.15)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
      />

      <View className="px-6 pt-14 pb-4">
        <Text className="text-white text-3xl font-bold">Offline Vault</Text>
        <Text className="text-slate-400 text-sm">
          Saved for offline viewing
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-2"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {offlineSites && offlineSites.length > 0 ? (
          offlineSites.map((site) => (
            <TouchableOpacity
              key={site.id}
              activeOpacity={0.7}
              onPress={() => {
                if (site.status === "completed") {
                  navigation.navigate("OfflineViewerScreen", { site });
                }
              }}
              onLongPress={() => {
                setSelectedSite(site);
                setActionModalVisible(true);
              }}
              className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-slate-700 rounded-xl items-center justify-center mr-3 overflow-hidden border border-slate-600">
                  <Image
                    source={{
                      uri: `https://www.google.com/s2/favicons?domain=${site.url}&sz=128`,
                    }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color="#334155"
                    style={{ position: "absolute", zIndex: -1 }}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className="text-white font-bold text-lg"
                    numberOfLines={1}
                  >
                    {site.name}
                  </Text>
                  <Text className="text-slate-500 text-xs" numberOfLines={1}>
                    {site.url.replace(/^https?:\/\//, "")}{" "}
                 
                  </Text>
                </View>
              </View>

              {/* Progress Bar Logic for incomplete downloads */}
              {site.status !== "completed" && (
                <View className="mt-4">
                  <View className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-2">
                    <View
                      className={`h-full ${site.status === "failed" ? "bg-red-500" : "bg-sky-500"}`}
                      style={{ width: `${(site.progress || 0) * 100}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] text-slate-400 uppercase font-bold">
                      {site.status} • {Math.round((site.progress || 0) * 100)}%
                    </Text>
                    <View className="flex-row space-x-4">
                      {site.status === "downloading" && (
                        <TouchableOpacity
                          onPress={() => pauseDownload(site.id)}
                        >
                          <Text className="text-sky-400 text-[10px] font-bold">
                            PAUSE
                          </Text>
                        </TouchableOpacity>
                      )}
                      {site.status === "paused" && (
                        <TouchableOpacity
                          onPress={() => resumeDownload(site.id)}
                        >
                          <Text className="text-emerald-400 text-[10px] font-bold">
                            RESUME
                          </Text>
                        </TouchableOpacity>
                      )}
                      {site.status === "failed" && (
                        <TouchableOpacity
                          onPress={() => startDownload(site.id, site.url)}
                        >
                          <Text className="text-amber-400 text-[10px] font-bold">
                            RETRY
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="cloud-offline-outline" size={60} color="#334155" />
            <Text className="text-slate-500 mt-4 text-center">
              Your offline library is empty.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setDownloadModalVisible(true)}
        className="absolute bottom-8 right-6 w-14 h-14 bg-sky-500 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* --- DOWNLOAD MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={downloadModalVisible}
        onRequestClose={() => setDownloadModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
            <TouchableOpacity
              onPress={() => setDownloadModalVisible(false)}
              className="absolute top-4 right-4 z-10 p-2"
            >
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>

            <Text className="text-white text-xl font-bold mb-6 mt-2">
              Download New Page
            </Text>

            <Text className="text-slate-400 mb-2 ml-1">Page Name</Text>
            <TextInput
              value={siteName}
              onChangeText={setSiteName}
              placeholder="e.g. React Documentation"
              placeholderTextColor="#475569"
              className="bg-slate-800 text-white p-4 rounded-xl mb-4 border border-slate-700"
            />

            <Text className="text-slate-400 mb-2 ml-1">Website URL</Text>
            <TextInput
              value={siteUrl}
              onChangeText={setSiteUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://..."
              placeholderTextColor="#475569"
              className="bg-slate-800 text-white p-4 rounded-xl mb-6 border border-slate-700"
            />

            <TouchableOpacity
              onPress={handleDownload}
              className="w-full bg-sky-500 p-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- ACTION MODAL (Long Press) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
            <TouchableOpacity
              onPress={() => setActionModalVisible(false)}
              className="absolute top-4 right-4 z-10 p-2"
            >
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>

            <Text
              className="text-white text-lg font-bold mb-6 mt-2 pr-8"
              numberOfLines={1}
            >
              {selectedSite?.name}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setEditNameInput(selectedSite?.name || "");
                setActionModalVisible(false);
                setEditModalVisible(true);
              }}
              className="bg-slate-800 p-4 rounded-xl items-center flex-row justify-center mb-3 border border-slate-700"
            >
              <Ionicons
                name="pencil"
                size={20}
                color="#38bdf8"
                className="mr-2"
              />
              <Text className="text-sky-400 font-bold ml-2">Edit Name</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-500/10 p-4 rounded-xl items-center flex-row justify-center border border-red-500/30"
            >
              <Ionicons
                name="trash"
                size={20}
                color="#ef4444"
                className="mr-2"
              />
              <Text className="text-red-500 font-bold ml-2">Delete Page</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- EDIT MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              className="absolute top-4 right-4 z-10 p-2"
            >
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>

            <Text className="text-white text-xl font-bold mb-6 mt-2">
              Rename Page
            </Text>

            <Text className="text-slate-400 mb-2 ml-1">New Name</Text>
            <TextInput
              value={editNameInput}
              onChangeText={setEditNameInput}
              placeholder="Enter new name"
              placeholderTextColor="#475569"
              className="bg-slate-800 text-white p-4 rounded-xl mb-6 border border-slate-700"
            />

            <TouchableOpacity
              onPress={handleSaveEdit}
              className="w-full bg-sky-500 p-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
