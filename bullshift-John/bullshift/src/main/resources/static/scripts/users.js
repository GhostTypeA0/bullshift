document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const usernameInput = document.getElementById("usernameInput");
    const passwordInput = document.getElementById("passwordInput");
    const emailInput = document.getElementById("emailInput");
    const message = document.getElementById("login-message");
    const toggleLink = document.getElementById("toggleLink");
    const formTitle = document.getElementById("formTitle");

    let isRegistering = false;

    function toggleMode() {
        isRegistering = !isRegistering;

        formTitle.textContent = isRegistering ? "Register" : "BullShift Login";
        loginButton.style.display = isRegistering ? "none" : "block";
        registerButton.style.display = isRegistering ? "block" : "none";
        toggleLink.textContent = isRegistering ? "Already have an account? Login" : "Need an account? Register";
        if (emailInput) emailInput.style.display = isRegistering ? "block" : "none";

        message.textContent = "";
    }

    if (toggleLink) {
        toggleLink.addEventListener("click", (e) => {
            e.preventDefault();
            toggleMode();
        });
    }

    if (registerButton) {
        registerButton.addEventListener("click", async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const email = emailInput ? emailInput.value.trim() : null;

            if (!username || !password) {
                message.textContent = "Username and password are required.";
                message.style.color = "red";
                return;
            }

            try {
                const response = await fetch("http://localhost:8081/api/users/register", {
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

                setTimeout(async () => {
                    const loginRes = await fetch("http://localhost:8081/api/users/login", {
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
                    }
                }, 500);
            } catch (err) {
                console.error("Registration error:", err);
                message.textContent = "Server error.";
                message.style.color = "red";
            }
        });
    }

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
                const response = await fetch("http://localhost:8081/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem("currentUser", JSON.stringify({
                        username: data.username
                    }));
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

        passwordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                loginButton.click();
            }
        });
    }
});
