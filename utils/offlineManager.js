import * as FileSystem from 'expo-file-system/legacy';

const OFFLINE_DIR = FileSystem.documentDirectory + 'offline_vault/';

// Helper: Resolve relative URLs to absolute
const getAbsolutePath = (url, base) => {
  try {
    return new URL(url, base).href;
  } catch (e) {
    return url;
  }
};

// 1. MUST BE EXPORTED: Initialize Directory
export const initOfflineStorage = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
    }
  } catch (e) {
    console.error("Directory Init Error:", e);
  }
};

// 2. MUST BE EXPORTED: The CSS Bundler
export const downloadFullPage = async (url) => {
  try {
    const response = await fetch(url);
    let html = await response.text();

    // Inject Base Tag to help the WebView find images we don't inline
    const baseTag = `<base href="${url}">`;
    html = html.replace('<head>', `<head>${baseTag}`);

    // Find and inline CSS
    const cssRegex = /<link\b[^>]*?\brel=["']stylesheet["'][^>]*?\bhref=["']([^"']+)["'][^>]*?>/gi;
    let match;
    const cssPromises = [];

    while ((match = cssRegex.exec(html)) !== null) {
      const cssUrl = getAbsolutePath(match[1], url);
      cssPromises.push(
        fetch(cssUrl)
          .then(res => res.text())
          .then(cssText => ({
            originalTag: match[0],
            content: `<style>/* Inlined */\n${cssText}</style>`
          }))
          .catch(() => null)
      );
    }

    const cssResults = await Promise.all(cssPromises);
    cssResults.forEach(res => {
      if (res) html = html.replace(res.originalTag, res.content);
    });

    return html;
  } catch (error) {
    console.error("Bundling Error:", error);
    throw error;
  }
};

// 3. MUST BE EXPORTED: Delete Logic
export const deleteOfflinePage = async (siteId) => {
  const fileUri = `${OFFLINE_DIR}${siteId}.html`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  } catch (e) {
    console.error("Delete Error:", e);
  }
};