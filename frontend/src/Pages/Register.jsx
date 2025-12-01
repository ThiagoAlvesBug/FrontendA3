import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { login } from "../services/authService";

function Register() {
  const navigate = useNavigate();
  // Definindo os campos como vazios
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Definindo os requisitos da senha
  const hasNumber = /\d/.test(formData.senha);
  const hasUpper = /[A-Z]/.test(formData.senha);
  const hasLower = /[a-z]/.test(formData.senha);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.senha);
  // Senha e a confirmação devem ser iguais
  const passwordMatches =
    formData.senha.length > 0 && formData.senha === formData.confirmarSenha;
  // Enviando
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Valida se a senha cumpre os requisitos
    if (
      hasNumber === false ||
      hasUpper === false ||
      hasLower === false ||
      hasSpecial === false
    ) {
      toast.error("Senha inválida!");
      return;
    }
    // Valida se as senhas batem
    if (!passwordMatches) {
      setError("As senhas não coincidem!");
      return;
    }
    // Mandando a requisição para o banco via requisição HTTP
    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email,
          password: formData.senha,
        }),
      });
      // Verifica se o email ja existe no banco
      if (!response.ok) {
        const errData = await response.json().catch(() => null);

        if (response.status === 409) {
          setError("E-mail já cadastrado.");
        } else {
          setError(errData?.message || "Erro ao registrar. Tente novamente.");
        }
        return;
      }
      // Confirmando que a conta foi criada
      setSuccess("Conta criada com sucesso! Redirecionando...");

      const data = await login({ email: formData.email, password: formData.senha });
      // Salvar no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);

      // Redirecionar corretamente
      navigate(`/dashboard/${data.userId}`);
    } catch (err) {
      setError("Falha na conexão com o servidor.");
    }
  };

  return (
    // Animação Fade in/out
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen 
      bg-[#0B0B1D] text-white px-6 overflow-x-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      
      {/* Construindo a tela */}
      <div
        className="bg-[#111133] w-full max-w-md sm:max-w-lg 
      p-6 sm:p-8 rounded-2xl shadow-xl border border-[#1e1e3f]"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#FF007F] text-center mb-6">
          Crie sua Conta
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome completo
            </label>
            <input
              name="nome"
              type="text"
              placeholder="Digite seu nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#1b1b3a] text-white 
              focus:outline-none focus:ring-2 focus:ring-[#FF007F] 
              placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#1b1b3a] text-white 
              focus:outline-none focus:ring-2 focus:ring-[#FF007F] 
              placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>

            <div className="relative">
              <input
                name="senha"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={formData.senha}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 rounded-lg bg-[#1b1b3a] text-white 
                focus:outline-none focus:ring-2 focus:ring-[#FF007F] 
                placeholder-gray-400 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                text-gray-400 cursor-pointer hover:text-[#FF007F] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Regras de senha */}
            <ul className="text-xs mt-2 space-y-1">
              <li className={hasNumber ? "text-green-400" : "text-gray-400"}>
                • Contém números
              </li>
              <li
                className={
                  hasUpper && hasLower ? "text-green-400" : "text-gray-400"
                }
              >
                • Letras maiúsculas e minúsculas
              </li>
              <li className={hasSpecial ? "text-green-400" : "text-gray-400"}>
                • Caracteres especiais
              </li>
            </ul>
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                name="confirmarSenha"
                type={showPassword ? "text" : "password"}
                placeholder="Repita sua senha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 rounded-lg bg-[#1b1b3a] text-white 
                focus:outline-none focus:ring-2 focus:ring-[#FF007F] 
                placeholder-gray-400 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                cursor-pointer text-gray-400 hover:text-[#FF007F] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Senhas Conferem */}
            <ul className="text-xs mt-2 space-y-1">
              <li
                className={passwordMatches ? "text-green-400" : "text-gray-400"}
              >
                • Senhas coincidem
              </li>
            </ul>
          </div>

          {/* Mensagens */}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          {/* Botão */}
          <button
            type="submit"
            className="mt-4 bg-[#FF007F] hover:bg-[#D6006A] transition cursor-pointer
            text-white font-semibold py-2 sm:py-3 rounded-lg w-full text-sm sm:text-base"
          >
            Registrar
          </button>
        </form>

        {/* Links com a tela de Login e Menu Principal  */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-gray-400 text-xs sm:text-sm">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-[#FF007F] hover:underline cursor-pointer hover:text-[#ff3399]"
            >
              Fazer login
            </Link>
          </p>

          <Link to="/" className="inline-block">
            <button
              className="border border-[#FF007F] text-[#FF007F] 
            px-6 py-2 rounded-lg hover:bg-[#FF007F] hover:text-white 
            cursor-pointer transition text-sm sm:text-base"
            >
              Voltar para o início
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default Register;
