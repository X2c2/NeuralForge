document.addEventListener('DOMContentLoaded', async () => {
  const selectedTextDiv = document.getElementById('selectedText');
  const resultArea = document.getElementById('resultArea');
  const actionButtons = document.querySelectorAll('.action-btn');
  const openAppBtn = document.getElementById('openApp');
  
  // Get selected text from the current tab
  let selectedText = '';
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const results = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: () => window.getSelection().toString()
    });
    selectedText = results[0].result;
    
    if (selectedText) {
      selectedTextDiv.textContent = selectedText.substring(0, 200) + (selectedText.length > 200 ? '...' : '');
    }
  } catch (error) {
    console.error('Failed to get selected text:', error);
  }
  
  // Handle action buttons
  actionButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      await performAIAction(action, selectedText);
    });
  });
  
  // Open main app
  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({url: 'https://neuralforge.com'});
  });
  
  async function performAIAction(action, text) {
    if (!text) {
      alert('Please select some text on the page first');
      return;
    }
    
    resultArea.style.display = 'block';
    resultArea.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span>Processing with AI...</span>
      </div>
    `;
    
    try {
      // Get user token from storage
      const {userToken} = await chrome.storage.sync.get(['userToken']);
      
      if (!userToken) {
        resultArea.innerHTML = '<div style="color: #ef4444;">Please login to NeuralForge first</div>';
        return;
      }
      
      // Call NeuralForge API
      const response = await fetch('https://api.neuralforge.com/api/v1/ai/quick-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          action: action,
          text: text,
          provider: 'openai',
          model: 'gpt-4o-mini'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        resultArea.innerHTML = `<div>${result.result.text}</div>`;
      } else {
        resultArea.innerHTML = `<div style="color: #ef4444;">Error: ${result.error}</div>`;
      }
      
    } catch (error) {
      resultArea.innerHTML = `<div style="color: #ef4444;">Failed to process: ${error.message}</div>`;
    }
  }
});