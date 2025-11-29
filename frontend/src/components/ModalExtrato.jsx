import React from "react";
import { getUserId } from "../services/authService";

export default function ModalExtrato({ open, onClose, transacoes }) {
  if (!open) return null;

  const userId = Number(getUserId());

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0c0c22] text-white p-6 rounded-xl w-[700px] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-[#FF0066]">
          Histórico Completo
        </h2>

        <div className="p-4 modal-scroll overflow-y-auto max-h-[80vh] bg-[#1a1a38] rounded-lg shadow-inner">
          {transacoes.length === 0 ? (
            <p className="text-gray-400">Nenhuma transação encontrada.</p>
          ) : (
            transacoes.map((t) => {
              const isEntrada = t.receiverId === userId;
              const amount = Number(t.amount || 0);

              return (
                <div
                  key={t.id}
                  className="border-b border-gray-700 pb-2 mb-2 text-sm"
                >
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString("pt-BR")
                        : "—"}
                    </span>

                    <span
                      className={
                        isEntrada
                          ? "text-green-400 font-semibold"
                          : "text-red-400 font-semibold"
                      }
                    >
                      {isEntrada ? "+ " : "- "}
                      R${" "}
                      {Math.abs(amount).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <span className="text-gray-400 text-xs">
                    {t.description || (isEntrada ? "Entrada" : "Saída")}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-[#FF0066] cursor-pointer text-white py-2 rounded-lg hover:bg-[#be004c] transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
