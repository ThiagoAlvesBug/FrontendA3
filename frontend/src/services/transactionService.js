import { getToken, getUserId } from "./authService";

const API_URL = "http://localhost:8082/transactions";

function authHeader() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function getCurrentUserId() {
  return getUserId();
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeader(),
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const error = isJson ? await response.json() : await response.text();
    throw new Error(error?.message || error || "Erro na requisição");
  }

  return isJson ? await response.json() : await response.text();
}

// SALDO
export async function getBalance() {
  const userId = getCurrentUserId();
  return await request(`${API_URL}/balance/${userId}`);
}

// TODAS AS TRANSAÇÕES DO USUÁRIO (enviadas e recebidas)
export async function getTransactions() {
  const userId = getCurrentUserId();
  return await request(`${API_URL}/user/${userId}`);
}

// DEPÓSITO (agora usa receiverId)
export async function deposit(amount) {
  const receiverId = getCurrentUserId();
  return await request(`${API_URL}/deposit`, {
    method: "POST",
    body: JSON.stringify({
      receiverId,
      amount
    })
  });
}