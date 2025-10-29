import React from "react";
import RegisterCard from "../components/auth/RegisterCard";

const RegisterPage = ({ setCurrentView }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <RegisterCard setCurrentView={setCurrentView}/>
        </div>
    );
};

export default RegisterPage;