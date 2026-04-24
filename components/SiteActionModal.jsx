import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ToastAndroid, Platform, Animated, TextInput, Alert } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { VaultContext } from '../context/VaultContext';

export default function SiteActionModal({ visible, site, onClose, onTogglePin, onEdit, onDelete }) {
  const { folders, createFolder, moveSiteToFolder } = useContext(VaultContext);
  
  const slideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // NEW: State to manage which menu is currently visible ('main', 'folders', 'createFolder')
  const [activeMenu, setActiveMenu] = useState('main');
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (visible) {
      setActiveMenu('main');
      setNewFolderName('');
      slideAnim.setValue(500);
      fadeAnim.setValue(0);
      
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  const handleClose = (actionCallback) => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 500, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start(() => {
      onClose();
      if (actionCallback) actionCallback();
    });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(site.url);
    if (Platform.OS === 'android') ToastAndroid.show('Link copied', ToastAndroid.SHORT);
    handleClose();
  };

  const handleCreateAndMove = async () => {
    if (newFolderName.trim().length > 0) {
      const newId = await createFolder(newFolderName.trim());
      handleClose(() => moveSiteToFolder(site.id, newId));
      if (Platform.OS === 'android') ToastAndroid.show(`Moved to ${newFolderName}`, ToastAndroid.SHORT);
    } else {
      Alert.alert("Error", "Folder name cannot be empty");
    }
  };

  const handleMoveToExisting = (folderId, folderName) => {
    handleClose(() => moveSiteToFolder(site.id, folderId));
    if (Platform.OS === 'android') ToastAndroid.show(`Moved to ${folderName}`, ToastAndroid.SHORT);
  };

  const handleRemoveFromFolder = () => {
    handleClose(() => moveSiteToFolder(site.id, null));
    if (Platform.OS === 'android') ToastAndroid.show('Moved to Dashboard', ToastAndroid.SHORT);
  };

  if (!site) return null;

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={() => handleClose()}>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', opacity: fadeAnim }}>
        <TouchableOpacity activeOpacity={1} onPress={() => handleClose()} className="flex-1 justify-end">
          
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity activeOpacity={1} className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700 shadow-2xl min-h-[40%]">
              
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6 pb-6 border-b border-slate-700/50">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-slate-800 justify-center items-center overflow-hidden mr-4 border border-slate-700">
                    {site.iconUrl ? (
                      <Image source={{ uri: site.iconUrl }} className="w-6 h-6 rounded-md" />
                    ) : (
                      <Ionicons name={site.icon} size={18} color={site.color} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold" numberOfLines={1}>{site.name}</Text>
                    {activeMenu !== 'main' && <Text className="text-fuchsia-500 text-xs">Organizing...</Text>}
                  </View>
                </View>
                
                {/* Back button if in sub-menus */}
                {activeMenu !== 'main' && (
                  <TouchableOpacity onPress={() => setActiveMenu('main')} className="bg-slate-800 p-2 rounded-full border border-slate-700">
                    <Ionicons name="arrow-back" size={20} color="#a855f7" />
                  </TouchableOpacity>
                )}
              </View>

              {/* --- VIEW: MAIN ACTIONS --- */}
              {activeMenu === 'main' && (
                <View>
                  <TouchableOpacity onPress={() => setActiveMenu('folders')} className="flex-row items-center mb-6 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <Ionicons name="folder-open" size={22} color="#38bdf8" />
                    <View className="ml-4">
                      <Text className="text-white text-lg font-bold">Organize</Text>
                      <Text className="text-slate-400 text-xs">Move to a folder</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={copyToClipboard} className="flex-row items-center mb-6 pl-2">
                    <Ionicons name="copy-outline" size={22} color="#a855f7" />
                    <Text className="text-white text-lg ml-4">Copy Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleClose(() => onEdit(site))} className="flex-row items-center mb-6 pl-2">
                    <Ionicons name="pencil" size={22} color="#a855f7" />
                    <Text className="text-white text-lg ml-4">Edit Site Info</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleClose(() => onTogglePin(site.id))} className="flex-row items-center mb-6 pl-2">
                    <View className="w-6 items-center"><Entypo name="pin" size={20} color="#a855f7" /></View>
                    <Text className="text-white text-lg ml-4">{site.isPinned ? "Unpin from Dashboard" : "Pin to Dashboard"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleClose(() => onDelete(site.id))} className="flex-row items-center mb-4 pl-2">
                    <Ionicons name="trash" size={22} color="#ef4444" />
                    <Text className="text-red-500 text-lg ml-4 font-semibold">Remove from Vault</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* --- VIEW: FOLDER SELECTION --- */}
              {activeMenu === 'folders' && (
                <View>
                  {site.folderId && (
                     <TouchableOpacity onPress={handleRemoveFromFolder} className="flex-row items-center mb-4 pl-2">
                       <Ionicons name="home" size={22} color="#ef4444" />
                       <Text className="text-red-500 text-lg ml-4 font-bold">Remove from Folder</Text>
                     </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => setActiveMenu('createFolder')} className="flex-row items-center mb-6 pl-2">
                    <Ionicons name="add-circle" size={22} color="#10b981" />
                    <Text className="text-emerald-500 text-lg ml-4 font-bold">Create New Folder</Text>
                  </TouchableOpacity>

                  <Text className="text-slate-500 text-xs uppercase tracking-widest mb-3 pl-2">Your Folders</Text>
                  {folders.length === 0 ? (
                    <Text className="text-slate-400 pl-2">No folders exist yet.</Text>
                  ) : (
                    folders.map(folder => (
                      <TouchableOpacity 
                        key={folder.id} 
                        onPress={() => handleMoveToExisting(folder.id, folder.name)}
                        className={`flex-row items-center mb-4 p-3 rounded-xl border ${site.folderId === folder.id ? 'bg-fuchsia-500/10 border-fuchsia-500' : 'bg-slate-800 border-slate-700'}`}
                      >
                        <Ionicons name={site.folderId === folder.id ? "folder-open" : "folder"} size={22} color={site.folderId === folder.id ? "#d946ef" : "#a855f7"} />
                        <Text className={`text-lg ml-4 ${site.folderId === folder.id ? 'text-fuchsia-500 font-bold' : 'text-white'}`}>{folder.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* --- VIEW: CREATE NEW FOLDER --- */}
              {activeMenu === 'createFolder' && (
                <View>
                  <Text className="text-white text-lg mb-4 font-bold pl-2">Name your folder</Text>
                  <View className="flex-row items-center border border-slate-700 rounded-xl bg-slate-800/50 px-4 py-2 mb-6">
                    <Ionicons name="folder" size={20} color="#94a3b8" />
                    <TextInput 
                      value={newFolderName}
                      onChangeText={setNewFolderName}
                      placeholder="e.g. Design Tools"
                      placeholderTextColor="#475569"
                      className="flex-1 text-white text-base ml-3 py-3"
                      autoFocus
                    />
                  </View>
                  <TouchableOpacity onPress={handleCreateAndMove} className="bg-fuchsia-500 rounded-xl py-4 items-center">
                    <Text className="text-white font-bold text-lg">Create & Move Site</Text>
                  </TouchableOpacity>
                </View>
              )}

            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}