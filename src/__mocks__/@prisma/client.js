const mockPrismaInstance= {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    expense: {
    },
    $disconnect: jest.fn(),
};
const PrismaClient = jest.fn(() => mockPrismaInstance);

module.exports = { PrismaClient };