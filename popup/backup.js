document.addEventListener("DOMContentLoaded", function () {
  // Element to trigger scanning for messages
  const scanBtn = document.getElementById("scanMessages");
  // Container to display messages
  const messagesDiv = document.getElementById("messages");

  // Add event listener to the scan button
  if (scanBtn) {
    scanBtn.addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (
          tabs[0] &&
          (tabs[0].url.startsWith("http") || tabs[0].url.startsWith("https"))
        ) {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              function: scanForMessagesInTab,
            },
            (injectionResults) => {
              if (
                Array.isArray(injectionResults) &&
                injectionResults.length > 0
              ) {
                for (const frameResult of injectionResults) {
                  if (frameResult.result) {
                    updatePopupWithMessages(frameResult.result);
                  }
                }
              }
            }
          );
        } else {
          messagesDiv.textContent =
            "This page does not support message scanning.";
        }
      });
    });
  }

  // Send Message Button
  if (sendMessageButton && messageInputField) {
    sendMessageButton.addEventListener("click", function () {
      const messageToSend = messageInputField.value;
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].url.includes("web.whatsapp.com")) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: sendMessageToWhatsApp,
            args: [messageToSend],
          });
        } else {
          console.error("You must be on WhatsApp Web to send a message.");
        }
      });
    });
  } else {
    console.error(
      'The element with id "sendMessageButton" or "messageInputField" was not found.'
    );
  }

  // Your other code for fetching messages, etc...
});

// Function to scan for messages in the current tab
function scanForMessagesInTab() {
  const messages = [];
  const messageContainers = document.querySelectorAll(
    '.copyable-text[data-lexical-text="true"]'
  );
  messageContainers.forEach((container) => {
    messages.push(container.innerText);
  });
  return messages;
}

// Function to update the popup with scanned messages
function updatePopupWithMessages(messages) {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = ""; // Clear previous messages
  messages.forEach((msg) => {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = msg;
    messagesDiv.appendChild(msgDiv);
  });
}

function sendMessageToWhatsApp(messageToSend) {
  const inputEvent = new InputEvent("input", { bubbles: true });
  const chatBox = document.querySelector(
    '[contenteditable="true"][spellcheck="true"]'
  ); // Updated selector
  if (chatBox) {
    // Focus the chat box before setting the message
    chatBox.focus();
    // Set innerText instead of innerHTML to mimic text typing
    document.execCommand("insertText", false, messageToSend);
    chatBox.dispatchEvent(inputEvent);

    // Simulate "Enter" press to send the message
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
    });
    chatBox.dispatchEvent(enterEvent);
  }
}

// Add event listener to the send message button
if (sendMessageButton) {
  sendMessageButton.addEventListener("click", function () {
    const messageToSend = document.getElementById("messageInputField").value; // Get the message to send
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Ensure there's an active tab and it's WhatsApp Web
      if (tabs[0] && tabs[0].url.includes("web.whatsapp.com")) {
        // Correctly use chrome.scripting.executeScript inside the callback
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: sendMessageToWhatsApp,
          args: [messageToSend],
        });
      } else {
        console.error("You must be on WhatsApp Web to send a message.");
      }
    });
  });
} else {
  console.error('The element with id "sendMessageButton" was not found.');
}

//fetch messages
document.addEventListener("DOMContentLoaded", () => {
  const fetchMessagesButton = document.getElementById("fetchMessages"); // Your button to fetch messages
  const messagesDisplay = document.getElementById("messagesDisplay"); // Your field to display messages

  fetchMessagesButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getMessages" },
        (response) => {
          if (response && response.messages) {
            // Join messages and display them
            messagesDisplay.value = response.messages.join("\n");
          }
        }
      );
    });
  });
});

// send message to whatsapp
document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("sendMessageButton"); // Your "Send" button
  const messageInput = document.getElementById("messageInput"); // Your input field for the message

  sendButton.addEventListener("click", function () {
    const message = messageInput.value; // Get the message from input
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "sendMessage", message: message },
        function (response) {
          console.log(response.status);
        }
      );
    });
  });
});
