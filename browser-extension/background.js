// Background service worker for the extension
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items
  chrome.contextMenus.create({
    id: 'neuralforge-explain',
    title: 'Explain with NeuralForge AI',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'neuralforge-summarize',
    title: 'Summarize with AI',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'neuralforge-translate',
    title: 'Translate with AI',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'neuralforge-rewrite',
    title: 'Rewrite with AI',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'separator',
    type: 'separator',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'neuralforge-open',
    title: 'Open NeuralForge App',
    contexts: ['all']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'neuralforge-open') {
    chrome.tabs.create({url: 'https://neuralforge.com'});
    return;
  }
  
  if (info.selectionText) {
    const action = info.menuItemId.replace('neuralforge-', '');
    
    // Inject script to handle the action
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: handleContextMenuAction,
      args: [action, info.selectionText]
    });
  }
});

// Function to be injected for context menu actions
function handleContextMenuAction(action, selectedText) {
  // This function will be injected into the page
  window.postMessage({
    type: 'NEURALFORGE_ACTION',
    action: action,
    text: selectedText
  }, '*');
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_AUTH_STATUS') {
    chrome.storage.sync.get(['userToken'], (result) => {
      sendResponse({isAuthenticated: !!result.userToken});
    });
    return true; // Will respond asynchronously
  }
  
  if (request.type === 'OPEN_LOGIN') {
    chrome.tabs.create({url: 'https://neuralforge.com/login'});
  }
});

// Listen for auth token updates from the web app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTH_TOKEN' && sender.origin === 'https://neuralforge.com') {
    chrome.storage.sync.set({userToken: request.token}, () => {
      sendResponse({success: true});
    });
    return true;
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-sidebar') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
          // Toggle sidebar (function will be available from content script)
          if (typeof toggleSidebar === 'function') {
            toggleSidebar();
          }
        }
      });
    });
  }
});