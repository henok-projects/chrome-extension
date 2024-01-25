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

/////////////////// function to read sentout messages //////////////////////////
function extractWhatsAppMessages() {
  const messages = [];
  // Query for message elements
  document.querySelectorAll(".copyable-text span").forEach((span) => {
    // Check if the message text matches not empty
    if (span.textContent != "") {
      messages.push(span.textContent);
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

    // Check if the input field has content after inserting the message
    if (whatsappInputField.textContent.trim() !== "") {
      sendButton.click(); // Click the send button to send the message
    }
  }
}

// Listen for messages from the popup script
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

    // Check if the status element is found
    if (statusElement) {
      // Check the aria-label attribute for the status (trim and make it case-insensitive)
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
