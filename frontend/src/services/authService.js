const API_URL = "http://localhost:8080/auth";

//  Registro de novo usuário
export async function register(user) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    throw new Error("Erro ao registrar");
  }

  return await response.json();
}

// Login de usuário existente
export async function login(credentials) {
  const response = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    throw new Error("Credenciais inválidas");
  }

  return await response.json(); // <--- ESSENCIAL
}


// Logout do usuário
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserId() {
  return localStorage.getItem("userId");
}

// Buscar informações do usuário pelo auth-service (porta 8080)
export async function getUserById(userId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:8080/auth/user/${userId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Erro ao buscar usuário");
    }

    return await response.json();
}
