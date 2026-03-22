// Assignment: Bull-Shift App | Chatbox Script - JS
// Author: Luke Callahan

// DOM elements
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loggedInDiv = document.getElementById("loggedin-user");
const logoutButton = document.getElementById("logoutButton");
const userListDiv = document.getElementById("user-list"); // NEW - right side panel

// Global variables
let username = "";
let activeChat = null; // currently selected user to chat with

// 1. Pull logged in user from localStorage
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "login.html";
} else {
  // 2. Set username
  username = currentUser.username;

  // 3. Enable inputs
  input.disabled = false;
  sendButton.disabled = false;

  // 4. Display username
  loggedInDiv.textContent = username + "@bshift";

  // 5. Render user list
  renderUserList();
}

// --- TIMESTAMP ---
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

// --- CREATE MESSAGE ELEMENT ---
// Update createMessageElement to accept a parameter for message origin
function createMessageElement(messageUsername, text, timestamp) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";

  // If the message is from the current user, add "sent" class, otherwise "received"
  if (messageUsername === username) {
    messageDiv.classList.add("sent");
  } else {
    messageDiv.classList.add("received");
  }

  const timestampSpan = document.createElement("span");
  timestampSpan.className = "timestamp";
  timestampSpan.textContent = `[${timestamp}]\u00A0`;

  const usernameSpan = document.createElement("span");
  usernameSpan.className = "username";
  usernameSpan.textContent = messageUsername + ":";

  const textSpan = document.createElement("span");
  textSpan.textContent = text;

  messageDiv.appendChild(timestampSpan);
  messageDiv.appendChild(usernameSpan);
  messageDiv.appendChild(textSpan);

  return messageDiv;
}

// --- GET UNIQUE CHAT KEY ---
// Sorts both usernames alphabetically so user1_user2 and user2_user1
// always resolve to the same key regardless of who opened the chat
function getChatKey(userA, userB) {
  return "messages_" + [userA, userB].sort().join("_");
}

// --- SEND MESSAGE ---
function sendMessage() {
  if (!activeChat) {
    alert("Select a user to chat with first.");
    return;
  }

  const text = input.value.trim();
  if (text === "") return;

  const timestamp = getTimestamp();
  const messageElement = createMessageElement(username, text, timestamp);

  messagesDiv.appendChild(messageElement);
  saveMessage(username, text, timestamp);

  input.value = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// --- SAVE MESSAGE TO LOCALSTORAGE ---
// Saves to a chat-specific key instead of a global "messages" key
function saveMessage(username, text, timestamp) {
  const chatKey = getChatKey(username, activeChat);
  const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
  messages.push({ username, text, timestamp });
  localStorage.setItem(chatKey, JSON.stringify(messages));
}

// --- LOAD MESSAGES FOR ACTIVE CHAT ---
function loadMessages() {
  messagesDiv.innerHTML = ""; // Clear current messages

  if (!activeChat) return;

  const chatKey = getChatKey(username, activeChat);
  const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];

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

// --- RENDER USER LIST ---
// Pulls all users from localStorage and renders them in the right panel
// Excludes the currently logged-in user from the list
function renderUserList() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  userListDiv.innerHTML = "";

  const otherUsers = users.filter((u) => u.username !== username);

  if (otherUsers.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No other users found.";
    empty.className = "no-users";
    userListDiv.appendChild(empty);
    return;
  }

  otherUsers.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className = "user-item";
    userItem.textContent = user.username;

    userItem.addEventListener("click", () => {
      activeChat = user.username;

      // Highlight selected user
      document
        .querySelectorAll(".user-item")
        .forEach((el) => el.classList.remove("active"));
      userItem.classList.add("active");

      // UPDATE PLACEHOLDER instead of header
      input.placeholder = `message ${activeChat}@bshift...`;

      loadMessages();
    });

    userListDiv.appendChild(userItem);
  });
}

// --- LOGOUT ---
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

// --- EVENT LISTENERS ---
sendButton.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
