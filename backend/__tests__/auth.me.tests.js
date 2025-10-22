const request = require('supertest');
const app = require('../server');
const prisma = require('../src/config/prisma');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

jest.mock('../src/middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => next()),
}));
const { authMiddleware } = require('../src/middleware/authMiddleware');

jest.mock('../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

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
    
    it('deve retornar 200 e os dados do usuário (sem senha) se autenticado', async () => {
        
        prisma.user.findUnique.mockResolvedValue({
            ...MOCK_USER
        });

        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer dummy.valid.token');

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(MOCK_USER.id);
        expect(response.body.email).toBe(MOCK_USER.email);
        expect(response.body).not.toHaveProperty('password'); 
        
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: MOCK_USER.id },
            select: expect.any(Object),
        });
    });

    it('deve retornar 401 quando o token está ausente ou inválido (mocking middleware failure)', async () => {
        
        authMiddleware.mockImplementationOnce((req, res, next) => {
            res.status(401).json({ error: 'Token inválido ou expirado.' });
        });
        const response = await request(app) 
            .get('/api/auth/me'); 

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Token inválido ou expirado.');
        expect(prisma.user.findUnique).not.toHaveBeenCalled(); 
    }, 10000); 


    it('deve retornar 404 se o usuário não for encontrado no DB (token válido, mas usuário deletado)', async () => {
        prisma.user.findUnique.mockResolvedValue(null); 

        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer dummy.valid.token');
            
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Usuário não encontrado'); 
        expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
});
