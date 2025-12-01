import {motion} from "framer-motion";
import {Link} from "react-router-dom";
import "../App.css";

function Home() {
  return (
    <motion.div
      className="flex flex-col min-h-screen bg-[#141333] text-white overflow-x-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}>
    
      {/* Cabeçalho */}
      <header className="w-full bg-[#0c0c22] text-[#FF0066] flex flex-col
      sm:flex-row justify-between items-center p-4 sm:p-6 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0 text-center sm:text-left">
          GoldFinger Bank
        </h1>

        {/* Botões */}
        <div className="flex space-x-3 sm:space-x-4">
          <Link to="/login">
            <button className="bg-[#FF0066] font-bold text-white cursor-pointer
              px-5 py-2 rounded-lg hover:bg-[#be004c] transition text-sm sm:text-base">
              Login
            </button>
          </Link>

        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col grow justify-center items-center text-center px-6 py-10 sm:px-10">
        <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-[#FF0066] leading-tight">
          Bem-vindo ao GoldFinger Bank
        </h2>

        <p className="text-base sm:text-lg max-w-md sm:max-w-xl mb-8 text-gray-300">
          Seu banco digital seguro, prático e inovador.
        </p>

        <Link to="/register">
          <button className="bg-[#FF0066] font-bold text-white px-8 sm:px-10 cursor-pointer
            py-3 sm:py-4 rounded-lg hover:bg-[#be004c] transition text-sm sm:text-lg">
            Abra sua conta
          </button>
        </Link>
      </main>

      {/* Rodapé */}
      <footer className="bg-[#040020] text-center py-4 text-xs sm:text-sm text-gray-400 mt-auto">
        © {new Date().getFullYear()} GoldFinger Bank. Todos os direitos reservados.
      </footer>
    </motion.div>
  );
}

export default Home;
