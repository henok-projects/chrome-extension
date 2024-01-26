////////////////////////////////////// scan message from the input field /////////////////////////
document.addEventListener("DOMContentLoaded", function () {
  const scanBtn = document.getElementById("scanMessages");
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
});

////////////////////////////////////// Function to scan for messages in the current tab /////////////////////////
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

/////////////////////////////////// Function to update the popup with scanned messages //////////////////////////
function updatePopupWithMessages(messages) {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = ""; // Clear previous messages
  messages.forEach((msg) => {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = msg;
    messagesDiv.appendChild(msgDiv);
  });
}

////////////////////////////////// Function to send a message to the content script //////////////////////////////
function sendMessageToWhatsApp(message) {
  const inputSelector = 'div._3Uu1_ div[data-tab="10"][contenteditable="true"]';
  const inputField = document.querySelector(inputSelector);

  if (inputField) {
    inputField.focus();
    document.execCommand("insertText", false, message);
    inputField.dispatchEvent(new Event("input", { bubbles: true }));
    inputField.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sendMessageButton = document.getElementById("sendMessageButton");
  const messageInput = document.getElementById("messageInput");

  sendMessageButton.addEventListener("click", () => {
    const messageToSend = messageInput.value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          function: sendMessageToWhatsApp,
          args: [messageToSend],
        },
        () => {
          console.log("Message sent to WhatsApp");
        }
      );
    });
  });
});

///////////////////////////////////////// fetchMessages /////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const messagesDisplay = document.getElementById("messagesDisplay"); // Your field to display messages

  function fetchAndDisplayMessages() {
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
  }

  // Call the function to fetch messages when DOM is loaded
  fetchAndDisplayMessages();
});

///////////////////////// Function to send messages and statuses to FastAPI ////////////////////////
function sendMessagesAndStatusToFastAPI(messages, statuses) {
  const fastAPIUrl = "http://your-fastapi-server/api/send_messages_and_status";

  // Create a request object
  const request = {
    messages: messages,
    statuses: statuses,
  };

  // Send the request to FastAPI
  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Message status sent to FastAPI:", data);
    })
    .catch((error) => {
      console.error("Error sending message status to FastAPI:", error);
    });
}

////////////////////// Listen for messages from content.js /////////////////////
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendMessagesAndStatus") {
    const messages = request.messages;
    const statuses = request.statuses;

    // Send messages and statuses to FastAPI
    sendMessagesAndStatusToFastAPI(messages, statuses);
  }
});

////////////////// Function to send a message to content.js to get message statuses //////////////////
document.getElementById("checkStatus").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "checkStatus" },
      function (response) {
        document.getElementById("status").innerText = response.status;
      }
    );
  });
});

////////////////////////////// fetch Skype chat history //////////////////////
document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { message: "fetchChatHistory" },
      function (response) {
        if (response && response.chatHistory) {
          document.getElementById("chatHistory").value =
            response.chatHistory.join("\n");
        }
      }
    );
  });
});

////////////////////////// Function to send a message to the Skype content script /////////////////////
function sendMessageToSkype(message) {
  const inputSelector =
    'div.public-DraftEditor-content[contenteditable="true"]';
  const inputField = document.querySelector(inputSelector);

  if (inputField) {
    // Focus on the input field
    inputField.focus();

    // Simulate typing the message
    document.execCommand("insertText", false, message);

    // Trigger input event
    inputField.dispatchEvent(new Event("input", { bubbles: true }));

    // Press Enter to send the message
    inputField.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sendMessageButton = document.getElementById("sendMessageButton"); // Ensure you have this button in your popup.html
  const messageInput = document.getElementById("messageInput"); // And this input field

  sendMessageButton.addEventListener("click", () => {
    const messageToSend = messageInput.value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          function: sendMessageToSkype,
          args: [messageToSend],
        },
        () => {
          console.log("Message sent to Skype");
        }
      );
    });
  });
});
