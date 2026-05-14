// BullShift Index — Unified Layout + Friend + Group Chat System
// Authors: Luke Callahan, Saiyan Ren, Addison Solberg
// Frontend Integration & Cleanup: John R. Nottom IV

// DOM ELEMENTS
const btnChat = document.getElementById("chatBtn");
const btnPosts = document.getElementById("postsBtn");
const groupsBtn = document.getElementById("groupsBtn");

const container = document.getElementById("pages-container");
const loggedInDiv = document.getElementById("loggedin-user");
const logoutButton = document.getElementById("logoutButton");

// Friend request UI
const getRequest = document.getElementById("getRequest");
const requestBox = document.querySelector(".requestBox");
const sendRequest = document.getElementById("sendRequest");
const friendSearch = document.getElementById("friendSearch");

// Group popup
const groupBox = document.querySelector(".groupBox");

// STATE
let chatActive = false;
let postsActive = false;
let chatFrame = null;
let postsFrame = null;
let username = "";

// AUTH CHECK
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
    window.location.href = "login.html";
} else {
    username = currentUser.username;
    loggedInDiv.textContent = username;
    loadIframeState();
    if (chatActive || postsActive) updateLayout();
}

// SAVE/LOAD IFRAME STATE (USER-SCOPED)
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

// LOGOUT
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem(`iframeState_${username}`);
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

async function acceptRequest(id) {
    await fetch(`/api/friends/accept/${id}`, { method: "POST" });
    loadPendingRequests();
    loadFriendList();
}

async function declineRequest(id) {
    await fetch(`/api/friends/decline/${id}`, { method: "POST" });
    loadPendingRequests();
}

// FRIEND LIST (SAIYAN STYLE)
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

// OPEN PRIVATE CHAT
function openChat(friendName) {
    chatActive = true;
    postsActive = false;
    saveIframeState();

    btnChat.classList.add("active");
    btnPosts.classList.remove("active");

    updateLayout();

    chatFrame.src = `/chat.html?user=${friendName}`;
}

// GROUP POPUP
groupsBtn.addEventListener("click", () => {
    const isHidden = groupBox.classList.contains("hidden");

    if (isHidden) {
        groupBox.classList.remove("hidden");

        const measure = groupsBtn.getBoundingClientRect();
        groupBox.style.top = (measure.bottom - groupBox.offsetHeight) + "px";
        groupBox.style.left = (measure.right + 10) + "px";

        groupBox.classList.add("visible");
        loadPendingGroup();
        loadGroupList();
    } else {
        groupBox.classList.remove("visible");
        groupBox.classList.add("hidden");
    }
});

// LOAD FRIENDS FOR GROUP CREATION
async function loadPendingGroup() {
    const groupBody = document.getElementById("groupBody");
    const res = await fetch(`/api/friends/${username}`);
    const friends = await res.json();

    groupBody.innerHTML = "";

    let groupMembers = [username];

    friends.forEach(f => {
        const friendName = f.user1 === username ? f.user2 : f.user1;
        const button = document.createElement("button");

        button.textContent = friendName;
        button.classList.add("groupFriendsCSS");

        button.addEventListener("click", () => {
            button.classList.toggle("selected");

            if (button.classList.contains("selected")) {
                if (groupMembers.length >= 8) {
                    button.classList.remove("selected");
                    alert("Maximum group size is 8.");
                    return;
                }
                groupMembers.push(friendName);
            } else {
                const idx = groupMembers.indexOf(friendName);
                if (idx !== -1) groupMembers.splice(idx, 1);
            }
        });

        groupBody.appendChild(button);
    });

    const createBtn = document.getElementById("mkeGrpBtn");
    createBtn.onclick = () => {
        if (groupMembers.length < 3) {
            alert("Select at least 2 friends to create a group.");
            return;
        }
        groupChatCreate(groupMembers);
    };
}

// CREATE GROUP CHAT
async function groupChatCreate(groupMembers) {
    await fetch("/api/groupchats/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            member1: groupMembers[0] || null,
            member2: groupMembers[1] || null,
            member3: groupMembers[2] || null,
            member4: groupMembers[3] || null,
            member5: groupMembers[4] || null,
            member6: groupMembers[5] || null,
            member7: groupMembers[6] || null,
            member8: groupMembers[7] || null
        })
    });

    alert("Group created!");
    loadGroupList();
}

// LOAD GROUP CHAT LIST
async function loadGroupList() {
    const groupListDiv = document.getElementById("group-list");
    if (!groupListDiv) return;

    const res = await fetch(`/api/groupchats/${username}`);
    const groups = await res.json();

    groupListDiv.innerHTML = "";

    if (groups.length === 0) {
        groupListDiv.innerHTML = `<p class="no-groups">No group chats yet.</p>`;
        return;
    }

    groups.forEach(g => {
        const div = document.createElement("div");
        div.className = "group-entry";

        const label = document.createElement("p");
        label.textContent = `Group #${g.groupChatId}`;

        const openBtn = document.createElement("button");
        openBtn.textContent = "open";
        openBtn.className = "acBtn";
        openBtn.onclick = () => openGroupChat(g.groupChatId);

        div.appendChild(label);
        div.appendChild(openBtn);
        groupListDiv.appendChild(div);
    });
}

// OPEN GROUP CHAT
function openGroupChat(groupId) {
    chatActive = true;
    postsActive = false;
    saveIframeState();

    btnChat.classList.add("active");
    btnPosts.classList.remove("active");

    updateLayout();

    chatFrame.src = `/chat.html?group=${groupId}`;
}
