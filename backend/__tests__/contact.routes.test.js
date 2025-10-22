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
    contact: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

const MOCK_USER_ID = 1;
const MOCK_CONTACT_ID = 50;

describe('Contact API Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /api/contacts deve criar um novo contato', async () => {
        const newContact = { name: 'João Dívida' };
        const createdContact = { id: MOCK_CONTACT_ID, userId: MOCK_USER_ID, name: 'João Dívida' };

        prisma.contact.create.mockResolvedValue(createdContact);

        const response = await request(app)
            .post('/api/contacts')
            .send(newContact)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body).toEqual(createdContact);
    });

    it('GET /api/contacts deve listar contatos do usuário autenticado', async () => {
        const userContacts = [
            { id: 51, userId: MOCK_USER_ID, name: 'Maria' },
            { id: 52, userId: MOCK_USER_ID, name: 'Pedro' },
        ];

        prisma.contact.findMany.mockResolvedValue(userContacts);

        const response = await request(app)
            .get('/api/contacts')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual(userContacts);
        expect(prisma.contact.findMany).toHaveBeenCalledWith({
            where: { userId: MOCK_USER_ID },
            orderBy: { name: 'asc' },
        });
    });

    it('PUT /api/contacts/:id deve atualizar um contato do usuário', async () => {
        const updateData = { name: 'João (Atualizado)' };
        const originalContact = { id: MOCK_CONTACT_ID, userId: MOCK_USER_ID, name: 'João Dívida' };
        const updatedContact = { id: MOCK_CONTACT_ID, userId: MOCK_USER_ID, name: 'João (Atualizado)' };

        prisma.contact.findUnique.mockResolvedValue(originalContact);
        prisma.contact.update.mockResolvedValue(updatedContact);

        const response = await request(app)
            .put(`/api/contacts/${MOCK_CONTACT_ID}`)
            .send(updateData)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.name).toBe('João (Atualizado)');
    });

    it('DELETE /api/contacts/:id deve deletar um contato e retornar 204', async () => {
        const contactToDelete = { id: MOCK_CONTACT_ID, userId: MOCK_USER_ID, name: 'A Deletar' };

        prisma.contact.findUnique.mockResolvedValue(contactToDelete);
        prisma.contact.delete.mockResolvedValue(contactToDelete);

        await request(app)
            .delete(`/api/contacts/${MOCK_CONTACT_ID}`)
            .expect(204);
            
        expect(prisma.contact.delete).toHaveBeenCalledTimes(1);
    });

    it('DELETE /api/contacts/:id deve retornar 409 se o contato estiver em uso por uma despesa', async () => {
        const contactInUse = { id: MOCK_CONTACT_ID, userId: MOCK_USER_ID, name: 'Em Uso' };

        prisma.contact.findUnique.mockResolvedValue(contactInUse);

        prisma.contact.delete.mockRejectedValue({ code: 'P2003', message: 'Foreign key constraint failed' });

        const response = await request(app)
            .delete(`/api/contacts/${MOCK_CONTACT_ID}`)
            .expect('Content-Type', /json/)
            .expect(409);

        expect(response.body.error).toContain('Conflito: Não é possível deletar este contato.');
    });
});