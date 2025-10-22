const request = require('supertest');
const app = require('../server'); 
const prisma = require('../src/config/prisma'); 

jest.mock('../src/middleware/authMiddleware', () => ({
    authMiddleware: (req, res, next) => {
        req.userId = '1'; 
        next();
    },
}));

jest.mock('../src/config/prisma', () => ({
    category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

const MOCK_USER_ID = 1;
const MOCK_CATEGORY_ID = 99;

describe('Category API Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /api/categories deve criar uma nova categoria', async () => {
        const newCategory = { name: 'Transporte' };
        const createdCategory = { id: MOCK_CATEGORY_ID, userId: MOCK_USER_ID, name: 'Transporte' };

        prisma.category.create.mockResolvedValue(createdCategory);

        const response = await request(app)
            .post('/api/categories')
            .send(newCategory)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body).toEqual(createdCategory);
        expect(prisma.category.create).toHaveBeenCalledWith({
            data: {
                userId: MOCK_USER_ID,
                name: 'Transporte',
            },
        });
    });

    it('GET /api/categories deve listar categorias do usuário autenticado', async () => {
        const userCategories = [
            { id: 10, userId: MOCK_USER_ID, name: 'Alimentação' },
            { id: 11, userId: MOCK_USER_ID, name: 'Lazer' },
        ];

        prisma.category.findMany.mockResolvedValue(userCategories);

        const response = await request(app)
            .get('/api/categories')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual(userCategories);
        expect(prisma.category.findMany).toHaveBeenCalledWith({
            where: { userId: MOCK_USER_ID },
            orderBy: { name: 'asc' },
        });
    });

    it('PUT /api/categories/:id deve atualizar uma categoria existente do usuário', async () => {
        const updateData = { name: 'Supermercado' };
        const originalCategory = { id: MOCK_CATEGORY_ID, userId: MOCK_USER_ID, name: 'Alimentacao' };
        const updatedCategory = { id: MOCK_CATEGORY_ID, userId: MOCK_USER_ID, name: 'Supermercado' };

        prisma.category.findUnique.mockResolvedValue(originalCategory);
        prisma.category.update.mockResolvedValue(updatedCategory);

        const response = await request(app)
            .put(`/api/categories/${MOCK_CATEGORY_ID}`)
            .send(updateData)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.name).toBe('Supermercado');
        expect(prisma.category.update).toHaveBeenCalledWith({
            where: { id: MOCK_CATEGORY_ID },
            data: { name: 'Supermercado' },
        });
    });

    it('PUT /api/categories/:id deve retornar 403 se o usuário não for o proprietário', async () => {
        const nonOwnedCategory = { id: MOCK_CATEGORY_ID, userId: 2, name: 'Conta' }; 

        prisma.category.findUnique.mockResolvedValue(nonOwnedCategory);

        const response = await request(app)
            .put(`/api/categories/${MOCK_CATEGORY_ID}`)
            .send({ name: 'Novo Nome' })
            .expect('Content-Type', /json/)
            .expect(403);

        expect(response.body.error).toContain('Não autorizado');
    });

    it('DELETE /api/categories/:id deve deletar uma categoria e retornar 204', async () => {
        const categoryToDelete = { id: MOCK_CATEGORY_ID, userId: MOCK_USER_ID, name: 'A Deletar' };

        prisma.category.findUnique.mockResolvedValue(categoryToDelete);
        prisma.category.delete.mockResolvedValue(categoryToDelete);

        await request(app)
            .delete(`/api/categories/${MOCK_CATEGORY_ID}`)
            .expect(204);

        expect(prisma.category.delete).toHaveBeenCalledWith({
            where: { id: MOCK_CATEGORY_ID },
        });
    });
});