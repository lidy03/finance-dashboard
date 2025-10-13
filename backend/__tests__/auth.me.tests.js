const request = require('supertest');
const app = require('../server');
const prisma = require('../src/config/prisma');
const jwt = require('jsonwebtoken');

// MOCKS GLOBAIS
jest.mock('jsonwebtoken');
jest.mock('../src/middleware/authmiddleware');


// Mockar o módulo real de Middleware
const authMiddleware = require('../src/middleware/authmiddleware');

// Mock Agressivo para o Prisma 
jest.mock('../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

// Dados de teste
const MOCK_USER = {
    id: 1,
    email: 'teste@exemplo.com',
    name: 'Usuário Teste',
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
};

describe('GET /api/auth/me', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        
        authMiddleware.mockImplementation((req, res, next) => {
            req.userId = MOCK_USER.id; 
            next();
        });
    });
    
    // CENÁRIO 1: Sucesso - Retorna os dados do usuário logado
    it('deve retornar 200 e os dados do usuário (sem senha) se autenticado', async () => {
        
        // Configuração do Mock do DB
        prisma.user.findUnique.mockResolvedValue({
            ...MOCK_USER
        });

        // Execução (Enviamos uma requisição, o authMiddleware mockado permite a passagem)
        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer dummy.valid.token');

        // Verificação
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(MOCK_USER.id);
        expect(response.body.email).toBe(MOCK_USER.email);
        expect(response.body).not.toHaveProperty('password'); 
        
        // Verifica se o Prisma foi chamado com o ID injetado pelo middleware
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: MOCK_USER.id },
            select: expect.any(Object),
        });
    });

    // CENÁRIO 2: Falha - Middleware bloqueia a requisição 
    it('deve retornar 401 quando o token está ausente ou inválido (mocking middleware failure)', async () => {
        
        authMiddleware.mockImplementationOnce((req, res, next) => {
            res.status(401).json({ error: 'Token inválido ou expirado.' });
        });
        // 2. Execução
        const response = await request(app) 
            .get('/api/auth/me'); 

        // 3. Verificação
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Token inválido ou expirado.');
        expect(prisma.user.findUnique).not.toHaveBeenCalled(); 
    }, 10000); 


    // CENÁRIO 3: Falha - Usuário não encontrado no DB 
    it('deve retornar 404 se o usuário não for encontrado no DB (token válido, mas usuário deletado)', async () => {
        // 1. Configuração do Mock do DB
        prisma.user.findUnique.mockResolvedValue(null); 

        // 2. Execução
        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer dummy.valid.token');
            
        // 3. Verificação
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Usuário não encontrado'); 
        expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
});