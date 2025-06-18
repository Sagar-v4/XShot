chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CREATE_SNAPSHOT") {
    // 1. Store the tweet data in chrome.storage.local
    // This is the best way to pass data between scripts and tabs.
    chrome.storage.local.set({ tweetDataForSnapshot: request.data }, () => {
      // 2. Open the editor.html page in a new tab
      chrome.tabs.create({
        url: chrome.runtime.getURL("editor/editor.html"),
      });
    });
  }
  return true; // Indicates you wish to send a response asynchronously
});
