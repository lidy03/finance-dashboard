const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET){
    console.error("ERRO: Variável JWT_SECRET não foi definida");
}

router.post('/register', async(req, res)=> {
    const { email, password, name} = req.body;

    if(!email || !password){
        return res.status(400).json({error: 'É necessário inserir email e senha'});
    }

    try{
        const existingUSer = await prisma.user.findUnique({where: { email }});
        
        if(existingUSer){
            return res.status(409).json({erro: 'Usuário já existe'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data:{
                email,
                name,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
        res.status(201).json({message: 'Registro concluído!', user: newUser });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno no servidor'});
    }
});

router.post('/login', async (req, res)=> {
    const {email, password} = req.body;

    if (!email || !password){
        return res.status(400).json({error: 'É necessário inserir email e senha'});
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if(!user){
            return res.status(401).json({error: 'Credenciais inválidas'});
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if(!isValidPassword){
            return res.status(401).json({error: 'Credenciais inválidas'});
        }

        const token = jwt.sign(
            {userId: user.id},
            JWT_SECRET,
            { expiresIn: '7d'}
        );

        res.status(200).json({
            token,
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error){
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor.'});
    }
});

module.exports = router;