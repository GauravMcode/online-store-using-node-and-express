
const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productID;
  Product.findById(prodId)
    .then((product) => {  //double square brac because prod is array inside array
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddtoCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.addTOCart(prodId)
    .then(result => {
      res.redirect('/cart')
      // console.log(result);
    })
    .catch(err => console.log(err))
}

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then((products) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => { console.log(err); });

};

exports.deleteCartItem = (req, res, next) => {
  // let product;
  const id = req.body.id;
  req.user.deleteById(id)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err))

}

exports.postCreateOrder = (req, res, next) => {
  console.log('creating order.........');
  req.user.addOrder()
    .then((result) => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
