const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET; 
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido ou formato inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        if (!JWT_SECRET) {
             throw new Error("JWT_SECRET não definido.");
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);

        req.userId = decoded.userId;

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
             return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }
        
        console.error('Erro de Middleware de Autenticação:', error.message);
        return res.status(500).json({ error: 'Erro interno na validação do token.' });
    }
};
module.exports = authMiddleware;