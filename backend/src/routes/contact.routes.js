const express = require('express');
const { 
    createContact, 
    listContacts, 
    updateContact, 
    deleteContact 
} = require('../controllers/contact.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/contacts')
    .post(authMiddleware, createContact) // Cria novo contato
    .get(authMiddleware, listContacts);  // Lista contatos do usuário

router.route('/contacts/:id')
    .put(authMiddleware, updateContact)    // Atualiza contato específico
    .delete(authMiddleware, deleteContact); // Deleta contato específico

module.exports = router;