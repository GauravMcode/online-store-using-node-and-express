const express = require('express');

const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const authController = require('../controllers/auth');

const router = express.Router();

router.use(authController.isAuth);

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',
    body('title', 'The title should contain atleast 5 characters with only alphabets and numbers').isAlphanumeric().isLength({ min: 3 }).trim(),
    body('imageUrl', 'Enter a correct image url').isURL(),
    body('price', 'price has to be a decimal value').isFloat(),
    body('description', 'The description should contain atleast 5 characters and max 100 characters').isLength({ min: 3, max: 100 }).trim(),
    adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product',
    body('title', 'The title should contain atleast 5 characters with only alphabets and numbers').isAlphanumeric().isLength({ min: 3 }).trim(),
    body('imageUrl', 'Enter a correct image url').isURL(),
    body('price', 'price has to be a decimal value').isFloat(),
    body('description', 'The description should contain atleast 5 characters and max 100 characters').isLength({ min: 3, max: 100 }).trim(),
    adminController.postEditProduct);

router.post('/delete-product', adminController.deleteProduct);

module.exports = router;
