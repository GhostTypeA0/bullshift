// BullShift Chat — Instant messaging (private + group)
// Authors: Luke Callahan, Saiyan Ren
// Backend/WebSocket Integration & Cleanup: John R. Nottom IV, Addison S

document.addEventListener("DOMContentLoaded", () => {

    const messagesDiv = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const userListDiv = document.getElementById("user-list");
    const chatPartnerDiv = document.getElementById("chat-partner");

    const imageInput = document.getElementById("imageInput");
    const imageButton = document.getElementById("imageButton");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    const charCounter = document.getElementById("char-counter");

    // limitedMode = running inside index.html (sidebar only, no chat UI)
    const limitedMode =
        !messagesDiv ||
        !input ||
        !sendButton ||
        !chatPartnerDiv ||
        !imageInput ||
        !imageButton ||
        !imagePreviewContainer;

    if (limitedMode) {
        console.warn("chat.js loaded outside full chat.html — limited mode (sidebar list only).");
    }

    let username = "";
    let activeChat = null;
    let activeGroup = null;
    let stompClient = null;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    username = currentUser.username;

    // Full chat UI only
    if (!limitedMode) {
        input.disabled = false;
        sendButton.disabled = false;
        input.maxLength = 500;

        chatPartnerDiv.textContent = "Select a chat to begin.";
        connectWebSocket();

        const params = new URLSearchParams(window.location.search);
        const friendParam = params.get("user");
        const groupParam = params.get("group");

        if (friendParam) setTimeout(() => selectFriend(friendParam), 300);
        if (groupParam) setTimeout(() => selectGroup(Number(groupParam), `Group #${groupParam}`), 300);
    }

    // Sidebar friend/group list should always load (index.html + chat.html)
    renderFriendList();

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
            return d.toLocaleString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return ts;
        }
    }

    function getTimestampNow() {
        return new Date().toISOString();
    }

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }

    function createMessageElement(msg) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";

        const messageId = msg.id != null ? msg.id : msg.groupChatMessagesId;
        if (messageId != null) messageDiv.dataset.id = messageId;

        const isOwn = msg.sender === username;
        messageDiv.classList.add(isOwn ? "sent" : "received");

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

    function connectWebSocket() {
        if (limitedMode) return;

        const socket = new SockJS("http://localhost:8081/ws");
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {

            // PRIVATE CHAT
            stompClient.subscribe("/user/queue/messages", (frame) => {
                const msg = JSON.parse(frame.body);

                const isRelevant =
                    (msg.sender === username && msg.receiver === activeChat) ||
                    (msg.sender === activeChat && msg.receiver === username) ||
                    (msg.sender === username && msg.receiver === username);

                if (!isRelevant) return;

                const optimistic = messagesDiv.querySelector('[data-temp="true"]');
                if (optimistic) optimistic.remove();

                const el = createMessageElement(msg);
                messagesDiv.appendChild(el);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            });

            // GROUP CHAT
            stompClient.subscribe("/topic/group", (frame) => {
                const msg = JSON.parse(frame.body);

                if (Number(msg.groupChatId) !== Number(activeGroup)) return;

                const el = createMessageElement(msg);
                messagesDiv.appendChild(el);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            });

            // DELETE
            stompClient.subscribe("/user/queue/delete", (frame) => {
                const id = Number(frame.body);
                const el = messagesDiv.querySelector(`[data-id="${id}"]`);
                if (el) el.remove();
            });
        });
    }

    async function unsendMessage(id) {
        if (limitedMode) return;

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

    async function sendMessage() {
        if (limitedMode) return;

        if (!activeChat && !activeGroup) {
            alert("Select a chat first.");
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

        if (file) imageData = await toBase64(file);

        const msg = {
            sender: username,
            receiver: activeChat,
            groupChatId: activeGroup,
            content: text,
            timestamp,
            image: imageData,
        };

        if (activeGroup) {
            stompClient.send("/app/group.sendMessage", {}, JSON.stringify(msg));
        } else {
            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));

            const optimisticMsg = { ...msg, id: null };
            const el = createMessageElement(optimisticMsg);
            el.dataset.temp = "true";
            messagesDiv.appendChild(el);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        input.value = "";
        imageInput.value = "";
        imagePreviewContainer.innerHTML = "";
        updateCharCount();
    }

    async function loadMessages() {
        if (limitedMode) return;

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

    async function loadGroupMessages() {
        if (limitedMode) return;

        messagesDiv.innerHTML = "";
        if (!activeGroup) return;

        try {
            const res = await fetch(`/api/groupmessages/${activeGroup}`);
            const data = await res.json();

            data.forEach((m) => {
                const msg = {
                    groupChatMessagesId: m.groupChatMessagesId,
                    groupChatId: m.groupChatId,
                    sender: m.sender,
                    content: m.content,
                    timestamp: m.timestamp,
                    image: m.image,
                };
                const el = createMessageElement(msg);
                messagesDiv.appendChild(el);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (err) {
            console.error("Error loading group messages:", err);
        }
    }

    async function renderFriendList() {
        if (!userListDiv) return;

        userListDiv.innerHTML = "";

        try {
            const res = await fetch(`/api/friends/${username}`);
            const friends = await res.json();

            const groupRes = await fetch(`/api/groupchats/${username}`);
            const groups = await groupRes.json();

            friends.forEach((f) => {
                const friendName = f.user1 === username ? f.user2 : f.user1;

                const item = document.createElement("div");
                item.className = "user-item";
                if (friendName === activeChat) item.classList.add("active");
                item.textContent = friendName;

                item.addEventListener("click", () => selectFriend(friendName));
                userListDiv.appendChild(item);
            });

            groups.forEach((g) => {
                const members = [
                    g.member1, g.member2, g.member3, g.member4,
                    g.member5, g.member6, g.member7, g.member8
                ].filter(Boolean);

                let groupName = members.join(", ");
                if (groupName.length > 20) groupName = groupName.substring(0, 15) + "...";

                const item = document.createElement("div");
                item.className = "user-item group-item";
                item.textContent = groupName;

                item.addEventListener("click", () => selectGroup(g.groupChatId, groupName));
                userListDiv.appendChild(item);
            });

        } catch (err) {
            console.error("Error loading friend/group list:", err);
        }
    }

    function selectFriend(friendName) {
        if (limitedMode) return;

        activeChat = friendName;
        activeGroup = null;

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

    function selectGroup(groupId, groupName) {
        if (limitedMode) return;

        activeChat = null;
        activeGroup = groupId;

        document.querySelectorAll(".user-item").forEach((el) =>
            el.classList.remove("active")
        );

        const selected = Array.from(document.querySelectorAll(".user-item"))
            .find((el) => el.textContent === groupName);

        if (selected) selected.classList.add("active");

        chatPartnerDiv.textContent = groupName;
        input.placeholder = `message ${groupName}...`;

        loadGroupMessages();
    }

    function updateCharCount() {
        if (limitedMode || !charCounter || !input) return;
        const len = input.value.length;
        charCounter.textContent = `${len}/500`;
        charCounter.style.color = len >= 500 ? "red" : "gray";
    }

    if (!limitedMode) {
        input.addEventListener("input", updateCharCount);
        updateCharCount();

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

        sendButton.addEventListener("click", sendMessage);

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }

});
