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
  
  function showResult(result) {
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0; color: #8b5cf6;">AI Result</h4>
          <button onclick="this.closest('div').remove()" style="
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            font-size: 18px;
          ">×</button>
        </div>
        <div style="
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
          max-height: 200px;
          overflow-y: auto;
        ">${result}</div>
        <div style="display: flex; gap: 8px;">
          <button onclick="navigator.clipboard.writeText('${result.replace(/'/g, "\\'")}'); this.textContent='Copied!'" style="
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 6px;
            color: #8b5cf6;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
          ">Copy</button>
          <button onclick="window.open('https://neuralforge.com/community/share')" style="
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 6px;
            color: #8b5cf6;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
          ">Share</button>
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
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        color: white;
        max-width: 300px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px;">❌ ${error}</span>
          <button onclick="this.closest('div').remove()" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
          ">×</button>
        </div>
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
  
  // Listen for keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + N to open NeuralForge sidebar
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      toggleSidebar();
    }
  });
  
  function toggleSidebar() {
    if (sidebar) {
      sidebar.remove();
      sidebar = null;
    } else {
      createSidebar();
    }
  }
  
  function createSidebar() {
    sidebar = document.createElement('div');
    sidebar.id = 'neuralforge-sidebar';
    sidebar.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        right: 0;
        width: 380px;
        height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
        backdrop-filter: blur(20px);
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
      " id="sidebar-content">
        <div style="
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 32px;
              height: 32px;
              background: linear-gradient(45deg, #8b5cf6, #ec4899);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            ">🧠</div>
            <div>
              <div style="color: white; font-weight: bold; font-size: 16px;">NeuralForge</div>
              <div style="color: #9ca3af; font-size: 12px;">AI Sidebar</div>
            </div>
          </div>
          <button onclick="this.closest('#neuralforge-sidebar').remove(); sidebar = null;" style="
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 6px;
            color: white;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        
        <div style="flex: 1; padding: 20px; overflow-y: auto;">
          <div style="margin-bottom: 20px;">
            <label style="color: white; font-size: 14px; font-weight: 500; display: block; margin-bottom: 8px;">
              AI Model
            </label>
            <select id="model-select" style="
              width: 100%;
              background: rgba(0, 0, 0, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              color: white;
              padding: 8px 12px;
              font-size: 14px;
            ">
              <option value="gpt-4o">GPT-4o</option>
              <option value="claude-3.5">Claude 3.5</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="color: white; font-size: 14px; font-weight: 500; display: block; margin-bottom: 8px;">
              Your Prompt
            </label>
            <textarea id="prompt-input" placeholder="Ask anything or paste content to analyze..." style="
              width: 100%;
              height: 120px;
              background: rgba(0, 0, 0, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              color: white;
              padding: 12px;
              font-size: 14px;
              resize: vertical;
              font-family: inherit;
            "></textarea>
          </div>
          
          <button id="generate-btn" style="
            width: 100%;
            background: linear-gradient(45deg, #8b5cf6, #ec4899);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 12px;
            font-weight: 500;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 20px;
          ">Generate with AI</button>
          
          <div id="sidebar-result" style="
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px;
            color: white;
            font-size: 14px;
            line-height: 1.5;
            min-height: 100px;
            display: none;
          "></div>
        </div>
        
        <div style="
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        ">
          <button onclick="window.open('https://neuralforge.com')" style="
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            padding: 10px;
            cursor: pointer;
            font-size: 13px;
          ">Open Full App</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(sidebar);
    
    // Animate in
    setTimeout(() => {
      const content = sidebar.querySelector('#sidebar-content');
      content.style.transform = 'translateX(0)';
    }, 10);
    
    // Add functionality
    const generateBtn = sidebar.querySelector('#generate-btn');
    const promptInput = sidebar.querySelector('#prompt-input');
    const modelSelect = sidebar.querySelector('#model-select');
    const resultDiv = sidebar.querySelector('#sidebar-result');
    
    generateBtn.addEventListener('click', async () => {
      const prompt = promptInput.value.trim();
      if (!prompt) return;
      
      generateBtn.disabled = true;
      generateBtn.textContent = 'Generating...';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; border: 2px solid rgba(139, 92, 246, 0.3); border-top: 2px solid #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite;"></div> Processing...</div>';
      
      try {
        const {userToken} = await chrome.storage.sync.get(['userToken']);
        
        if (!userToken) {
          resultDiv.innerHTML = '<div style="color: #ef4444;">Please login to NeuralForge first</div>';
          return;
        }
        
        const response = await fetch('https://api.neuralforge.com/api/v1/ai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            provider: modelSelect.value.includes('gpt') ? 'openai' : modelSelect.value.includes('claude') ? 'anthropic' : 'google',
            model: modelSelect.value,
            prompt: prompt,
            parameters: {
              max_tokens: 1000,
              temperature: 0.7
            }
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          resultDiv.innerHTML = result.result.content.text || result.result.content;
        } else {
          resultDiv.innerHTML = `<div style="color: #ef4444;">Error: ${result.error}</div>`;
        }
        
      } catch (error) {
        resultDiv.innerHTML = `<div style="color: #ef4444;">Failed to generate: ${error.message}</div>`;
      } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate with AI';
      }
    });
  }
})();