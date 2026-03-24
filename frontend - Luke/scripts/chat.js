// Assignment: Bull-Shift App | Chatbox Script - JS
// Author: Luke Callahan

// DOM elements
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loggedInDiv = document.getElementById("loggedin-user");
const logoutButton = document.getElementById("logoutButton");
const userListDiv = document.getElementById("user-list");
const imageInput = document.getElementById("imageInput");
const imageButton = document.getElementById("imageButton");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

// Global variables
let username = "";
let activeChat = null;

// --- AUTH ---
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "login.html";
} else {
  username = currentUser.username;
  input.disabled = false;
  sendButton.disabled = false;
  loggedInDiv.textContent = username + "@bshift";
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

// --- IMAGE → BASE64 ---
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

// --- CREATE MESSAGE ELEMENT ---
function createMessageElement(messageUsername, text, timestamp, image) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";

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

  messageDiv.appendChild(timestampSpan);
  messageDiv.appendChild(usernameSpan);

  if (text) {
    const textSpan = document.createElement("span");
    textSpan.textContent = text;
    messageDiv.appendChild(textSpan);
  }

  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.className = "chat-image";
    img.style.maxWidth = "200px";
    img.style.display = "block";
    img.style.marginTop = "5px";
    messageDiv.appendChild(img);
  }

  return messageDiv;
}

// --- CHAT KEY ---
function getChatKey(userA, userB) {
  return "messages_" + [userA, userB].sort().join("_");
}

// --- SEND MESSAGE (UPDATED) ---
async function sendMessage() {
  if (!activeChat) {
    alert("Select a user to chat with first.");
    return;
  }

  const text = input.value.trim();
  const file = imageInput.files[0];

  if (!text && !file) return;

  const timestamp = getTimestamp();
  let imageData = null;

  if (file) {
    imageData = await toBase64(file);
  }

  const messageElement = createMessageElement(
    username,
    text,
    timestamp,
    imageData
  );

  messagesDiv.appendChild(messageElement);
  saveMessage(username, text, imageData, timestamp);

  input.value = "";
  imageInput.value = "";
  imagePreviewContainer.innerHTML = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// --- SAVE MESSAGE ---
function saveMessage(username, text, image, timestamp) {
  const chatKey = getChatKey(username, activeChat);
  const messages = JSON.parse(localStorage.getItem(chatKey)) || [];

  messages.push({ username, text, image, timestamp });

  localStorage.setItem(chatKey, JSON.stringify(messages));
}

// --- LOAD MESSAGES ---
function loadMessages() {
  messagesDiv.innerHTML = "";

  if (!activeChat) return;

  const chatKey = getChatKey(username, activeChat);
  const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];

  savedMessages.forEach((msg) => {
    const messageElement = createMessageElement(
      msg.username,
      msg.text,
      msg.timestamp,
      msg.image
    );
    messagesDiv.appendChild(messageElement);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// --- USER LIST ---
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

      document
        .querySelectorAll(".user-item")
        .forEach((el) => el.classList.remove("active"));
      userItem.classList.add("active");

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

// --- EVENTS ---
sendButton.addEventListener("click", sendMessage);

imageButton.addEventListener("click", () => {
  imageInput.click();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  // Clear any existing preview
  imagePreviewContainer.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "preview-wrapper";

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.className = "preview-image";

  // Optional: remove button
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "✖";
  removeBtn.className = "remove-preview";

  removeBtn.addEventListener("click", () => {
    imageInput.value = "";
    imagePreviewContainer.innerHTML = "";
  });

  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  imagePreviewContainer.appendChild(wrapper);
});