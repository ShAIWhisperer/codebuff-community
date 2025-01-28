// Example background script (service worker)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed')
})

// This keeps the service worker active
export {}
