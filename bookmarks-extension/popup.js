const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup script started');

  const loginForm = document.getElementById('loginForm');
  const mainContent = document.getElementById('mainContent');
  const settingsSection = document.getElementById('settingsSection');
  const loginButton = document.getElementById('loginButton');
  const syncButton = document.getElementById('syncButton');
  const newDeviceButton = document.getElementById('newDeviceButton');
  const settingsButton = document.getElementById('settingsButton');
  const saveSettingsButton = document.getElementById('saveSettingsButton');
  const quickLogoutButton = document.getElementById('quickLogoutButton');
  const aboutButton = document.getElementById('aboutButton');
  const aboutSection = document.getElementById('aboutSection');
  const statusDiv = document.getElementById('status');
  const autoSyncCheckbox = document.getElementById('autoSyncCheckbox');
  const syncIntervalInput = document.getElementById('syncIntervalInput');
  const lastSyncText = document.getElementById('lastSyncText');
  const selectedDeviceInfo = document.getElementById('selectedDeviceInfo');
  const selectedDeviceName = document.getElementById('selectedDeviceName');

  console.log('Checking local storage for user data');

  chrome.storage.local.get(['token', 'autoSync', 'syncInterval', 'lastSync', 'deviceId'], (result) => {
    console.log('Local storage data:', result);
    if (result.token) {
      if (result.deviceId) {
        showMainContent();
        updateSettingsUI(result.autoSync, result.syncInterval);
        if (result.lastSync) {
          updateLastSyncText(result.lastSync);
        } else {
          lastSyncText.textContent = '';
        }
      } else {
        showDeviceSelectionContent();
      }
    } else {
      showLoginForm();
    }
  });

  loginButton.addEventListener('click', login);
  syncButton.addEventListener('click', syncBookmarks);
  newDeviceButton.addEventListener('click', registerNewDevice);
  settingsButton.addEventListener('click', showSettings);
  saveSettingsButton.addEventListener('click', saveSettings);
  quickLogoutButton.addEventListener('click', logout);
  aboutButton.addEventListener('click', toggleAbout);

  function showLoginForm() {
    if (loginForm) loginForm.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    if (settingsSection) settingsSection.style.display = 'none';
    if (aboutSection) aboutSection.style.display = 'none';
    if (quickLogoutButton) quickLogoutButton.style.display = 'none';
    
    // Check if the element exists before trying to access its style
    const cardFooter = document.querySelector('.card-footer');
    if (cardFooter) cardFooter.style.display = 'none';
    
    // Clear any existing status messages
    if (statusDiv) statusDiv.textContent = '';
  }

  function showMainContent() {
    loginForm.style.display = 'none';
    mainContent.style.display = 'block';
    settingsSection.style.display = 'none';
    aboutSection.style.display = 'none';
    quickLogoutButton.style.display = 'block';
    
    chrome.storage.local.get(['deviceId', 'deviceName'], (result) => {
      if (result.deviceId) {
        syncButton.style.display = 'block';
        newDeviceButton.style.display = 'none';
        selectedDeviceInfo.style.display = 'block';
        selectedDeviceName.textContent = result.deviceName || result.deviceId;
        statusDiv.textContent = '';
      } else {
        showDeviceSelectionContent();
      }
    });
  }

  function showSettings() {
    loginForm.style.display = 'none';
    mainContent.style.display = 'none';
    settingsSection.style.display = 'block';
    aboutSection.style.display = 'none';
  }

  async function login() {
    console.log('Login attempt started');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      console.log('Sending login request');
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Login response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login successful, token received');
      chrome.storage.local.set({token: data.token}, () => {
        console.log('Token saved to local storage');
        showDeviceSelectionContent();
      });
    } catch (error) {
      console.error('Login error:', error);
      if (statusDiv) statusDiv.textContent = error.message;
    }
  }

  function syncBookmarks() {
    chrome.storage.local.get(['token', 'deviceId'], (result) => {
      if (result.token && result.deviceId) {
        statusDiv.textContent = 'Syncing...';
        chrome.runtime.sendMessage({
          action: "syncBookmarks",
          token: result.token,
          deviceId: result.deviceId
        }, (response) => {
          console.log('Sync response:', response); // Add this line
          if (response && response.success) {
            const now = new Date();
            chrome.storage.local.set({lastSync: now.toISOString()}, () => {
              updateLastSyncText(now.toISOString());
            });
            statusDiv.textContent = `Sync complete! ${response.totalSynced} bookmarks synced.`;
          } else {
            console.error('Sync failed:', response); // Add this line
            statusDiv.textContent = 'Sync failed: ' + (response ? response.message : 'Unknown error');
          }
        });
      } else if (!result.token) {
        statusDiv.textContent = 'Please log in to sync bookmarks';
        showLoginForm();
      } else {
        statusDiv.textContent = 'Please register a device before syncing';
        newDeviceButton.style.display = 'block';
      }
    });
  }

  function registerNewDevice() {
    const deviceName = prompt("Enter a name for this device:");
    if (deviceName) {
      const deviceId = 'extension-' + Math.random().toString(36).substr(2, 9);
      chrome.storage.local.get(['token'], async (result) => {
        if (result.token) {
          try {
            const response = await fetch(`${API_URL}/devices`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': result.token
              },
              body: JSON.stringify({ name: deviceName, deviceId })
            });
            if (response.ok) {
              chrome.storage.local.set({ deviceId, deviceName }, () => {
                statusDiv.textContent = 'Device registered successfully';
                showMainContent();
              });
            } else {
              throw new Error('Failed to register device');
            }
          } catch (error) {
            statusDiv.textContent = 'Failed to register device: ' + error.message;
          }
        } else {
          statusDiv.textContent = 'Not authenticated';
        }
      });
    }
  }

  function saveSettings() {
    const autoSync = autoSyncCheckbox.checked;
    const syncInterval = parseInt(syncIntervalInput.value, 10);
    chrome.storage.local.set({ autoSync, syncInterval }, () => {
      chrome.runtime.sendMessage({ 
        action: "updateSettings", 
        autoSync, 
        syncInterval 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error updating settings:', chrome.runtime.lastError);
          statusDiv.textContent = 'Failed to save settings: ' + chrome.runtime.lastError.message;
        } else if (response && response.success) {
          statusDiv.textContent = 'Settings saved successfully';
          updateSettingsUI(autoSync, syncInterval);
          setTimeout(() => {
            showMainContent();
            statusDiv.textContent = '';
          }, 1500);
        } else {
          console.error('Unexpected response:', response);
          statusDiv.textContent = 'Failed to save settings: Unexpected response';
        }
      });
    });
  }

  function updateSettingsUI(autoSync, syncInterval) {
    autoSyncCheckbox.checked = autoSync;
    syncIntervalInput.value = syncInterval;
  }

  function logout() {
    chrome.storage.local.remove(['token', 'lastSync'], () => {
      showLoginForm();
      statusDiv.textContent = 'Logged out successfully';
    });
  }

  function toggleAbout() {
    if (aboutSection.style.display === 'none') {
      loginForm.style.display = 'none';
      mainContent.style.display = 'none';
      settingsSection.style.display = 'none';
      aboutSection.style.display = 'block';
    } else {
      aboutSection.style.display = 'none';
      chrome.storage.local.get(['token'], (result) => {
        if (result.token) {
          showMainContent();
        } else {
          showLoginForm();
        }
      });
    }
  }

  function updateLastSyncText(lastSyncISO) {
    if (lastSyncISO) {
      const lastSync = new Date(lastSyncISO);
      lastSyncText.textContent = `Last sync: ${lastSync.toLocaleDateString()} ${lastSync.toLocaleTimeString()}`;
    } else {
      lastSyncText.textContent = 'Not synced yet';
    }
  }

  chrome.storage.local.get(['lastSync'], (result) => {
    updateLastSyncText(result.lastSync);
  });

  // Add this function to check device registration
  function checkDeviceRegistration() {
    chrome.storage.local.get(['token', 'deviceId'], async (result) => {
      if (result.token && result.deviceId) {
        try {
          const response = await fetch(`${API_URL}/devices/${result.deviceId}`, {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': result.token
            }
          });
          if (!response.ok) {
            throw new Error('Device not found');
          }
          // Device is registered, show sync button
          syncButton.style.display = 'block';
          newDeviceButton.style.display = 'none';
          statusDiv.textContent = '';
        } catch (error) {
          console.error('Error checking device registration:', error);
          // Device is not registered, show register button
          syncButton.style.display = 'none';
          newDeviceButton.style.display = 'block';
          statusDiv.textContent = 'Please register a device before syncing';
        }
      }
    });
  }

  // Call this function when the popup is opened
  checkDeviceRegistration();

  async function fetchAndDisplayDevices() {
    try {
      const token = await new Promise(resolve => chrome.storage.local.get(['token'], result => resolve(result.token)));
      const response = await fetch(`${API_URL}/devices/user`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }
      
      const devices = await response.json();
      displayDevices(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      statusDiv.textContent = 'Error fetching devices';
    }
  }

  function displayDevices(devices) {
    const deviceList = document.getElementById('deviceList');
    deviceList.innerHTML = '<h2>Select a device to sync your bookmarks</h2>';
    if (devices.length === 0) {
      deviceList.innerHTML += '<p>No devices found. Please register a new device.</p>';
    } else {
      const deviceListContainer = document.createElement('ul');
      deviceListContainer.className = 'device-list';
      devices.forEach(device => {
        const deviceElement = document.createElement('li');
        deviceElement.className = 'device-item';
        deviceElement.innerHTML = `
          <button class="select-device" data-device-id="${device.deviceId}" data-device-name="${device.name}">
            <span class="device-icon material-icons">
              ${getDeviceIcon(device.name)}
            </span>
            <span class="device-name">${device.name}</span>
            <span class="select-text">Select</span>
          </button>
        `;
        deviceListContainer.appendChild(deviceElement);
      });
      deviceList.appendChild(deviceListContainer);
    }

    // Add event listeners to select buttons
    document.querySelectorAll('.select-device').forEach(button => {
      button.addEventListener('click', function() {
        const deviceId = this.getAttribute('data-device-id');
        const deviceName = this.getAttribute('data-device-name');
        selectDevice(deviceId, deviceName);
      });
    });
  }

  function getDeviceIcon(deviceName) {
    const lowerCaseName = deviceName.toLowerCase();
    if (lowerCaseName.includes('phone') || lowerCaseName.includes('mobile')) {
      return 'smartphone';
    } else if (lowerCaseName.includes('tablet') || lowerCaseName.includes('ipad')) {
      return 'tablet';
    } else {
      return 'laptop';
    }
  }

  function selectDevice(deviceId, deviceName) {
    chrome.storage.local.set({ deviceId, deviceName }, () => {
      statusDiv.textContent = 'Device selected';
      // Remove 'selected' class from all devices
      document.querySelectorAll('.select-device').forEach(button => {
        button.classList.remove('selected');
      });
      // Add 'selected' class to the chosen device
      const selectedButton = document.querySelector(`.select-device[data-device-id="${deviceId}"]`);
      if (selectedButton) {
        selectedButton.classList.add('selected');
      }
      showMainContent();
    });
  }

  function showDeviceSelectionContent() {
    loginForm.style.display = 'none';
    mainContent.style.display = 'block';
    settingsSection.style.display = 'none';
    aboutSection.style.display = 'none';
    quickLogoutButton.style.display = 'block';
    syncButton.style.display = 'none';
    newDeviceButton.style.display = 'block';
    selectedDeviceInfo.style.display = 'none';
    statusDiv.textContent = 'Please select or register a device before syncing';
    lastSyncText.textContent = '';
    fetchAndDisplayDevices();
  }

  // Add this message listener to handle sync updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);  // Add this line for debugging
    if (message.action === 'syncProgress') {
      statusDiv.textContent = `Syncing... ${message.current}/${message.total} chunks (${message.synced} bookmarks)`;
    } else if (message.action === 'syncComplete') {
      const now = new Date();
      chrome.storage.local.set({ lastSync: now.toISOString() }, () => {
        updateLastSyncText(now.toISOString());
      });
      // Check for message.result.totalSynced and display correctly
      if (message.result && typeof message.result.totalSynced !== 'undefined') {
        statusDiv.textContent = `Sync complete! ${message.result.totalSynced} bookmarks synced.`;
      } else {
        statusDiv.textContent = 'Sync complete! No bookmarks synced.';
      }
    } else if (message.action === 'syncFailed') {
      statusDiv.textContent = 'Sync failed: ' + message.message;
    }
  });
});