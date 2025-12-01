import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModalPix from "./ModalPix";
import ModalExtrato from "../components/ModalExtrato";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [valor, setValor] = useState("");
  const [transacoesEfetivadas, setTransacoesEfetivadas] = useState([]);
  const [transacoesPendentes, setTransacoesPendentes] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [pending, setPending] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openExtrato, setOpenExtrato] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const fetchBalance = async () => {
    try {
      const response = await fetch(
        `http://localhost:8082/users/${userId}/balance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar saldo");
      }

      const data = await response.text();
      setSaldo(Number(data));
    } catch (error) {
      toast.error("Erro ao buscar saldo: " + error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:8080/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.log("123");
        navigate("/login");
        return;
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.log("Erro ao buscar usuário: " + error);
      console.log("456");
      navigate("/login");
    }
  };

  const fetchTransacoesEfetivadas = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8082/users/${user.id}/transactions/confirmed`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setTransacoesEfetivadas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erro ao carregar transações: " + error);
    }
  };

  const fetchTransacoesPendentes = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8082/users/${user.id}/transactions/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setTransacoesPendentes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erro ao carregar transações: " + error);
    }
  };

  const interval = useCallback(() => {
    setInterval(() => {
    fetchBalance();
    fetchTransacoesEfetivadas();
    fetchTransacoesPendentes();
    }, 5000);
  });

  // Checando o Login e buscando o usuário
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/login");
      return;
    }

    fetchUser();
    fetchBalance();
  }, [navigate]);

  // Buscando todas as transações daquele usuário
  useEffect(() => {
    if (!user?.id) return;

    fetchTransacoesEfetivadas();
    fetchTransacoesPendentes();

    interval();
  }, [user?.id]);

  // Buscando transações pendentes
  /*useEffect(() => {
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
        transacoesPendentes(data);
      } catch (error) {
        toast.error("Erro ao carregar transações pendentes");
      }
    };

    fetchPending();
  }, [user?.id]);*/

  // Confirmando a transação
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

      fetchTransacoesEfetivadas();
      fetchTransacoesPendentes();
      fetchBalance();
      // Removendo a transação da lista de pendentes
      //transacoesPendentes((prev) => prev.filter((t) => t.id !== transactionId));

      // Atualizando o extrato completo
      /*const transResponse = await fetch(
        `http://localhost:8082/users/${user.id}/transactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const transData = await transResponse.json();
      setTransacoes(transData);

      // Atualizando o saldo
      const saldoResponse = await fetch(
        `http://localhost:8082/users/${user.id}/balance`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const novoSaldo = await saldoResponse.text();*/
    } catch (error) {
      toast.error("Erro ao confirmar transação");
    }
  };

  // Fazendo Logout
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
        {/* Botão para Mobile */}
        <button
          className="md:hidden cursor-pointer fixed top-4 left-4 z-40 bg-[#FF0066] p-2 rounded-md hover:bg-[#be004c] transition"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* Barra lateral desktop */}
        <aside className="hidden md:flex md:flex-col bg-[#0c0c22] p-6 w-64 h-screen sticky top-0">
          <div className="flex flex-col justify-between h-full">
            <div>
              <h1 className="text-2xl font-bold text-[#FF0066] mb-10">
                GoldFinger Bank
              </h1>

              <nav className="space-y-3">
                {/* Visão Geral */}
                <button
                  onClick={() =>
                    toast.info("Ops! Funcionalidade em construção.")
                  }
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Visão Geral
                </button>

                {/* Transferências */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Transferência via Pix
                </button>

                {/* Extrato */}
                <button
                  onClick={() => setOpenExtrato(true)}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Extrato
                </button>
                {/* Cartões */}
                <button
                  onClick={() =>
                    toast.info("Ops! Funcionalidade em construção.")
                  }
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                >
                  Cartões
                </button>

                {/* Configurações */}
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

        {/* Barra lateral para Mobile */}
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
                      {/* Visão Geral */}
                      <button
                        onClick={() =>
                          toast.info("Ops! Funcionalidade em construção.")
                        }
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Visão Geral
                      </button>

                      {/* Transferência */}
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Transferência via Pix
                      </button>

                      {/* Extrato */}
                      <button
                        onClick={() => setOpenExtrato(true)}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Extrato
                      </button>

                      {/* Cartões */}
                      <button
                        onClick={() =>
                          toast.info("Ops! Funcionalidade em construção.")
                        }
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#FF0066]/20 transition"
                      >
                        Cartões
                      </button>

                      {/* Configurações */}
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

        {/* Conteúdo da página */}
        <main className="flex-1 p-6 md:p-10 mt-16 md:mt-0 transition-all">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-[#FF0066]">
              Bem-vindo, {user ? user.name : "Carregando..."}
            </h2>

            <p className="text-gray-400 text-sm md:text-base">
              Último acesso: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Saldo da conta */}
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
          {/* Área de transações pendentes */}
          {transacoesPendentes.length > 0 && (
            <div className="bg-[#0c0c22] p-6 rounded-xl shadow-lg mb-10">
              <h3 className="text-xl font-semibold text-[#FF0066] mb-4">
                PIX pendentes de confirmação
              </h3>

              {/* Buscando transações pendentes */}
              <div className="space-y-4">
                {transacoesPendentes.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center border-b border-gray-700 pb-3"
                  >
                    <div>
                      <p className="text-white">
                        Pix de{" "}
                        {Number(p.amount).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        pendente de {p.sender.name}
                      </p>
                    </div>
                    {/*  Aceitar PIX  */}
                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                        onClick={() => handleConfirm(p.id, true)}
                      >
                        Aceitar
                      </button>
                      {/* Rejeitar PIX */}
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

          {/* Área de ultimas transações */}
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
                {/* Buscando últimas transações */}
                <tbody className="divide-y divide-gray-700">
                  {transacoesEfetivadas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-gray-400"
                      >
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  ) : (
                    // Limitando às últimas 3 transações
                    transacoesEfetivadas.slice(0, 3).map((t) => {
                      const isEntrada = t.receiverId === user.id;
                      {/* Diferenciando transações de Entrada ou Saída */}
                      return (
                        <tr key={t.id}>
                          <td className="py-3">
                            {t.createdAt
                              ? new Date(t.createdAt).toLocaleString("pt-BR")
                              : ""}
                          </td>
                          <td>
                            {isEntrada
                              ? `Pix recebido de ${t.sender.name}`
                              : `Pix enviado para ${t.receiver.name}`}
                          </td>

                          {/* Alterando a cor conforme o tipo (entrada ou saída) */}
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
                {/* Adicionando valores das últimas transações */}
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
      {/* Enviando para Modal de Extrato */}
      <ModalExtrato
        open={openExtrato}
        onClose={() => setOpenExtrato(false)}
        transacoes={transacoesEfetivadas}
      />
      {/* Enviando para modal de Pix */}
      <ModalPix
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchTransacoesEfetivadas();
          fetchTransacoesPendentes();
          fetchBalance();
        }}
      />
    </motion.div>
  );
}
