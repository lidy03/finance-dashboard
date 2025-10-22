const request = require('supertest');
const app = require('../server');
const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs');

jest.mock('../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(), 
    },
}));

const MOCK_USER_DATA = {
    name: 'Novo Usuário',
    email: 'novo@exemplo.com',
    password: 'senhaSegura123',
};

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const now = new Date();
        
        bcrypt.hash.mockResolvedValue('hashedPassword123');
        prisma.user.findUnique.mockResolvedValue(null); 
        
        prisma.user.create.mockImplementation((data) => {
            return Promise.resolve({ 
                id: 1, 
                name: data.data.name,
                email: data.data.email,
                createdAt: now,
                updatedAt: now,
            });
        });
    });
    
    it('deve retornar 201 e o objeto do usuário (sem senha) no sucesso', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(MOCK_USER_DATA);

        expect(prisma.user.create).toHaveBeenCalledTimes(1);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('email', MOCK_USER_DATA.email);
        expect(response.body).not.toHaveProperty('password'); 
        expect(bcrypt.hash).toHaveBeenCalledWith(MOCK_USER_DATA.password, 10);
    });

    it('deve retornar 409 se o email já estiver em uso', async () => {
        prisma.user.create.mockImplementationOnce(() => {
            return Promise.reject({
                code: 'P2002',
                meta: {
                    target: ['email'],
                },
                message: 'A unique constraint violation on the email field.',
            });
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send(MOCK_USER_DATA);

        expect(prisma.user.create).toHaveBeenCalledTimes(1);
        expect(response.statusCode).toBe(409); 
        expect(response.body.error).toBe('Usuário já existe'); 
    });


    it('deve retornar 400 se a senha estiver faltando', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Faltando Senha', email: 'no_password@exemplo.com' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('É necessário inserir email e senha'); 
        expect(prisma.user.create).not.toHaveBeenCalled();
    });
});