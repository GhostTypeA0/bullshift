// Assignment: Bull-Shift App | Login Script - JS
// Author: Luke Callahan, Saiyan Ren
/* Author of this comment style: Saiyan Ren */

// --- Toggle Forms ---
const createForm = document.getElementById("createForm");
const loginForm = document.getElementById("loginForm");

/* character max length limit */
const LIMITS = {
  username: 30,
  email: 50,
  password: 30
};

document.getElementById("loginUsername").maxLength = LIMITS.username;
document.getElementById("loginPassword").maxLength = LIMITS.password;
document.getElementById("username").maxLength = LIMITS.username;
document.getElementById("email").maxLength = LIMITS.email;
document.getElementById("password").maxLength = LIMITS.password;


// --- Create User ---
createForm.addEventListener("submit", function (e) {
  e.preventDefault();
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

  /* character limit check for user creation */
  if (username.length > LIMITS.username || password.length > LIMITS.password || email.length > LIMITS.email) {
    message.style.color = "red";
    message.textContent = `Max limits: User(${LIMITS.username}), Email(${LIMITS.email}), Pass(${LIMITS.password})`;
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  /* prevents duplicate usernames */
  if (users.some(u => u.username === username)) {
    message.style.color = "red";
    message.textContent = "Username already exists!";
    return;
  }
  /* pushes new user into local storage */
  users.push({ username, email: email || null, password });
  localStorage.setItem("users", JSON.stringify(users));

  // validates user creation     
  message.style.color = "green";
  message.textContent = "User created successfully!";
  createForm.reset();
  if (typeof renderUsers === "function") renderUsers(); /* checks renderUsers then calls to update the user list */
});

  /* recommended email text */
  const emailInput = document.getElementById("email");
  const createMessage = document.getElementById("createMessage");

  /* show the message when the email box is clicked on */
  emailInput.addEventListener("click", function(e) {
    createMessage.style.color = "green";
    createMessage.textContent = "Email isn't required but reccomended in account creation";
    
    /* stops the click from bubbling up to the form instantly */
    e.stopPropagation(); 
    }, { once: true });

  /* will hide the message when clicking anywhere else on the page */
  document.addEventListener("click", function() {
    createMessage.textContent = "";
});

// --- Login User ---
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const message = document.getElementById("loginMessage");

  /* checks character limit preventing long character strings */
  if (username.length > LIMITS.username || password.length > LIMITS.password) {
    message.style.color = "red";
    message.textContent = "Invalid username or password format.";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    message.style.color = "green";
    message.textContent = `Login successful! Welcome, ${user.username}.`;
    localStorage.setItem("currentUser", JSON.stringify(user));
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
    loginForm.reset();
  } else {
    message.style.color = "red";
    message.textContent = "Invalid username or password.";
  }
});

// Navigation Toggles
document.getElementById("showCreate").addEventListener("click", () => {
  createForm.style.display = "flex";
  loginForm.style.display = "none";
});

document.getElementById("showLogin").addEventListener("click", () => {
  createForm.style.display = "none";
  loginForm.style.display = "flex";
});
