// Simple HTTP helpers for talking to the backend API.

const API_BASE_URL = "http://localhost:8081";

// Generic GET request
async function apiGet(path) {
    const response = await fetch(API_BASE_URL + path);
    if (!response.ok) {
        throw new Error("GET " + path + " failed");
    }
    return response.json();
}

// Generic POST request
async function apiPost(path, data) {
    const response = await fetch(API_BASE_URL + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error("POST " + path + " failed");
    }
    return response.json();
}

// Generic PUT request
async function apiPut(path, data) {
    const response = await fetch(API_BASE_URL + path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error("PUT " + path + " failed");
    }
    return response.json();
}

// Generic DELETE request
async function apiDelete(path) {
    const response = await fetch(API_BASE_URL + path, { method: "DELETE" });
    if (!response.ok) {
        throw new Error("DELETE " + path + " failed");
    }
    return response.ok;
}

// USER API
const UserAPI = {
    getAll() {
        return apiGet("/api/users");
    },
    getByUsername(username) {
        return apiGet("/api/users/" + encodeURIComponent(username));
    },
    register(user) {
        return apiPost("/api/users/register", user);
    },
    login(username, password) {
        return apiPost("/api/users/login", { username, password });
    },
    update(username, user) {
        return apiPut("/api/users/" + encodeURIComponent(username), user);
    },
    delete(username) {
        return apiDelete("/api/users/" + encodeURIComponent(username));
    }
};

// POST API
const PostAPI = {
    getAll() {
        return apiGet("/api/posts");
    },
    getById(id) {
        return apiGet("/api/posts/" + id);
    },
    getByUser(username) {
        return apiGet("/api/posts/user/" + encodeURIComponent(username));
    },
    create(post) {
        return apiPost("/api/posts", post);
    },
    update(id, post) {
        return apiPut("/api/posts/" + id, post);
    },
    delete(id) {
        return apiDelete("/api/posts/" + id);
    },
    like(id) {
        return apiPost("/api/posts/" + id + "/like", {});
    },
    unlike(id) {
        return apiPost("/api/posts/" + id + "/unlike", {});
    }
};

// MESSAGE API
const MessageAPI = {
    getAll() {
        return apiGet("/api/messages");
    },
    getChat(sender, receiver) {
        return apiGet(
            "/api/chat/" +
            encodeURIComponent(sender) + "/" +
            encodeURIComponent(receiver)
        );
    }
};
