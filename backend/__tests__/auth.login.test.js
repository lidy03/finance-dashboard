const request = require('supertest');
const prisma = require('../src/config/prisma'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const app = require('../server'); 

// 1. MOCKS GLOBAIS
jest.mock('bcryptjs');
jest.mock('jsonwebtoken'); 

jest.mock('../src/config/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));


// Dados de teste
const MOCK_USER = {
    id: 1,
    email: 'teste@exemplo.com',
    password: 'hashedPasswordFromDB', 
    name: 'Usuário Teste'
};

const MOCKED_TOKEN = 'mocked_jwt_token_12345';

describe('POST /api/auth/login', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        prisma.user.findUnique.mockClear(); 
        bcrypt.compare.mockClear(); 
        jwt.sign.mockClear(); 
        
        jwt.sign.mockReturnValue(MOCKED_TOKEN);
    });

    // CENÁRIO 1: Login Bem-sucedido
    it('deve retornar 200 e um token JWT no login bem-sucedido', async () => {
        
        // 1. Configuração dos Mocks
        prisma.user.findUnique.mockResolvedValueOnce(MOCK_USER);
        
        // Senha correta (retorna true)
        bcrypt.compare.mockImplementationOnce(() => Promise.resolve(true)); 

        // 2. Execução
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: MOCK_USER.email,
                password: 'senha_correta_123' 
            });

        // 3. Verificação
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token', MOCKED_TOKEN); 
        expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
        expect(jwt.sign).toHaveBeenCalledTimes(1);
    });


    // CENÁRIO 2: Login com Usuário Inexistente
    it('deve retornar 401 se o usuário não for encontrado', async () => {
        
        // Usuário não foi encontrado no DB (retorna null)
        prisma.user.findUnique.mockResolvedValueOnce(null);
        
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'naoexiste@exemplo.com',
                password: 'qualquer_senha'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Credenciais inválidas');
        // Nenhum dos mocks deve ser chamado após a falha do Prisma
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    // CENÁRIO 3: Login com Senha Incorreta
    it('deve retornar 401 se a senha estiver incorreta', async () => {
        
        // Usuário encontrado no DB
        prisma.user.findUnique.mockResolvedValueOnce(MOCK_USER);

        // Senha incorreta (retorna false)
        bcrypt.compare.mockResolvedValueOnce(false); 
        
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: MOCK_USER.email,
                password: 'senha_incorreta_123'
            });

        // 3. Verificação
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Credenciais inválidas');
        // bcrypt.compare deve ser chamado
        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    // CENÁRIO 4: Login com Campos Faltando
    it('deve retornar 400 se o email ou senha estiverem faltando', async () => {
        
        const response = await request(app)
            .post('/api/auth/login')
            .send({ password: 'alguma_senha' }); 

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });
});
