// Assignment: Bull-Shift App | Fetch - JavaScript, HTTP
// Author: Addison Solberg
export function http(message) {
return fetch("http://localhost:8080/api/messages", {
    method: "POST",
    headers: {
    "Content-Type": "application/json"
    },
    body: JSON.stringify({
    message: message
        })
    });
}