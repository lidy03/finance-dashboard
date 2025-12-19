const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); 
const { 
    createExpense, 
    listExpenses, 
    getExpenseById, 
    updateExpense, 
    deleteExpense 
} = require('../controllers/expense.controller'); 

const router = express.Router();

router.route('/expenses')
    .post(authMiddleware, createExpense)
    .get(authMiddleware, listExpenses);

router.route('/expenses/:id')
    .get(authMiddleware, getExpenseById)
    .put(authMiddleware, updateExpense)
    .delete(authMiddleware, deleteExpense);

module.exports = router;