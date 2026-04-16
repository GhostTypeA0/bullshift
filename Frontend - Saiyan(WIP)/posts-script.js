// Assignment: Bull-Shift App | Posts - JavaScript
// Author: Luke Callahan
/* Author of this comment style: Saiyan Ren */
// import { http } from "./http.js";


// Load posts from localStorage or initialize empty array
let posts = JSON.parse(localStorage.getItem("posts")) || [];

/* gets current user logging in */
function getCurrentUsername() {
    const user = localStorage.getItem("currentUser");
    if (!user) return null;
    
    /* checks if stored value is a json object or a string */
    try {
        const parsed = JSON.parse(user);
        return typeof parsed === 'object' ? parsed.username : user;
    } catch (e) {
        return user; 
    }
}

/* checks if user is logged in */
function isUserLoggedIn() {
    return getCurrentUsername() !== null;
}

/* saves post in local storage */
function savePosts() {
    localStorage.setItem("posts", JSON.stringify(posts));
}

/* toggles the overlay model to show */
function toggleModel(show) {
    const model = document.getElementById("postModel");
    model.style.display = show ? "block" : "none";
}

/* if model is on screen it can be interacted with */
window.onclick = function(event) {
    const model = document.getElementById("postModel");
    if (event.target == model) {
        model.style.display = "none";
    }
}


// render new post after creation
function renderPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";
    const currentUser = getCurrentUsername();  /* gets current logged in user */   


    posts.slice().reverse().forEach((post, displayIndex) => {
        const realIndex = posts.length - 1 - displayIndex;
        const div = document.createElement("div");
        div.className = "post";

        const hasLiked = post.likedBy && post.likedBy.includes(currentUser); /* checks if current logged in user liked a specific post */

        /* records timestamp */  
        const date = new Date(post.timestamp);
        const formattedDate = date.toLocaleString();

        /* shows previous comments */
        const commentsHTML = (post.comments || []).map((comment, commentIndex) => {
        /* checks if current user is the post owner and or the comment author to delete comments */ /* timestamp class will have the hover effect with formatted date */  
        const canDeleteComment = currentUser && (post.username === currentUser || comment.username === currentUser);
    
        return `
        <div class="comment-text">
        <strong>${comment.username || 'Anonymous'}:</strong> 
        <span>${comment.text}</span>
        <small class="timestamp" title="Posted on: ${comment.date}" style="color: gray; display: block; font-size: 0.75em; cursor: help;">
            ${comment.date}
        </small>
        ${canDeleteComment ? `<button class="delete-btn" style="font-size:0.7em" onclick="deleteComment(${realIndex}, ${commentIndex})">Delete</button>` : ''}
        </div>
        `;
    }).join('');

        /* creates and returns a new string */ /* timeStamp class will have the hover effect with formatted date */  
            div.innerHTML = `
            <div class="post-wrapper">
            <img src="${post.image}" alt="Post image" style="max-width:100%"> 
            <p class="timeStamp" title="Posted on: ${formattedDate}">            
            <i>${formattedDate}</i>
            </p>
            <p><strong>${post.username || 'Anonymous'}</strong>: ${post.caption}</p>
            </div>
            <div id="like-container">
                <i onclick="toggleLike(this, ${realIndex})" class="fa fa-thumbs-up" style="cursor: pointer; color: ${hasLiked ? 'blue' : 'black'}"> </i>
                <span id="like-count-${realIndex}">${post.likedBy ? post.likedBy.length : 0} </span>
            </div>
            <div class="comment-wrapper">
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
/* checks if user is logged in and redirects to login page if the user is not login */ 
    const currentUser = getCurrentUsername();
    if (!currentUser) {
        alert("You must be logged in to post.");
        window.location.href = "login.html";
        return;
    }

    const fileInput = document.getElementById("imageInput");
    const caption = document.getElementById("caption").value;
    const file = fileInput.files[0];

    if (!file || !caption) {
        alert("Please select an image and write a caption.");
        return;
    }

    /* pushes post with the following info */  
    const reader = new FileReader();
    reader.onload = function (e) {
        posts.push({
            image: e.target.result,
            caption: caption,
            timestamp: new Date().getTime(),
            likedBy: [],
            comments: [],
            username: currentUser 
        });
        savePosts();
        renderPosts();
        fileInput.value = "";
        document.getElementById("caption").value = "";
    };
    reader.readAsDataURL(file);
}

/* logouts and returns to login.html */
window.logoutUser = function() {
    console.log("Logout successful");
    localStorage.removeItem("currentUser");
    alert("You have been logged out.");
    window.location.href = "login.html"; 
};

/* failsafe to insure logout is successful and returns to login.html */
function logoutUser() {
    try {
        localStorage.removeItem("currentUser");
        alert("Redirecting to login...");
        
        
        window.location.href = "/login.html"; 
    } catch (err) {
        console.error("Logout failed:", err);
    }
}

window.logoutUser = logoutUser;


/* checks if user is logged in to be allowed to like a post */
function toggleLike(iconElement, index) {
    const currentUser = getCurrentUsername();
    if (!currentUser) {
        alert("Please log in to like posts.");
        return;
    }

    const post = posts[index];
    if (!post.likedBy) post.likedBy = [];

    const userIndex = post.likedBy.indexOf(currentUser);
    if (userIndex > -1) {
        post.likedBy.splice(userIndex, 1);
    } else {
        post.likedBy.push(currentUser);
    }

    savePosts();
    renderPosts();
}

/* adds comment and saves it to localStorage */
function addComment(index) {
    const currentUser = getCurrentUsername(); 
    if (!currentUser) {
        alert("Please log in to comment.");
        return;
    }

    const input = document.getElementById(`input-${index}`);
    const commentText = input.value.trim();

    if (commentText !== "") {
        posts[index].comments.push({
            text: commentText,
            date: new Date().toLocaleString(),
            username: currentUser 
        });
        savePosts();
        renderPosts();
    }
}

/* users can delete their own post */
function deletePost(index) {
/* posts will only delete if the current user matches with the owner of the post */
    const currentUser = getCurrentUsername();
    if (posts[index].username === currentUser) {
        if(confirm("Are you sure you want to delete your post?")) {
            posts.splice(index, 1);
            savePosts();
            renderPosts();
        }
    }
}

/* users can delete their comments. */
function deleteComment(postIndex, commentIndex) {
    const currentUser = getCurrentUsername();
    const post = posts[postIndex];
    const comment = post.comments[commentIndex];

/* checks if user is the owner of the post or the author of the comment to delete them */
    if (currentUser && (post.username === currentUser || comment.username === currentUser)) {
        if (confirm("Delete this comment?")) {
            post.comments.splice(commentIndex, 1);
            savePosts();
            renderPosts();
        }
    }
}


renderPosts();
