// Assignment: Bull-Shift App | Index Script - JS
// Author: Luke Callahan, Saiyan Ren, Addison 
/* Author of this comment style: Saiyan Ren */

// Section 1: DOM elements & global variables
const btnChat = document.getElementById('chatBtn');
const btnPosts = document.getElementById('postsBtn');
const container = document.getElementById('pages-container');
const loggedInDiv = document.getElementById('loggedin-user');
const logoutButton = document.getElementById('logoutButton');

// Global variables
let chatActive = false;
let postsActive = false;
let chatFrame = null;
let postsFrame = null;
let username = "";

/* saves current page state by user */
function saveIframeState() {
  if (!username) return;
  /* uses a unique key for each user */
  localStorage.setItem(`iframeState_${username}`, JSON.stringify({ chatActive, postsActive }));
}

function loadIframeState() {
    if (!username) return;
    const saved = localStorage.getItem(`iframeState_${username}`);
    if (saved) {
    const state = JSON.parse(saved);
    chatActive = state.chatActive;
    postsActive = state.postsActive;
        
      /* updates button visual states */
      if (btnChat) btnChat.classList.toggle('active', chatActive);
      if (btnPosts) btnPosts.classList.toggle('active', postsActive);
    }
}

// Section 2: Auth Check
// logged in user check
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

/* if no user, go back to login page, else, update page elements */
if (!currentUser) {
    window.location.href = 'login.html';
} else {
    username = currentUser.username;
    loggedInDiv.textContent = username;
    
    /* loads this specific user's last saved state layout  */
    loadIframeState();
    
    if (chatActive || postsActive) {
        updateLayout();
    }
}

// Section 3: iFrames
function createIframes() {
  // Note: To return to the same chat partner, your chat.html 
  // should also save its state to localStorage scoped by user.
  chatFrame = document.createElement('iframe');
  chatFrame.src = `../html/chat.html`; 
  chatFrame.className = 'page-frame';
  chatFrame.id = 'chat-frame';

  postsFrame = document.createElement('iframe');
  postsFrame.src = `../html/posts.html`;
  postsFrame.className = 'page-frame';
  postsFrame.id = 'posts-frame';

  container.appendChild(chatFrame);
  container.appendChild(postsFrame);
}

function updateLayout() {
  if (!chatFrame && !postsFrame) {
       createIframes();
    }

  if (chatActive && postsActive) {
    container.className = 'two-pages';
    chatFrame.style.display = 'block';
    postsFrame.style.display = 'block';
    } else if (chatActive) {
      container.className = 'single-page';
      chatFrame.style.display = 'block';
      postsFrame.style.display = 'none';
    } else if (postsActive) {
      container.className = 'single-page';
      chatFrame.style.display = 'none';
      postsFrame.style.display = 'block';
    } else {
      container.className = '';
      container.innerHTML = ''; // Clears frames if neither is active
      chatFrame = null;
      postsFrame = null;
    }
}

// Section 4: Event Handlers
// logout
// --------pulled & edited from chat.js----------
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
    // Remove only the login session; do NOT clear user-specific iframeState
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
    });
}

// chat
btnChat.addEventListener('click', () => {
    chatActive = !chatActive;
    btnChat.classList.toggle('active', chatActive);
    saveIframeState();
    updateLayout();
});

// posts
btnPosts.addEventListener('click', () => {
    postsActive = !postsActive;
    btnPosts.classList.toggle('active', postsActive);
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
    if (!current) return;

    let html = "FRIEND REQUESTS<br>";

    // --- INCOMING REQUESTS ---
    if (current.friendRequestsArray && current.friendRequestsArray.length > 0) {
        html += current.friendRequestsArray.map(user => 
            user + " wants to be your friend! " + 
            "<button id='ac" + user + "' class='acBtn'>Accept?</button> " + 
            "<button id='dc" + user + "' class='dcBtn'>Decline?</button>"
        ).join("<br>");
    } else {
        html += "No Friend Requests Yet<br>";
    }

    // --- SENT REQUESTS ---
    html += "<br>SENT REQUESTS<br>";
    if (current.sentRequestsArray && current.sentRequestsArray.length > 0) {
        html += current.sentRequestsArray.map(user => 
            "Waiting for " + user + " to respond..."
        ).join("<br>");
    } else {
        html += "No Sent Requests";
    }

    requestBox.innerHTML = html;

    // --- EVENT LISTENERS ---
    if (current.friendRequestsArray) {
        current.friendRequestsArray.forEach(user => {
            document.getElementById("dc" + user)?.addEventListener("click", () => declineRequest(user));
            document.getElementById("ac" + user)?.addEventListener("click", () => acceptRequest(user));
        });
    }
}

//FUNCTION END


//DECLINE FRIEND REQUEST
//--------------------------------------------------------------------------------------
function declineRequest(user) {
    refreshUsers();
    const current = users.find(u => u.username === username);
    const sender = users.find(u => u.username === user);

    current.friendRequestsArray = current.friendRequestsArray.filter(u => u !== user);
    
    // Clean up the sender's sent list so it doesn't stay there forever
    if (sender.sentRequestsArray) {
        sender.sentRequestsArray = sender.sentRequestsArray.filter(u => u !== username);
    }

    localStorage.setItem("users", JSON.stringify(users));
    renderRequests();
}


//ACCEPT FRIEND REQUEST
//--------------------------------------------------------------------------------------
function acceptRequest(user) {
    refreshUsers();
    const current = users.find(u => u.username === username);
    const sender = users.find(u => u.username === user);

    if (!current.friends) current.friends = [];
    if (!sender.friends) sender.friends = [];

    if (!current.friends.includes(user)) current.friends.push(user);
    if (!sender.friends.includes(username)) sender.friends.push(username);

    // Clean up both arrays
    current.friendRequestsArray = current.friendRequestsArray.filter(u => u !== user);
    if (sender.sentRequestsArray) {
        sender.sentRequestsArray = sender.sentRequestsArray.filter(u => u !== username);
    }

    localStorage.setItem("users", JSON.stringify(users));
    renderRequests();
    friendUsers();
}
//accept friend request function end


//REFRESH FUNCTION
//--------------------------------------------------------------------------------------
function refreshUsers() {
  users = JSON.parse(localStorage.getItem("users")) || [];
}


//THIS IS THE SEARCH BAR FOR SENDING A FRIEND REQUEST
//--------------------------------------------------------------------------------------
sendRequest.addEventListener("click", () => {
    const friendSearch = document.getElementById("friendSearch");
    
    /*  sets the character limit of the username in the friend search bar */
    friendSearch.maxLength = 30; 

    const friendValue = friendSearch.value.trim();
    let found = false;
    let sentUser = "";

    /*  checks for character length before searching */
    if (friendValue.length > 30) {
        friendSearch.value = "";
        friendSearch.placeholder = "Limit: 30 chars";
        friendSearch.classList.add("error");
    } else {
        users.forEach((u) => {
            if (u.username === friendValue) {
                found = true;
            }
        });

        if (found) {
            sentUser = friendValue;
            friendSearch.value = "";
            friendSearch.placeholder = "Friend Request Sent";
            requestSend(sentUser);
        } else {
            friendSearch.value = "";
            friendSearch.placeholder = "User does not exist";
            friendSearch.classList.add("error"); /* error red text */
        }
    }

    setTimeout(() => {
        friendSearch.placeholder = "Find Friends";
        friendSearch.classList.remove("error");
    }, 1000);
}); //function end


//THIS IS WHERE FRIEND REQUEST LOGIC GOES THROUGH
//--------------------------------------------------------------------------------------
function requestSend(sentUser) {
    const current = users.find(u => u.username === username);
    
    users.forEach((u) => {
        if (u.username === sentUser) {
            /* adds to their incoming requests **/
            if (!u.friendRequestsArray) u.friendRequestsArray = [];
            if (!u.friendRequestsArray.includes(username)) u.friendRequestsArray.push(username);
            
            /* adds to your outgoing requests */
            if (!current.sentRequestsArray) current.sentRequestsArray = [];
            if (!current.sentRequestsArray.includes(sentUser)) current.sentRequestsArray.push(sentUser);
            
            friendRequestNotif(username);
        }
    });
    localStorage.setItem("users", JSON.stringify(users));
    renderRequests(); /* refreshes the UI to show the sent request */
}


/* updates the friends list with requested on outcoming users */
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

                friendName.style.display = 'flex';
                friendName.style.justifyContent = 'space-between';
                friendName.style.alignItems = 'center';
                friendName.style.marginBottom = '8px';
                friendName.style.wordBreak = 'break-word'; /* makes sure long usernames break cleanly */
                friendName.style.gap = '10px';

                /* creates the name element for the friend list */
                const nameList = document.createElement('p');
                nameList.style.margin = '0';
                nameList.style.flex = '1'; /* occupies up available space */
                nameList.style.overflowWrap = 'break-word'; /* username wrapping */
                nameList.innerHTML = `<strong>${friendData.username}</strong>`;

                /* creates the remove/unfriend button */
                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'unfriend';
                removeBtn.className = 'remove-btn';
                removeBtn.style.flexShrink = '0';
                
                /* event for remove/unfriending */
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


/* remove/unfriend logic */
function executeRemoval(usernameToRemove) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const session = JSON.parse(localStorage.getItem("currentUser"));

    if (!session) return;

    /* searches index for user by username */
    const myIndex = users.findIndex(u => u.username === session.username);
    const theirIndex = users.findIndex(u => u.username === usernameToRemove);

    /* removes both users for each others friend's list */
    if (myIndex !== -1 && theirIndex !== -1) {
        users[myIndex].friends = users[myIndex].friends.filter(name => name !== usernameToRemove);
        users[theirIndex].friends = users[theirIndex].friends.filter(name => name !== session.username);

        /* updates local storage */
        localStorage.setItem('users', JSON.stringify(users));
        friendUsers();
    }
}

  /* starts up the list of friends */
  document.addEventListener('DOMContentLoaded', friendUsers);


/* friend management adding/updating friend list/logic */ 
function addFriend(usernameToAdd) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUserObj = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUserObj || currentUserObj.username === usernameToAdd) return;

    const userMe = users.find(u => u.username === currentUserObj.username);
    const userThem = users.find(u => u.username === usernameToAdd);

    /* checks if users are friends with each other, adds both users to each others friend's list */
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
