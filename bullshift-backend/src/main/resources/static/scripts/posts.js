// BullShift Posts — Unified Backend Version
// Authors: Luke Callahan, Saiyan Ren
// Backend Integration Cleanup: John R. Nottom IV, Addison S

// backend base URL (LOCAL MODE)
const API_BASE = "";

// DOM elements
const feed = document.getElementById("feed");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const captionInput = document.getElementById("caption");
const createPostForm = document.getElementById("createpost");

// modal open/close
function toggleModel(show) {
    const modal = document.getElementById("postModal");
    modal.style.display = show ? "block" : "none";
}

// close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById("postModal");
    if (event.target === modal) modal.style.display = "none";
};

// state
let posts = [];
let likedPosts = new Set(JSON.parse(localStorage.getItem("likedPosts")) || []);
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// save liked posts
function saveLikedPosts() {
    localStorage.setItem("likedPosts", JSON.stringify([...likedPosts]));
}

// convert file → base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

// compress image before upload
function compressImage(file, maxWidth = 700, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL(file.type, quality);
                resolve(compressed);
            };

            img.onerror = reject;
        };

        reader.onerror = reject;
    });
}

// timestamp formatting
function formatDate(dateStr) {
    if (!dateStr) return { display: "", hover: "" };

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

// load posts from backend
async function loadPosts() {
    try {
        const res = await fetch(`/api/posts`);
        posts = await res.json();
        renderPosts();
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

// render posts
function renderPosts() {
    feed.innerHTML = "";

    posts.forEach((post) => {
        const div = document.createElement("div");
        div.className = "post";
        div.dataset.id = post.id;

        const isLiked = likedPosts.has(post.id);
        const dates = formatDate(post.createdAt);

        // comments (frontend-only)
        const commentsHTML = (post.comments || []).map((comment, index) => {
            const cDate = formatDate(comment.date);
            const canDelete =
                comment.username === currentUser.username ||
                post.username === currentUser.username;

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

        // post HTML
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
                    <input type="text" id="input-${post.id}" maxlength="500" placeholder="Write a comment (max 500)...">
                    <button onclick="addComment(${post.id})">Comment</button>
                </div>
            </div>

            ${post.username === currentUser.username
                ? `<button class="delete-post-btn" onclick="deletePost(${post.id})">Delete</button>`
                : ""}
        `;

        feed.appendChild(div);
    });

    // like handlers
    document.querySelectorAll(".like-icon").forEach(icon => {
        icon.addEventListener("click", () => toggleLike(icon, icon.dataset.id));
    });
}

// like/unlike post
async function toggleLike(iconElement, postId) {
    const id = parseInt(postId);
    const isLiked = likedPosts.has(id);
    const countSpan = iconElement.nextElementSibling;
    let currentCount = parseInt(countSpan.textContent);

    try {
        if (isLiked) {
            await fetch(`/api/posts/${id}/unlike`, { method: "POST" });
            likedPosts.delete(id);
            iconElement.style.color = "#555";
            iconElement.classList.remove("liked");
            countSpan.textContent = currentCount - 1;
        } else {
            await fetch(`/api/posts/${id}/like`, { method: "POST" });
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

// add comment (frontend-only)
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

// delete comment (frontend-only)
function deleteComment(postId, commentIndex) {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.comments) return;

    post.comments.splice(commentIndex, 1);
    renderPosts();
}

// delete post
async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        await fetch(`/api/posts/${postId}`, { method: "DELETE" });
        loadPosts();
    } catch (err) {
        console.error("Error deleting post:", err);
    }
}

// create post
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
        if (file) imageData = await compressImage(file, 800, 0.8);

        const res = await fetch(`/api/posts`, {
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
            toggleModel(false);
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

// image preview
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

// initial load
loadPosts();
