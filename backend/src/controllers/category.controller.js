const prisma = require ('../config/prisma');

const checkCategoryOwnership = async (categoryId, userId) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
    });

    if (!category) {
        throw new Error('Categoria não encontrada.');
    }
    
    if (category.userId !== parseInt(userId)) {
        throw new Error('Não autorizado. Você não é o proprietário desta categoria.');
    }
    return category;
};


const createCategory = async (req, res) => {
    const userId = parseInt(req.userId);
    const { name } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
        }
        
        const existingCategory = await prisma.category.findUnique({
            where: {
                userId_name: {
                    userId,
                    name,
                },
            },
        });

        if (existingCategory) {
            return res.status(409).json({ error: 'Você já tem uma categoria com este nome.' });
        }

        const newCategory = await prisma.category.create({
            data: {
                userId,
                name,
            },
        });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Erro ao criar categoria:', error.message);
        res.status(500).json({ error: 'Erro interno ao processar a categoria.' });
    }
};


const listCategories = async (req, res) => {
    const userId = parseInt(req.userId);

    try {
        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });

        res.status(200).json(categories);
    } catch (error) {
        console.error('Erro ao listar categorias:', error.message);
        res.status(500).json({ error: 'Erro interno ao buscar categorias.' });
    }
};


const updateCategory = async (req, res) => {
    const userId = req.userId;
    const categoryId = parseInt(req.params.id);
    const { name } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
        }

        await checkCategoryOwnership(categoryId, userId);
        
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { name },
        });

        res.status(200).json(updatedCategory);
    } catch (error) {
        if (error.message.includes('não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Não autorizado')) {
            return res.status(403).json({ error: error.message }); 
        }

        console.error('Erro ao atualizar categoria:', error.message);
        res.status(500).json({ error: 'Erro interno ao atualizar categoria.' });
    }
};


const deleteCategory = async (req, res) => {
    const userId = req.userId;
    const categoryId = parseInt(req.params.id);

    try {
        await checkCategoryOwnership(categoryId, userId);

        await prisma.category.delete({
            where: { id: categoryId },
        });

        res.status(204).send(); 
    } catch (error) {
        if (error.message.includes('não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Não autorizado')) {
            return res.status(403).json({ error: error.message });
        }

        console.error('Erro ao deletar categoria:', error.message);
        res.status(500).json({ error: 'Erro interno ao deletar categoria. Verifique se há despesas usando esta categoria.' });
    }
};


module.exports = {
    createCategory,
    listCategories,
    updateCategory,
    deleteCategory,
};