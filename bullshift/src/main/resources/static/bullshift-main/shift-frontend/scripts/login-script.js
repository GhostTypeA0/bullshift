// Assignment: Bull-Shift App | Login Script - JS
// Author: Luke Callahan


// { userPost } from "./http.js";

// --- Toggle Forms ---
const createForm = document.getElementById("createForm");
const loginForm = document.getElementById("loginForm");

// create form / card
document.getElementById("showCreate").addEventListener("click", () => {
  createForm.style.display = "flex";
  loginForm.style.display = "none";
});

// login form / card
document.getElementById("showLogin").addEventListener("click", () => {
  createForm.style.display = "none";
  loginForm.style.display = "flex";
});

// --- Create User ---
createForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // gather elements
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("createMessage");

  // user + pass are REQUIRED
  if (!username || !password) {
    message.style.color = "red";
    message.textContent = "Username and password are required!";
    return;
  }

  // push new user into lS via JSON

  //THIS IS WHERE THE USER INFORMATION IS SENT TO FETCH. ---------------------------------------------------------
  const user = { username, email: email || null, password };
  //userPost(user);

  // validate user creation
  message.style.color = "green";
  message.textContent = "User created successfully!";
  createForm.reset();
});

// --- Login User ---
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const message = document.getElementById("loginMessage");

  // find and use user + pass from lS

  const user = { username };

  // if user exists in lS, "login", if not, throw invalid
  if (user) {
    message.style.color = "green";
    message.textContent = `Login successful! Welcome, ${user.username}.`;

    // 2. auto navigate to chat (can be changed when adding other features)
    setTimeout(() => {
      window.location.href = "/messages";
    }, 1000); // 1 second delay so user sees success message

    loginForm.reset();
  } else {
    message.style.color = "red";
    message.textContent = "Invalid username or password.";
  }
});

// --- Render Users Table ---


function renderUsers() { //THIS RENDERS THE USERS, REMOVE AT SOME POINT ==========================================================================================
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";

  // add new table entry per new created user and append to table
}

// Load users on page load