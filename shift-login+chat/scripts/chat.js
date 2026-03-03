
// Assignment: Bull-Shift App | Chatbox Script - JS
// Author: Luke Callahan

// DOM elements
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loggedInDiv = document.getElementById("loggedin-user");
const logoutButton = document.getElementById("logoutButton");

// DEBUG
console.log("messagesDiv:", messagesDiv);
console.log("input:", input);
console.log("sendButton:", sendButton);
console.log("loggedInDiv:", loggedInDiv);
console.log("logoutButton:", logoutButton);

// Global variable to store current user
let username = "";

// 1. pull logged in user from lS
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

console.log("currentUser:", currentUser); // DEBUG

if (!currentUser) {
  console.log("No user found, redirecting to login");
  window.location.href = "login.html";
} else {
  // 2. set username to chat
  username = currentUser.username;
  console.log("Username set to:", username); // DEBUG

  // 3. enable inputs
  input.disabled = false;
  sendButton.disabled = false;

  // 4. display username + @bshift
  loggedInDiv.textContent = username + "@bshift";

  // 5. load messages from lS (WILL BE REPLACED WITH DB)
  loadMessages();
}

// function to get current timestamp
function getTimestamp() {
  const now = new Date();
  return now.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// function to create a message element
function createMessageElement(username, text, timestamp) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";

  // timestamp element
  const timestampSpan = document.createElement("span");
  timestampSpan.className = "timestamp";
  timestampSpan.textContent = `[${timestamp}]\u00A0`;

  // username element
  const usernameSpan = document.createElement("span");
  usernameSpan.className = "username";
  usernameSpan.textContent = username + ":";

  // text element
  const textSpan = document.createElement("span");
  textSpan.textContent = text;

  // appends
  messageDiv.appendChild(timestampSpan);
  messageDiv.appendChild(usernameSpan);
  messageDiv.appendChild(textSpan);

  return messageDiv;
}

// function to send a message
function sendMessage() {
  const text = input.value.trim();
  if (text === "") return;

  const timestamp = getTimestamp();
  const messageElement = createMessageElement(username, text, timestamp);

  // save message to lS (WILL BE REPLACED WITH DB)
  messagesDiv.appendChild(messageElement);
  saveMessage(username, text, timestamp);

  // reset input field after message send
  input.value = "";

  console.log("input cleared, value is now:", input.value); // DEBUG
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// function to save message to localStorage (WILL BE REPLACED WITH DB)
function saveMessage(username, text, timestamp) {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push({ username, text, timestamp });
  localStorage.setItem("messages", JSON.stringify(messages));
}

// function to load saved messages from localStorage (WILL BE REPLACED WITH DB)
function loadMessages() {
  const savedMessages = JSON.parse(localStorage.getItem("messages")) || [];

  savedMessages.forEach((msg) => {
    const messageElement = createMessageElement(
      msg.username,
      msg.text,
      msg.timestamp,
    );
    messagesDiv.appendChild(messageElement);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// logout handler
logoutButton.addEventListener("click", () => {
  // clear current user from lS
  localStorage.removeItem("currentUser");

  // redirect to login
  window.location.href = "login.html";
});

// event listeners for message sending
sendButton.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
