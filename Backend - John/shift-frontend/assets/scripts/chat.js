// DOM elements
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const logoutButton = document.getElementById("logoutButton");
const userListDiv = document.getElementById("user-list");
const activeChatName = document.getElementById("activeChatName");

// If we're not on index.html, bail
if (!messagesDiv || !input || !sendButton || !logoutButton || !userListDiv || !activeChatName) {
    // Probably on login.html
} else {
    // Globals
    let username = "";
    let activeChat = null;
    let stompClient = null;
    let wsConnected = false;

    // Load logged in user
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        username = currentUser.username;
        input.disabled = false;
        sendButton.disabled = false;
        renderUserList();
        connectWebSocket();
    }

    // Timestamp
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

    // Create message bubble
    function createMessageElement(messageUsername, text, timestamp) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";

        if (messageUsername === username) {
            messageDiv.classList.add("sent");
        } else {
            messageDiv.classList.add("received");
        }

        const timestampSpan = document.createElement("span");
        timestampSpan.className = "timestamp";
        timestampSpan.textContent = `[${timestamp}] `;

        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = messageUsername + ": ";

        const textSpan = document.createElement("span");
        textSpan.textContent = text;

        messageDiv.appendChild(timestampSpan);
        messageDiv.appendChild(usernameSpan);
        messageDiv.appendChild(textSpan);

        return messageDiv;
    }

    // WebSocket connection
    function connectWebSocket() {
        // Use 127.0.0.1 to match your frontend origin
        const socket = new SockJS("http://127.0.0.1:8081/ws");
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            wsConnected = true;

            stompClient.subscribe("/user/queue/messages", (frame) => {
                const msg = JSON.parse(frame.body);

                if (
                    (msg.sender === username && msg.receiver === activeChat) ||
                    (msg.sender === activeChat && msg.receiver === username)
                ) {
                    const ts = msg.timestamp || getTimestamp();
                    const el = createMessageElement(msg.sender, msg.content, ts);
                    messagesDiv.appendChild(el);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
            });
        }, (error) => {
            console.error("WebSocket error:", error);
            wsConnected = false;
        });
    }

    // Send message
    function sendMessage() {
        if (!activeChat) {
            alert("Select a user first.");
            return;
        }

        if (!wsConnected || !stompClient) {
            alert("Connecting to chat...");
            return;
        }

        const text = input.value.trim();
        if (text === "") return;

        const timestamp = getTimestamp();

        const msg = {
            sender: username,
            receiver: activeChat,
            content: text,
            timestamp: timestamp,
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));
        input.value = "";
    }

    // Load messages
    function loadMessages() {
        messagesDiv.innerHTML = "";
        if (!activeChat) return;

        const url = `http://127.0.0.1:8081/api/chat/${encodeURIComponent(
            username
        )}/${encodeURIComponent(activeChat)}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                data.forEach((m) => {
                    const ts = m.timestamp || getTimestamp();
                    const el = createMessageElement(m.sender, m.content, ts);
                    messagesDiv.appendChild(el);
                });
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            })
            .catch((err) => {
                console.error("Error loading chat history:", err);
            });
    }

    // Render user list
    function renderUserList() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        userListDiv.innerHTML = "";

        const others = users.filter((u) => u.username !== username);

        others.forEach((u) => {
            const item = document.createElement("div");
            item.className = "user-item";
            item.textContent = u.username;

            item.addEventListener("click", () => {
                activeChat = u.username;
                activeChatName.textContent = `Chatting with ${activeChat}`;

                document
                    .querySelectorAll(".user-item")
                    .forEach((el) => el.classList.remove("active"));
                item.classList.add("active");

                input.placeholder = `message ${activeChat}...`;

                loadMessages();
            });

            userListDiv.appendChild(item);
        });
    }

    // Logout
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });

    // Events
    sendButton.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
}
