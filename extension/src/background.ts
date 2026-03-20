// @ts-nocheck
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "openSidePanel") {
    chrome.sidePanel.open({ tabId: sender.tab?.id, windowId: sender.tab?.windowId });
  }
});
