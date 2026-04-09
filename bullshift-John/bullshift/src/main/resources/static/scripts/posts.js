// Ensure user is logged in
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "login.html";
}
const username = currentUser.username;

// State
let allPosts = [];
let likedPosts = new Set();

const storedLikes = localStorage.getItem("likedPosts");
if (storedLikes) {
    likedPosts = new Set(JSON.parse(storedLikes));
}

// DOM references
const feed = document.getElementById("feed");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const captionInput = document.getElementById("caption");
const createPostForm = document.getElementById("createpost");
const logoutButton = document.getElementById("logoutButton");

// WebSocket
let stompClient = null;
let isConnected = false;

function connectToWebSocket() {
    const socket = new SockJS("http://localhost:8081/ws");
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect({}, () => {
        isConnected = true;

        stompClient.subscribe("/topic/posts", (message) => {
            handlePostUpdate(JSON.parse(message.body));
        });
    }, () => {
        isConnected = false;
    });
}

function handlePostUpdate(event) {
    const type = event.type;
    const postId = event.postId;

    if (type === "new_post") {
        allPosts.unshift(event.post);
        renderPosts();
    }

    if (type === "delete") {
        allPosts = allPosts.filter(p => p.id !== postId);
        renderPosts();
    }

    if (type === "like" || type === "unlike") {
        allPosts.forEach(post => {
            if (post.id === postId) {
                post.likeCount = event.likeCount;
            }
        });
        renderPosts();
    }

    if (type === "update") {
        const updated = event.post;
        allPosts = allPosts.map(p => p.id === updated.id ? updated : p);
        renderPosts();
    }
}

async function loadPosts() {
    try {
        const response = await fetch("http://localhost:8081/api/posts");
        allPosts = await response.json();
        renderPosts();
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

function renderPosts() {
    feed.innerHTML = "";

    allPosts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.dataset.id = post.id;

        const isLiked = likedPosts.has(post.id);

        postDiv.innerHTML =
            `<div class="post-header">
                <span class="post-username">${escapeHtml(post.username)}</span>
                <span class="post-date">${formatDate(post.createdAt)}</span>
            </div>
            <img src="${post.image}" class="post-image">
            <p class="post-caption">${escapeHtml(post.caption)}</p>
            <div class="post-actions">
                <span class="like-container">
                    <i class="fa fa-thumbs-up like-icon ${isLiked ? "liked" : ""}"
                       data-id="${post.id}"
                       style="cursor:pointer;color:${isLiked ? "#007bff" : "#555"}"></i>
                    <span class="like-count">${post.likeCount}</span>
                </span>
                <div class="comment-section">
                    <div class="comments-list" id="comments-${post.id}"></div>
                    <div class="comment-input-row">
                        <input type="text" id="input-${post.id}" placeholder="Write a comment...">
                        <button onclick="addComment(${post.id})">Comment</button>
                    </div>
                </div>
            </div>
            ${post.username === username ? `<button class="delete-post-btn" onclick="deletePost(${post.id})">Delete</button>` : ""}`;

        feed.appendChild(postDiv);
    });

    document.querySelectorAll(".like-icon").forEach(icon => {
        icon.addEventListener("click", () => {
            toggleLike(icon.getAttribute("data-id"));
        });
    });
}

async function toggleLike(postId) {
    const id = parseInt(postId);
    const isLiked = likedPosts.has(id);

    const icon = document.querySelector(`.like-icon[data-id="${id}"]`);
    const countSpan = icon.nextElementSibling;

    try {
        if (isLiked) {
            await fetch(`http://localhost:8081/api/posts/${id}/unlike`, { method: "POST" });
            likedPosts.delete(id);
            icon.style.color = "#555";
            icon.classList.remove("liked");
            countSpan.textContent = parseInt(countSpan.textContent) - 1;
        } else {
            await fetch(`http://localhost:8081/api/posts/${id}/like`, { method: "POST" });
            likedPosts.add(id);
            icon.style.color = "#007bff";
            icon.classList.add("liked");
            countSpan.textContent = parseInt(countSpan.textContent) + 1;
        }

        saveLikedPosts();
    } catch (err) {
        console.error("Error toggling like:", err);
    }
}

function addComment(postId) {
    const input = document.getElementById(`input-${postId}`);
    const container = document.getElementById(`comments-${postId}`);

    if (input.value.trim() === "") return;

    const comment = document.createElement("p");
    comment.className = "comment";
    comment.innerHTML = `<strong>${escapeHtml(username)}:</strong> ${escapeHtml(input.value)}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-comment-btn";
    deleteBtn.onclick = () => container.removeChild(comment);

    comment.appendChild(deleteBtn);
    container.appendChild(comment);

    input.value = "";
}

async function deletePost(postId) {
    if (!confirm("Delete this post?")) return;

    try {
        await fetch(`http://localhost:8081/api/posts/${postId}`, { method: "DELETE" });
    } catch (err) {
        console.error("Error deleting post:", err);
    }
}

createPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = imageInput.files[0];
    const caption = captionInput.value.trim();

    if (!file && !caption) return;

    const postButton = document.getElementById("postButton");
    postButton.disabled = true;
    postButton.textContent = "Posting...";

    try {
        let imageData = null;
        if (file) {
            imageData = await convertToBase64(file);
        }

        await fetch("http://localhost:8081/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                image: imageData,
                caption
            })
        });

        imageInput.value = "";
        imagePreview.style.display = "none";
        captionInput.value = "";
    } catch (err) {
        console.error("Error creating post:", err);
    } finally {
        postButton.disabled = false;
        postButton.textContent = "Post";
    }
});

// Helpers
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function saveLikedPosts() {
    localStorage.setItem("likedPosts", JSON.stringify([...likedPosts]));
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) {
        imagePreview.style.display = "none";
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
});

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
});

// Start
connectToWebSocket();
loadPosts();
