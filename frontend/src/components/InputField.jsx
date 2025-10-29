import { User, Mail, Lock } from 'lucide-react';
import { type } from 'os';
const InputFields = ({ Icon, type, value, onChange, placeholder, disabled }) => (
    <div className='relative mb-6'>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm disabled:bg-gray-50"
            required
            disabled
        />
    </div>
)
