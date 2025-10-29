import { UserPlus } from "lucide-react";
import { useState } from "react"

const RegisterCard = ({ setCurrentView }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e) => {
         e.preventDefault();
         setError(null);
         setSuccess(false);
         setIsLoading(true);

         if (!name || !email || !password) {
            setError('Por favor, preencha todos os campos.');
            setIsLoading(false);
            return;
         }

         const API_URL = '/api/auth/register';

         try {
            const response = await fetch( API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ name, email, password }), 
            });

        const data = await response.json();

            if (response.ok) {
               console.log('Registro bem-sucedido:', data);
                setSuccess(true);
                setName('');
                setEmail('');
                setPassword('');

                setTimeout(() => setCurrentView('login'), 2000);

            } else {
                const errorMessage = data.error || 'Erro desconhecido na autenticação.';
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
                    <UserPlus className='w-8 h-8 text-green-600 mb-3'/>
                    <h1 className="text-3xl font-extrabold text-gray-900">Criar Nova Conta</h1>
                </div>

                <form onSubmit={handleRegister}>
                    <InputField Icon={User} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder = "Nome Completo" disabled={isLoading}></InputField>
                    <InputField Icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder = "E-mail" disabled={isLoading}></InputField>
                    <InputField Icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder = "Password" disabled={isLoading}></InputField>

                    {error && (
                        <div className="bg-green-100 border-green-400 text-green-700 px-4 py3 rounded-lg relative mb-4 text-sm" role="alert">
                            <span className="font-medium block"> Não foi possível concluir o registro</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                            <span className="font-medium block"> 🎉 Conta criada com sucesso! Redirecionando...</span>
                        </div>
                    )}

                    <button
                        type="Submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg shadow-green-500/50 disabled:bg-green-400"
                    
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Registrando...</>
                        ) : (
                            <><UserPlus className="w-5 h-5 mr-2" /> Registrar</>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Já tem uma conta? <a
                        href="#"
                        onClick={() => setCurrentView('login')}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Faça login
                    </a>
                </div>
            </div>
        );
    };

    export default RegisterCard;
