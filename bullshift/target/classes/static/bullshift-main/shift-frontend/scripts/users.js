// Assignment: Bull-Shift App | User Login - JavaScript
// Author: Luke Callahan + Saiyan
import { http } from "./http.js";

const users = [
  { username: "user1", password: "pass1" },
  { username: "user2", password: "pass2" },
];

function login(username, password) {
  return users.some(
    (user) => user.username === username && user.password === password,
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-box");
  const loggedInDiv = document.getElementById("loggedin-user");
  const message = document.getElementById("login-message");

  const originalLoggedInText = loggedInDiv.textContent;

  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const logoutButton = document.getElementById("logoutButton");

  // Handle login
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = form.querySelector('input[type="text"]').value;
    const password = form.querySelector('input[type="password"]').value;

    if (login(username, password)) {
      loggedInDiv.textContent = username + "@bshift";

      // Enable input row
      messageInput.disabled = false;
      sendButton.disabled = false;
      
      message.style.color = "green";
      message.textContent = username + " has logged in";
    } else {
      message.style.color = "red";
      message.textContent = "Invalid username or password";
    }
  });

  // Handle logout
  logoutButton.addEventListener("click", () => {
    loggedInDiv.textContent = originalLoggedInText; // Reset to default
    messageInput.disabled = true;
    sendButton.disabled = true;

    // Clear input fields
    form.querySelector('input[type="text"]').value = "";
    form.querySelector('input[type="password"]').value = "";

    message.textContent = "";
  });
});