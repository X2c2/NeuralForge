// Content script for web page integration
(function() {
  let sidebar = null;
  let isAuthenticated = false;
  
  // Check authentication status
  chrome.storage.sync.get(['userToken'], (result) => {
    isAuthenticated = !!result.userToken;
  });
  
  // Add context menu for selected text
  document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      showQuickActions(selectedText);
    }
  });
  
  // Show quick action tooltip
  function showQuickActions(text) {
    removeQuickActions();
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const tooltip = document.createElement('div');
    tooltip.id = 'neuralforge-tooltip';
    tooltip.innerHTML = `
      <div style="
        position: fixed;
        top: ${rect.bottom + window.scrollY + 8}px;
        left: ${rect.left + window.scrollX}px;
        background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 8px;
        display: flex;
        gap: 4px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      ">
        <button class="nf-action-btn" data-action="explain" title="Explain with AI">💡</button>
        <button class="nf-action-btn" data-action="summarize" title="Summarize">📝</button>
        <button class="nf-action-btn" data-action="translate" title="Translate">🌍</button>
        <button class="nf-action-btn" data-action="rewrite" title="Rewrite">✨</button>
        <button class="nf-action-btn" data-action="close" title="Close">❌</button>
      </div>
    `;
    
    // Add styles for buttons
    const style = document.createElement('style');
    style.textContent = `
      .nf-action-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .nf-action-btn:hover {
        background: rgba(139, 92, 246, 0.3);
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(tooltip);
    
    // Add event listeners
    tooltip.querySelectorAll('.nf-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        if (action === 'close') {
          removeQuickActions();
        } else {
          performQuickAction(action, text);
        }
      });
    });
    
    // Remove tooltip when clicking outside
    setTimeout(() => {
      document.addEventListener('click', removeQuickActions, {once: true});
    }, 100);
  }
  
  function removeQuickActions() {
    const tooltip = document.getElementById('neuralforge-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
  
  async function performQuickAction(action, text) {
    removeQuickActions();
    
    if (!isAuthenticated) {
      showLoginPrompt();
      return;
    }
    
    // Show loading indicator
    showLoadingIndicator();
    
    try {
      const {userToken} = await chrome.storage.sync.get(['userToken']);
      
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
      hideLoadingIndicator();
      
      if (result.success) {
        showResult(result.result.text);
      } else {
        showError(result.error);
      }
      
    } catch (error) {
      hideLoadingIndicator();
      showError('Failed to process with AI');
    }
  }
  
  function showLoginPrompt() {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      ">
        <div style="
          background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          color: white;
          max-width: 400px;
        ">
          <div style="font-size: 24px; margin-bottom: 16px;">🧠</div>
          <h3 style="margin: 0 0 16px 0; color: white;">Login to NeuralForge</h3>
          <p style="margin: 0 0 24px 0; color: #9ca3af;">Sign in to access AI tools anywhere on the web</p>
          <button onclick="window.open('https://neuralforge.com/login'); this.closest('div').remove()" style="
            background: linear-gradient(45deg, #8b5cf6, #ec4899);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 12px 24px;
            font-weight: 500;
            cursor: pointer;
            margin-right: 12px;
          ">Open Login</button>
          <button onclick="this.closest('div').remove()" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            padding: 12px 24px;
            cursor: pointer;
          ">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  function showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'neuralforge-loader';
    loader.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      ">
        <div style="
          width: 16px;
          height: 16px;
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-top: 2px solid #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <span style="font-size: 14px;">Processing with AI...</span>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loader);
  }
  
  function hideLoadingIndicator() {
    const loader = document.getElementById('neuralforge-loader');
    if (loader) {
      loader.remove();
    }
  }
  
  function showResult(text) {
    const resultModal = document.createElement('div');
    resultModal.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        color: white;
        max-width: 400px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      ">
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0; color: #8b5cf6;">AI Result</h4>
          <button onclick="this.closest('div').remove()" style="
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            font-size: 18px;
            margin-left: auto;
          ">×</button>
        </div>
        <div style="font-size: 14px; line-height: 1.5; color: #d1d5db;">${text}</div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button onclick="navigator.clipboard.writeText('${text.replace(/'/g, '\\'')}')" style="
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 6px;
            color: #8b5cf6;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
          ">Copy</button>
          <button onclick="this.closest('div').remove()" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            color: white;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(resultModal);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (resultModal.parentNode) {
        resultModal.remove();
      }
    }, 10000);
  }
  
  function showError(error) {
    const errorModal = document.createElement('div');
    errorModal.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #7f1d1d 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        padding: 20px;
        color: white;
        max-width: 400px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
      ">
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0; color: #fca5a5;">Error</h4>
          <button onclick="this.closest('div').remove()" style="
            background: none;
            border: none;
            color: #fca5a5;
            cursor: pointer;
            font-size: 18px;
            margin-left: auto;
          ">×</button>
        </div>
        <div style="font-size: 14px; line-height: 1.5;">${error}</div>
      </div>
    `;
    document.body.appendChild(errorModal);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorModal.parentNode) {
        errorModal.remove();
      }
    }, 5000);
  }
})();