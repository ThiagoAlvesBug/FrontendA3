import { X } from "lucide-react";
import Modal from "../components/Modal";
import { useState } from "react";
import { toast } from "react-toastify";

function ModalPix({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailDestino = e.target.emailDestino.value;
    const valorPix = parseFloat(e.target.valorPix.value);

    if (!emailDestino || valorPix <= 0) {
      toast.warn("Preencha e-mail e valor corretamente.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `http://localhost:8082/users/${userId}/transfer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pixKey: emailDestino,
            amount: valorPix,
            description: "Pix enviado",
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || "Erro ao enviar Pix");
        return;
      }
      toast.success(data.message || "Pix enviado com sucesso!");

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar Pix");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div
          className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-[#1b1a3d] via-[#141333] to-[#0b0a22] p-[1px] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl bg-[#141333] p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-white"
                >
                  Transferência via Pix
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Confira os dados antes de confirmar.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input (email) */}
              <div className="space-y-1">
                <label className="text-1xl font-medium text-gray-300">
                  E-mail do destinatário
                </label>
                <input
                  type="email"
                  name="emailDestino"
                  placeholder="exemplo@banco.com"
                  className="w-full rounded-lg border border-white/10 bg-[#1b1b3a] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] outline-none"
                  required
                />
              </div>

              {/* Valor */}
              <div className="space-y-1">
                <label className="text-1xl font-medium text-gray-300">
                  Valor (R$)
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#1b1b3a] px-3 py-2">
                  <span className="text-sm text-gray-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="valorPix"
                    placeholder="0,00"
                    className="w-full bg-transparent text-sm text-white outline-none"
                    required
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 border border-white/15 text-gray-200 hover:bg-white/5 transition"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 bg-[#FF007F] hover:bg-[#D6006A] text-white font-semibold transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalPix;
