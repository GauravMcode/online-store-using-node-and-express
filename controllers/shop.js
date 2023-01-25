const fs = require('fs');
const path = require('path');

const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

error500 = (err, next) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
}


exports.getProducts = (req, res, next) => {
  Product.find()   //method provided by the mongoose to fetch all the products from the database
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productID;
  Product.findById(prodId) //findById is the mongoose method,Also  we can even pass a string to find by id and mongoose will automatically convert this to an object ID,
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      error500(err, next);
    });
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddtoCart = (req, res, next) => {
  const prodId = req.body.productId;

  req.session.user = new User().init(req.session.user); //makes the data object to user model object
  req.session.user.addToCart(prodId)
    .then(result => {
      res.redirect('/cart')
      // console.log(result);
    })
    .catch(err => {
      error500(err, next);
    })
}

exports.getCart = (req, res, next) => {
  req.session.user = new User().init(req.session.user);
  req.session.user
    .populate('cart.items.productId')  //to populate productId with Product Objects
    // .execPopulate()  //as populate doesn't returns a promise, to use then on it, we use execPopulate() here
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => { console.log(err); });

};

exports.deleteCartItem = (req, res, next) => {
  const id = req.body.id;
  req.session.user = new User().init(req.session.user);
  req.session.user.deleteCartItem(id)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      error500(err, next);
    })

}

exports.postCreateOrder = (req, res, next) => {
  console.log('creating order.........');
  req.session.user = new User().init(req.session.user);
  req.session.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } } //with ._doc we get access to just the data that's in there and not the meta-data
      });
      const order = new Order({
        products: products,
        user: {
          // name: req.session.user.name,
          userId: req.session.user._id
        }
      })
      order.save();
    })
    .then(result => {
      req.session.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      error500(err, next);
    })
}

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.session.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);
  fs.readFile(invoicePath, (err, data) => {
    if (err) {
      return next(err);
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
    res.send(data);
    res.end();
  })
}
