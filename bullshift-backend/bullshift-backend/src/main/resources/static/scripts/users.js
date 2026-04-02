document.addEventListener("DOMContentLoaded", () => {

    // Grab all DOM elements used in the login/register UI
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const usernameInput = document.getElementById("usernameInput");
    const passwordInput = document.getElementById("passwordInput");
    const emailInput = document.getElementById("emailInput"); // only visible in register mode
    const message = document.getElementById("login-message");
    const toggleLink = document.getElementById("toggleLink");
    const formTitle = document.getElementById("formTitle");

    // Tracks whether the user is in login mode or register mode
    let isRegistering = false;

    // Switch between login <-> register UI
    function toggleMode() {
        isRegistering = !isRegistering;

        if (isRegistering) {
            formTitle.textContent = "Register";
            loginButton.style.display = "none";
            registerButton.style.display = "block";
            toggleLink.textContent = "Already have an account? login";
            if (emailInput) emailInput.style.display = "block";
        } else {
            formTitle.textContent = "BiullShift Login";
            loginButton.style.display = "block";
            registerButton.style.display = "none";
            toggleLink.textContent = "Need an account? Register";
            if (emailInput) emailInput.style.display = "none";
        }

        message.textContent = ""; // clear old messages
    }

    // Toggle login/register when clicking the link
    if (toggleLink) {
        toggleLink.addEventListener("click", (e) => {
            e.preventDefault();
            toggleMode();
        });
    }

    // --- REGISTER BUTTON HANDLER ---
    if (registerButton) {
        registerButton.addEventListener("click", async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const email = emailInput ? emailInput.value.trim() : null;

            // Basic validation
            if (!username || !password) {
                message.textContent = "Username and password are required.";
                message.style.color = "red";
                return;
            }

            try {
                // Send registration request to backend
                const response = await fetch("/api/users/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, email })
                });

                const data = await response.json();

                if (!response.ok) {
                    message.textContent = data.error || "Registration failed.";
                    message.style.color = "red";
                    return;
                }

                message.textContent = "Registration successful! Logging in...";
                message.style.color = "green";

                // Auto-login after successful registration
                setTimeout(async () => {
                    const loginRes = await fetch("/api/users/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password })
                    });

                    const loginData = await loginRes.json();

                    if (loginData.success) {
                        // Store user in localStorage
                        localStorage.setItem("currentUser", JSON.stringify({
                            username: loginData.username
                        }));

                        // Redirect to main feed
                        window.location.href = "index.html";
                    }
                }, 500);

            } catch (err) {
                console.error("Registration error:", err);
                message.textContent = "Server error.";
                message.style.color = "red";
            }
        });
    }

    // --- LOGIN BUTTON HANDLER ---
    if (loginButton) {
        loginButton.addEventListener("click", async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username) {
                message.textContent = "Enter a username.";
                message.style.color = "red";
                return;
            }

            try {
                // Send login request to backend
                const response = await fetch("/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    // Save logged-in user
                    localStorage.setItem("currentUser", JSON.stringify({
                        username: data.username
                    }));

                    // Redirect to main feed
                    window.location.href = "index.html";
                } else {
                    message.textContent = data.message;
                    message.style.color = "red";
                }

            } catch (err) {
                console.error("Login error:", err);
                message.textContent = "Server error.";
                message.style.color = "red";
            }
        });

        // Allow pressing Enter to submit login
        passwordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                loginButton.click();
            }
        });
    }
});
