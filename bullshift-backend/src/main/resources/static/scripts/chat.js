// BullShift Chat — Unified Backend/WebSocket Version
// Authors: Luke Callahan, Saiyan Ren
// Backend/WebSocket Integration & Cleanup: John R. Nottom IV, Addison S

document.addEventListener("DOMContentLoaded", () => {

    // DOM elements
    const messagesDiv = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const userListDiv = document.getElementById("user-list");
    const chatPartnerDiv = document.getElementById("chat-partner");

    const imageInput = document.getElementById("imageInput");
    const imageButton = document.getElementById("imageButton");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");

    const charCounter = document.getElementById("char-counter");

    // ensure we are on chat.html
    if (!messagesDiv || !input || !sendButton) return;

    // state
    let username = "";
    let activeChat = null;
    let stompClient = null;

    // auth check
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

    // auto-open chat via ?user=
    const params = new URLSearchParams(window.location.search);
    const friendParam = params.get("user");
    if (friendParam) {
        setTimeout(() => selectFriend(friendParam), 300);
    }

    // timestamp helper
    function formatTimestamp(ts) {
        try {
            const d = new Date(ts);
            return d.toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return ts;
        }
    }

    // convert image to base64
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }

    // create message bubble
    function createMessageElement(msg) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        messageDiv.dataset.id = msg.id;

        const isOwn = msg.sender === username;
        messageDiv.classList.add(isOwn ? "sent" : "received");

        // unsend button (only for own messages)
        if (isOwn) {
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "✖";
            deleteBtn.className = "unsend-btn";
            deleteBtn.title = "Unsend message";
            deleteBtn.onclick = () => unsendMessage(msg.id);
            messageDiv.appendChild(deleteBtn);
        }

        const timestampSpan = document.createElement("span");
        timestampSpan.className = "timestamp";
        timestampSpan.textContent = `[${formatTimestamp(msg.timestamp)}] `;
        timestampSpan.title = new Date(msg.timestamp).toLocaleString();

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
            img.style.marginTop = "5px";
            messageDiv.appendChild(img);
        }

        return messageDiv;
    }

    // websocket connection
   function connectWebSocket() {
    const socket = new SockJS("http://52.14.61.43:8081/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {

        // incoming messages
        stompClient.subscribe(`/user/${username}/queue/messages`, (frame) => {
            const msg = JSON.parse(frame.body);

            const isRelevant =
                (msg.sender === username && msg.receiver === activeChat) ||
                (msg.sender === activeChat && msg.receiver === username);

            if (!isRelevant) return;

            const el = createMessageElement(msg);
            messagesDiv.appendChild(el);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });

        // incoming delete events
        stompClient.subscribe(`/user/${username}/queue/delete`, (frame) => {
            const id = Number(frame.body);
            const el = messagesDiv.querySelector(`[data-id="${id}"]`);
            if (el) el.remove();
        });
    });
}

    // send message
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

        let imageData = null;
        if (file) imageData = await toBase64(file);

        const msg = {
            sender: username,
            receiver: activeChat,
            content: text,
            image: imageData
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));

        input.value = "";
        imageInput.value = "";
        imagePreviewContainer.innerHTML = "";
        updateCharCount();
    }

    // unsend message
    async function unsendMessage(id) {
        if (!confirm("Unsend this message?")) return;

        await fetch(`http://52.14.61.43:8081/api/messages/chat/message/${id}`, {
            method: "DELETE"
        });

        stompClient.send("/app/chat.deleteMessage", {}, JSON.stringify(id));

        const el = messagesDiv.querySelector(`[data-id="${id}"]`);
        if (el) el.remove();
    }

    // load chat history
    async function loadMessages() {
        messagesDiv.innerHTML = "";
        if (!activeChat) return;

        const url = `http://52.14.61.43:8081/api/chat/${username}/${activeChat}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            data.forEach((m) => {
                const el = createMessageElement(m);
                messagesDiv.appendChild(el);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (err) {
            console.error("Error loading chat history:", err);
        }
    }

    // friend list
    async function renderFriendList() {
        userListDiv.innerHTML = "";

        try {
            const res = await fetch(`http://52.14.61.43:8081/api/friends/${username}`);
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

    // select friend
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

    // character counter
    function updateCharCount() {
        if (!charCounter) return;
        const len = input.value.length;
        charCounter.textContent = `${len}/500`;
        charCounter.style.color = len >= 500 ? "red" : "gray";
    }

    input.addEventListener("input", updateCharCount);

    // events
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

});
