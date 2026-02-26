// ERROR OVERLAY - Inject this to see console errors on-screen
(function() {
  const errorLog = [];
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-height: 300px;
    background: rgba(255,0,0,0.95);
    color: white;
    padding: 20px;
    font-family: monospace;
    font-size: 12px;
    z-index: 999999;
    overflow-y: auto;
    border-bottom: 5px solid yellow;
  `;
  
  overlay.innerHTML = `
    <strong style="font-size:16px">🚨 ERROR LOGGER</strong><br><br>
    <div id="error-list">Waiting for errors...</div>
    <br><button onclick="this.parentElement.remove()" style="padding:5px 10px;background:#fff;color:#000;border:none;cursor:pointer">Close</button>
  `;
  
  document.body.appendChild(overlay);
  const errorList = document.getElementById('error-list');
  
  // Intercept console.error
  const originalError = console.error;
  console.error = function(...args) {
    originalError.apply(console, args);
    errorLog.push(args.join(' '));
    errorList.innerHTML = errorLog.map((e,i) => `${i+1}. ${e}`).join('<br>');
  };
  
  // Intercept window.onerror
  window.onerror = function(msg, url, line, col, error) {
    const errorMsg = `Error: ${msg} at ${url}:${line}:${col}`;
    errorLog.push(errorMsg);
    errorList.innerHTML = errorLog.map((e,i) => `${i+1}. ${e}`).join('<br>');
    return false;
  };
  
  // Check if tabs are clickable
  setTimeout(() => {
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length > 0) {
      errorList.innerHTML += `<br><br><strong style="color:yellow">✓ Found ${tabs.length} tabs</strong><br>`;
      
      const tab1Style = getComputedStyle(tabs[0]);
      errorList.innerHTML += `pointer-events: ${tab1Style.pointerEvents}<br>`;
      errorList.innerHTML += `z-index: ${tab1Style.zIndex}<br>`;
      errorList.innerHTML += `cursor: ${tab1Style.cursor}<br>`;
      
      // Test click
      tabs[0].addEventListener('click', () => {
        errorList.innerHTML += `<br><span style="color:#0f0">✓ TAB 1 CLICKED!</span>`;
      });
      
      errorList.innerHTML += `<br><strong>Try clicking Tab 1...</strong>`;
    } else {
      errorList.innerHTML += `<br><span style="color:red">✗ NO TABS FOUND!</span>`;
    }
  }, 2000);
  
  console.log('Error overlay loaded');
})();
