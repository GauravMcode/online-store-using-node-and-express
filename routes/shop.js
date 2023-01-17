const express = require('express');

const shopController = require('../controllers/shop');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.use(authController.isAuth);

router.get('/products/:productID', shopController.getProductDetails)

router.post('/add-to-cart', shopController.postAddtoCart)

router.get('/cart', shopController.getCart);

router.post('/delete-cart-item', shopController.deleteCartItem);

router.post('/create-order', shopController.postCreateOrder);

router.get('/orders', shopController.getOrders);

module.exports = router;
