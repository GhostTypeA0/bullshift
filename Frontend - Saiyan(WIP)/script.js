// Assignment: Bull-Shift App | Posts - JavaScript
// Author: Luke Callahan
/* Author of this comment style: Saiyan Ren */
// import { http } from "./http.js";


// Load posts from localStorage or initialize empty array
let posts = JSON.parse(localStorage.getItem("posts")) || [];

/* checks if user is logged in */
function isUserLoggedIn() {
    return localStorage.getItem("currentUser") !== null;
}

function savePosts() {
    localStorage.setItem("posts", JSON.stringify(posts));
}

// render new post after creation
function renderPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";
    
    /* gets user */
    const currentUser = localStorage.getItem("currentUser");

    /* shows the most recent post first */
    posts.slice().reverse().forEach((post, displayIndex) => {
        const realIndex = posts.length - 1 - displayIndex;
        const div = document.createElement("div");
        div.className = "post";

        /* records timestamp */
        const date = new Date(post.timestamp);
        const formattedDate = date.toLocaleString();

        /* shows previous comments */
        const commentsHTML = post.comments.map((comment, commentIndex) => `
            <div class="comment-text">
                <span>${comment.text}</span>
                <small style="color: gray; display: block; font-size: 0.75em;">${comment.date}</small>
                <button class="delete-btn" style="font-size:0.7em" onclick="deleteComment(${realIndex}, ${commentIndex})">Delete Comment</button>
            </div>
        `).join('');

        /* creates and returns a new string */
        div.innerHTML = `
            <div class="post-wrapper">
                <img src="${post.image}" alt="Post image" style="max-width:100%">
                <p class="timestamp"><i>${formattedDate}</i></p>
                <p><strong>${post.username || 'Anonymous'}</strong>: ${post.caption}</p>
            </div>
            <div id="like-container">
                <i onclick="toggleLike(this, ${realIndex})" class="fa fa-thumbs-up" style="cursor: pointer; color: ${post.liked ? 'blue' : 'black'}"> </i>
                <span id="like-count-${realIndex}">${post.likes}</span>
            </div>
            <div class="chat-wrapper">
                <div id="comments-${realIndex}">${commentsHTML}</div>
                <input type="text" id="input-${realIndex}" placeholder="Write a comment...">
                <button onclick="addComment(${realIndex})">Comment</button>
            </div>
            ${(currentUser && post.username === currentUser) ? `<button onclick="deletePost(${realIndex})">Delete Post</button>` : ''}
        `;
        feed.appendChild(div);
    });
}

// create new post function
function addPost() {
    /* checks if user is logged in */
    if (!isUserLoggedIn()) {
        alert("You must be logged in to post. Redirecting to login...");
        window.location.href = "login.html"; /* redirects to login page if user is not logged in */
        return;
    }

    const fileInput = document.getElementById("imageInput");
    const caption = document.getElementById("caption").value;
    const file = fileInput.files[0];
    const username = localStorage.getItem("currentUser"); 

    if (!file || !caption) {
        alert("Please select an image and write a caption.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const imageData = e.target.result;
        
        /* post with info */
        posts.push({
            image: imageData,
            caption: caption,
            timestamp: new Date().getTime(),
            likes: 0,
            liked: false,
            comments: [],
            username: username /* post tied to user */
        });
        savePosts();
        renderPosts();
        fileInput.value = "";
        document.getElementById("caption").value = "";
    };
    reader.readAsDataURL(file);
}

/* logouts and returns to login.html */
function logoutUser() {
    localStorage.removeItem("currentUser");
    alert("You have been logged out.");
    window.location.href = "login.html";
}

/* adds comment and saves it to localStorage */
function addComment(index) {
    /* Logged in users can only comment */
    if (!isUserLoggedIn()) {
        alert("Please log in to comment.");
        return;
    }

    const input = document.getElementById(`input-${index}`);
    const commentText = input.value.trim();
    if (commentText !== "") {
        const now = new Date();
        const timestamp = now.toLocaleString();
        posts[index].comments.push({
            text: commentText,
            date: timestamp
        });
        savePosts();
        renderPosts();
    }
}

/* deletes comments. */
function deleteComment(postIndex, commentIndex) {
    posts[postIndex].comments.splice(commentIndex, 1);
    savePosts();
    renderPosts();
}

/* like and unlike persistence*/
function toggleLike(iconElement, index) {
    if (!isUserLoggedIn()) {
        alert("Please log in to like posts.");
        return;
    }

    if (posts[index].liked) {
        /* object value unlike */
        posts[index].likes--;
        posts[index].liked = false;
        iconElement.style.color = "black";
    } else {
        /* object value unlike */
        posts[index].likes++;
        posts[index].liked = true;
        iconElement.style.color = "blue";
    }
    savePosts();
    document.getElementById(`like-count-${index}`).innerText = posts[index].likes;
}

    /* users can delete their own post */
function deletePost(index) {
    const currentUser = localStorage.getItem("currentUser");
    if (posts[index].username === currentUser) {
        posts.splice(index, 1);
        savePosts();
        renderPosts();
    } else {
        alert("You cannot delete other users' posts.");
    }
}


renderPosts();
