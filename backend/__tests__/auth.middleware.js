const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middleware/authmiddleware');

// 1. MOCKS
jest.mock('jsonwebtoken');
const TEST_SECRET = 'super-secret-key-para-testes';

// Mock de um token válido e um userId decodificado
const MOCKED_USER_ID = 99;
const VALID_TOKEN = 'token.valido.mockado';
const EXPIRED_TOKEN = 'token.expirado.mockado';

// Mockar o process.env.JWT_SECRET para que o middleware possa acessá-lo
beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
});

// Restaurar o valor original após todos os testes
afterAll(() => {
    delete process.env.JWT_SECRET;
});

describe('authMiddleware', () => {
    
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            headers: {}
        };
        res = {
            status: jest.fn(() => res), 
            json: jest.fn(() => res)
        };
        next = jest.fn();
    });


    // CENÁRIO 1: Sucesso - Token Válido
    it('deve chamar next() e anexar userId ao req com um token válido', () => {
        // 1. Setup
        req.headers.authorization = `Bearer ${VALID_TOKEN}`;
        
        // Mock: jwt.verify deve retornar o objeto decodificado (payload)
        jwt.verify.mockReturnValue({ userId: MOCKED_USER_ID, iat: 12345, exp: 98765 });

        // 2. Execução
        authMiddleware(req, res, next);

        // 3. Verificação
        expect(jwt.verify).toHaveBeenCalledWith(VALID_TOKEN, TEST_SECRET);
        expect(req.userId).toBe(MOCKED_USER_ID); // Verifica se o userId foi injetado
        expect(next).toHaveBeenCalledTimes(1); // Verifica se a execução continuou
        expect(res.status).not.toHaveBeenCalled(); // Verifica se não houve erro
    });

    // CENÁRIO 2: Falha - Token Ausente

    it('deve retornar 401 se o cabeçalho Authorization estiver faltando', () => {
        // 1. Setup: req.headers.authorization está vazio

        // 2. Execução
        authMiddleware(req, res, next);

        // 3. Verificação
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Acesso negado. Token não fornecido ou formato inválido.'
        });
        expect(next).not.toHaveBeenCalled();
        expect(jwt.verify).not.toHaveBeenCalled();
    });
    
    // CENÁRIO 3: Falha - Formato Inválido
    it('deve retornar 401 se o formato for inválido (faltando "Bearer")', () => {
        // 1. Setup: Apenas o token sem o Bearer
        req.headers.authorization = VALID_TOKEN; 

        // 2. Execução
        authMiddleware(req, res, next);

        // 3. Verificação
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Acesso negado. Token não fornecido ou formato inválido.'
        });
        expect(next).not.toHaveBeenCalled();
        expect(jwt.verify).not.toHaveBeenCalled();
    });

    // CENÁRIO 4: Falha - Token Inválido (Assinatura)
    it('deve retornar 401 se o token tiver uma assinatura inválida', () => {
        // 1. Setup
        req.headers.authorization = `Bearer ${VALID_TOKEN}`;
        
        // Mock: Simula erro de validação (assinatura inválida)
        jwt.verify.mockImplementation(() => {
            const error = new Error('invalid signature');
            error.name = 'JsonWebTokenError';
            throw error;
        });

        // 2. Execução
        authMiddleware(req, res, next);

        // 3. Verificação
        expect(jwt.verify).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token inválido ou expirado.'
        });
        expect(next).not.toHaveBeenCalled();
    });

    // CENÁRIO 5: Falha - Token Expirado
    it('deve retornar 401 se o token estiver expirado', () => {
        // 1. Setup
        req.headers.authorization = `Bearer ${EXPIRED_TOKEN}`;
        
        // Mock: Simula erro de token expirado
        jwt.verify.mockImplementation(() => {
            const error = new Error('jwt expired');
            error.name = 'TokenExpiredError';
            throw error;
        });

        // 2. Execução
        authMiddleware(req, res, next);

        // 3. Verificação
        expect(jwt.verify).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token inválido ou expirado.'
        });
        expect(next).not.toHaveBeenCalled();
    });
});
