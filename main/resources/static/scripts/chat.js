// BullShift Chat — Unified Backend/WebSocket Version
// Authors: Luke Callahan, Saiyan Ren
// Backend/WebSocket Integration & Cleanup: John R. Nottom IV, Addison S

document.addEventListener("DOMContentLoaded", () => {

    // DOM ELEMENTS (MATCH EXACTLY WITH chat.html)
    const messagesDiv = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const userListDiv = document.getElementById("user-list");
    const chatPartnerDiv = document.getElementById("chat-partner");

    const imageInput = document.getElementById("imageInput");
    const imageButton = document.getElementById("imageButton");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");

    // If these elements don't exist, we are NOT on chat.html
    if (!messagesDiv || !input || !sendButton || !userListDiv || !chatPartnerDiv) {
        console.warn("chat.js loaded outside chat.html — skipping chat logic.");
        return;
    }

    // STATE
    let username = "";
    let activeChat = null;
    let stompClient = null;

    // AUTH CHECK

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    username = currentUser.username;
    input.disabled = false;
    sendButton.disabled = false;

    chatPartnerDiv.textContent = "Select a user to start chatting!";
    renderFriendList();
    connectWebSocket();

    // Auto-open chat if URL contains ?user=
    const params = new URLSearchParams(window.location.search);
    const friendParam = params.get("user");
    if (friendParam) {
        setTimeout(() => selectFriend(friendParam), 300);
    }


    // TIMESTAMP HELPER

    function getTimestamp() {
        return new Date().toLocaleString([], {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }


    // IMAGE → BASE64

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }

    // MESSAGE BUBBLE CREATION
    function createMessageElement(messageUsername, text, timestamp, image) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";

        const isOwn = messageUsername === username;
        messageDiv.classList.add(isOwn ? "sent" : "received");

        const timestampSpan = document.createElement("span");
        timestampSpan.className = "timestamp";
        timestampSpan.textContent = `[${timestamp}] `;
        timestampSpan.title = new Date(timestamp).toLocaleString();

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
            img.style.marginTop = "5px";
            messageDiv.appendChild(img);
        }

        return messageDiv;
    }

    // WEBSOCKET CONNECTION
    function connectWebSocket() {
        const socket = new SockJS("http://localhost:8081/ws");
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            stompClient.subscribe("/user/queue/messages", (frame) => {
                const msg = JSON.parse(frame.body);

                const isRelevant =
                    (msg.sender === username && msg.receiver === activeChat) ||
                    (msg.sender === activeChat && msg.receiver === username);

                if (!isRelevant) return;

                const ts = msg.timestamp || getTimestamp();
                const el = createMessageElement(
                    msg.sender,
                    msg.content,
                    ts,
                    msg.image || null
                );

                messagesDiv.appendChild(el);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            });
        });
    }

    // SEND MESSAGE
    async function sendMessage() {
        if (!activeChat) {
            alert("Select a user first.");
            return;
        }

        if (!stompClient) {
            alert("Connecting to chat...");
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

        const msg = {
            sender: username,
            receiver: activeChat,
            content: text,
            timestamp,
            image: imageData,
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));

        const el = createMessageElement(username, text, timestamp, imageData);
        messagesDiv.appendChild(el);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        input.value = "";
        imageInput.value = "";
        imagePreviewContainer.innerHTML = "";
    }

    // LOAD CHAT HISTORY (REST)
    async function loadMessages() {
        messagesDiv.innerHTML = "";
        if (!activeChat) return;

        const url = `/api/chat/${encodeURIComponent(username)}/${encodeURIComponent(activeChat)}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            data.forEach((m) => {
                const ts = m.timestamp || getTimestamp();
                const el = createMessageElement(
                    m.sender,
                    m.content,
                    ts,
                    m.image || null
                );
                messagesDiv.appendChild(el);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (err) {
            console.error("Error loading chat history:", err);
        }
    }

    // FRIEND LIST
    async function renderFriendList() {
        userListDiv.innerHTML = "";

        try {
            const res = await fetch(`/api/friends/${username}`);
            const friends = await res.json();

            if (friends.length === 0) {
                const empty = document.createElement("p");
                empty.textContent = "No friends yet.";
                empty.className = "no-users";
                userListDiv.appendChild(empty);
                return;
            }

            friends.forEach((f) => {
                const friendName = f.user1 === username ? f.user2 : f.user1;

                const item = document.createElement("div");
                item.className = "user-item";
                item.textContent = friendName;

                item.addEventListener("click", () => selectFriend(friendName));

                userListDiv.appendChild(item);
            });
        } catch (err) {
            console.error("Error loading friends:", err);
        }
    }

    // SELECT FRIEND
    function selectFriend(friendName) {
        activeChat = friendName;

        document.querySelectorAll(".user-item").forEach((el) =>
            el.classList.remove("active")
        );

        const selected = Array.from(document.querySelectorAll(".user-item"))
            .find((el) => el.textContent === friendName);

        if (selected) selected.classList.add("active");

        chatPartnerDiv.textContent = friendName + "@bshift";
        input.placeholder = `message ${friendName}@bshift...`;

        loadMessages();
    }

    // EVENTS
    sendButton.addEventListener("click", sendMessage);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    imageButton.addEventListener("click", () => imageInput.click());

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) {
            imagePreviewContainer.innerHTML = "";
            return;
        }

        imagePreviewContainer.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "preview-wrapper";

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.className = "preview-image";

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

}); // END DOMContentLoaded WRAPPER
