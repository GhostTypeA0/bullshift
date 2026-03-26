// Assignment: Bull-Shift App | Posts - JavaScript
// Author: Luke Callahan
/* Author of this comment style: Saiyan Ren */
// import { http } from "./http.js";


// will be replaced with putting in the db
let posts = JSON.parse(localStorage.getItem("posts")) || [];

function savePosts() {
  localStorage.setItem("posts", JSON.stringify(posts));
}

// render new post after creation
function renderPosts() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  posts
    .slice()
    .reverse()
    .forEach((post, displayIndex) => {
      const realIndex = posts.length - 1 - displayIndex;

      const div = document.createElement("div");
      div.className = "post";

      /* posts now have a like and commment button */
      div.innerHTML = `
        <img src="${post.image}" alt="Post image">
        <p>${post.caption}</p>
        <div id="like-container">
        <i onclick="toggleLike(this, 'like-count-${realIndex}')" 
        class="fa fa-thumbs-up" 
        style="cursor: pointer;">
        </i>
        <span id="like-count-${realIndex}">0</span>
        </div>
        <div class="comment-section">
        <div id="comments-${realIndex}"></div>
        <input type="text" id="input-${realIndex}" placeholder="Write a comment...">
        <button onclick="addComment(${realIndex})">Comment</button>
        </div>
        <button onclick="deletePost(${realIndex})">Delete</button>
          `;
      feed.appendChild(div);
    });
}

// create new post function
function addPost() {
  const fileInput = document.getElementById("imageInput");
  const caption = document.getElementById("caption").value;
  const file = fileInput.files[0];

  if (!file || !caption) {
    alert("Please select an image and write a caption.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const imageData = e.target.result;

    posts.push({
      image: imageData,
      caption: caption,
    });

    savePosts();
    renderPosts();

    fileInput.value = "";
    document.getElementById("caption").value = "";
  };

  reader.readAsDataURL(file);
}

/* adds comment container */
function addComment(index) {
    const input = document.getElementById(`input-${index}`);
    const commentContainer = document.getElementById(`comments-${index}`);
    
  /* checks if input has text */
  if (input.value.trim() !== "") {
  /* create paragraph box for comment box */
    const newComment = document.createElement("p");
    newComment.textContent = input.value;

  /* creates delete button for comments */
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.onclick = function() {
      commentContainer.removeChild(newComment);
    };

    newComment.appendChild(deleteButton);

    commentContainer.appendChild(newComment);

    input.value = "";
  }
}


 /* like and unlike count */

function toggleLike(iconElement, countId) {
  const likeCountSpan = document.getElementById(countId);
  let count = parseInt(likeCountSpan.innerText);

  if (iconElement.style.color === "blue") {
    /* unlike */
    iconElement.style.color = "black";
    likeCountSpan.innerText = count - 1;
  } else {
    /* like */
    iconElement.style.color = "blue";
    likeCountSpan.innerText = count + 1;
  }
}

// delete posts
function deletePost(index) {
  posts.splice(index, 1);
  savePosts();
  renderPosts();
}

renderPosts();
