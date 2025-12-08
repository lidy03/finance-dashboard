import React from 'react';

const InputField = ({ image, type, value, onChange, name, placeholder, disabled}) => (
    <div className='realtive mb-6 group'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            {imageUrl && (
                <img
                    src={image}
                    alt={`Ícone para ${placeholder || 'campo'}`}
                    className="w-5 h-5 object-contain text-gray-400"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src="https://placehold.co/20x20/9CA3AF/FFFFFF?text=?"
                    }}
                />
            )}
        </div>

        <input
            type={type}
            value={value}
            onChange={onChange}
            name={name}
            placeholder={placeholder}
            className="w-full h-12 pl-10 pr-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 duration-150 shadow-sm text-gray-800 disabled:bg-gray-100 disabled:cursosr not allowed"
            required
            disabled={disabled}
        />
    </div>
);

export default InputField;