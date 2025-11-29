import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModalPix from "./ModalPix";
import { toast } from "react-toastify";

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [valor, setValor] = useState("");
  const [transacoes, setTransacoes] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [pending, setPending] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // 🔥 1. CHECK LOGIN + BUSCAR USUÁRIO
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          navigate("/login");
          return;
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        toast.error("Erro ao buscar usuário: " + error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // 🔥 2. BUSCAR TRANSACOES QUANDO O USER CARREGAR
  useEffect(() => {
    if (!user?.id) return;

    const fetchTransacoes = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:8082/users/${user.id}/transactions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setTransacoes(Array.isArray(data) ? data : []);
        
        // Calcula saldo a partir de senderId e receiverId
        const updatedSaldo = data.reduce((acc, transaction) => {
          if(transaction.status !== 'CONFIRMED')
            return acc;
          if (transaction.receiverId === user.id)
            return acc + transaction.amount;
          if (transaction.senderId === user.id) return acc - transaction.amount;
          return acc;
        }, 0);

        setSaldo(updatedSaldo);
      } catch (error) {
        toast.error("Erro ao carregar transações: " + error);
      }
    };

    fetchTransacoes();
  }, [user?.id]);

  // 🔥 3. BUSCAR TRANSACOES PENDENTES
  useEffect(() => {
    if (!user?.id) return;

    const fetchPending = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8082/users/${user.id}/transactions/pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        setPending(data);
      } catch (error) {
        toast.error("Erro ao carregar transações pendentes");
      }
    };

    fetchPending();
  }, [user?.id]);

  // 🔥 4. CONFIRMAR TRANSACAO
  const handleConfirm = async (transactionId, accepted) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8082/users/${user.id}/transactions/${transactionId}/confirm?accepted=${accepted}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        toast.error("Erro ao atualizar transação");
        return;
      }

      toast.success(accepted ? "Transação aprovada!" : "Transação rejeitada!");

      // remover da lista de pendentes
      setPending((prev) => prev.filter((t) => t.id !== transactionId));

      // atualizar extrato completo
      const transResponse = await fetch(
        `http://localhost:8082/users/${user.id}/transactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const transData = await transResponse.json();
      setTransacoes(transData);

      // atualizar saldo
      const saldoResponse = await fetch(
        `http://localhost:8082/users/${user.id}/balance`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const novoSaldo = await saldoResponse.text();
      setSaldo(Number(novoSaldo));
    } catch (error) {
      toast.error("Erro ao confirmar transação");
    }
  };

  // 🔥 5. LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-[#141333] text-white overflow-x-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col md:flex-row min-h-screen bg-[#141333] text-white overflow-x-hidden">
        {/* BOTÃO MOBILE */}
        <button
          className="md:hidden fixed top-4 left-4 z-40 bg-[#FF0066] p-2 rounded-md hover:bg-[#be004c] transition"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* SIDEBAR DESKTOP */}
        <aside className="hidden md:flex md:flex-col bg-[#0c0c22] p-6 w-64 h-screen sticky top-0">
          <div className="flex flex-col justify-between h-full">
            <div>
              <h1 className="text-2xl font-bold text-[#FF0066] mb-10">
                GoldFinger Bank
              </h1>

              <nav className="space-y-3">
                <button
                  onClick={() =>
                    toast.info("Ops! Funcionalidade em construção.")
                  }
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Visão Geral
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Transferência via Pix
                </button>

                <button
                  onClick={() =>
                    toast.info("Ops! Funcionalidade em construção.")
                  }
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Extrato
                </button>
                <button
                  onClick={() =>
                    toast.info("Ops! Funcionalidade em construção.")
                  }
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Cartões
                </button>
                <button
                  onClick={() =>
                    toast.info("Ops! Funcionalidade em construção.")
                  }
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Configurações
                </button>
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-[#FF0066] py-2 rounded-lg hover:bg-[#be004c] transition cursor-pointer"
            >
              Sair
            </button>
          </div>
        </aside>

        {/* SIDEBAR MOBILE */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsOpen(false)}
              />

              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 60 }}
                className="fixed top-0 left-0 h-full w-60 bg-[#0c0c22] p-6 z-50 flex flex-col justify-between md:hidden"
              >
                <button
                  className="absolute top-4 right-4 text-zinc-50 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h1 className="text-2xl font-bold text-[#FF0066] mb-10">
                      GoldFinger Bank
                    </h1>

                    <nav className="space-y-4">
                      <button
                        onClick={() =>
                          toast.info("Ops! Funcionalidade em construção.")
                        }
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Visão Geral
                      </button>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Transferência via Pix
                      </button>
                      <button
                        onClick={() =>
                          toast.info("Ops! Funcionalidade em construção.")
                        }
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Extrato
                      </button>
                      <button
                        onClick={() =>
                          toast.info("Ops! Funcionalidade em construção.")
                        }
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Cartões
                      </button>
                      <button
                        onClick={() =>
                          toast.info("Ops! Funcionalidade em construção.")
                        }
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Configurações
                      </button>
                    </nav>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-[#FF0066] py-2 rounded-lg hover:bg-[#be004c] transition"
                  >
                    Sair
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-6 md:p-10 mt-16 md:mt-0 transition-all">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-[#FF0066]">
              Bem-vindo, {user ? user.name : "Carregando..."}
            </h2>

            <p className="text-gray-400 text-sm md:text-base">
              Último acesso: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* SALDO SIMPLES E LIMPO */}
          <div className="bg-[#0c0c22] p-6 rounded-xl shadow-lg mb-10 text-center md:text-left">
            <h3 className="text-lg text-gray-400 mb-2">Saldo disponível</h3>

            <p className="text-3xl font-bold text-[#00ff9d]">
              {saldo != null
                ? `R$ ${Number(saldo).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : "Carregando..."}
            </p>
          </div>

          {pending.length > 0 && (
            <div className="bg-[#0c0c22] p-6 rounded-xl shadow-lg mb-10">
              <h3 className="text-xl font-semibold text-[#FF0066] mb-4">
                PIX pendentes de confirmação
              </h3>

              <div className="space-y-4">
                {pending.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center border-b border-gray-700 pb-3"
                  >
                    <div>
                      <p className="text-white">
                        <strong>De:</strong> Usuário {p.senderId}
                      </p>
                      <p className="text-white">
                        <strong>Valor:</strong> R${" "}
                        {Number(p.amount).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                        onClick={() => handleConfirm(p.id, true)}
                      >
                        Aceitar
                      </button>

                      <button
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                        onClick={() => handleConfirm(p.id, false)}
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSAÇÕES */}
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-[#FF0066]">
              Últimas transações
            </h3>

            <div className="bg-[#0c0c22] rounded-xl p-4 md:p-6 shadow-lg overflow-x-auto">
              <table className="w-full text-left min-w-[400px] text-sm md:text-base">
                <thead className="text-gray-400">
                  <tr>
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Descrição</th>
                    <th className="pb-3">Valor</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-700">
                  {transacoes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-gray-400"
                      >
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  ) : (
                    transacoes.slice(0, 3).map((t) => {
                      const isEntrada = t.receiverId === user.id;

                      return (
                        <tr key={t.id}>
                          <td className="py-3">
                            {t.createdAt
                              ? new Date(t.createdAt).toLocaleString("pt-BR")
                              : ""}
                          </td>
                          <td>{t.description}</td>
                          <td
                            className={
                              isEntrada ? "text-green-400" : "text-red-400"
                            }
                          >
                            {isEntrada ? "+ " : "- "}
                            R${" "}
                            {Number(Math.abs(t.amount || 0)).toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                <tfoot className="text-gray-400">
                  <tr>
                    <th className="pb-3"></th>
                    <th className="pb-3"></th>
                    <th className="pb-3">
                      {saldo >= 0 ? "+ " : "- "}
                      R${" "}
                      {Number(Math.abs(saldo)).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </main>
      </div>

      <ModalPix isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}

export default Dashboard;
