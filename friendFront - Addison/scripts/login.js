// Assignment: Bull-Shift App | Login Script - JS
// Author: Luke Callahan


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
  const users = JSON.parse(localStorage.getItem("users")) || [];
  users.push({ username, email: email || null, password });
  localStorage.setItem("users", JSON.stringify(users));

  // validate user creation
  message.style.color = "green";
  message.textContent = "User created successfully!";
  createForm.reset();
  renderUsers();
});

// --- Login User ---
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const message = document.getElementById("loginMessage");

  // find and use user + pass from lS
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  // if user exists in lS, "login", if not, throw invalid
  if (user) {
    message.style.color = "green";
    message.textContent = `Login successful! Welcome, ${user.username}.`;

    // 1. store current user in lS
    localStorage.setItem("currentUser", JSON.stringify(user));

    // 2. auto navigate to chat (can be changed when adding other features)
    setTimeout(() => {
      window.location.href = "../messages/chat.html";
    }, 1000); // 1 second delay so user sees success message

    loginForm.reset();
  } else {
    message.style.color = "red";
    message.textContent = "Invalid username or password.";
  }
});

// --- Render Users Table ---
function renderUsers() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";

  // add new table entry per new created user and append to table
  users.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email || ""}</td>
      <td>${user.password}</td>
    `;
    tbody.appendChild(row);
  });
}

// Load users on page load
renderUsers();