const request = require('supertest');
const app = require('../server');
const prisma = require('../src/config/prisma');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
    },
    contact: {
        count: jest.fn(),
    },
    category: {
        count: jest.fn(),
    },
    product: {
        count: jest.fn(),
    }
}));

const MOCK_DASHBOARD_DATA = {
    totalContacts: 5,
    totalCategories: 3,
    totalProducts: 10
};

const MOCK_USER_ID = 1;
const MOCK_USER_EMAIL = 'test@example.com';
const MOCK_TOKEN = jwt.sign({ id: MOCK_USER_ID }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1d' });

describe('GET /api/dashboard (anteriormente /api/data/dashboard)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        prisma.user.findUnique.mockResolvedValue({ id: MOCK_USER_ID, email: MOCK_USER_EMAIL });
        
        prisma.contact.count.mockResolvedValue(MOCK_DASHBOARD_DATA.totalContacts);
        prisma.category.count.mockResolvedValue(MOCK_DASHBOARD_DATA.totalCategories);
        prisma.product.count.mockResolvedValue(MOCK_DASHBOARD_DATA.totalProducts);
    });

    it('deve retornar 401 se o token estiver faltando', async () => {
        const response = await request(app)
            .get('/api/dashboard'); 

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Token de autenticação é obrigatório');
    });

    it('deve retornar os dados do dashboard para um usuário autenticado', async () => {
        const response = await request(app)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${MOCK_TOKEN}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(MOCK_DASHBOARD_DATA);
        expect(prisma.contact.count).toHaveBeenCalledTimes(1);
        expect(prisma.category.count).toHaveBeenCalledTimes(1);
        expect(prisma.product.count).toHaveBeenCalledTimes(1);
    });
});

describe('POST /api/auth/register', () => {
    it('deve retornar 400 se a senha estiver faltando', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Faltando Senha', email: 'no_password@exemplo.com' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('É necessário inserir email e senha');
    });
});