const API_URL = 'http://localhost:5000/api';
const MAX_CHUNK_SIZE = 500; // Reduced from 1000 to 500
const DEFAULT_SYNC_INTERVAL = 60; // minutes
const MAX_RETRIES = 3;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Bookmarks Sync extension installed');
  chrome.storage.local.get(['autoSync', 'syncInterval'], (result) => {
    if (result.autoSync === undefined) {
      chrome.storage.local.set({ autoSync: true, syncInterval: DEFAULT_SYNC_INTERVAL });
    }
    if (result.autoSync) {
      setupAlarm(result.syncInterval || DEFAULT_SYNC_INTERVAL);
    }
  });
});

function setupAlarm(interval) {
  chrome.alarms.create('syncBookmarks', { periodInMinutes: interval });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncBookmarks') {
    chrome.storage.local.get(['token', 'deviceId', 'autoSync'], (result) => {
      if (result.autoSync && result.token && result.deviceId) {
        syncBookmarks(result.token, result.deviceId);
      }
    });
  }
});

// Function to get all bookmarks
function getAllBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      resolve(bookmarkTreeNodes);
    });
  });
}

// Function to flatten bookmark tree
function flattenBookmarks(bookmarkTreeNodes) {
  let bookmarks = [];
  for (let node of bookmarkTreeNodes) {
    if (node.children) {
      bookmarks = bookmarks.concat(flattenBookmarks(node.children));
    } else if (node.url) {
      bookmarks.push({
        id: node.id,  // Add this line to include Chrome's bookmark ID
        title: node.title,
        url: node.url,
        dateAdded: node.dateAdded
      });
    }
  }
  return bookmarks;
}

// Function to chunk array
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Function to sync bookmarks
async function syncBookmarks(token, deviceId) {
  try {
    const bookmarks = await new Promise((resolve) => collectBookmarks(resolve));
    const chunks = chunkArray(bookmarks, MAX_CHUNK_SIZE);
    
    console.log(`Syncing ${bookmarks.length} bookmarks in ${chunks.length} chunks`);
    
    let totalSynced = 0;
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Sending chunk ${i + 1} of ${chunks.length}`);
      
      let success = false;
      let attempt = 0;

      while (!success && attempt < MAX_RETRIES) {
        attempt++;
        try {
          const response = await fetch(`${API_URL}/bookmarks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({ 
              deviceId, 
              bookmarks: chunks[i],
              chunkIndex: i,
              totalChunks: chunks.length
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to sync bookmarks chunk ${i + 1}: ${response.statusText}. ${errorText}`);
          }
          
          const result = await response.json();
          console.log(`Chunk ${i + 1} sync successful:`, result);
          totalSynced += result.count;
          success = true;

          // Send progress update
          chrome.runtime.sendMessage({ 
            action: 'syncProgress', 
            current: i + 1, 
            total: chunks.length, 
            synced: totalSynced 
          });
        } catch (error) {
          console.error(`Attempt ${attempt} failed for chunk ${i + 1}:`, error);
          if (attempt >= MAX_RETRIES) {
            throw error;
          }
          // Wait for a short time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    const now = new Date();
    chrome.storage.local.set({ lastSync: now.toISOString() });
    
    return { success: true, message: 'All bookmarks synced successfully', totalSynced };
  } catch (error) {
    console.error('Error syncing bookmarks:', error);
    throw error;
  }
}

// Function to check device registration
async function checkDeviceRegistration(token, deviceId) {
  try {
    const response = await fetch(`${API_URL}/devices/${deviceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // Device not found, clear deviceId from storage
        chrome.storage.local.remove('deviceId');
        return false;
      }
      throw new Error('Failed to check device registration');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking device registration:', error);
    return false;
  }
}

// Periodically check device registration (e.g., every 5 minutes)
setInterval(() => {
  chrome.storage.local.get(['token', 'deviceId'], async (result) => {
    if (result.token && result.deviceId) {
      const isRegistered = await checkDeviceRegistration(result.token, result.deviceId);
      if (!isRegistered) {
        console.log('Device is no longer registered');
        // Notify popup to show device registration form
        chrome.runtime.sendMessage({action: "showDeviceRegistration"});
      }
    }
  });
}, 5 * 60 * 1000); // 5 minutes

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "syncBookmarks") {
    // Send an immediate response to avoid the port being closed
    sendResponse({ success: true, message: 'Sync started' });
    
    // Process the bookmark sync in the background
    syncBookmarks(request.token, request.deviceId)
      .then(result => {
        console.log('Sync result:', result);
        // Send a message back to the popup with the result
        chrome.runtime.sendMessage({ 
          action: 'syncComplete', 
          result: { 
            totalSynced: result.totalSynced,
            message: result.message 
          }
        });
      })
      .catch(error => {
        console.error('Sync error:', error);
        chrome.runtime.sendMessage({ action: 'syncFailed', message: error.message });
      });

    return true; // Indicates that the response will be sent asynchronously
  }

  if (request.action === "updateSettings") {
    console.log('Updating settings:', request);
    if (request.autoSync) {
      setupAutoSync(request.syncInterval);
    } else {
      chrome.alarms.clear('autoSync');
      console.log('Auto-sync disabled');
    }
    sendResponse({ success: true });
    return true; // Indicates that the response is sent asynchronously
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoSync') {
    chrome.storage.local.get(['token', 'deviceId', 'autoSync'], (result) => {
      if (result.autoSync && result.token && result.deviceId) {
        console.log('Auto-sync triggered');
        syncBookmarks(result.token, result.deviceId);
      }
    });
  }
});

function setupAutoSync(interval) {
  chrome.alarms.clear('autoSync', () => {
    chrome.alarms.create('autoSync', { periodInMinutes: interval });
    console.log(`Auto-sync alarm set for every ${interval} minutes`);
  });
}

// Initialize auto-sync on extension load
chrome.storage.local.get(['autoSync', 'syncInterval'], (result) => {
  if (result.autoSync) {
    setupAutoSync(result.syncInterval || 60);
  }
});

function collectBookmarks(callback) {
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    let bookmarks = [];
    
    function processNode(node, parentId = null) {
      let bookmark = {
        id: node.id,
        parentId: parentId,
        title: node.title,
        dateAdded: node.dateAdded,
        isFolder: !node.url
      };

      if (node.url) {
        bookmark.url = node.url;
      }

      bookmarks.push(bookmark);

      if (node.children) {
        node.children.forEach(child => processNode(child, node.id));
      }
    }

    bookmarkTreeNodes.forEach(node => processNode(node));
    callback(bookmarks);
  });
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
