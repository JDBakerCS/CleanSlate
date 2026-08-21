chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === "CLEANSLATE_AUTH_SUCCESS") {
    chrome.storage.local.set({ sessionToken: message.token }, () => {
      // tell any open side panel to re-check auth now, instead of relying
      // on it to notice on its own - no listener being open yet is fine
      chrome.runtime.sendMessage({ type: "CLEANSLATE_AUTH_UPDATED" }).catch(() => {});
    });

    // the callback page can't close itself (window.close() is refused for
    // tabs it didn't open itself), but we can close it from here
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  }

  sendResponse();
});
