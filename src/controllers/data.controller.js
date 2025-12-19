const prisma = require('../config/prisma');

const getDashboardData = async (req, res) => {
    try {
        const totalContacts = await prisma.contact.count();
        const totalCategories = await prisma.category.count();
        const totalProducts = await prisma.product.count();

        res.status(200).json({
            totalContacts,
            totalCategories,
            totalProducts,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        res.status(500).json({ error: 'Erro ao buscar dados do dashboard.' });
    }
};

module.exports = {
    getDashboardData,
};
