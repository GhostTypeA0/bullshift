// Assignment: Bull-Shift App | Chatbox Script v.8 (I think) - JS
// Author: Luke Callahan, Saiyan Ren
/* Author of this comment style: Saiyan Ren */


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

// --- SECTION 4: Create message element ---
function createMessageElement(messageUsername, text, timestamp, image) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    const deleteBtn = document.createElement("button");

    /* unsend/delete button */
    if (messageUsername === username) {
      messageDiv.classList.add("sent");
      deleteBtn.textContent = "✖";
      deleteBtn.className = "unsend-btn";
      deleteBtn.title = "Unsend message";
      deleteBtn.onclick = () => unsendMessage(timestamp);
      messageDiv.appendChild(deleteBtn);
    } else {
      messageDiv.classList.add("received");
    }

    const timestampSpan = document.createElement("span");
    timestampSpan.className = "timestamp";
    timestampSpan.textContent = `[${timestamp}]\u00A0`;
    
    /* shows hover date of when the message was sent */
    const messageDate = new Date(timestamp);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    timestampSpan.title = `[ ${messageDate.toLocaleString(undefined, options)} ]`;

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

/* unsend message confirmation */
function unsendMessage(timestamp) {
  if (!confirm("Are you sure you want to unsend this message?")) return;
  const chatKey = getChatKey(username, activeChat);
  let messages = JSON.parse(localStorage.getItem(chatKey)) || [];
  messages = messages.filter(msg => msg.timestamp !== timestamp);
  localStorage.setItem(chatKey, JSON.stringify(messages));
  loadMessages();
}

// --- SECTION 5: ChatKey generator ---
function getChatKey(userA, userB) {
  return "messages_" + [userA, userB].sort().join("_");
}

// --- SECTION 6: Message sender ---
async function sendMessage() {
    if (!activeChat) {
      alert("Select a user to chat with first.");
      return;
    }

    /* enforces 500 character limit on the logic side for messages */
    const rawText = input.value.trim();
    const text = rawText.substring(0, 500); 
    
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

    // resets
    input.value = "";
    imageInput.value = "";
    imagePreviewContainer.innerHTML = "";
    if (typeof updateCharCount === "function") updateCharCount(); // resets character counter
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// --- SECTION 7: Save & load messages ---
function saveMessage(username, text, image, timestamp) {
    const chatKey = getChatKey(username, activeChat);
    const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
    messages.push({ username, text, image, timestamp });
    localStorage.setItem(chatKey, JSON.stringify(messages));
}

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

// --- SECTION 8: User list (aside element) ---
function renderUserList() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    userListDiv.innerHTML = "";
    let otherUsers = users.filter((u) => u.username !== username);

    otherUsers.sort((a, b) => {
      if (a.username === activeChat) return -1;
      if (b.username === activeChat) return 1;
      return 0;
    });

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
      if (user.username === activeChat) userItem.classList.add("active");
      userItem.textContent = user.username;
      userItem.addEventListener("click", () => {
      activeChat = user.username;
      renderUserList();
      input.placeholder = `message ${activeChat}@bshift...`;
      chatPartnerDiv.textContent = activeChat + "@bshift";
      loadMessages();
    });
      userListDiv.appendChild(userItem);
  });
}

// Section 9: Event handlers

/* messasge character limit */
input.maxLength = 500;

/* character counting logic */
function updateCharCount() {
  const counter = document.getElementById("char-counter");
    if (counter) {
      const remaining = input.value.length;
      counter.textContent = `${remaining}/500`;
      counter.style.color = remaining >= 500 ? "red" : "gray";
    }
}

input.addEventListener("input", updateCharCount);

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
