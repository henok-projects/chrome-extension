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
