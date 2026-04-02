// Base URL for backend API
const API_BASE = "http://localhost:8081";

// Pull logged-in user from localStorage. Redirect if missing.
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "login.html";
}
const username = currentUser.username;

// Local state for feed + liked posts
let posts = []; 
let likedPosts = new Set(JSON.parse(localStorage.getItem("likedPosts")) || []);

// DOM references for feed + post creation UI
const feed = document.getElementById("feed");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const captionInput = document.getElementById("caption");
const createPostForm = document.getElementById("createpost");
const logoutButton = document.getElementById("logoutButton");

// Persist liked post IDs locally so UI stays consistent
function saveLikedPosts() {
    localStorage.setItem("likedPosts", JSON.stringify([...likedPosts]));
}

// Convert uploaded image → Base64 for backend storage
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

// Fetch all posts from backend and render them
async function loadPosts() {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        posts = await res.json();
        renderPosts();
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

// Render posts into the feed container
function renderPosts() {
    feed.innerHTML = "";

    posts.forEach((post) => {
        const div = document.createElement("div");
        div.className = "post";
        div.dataset.id = post.id;

        const isLiked = likedPosts.has(post.id);

        // Build post UI using template string (HTML inside JS is intentional)
        div.innerHTML = `
            <div class="post-header">
                <span class="post-username">${post.username}</span>
                <span class="post-date">${formatDate(post.createdAt)}</span>
            </div>

            <img src="${post.image}" alt="Post image" class="post-image">

            <p class="post-caption">${post.caption}</p>

            <div class="post-actions">
                <span class="like-container">
                    <i class="fa fa-thumbs-up like-icon ${isLiked ? 'liked' : ''}"
                       data-id="${post.id}"
                       style="cursor: pointer; color: ${isLiked ? '#007bff' : '#555'};">
                    </i>
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

            ${post.username === username 
                ? `<button class="delete-post-btn" onclick="deletePost(${post.id})">Delete</button>` 
                : ''}
        `;

        feed.appendChild(div);
    });

    // Attach like handlers after DOM is built
    document.querySelectorAll(".like-icon").forEach(icon => {
        icon.addEventListener("click", function() {
            toggleLike(this, this.dataset.id);
        });
    });
}

// Format backend timestamp → readable date/time
function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " +
           date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Like/unlike logic + UI updates + backend sync
async function toggleLike(iconElement, postId) {
    const postIdNum = parseInt(postId);
    const isLiked = likedPosts.has(postIdNum);
    const countSpan = iconElement.nextElementSibling;
    let currentCount = parseInt(countSpan.textContent);

    try {
        if (isLiked) {
            await fetch(`${API_BASE}/api/posts/${postIdNum}/unlike`, { method: "POST" });
            likedPosts.delete(postIdNum);
            iconElement.style.color = "#555";
            iconElement.classList.remove("liked");
            countSpan.textContent = currentCount - 1;
        } else {
            await fetch(`${API_BASE}/api/posts/${postIdNum}/like`, { method: "POST" });
            likedPosts.add(postIdNum);
            iconElement.style.color = "#007bff";
            iconElement.classList.add("liked");
            countSpan.textContent = currentCount + 1;
        }

        saveLikedPosts();
    } catch (err) {
        console.error("Error toggling like:", err);
    }
}

// Add a comment (frontend-only for now)
function addComment(postId) {
    const input = document.getElementById(`input-${postId}`);
    const commentContainer = document.getElementById(`comments-${postId}`);

    if (input.value.trim() !== "") {
        const newComment = document.createElement("p");
        newComment.className = "comment";
        newComment.innerHTML = `<strong>${username}:</strong> ${input.value}`;

        // Inline delete button for comment
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-comment-btn";
        deleteBtn.onclick = () => commentContainer.removeChild(newComment);

        newComment.appendChild(deleteBtn);
        commentContainer.appendChild(newComment);

        input.value = "";
    }
}

// Delete a post (owner-only)
async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        await fetch(`${API_BASE}/api/posts/${postId}`, { method: "DELETE" });
        loadPosts();
    } catch (err) {
        console.error("Error deleting post:", err);
    }
}

// Create a new post (image optional, caption optional)
createPostForm.addEventListener("submit", async function(e) {
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
            body: JSON.stringify({ username, image: imageData, caption })
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

// Show preview when selecting an image
imageInput.addEventListener("change", function() {
    const file = this.files[0];
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

// Logout clears user session
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
});

// Initial feed load
loadPosts();
