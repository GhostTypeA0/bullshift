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

// --------pulled & edited from chat.js----------
let username = "";

// defualt state
container.innerHTML = "Select a Page to Start!";

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
}

// Section 3: Layout
// Note: Change out "psudoChat.html" and "psudoPosts.html" when implementing
function updateLayout() {
  container.innerHTML = "";


  // both pages loaded
  if (chatActive && postsActive) {
    container.className = "two-pages";
    chatFrame = document.createElement("iframe");
    chatFrame.src = "../html/psudoChat.html";
    chatFrame.className = "page-frame";
    chatFrame.id = "chat-frame";

    postsFrame = document.createElement("iframe");
    postsFrame.src = "../html/psudoPosts.html";
    postsFrame.className = "page-frame";
    postsFrame.id = "posts-frame";

    container.appendChild(chatFrame);
    container.appendChild(postsFrame);
  }

  // ONLY chat loaded
  else if (chatActive) {
    container.className = "single-page";
    chatFrame = document.createElement("iframe");
    chatFrame.src = "../html/psudoChat.html";
    chatFrame.className = "page-frame";
    chatFrame.id = "chat-frame";
    container.appendChild(chatFrame);
  }

  // ONLY posts active
  else if (postsActive) {
    container.className = "single-page";
    postsFrame = document.createElement("iframe");
    postsFrame.src = "../html/psudoPosts.html";
    postsFrame.className = "page-frame";
    postsFrame.id = "posts-frame";
    container.appendChild(postsFrame);
  }
  
  // empty page
  else {
    container.className = "";
    container.innerHTML = "Select a Page to Start!";
  }
}

// Section 4: Event Handlers
// logout
// --------pulled & edited from chat.js----------
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

// chat
btnChat.addEventListener("click", () => {
  chatActive = !chatActive;
  btnChat.classList.toggle("active", chatActive);
  updateLayout();
});

// posts
btnPosts.addEventListener("click", () => {
  postsActive = !postsActive;
  btnPosts.classList.toggle("active", postsActive);
  updateLayout();
});
