const prisma = {
    user: {
        // Mock da função findUnique
        findUnique: jest.fn(),
        // Mock da função create
        create: jest.fn(),
        // Mock de outras funções do User se precisar (ex: delete, findMany)
    },
    // Mock de outros modelos
    expense: {
        // ...
    },
    // Mock de comandos de ciclo de vida do Prisma
    $disconnect: jest.fn(),
};

module.exports = prisma;