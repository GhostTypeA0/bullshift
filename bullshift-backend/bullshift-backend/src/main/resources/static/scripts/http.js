// http.js — central wrapper for all REST API calls.
// Keeps fetch logic consistent and avoids repeating boilerplate.

const API_BASE = "http://localhost:8081"; // backend base URL

// --- Generic GET ---
export async function get(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) throw new Error(`GET ${path} failed`);
    return response.json(); // always return parsed JSON
}

// --- Generic POST ---
export async function post(path, data) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`POST ${path} failed`);
    return response.json();
}

// --- Generic PUT ---
export async function put(path, data) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`PUT ${path} failed`);
    return response.json();
}

// --- Generic DELETE ---
export async function del(path) {
    const response = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`DELETE ${path} failed`);
    return response.ok; // DELETE usually returns no body
}

// --- USER API (maps directly to UserController) ---
export const UserAPI = {
    getAll: () => get("/api/users"), // list all users
    getByUsername: (username) => get(`/api/users/${encodeURIComponent(username)}`),
    register: (user) => post("/api/users/register", user),
    login: (username, password) => post("/api/users/login", { username, password }),
    update: (username, user) => put(`/api/users/${encodeURIComponent(username)}`, user),
    delete: (username) => del(`/api/users/${encodeURIComponent(username)}`)
};

// --- POST API (maps to PostController) ---
export const PostAPI = {
    getAll: () => get("/api/posts"), // feed
    getById: (id) => get(`/api/posts/${id}`),
    getByUser: (username) => get(`/api/posts/user/${encodeURIComponent(username)}`),
    create: (post) => post("/api/posts", post),
    update: (id, post) => put(`/api/posts/${id}`, post),
    delete: (id) => del(`/api/posts/${id}`),
    like: (id) => post(`/api/posts/${id}/like`, {}), // increment likeCount
    unlike: (id) => post(`/api/posts/${id}/unlike`, {}) // decrement likeCount
};

// --- MESSAGE API (maps to Message + ChatHistory controllers) ---
export const MessageAPI = {
    getAll: () => get("/api/messages"), // mostly for debugging
    send: (message) => post("/api/messages", message), // save message to DB
    getChat: (sender, receiver) =>
        get(`/api/chat/${encodeURIComponent(sender)}/${encodeURIComponent(receiver)}`)
};
