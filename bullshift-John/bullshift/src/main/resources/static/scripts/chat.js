const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const logoutButton = document.getElementById("logoutButton");
const userListDiv = document.getElementById("user-list");
const activeChatName = document.getElementById("activeChatName");

if (messagesDiv && input && sendButton) {
    let username = "";
    let activeChat = null;
    let stompClient = null;
    let isConnected = false;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        username = currentUser.username;
        input.disabled = false;
        sendButton.disabled = false;
        showUserList();
        connectToWebSocket();
    }

    function connectToWebSocket() {
        const socket = new SockJS("http://localhost:8081/ws");
        stompClient = Stomp.over(socket);
        stompClient.debug = () => {};

        stompClient.connect({}, () => {
            isConnected = true;
            stompClient.subscribe("/user/queue/messages", (message) => {
                const msg = JSON.parse(message.body);
                const isForCurrentChat =
                    msg.sender === username || msg.receiver === username;
                const isViewingThisChat =
                    (msg.sender === activeChat || msg.receiver === activeChat) &&
                    (msg.sender === username || msg.receiver === username);

                if (isForCurrentChat && isViewingThisChat && activeChat) {
                    const timestamp = msg.timestamp || getCurrentTime();
                    addMessageToScreen(msg.sender, msg.content, timestamp);
                }
            });
        }, (error) => {
            console.error("WebSocket error:", error);
            isConnected = false;
        });
    }

    function sendMessage() {
        if (!activeChat) {
            alert("Click on a user's name first to start chatting!");
            return;
        }

        if (!isConnected || !stompClient) {
            alert("Still connecting to chat... Please wait a moment.");
            return;
        }

        const text = input.value.trim();
        if (text === "") return;

        const msg = {
            sender: username,
            receiver: activeChat,
            content: text,
            timestamp: getCurrentTime()
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));
        addMessageToScreen(username, text, msg.timestamp);
        input.value = "";
    }

    function addMessageToScreen(messageUsername, text, timestamp) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";

        if (messageUsername === username) {
            messageDiv.classList.add("sent");
        } else {
            messageDiv.classList.add("received");
        }

        const timestampSpan = document.createElement("span");
        timestampSpan.className = "timestamp";
        timestampSpan.textContent = "[" + timestamp + "] ";

        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = messageUsername + ": ";

        const textSpan = document.createElement("span");
        textSpan.textContent = text;

        messageDiv.appendChild(timestampSpan);
        messageDiv.appendChild(usernameSpan);
        messageDiv.appendChild(textSpan);

        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleString([], {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function loadOldMessages() {
        messagesDiv.innerHTML = "";
        if (!activeChat) return;

        const url = "http://localhost:8081/api/chat/" +
            encodeURIComponent(username) + "/" +
            encodeURIComponent(activeChat);

        try {
            const response = await fetch(url);
            const messages = await response.json();

            messages.forEach((m) => {
                const ts = m.timestamp || getCurrentTime();
                addMessageToScreen(m.sender, m.content, ts);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    }

    async function showUserList() {
        userListDiv.innerHTML = "";

        try {
            const response = await fetch("http://localhost:8081/api/users");
            const users = await response.json();

            const otherUsers = users.filter((u) => u.username !== username);

            if (otherUsers.length === 0) {
                const empty = document.createElement("p");
                empty.textContent = "No other users found.";
                empty.className = "no-users";
                userListDiv.appendChild(empty);
                return;
            }

            otherUsers.forEach((u) => {
                const item = document.createElement("div");
                item.className = "user-item";

                const nameSpan = document.createElement("span");
                nameSpan.className = "user-name";
                nameSpan.textContent = u.username;

                item.appendChild(nameSpan);
                item.addEventListener("click", () => {
                    startChatWith(u.username, item);
                });

                userListDiv.appendChild(item);
            });
        } catch (error) {
            console.error("Error loading users:", error);
        }
    }

    function startChatWith(chatUsername, clickedElement) {
        activeChat = chatUsername;
        activeChatName.textContent = "Chatting with " + activeChat;
        input.placeholder = "Message " + activeChat + "...";

        const allUsers = document.querySelectorAll(".user-item");
        allUsers.forEach((el) => el.classList.remove("active"));
        clickedElement.classList.add("active");

        loadOldMessages();
    }

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });

    sendButton.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
}
