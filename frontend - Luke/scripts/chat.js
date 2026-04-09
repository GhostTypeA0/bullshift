// Assignment: Bull-Shift App | Chatbox Script v.8 (I think) - JS
// Author: Luke Callahan


// Section 1: DOM elements & global variables
// DOM elements
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatPartnerDiv = document.getElementById("chat-partner");
const logoutButton = document.getElementById("logoutButton");
const userListDiv = document.getElementById("user-list");
const imageInput = document.getElementById("imageInput");
const imageButton = document.getElementById("imageButton");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

// global variables
let username = "";
let activeChat = null;

// Section 2: Auth Check
// logged in user check
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// if no user, go back to login page, else, update page elements
if (!currentUser) {
  window.location.href = "login.html";
} else {
  username = currentUser.username;
  input.disabled = false;
  sendButton.disabled = false;
  chatPartnerDiv.textContent = "Select a User to Start Chatting!";
  renderUserList();
}

// Section 3: Timestamp generator + img to Base64
// timestamp function
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

// base64 converter function (basically image to URL link)
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

// Section 4: Create message element
// message element gen function
function createMessageElement(messageUsername, text, timestamp, image) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";

  // stylings
  if (messageUsername === username) {
    messageDiv.classList.add("sent"); // styled in blue
  } else {
    messageDiv.classList.add("received"); // styled in grey
  }

  // gen timestamp element
  const timestampSpan = document.createElement("span");
  timestampSpan.className = "timestamp";
  timestampSpan.textContent = `[${timestamp}]\u00A0`;

  // gen user element
  const usernameSpan = document.createElement("span");
  usernameSpan.className = "username";
  usernameSpan.textContent = messageUsername + ":";

  messageDiv.appendChild(timestampSpan);
  messageDiv.appendChild(usernameSpan);

  // gen message element
  if (text) {
    const textSpan = document.createElement("span");
    textSpan.textContent = text;
    messageDiv.appendChild(textSpan);
  }

  // gen img element
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

// Section 5: ChatKey generator
function getChatKey(userA, userB) {
  return "messages_" + [userA, userB].sort().join("_");
}

// Section 6: Message sender
async function sendMessage() {
  if (!activeChat) {
    alert("Select a user to chat with first."); // self explanitory I think
    return;
  }

  // message/input values/files
  const text = input.value.trim(); // prevents empty message
  const file = imageInput.files[0]; // access selected file

  if (!text && !file) return;

  // gen timestamp for message
  const timestamp = getTimestamp();
  let imageData = null;

  if (file) {
    imageData = await toBase64(file); // base64 converter
  }

  // gen message
  const messageElement = createMessageElement(
    username,
    text,
    timestamp,
    imageData
  );

  // sned message
  messagesDiv.appendChild(messageElement);
  saveMessage(username, text, imageData, timestamp);

  // resets
  input.value = "";
  imageInput.value = "";
  imagePreviewContainer.innerHTML = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Section 7: Save & load messages
// save messages function
function saveMessage(username, text, image, timestamp) {
  const chatKey = getChatKey(username, activeChat);
  const messages = JSON.parse(localStorage.getItem(chatKey)) || [];

  // push message to lS
  messages.push({ username, text, image, timestamp });

  // save key to lS
  localStorage.setItem(chatKey, JSON.stringify(messages));
}

// load messages function
function loadMessages() {
  messagesDiv.innerHTML = "";

  // pull message from lS
  if (!activeChat) return;

  const chatKey = getChatKey(username, activeChat);
  const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];

  // create elements for each pull
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

// Section 8: User list (aside element)
// render user-list
function renderUserList() {
  const users = JSON.parse(localStorage.getItem("users")) || []; // this needs to change to work in middle tier
  userListDiv.innerHTML = "";

  const otherUsers = users.filter((u) => u.username !== username);

  // no users? :(
  if (otherUsers.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No other users found.";
    empty.className = "no-users";
    userListDiv.appendChild(empty);
    return;
  }

  // yes users? :D
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

      input.placeholder = `message ${activeChat}@bshift...`; // eg. "message dev.callahan@bshift..."
      chatPartnerDiv.textContent = activeChat + "@bshift";

      // calls message loader
      loadMessages();
    });

    userListDiv.appendChild(userItem);
  });
}

// Section 9: Event handlers
// send message handler
sendButton.addEventListener("click", sendMessage);

imageButton.addEventListener("click", () => {
  imageInput.click();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// image handler
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  // clear preview
  imagePreviewContainer.innerHTML = "";

  // create preview
  const wrapper = document.createElement("div");
  wrapper.className = "preview-wrapper";

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.className = "preview-image";

  // remove image (in case you don't want to send it)
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "✖";
  removeBtn.className = "remove-preview";

  removeBtn.addEventListener("click", () => {
    imageInput.value = "";
    imagePreviewContainer.innerHTML = "";
  });

  // wrappers
  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  imagePreviewContainer.appendChild(wrapper);
});