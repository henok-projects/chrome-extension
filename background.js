chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "newMessages") {
    // Handle received messages, for example, send to server
    fetch("http://localhost:8000/api/write_messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message.data),
    });
  }
});

// This script runs in the background and can interact with content scripts
chrome.runtime.onInstalled.addListener(() => {
  // Perform some initialization if necessary
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMessageInfoFromContent") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getMessageInfo" },
        (response) => {
          console.log(response);
        }
      );
    });
  }
});
