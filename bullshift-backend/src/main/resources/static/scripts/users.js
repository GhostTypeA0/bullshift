// BullShift App | Login & Registration Logic
// Authors: Luke Callahan, Saiyan Ren
// Backend Integration & Cleanup: John R. Nottom IV, Addison S

// BACKEND BASE URL (LOCAL MODE)
const API_BASE = "";

// DOM ELEMENTS
const createForm = document.getElementById("createForm");
const loginForm = document.getElementById("loginForm");

const showCreateBtn = document.getElementById("showCreate");
const showLoginBtn = document.getElementById("showLogin");

const createMessage = document.getElementById("createMessage");
const loginMessage = document.getElementById("loginMessage");

// CHARACTER LIMITS (from Saiyan)
const LIMITS = {
    username: 30,
    email: 50,
    password: 30
};

// Apply input limits
document.getElementById("loginUsername").maxLength = LIMITS.username;
document.getElementById("loginPassword").maxLength = LIMITS.password;
document.getElementById("username").maxLength = LIMITS.username;
document.getElementById("email").maxLength = LIMITS.email;
document.getElementById("password").maxLength = LIMITS.password;

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

// OPTIONAL EMAIL RECOMMENDATION MESSAGE (from Saiyan)
const emailInput = document.getElementById("email");
emailInput.addEventListener("click", (e) => {
    createMessage.style.color = "green";
    createMessage.textContent = "Email isn't required but recommended for account creation.";
    e.stopPropagation();
}, { once: true });

document.addEventListener("click", () => {
    createMessage.textContent = "";
});

// REGISTER USER
createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Required fields
    if (!username || !password) {
        createMessage.style.color = "red";
        createMessage.textContent = "Username and password are required.";
        return;
    }

    // Character limit validation (from Saiyan)
    if (username.length > LIMITS.username ||
        password.length > LIMITS.password ||
        email.length > LIMITS.email) {
        createMessage.style.color = "red";
        createMessage.textContent =
            `Max limits: User(${LIMITS.username}), Email(${LIMITS.email}), Pass(${LIMITS.password})`;
        return;
    }

    try {
        const res = await fetch(`/api/users/register`, {
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
            const loginRes = await fetch(`/api/users/login`, {
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

    // Character limit validation (from Saiyan)
    if (username.length > LIMITS.username || password.length > LIMITS.password) {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Invalid username or password format.";
        return;
    }

    try {
        const res = await fetch(`/api/users/login`, {
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
