/////////////////// function to extractMessages //////////////////////////
function extractMessages() {
  const messageContainers = document.querySelectorAll(
    '.copyable-text[data-lexical-text="true"]'
  );
}

// Run the extractMessages function when the script is loaded
extractMessages();

// Set up a MutationObserver to watch for changes if new messages appear dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes) {
      extractMessages(); // Re-run the extractMessages function to get new messages
    }
  });
});

// Start observing the document for changes in the DOM
const config = { childList: true, subtree: true };
observer.observe(document, config);

/////////////////// function to fetch and display messages/chat history //////////////////////////
function extractWhatsAppMessages() {
  const messages = [];
  const seen = new Set(); // Set to keep track of seen messages

  // Query for message elements
  document.querySelectorAll(".copyable-text span").forEach((span) => {
    const text = span.textContent.trim();

    // Check if the message text is not empty and not already seen
    if (text && !seen.has(text)) {
      seen.add(text); // Mark this message as seen
      messages.push(text);
    }
  });

  return messages;
}

// Listen for the popup to request messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMessages") {
    const messages = extractWhatsAppMessages();
    sendResponse({ messages });
  }
});

function sendMessageToWhatsApp(message) {
  const whatsappInputField = document.querySelector(
    'div._3Uu1_ div[data-tab="10"][contenteditable="true"]'
  );
  const sendButton = document.querySelector('button[aria-label="Send"]'); // Selector for the send button, adjust if necessary

  if (whatsappInputField && sendButton && message.trim() !== "") {
    whatsappInputField.focus(); // Focus on the input field
    document.execCommand("insertText", false, message); // Set the message
    whatsappInputField.dispatchEvent(new Event("input", { bubbles: true })); // Dispatch input event

    if (whatsappInputField.textContent.trim() !== "") {
      sendButton.click(); // Click the send button to send the message
    }
  }
}

//////////////////////// Listen for messages from the popup script /////////////////////////
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.action === "sendMessageToWhatsApp" &&
    message.message.trim() !== ""
  ) {
    sendMessageToWhatsApp(message.message);
  }
});

////////////////// Read message status //////////////////////
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "checkStatus") {
    let statusElement = document.querySelector('[data-icon="msg-dblcheck"]');
    let status = "Not Found";
    if (statusElement) {
      let ariaLabel = statusElement
        .getAttribute("aria-label")
        .trim()
        .toLowerCase();

      if (ariaLabel === "read") {
        status = "Read";
      } else if (ariaLabel === "sent") {
        status = "Sent";
      } else if (ariaLabel === "delivered") {
        status = "Delivered";
      }
    }

    sendResponse({ status: status });
  }
});

///////////////////// Extract Skype messages //////////////////////
function extractMessages() {
  const messages = [];
  const messageElements = document.querySelectorAll(
    'div[role="none"] > div[role="none"] > div[dir="auto"]'
  );

  messageElements.forEach((element) => {
    const message = element.textContent.trim(); // Extracting the text content
    if (message) {
      messages.push(message);
    }
  });

  return messages;
}

///////// Skype message listener /////////////////
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "fetchChatHistory") {
    const chatHistory = extractMessages(); // Assume this function exists and fetches chat messages
    sendResponse({ chatHistory: chatHistory });
  }
});

const chatMessages = extractMessages();
console.log(chatMessages);

/////////// Handle Dynamic Content Loading //////
const observers = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      const newMessages = extractMessages();
      console.log(newMessages);
    }
  });
});

const configs = { childList: true, subtree: true };

const targetNode = document.querySelector('div[role="main"]'); // You might need to adjust this selector
if (targetNode) {
  observers.observe(targetNode, configs);
}

/////////////// send message automatically to Skype //////////////////////////////////
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.text) {
    // Insert the message into the chat input field
    const inputSelector =
      'div.public-DraftEditor-content[contenteditable="true"]'; // Adjust as needed
    const inputField = document.querySelector(inputSelector);
    if (inputField) {
      inputField.focus();
      document.execCommand("insertText", false, msg.text);
    }

    // Find and click the send button
    const sendButtonSelector = 'button[title="Send message"][role="button"]';
    const sendButton = document.querySelector(sendButtonSelector);
    if (sendButton) {
      sendButton.click();
    }
  }
});
