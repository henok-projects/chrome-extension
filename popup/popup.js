document.getElementById("message").addEventListener("click", () => {
  // Query the active tab to inject the content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      function: readMessagesFromTab,
    });
  });
});

// Function that will be executed in the context of the current tab
function readMessagesFromTab() {
  // Send a message to the content script in the active tab
  chrome.runtime.sendMessage({ action: "readMessages" }, (response) => {
    // Handle the response from the content script
    console.log("Messages from the content script:", response.data);
  });
}
