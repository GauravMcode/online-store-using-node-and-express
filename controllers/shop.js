
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');



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
    .catch(err => console.log(err));
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
    .catch(err => console.log(err))
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
        isAuthenticated: req.session.isLoggedIn
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
    .catch(err => console.log(err))

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
          name: req.session.user.name,
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
    .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.session.user._id })
    .then((orders) => {
      console.log(orders[0].products);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
    isAuthenticated: req.session.isLoggedIn
  });
};
