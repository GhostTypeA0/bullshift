// Assignment: Bull-Shift App | Posts - JavaScript
// Authors: Luke Callahan, Saiyan Ren
// Merged + Backend Integration: John R. Nottom IV, Addison S

// BACKEND BASE URL
const API_BASE = "http://localhost:8081";

// DOM ELEMENTS
const feed = document.getElementById("feed");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const captionInput = document.getElementById("caption");
const createPostForm = document.getElementById("createpost");

// MODAL OPEN/CLOSE LOGIC (from original UI)
function toggleModel(show) {
    const model = document.getElementById("postModal");
    model.style.display = show ? "block" : "none";
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const model = document.getElementById("postModal");
    if (event.target === model) {
        model.style.display = "none";
    }
};

// STATE
let posts = [];
let likedPosts = new Set(JSON.parse(localStorage.getItem("likedPosts")) || []);
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// HELPERS
function saveLikedPosts() {
    localStorage.setItem("likedPosts", JSON.stringify([...likedPosts]));
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    const hoverOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    return {
        display: `[${date.toLocaleString()}]`,
        hover: `[ ${date.toLocaleString(undefined, hoverOptions)} ]`
    };
}

// LOAD POSTS FROM BACKEND
async function loadPosts() {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        posts = await res.json();
        renderPosts();
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

// RENDER POSTS
function renderPosts() {
    feed.innerHTML = "";

    posts.forEach((post) => {
        const div = document.createElement("div");
        div.className = "post";
        div.dataset.id = post.id;

        const isLiked = likedPosts.has(post.id);
        const dates = formatDate(post.createdAt);

        // COMMENTS (frontend-only)
        const commentsHTML = (post.comments || []).map((comment, index) => {
            const cDate = formatDate(comment.date);
            const canDelete =
                comment.username === post.username ||
                comment.username === currentUser.username;

            return `
                <div class="comment-text">
                    <strong>${comment.username}:</strong> ${comment.text}
                    <small class="timestamp" title="${cDate.hover}" style="color: gray; display: block; font-size: 0.75em;">
                        ${cDate.display}
                    </small>
                    ${canDelete ? `<button class="delete-button" onclick="deleteComment(${post.id}, ${index})">Delete</button>` : ""}
                </div>
            `;
        }).join("");

        // POST HTML
        div.innerHTML = `
            <div class="post-wrapper">
                <img src="${post.image}" class="post-image" alt="Post image">
                <p class="timeStamp" title="${dates.hover}">
                    <i>${dates.display}</i>
                </p>
                <p><strong>${post.username}</strong>: ${post.caption}</p>
            </div>

            <div class="post-actions">
                <span class="like-container">
                    <i class="fa fa-thumbs-up like-icon ${isLiked ? "liked" : ""}"
                       data-id="${post.id}"
                       style="cursor:pointer; color:${isLiked ? "#007bff" : "#555"};">
                    </i>
                    <span class="like-count">${post.likeCount}</span>
                </span>
            </div>

            <div class="comment-section">
                <div class="comments-list" id="comments-${post.id}">
                    ${commentsHTML}
                </div>
                <div class="comment-input-row">
                    <input type="text" id="input-${post.id}" placeholder="Write a comment...">
                    <button onclick="addComment(${post.id})">Comment</button>
                </div>
            </div>

            ${post.username === currentUser.username
                ? `<button class="delete-post-btn" onclick="deletePost(${post.id})">Delete</button>`
                : ""}
        `;

        feed.appendChild(div);
    });

    // LIKE HANDLERS
    document.querySelectorAll(".like-icon").forEach(icon => {
        icon.addEventListener("click", () => toggleLike(icon, icon.dataset.id));
    });
}

// LIKE / UNLIKE POST
async function toggleLike(iconElement, postId) {
    const id = parseInt(postId);
    const isLiked = likedPosts.has(id);
    const countSpan = iconElement.nextElementSibling;
    let currentCount = parseInt(countSpan.textContent);

    try {
        if (isLiked) {
            await fetch(`${API_BASE}/api/posts/${id}/unlike`, { method: "POST" });
            likedPosts.delete(id);
            iconElement.style.color = "#555";
            iconElement.classList.remove("liked");
            countSpan.textContent = currentCount - 1;
        } else {
            await fetch(`${API_BASE}/api/posts/${id}/like`, { method: "POST" });
            likedPosts.add(id);
            iconElement.style.color = "#007bff";
            iconElement.classList.add("liked");
            countSpan.textContent = currentCount + 1;
        }

        saveLikedPosts();
    } catch (err) {
        console.error("Error toggling like:", err);
    }
}

// COMMENTS (FRONTEND-ONLY)
function addComment(postId) {
    const input = document.getElementById(`input-${postId}`);
    const text = input.value.trim();
    if (!text) return;

    const post = posts.find(p => p.id === postId);
    if (!post.comments) post.comments = [];

    post.comments.push({
        username: currentUser.username,
        text,
        date: new Date().toISOString()
    });

    input.value = "";
    renderPosts();
}

function deleteComment(postId, commentIndex) {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.comments) return;

    post.comments.splice(commentIndex, 1);
    renderPosts();
}

// DELETE POST
async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        await fetch(`${API_BASE}/api/posts/${postId}`, { method: "DELETE" });
        loadPosts();
    } catch (err) {
        console.error("Error deleting post:", err);
    }
}

// CREATE POST
createPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = imageInput.files[0];
    const caption = captionInput.value.trim();

    if (!file && !caption) {
        alert("Please select an image or write a caption.");
        return;
    }

    const postButton = document.getElementById("postButton");
    postButton.disabled = true;
    postButton.textContent = "Posting...";

    try {
        let imageData = null;
        if (file) imageData = await toBase64(file);

        const res = await fetch(`${API_BASE}/api/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: currentUser.username,
                image: imageData,
                caption
            })
        });

        if (res.ok) {
            imageInput.value = "";
            imagePreview.style.display = "none";
            captionInput.value = "";
            loadPosts();
        } else {
            alert("Failed to create post.");
        }
    } catch (err) {
        console.error("Error creating post:", err);
        alert("Error creating post.");
    } finally {
        postButton.disabled = false;
        postButton.textContent = "Post";
    }
});

// IMAGE PREVIEW
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = "none";
    }
});

// INITIAL LOAD
loadPosts();
