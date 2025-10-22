const { authMiddleware } = require('../src/middleware/authMiddleware'); 
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

process.env.JWT_SECRET = 'TEST_SECRET'; 

jest.mock('jsonwebtoken', () => ({
     verify: jest.fn(),
}));

describe('Auth Middleware', () => {
    let req, res, next;
     const unifiedAuthError = 'Token de autenticação é obrigatório';
     const expiredTokenError = 'Token inválido ou expirado';

     beforeEach(() => {
         req = httpMocks.createRequest({
             method: 'GET',
             url: '/api/auth/me',
             headers: {},
         });
         res = httpMocks.createResponse();
         next = jest.fn();

        jest.clearAllMocks();
     });
     
     test('deve retornar 401 se nenhum token for fornecido', () => {
         authMiddleware(req, res, next);
         expect(res.statusCode).toBe(401);
         expect(res._getJSONData()).toEqual({ error: unifiedAuthError }); 
         expect(next).not.toHaveBeenCalled();
         expect(jwt.verify).not.toHaveBeenCalled();
     });

     test('deve retornar 401 se o formato do header for inválido', () => {
         req.headers.authorization = 'BearerInvalidToken'; 
         authMiddleware(req, res, next);
         expect(res.statusCode).toBe(401);
         expect(res._getJSONData()).toEqual({ error: unifiedAuthError });
         expect(next).not.toHaveBeenCalled();
         expect(jwt.verify).not.toHaveBeenCalled();
     });

     test('deve retornar 401 se o token for inválido ou expirado', () => {
         req.headers.authorization = 'Bearer invalid.token.value';
         jwt.verify.mockImplementation(() => {
             const err = new Error('Token inválido');
             err.name = 'JsonWebTokenError';
             throw err;
        });

        authMiddleware(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ error: expiredTokenError });
        expect(next).not.toHaveBeenCalled();
        expect(jwt.verify).toHaveBeenCalledTimes(1);
     });

     test('deve retornar 401 se o payload for válido mas não tiver o ID do usuário', () => {
        req.headers.authorization = 'Bearer valid.token.without.id';
         jwt.verify.mockReturnValue({ otherKey: 'someValue' });

         authMiddleware(req, res, next);
         expect(res.statusCode).toBe(401);
         expect(res._getJSONData()).toEqual({ error: 'Token inválido: ID do usuário ausente no payload.' });
         expect(next).not.toHaveBeenCalled();
         expect(jwt.verify).toHaveBeenCalledTimes(1);
     });

     test('deve chamar next() e definir req.userId se o token for válido', () => {
        const mockUserId = 'user-123';
         req.headers.authorization = 'Bearer valid.token.with.id';
         jwt.verify.mockReturnValue({ id: mockUserId });
         
        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledTimes(1);
        expect(req.userId).toBe(mockUserId);
        expect(next).toHaveBeenCalledTimes(1);
         expect(res.statusCode).not.toBe(401);
     });
});
