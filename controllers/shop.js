
const Product = require('../models/product');
const Cart = require('../models/cart');
const Sequelize = require('sequelize');

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  // Product.findAll({ where: { id: prodId } })
  //   .then((products) => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findByPk(prodId)
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
  Product.findAll()
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
  let newQuantity = 1; //i.e. the quantity added to cart, when add-to-cart is clicked
  let readCart;
  req.user.getCart()
    .then((cart) => {
      readCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        const oldQuantity = products[0].cartItem.quantity;
        newQuantity = oldQuantity + 1;
      }
      //to add product to cart
      Product.findByPk(prodId)
        .then((prod) => {
          product = prod;
          return readCart.addProduct(product, { through: { quantity: newQuantity } });
        })
        .catch(err => { console.log(err) })
    })
    .then(() => {
      res.redirect('/cart')
    })
    .catch(err => { console.log(err) })
}

exports.getCart = (req, res, next) => {
  req.user.getCart().then((cart) => {
    cart.getProducts()
      .then((products) => {
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
          cart: cart,
        });
      }).catch(err => { console.log(err); });
  });
};

exports.deleteCartItem = (req, res, next) => {
  let product;
  const id = req.body.id;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: id } })
    })
    .then(products => {
      console.log(products[0]);
      return products[0].cartItem.destroy();
    }
    )
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err))

}

exports.postCreateOrder = (req, res, next) => {
  console.log('creating order.........');
  let fetchedCart;
  let products;
  req.user.getCart()
    .then(cart => {
      console.log('got products.....');
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(prods => {
      products = prods;
      console.log('çreating order....');
      return req.user.createOrder()
        .then(order => {
          products.map(p => p.addOrder(order, { through: { quantity: p.cartItem.quantity } }))
          // order.addProducts(products.map(product => {
          //   product.orderItem = { quantity: product.cartItem.quantity }; //this adds a product to the order and also sets its quantity property in the JOIN table.
          //   return product;
          // }))
        })
        .catch(err => console.log(err))
    })
    .then((result) => {
      fetchedCart.setProducts(null);
      res.redirect('/orders');
    })
    .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({ include: ['products'] }) //to include products also in the orders object as we already created association between them
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
