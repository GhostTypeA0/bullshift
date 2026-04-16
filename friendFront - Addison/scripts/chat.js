// Assignment: Bull-Shift App | Chatbox Script v.8 (I think) - JS
// Author: Luke Callahan


// Section 1: DOM elements & global variables
// DOM elements
// { http } from "./http.js";

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const loggedInDiv = document.getElementById("loggedin-user");
const logoutButton = document.getElementById("logoutButton");
const userListDiv = document.getElementById("no-friends");
const imageInput = document.getElementById("imageInput");
const imageButton = document.getElementById("imageButton");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

// global variables
let username = "";
let activeChat = null;

// Section 2: Auth Check
// logged in user check
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

// if no user, go back to login page, else, update page elements
if (!currentUser) {
  window.location.href = "login.html";
} else {
  username = currentUser.username;
  input.disabled = false;
  sendButton.disabled = false;
  loggedInDiv.textContent = username + "@bshift";
}

// Section 3: Timestamp generator + img to Base64
// timestamp function
function getTimestamp() {
  const now = new Date();
  return now.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// base64 converter function (basically image to URL link)
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

// Section 4: Create message element
// message element gen function
function createMessageElement(messageUsername, text, timestamp, image) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";

  // stylings
  if (messageUsername === username) {
    messageDiv.classList.add("sent"); // styled in blue
  } else {
    messageDiv.classList.add("received"); // styled in grey
  }

  // gen timestamp element
  const timestampSpan = document.createElement("span");
  timestampSpan.className = "timestamp";
  timestampSpan.textContent = `[${timestamp}]\u00A0`;

  // gen user element
  const usernameSpan = document.createElement("span");
  usernameSpan.className = "username";
  usernameSpan.textContent = messageUsername + ":";

  messageDiv.appendChild(timestampSpan);
  messageDiv.appendChild(usernameSpan);

  // gen message element
  if (text) {
    const textSpan = document.createElement("span");
    textSpan.textContent = text;
    messageDiv.appendChild(textSpan);
  }

  // gen img element
  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.className = "chat-image";
    img.style.maxWidth = "200px";
    img.style.display = "block";
    img.style.marginTop = "5px";
    messageDiv.appendChild(img);
  }

  return messageDiv;
}

// Section 5: ChatKey generator
function getChatKey(userA, userB) {
  return "messages_" + [userA, userB].sort().join("_");
}

// Section 6: Message sender
async function sendMessage() {
  if (!activeChat) {
    alert("Select a user to chat with first."); // self explanitory I think
    return;
  }

  // message/input values/files
  const text = input.value.trim(); // prevents empty message
  const file = imageInput.files[0]; // access selected file

  if (!text && !file) return;

  // gen timestamp for message
  const timestamp = getTimestamp();
  let imageData = null;

  if (file) {
    imageData = await toBase64(file); // base64 converter
  }

  // gen message
  const messageElement = createMessageElement(
    username,
    text,
    timestamp,
    imageData
  );

  // sned message
  messagesDiv.appendChild(messageElement);
  saveMessage(username, text, imageData, timestamp);

  // resets
  input.value = "";
  imageInput.value = "";
  imagePreviewContainer.innerHTML = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Section 7: Save & load messages
// save messages function
function saveMessage(username, text, image, timestamp) {
  const chatKey = getChatKey(username, activeChat);
  const messages = JSON.parse(sessionStorage.getItem(chatKey)) || [];

  // push message to lS
  messages.push({ username, text, image, timestamp });

  // save key to lS
  sessionStorage.setItem(chatKey, JSON.stringify(messages));
}

// load messages function
function loadMessages() {
  messagesDiv.innerHTML = "";

  // pull message from lS
  if (!activeChat) return;

  const chatKey = getChatKey(username, activeChat);
  const savedMessages = JSON.parse(sessionStorage.getItem(chatKey)) || [];

  // create elements for each pull
  savedMessages.forEach((msg) => {
    const messageElement = createMessageElement(
      msg.username,
      msg.text,
      msg.timestamp,
      msg.image
    );
    messagesDiv.appendChild(messageElement);

      if (msg.username !== username) {
    messageNotif(msg.username, msg.text);
  }

  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}



//ARRAY FOR COMPARING USERS
let users = JSON.parse(sessionStorage.getItem("users")) || [];


//FRIEND REQUEST POPUP - brief
//--------------------------------------------------------------------------------------
const getRequest = document.getElementById("getRequest");
const requestBox = document.querySelector(".requestBox");
const sendRequest = document.getElementById("sendRequest");

getRequest.addEventListener("click", () =>{
  requestBox.classList.toggle("visible");
  requestBox.classList.toggle("hidden");

  //UPDATE THE POPUP
  renderRequests();
}); //FUNCTION END




//THIS RENDERS THE FRIEND REQUESTS
//--------------------------------------------------------------------------------------
function renderRequests() {
  refreshUsers();
  const current = users.find(u => u.username === username);

  if (current && current.friendRequestsArray && current.friendRequestsArray.length > 0) {
    requestBox.innerHTML = "FRIEND REQUEST<br>" + 
    current.friendRequestsArray.map(user => user + " wants to be your friend!" + 
      "<button id='ac" + user + "' class='acBtn'>Accept?</button> " + "<button id='dc" + user + "' class='dcBtn'>Decline?</button>")
      .join("<br>");

      //SEND OFF TO ACCEPT AND DECLINE FUNCTIONS
  current.friendRequestsArray.forEach(user => {
const declineBtn = document.getElementById("dc" + user);
const acceptBtn = document.getElementById("ac" + user);

      declineBtn.addEventListener("click", () => {
        declineRequest(user);
      });

      acceptBtn.addEventListener("click", () => {
        acceptRequest(user);
      });
  });
  }
  else {
    requestBox.innerHTML = "FRIEND REQUEST<br>" + "No Friend Requests Yet";
  }



}//FUNCTION END



//DECLINE FRIEND REQUEST
//--------------------------------------------------------------------------------------
function declineRequest(user) {
  refreshUsers();
  const current = users.find(u => u.username === username);
  current.friendRequestsArray = current.friendRequestsArray.filter(u => u!== user);
  sessionStorage.setItem("users", JSON.stringify(users));
  renderRequests();
}




//ACCEPT FRIEND REQUEST
//--------------------------------------------------------------------------------------
function acceptRequest(user) {
  //DECLARATIONS HERE
  refreshUsers();
  const current = users.find(u => u.username === username);
  const sendUser = users.find(u => u.username === user);

  
  //THIS ADDS THE FRIENDS TO BOTH USERS ACCOUNTS. IT PREVENTS FROM ADDING IF THE FRIEND IS ALREADY THERE.
  if (!current.friends) current.friends = [];
  if (!sendUser.friends) sendUser.friends = [];
  if (!current.friends.includes(user)) current.friends.push(user);
  if (!sendUser.friends.includes(username)) sendUser.friends.push(username);


  //DELETES REQUEST FROM LIST
  current.friendRequestsArray = current.friendRequestsArray.filter(u => u!== user);
  sessionStorage.setItem("users", JSON.stringify(users));
  renderRequests();
  friendUsers();
}//accept friend request function end




//REFRESH FUNCTION
//--------------------------------------------------------------------------------------
function refreshUsers() {
  users = JSON.parse(sessionStorage.getItem("users")) || [];
}









//THIS IS THE SEARCH BAR FOR SENDING A FRIEND REQUEST
//--------------------------------------------------------------------------------------
sendRequest.addEventListener("click",() => {
const friendSearch = document.getElementById("friendSearch");
const friendValue = friendSearch.value;
let found = false;
let sentUser = "";
  users.forEach((u) => {
    if (u.username === friendValue) {
        found = true;
    }
  });
        if (found) {
  sentUser = friendSearch.value;
  friendSearch.value = "";
  friendSearch.placeholder = "Friend Request Sent";
  //THIS IS WHERE THE REQUEST IS SENT. THE VALUE IS GRABBED AND SENT TO THE FUNCTION.
  requestSend(sentUser)
} else {
  friendSearch.value = "";
  friendSearch.placeholder = "User does not exist";
}
setTimeout(() => {
  friendSearch.placeholder = "Find Friends";
}, 1000);
}); //function end




//THIS IS WHERE FRIEND REQUEST LOGIC GOES THROUGH
//--------------------------------------------------------------------------------------
function requestSend(sentUser) {
  users.forEach((u) => {
    if (u.username === sentUser) {
      if (!u.friendRequestsArray) {
        u.friendRequestsArray = [];
      }
        u.friendRequestsArray.push(username);

        friendRequestNotif(username);
    }
  });
sessionStorage.setItem("users", JSON.stringify(users));
}






















// THIS UPDATES THE CHAT LIST WITH YOUR FRIENDS
function friendUsers() {
  refreshUsers(); // this needs to change to work in middle tier
  userListDiv.innerHTML = "";


  const current = users.find(u => u.username === username);

  const otherUsers = current && Array.isArray(current.friends)
  ? users.filter((u) =>
      current.friends.includes(u.username) && u.username !== username
    )
  : [];



  //ALTER THIS SO IT ONLY SHOWS FRIENDED USERS
  //---------------------------------------------------------------------------------------
  // no users? :(
  if (otherUsers.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No Friends Added.";
    empty.className = "no-friends";
    userListDiv.appendChild(empty);
    return;
  }

  // yes users? :D
  otherUsers.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className = "user-item";
    userItem.textContent = user.username;
 //---------------------------------------------------------------------------------------




    userItem.addEventListener("click", () => {
      activeChat = user.username;

      document
        .querySelectorAll(".user-item")
        .forEach((el) => el.classList.remove("active"));
      userItem.classList.add("active");

      input.placeholder = `message ${activeChat}@bshift...`; // eg. "message dev.callahan@bshift..."

      // calls message loader
      loadMessages();
    });

    userListDiv.appendChild(userItem);
  });
}

  


// Section 9: Event handlers
// logout
logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem("currentUser");
  window.location.href = "../messages/login.html";
});

// send message handler
sendButton.addEventListener("click", sendMessage);

imageButton.addEventListener("click", () => {
  imageInput.click();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// image handler
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  // clear preview
  imagePreviewContainer.innerHTML = "";

  // create preview
  const wrapper = document.createElement("div");
  wrapper.className = "preview-wrapper";

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.className = "preview-image";

  // remove image (in case you don't want to send it)
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "✖";
  removeBtn.className = "remove-preview";

  removeBtn.addEventListener("click", () => {
    imageInput.value = "";
    imagePreviewContainer.innerHTML = "";
  });

  // wrappers
  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  imagePreviewContainer.appendChild(wrapper);
});











//NOTIFICATIONS SECTION
//---------------------------------------------------------------------------------------
//FRIEND REQUESTS
//---------------------------------------------------------------------------------------
function friendRequestNotif(username) {
  if (Notification.permission === "granted") {
    showNotif();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission ==="granted") {
        showNotif();
      }
    })
  }

  function showNotif() {
new Notification("Incoming friend Request!", {
  body:  `${username} has sent you a friend request!`
  })
  }

}//FUNCTION END






//MESSAGES
//---------------------------------------------------------------------------------------
function messageNotif(username, message) {
  if (Notification.permission === "granted") {
    showNotif();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission ==="granted") {
        showNotif();
      }
    });
  }
  function showNotif() {
new Notification(`${username}: `, {
  body: message
});
  }
}//FUNCTION END




friendUsers();