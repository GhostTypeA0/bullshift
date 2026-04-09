// Assignment: Bull-Shift App | Index Script - JS
// Author: Luke Callahan


// Section 1: DOM elements & global variables
// DOM elements
const btnChat = document.getElementById("chatBtn");
const btnPosts = document.getElementById("postsBtn");
const container = document.getElementById("pages-container");

// --------pulled & edited from chat.js----------
const loggedInDiv = document.getElementById("loggedin-user");

// global variables
let chatActive = false;
let postsActive = false;
let chatFrame = null;
let postsFrame = null;


// now everything is saved so it doesn't reload everything on startup
function saveIframeState() {
  localStorage.setItem("iframeState", JSON.stringify({
    chatActive,
    postsActive
  }));
}

// and will reload from lS
function loadIframeState() {
  const saved = localStorage.getItem("iframeState");
  if (saved) {
    const state = JSON.parse(saved);
    chatActive = state.chatActive;
    postsActive = state.postsActive;
    btnChat.classList.toggle("active", chatActive);
    btnPosts.classList.toggle("active", postsActive);
  }
}

// --------pulled & edited from chat.js----------
let username = "";

// --------pulled & edited from chat.js----------
// Section 2: Auth Check
// logged in user check
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// if no user, go back to login page, else, update page elements
if (!currentUser) {
  window.location.href = "login.html";
} else {
  username = currentUser.username;
  loggedInDiv.textContent = username;
  loadIframeState();
  if (chatActive || postsActive) {
    updateLayout();
  }
}

// Section 3: iFrames
// iframes are created ONCE now
function createIframes() {
  chatFrame = document.createElement("iframe");
  chatFrame.src = "../html/chat.html";
  chatFrame.className = "page-frame";
  chatFrame.id = "chat-frame";

  postsFrame = document.createElement("iframe");
  postsFrame.src = "../html/posts.html";
  postsFrame.className = "page-frame";
  postsFrame.id = "posts-frame";

  container.appendChild(chatFrame);
  container.appendChild(postsFrame);
}

// and only their visibility changes rather than a full reload
function updateLayout() {
  if (!chatFrame && !postsFrame) {
    createIframes();
  }

  if (chatActive && postsActive) {
    container.className = "two-pages";
    chatFrame.style.display = "";
    postsFrame.style.display = "";
  } else if (chatActive) {
    container.className = "single-page";
    chatFrame.style.display = "";
    postsFrame.style.display = "none";
  } else if (postsActive) {
    container.className = "single-page";
    chatFrame.style.display = "none";
    postsFrame.style.display = "";
  } else {
    container.className = "";
    container.innerHTML = "";
    chatFrame = null;
    postsFrame = null;
  }
}

// Section 4: Event Handlers
// logout
// --------pulled & edited from chat.js----------
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("iframeState");
  window.location.href = "login.html";
});

// chat
btnChat.addEventListener("click", () => {
  chatActive = !chatActive;
  btnChat.classList.toggle("active", chatActive);
  saveIframeState();
  updateLayout();
});

// posts
btnPosts.addEventListener("click", () => {
  postsActive = !postsActive;
  btnPosts.classList.toggle("active", postsActive);
  saveIframeState();
  updateLayout();
});
