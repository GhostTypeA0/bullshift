// http.js
// Clean wrapper for REST API calls

const API_BASE = "http://localhost:8080";

// Generic GET request
export async function get(path) {
    const response = await fetch(`${API_BASE}${path}`);
    return response.json();
}

// Generic POST request
export async function post(path, data) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return response.json();
}
