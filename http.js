// Assignment: Bull-Shift App | Fetch - JavaScript, HTTP
// Author: Addison Solberg
export function http() {
return fetch("http://localhost:8080/", {
    method: "POST",
    headers: {
    "Content-Type": "application/json"
    },
    body: JSON.stringify({
    first: first
        })
    });
}