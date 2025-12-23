import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterCard from "../../components/auth/RegisterCard.jsx";


const RegisterPage = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email:'',
        password:'',
        confirmPassword:''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const {name, email, password, confirmPassword } = formData;

        if(password !== confirmPassword) {
            setError ('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        if(!name || !email || !password || !confirmPassword) {
            setError('Todos os campos são obrigatórios.');
            setLoading(false);
            return;
        }

        try {
            console.log ('Registrando:', {name, email});

            const apiUrl= 'https://finance-dashboard-j225.onrender.com/api/auth/register'
    
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login', {state: { message: 'Conta criada com sucesso!'} });
            } else {
                setError(data.error || 'Erro ao criar conta.');
            } 
            
        } catch (err) {
            console.error(err);
            setError('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
             <RegisterCard
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default RegisterPage;