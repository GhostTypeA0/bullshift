// BullShift App | Login & Registration Logic
// Authors: Luke Callahan, Saiyan Ren
// Backend Integration & Cleanup: John R. Nottom IV, Addison S

// BACKEND BASE URL
const API_BASE = "http://localhost:8081";

// DOM ELEMENTS
const createForm = document.getElementById("createForm");
const loginForm = document.getElementById("loginForm");

const showCreateBtn = document.getElementById("showCreate");
const showLoginBtn = document.getElementById("showLogin");

const createMessage = document.getElementById("createMessage");
const loginMessage = document.getElementById("loginMessage");

// UI TOGGLE BETWEEN LOGIN / REGISTER
showCreateBtn.addEventListener("click", () => {
    createForm.style.display = "flex";
    loginForm.style.display = "none";
    createMessage.textContent = "";
    loginMessage.textContent = "";
});

showLoginBtn.addEventListener("click", () => {
    createForm.style.display = "none";
    loginForm.style.display = "flex";
    createMessage.textContent = "";
    loginMessage.textContent = "";
});

// REGISTER USER
createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        createMessage.style.color = "red";
        createMessage.textContent = "Username and password are required.";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            createMessage.style.color = "red";
            createMessage.textContent = data.error || "Registration failed.";
            return;
        }

        createMessage.style.color = "green";
        createMessage.textContent = "Registration successful! Logging in...";

        // Auto-login after registration
        setTimeout(async () => {
            const loginRes = await fetch(`${API_BASE}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const loginData = await loginRes.json();

            if (loginData.success) {
                localStorage.setItem("currentUser", JSON.stringify({
                    username: loginData.username
                }));

                window.location.href = "index.html";
            } else {
                createMessage.style.color = "red";
                createMessage.textContent = "Auto-login failed.";
            }
        }, 600);

    } catch (err) {
        console.error("Registration error:", err);
        createMessage.style.color = "red";
        createMessage.textContent = "Server error.";
    }
});

// LOGIN USER
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username) {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Enter a username.";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            loginMessage.style.color = "green";
            loginMessage.textContent = `Welcome, ${data.username}.`;

            localStorage.setItem("currentUser", JSON.stringify({
                username: data.username
            }));

            setTimeout(() => {
                window.location.href = "index.html";
            }, 600);

        } else {
            loginMessage.style.color = "red";
            loginMessage.textContent = data.message || "Invalid login.";
        }

    } catch (err) {
        console.error("Login error:", err);
        loginMessage.style.color = "red";
        loginMessage.textContent = "Server error.";
    }
});

// ENTER KEY SUBMITS LOGIN
document.getElementById("loginPassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        loginForm.dispatchEvent(new Event("submit"));
    }
});
