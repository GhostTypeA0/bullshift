// BullShift Index — Unified Layout + Friend System
// Authors: Luke Callahan, Saiyan Ren
// Frontend Integration & Cleanup: John R. Nottom IV, Addison S
// NOTE This is technically my index js file
// DOM ELEMENTS
const btnChat = document.getElementById("chatBtn");
const btnPosts = document.getElementById("postsBtn");
const container = document.getElementById("pages-container");
const loggedInDiv = document.getElementById("loggedin-user");
const logoutButton = document.getElementById("logoutButton");

// Friend request UI
const getRequest = document.getElementById("getRequest");
const requestBox = document.querySelector(".requestBox");
const sendRequest = document.getElementById("sendRequest");
const friendSearch = document.getElementById("friendSearch");

// STATE
let chatActive = false;
let postsActive = false;
let chatFrame = null;
let postsFrame = null;

// AUTH CHECK
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
    window.location.href = "login.html";
} else {
    loggedInDiv.textContent = currentUser.username;
    loadIframeState();
    if (chatActive || postsActive) updateLayout();
}

// SAVE/LOAD IFRAME STATE
function saveIframeState() {
    localStorage.setItem("iframeState", JSON.stringify({
        chatActive,
        postsActive
    }));
}

function loadIframeState() {
    const saved = localStorage.getItem("iframeState");
    if (!saved) return;

    const state = JSON.parse(saved);
    chatActive = state.chatActive;
    postsActive = state.postsActive;

    btnChat.classList.toggle("active", chatActive);
    btnPosts.classList.toggle("active", postsActive);
}

// CREATE IFRAMES
function createIframes() {
    chatFrame = document.createElement("iframe");
    chatFrame.src = "/chat.html";
    chatFrame.className = "page-frame";
    chatFrame.id = "chat-frame";

    postsFrame = document.createElement("iframe");
    postsFrame.src = "/posts.html";
    postsFrame.className = "page-frame";
    postsFrame.id = "posts-frame";

    container.appendChild(chatFrame);
    container.appendChild(postsFrame);
}

// UPDATE LAYOUT
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

// LOGOUT
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("iframeState");
    window.location.href = "login.html";
});

// CHAT / POSTS BUTTONS
btnChat.addEventListener("click", () => {
    chatActive = !chatActive;
    btnChat.classList.toggle("active", chatActive);
    saveIframeState();
    updateLayout();
});

btnPosts.addEventListener("click", () => {
    postsActive = !postsActive;
    btnPosts.classList.toggle("active", postsActive);
    saveIframeState();
    updateLayout();
});

// FRIEND SYSTEM — POPUP + REQUESTS

// Toggle popup
getRequest.addEventListener("click", async () => {
    requestBox.classList.toggle("visible");
    requestBox.classList.toggle("hidden");

    if (!requestBox.classList.contains("hidden")) {
        await loadPendingRequests();
    }
});

// Send friend request
sendRequest.addEventListener("click", async () => {
    const receiver = friendSearch.value.trim();

    if (!receiver) {
        friendSearch.placeholder = "Enter a username";
        setTimeout(() => friendSearch.placeholder = "Find Friends", 1000);
        return;
    }

    const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sender: currentUser.username,
            receiver
        })
    });

    alert(await res.text());
    friendSearch.value = "";
});

// Load pending requests
async function loadPendingRequests() {
    const res = await fetch(`/api/friends/requests/${currentUser.username}`);
    const requests = await res.json();

    requestBox.innerHTML = `<h3>Friend Requests</h3><ul></ul>`;
    const list = requestBox.querySelector("ul");

    if (requests.length === 0) {
        list.innerHTML = `<li>No pending requests.</li>`;
        return;
    }

    requests.forEach(req => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${req.sender}</span>
            <div>
                <button class="acBtn" onclick="acceptRequest(${req.id})">Accept</button>
                <button class="dcBtn" onclick="declineRequest(${req.id})">Decline</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Accept request
async function acceptRequest(id) {
    await fetch(`/api/friends/accept/${id}`, { method: "POST" });
    loadPendingRequests();
}

// Decline request
async function declineRequest(id) {
    await fetch(`/api/friends/decline/${id}`, { method: "POST" });
    loadPendingRequests();
}

// OPEN CHAT
function openChat(friendName) {
    chatActive = true;
    postsActive = false;
    saveIframeState();

    btnChat.classList.add("active");
    btnPosts.classList.remove("active");

    updateLayout();

    chatFrame.src = `/chat.html?user=${friendName}`;
}
