function readWhatsAppMessages() {
  // This function needs to be adapted to the actual structure of WhatsApp Web.
  const messages = [];
  const messageElements = document.querySelectorAll(
    ".message-in, .message-out"
  );
  messageElements.forEach((messageElement) => {
    // Extract text content or any other relevant data from message elements
    const messageText =
      messageElement.querySelector(".copyable-text").textContent;
    messages.push(messageText);
  });
  return messages;
}

function sendWhatsAppMessage(message) {
  // This function simulates typing a message into the WhatsApp Web input field and pressing enter to send.
  const inputField = document.querySelector('div[contenteditable="true"]');
  if (inputField) {
    // Focus the input field
    inputField.focus();
    // Dispatch input event for each character in the message
    message.split("").forEach((char) => {
      const event = new InputEvent("input", { bubbles: true });
      inputField.textContent += char;
      inputField.dispatchEvent(event);
    });
    // Dispatch the enter key event to send the message
    const enterEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      key: "Enter",
      keyCode: 13,
      which: 13,
    });
    inputField.dispatchEvent(enterEvent);
  }
}

function readSkypeMessages() {
  const messages = [];
  const messageElements = document.querySelectorAll(".messageBubbleContent"); // Placeholder selectors
  messageElements.forEach((messageElement) => {
    messages.push(messageElement.textContent);
  });
  return messages;
}

function sendSkypeMessage(message) {
  const inputField = document.querySelector(".send-message-textarea");
  if (inputField) {
    inputField.value = message;
    const event = new Event("input", { bubbles: true });
    inputField.dispatchEvent(event);
    const sendButton = document.querySelector(".send-button-selector"); // Skype might require a button click event to send the message
    sendButton.click();
  }
}

function readTelegramMessages() {
  const messages = [];
  const messageElements = document.querySelectorAll(".im_message_text"); // Placeholder selectors
  messageElements.forEach((messageElement) => {
    messages.push(messageElement.textContent.trim());
  });
  return messages;
}

function sendTelegramMessage(message) {
  const inputField = document.querySelector(".composer_rich_textarea"); // Placeholder
  if (inputField) {
    inputField.textContent = message;
    const event = new Event("input", { bubbles: true });
    inputField.dispatchEvent(event);
    const sendButton = document.querySelector(".im_submit");
    sendButton.click();
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readMessages") {
    const messages = readWhatsAppMessages();
    sendResponse({ messages: messages });
  } else if (request.action === "sendMessages") {
    sendWhatsAppMessage(request.message);
    sendResponse({ status: "Message sent" });
  }
  return true; // Keep the message channel open for the response
});
