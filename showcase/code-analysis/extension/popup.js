const API_URL = 'http://localhost:8000';

// Helper to format JSON for display
function formatJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

// Clone repository and get repo ID
async function cloneRepository(repoUrl) {
  try {
    const response = await fetch(`${API_URL}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: repoUrl }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error cloning repository:', error);
    throw error;
  }
}

// Fetch analysis results from the API
async function fetchAnalysis(analysisType, repoId) {
  try {
    const response = await fetch(
      `${API_URL}/analyze/${analysisType}?repo_id=${encodeURIComponent(repoId)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return { error: error.message };
  }
}

// Display analysis results in the popup
function displayResults(results, analysisType) {
  const resultsDiv = document.getElementById('analysis-results');
  const section = document.createElement('div');
  section.className = 'analysis-type';
  section.innerHTML = `
    <h3>${analysisType}</h3>
    <pre>${formatJSON(results)}</pre>
  `;
  resultsDiv.appendChild(section);
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Query for active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab.url?.includes('github.com')) {
      document.getElementById('repo-info').innerHTML = `
        <p>Please navigate to a GitHub repository to analyze it.</p>
      `;
      return;
    }

    // Get repository info from background script
    chrome.runtime.sendMessage({ type: 'GET_REPO_INFO' }, (response) => {
      const repoInfo = document.getElementById('repo-info');
      const analysisControls = document.getElementById('analysis-controls');
      
      if (response?.data) {
        const { owner, repo } = response.data;
        const repoUrl = `https://github.com/${owner}/${repo}.git`;
        
        repoInfo.innerHTML = `
          <p><strong>Owner:</strong> ${owner}</p>
          <p><strong>Repository:</strong> ${repo}</p>
        `;
        
        // Show analysis controls
        analysisControls.style.display = 'block';
        
        // Setup analyze button
        const analyzeBtn = document.getElementById('analyze-btn');
        analyzeBtn.addEventListener('click', async () => {
          try {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Cloning...';
            
            // First clone the repository
            const { repo_id } = await cloneRepository(repoUrl);
            
            analyzeBtn.textContent = 'Analyzing...';
            
            // Clear previous results
            document.getElementById('analysis-results').innerHTML = '';
            
            // Fetch each type of analysis
            const analysisTypes = [
              'commit-frequency',
              'contributor-activity',
              'commit-frequency-by-weekday',
              'average-commit-size'
            ];
            
            for (const type of analysisTypes) {
              const results = await fetchAnalysis(type, repo_id);
              displayResults(results, type);
            }
          } catch (error) {
            document.getElementById('analysis-results').innerHTML = `
              <div class="error">
                Error: ${error.message}
              </div>
            `;
          } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze Repository';
          }
        });
      } else {
        repoInfo.innerHTML = `
          <p>No repository detected. Please refresh the page if you're on a GitHub repository.</p>
        `;
      }
    });
  });
});
