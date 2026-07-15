import * as FileSystem from 'expo-file-system/legacy';

const HISTORY_METADATA_PATH = `${FileSystem.documentDirectory}search_history_metadata.json`;
const HISTORY_IMAGES_DIR = `${FileSystem.documentDirectory}history_images/`;

// Ensure history images folder exists
async function ensureImagesDirectoryExists() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(HISTORY_IMAGES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(HISTORY_IMAGES_DIR, { intermediates: true });
    }
  } catch (err) {
    console.error('Failed to create history images directory:', err);
  }
}

export async function getSearchHistory() {
  try {
    const info = await FileSystem.getInfoAsync(HISTORY_METADATA_PATH);
    if (!info.exists) {
      return [];
    }
    const content = await FileSystem.readAsStringAsync(HISTORY_METADATA_PATH);
    return JSON.parse(content);
  } catch (err) {
    console.error('Error fetching search history:', err);
    return [];
  }
}

export async function addHistoryEntry(type, queryOrUri) {
  try {
    await ensureImagesDirectoryExists();
    const history = await getSearchHistory();
    
    let finalQuery = queryOrUri;
    
    // Copy image searches to local history storage so thumbnail stays persistent
    if (type === 'image' && queryOrUri) {
      const filename = `img_${Date.now()}.jpg`;
      const destination = `${HISTORY_IMAGES_DIR}${filename}`;
      try {
        await FileSystem.copyAsync({
          from: queryOrUri,
          to: destination,
        });
        finalQuery = destination;
      } catch (err) {
        console.error('Failed to copy history image:', err);
        finalQuery = queryOrUri;
      }
    }
    
    const newEntry = {
      id: String(Date.now()),
      type, // 'text' | 'image' | 'qr'
      query: finalQuery,
      timestamp: Date.now(),
    };
    
    // Store last 100 history items
    const updatedHistory = [newEntry, ...history].slice(0, 100);
    await FileSystem.writeAsStringAsync(HISTORY_METADATA_PATH, JSON.stringify(updatedHistory));
  } catch (err) {
    console.error('Error adding history entry:', err);
  }
}

export async function deleteHistoryEntry(id) {
  try {
    const history = await getSearchHistory();
    const entry = history.find(item => item.id === id);
    if (entry && entry.type === 'image' && entry.query.startsWith(HISTORY_IMAGES_DIR)) {
      try {
        await FileSystem.deleteAsync(entry.query, { idempotent: true });
      } catch (err) {
        console.warn('Failed to delete history image file:', entry.query, err);
      }
    }
    const updatedHistory = history.filter(item => item.id !== id);
    await FileSystem.writeAsStringAsync(HISTORY_METADATA_PATH, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (err) {
    console.error('Error deleting history entry:', err);
    return [];
  }
}

export async function clearAllHistory() {
  try {
    const history = await getSearchHistory();
    for (const entry of history) {
      if (entry.type === 'image' && entry.query.startsWith(HISTORY_IMAGES_DIR)) {
        try {
          await FileSystem.deleteAsync(entry.query, { idempotent: true });
        } catch (err) {
          // ignore
        }
      }
    }
    await FileSystem.deleteAsync(HISTORY_METADATA_PATH, { idempotent: true });
    return [];
  } catch (err) {
    console.error('Error clearing search history:', err);
    return [];
  }
}
