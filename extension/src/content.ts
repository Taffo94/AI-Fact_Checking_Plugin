// @ts-nocheck
function injectButton() {
  const actionsBar = document.querySelector('#top-level-buttons-computed, #actions-inner #menu-container, #menu.ytd-video-primary-info-renderer');
  if (!actionsBar || document.querySelector('#checkmate-ai-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'checkmate-ai-btn';
  const id = new URL(window.location.href).searchParams.get('v');
  
  btn.innerHTML = `
    <div style="display:flex; align-items:center; gap:6px; background:#f0f0f0; padding:6px 12px; border-radius:18px; border:none; cursor:pointer; font-weight:500; font-family:Roboto, Arial, sans-serif; font-size:14px; margin-left:8px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
      Analizza con AI
    </div>
  `;

  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentId = new URL(window.location.href).searchParams.get('v');
    chrome.runtime.sendMessage({ action: "openSidePanel" });
    if (currentId) {
      chrome.runtime.sendMessage({ action: "triggerAnalysis", videoId: currentId });
    }
  };

  actionsBar.appendChild(btn);
}

// Watch for changes and use intervals as fallback for SPA navigation
const observer = new MutationObserver(injectButton);
observer.observe(document.body, { childList: true, subtree: true });
setInterval(injectButton, 1000);
injectButton();
