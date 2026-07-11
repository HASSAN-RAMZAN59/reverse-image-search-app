import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const METADATA_PATH = `${FileSystem.documentDirectory}downloads_metadata.json`;

export async function getSavedDownloads() {
  try {
    const info = await FileSystem.getInfoAsync(METADATA_PATH);
    if (!info.exists) {
      return [];
    }
    const content = await FileSystem.readAsStringAsync(METADATA_PATH);
    const list = JSON.parse(content);
    
    // Verify each file still exists locally on the disk
    const verifiedList = [];
    for (const item of list) {
      const fileInfo = await FileSystem.getInfoAsync(item.uri);
      if (fileInfo.exists) {
        verifiedList.push(item);
      }
    }
    
    // If some files were deleted externally, update metadata
    if (verifiedList.length !== list.length) {
      await FileSystem.writeAsStringAsync(METADATA_PATH, JSON.stringify(verifiedList));
    }
    
    return verifiedList;
  } catch (err) {
    console.error("Error reading downloads metadata:", err);
    return [];
  }
}

export async function addSavedDownload(localUri, galleryAssetId = null) {
  try {
    const list = await getSavedDownloads();
    
    // Prevent duplicate entries
    if (list.some(item => item.uri === localUri)) {
      return;
    }
    
    const newRecord = {
      id: String(Date.now()),
      uri: localUri,
      galleryAssetId,
      timestamp: Date.now()
    };
    
    const updatedList = [newRecord, ...list];
    await FileSystem.writeAsStringAsync(METADATA_PATH, JSON.stringify(updatedList));
  } catch (err) {
    console.error("Error adding download record:", err);
  }
}

export async function deleteSavedDownload(id, localUri, galleryAssetId = null) {
  try {
    // 1. Delete local file from app document directory
    await FileSystem.deleteAsync(localUri, { idempotent: true });
    
    // 2. Delete from device photo library if asset ID is present
    if (galleryAssetId) {
      try {
        const { status } = await MediaLibrary.getPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.deleteAssetsAsync([galleryAssetId]);
        }
      } catch (err) {
        console.warn("Could not delete asset from device gallery:", err);
      }
    }
    
    // 3. Remove from metadata list
    const list = await getSavedDownloads();
    const updatedList = list.filter(item => item.id !== id);
    await FileSystem.writeAsStringAsync(METADATA_PATH, JSON.stringify(updatedList));
  } catch (err) {
    console.error("Error deleting download record:", err);
  }
}
