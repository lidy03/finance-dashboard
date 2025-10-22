const prisma = require('../config/prisma');

const checkOwnership = async (expenseId, userId) => {
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
    });

    if (!expense) {
        throw new Error('Despesa não encontrada.');
    }
    
    if (expense.userId !== parseInt(userId)) { 
        throw new Error('Não autorizado. Você não é o proprietário desta despesa.');
    }
    return expense;
};

const createExpense = async (req, res) => {
    const userId = parseInt(req.userId);
    const { 
        categoryId, 
        description, 
        value, 
        date, 
        contactId, 
        isSettled 
    } = req.body;

    try {
        if (!categoryId || !description || value === undefined || !date) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }

        const newExpense = await prisma.expense.create({
            data: {
                userId,
                categoryId: parseInt(categoryId),
                description,
                value: parseFloat(value),
                date: new Date(date),
                contactId: contactId ? parseInt(contactId) : null,
                isSettled: isSettled || false,
            },
        });

        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Erro ao criar despesa:', error.message);
        res.status(500).json({ error: 'Erro interno ao processar a despesa.' });
    }
};

const listExpenses = async (req, res) => {
    const userId = parseInt(req.userId);

    try {
        const expenses = await prisma.expense.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: {
                category: true, 
                contact: true,  
            }
        });

        res.status(200).json(expenses);
    } catch (error) {
        console.error('Erro ao listar despesas:', error.message);
        res.status(500).json({ error: 'Erro interno ao buscar despesas.' });
    }
};

const getExpenseById = async (req, res) => {
    const userId = req.userId;
    const expenseId = parseInt(req.params.id);

    try {
        const expense = await checkOwnership(expenseId, userId);
        res.status(200).json(expense);
    } catch (error) {
        if (error.message.includes('não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Não autorizado')) {
            return res.status(403).json({ error: error.message }); 
        }

        console.error('Erro ao buscar despesa:', error.message);
        res.status(500).json({ error: 'Erro interno ao buscar despesa.' });
    }
};


const updateExpense = async (req, res) => {
    const userId = req.userId;
    const expenseId = parseInt(req.params.id);
    const updates = req.body;

    if (updates.categoryId) updates.categoryId = parseInt(updates.categoryId);
    if (updates.contactId) updates.contactId = updates.contactId ? parseInt(updates.contactId) : null; // Permite remover o contato
    if (updates.value) updates.value = parseFloat(updates.value);
    if (updates.date) updates.date = new Date(updates.date);

    try {
        await checkOwnership(expenseId, userId);
        
        const updatedExpense = await prisma.expense.update({
            where: { id: expenseId },
            data: updates,
        });

        res.status(200).json(updatedExpense);
    } catch (error) {
        if (error.message.includes('não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Não autorizado')) {
            return res.status(403).json({ error: error.message }); 
        }

        console.error('Erro ao atualizar despesa:', error.message);
        res.status(500).json({ error: 'Erro interno ao atualizar despesa.' });
    }
};

const deleteExpense = async (req, res) => {
    const userId = req.userId;
    const expenseId = parseInt(req.params.id);

    try {
        await checkOwnership(expenseId, userId);
        
        await prisma.expense.delete({
            where: { id: expenseId },
        });

        res.status(204).send(); 
    } catch (error) {
        if (error.message.includes('não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Não autorizado')) {
            return res.status(403).json({ error: error.message });
        }

        console.error('Erro ao deletar despesa:', error.message);
        res.status(500).json({ error: 'Erro interno ao deletar despesa.' });
    }
};


module.exports = {
    createExpense,
    listExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
};