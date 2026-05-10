import React, { useState, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VaultContext } from "../context/VaultContext";
import { LinearGradient } from "expo-linear-gradient";

export default function OfflineScreen({ navigation }) {
  const { 
    offlineSites = [], 
    downloadManualUrl, 
    deleteOfflineSite,
    pauseDownload,
    resumeDownload,
    startDownload 
  } = useContext(VaultContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  const handleDownload = () => {
    if (!siteName || !siteUrl) return Alert.alert("Error", "Please fill in all fields");

    downloadManualUrl(siteName, siteUrl);
    setModalVisible(false);
    setSiteName("");
    setSiteUrl("");
  };

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={["rgba(56, 189, 248, 0.15)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
      />

      <View className="px-6 pt-14 pb-4">
        <Text className="text-white text-3xl font-bold">Offline Vault</Text>
        <Text className="text-slate-400 text-sm">Saved for offline viewing</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 100 }}>
        {offlineSites && offlineSites.length > 0 ? (
          offlineSites.map((site) => (
            <View key={site.id} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="globe-outline" size={20} color="#38bdf8" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold" numberOfLines={1}>{site.name}</Text>
                  <Text className="text-slate-500 text-xs" numberOfLines={1}>{site.url}</Text>
                </View>

                <View className="flex-row items-center">
                  {site.status === "completed" && (
                    <TouchableOpacity onPress={() => navigation.navigate("OfflineViewerScreen", { site })}>
                      <Ionicons name="eye" size={24} color="#10b981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteOfflineSite(site.id)} className="ml-3">
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress Bar Logic */}
              {site.status !== "completed" && (
                <View className="mt-2">
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
                        <TouchableOpacity onPress={() => pauseDownload(site.id)}>
                          <Text className="text-sky-400 text-[10px] font-bold">PAUSE</Text>
                        </TouchableOpacity>
                      )}
                      {site.status === "paused" && (
                        <TouchableOpacity onPress={() => resumeDownload(site.id)}>
                          <Text className="text-emerald-400 text-[10px] font-bold">RESUME</Text>
                        </TouchableOpacity>
                      )}
                      {site.status === "failed" && (
                        <TouchableOpacity onPress={() => startDownload(site.id, site.url)}>
                          <Text className="text-amber-400 text-[10px] font-bold">RETRY</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="cloud-offline-outline" size={60} color="#334155" />
            <Text className="text-slate-500 mt-4 text-center">Your offline library is empty.</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 w-14 h-14 bg-sky-500 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <Text className="text-white text-xl font-bold mb-6">Download New Page</Text>

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

            <View className="flex-row space-x-3">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 bg-slate-800 p-4 rounded-xl items-center">
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDownload} className="flex-1 bg-sky-500 p-4 rounded-xl items-center">
                <Text className="text-white font-bold">Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}