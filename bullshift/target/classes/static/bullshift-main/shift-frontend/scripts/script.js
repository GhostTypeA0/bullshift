// Assignment: Bull-Shift App | Messages - JavaScript
// Author: Luke Callahan
import { http } from "./http.js";

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// this will be enabled when user creation is finished 😊
// const username = "User";

// time/date stamp before message
function getTimestamp() {
  const now = new Date();
  return now.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// message input/output
function sendMessage() {
  const text = input.value.trim();
  if (text === "") return;

  const messageDiv = document.createElement("div");
  messageDiv.className = "message";

  const timestampSpan = document.createElement("span");
  timestampSpan.className = "timestamp";
  timestampSpan.textContent = `[${getTimestamp()}]\u00A0`;

  // this will be enabled when user creation is finished 😊
  // const usernameSpan = document.createElement("span");
  // usernameSpan.className = "username";
  // usernameSpan.textContent = username + ":";

  const textSpan = document.createElement("span");
  textSpan.textContent = text;
  messageDiv.appendChild(timestampSpan);

  // this will be enabled when user creation is finished 😊
  // messageDiv.appendChild(usernameSpan);

  messageDiv.appendChild(textSpan);
  messagesDiv.appendChild(messageDiv);
  input.value = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// sends message to #message
sendButton.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});
