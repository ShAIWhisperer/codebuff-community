// Store repository info from content scripts
let currentRepoInfo = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REPO_DETECTED') {
    currentRepoInfo = message.data;
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_REPO_INFO') {
    sendResponse({ data: currentRepoInfo });
  }
  return true; // Keep channel open for async response
});
