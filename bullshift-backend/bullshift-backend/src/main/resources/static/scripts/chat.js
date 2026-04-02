// DOM ELEMENT LOOKUPS
// These are the main UI elements we interact with.
// If any of these are missing, it means we're not on the chat page.
const messagesDiv = document.getElementById("messages");          // container for chat bubbles
const input = document.getElementById("messageInput");            // text input box
const sendButton = document.getElementById("sendButton");         // send message button
const logoutButton = document.getElementById("logoutButton");     // logout button
const userListDiv = document.getElementById("user-list");         // sidebar list of users
const activeChatName = document.getElementById("activeChatName"); // "Chatting with X" label

// If these elements don't exist, we're on login.html — skip chat logic entirely.
if (!messagesDiv || !input || !sendButton || !logoutButton || !userListDiv || !activeChatName) {
    // login page has its own script, so we safely exit here.
} else {

    // RUNTIME STATE VARIABLES
    let username = "";       // the logged-in user's username
    let activeChat = null;   // who the user is currently chatting with
    let stompClient = null;  // STOMP client for WebSocket communication
    let wsConnected = false; // track WebSocket connection status

    // Load the logged-in user from localStorage (set during login)
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        // If no user is stored, redirect to login page.
        window.location.href = "login.html";
    } else {
        // Store username and enable chat input
        username = currentUser.username;
        input.disabled = false;
        sendButton.disabled = false;

        // Load user list + connect to WebSocket server
        renderUserList();
        connectWebSocket();
    }

    // TIMESTAMP HELPER
    // Returns a formatted timestamp like "03/30/2026, 10:15 AM"
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

    // MESSAGE BUBBLE CREATION
    // Builds a DOM element representing a single chat message.
    // Handles styling for sent vs received messages.
    function createMessageElement(messageUsername, text, timestamp) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";

        // Add CSS class depending on who sent the message
        if (messageUsername === username) {
            messageDiv.classList.add("sent");     // right-aligned bubble
        } else {
            messageDiv.classList.add("received"); // left-aligned bubble
        }

        // Timestamp label
        const timestampSpan = document.createElement("span");
        timestampSpan.className = "timestamp";
        timestampSpan.textContent = `[${timestamp}] `;

        // Username label
        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = messageUsername + ": ";

        // Message text
        const textSpan = document.createElement("span");
        textSpan.textContent = text;

        // Assemble bubble
        messageDiv.appendChild(timestampSpan);
        messageDiv.appendChild(usernameSpan);
        messageDiv.appendChild(textSpan);

        return messageDiv;
    }

    // WEBSOCKET CONNECTION
    // Connects to the backend WebSocket endpoint (/ws)
    // and subscribes to the user's private message queue.
    function connectWebSocket() {
        const socket = new SockJS("/ws"); // SockJS fallback wrapper
        stompClient = Stomp.over(socket); // STOMP protocol wrapper

        // Connect without headers for now
        stompClient.connect({}, () => {
            wsConnected = true;

            // Subscribe to private queue: "/user/queue/messages"
            // Backend sends messages here specifically for THIS user.
            stompClient.subscribe("/user/queue/messages", (frame) => {
                const msg = JSON.parse(frame.body);

                // Only display messages for the currently selected chat
                const isRelevant =
                    (msg.sender === username && msg.receiver === activeChat) ||
                    (msg.sender === activeChat && msg.receiver === username);

                if (isRelevant) {
                    const ts = msg.timestamp || getTimestamp();
                    const el = createMessageElement(msg.sender, msg.content, ts);
                    messagesDiv.appendChild(el);

                    // Auto-scroll to bottom
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
            });

        }, (error) => {
            console.error("WebSocket error:", error);
            wsConnected = false;
        });
    }

    // SEND MESSAGE
    // Sends a message to the backend WebSocket controller.
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

        // Message object sent to backend
        const msg = {
            sender: username,
            receiver: activeChat,
            content: text,
            timestamp: timestamp,
        };

        // Send to backend STOMP endpoint
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));

        // Clear input field
        input.value = "";
    }

    // LOAD CHAT HISTORY
    // Fetches past messages between the two users from REST API.
    async function loadMessages() {
        messagesDiv.innerHTML = ""; // clear old messages
        if (!activeChat) return;

        const url = `/api/chat/${encodeURIComponent(username)}/${encodeURIComponent(activeChat)}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            
            // Render each message bubble
            data.forEach((m) => {
                const ts = m.timestamp || getTimestamp();
                const el = createMessageElement(m.sender, m.content, ts);
                messagesDiv.appendChild(el);
            });

            // Scroll to bottom
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

        } catch (err) {
            console.error("Error loading chat history:", err);
        }
    }

    // RENDER USER LIST
    // Loads all users from backend and builds clickable sidebar list.
    async function renderUserList() {
        userListDiv.innerHTML = "";

        try {
            const res = await fetch("/api/users");
            const users = await res.json();

            // Remove the current user from the list
            const others = users.filter((u) => u.username !== username);

            if (others.length === 0) {
                const empty = document.createElement("p");
                empty.textContent = "No other users found.";
                empty.className = "no-users";
                userListDiv.appendChild(empty);
                return;
            }

            // Build clickable user items
            others.forEach((u) => {
                const item = document.createElement("div");
                item.className = "user-item";
                item.textContent = u.username;

                item.addEventListener("click", () => {
                    activeChat = u.username;
                    activeChatName.textContent = `Chatting with ${activeChat}`;

                    // Highlight selected user
                    document.querySelectorAll(".user-item").forEach((el) => el.classList.remove("active"));
                    item.classList.add("active");

                    input.placeholder = `message ${activeChat}...`;

                    loadMessages(); // load chat history
                });

                userListDiv.appendChild(item);
            });

        } catch (err) {
            console.error("Error loading users:", err);
        }
    }

    // LOGOUT HANDLER
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });

    // SEND MESSAGE EVENTS
    sendButton.addEventListener("click", sendMessage);

    // Allow sending with Enter key
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
}
