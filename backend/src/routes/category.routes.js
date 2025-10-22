const express = require('express');
const { 
    createCategory, 
    listCategories, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/category.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/categories')
    .post(authMiddleware, createCategory) 
    .get(authMiddleware, listCategories);  

router.route('/categories/:id')
    .put(authMiddleware, updateCategory)   
    .delete(authMiddleware, deleteCategory); 

module.exports = router;