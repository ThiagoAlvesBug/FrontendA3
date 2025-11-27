// src/services/transactionService.js
import { getToken, getUserId } from "./authService";

const API_URL = "http://localhost:8082";

function authHeader() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

// pega automaticamente o userId do token
function getCurrentUserId() {
  return getUserId();
}

async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeader(),
        ...(options.headers || {})
      }
    });

    // Se não for JSON, tenta retornar como texto
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      throw new Error(errorText?.message || errorText || "Erro na requisição");
    }

    return contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

  } catch (err) {
    console.error("Erro no request:", err);
    throw err;
  }
}

// Saldo e listagem de transações
export async function getBalance() {
  const userId = getCurrentUserId();
  return await request(`${API_URL}/balance/${userId}`);
}

export async function getTransactions() {
  const userId = getCurrentUserId();
  return await request(`${API_URL}/transactions/user/${userId}`);
}

// Operações de depósito e transferência
export async function deposit(amount) {
  const userId = getCurrentUserId();
  return await request(`${API_URL}/transactions/deposit`, {
    method: "POST",
    body: JSON.stringify({ userId, amount })
  });
}

export async function transfer(toUserId, amount, description) {
  const fromUserId = getCurrentUserId();
  return await request(`${API_URL}/transactions/transfer`, {
    method: "POST",
    body: JSON.stringify({ fromUserId, toUserId, amount, description })
  });
}

// Listagem de transações pendentes
export async function getPendingTransactions() {
  const userId = getCurrentUserId();
  return await request(`${API_URL}/users/${userId}/transactions/pending`);
}

// Confirmação ou rejeição de transações pendentes
export async function confirmTransaction(transactionId, accepted) {
  const userId = getCurrentUserId();

  return await request(
    `${API_URL}/users/${userId}/transactions/${transactionId}/confirm?accepted=${accepted}`,
    { method: "PUT" }
  );
}

