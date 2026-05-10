import * as FileSystem from 'expo-file-system';

// We store files in the app's secure internal document directory
const OFFLINE_DIR = FileSystem.documentDirectory + 'offline_vault/';

export const initOfflineStorage = async () => {
  const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
  }
};

export const downloadOfflinePage = async (siteId, url) => {
  await initOfflineStorage();
  const fileUri = `${OFFLINE_DIR}${siteId}.html`;
  
  try {
    // Downloads the raw HTML of the page
    const { uri } = await FileSystem.downloadAsync(url, fileUri);
    return uri;
  } catch (error) {
    console.error('Offline download failed:', error);
    return null;
  }
};

export const deleteOfflinePage = async (siteId) => {
  const fileUri = `${OFFLINE_DIR}${siteId}.html`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  } catch (error) {
    console.error('Delete offline file failed:', error);
  }
};

export const getOfflineFilePath = (siteId) => {
  return `${OFFLINE_DIR}${siteId}.html`;
};