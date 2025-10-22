const prisma = require('../config/prisma');

const checkContactOwnership = async (contactId, userId) => {
    const contact = await prisma.contact.findUnique({
        where: { id: contactId },
    });

    if (!contact) {
        throw new Error('Contato não encontrado.');
    }
    
    if (contact.userId !== parseInt(userId)) {
        throw new Error('Não autorizado. Você não é o proprietário deste contato.');
    }
    return contact;
};


const createContact = async (req, res) => {
    const userId = parseInt(req.userId);
    const { name } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ error: 'O nome do contato é obrigatório.' });
        }
        
        const newContact = await prisma.contact.create({
            data: {
                userId,
                name,
            },
        });

        res.status(201).json(newContact);
    } catch (error) {
        console.error('Erro ao criar contato:', error.message);
        res.status(500).json({ error: 'Erro interno ao processar o contato.' });
    }
};


const listContacts = async (req, res) => {
    const userId = parseInt(req.userId);

    try {
        const contacts = await prisma.contact.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Erro ao listar contatos:', error.message);
        res.status(500).json({ error: 'Erro interno ao buscar contatos.' });
    }
};


const updateContact = async (req, res) => {
    const userId = req.userId;
    const contactId = parseInt(req.params.id);
    const { name } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ error: 'O nome do contato é obrigatório.' });
        }

        await checkContactOwnership(contactId, userId);
        
        const updatedContact = await prisma.contact.update({
            where: { id: contactId },
            data: { name },
        });

        res.status(200).json(updatedContact);
    } catch (error) {
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Não autorizado')) {
            return res.status(403).json({ error: error.message }); 
        }

        console.error('Erro ao atualizar contato:', error.message);
        res.status(500).json({ error: 'Erro interno ao atualizar contato.' });
    }
};


const deleteContact = async (req, res) => {
    const userId = req.userId;
    const contactId = parseInt(req.params.id);

    try {
        await checkContactOwnership(contactId, userId);

        await prisma.contact.delete({
            where: { id: contactId },
        });

        res.status(204).send(); 
    } catch (error) {
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Não autorizado')) {
            return res.status(403).json({ error: error.message });
        }
        if (error.code === 'P2003') { 
            return res.status(409).json({ error: 'Conflito: Não é possível deletar este contato. Ele ainda está associado a uma ou mais despesas.' });
        }

        console.error('Erro ao deletar contato:', error.message);
        res.status(500).json({ error: 'Erro interno ao deletar contato.' });
    }
};


module.exports = {
    createContact,
    listContacts,
    updateContact,
    deleteContact,
};