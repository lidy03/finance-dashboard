const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'É necessário inserir email e senha' }); 
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.status(201).json(newUser);

    } catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
            return res.status(409).json({ error: 'Usuário já existe' }); 
        }
        console.error('Erro no registro:', error.message);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({ 
            token,
            user: userWithoutPassword 
        });

    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

const getMe = async (req, res) => {
    const userId = parseInt(req.userId); 

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário logado:', error.message);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

module.exports = {
    register,
    login,
    getMe,
};