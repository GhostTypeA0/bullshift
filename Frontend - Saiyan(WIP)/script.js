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
/* saves post in local storage */
function savePosts() {
    localStorage.setItem("posts", JSON.stringify(posts));
}


// render new post after creation
function renderPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";
 
    /* gets current logged in user */    
    const currentUser = localStorage.getItem("currentUser");

    /* shows the most recent post first */
    posts.slice().reverse().forEach((post, displayIndex) => {
        const realIndex = posts.length - 1 - displayIndex;
        const div = document.createElement("div");
        div.className = "post";        

        /* checks if current logged in user liked a specific post */
        const hasLiked = post.likedBy && post.likedBy.includes(currentUser);
        
        /* records timestamp */        
        const date = new Date(post.timestamp);
        const formattedDate = date.toLocaleString();

        /* shows previous comments */
        const commentsHTML = post.comments.map((comment, commentIndex) => {
        /* checks if current user is the post owner and or the comment author to delete comments */
        const canDeleteComment = currentUser && (post.username === currentUser || comment.username === currentUser);
    
        return `
        <div class="comment-text">
            <strong>${comment.username || 'Anonymous'}:</strong> <span>${comment.text}</span>
            <small style="color: gray; display: block; font-size: 0.75em;">${comment.date}</small>
            ${canDeleteComment ? `<button class="delete-btn" style="font-size:0.7em" onclick="deleteComment(${realIndex}, 
            ${commentIndex})">Delete</button>` : ''}
        </div>
        `;
        }).join('');

        /* creates and returns a new string */       
        div.innerHTML = `
            <div class="post-wrapper">
                <img src="${post.image}" alt="Post image" style="max-width:100%">
                <p class="timestamp"><i>${formattedDate}</i></p>
                <p><strong>${post.username || 'Anonymous'}</strong>: ${post.caption}</p>
            </div>
            <div id="like-container">
                <i onclick="toggleLike(this, ${realIndex})" class="fa fa-thumbs-up" style="cursor: pointer; color: ${hasLiked ? 'blue' : 'black'}">
                </i>
                <span id="like-count-${realIndex}">${post.likedBy ? post.likedBy.length : 0}
                </span>
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
/* checks if user is logged in and redirects to login page if the user is not login */   
    if (!isUserLoggedIn()) {
        alert("You must be logged in to post.");
        window.location.href = "login.html";
        return;
    }

    const fileInput = document.getElementById("imageInput");
    const caption = document.getElementById("caption").value;
    const file = fileInput.files[0];
    /* gets the current user for login/delete/comment/like function and logic */
    const currentUser = localStorage.getItem("currentUser");

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
            username: currentUser /* post tied to user */
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


/* checks if user is logged in to be allowed to like a post */
function toggleLike(iconElement, index) {
    if (!isUserLoggedIn()) {
        alert("Please log in to like posts.");
        return;
    }

/* checks for current user and posts  */
    const currentUser = localStorage.getItem("currentUser");
    const post = posts[index];

/* initializes if a post was previously liked by any user */
    if (!post.likedBy) post.likedBy = [];

/* checks array of users that have liked the post*/
    const userIndex = post.likedBy.indexOf(currentUser);

    if (userIndex > -1) {
/* checks if a user already liked a post, this will unlike the post */
        post.likedBy.splice(userIndex, 1);
        iconElement.style.color = "black";
    } else {
/* checks if a user hasn't liked a post, this will like the post */
        post.likedBy.push(currentUser);
        iconElement.style.color = "blue";
    }

/* updates total like count based on the array length */
    post.likes = post.likedBy.length;
    
    savePosts();
    document.getElementById(`like-count-${index}`).innerText = post.likes;
}


/* adds comment and saves it to localStorage */
function addComment(index) {
    if (!isUserLoggedIn()) {
        alert("Please log in to comment.");
        return;
    }
    const currentUser = localStorage.getItem("currentUser"); /* gets the current user for commenting */
    const input = document.getElementById(`input-${index}`);
    const commentText = input.value.trim();

    if (commentText !== "") {
        const now = new Date();
        posts[index].comments.push({
            text: commentText,
            date: now.toLocaleString(),
            username: currentUser /* stores the author's name to their comment */
        });
        savePosts();
        renderPosts();
    }
}


/* users can delete their own post */
function deletePost(index) {
    const currentUser = localStorage.getItem("currentUser");
/* posts will only delete if the current user matches with the owner of the post */
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
    const currentUser = localStorage.getItem("currentUser");
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
