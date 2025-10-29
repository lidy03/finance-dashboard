import { LogIn } from "lucide-react";
import { useState } from "react";

const LoginCard = ({ setCurrentView}) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if(!email || !password) {
            setError('Por favor preencha todos os campos.');
            setIsLoading(false);
            return;
        }

        const API_URL = '/api/auth/login';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login bem-sucedido. Token recebido:', data.token);
                const userData = { id: data.userId || email, email: email, token: data.token };
                login(userData);
        } else {
            const errorMessage = data.error || 'Erro desconhecido na autênticaçaõ';
            setError(errorMessage);
        }
        } catch (err) {
            console.error('Erro de Rede ou Parse:', err);
            setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100 animate-in fade-in duration-500">
            <div className="flex flex-col items-center mb-8">
                <LogIn className="w-8 h-8 text-blue-600 mb-3"/>
                <h1 className="text-3xl font-extrabold text-gray-900">Acesso ao Dashboard</h1>
                <p className="text-gray-500 mt-1" >Insira suas credenciais</p>
            </div>

            <form onSubmit={handleLogin}>
                <InputField Icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" disabled={isLoading}/>
                <InputField Icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" disabled={isLoading}/>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                        <span className="font-medium block">{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg shadow-blue-500/50 disabled:bg-blue-400"
                >
                    {isLoading ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...</>
                    ) : (
                        <><LogIn className="w-5 h-5 mr-2" /> Entrar</>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                Ainda não tem conta? <a
                    href="#"
                    onClick={() => setCurrentView('register')}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                    Crie sua conta
                </a>
            </div>
        </div>
    );
};