import { getToken, getUserId } from "./authService";
// Definindo URL para requisições de transação
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
// Executando a requisição
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

// Requisição de Saldo
export async function getBalance() {
  const userId = getCurrentUserId();
  return await request(`${API_URL}/balance/${userId}`);
}

// Requisição de Histórico de transações do usuário
export async function getTransactions() {
  const userId = getCurrentUserId();
  return await request(`${API_URL}/user/${userId}`);
}

// Requisição de Depósito
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