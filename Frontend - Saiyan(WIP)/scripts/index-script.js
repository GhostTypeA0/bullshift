// Assignment: Bull-Shift App | Index Script - JS
// Author: Luke Callahan, Saiyan Ren, Addison 


// Section 1: DOM elements & global variables
// DOM elements
const btnChat = document.getElementById("chatBtn");
const btnPosts = document.getElementById("postsBtn");
const container = document.getElementById("pages-container");

// --------pulled & edited from chat.js----------
const loggedInDiv = document.getElementById("loggedin-user");

// global variables
let chatActive = false;
let postsActive = false;
let chatFrame = null;
let postsFrame = null;


// now everything is saved so it doesn't reload everything on startup
function saveIframeState() {
  localStorage.setItem("iframeState", JSON.stringify({
    chatActive,
    postsActive
  }));
}

// and will reload from lS
function loadIframeState() {
  const saved = localStorage.getItem("iframeState");
  if (saved) {
    const state = JSON.parse(saved);
    chatActive = state.chatActive;
    postsActive = state.postsActive;
    btnChat.classList.toggle("active", chatActive);
    btnPosts.classList.toggle("active", postsActive);
  }
}

// --------pulled & edited from chat.js----------
let username = "";

// --------pulled & edited from chat.js----------
// Section 2: Auth Check
// logged in user check
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// if no user, go back to login page, else, update page elements
if (!currentUser) {
  window.location.href = "login.html";
} else {
  username = currentUser.username;
  loggedInDiv.textContent = username;
  loadIframeState();
  if (chatActive || postsActive) {
    updateLayout();
  }
}

// Section 3: iFrames
// iframes are created ONCE now
function createIframes() {
  chatFrame = document.createElement("iframe");
  chatFrame.src = "../html/chat.html";
  chatFrame.className = "page-frame";
  chatFrame.id = "chat-frame";

  postsFrame = document.createElement("iframe");
  postsFrame.src = "../html/posts.html";
  postsFrame.className = "page-frame";
  postsFrame.id = "posts-frame";

  container.appendChild(chatFrame);
  container.appendChild(postsFrame);
}

// and only their visibility changes rather than a full reload
function updateLayout() {
  if (!chatFrame && !postsFrame) {
    createIframes();
  }

  if (chatActive && postsActive) {
    container.className = "two-pages";
    chatFrame.style.display = "";
    postsFrame.style.display = "";
  } else if (chatActive) {
    container.className = "single-page";
    chatFrame.style.display = "";
    postsFrame.style.display = "none";
  } else if (postsActive) {
    container.className = "single-page";
    chatFrame.style.display = "none";
    postsFrame.style.display = "";
  } else {
    container.className = "";
    container.innerHTML = "";
    chatFrame = null;
    postsFrame = null;
  }
}

// Section 4: Event Handlers
// logout
// --------pulled & edited from chat.js----------
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("iframeState");
  window.location.href = "login.html";
});

// chat
btnChat.addEventListener("click", () => {
  chatActive = !chatActive;
  btnChat.classList.toggle("active", chatActive);
  saveIframeState();
  updateLayout();
});

// posts
btnPosts.addEventListener("click", () => {
  postsActive = !postsActive;
  btnPosts.classList.toggle("active", postsActive);
  saveIframeState();
  updateLayout();
});




//ARRAY FOR COMPARING USERS
let users = JSON.parse(localStorage.getItem("users")) || [];


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
  localStorage.setItem("users", JSON.stringify(users));
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
  localStorage.setItem("users", JSON.stringify(users));
  renderRequests();
  friendUsers();
}//accept friend request function end


//REFRESH FUNCTION
//--------------------------------------------------------------------------------------
function refreshUsers() {
  users = JSON.parse(localStorage.getItem("users")) || [];
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
localStorage.setItem("users", JSON.stringify(users));
}



// updates the friends list
function friendUsers() {
    const friendsListDiv = document.getElementById('friends-list');
    if (!friendsListDiv) return;

    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const session = JSON.parse(localStorage.getItem("currentUser"));

    if (!session || !session.username) {
        friendsListDiv.innerHTML = '<p>Please log in.</p>';
        return;
    }

    const userName = allUsers.find(u => u.username === session.username);
    friendsListDiv.innerHTML = '';

    if (userName && userName.friends && userName.friends.length > 0) {
        userName.friends.forEach(friendUsername => {
            const friendData = allUsers.find(u => u.username === friendUsername);
            if (friendData) {
                const friendName = document.createElement('div');
                friendName.className = 'friend-name';

                // creates the name element for the friend list
                const nameList = document.createElement('p');
                nameList.innerHTML = `<strong>${friendData.username}</strong>`;

                // creates the remove/unfriend button
                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'unfriend';
                removeBtn.className = 'remove-btn';
                
                // event for remove/unfriending 
                removeBtn.addEventListener('click', function() {
                    executeRemoval(friendData.username);
                });

                friendName.appendChild(nameList);
                friendName.appendChild(removeBtn);
                friendsListDiv.appendChild(friendName);
            }
        });
    } else {
        friendsListDiv.innerHTML = '<p class="no-friends">No friends added yet.</p>';
    }
}

  document.addEventListener('DOMContentLoaded', friendUsers);


// remove/unfriend logic
function executeRemoval(usernameToRemove) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const session = JSON.parse(localStorage.getItem("currentUser"));

    if (!session) return;

    // searches index for user
    const myIndex = users.findIndex(u => u.username === session.username);
    const theirIndex = users.findIndex(u => u.username === usernameToRemove);

        // removes from friends list from both users
    if (myIndex !== -1 && theirIndex !== -1) {
        users[myIndex].friends = users[myIndex].friends.filter(name => name !== usernameToRemove);
        users[theirIndex].friends = users[theirIndex].friends.filter(name => name !== session.username);

        // updates local storage
        localStorage.setItem('users', JSON.stringify(users));
        friendUsers();
    }
}

  // starts up the list of friends
  document.addEventListener('DOMContentLoaded', friendUsers);


// friend management adding/updating friend list/logic 
function addFriend(usernameToAdd) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUserObj = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUserObj || currentUserObj.username === usernameToAdd) return;

    const userMe = users.find(u => u.username === currentUserObj.username);
    const userThem = users.find(u => u.username === usernameToAdd);

    if (userMe && userThem) {
        if (!userMe.friends) userMe.friends = [];
        if (!userThem.friends) userThem.friends = [];

        if (!userMe.friends.includes(usernameToAdd)) {
            userMe.friends.push(usernameToAdd);
            userThem.friends.push(userMe.username);
            localStorage.setItem('users', JSON.stringify(users));
            friendUsers();
        }
    }


  // initial load
  document.addEventListener('DOMContentLoaded', friendUsers);

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
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
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
