import React from 'react';
import InputField from '../InputField.jsx';
import { ICONS } from '../../../../public/assets/icons.js';

const RegisterCard = ({ formData, handleInputChange, handleSubmit, loading, error }) => {
    return (
        <div className="bg-white p-8 sm:p-10 rounded-x1 shadow-2x1 w-full max-w-sm mx-auto">
            <div className="text-center mb-6">
                <img src={ICONS.register} alt="Register" className="w-12 h-12 mx-auto mb-3"/>
                <h2 className="text-2xl font-bold text-gray-800">Crie sua Conta</h2>
                <p className="text-sm text-gray-500">Gerencie suas contas</p>
            </div>

            <form onSubmit={handleSubmit}>

                <InputField
                    image={ICONS.name}
                    type="text"
                    placeholder="Nome de usuário"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                />
                <InputField
                    image={ICONS.email}
                    type="email"
                    placeholder="E-mail"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                />
                <InputField
                    image={ICONS.password}
                    type="password"
                    placeholder="Senha"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                />

                <button
                    type='submit'
                    disabled={loading}
                    className="w-full mt-6 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? (
                        <>
                        Registrando
                        </>
                    ):(
                        'Registrar'
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Já tem uma conta? <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Faça Login</a>
            </p>
        </div>
    )
}


export default RegisterCard;
