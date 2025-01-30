// Check if we're on a repository page
function isRepositoryPage() {
  // GitHub repository URLs follow the pattern: github.com/owner/repo
  const path = window.location.pathname;
  const pathParts = path.split('/').filter(Boolean);
  return pathParts.length >= 2;
}

// Extract repository information
function getRepositoryInfo() {
  if (!isRepositoryPage()) return null;
  
  const [owner, repo] = window.location.pathname
    .split('/')
    .filter(Boolean)
    .slice(0, 2);
  
  return {
    owner,
    repo,
    url: window.location.href
  };
}

// Initialize when the page loads
function init() {
  const repoInfo = getRepositoryInfo();
  if (repoInfo) {
    console.log('GitHub Repository Analyzer activated:', repoInfo);
    // Send repository information to the extension
    chrome.runtime.sendMessage({
      type: 'REPO_DETECTED',
      data: repoInfo
    });
  }
}

// Run initialization
init();

// Listen for navigation changes (for single page app navigation)
let lastPath = window.location.pathname;
new MutationObserver(() => {
  const currentPath = window.location.pathname;
  if (currentPath !== lastPath) {
    lastPath = currentPath;
    init();
  }
}).observe(document.body, { childList: true, subtree: true });

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_REPO_INFO') {
    sendResponse({ data: getRepositoryInfo() });
  }
  return true; // Required to use sendResponse asynchronously
});
