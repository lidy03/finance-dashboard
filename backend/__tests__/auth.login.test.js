const request = require('supertest');
const app = require('../server');
const prisma = require('../src/config/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

jest.mock('../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

const MOCK_USER = {
    id: 1,
    email: 'test@login.com',
    password: 'hashedPassword', 
    name: 'Usuário Login',
};
const MOCK_TOKEN = 'mocked.jwt.token';

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jwt.sign.mockReturnValue(MOCK_TOKEN);
        bcrypt.compare.mockResolvedValue(true);
    });


    it('deve retornar 401 se o usuário não for encontrado', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'naoexiste@test.com', password: 'anypassword' });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Credenciais inválidas'); 
        
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se a senha estiver incorreta', async () => {
        prisma.user.findUnique.mockResolvedValue(MOCK_USER);
        bcrypt.compare.mockResolvedValue(false); 

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: MOCK_USER.email, password: 'wrongpassword' });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Credenciais inválidas'); 
        
        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
        expect(jwt.sign).not.toHaveBeenCalled();
    });
    
    it('deve retornar 400 se o email estiver faltando', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ password: 'anypassword' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Email e senha são obrigatórios.'); 
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
});
