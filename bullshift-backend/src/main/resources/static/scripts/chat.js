// BullShift Chat — Backend/WebSocket + Saiyan UI Merge
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
    const charCounter = document.getElementById("char-counter");

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

    // enforce 500 char limit at input level
    input.maxLength = 500;

    chatPartnerDiv.textContent = "Select a user to start chatting!";
    renderFriendList();
    connectWebSocket();

    // Auto-open chat if URL contains ?user=
    const params = new URLSearchParams(window.location.search);
    const friendParam = params.get("user");
    if (friendParam) {
        setTimeout(() => selectFriend(friendParam), 300);
    }

    // TIMESTAMP HELPERS (short display + long hover)
    function formatTimestampShort(ts) {
        try {
            const d = new Date(ts);
            return d.toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return ts;
        }
    }

    function formatTimestampLong(ts) {
        try {
            const d = new Date(ts);
            const options = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            };
            return d.toLocaleString(undefined, options);
        } catch {
            return ts;
        }
    }

    function getTimestampNow() {
        return new Date().toISOString();
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
    // msg: { id, sender, receiver, content, timestamp, image }
    function createMessageElement(msg) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        if (msg.id != null) {
            messageDiv.dataset.id = msg.id;
        }

        const isOwn = msg.sender === username;
        messageDiv.classList.add(isOwn ? "sent" : "received");

        // delete/unsend button only on own messages (backend unsend)
        if (isOwn && msg.id != null) {
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "✖";
            deleteBtn.className = "unsend-btn";
            deleteBtn.title = "Unsend message";
            deleteBtn.onclick = () => unsendMessage(msg.id);
            messageDiv.appendChild(deleteBtn);
        }

        const timestampSpan = document.createElement("span");
        timestampSpan.className = "timestamp";
        const ts = msg.timestamp || getTimestampNow();
        timestampSpan.textContent = `[${formatTimestampShort(ts)}] `;
        timestampSpan.title = `[ ${formatTimestampLong(ts)} ]`;

        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = msg.sender + ":";

        messageDiv.appendChild(timestampSpan);
        messageDiv.appendChild(usernameSpan);

        if (msg.content) {
            const textSpan = document.createElement("span");
            textSpan.textContent = msg.content;
            messageDiv.appendChild(textSpan);
        }

        if (msg.image) {
            const img = document.createElement("img");
            img.src = msg.image;
            img.className = "chat-image";
            img.style.maxWidth = "200px";
            img.style.display = "block";
            img.style.marginTop = "5px";
            messageDiv.appendChild(img);
        }

        return messageDiv;
    }

    // WEBSOCKET CONNECTION (leave endpoints exactly as you have them)
    function connectWebSocket() {
        const socket = new SockJS("http://localhost:8081/ws");
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            // message stream
            stompClient.subscribe("/user/queue/messages", (frame) => {
                const msg = JSON.parse(frame.body);

                const isRelevant =
                    (msg.sender === username && msg.receiver === activeChat) ||
                    (msg.sender === activeChat && msg.receiver === username);

                if (!isRelevant) return;

                const el = createMessageElement(msg);
                messagesDiv.appendChild(el);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            });

            // delete events (backend unsend broadcast)
            stompClient.subscribe("/user/queue/delete", (frame) => {
                const id = Number(frame.body);
                const el = messagesDiv.querySelector(`[data-id="${id}"]`);
                if (el) el.remove();
            });
        });
    }

    // BACKEND UNSEND
    async function unsendMessage(id) {
        if (!confirm("Are you sure you want to unsend this message?")) return;

        try {
            await fetch(`/api/messages/chat/message/${id}`, { method: "DELETE" });

            if (stompClient) {
                stompClient.send("/app/chat.deleteMessage", {}, JSON.stringify(id));
            }

            const el = messagesDiv.querySelector(`[data-id="${id}"]`);
            if (el) el.remove();
        } catch (err) {
            console.error("Error unsending message:", err);
        }
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

        const rawText = input.value.trim();
        const text = rawText.substring(0, 500);
        const file = imageInput.files[0];

        if (!text && !file) return;

        const timestamp = getTimestampNow();
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

        // send to backend via WebSocket
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));

        // optimistic render (no id yet)
        const el = createMessageElement(msg);
        messagesDiv.appendChild(el);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        input.value = "";
        imageInput.value = "";
        imagePreviewContainer.innerHTML = "";
        updateCharCount();
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
                const msg = {
                    id: m.id,
                    sender: m.sender,
                    receiver: m.receiver,
                    content: m.content,
                    timestamp: m.timestamp,
                    image: m.image,
                };
                const el = createMessageElement(msg);
                messagesDiv.appendChild(el);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (err) {
            console.error("Error loading chat history:", err);
        }
    }

    // FRIEND LIST (BACKEND)
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
                if (friendName === activeChat) item.classList.add("active");
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

    // CHARACTER COUNTER
    function updateCharCount() {
        if (!charCounter) return;
        const len = input.value.length;
        charCounter.textContent = `${len}/500`;
        charCounter.style.color = len >= 500 ? "red" : "gray";
    }

    input.addEventListener("input", updateCharCount);
    updateCharCount();

    // IMAGE PREVIEW (Saiyan-style wrapper)
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

    // EVENTS
    sendButton.addEventListener("click", sendMessage);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

});
