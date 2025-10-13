const request = require('supertest');
const prisma = require('../src/config/prisma');
const app = require('../server'); 
const { describe } = require('node:test');

describe('POST /api/auth/register', () => {

    // Cenário 1: Tenta registrar um usuário que já existe
    it('deve retornar 409 se o email já estiver em uso', async () => {
        prisma.user.findUnique.mockResolvedValueOnce({ 
            id: 1, 
            email: 'existente@teste.com' 
        });

        // 2. Execução: Simula uma requisição POST
        const response = await request(app)
            .post('/api/auth/register') 
            .send({
                email: 'existente@teste.com',
                password: 'senhaforte123',
                name: 'Teste Existente'
            });

        // 3. Verificação (Assertions):
        expect(response.statusCode).toBe(409);
        expect(response.body.error).toBe('Usuário já existe');
        expect(prisma.user.create).not.toHaveBeenCalled(); 
    });

    // Cenário 3: Tenta registrar sem senha
    it('deve retornar 400 se a senha estiver faltando', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'falta@senha.com',
                name: 'Sem Senha'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('É necessário inserir email e senha');
    });

});

describe('POST /api/auth/login', () => {

})