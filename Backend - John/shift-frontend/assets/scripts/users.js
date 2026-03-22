document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const usernameInput = document.getElementById("usernameInput");
    const passwordInput = document.getElementById("passwordInput");

    if (!loginButton) return; // prevents errors on index.html

    loginButton.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert("Enter username and password.");
            return;
        }

        // Hardcoded users
        const users = [
            { username: "user1", password: "pass1" },
            { username: "user2", password: "pass2" }
        ];

        const match = users.find(
            (u) => u.username === username && u.password === password
        );

        if (!match) {
            alert("Invalid login.");
            return;
        }

        // Save current user
        localStorage.setItem("currentUser", JSON.stringify({ username }));

        // Save user list if not present
        if (!localStorage.getItem("users")) {
            localStorage.setItem(
                "users",
                JSON.stringify([
                    { username: "user1" },
                    { username: "user2" },
                    { username: "john" },
                    { username: "addison" }
                ])
            );
        }

        window.location.href = "index.html";
    });
});
