// Assignment: Bull-Shift App | Posts - JavaScript
// Author: Luke Callahan

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

      div.innerHTML = `
      <img src="${post.image}">
      <p>${post.caption}</p>
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


// delete posts
function deletePost(index) {
  posts.splice(index, 1);
  savePosts();
  renderPosts();
}

renderPosts();
