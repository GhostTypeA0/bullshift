// BullShift Index — Unified Layout + Friend System
// Authors: Luke Callahan, Saiyan Ren
// Frontend Integration & Cleanup: John R. Nottom IV, Addison S
/* Comment style preserved per Saiyan Ren */

// ------------------------------------------------------------
// SECTION 1 — DOM ELEMENTS & GLOBAL STATE
// ------------------------------------------------------------
const btnChat = document.getElementById("chatBtn");
const btnPosts = document.getElementById("postsBtn");
const container = document.getElementById("pages-container");
const loggedInDiv = document.getElementById("loggedin-user");
const logoutButton = document.getElementById("logoutButton");

const getRequest = document.getElementById("getRequest");
const requestBox = document.querySelector(".requestBox");
const sendRequest = document.getElementById("sendRequest");
const friendSearch = document.getElementById("friendSearch");

let chatActive = false;
let postsActive = false;
let chatFrame = null;
let postsFrame = null;
let username = "";

// ------------------------------------------------------------
// SECTION 2 — AUTH CHECK
// ------------------------------------------------------------
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
    window.location.href = "login.html";
} else {
    username = currentUser.username;
    loggedInDiv.textContent = username;
    loadIframeState();
    if (chatActive || postsActive) updateLayout();
}

// ------------------------------------------------------------
// SECTION 3 — USER-SCOPED IFRAME STATE
// ------------------------------------------------------------
function saveIframeState() {
    if (!username) return;
    localStorage.setItem(`iframeState_${username}`, JSON.stringify({
        chatActive,
        postsActive
    }));
}

function loadIframeState() {
    if (!username) return;
    const saved = localStorage.getItem(`iframeState_${username}`);
    if (!saved) return;

    const state = JSON.parse(saved);
    chatActive = state.chatActive;
    postsActive = state.postsActive;

    btnChat.classList.toggle("active", chatActive);
    btnPosts.classList.toggle("active", postsActive);
}

// ------------------------------------------------------------
// SECTION 4 — IFRAME CREATION + LAYOUT
// ------------------------------------------------------------
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

function updateLayout() {
    if (!chatFrame && !postsFrame) createIframes();

    if (chatActive && postsActive) {
        container.className = "two-pages";
        chatFrame.style.display = "block";
        postsFrame.style.display = "block";
    } else if (chatActive) {
        container.className = "single-page";
        chatFrame.style.display = "block";
        postsFrame.style.display = "none";
    } else if (postsActive) {
        container.className = "single-page";
        chatFrame.style.display = "none";
        postsFrame.style.display = "block";
    } else {
        container.className = "";
        container.innerHTML = "";
        chatFrame = null;
        postsFrame = null;
    }
}

// ------------------------------------------------------------
// SECTION 5 — LOGOUT
// ------------------------------------------------------------
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem(`iframeState_${username}`);
    window.location.href = "login.html";
});

// ------------------------------------------------------------
// SECTION 6 — CHAT / POSTS BUTTONS
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// SECTION 7 — FRIEND REQUEST POPUP (BACKEND-POWERED)
// ------------------------------------------------------------
getRequest.addEventListener("click", async () => {
    requestBox.classList.toggle("visible");
    requestBox.classList.toggle("hidden");

    if (!requestBox.classList.contains("hidden")) {
        await loadPendingRequests();
    }
});

// SEND FRIEND REQUEST
sendRequest.addEventListener("click", async () => {
    const receiver = friendSearch.value.trim();

    if (!receiver) {
        friendSearch.placeholder = "Enter a username";
        setTimeout(() => friendSearch.placeholder = "Find Friends", 1000);
        return;
    }

    const res = await fetch(`/api/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sender: username,
            receiver
        })
    });

    alert(await res.text());
    friendSearch.value = "";
});

// LOAD PENDING REQUESTS
async function loadPendingRequests() {
    const res = await fetch(`/api/friends/requests/${username}`);
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

// ACCEPT REQUEST
async function acceptRequest(id) {
    await fetch(`/api/friends/accept/${id}`, { method: "POST" });
    loadPendingRequests();
    loadFriendList();
}

// DECLINE REQUEST
async function declineRequest(id) {
    await fetch(`/api/friends/decline/${id}`, { method: "POST" });
    loadPendingRequests();
}

// ------------------------------------------------------------
// SECTION 8 — FRIEND LIST (SAIYAN STYLE, BACKEND POWERED)
// ------------------------------------------------------------
async function loadFriendList() {
    const friendsListDiv = document.getElementById("friends-list");
    if (!friendsListDiv) return;

    const res = await fetch(`/api/friends/${username}`);
    const friends = await res.json();

    friendsListDiv.innerHTML = "";

    if (friends.length === 0) {
        friendsListDiv.innerHTML = `<p class="no-friends">No friends added yet.</p>`;
        return;
    }

    friends.forEach(f => {
        const friendName = f.user1 === username ? f.user2 : f.user1;

        const wrapper = document.createElement("div");
        wrapper.className = "friend-name";

        const name = document.createElement("p");
        name.innerHTML = `<strong>${friendName}</strong>`;

        const openBtn = document.createElement("button");
        openBtn.textContent = "chat";
        openBtn.className = "acBtn";
        openBtn.onclick = () => openChat(friendName);

        wrapper.appendChild(name);
        wrapper.appendChild(openBtn);
        friendsListDiv.appendChild(wrapper);
    });
}

document.addEventListener("DOMContentLoaded", loadFriendList);

// ------------------------------------------------------------
// SECTION 9 — OPEN CHAT WITH FRIEND
// ------------------------------------------------------------
function openChat(friendName) {
    chatActive = true;
    postsActive = false;
    saveIframeState();

    btnChat.classList.add("active");
    btnPosts.classList.remove("active");

    updateLayout();

    chatFrame.src = `/chat.html?user=${friendName}`;
}

// ------------------------------------------------------------
// SECTION 10 — NOTIFICATIONS (FULL ENABLED)
// ------------------------------------------------------------
function friendRequestNotif(sender) {
    if (Notification.permission === "granted") {
        new Notification("Incoming Friend Request!", {
            body: `${sender} has sent you a friend request!`
        });
    } else {
        Notification.requestPermission();
    }
}

function messageNotif(sender, message) {
    if (Notification.permission === "granted") {
        new Notification(`${sender}:`, { body: message });
    } else {
        Notification.requestPermission();
    }
}
