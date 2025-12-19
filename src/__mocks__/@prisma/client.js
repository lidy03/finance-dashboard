const mockPrismaInstance= {
    user: {
        // Mock da função findUnique
        findUnique: jest.fn(),
        // Mock da função create
        create: jest.fn(),
    },
    // Mock de outros modelos
    expense: {
        // ...
    },
    // Mock de comandos de ciclo de vida do Prisma
    $disconnect: jest.fn(),
};
const PrismaClient = jest.fn(() => mockPrismaInstance);

module.exports = { PrismaClient };